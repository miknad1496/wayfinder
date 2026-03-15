/**
 * Wayfinder Chat Application
 *
 * Handles:
 * - Chat messaging with the backend API
 * - Session management (persists across page reloads)
 * - User authentication (login/signup)
 * - Feedback collection (thumbs up/down)
 * - Data consent tracking
 * - Auto-growing textarea
 * - Simple markdown rendering
 */

const API_BASE = '/api';

// State
let sessionId = localStorage.getItem('wayfinder_session') || null;
let authToken = localStorage.getItem('wayfinder_token') || null;
let currentUser = null;
let messageCount = 0;
let isLoading = false;

// DOM elements
const messagesEl = document.getElementById('messages');
const inputEl = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const charCountEl = document.getElementById('charCount');

// Auth DOM elements
const authModal = document.getElementById('authModal');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const authLoggedOut = document.getElementById('authLoggedOut');
const authLoggedIn = document.getElementById('authLoggedIn');
const userNameEl = document.getElementById('userName');
const consentBanner = document.getElementById('consentBanner');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  setupAuthListeners();
  checkAuth();
  checkConsent();
  inputEl.focus();
});

// ========================
// Chat Functions
// ========================

function setupEventListeners() {
  // Send button
  sendBtn.addEventListener('click', sendMessage);

  // Enter to send (Shift+Enter for newline)
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Auto-grow textarea
  inputEl.addEventListener('input', () => {
    inputEl.style.height = 'auto';
    inputEl.style.height = Math.min(inputEl.scrollHeight, 120) + 'px';

    // Character count
    const len = inputEl.value.length;
    charCountEl.textContent = len > 100 ? `${len}/5000` : '';
  });

  // Quick action buttons (event delegation)
  messagesEl.addEventListener('click', (e) => {
    if (e.target.classList.contains('quick-btn')) {
      const message = e.target.dataset.message;
      if (message) {
        inputEl.value = message;
        sendMessage();
      }
    }

    // Feedback buttons
    if (e.target.classList.contains('feedback-btn')) {
      handleFeedback(e.target);
    }
  });
}

async function sendMessage() {
  const message = inputEl.value.trim();
  if (!message || isLoading) return;

  // Clear input
  inputEl.value = '';
  inputEl.style.height = 'auto';
  charCountEl.textContent = '';

  // Add user message to chat
  appendMessage('user', message);

  // Show typing indicator
  const typingEl = showTyping();

  // Disable input
  isLoading = true;
  sendBtn.disabled = true;

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ message, sessionId })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Server error (${response.status})`);
    }

    const data = await response.json();

    // Save session
    sessionId = data.sessionId;
    localStorage.setItem('wayfinder_session', sessionId);
    messageCount = data.messageCount;

    // Remove typing indicator
    typingEl.remove();

    // Add assistant response
    appendMessage('assistant', data.response, data.sources);

  } catch (err) {
    typingEl.remove();
    appendError(err.message);
  } finally {
    isLoading = false;
    sendBtn.disabled = false;
    inputEl.focus();
  }
}

function appendMessage(role, text, sources = []) {
  const messageEl = document.createElement('div');
  messageEl.className = `message ${role}`;

  const avatarEl = document.createElement('div');
  avatarEl.className = 'message-avatar';
  avatarEl.textContent = role === 'user' ? '👤' : '🧭';

  const contentEl = document.createElement('div');
  contentEl.className = 'message-content';

  const textEl = document.createElement('div');
  textEl.className = 'message-text';
  textEl.innerHTML = role === 'assistant' ? renderMarkdown(text) : escapeHtml(text);

  contentEl.appendChild(textEl);

  // Add sources if available
  if (sources && sources.length > 0) {
    const sourcesEl = document.createElement('div');
    sourcesEl.className = 'sources';
    sourcesEl.innerHTML = 'Sources: ' + sources
      .map(s => `<span>${escapeHtml(s.source.replace('.json', '').replace('.md', ''))}</span>`)
      .join('');
    contentEl.appendChild(sourcesEl);
  }

  // Add feedback buttons for assistant messages
  if (role === 'assistant') {
    const feedbackEl = document.createElement('div');
    feedbackEl.className = 'feedback-row';
    feedbackEl.innerHTML = `
      <button class="feedback-btn" data-rating="1" data-index="${messageCount}">👍 Helpful</button>
      <button class="feedback-btn" data-rating="-1" data-index="${messageCount}">👎 Not helpful</button>
    `;
    contentEl.appendChild(feedbackEl);
  }

  messageEl.appendChild(avatarEl);
  messageEl.appendChild(contentEl);
  messagesEl.appendChild(messageEl);

  // Scroll to bottom
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function appendError(message) {
  const errorEl = document.createElement('div');
  errorEl.className = 'error-message';
  errorEl.textContent = `Something went wrong: ${message}. Please try again.`;
  messagesEl.appendChild(errorEl);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function showTyping() {
  const messageEl = document.createElement('div');
  messageEl.className = 'message assistant';
  messageEl.innerHTML = `
    <div class="message-avatar">🧭</div>
    <div class="message-content">
      <div class="message-text">
        <div class="typing-indicator">
          <span></span><span></span><span></span>
        </div>
      </div>
    </div>
  `;
  messagesEl.appendChild(messageEl);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return messageEl;
}

async function handleFeedback(btn) {
  const rating = parseInt(btn.dataset.rating);
  const index = parseInt(btn.dataset.index);

  // Visual feedback
  const row = btn.parentElement;
  row.querySelectorAll('.feedback-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');

  // If negative, ask for comment
  let comment = null;
  if (rating === -1) {
    comment = prompt('What could be improved? (optional)');
  }

  try {
    await fetch(`${API_BASE}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        messageIndex: index,
        rating,
        comment
      })
    });
  } catch (err) {
    console.warn('Failed to submit feedback:', err);
  }
}

