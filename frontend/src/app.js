/**
 * Wayfinder Chat Application
 *
 * Handles:
 * - Chat messaging with the backend API
 * - Session management (persists across page reloads)
 * - User authentication (login/signup)
 * - User profile editing
 * - Wayfinder Engine toggle (3 deep-dive queries/day)
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
let engineActive = false;
let engineRemaining = 0;

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

// Profile DOM elements
const profileModal = document.getElementById('profileModal');

// Engine DOM elements
const engineToggleRow = document.getElementById('engineToggleRow');
const engineToggle = document.getElementById('engineToggle');
const engineCountEl = document.getElementById('engineCount');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  setupAuthListeners();
  setupProfileListeners();
  setupEngineListeners();
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

    const body = { message, sessionId };

    // If engine is active, include the flag
    if (engineActive) {
      body.useWayfinderEngine = true;
    }

    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
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

    // Update engine remaining count
    if (data.engineRemaining !== null && data.engineRemaining !== undefined) {
      engineRemaining = data.engineRemaining;
      updateEngineUI();
    }

    // Remove typing indicator
    typingEl.remove();

    // Add assistant response with mode indicator
    appendMessage('assistant', data.response, data.sources, data.mode);

    // Deactivate engine after use
    if (engineActive) {
      engineActive = false;
      engineToggle.classList.remove('active');
    }

  } catch (err) {
    typingEl.remove();
    appendError(err.message);

    // If engine limit reached, deactivate
    if (engineActive) {
      engineActive = false;
      engineToggle.classList.remove('active');
    }
  } finally {
    isLoading = false;
    sendBtn.disabled = false;
    inputEl.focus();
  }
}

function appendMessage(role, text, sources = [], mode = null) {
  const messageEl = document.createElement('div');
  messageEl.className = `message ${role}`;

  const avatarEl = document.createElement('div');
  avatarEl.className = 'message-avatar';
  avatarEl.textContent = role === 'user' ? '👤' : '🧭';

  const contentEl = document.createElement('div');
  contentEl.className = 'message-content';

  // Add mode badge for assistant messages
  if (role === 'assistant' && mode) {
    const badge = document.createElement('div');
    badge.className = `engine-badge ${mode}`;
    badge.textContent = mode === 'engine' ? '⚡ Wayfinder Engine' : '💬 Standard';
    contentEl.appendChild(badge);
  }

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
// Engine Toggle
// ========================

function setupEngineListeners() {
  engineToggle.addEventListener('click', toggleEngine);
}

function toggleEngine() {
  if (!authToken || !currentUser) {
    alert('Please log in to use the Wayfinder Engine.');
    return;
  }

  if (engineRemaining <= 0 && !engineActive) {
    alert('You\'ve used all 3 Wayfinder Engine queries for today. Try again tomorrow!');
    return;
  }

  engineActive = !engineActive;

  if (engineActive) {
    engineToggle.classList.add('active');
  } else {
    engineToggle.classList.remove('active');
  }
}

function updateEngineUI() {
  if (!currentUser) {
    engineToggleRow.style.display = 'none';
    return;
  }

  engineToggleRow.style.display = 'flex';
  engineCountEl.textContent = `${engineRemaining} left today`;

  if (engineRemaining <= 0) {
    engineToggle.classList.add('disabled');
    engineToggle.classList.remove('active');
    engineActive = false;
  } else {
    engineToggle.classList.remove('disabled');
  }
}

async function fetchEngineUsage() {
  if (!authToken) return;

  try {
    const res = await fetch(`${API_BASE}/auth/engine-usage`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (res.ok) {
      const data = await res.json();
      engineRemaining = data.remaining;
      updateEngineUI();
    }
  } catch {
    // Non-critical
  }
}

// ========================
// Profile Functions
// ========================

function setupProfileListeners() {
  document.getElementById('profileBtn').addEventListener('click', openProfile);
  document.getElementById('profileModalClose').addEventListener('click', closeProfile);
  document.getElementById('profileSave').addEventListener('click', saveProfile);

  profileModal.addEventListener('click', (e) => {
    if (e.target === profileModal) closeProfile();
  });
}

function openProfile() {
  if (!currentUser) return;

  // Populate fields from current user profile
  const p = currentUser.profile || {};
  document.getElementById('profileAge').value = p.age || '';
  document.getElementById('profileGrade').value = p.gradeLevel || '';
  document.getElementById('profileClasses').value = (p.favoriteClasses || []).join(', ');
  document.getElementById('profileCareerInterests').value = (p.careerInterests || []).join(', ');
  document.getElementById('profileAbout').value = p.aboutMe || '';

  document.getElementById('profileSaveMsg').style.display = 'none';
  profileModal.style.display = 'flex';
}

function closeProfile() {
  profileModal.style.display = 'none';
}

async function saveProfile() {
  const profile = {
    age: document.getElementById('profileAge').value.trim(),
    gradeLevel: document.getElementById('profileGrade').value,
    favoriteClasses: document.getElementById('profileClasses').value
      .split(',').map(s => s.trim()).filter(Boolean),
    careerInterests: document.getElementById('profileCareerInterests').value
      .split(',').map(s => s.trim()).filter(Boolean),
    aboutMe: document.getElementById('profileAbout').value.trim()
  };

  try {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ profile })
    });

    const data = await res.json();

    if (data.error) {
      const msg = document.getElementById('profileSaveMsg');
      msg.textContent = data.error;
      msg.style.color = '#991b1b';
      msg.style.display = 'block';
      return;
    }

    // Update local user
    currentUser = data.user;

    const msg = document.getElementById('profileSaveMsg');
    msg.textContent = 'Profile saved! Your responses will now be personalized.';
    msg.style.color = '#059669';
    msg.style.display = 'block';

    // Auto-close after 1.5s
    setTimeout(() => closeProfile(), 1500);

  } catch (err) {
    const msg = document.getElementById('profileSaveMsg');
    msg.textContent = 'Failed to save. Please try again.';
    msg.style.color = '#991b1b';
    msg.style.display = 'block';
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
    engineRemaining = currentUser.engineRemaining || 3;
    updateAuthUI();
    updateEngineUI();
    fetchEngineUsage();
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
    engineRemaining = 3;
    updateAuthUI();
    updateEngineUI();
    closeAuthModal();

    // Start a fresh session for the new user
    sessionId = null;
    localStorage.removeItem('wayfinder_session');

    // Add a personalized welcome message
    appendMessage('assistant', `Welcome to Wayfinder, ${name}! Your account is all set up. I'll remember our conversations so we can build on them over time.\n\n**Tip:** Click your name to set up your profile — it helps me give you better advice. You also get **3 Wayfinder Engine queries per day** for deep-dive analysis with our full knowledge base.\n\nWhat would you like to explore today?`);

  } catch (err) {
    showAuthError('signupError', 'Connection error. Is the server running?');
  }
}

function logout() {
  authToken = null;
  currentUser = null;
  sessionId = null;
  engineActive = false;
  engineRemaining = 0;
  localStorage.removeItem('wayfinder_token');
  localStorage.removeItem('wayfinder_session');
  updateAuthUI();
  updateEngineUI();

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
      engineRemaining = currentUser.engineRemaining || 3;
      updateAuthUI();
      updateEngineUI();
      fetchEngineUsage();
    } else {
      // Token expired or invalid
      authToken = null;
      localStorage.removeItem('wayfinder_token');
      updateAuthUI();
      updateEngineUI();
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

  // Headings (## and ###)
  html = html.replace(/^### (.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^## (.+)$/gm, '<h3>$1</h3>');

  // Unordered lists
  html = html.replace(/^[-•]\s+(.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

  // Numbered lists
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');

  // Blockquotes
  html = html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>');

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr>');

  // Paragraphs
  html = html.replace(/\n\n/g, '</p><p>');
  html = '<p>' + html + '</p>';

  // Clean up empty paragraphs
  html = html.replace(/<p>\s*<\/p>/g, '');
  html = html.replace(/<p>(<ul>)/g, '$1');
  html = html.replace(/(<\/ul>)<\/p>/g, '$1');
  html = html.replace(/<p>(<pre>)/g, '$1');
  html = html.replace(/(<\/pre>)<\/p>/g, '$1');
  html = html.replace(/<p>(<h[34]>)/g, '$1');
  html = html.replace(/(<\/h[34]>)<\/p>/g, '$1');
  html = html.replace(/<p>(<hr>)<\/p>/g, '$1');

  return html;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