// ========================
// Auth Functions
// ========================

function setupAuthListeners() {
  // Open modals
  document.getElementById('loginBtn').addEventListener('click', () => openAuthModal('login'));
  document.getElementById('signupBtn').addEventListener('click', () => openAuthModal('signup'));
  document.getElementById('modalClose').addEventListener('click', closeAuthModal);
  document.getElementById('showSignup').addEventListener('click', (e) => { e.preventDefault(); switchAuthForm('signup'); });
  document.getElementById('showLogin').addEventListener('click', (e) => { e.preventDefault(); switchAuthForm('login'); });

  // Close modal on overlay click
  authModal.addEventListener('click', (e) => {
    if (e.target === authModal) closeAuthModal();
  });

  // Submit forms
  document.getElementById('loginSubmit').addEventListener('click', submitLogin);
  document.getElementById('signupSubmit').addEventListener('click', submitSignup);

  // Enter key on forms
  document.getElementById('loginPassword').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submitLogin();
  });
  document.getElementById('signupPassword').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submitSignup();
  });

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', logout);

  // Consent banner
  document.getElementById('consentAccept').addEventListener('click', acceptConsent);
  document.getElementById('consentDismiss').addEventListener('click', dismissConsent);
  document.getElementById('consentLearnMore').addEventListener('click', (e) => {
    e.preventDefault();
    alert('Wayfinder stores your conversations locally on this server to improve the quality of career advice over time. Your data is never shared with third parties or used for advertising. You can request deletion of your data at any time by contacting us.');
  });
}

function openAuthModal(mode) {
  authModal.style.display = 'flex';
  switchAuthForm(mode);
}

function closeAuthModal() {
  authModal.style.display = 'none';
  clearAuthErrors();
}

function switchAuthForm(mode) {
  if (mode === 'login') {
    loginForm.style.display = 'block';
    signupForm.style.display = 'none';
    document.getElementById('loginEmail').focus();
  } else {
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
    document.getElementById('signupName').focus();
  }
  clearAuthErrors();
}

function clearAuthErrors() {
  document.getElementById('loginError').style.display = 'none';
  document.getElementById('signupError').style.display = 'none';
}

function showAuthError(formId, message) {
  const el = document.getElementById(formId);
  el.textContent = message;
  el.style.display = 'block';
}

async function submitLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) {
    showAuthError('loginError', 'Please fill in both fields');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (data.error) {
      showAuthError('loginError', data.error);
      return;
    }

    // Save token and update UI
    authToken = data.token;
    currentUser = data.user;
    localStorage.setItem('wayfinder_token', authToken);
    updateAuthUI();
    closeAuthModal();

    // Start a fresh session for logged-in user
    sessionId = null;
    localStorage.removeItem('wayfinder_session');

  } catch (err) {
    showAuthError('loginError', 'Connection error. Is the server running?');
  }
}

async function submitSignup() {
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const userType = document.getElementById('signupType').value;
  const consent = document.getElementById('signupConsent').checked;

  if (!name || !email || !password) {
    showAuthError('signupError', 'Please fill in all required fields');
    return;
  }

  if (password.length < 6) {
    showAuthError('signupError', 'Password must be at least 6 characters');
    return;
  }

  if (!email.includes('@')) {
    showAuthError('signupError', 'Please enter a valid email');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, userType, consentGiven: consent })
    });

    const data = await res.json();

    if (data.error) {
      showAuthError('signupError', data.error);
      return;
    }

    // Save token and update UI
    authToken = data.token;
    currentUser = data.user;
    localStorage.setItem('wayfinder_token', authToken);
    if (consent) localStorage.setItem('wayfinder_consent', 'true');
    updateAuthUI();
    closeAuthModal();

    // Start a fresh session for the new user
    sessionId = null;
    localStorage.removeItem('wayfinder_session');

    // Add a personalized welcome message
    appendMessage('assistant', `Welcome to Wayfinder, ${name}! Your account is all set up. I'll remember our conversations so we can build on them over time. What would you like to explore today?`);

  } catch (err) {
    showAuthError('signupError', 'Connection error. Is the server running?');
  }
}

function logout() {
  authToken = null;
  currentUser = null;
  sessionId = null;
  localStorage.removeItem('wayfinder_token');
  localStorage.removeItem('wayfinder_session');
  updateAuthUI();

  // Reload page for clean state
  location.reload();
}

async function checkAuth() {
  if (!authToken) {
    updateAuthUI();
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (res.ok) {
      const data = await res.json();
      currentUser = data.user;
      updateAuthUI();
    } else {
      // Token expired or invalid
      authToken = null;
      localStorage.removeItem('wayfinder_token');
      updateAuthUI();
    }
  } catch {
    // Server might not be running yet, keep token
    updateAuthUI();
  }
}

function updateAuthUI() {
  if (currentUser && authToken) {
    authLoggedOut.style.display = 'none';
    authLoggedIn.style.display = 'flex';
    userNameEl.textContent = currentUser.name || currentUser.email;
  } else {
    authLoggedOut.style.display = 'flex';
    authLoggedIn.style.display = 'none';
  }
}

// ========================
// Consent Functions
// ========================

function checkConsent() {
  const consent = localStorage.getItem('wayfinder_consent');
  if (!consent && !authToken) {
    // Show banner after a brief delay
    setTimeout(() => {
      consentBanner.style.display = 'flex';
    }, 3000);
  }
}

function acceptConsent() {
  localStorage.setItem('wayfinder_consent', 'true');
  consentBanner.style.display = 'none';
}

function dismissConsent() {
  consentBanner.style.display = 'none';
}

// ========================
// Markdown Renderer
// ========================

function renderMarkdown(text) {
  let html = escapeHtml(text);

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');

  // Inline code
  html = html.replace(/`(.*?)`/g, '<code>$1</code>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  // Unordered lists
  html = html.replace(/^[-•]\s+(.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

  // Numbered lists
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');

  // Blockquotes
  html = html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>');

  // Paragraphs
  html = html.replace(/\n\n/g, '</p><p>');
  html = '<p>' + html + '</p>';

  // Clean up empty paragraphs
  html = html.replace(/<p>\s*<\/p>/g, '');
  html = html.replace(/<p>(<ul>)/g, '$1');
  html = html.replace(/(<\/ul>)<\/p>/g, '$1');
  html = html.replace(/<p>(<pre>)/g, '$1');
  html = html.replace(/(<\/pre>)<\/p>/g, '$1');

  return html;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
