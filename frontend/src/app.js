/**
 * Wayfinder Chat Application — v2.0
 *
 * Wayfinder advisory interface with:
 * - Collapsible sidebar with chat history + tool buttons
 * - Search across chats
 * - Copy/paste on messages
 * - Settings (general, account, privacy)
 * - Upgrade plans: Free / Pro ($25) / Elite ($50)
 * - Admissions tools: Timeline, Essay Reviewer, Internships, Scholarships, Programs
 * - Essay credits add-on
 * - Wayfinder Engine toggle
 * - User profiles
 */

const API_BASE = '/api';

// ========================
// State
// ========================
let sessionId = localStorage.getItem('wayfinder_session') || null;
let authToken = localStorage.getItem('wayfinder_token') || null;
let currentUser = null;
let messageCount = 0;
let isLoading = false;
let engineActive = false;
let engineRemaining = 0;
let chatHistoryCache = [];
let currentChatId = null;
let validatedInviteCode = null; // Stores validated invite code for signup

// ========================
// DOM References
// ========================
const $ = (id) => document.getElementById(id);
const messagesEl = $('messages');
const welcomeScreen = $('welcomeScreen');
const inputEl = $('userInput');
const sendBtn = $('sendBtn');
const charCountEl = $('charCount');
const sidebar = $('sidebar');
const engineToggleRow = $('engineToggleRow');
const engineToggle = $('engineToggle');
const engineCountEl = $('engineCount');

// ========================
// Initialize
// ========================
document.addEventListener('DOMContentLoaded', () => {
  // Collapse sidebar on mobile by default
  if (window.innerWidth <= 768 && sidebar) {
    sidebar.classList.add('collapsed');
  }
  setupChatListeners();
  setupSidebarListeners();
  setupAuthListeners();
  setupProfileListeners();
  setupEngineListeners();
  setupSettingsListeners();
  setupUpgradeListeners();
  setupInviteListeners();
  setupToolListeners();
  setupDavidCoach();
  setupWelcomeChips();
  updateGreeting();
  checkAuth();
  checkInviteCodeInURL();
  checkConsent();
  checkUpgradeReturn();
  inputEl.focus();
});

// ========================
// Greeting (time-of-day)
// ========================
function updateGreeting() {
  const hour = new Date().getHours();
  let greeting = 'Good evening';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 17) greeting = 'Good afternoon';

  const el = $('welcomeGreeting');
  if (currentUser && currentUser.name) {
    const displayName = currentUser.settings?.displayName || currentUser.name.split(' ')[0];
    el.textContent = `${greeting}, ${displayName}`;
  } else {
    el.textContent = greeting;
  }
  updateWelcomeView();
}

// ========================
// Welcome chips
// ========================
function setupWelcomeChips() {
  welcomeScreen.addEventListener('click', (e) => {
    // Handle path card clicks (binomial selection)
    const pathCard = e.target.closest('.welcome-path-card');
    if (pathCard) {
      const path = pathCard.dataset.path;
      const pathSelect = $('welcomePathSelect');
      const userTypes = $('welcomeUserTypes');
      const label = $('welcomeUserTypeLabel');

      pathSelect.style.display = 'none';
      userTypes.style.display = '';

      if (path === 'career') {
        $('careerUserTypes').style.display = '';
        $('admissionsUserTypes').style.display = 'none';
        label.textContent = 'I\'m a...';
      } else {
        $('careerUserTypes').style.display = 'none';
        $('admissionsUserTypes').style.display = '';
        label.textContent = 'I\'m a...';
      }
      return;
    }

    // Handle back button
    if (e.target.closest('#welcomeBackBtn')) {
      $('welcomePathSelect').style.display = '';
      $('welcomeUserTypes').style.display = 'none';
      $('careerUserTypes').style.display = 'none';
      $('admissionsUserTypes').style.display = 'none';
      return;
    }

    // Handle user type chip clicks
    const chip = e.target.closest('.welcome-chip');
    if (chip) {
      const msg = chip.dataset.message;
      if (msg) {
        inputEl.value = msg;
        sendMessage();
      }
    }
  });
}

// ========================
// Sidebar
// ========================
function setupSidebarListeners() {
  // Create mobile backdrop overlay
  const backdrop = document.createElement('div');
  backdrop.className = 'sidebar-backdrop';
  document.getElementById('app').appendChild(backdrop);
  backdrop.addEventListener('click', () => sidebar.classList.add('collapsed'));

  // Sync backdrop visibility with sidebar state
  const syncBackdrop = () => {
    if (window.innerWidth <= 768 && !sidebar.classList.contains('collapsed')) {
      backdrop.classList.add('visible');
    } else {
      backdrop.classList.remove('visible');
    }
  };

  $('sidebarClose').addEventListener('click', () => { sidebar.classList.add('collapsed'); syncBackdrop(); });
  $('sidebarOpen').addEventListener('click', () => { sidebar.classList.remove('collapsed'); syncBackdrop(); });

  // Also sync on resize
  window.addEventListener('resize', syncBackdrop);
  $('newChatBtn').addEventListener('click', startNewChat);

  // Search
  $('chatSearch').addEventListener('input', debounce(handleChatSearch, 300));

  // Settings & upgrade from sidebar
  $('sidebarSettings').addEventListener('click', openSettings);
  $('sidebarUpgrade').addEventListener('click', openUpgrade);
  $('sidebarDemographics').addEventListener('click', openDemographics);
}

function startNewChat() {
  sessionId = null;
  currentChatId = null;
  localStorage.removeItem('wayfinder_session');
  messagesEl.innerHTML = '';
  messagesEl.style.display = 'none';
  welcomeScreen.style.display = 'flex';
  updateGreeting();
  messageCount = 0;

  // Deselect active history item
  document.querySelectorAll('.history-item.active').forEach(el => el.classList.remove('active'));

  inputEl.focus();
}

async function loadChatHistory(retryCount = 0) {
  if (!authToken) {
    showEmptyHistory();
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/history`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (res.status === 401) {
      // Token expired — don't show empty, just skip (auth check will handle)
      console.warn('[History] Token expired, skipping history load');
      return;
    }

    if (!res.ok) {
      // Server error — retry up to 2 times with backoff
      if (retryCount < 2) {
        console.warn(`[History] Server error ${res.status}, retrying (${retryCount + 1}/2)...`);
        setTimeout(() => loadChatHistory(retryCount + 1), 1000 * (retryCount + 1));
        return;
      }
      throw new Error(`Server error: ${res.status}`);
    }

    const data = await res.json();
    chatHistoryCache = data.history || [];
    renderChatHistory(chatHistoryCache);
  } catch (err) {
    console.warn('[History] Failed to load chat history:', err);
    // Only show empty if we had no cached data — preserve existing view if available
    if (chatHistoryCache.length > 0) {
      renderChatHistory(chatHistoryCache);
    } else if (retryCount < 2) {
      // Network error — retry
      setTimeout(() => loadChatHistory(retryCount + 1), 1500 * (retryCount + 1));
    } else {
      showEmptyHistory();
    }
  }
}

function renderChatHistory(items) {
  const todayEl = $('historyToday');
  const weekEl = $('historyWeek');
  const olderEl = $('historyOlder');

  todayEl.innerHTML = '';
  weekEl.innerHTML = '';
  olderEl.innerHTML = '';

  if (!items || items.length === 0) {
    showEmptyHistory();
    return;
  }

  // Hide empty states
  todayEl.parentElement.style.display = 'block';
  weekEl.parentElement.style.display = 'block';
  olderEl.parentElement.style.display = 'block';

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(todayStart.getTime() - 7 * 86400000);

  let todayCount = 0, weekCount = 0, olderCount = 0;

  items.forEach(chat => {
    const date = new Date(chat.lastActive || chat.created);
    const btn = document.createElement('button');
    btn.className = 'history-item';
    if (chat.id === currentChatId) btn.classList.add('active');
    btn.textContent = chat.title || 'New conversation';
    btn.addEventListener('click', () => loadChat(chat.id));

    if (date >= todayStart) {
      todayEl.appendChild(btn);
      todayCount++;
    } else if (date >= weekAgo) {
      weekEl.appendChild(btn);
      weekCount++;
    } else {
      olderEl.appendChild(btn);
      olderCount++;
    }
  });

  // Hide sections with no items
  todayEl.parentElement.style.display = todayCount ? 'block' : 'none';
  weekEl.parentElement.style.display = weekCount ? 'block' : 'none';
  olderEl.parentElement.style.display = olderCount ? 'block' : 'none';
}

function showEmptyHistory() {
  const todayEl = $('historyToday');
  todayEl.innerHTML = '<div class="history-empty">No conversations yet</div>';
  todayEl.parentElement.style.display = 'block';
  $('historyWeek').parentElement.style.display = 'none';
  $('historyOlder').parentElement.style.display = 'none';
}

async function loadChat(chatId) {
  try {
    const headers = {};
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

    const res = await fetch(`${API_BASE}/chat/history/${chatId}`, { headers });
    if (!res.ok) throw new Error();

    const data = await res.json();

    // Set current session
    sessionId = chatId;
    currentChatId = chatId;
    localStorage.setItem('wayfinder_session', chatId);
    messageCount = data.messageCount || 0;

    // Render messages
    welcomeScreen.style.display = 'none';
    messagesEl.style.display = 'block';
    messagesEl.innerHTML = '';

    if (data.messages) {
      for (let i = 0; i < data.messages.length; i++) {
        const msg = data.messages[i];
        appendMessage(msg.role === 'user' ? 'user' : 'assistant', msg.content);
      }
    }

    // Update active state in sidebar
    document.querySelectorAll('.history-item').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.history-item').forEach(el => {
      if (el.textContent === (chatHistoryCache.find(c => c.id === chatId)?.title || '')) {
        el.classList.add('active');
      }
    });

    messagesEl.scrollTop = messagesEl.scrollHeight;
    closeSidebarOnMobile();
  } catch (err) {
    console.warn('Failed to load chat:', err);
  }
}

async function handleChatSearch(e) {
  const query = e?.target?.value?.trim() || '';
  if (!query) {
    renderChatHistory(chatHistoryCache);
    return;
  }

  if (!authToken) return;

  try {
    const res = await fetch(`${API_BASE}/auth/search?q=${encodeURIComponent(query)}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    renderChatHistory(data.results || []);
  } catch {
    // Fall back to local filter
    const filtered = chatHistoryCache.filter(c =>
      (c.title || '').toLowerCase().includes(query.toLowerCase())
    );
    renderChatHistory(filtered);
  }
}

// ========================
// Chat Functions
// ========================
function setupChatListeners() {
  sendBtn.addEventListener('click', sendMessage);

  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  inputEl.addEventListener('input', () => {
    inputEl.style.height = 'auto';
    inputEl.style.height = Math.min(inputEl.scrollHeight, 120) + 'px';
    const len = inputEl.value.length;
    charCountEl.textContent = len > 100 ? `${len}/5000` : '';
  });

  // Event delegation for message actions
  messagesEl.addEventListener('click', (e) => {
    // Copy button
    const copyBtn = e.target.closest('.copy-btn');
    if (copyBtn) {
      const messageEl = copyBtn.closest('.message');
      const bodyEl = messageEl.querySelector('.message-body');
      if (bodyEl) {
        navigator.clipboard.writeText(bodyEl.innerText).then(() => {
          copyBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg> Copied';
          copyBtn.classList.add('copied');
          setTimeout(() => {
            copyBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy';
            copyBtn.classList.remove('copied');
          }, 2000);
        });
      }
    }

    // Feedback buttons
    if (e.target.closest('.feedback-btn')) {
      handleFeedback(e.target.closest('.feedback-btn'));
    }
  });
}

async function sendMessage() {
  const message = inputEl.value.trim();
  if (!message || isLoading) return;

  // Switch from welcome to chat view
  if (welcomeScreen.style.display !== 'none') {
    welcomeScreen.style.display = 'none';
    messagesEl.style.display = 'block';
  }

  inputEl.value = '';
  inputEl.style.height = 'auto';
  charCountEl.textContent = '';

  const userMsgEl = appendMessage('user', message);
  const typingEl = showTyping();

  isLoading = true;
  sendBtn.disabled = true;

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

    const body = { message, sessionId };
    if (engineActive) body.useWayfinderEngine = true;

    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const error = new Error(err.error || `Server error (${response.status})`);
      // Tag error type for friendly messaging
      if (response.status === 429) {
        error.errorType = err.upgradeReason === 'daily_messages' ? 'daily_message_limit'
          : err.upgradeReason === 'monthly_messages' ? 'monthly_message_limit'
          : err.error?.includes('token') ? 'token_limit'
          : err.error?.includes('Engine') ? 'engine_limit'
          : 'rate_limit';
      }
      throw error;
    }

    const data = await response.json();

    sessionId = data.sessionId;
    currentChatId = data.sessionId;
    localStorage.setItem('wayfinder_session', sessionId);
    messageCount = data.messageCount;

    if (data.engineRemaining !== null && data.engineRemaining !== undefined) {
      engineRemaining = data.engineRemaining;
      updateEngineUI();
    }

    // Update message usage counter
    if (data.messageUsage) {
      updateMessageCounter(data.messageUsage);
    }

    typingEl.remove();
    appendMessage('assistant', data.response, data.sources, data.mode);

    // If advisor is warming up (Haiku intake + SLM waking), poll for readiness
    if (data.advisorWarming) {
      pollAdvisorStatus();
    }

    if (engineActive) {
      engineActive = false;
      engineToggle.classList.remove('active');
    }

    // Refresh chat history in sidebar
    loadChatHistory();

  } catch (err) {
    typingEl.remove();
    // Remove the user's message from the UI — it was never delivered to the server
    // Restore it to the input box so they can retry easily
    if (userMsgEl && userMsgEl.parentNode) {
      userMsgEl.remove();
    }
    inputEl.value = message;
    appendError(err.message, err.errorType || null);
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

// ========================
// Advisor Warm-Up Polling
// ========================
let advisorPollTimer = null;

function pollAdvisorStatus() {
  // Clear any existing poll
  if (advisorPollTimer) clearInterval(advisorPollTimer);

  let attempts = 0;
  const maxAttempts = 40; // 40 × 3s = 120s max polling

  advisorPollTimer = setInterval(async () => {
    attempts++;
    if (attempts > maxAttempts) {
      clearInterval(advisorPollTimer);
      advisorPollTimer = null;
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/chat/advisor-status`);
      if (!res.ok) return;
      const status = await res.json();

      if (status.ready) {
        clearInterval(advisorPollTimer);
        advisorPollTimer = null;
        showAdvisorReadyNotification();
      }
    } catch {
      // Silently ignore — will retry on next interval
    }
  }, 3000);
}

function showAdvisorReadyNotification() {
  // Don't show if user has already moved past the first exchange
  if (messageCount > 3) return;

  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'advisor-ready-notification';
  notification.innerHTML = `
    <div class="advisor-ready-icon">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    </div>
    <div class="advisor-ready-text">
      <strong>Your advisor is ready</strong>
      <span>Ask your next question to connect directly.</span>
    </div>
  `;

  messagesEl.appendChild(notification);
  messagesEl.scrollTop = messagesEl.scrollHeight;

  // Keep it visible — it stays until the user sends their next message
  // (the next appendMessage call will naturally push it up in the chat)
}

function appendMessage(role, text, sources = [], mode = null) {
  const messageEl = document.createElement('div');
  messageEl.className = 'message';

  const initial = currentUser ? (currentUser.name || 'U')[0].toUpperCase() : 'U';

  // Mode badge
  let badgeHTML = '';
  if (role === 'assistant' && mode) {
    const modeLabels = {
      engine: 'Wayfinder Engine',
      haiku_intake: 'Welcome Desk',
      slm: 'Advisor',
      haiku_advisor: 'Advisor',
      haiku_standard: 'Standard',
      slm_quality_fallback: 'Advisor',
      slm_error_fallback: 'Advisor',
      standard: 'Standard',
      claude_escalated: 'Standard',
      claude_fallback: 'Standard',
    };
    const modeLabel = modeLabels[mode] || 'Standard';
    badgeHTML = `<div class="engine-badge ${mode}">${modeLabel}</div>`;
  }

  // Header
  const avatarHTML = role === 'user'
    ? `<div class="message-avatar user-avatar">${initial}</div>`
    : `<div class="message-avatar"><img src="/logo.svg" alt="Wayfinder"></div>`;

  // Persona name changes based on mode:
  // - haiku_intake: "Welcome Desk" (the front-desk assistant)
  // - slm/engine/standard: "Wayfinder" (the full advisor)
  let roleName;
  if (role === 'user') {
    roleName = currentUser?.name || 'You';
  } else if (mode === 'haiku_intake') {
    roleName = 'Welcome Desk';
  } else if (mode === 'haiku_advisor' || mode === 'slm') {
    roleName = 'Wayfinder Advisor';
  } else {
    roleName = 'Wayfinder';
  }

  const headerHTML = `
    <div class="message-header">
      ${avatarHTML}
      <span class="message-role">${escapeHtml(roleName)}</span>
    </div>
  `;

  // Body
  const bodyContent = role === 'assistant' ? renderMarkdown(text) : `<p>${escapeHtml(text)}</p>`;
  const bodyHTML = `<div class="message-body">${bodyContent}</div>`;

  // Sources
  let sourcesHTML = '';
  if (sources && sources.length > 0) {
    sourcesHTML = `<div class="sources">Sources: ${sources
      .map(s => `<span>${escapeHtml((s.source || '').replace('.json', '').replace('.md', ''))}</span>`)
      .join('')}</div>`;
  }

  // Copy button (for assistant messages)
  let actionsHTML = '';
  if (role === 'assistant') {
    actionsHTML = `
      <div class="message-actions">
        <button class="msg-action-btn copy-btn">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          Copy
        </button>
      </div>
      <div class="feedback-row">
        <button class="feedback-btn" data-rating="1" data-index="${messageCount}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
          Helpful
        </button>
        <button class="feedback-btn" data-rating="-1" data-index="${messageCount}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg>
          Not helpful
        </button>
      </div>
    `;
  }

  messageEl.innerHTML = headerHTML + badgeHTML + bodyHTML + sourcesHTML + actionsHTML;
  messagesEl.appendChild(messageEl);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return messageEl;
}

function appendError(message, errorType = null) {
  const el = document.createElement('div');
  el.className = 'error-message';

  // Friendly, context-aware error messages
  if (errorType === 'daily_message_limit') {
    el.innerHTML = `<strong>You've reached your daily message limit.</strong> Your messages reset tomorrow. <a href="#" onclick="event.preventDefault(); openUpgrade();" style="color: #2563eb; text-decoration: underline;">Upgrade your plan</a> for more daily messages.`;
  } else if (errorType === 'monthly_message_limit') {
    el.innerHTML = `<strong>You've used all your messages this month.</strong> <a href="#" onclick="event.preventDefault(); openUpgrade();" style="color: #2563eb; text-decoration: underline;">Upgrade your plan</a> for unlimited messaging.`;
  } else if (errorType === 'rate_limit' || /too many requests/i.test(message)) {
    el.innerHTML = `<strong>Hang tight!</strong> You're sending messages faster than we can keep up. Give it a few seconds and try again.`;
  } else if (errorType === 'token_limit' || /token limit/i.test(message) || /daily.*limit/i.test(message)) {
    el.innerHTML = `<strong>You've run out of tokens for today.</strong> Your tokens reset tomorrow. Want more? <a href="#" onclick="event.preventDefault(); openUpgrade();" style="color: #2563eb; text-decoration: underline;">Upgrade your plan</a> for higher token limits.`;
  } else if (errorType === 'engine_limit' || /engine queries/i.test(message)) {
    el.innerHTML = `<strong>You've used all your Engine queries for today.</strong> Engine resets tomorrow. You can keep chatting in standard mode, or <a href="#" onclick="event.preventDefault(); openUpgrade();" style="color: #2563eb; text-decoration: underline;">upgrade for more Engine pulls</a>.`;
  } else if (/timeout/i.test(message)) {
    el.innerHTML = `<strong>That took longer than expected.</strong> Try a simpler question, or give it another shot.`;
  } else {
    el.innerHTML = `<strong>Something went wrong.</strong> Please try again in a moment.`;
  }

  messagesEl.appendChild(el);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function showTyping() {
  const el = document.createElement('div');
  el.className = 'message';
  el.innerHTML = `
    <div class="message-header">
      <div class="message-avatar"><img src="/logo.svg" alt="Wayfinder"></div>
      <span class="message-role">Wayfinder</span>
    </div>
    <div class="typing-indicator"><span></span><span></span><span></span></div>
  `;
  messagesEl.appendChild(el);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return el;
}

async function handleFeedback(btn) {
  const rating = parseInt(btn.dataset.rating);
  const index = parseInt(btn.dataset.index);

  const row = btn.parentElement;
  row.querySelectorAll('.feedback-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');

  let comment = null;
  if (rating === -1) {
    comment = prompt('What could be improved? (optional)');
  }

  try {
    await fetch(`${API_BASE}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, messageIndex: index, rating, comment })
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
    alert('You\'ve used all your Engine queries for today. Upgrade your plan for more!');
    return;
  }
  engineActive = !engineActive;
  engineToggle.classList.toggle('active', engineActive);
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
  // Show PRO badge for paid tiers
  const modelBadge = $('engineModelBadge');
  if (modelBadge) {
    const plan = userPlan();
    if (plan === 'pro' || plan === 'elite') {
      modelBadge.style.display = 'inline-flex';
      modelBadge.textContent = plan === 'elite' ? 'ELITE' : 'PRO';
    } else {
      modelBadge.style.display = 'none';
    }
  }
}

function updateMessageCounter(msgUsage) {
  const counter = $('messageCounter');
  if (!counter) return;

  // Only show counter for plans with limits
  const dailyLimit = msgUsage.daily?.limit;
  const monthlyLimit = msgUsage.monthly?.limit;
  if (dailyLimit === null && monthlyLimit === null) {
    counter.style.display = 'none';
    return;
  }

  counter.style.display = 'inline';

  // Show the most relevant limit (whichever is closer to hitting)
  let text = '';
  let severity = '';

  if (dailyLimit !== null) {
    const remaining = msgUsage.daily.remaining;
    text = `${remaining}/${dailyLimit} messages today`;
    if (remaining <= 2) severity = 'critical';
    else if (remaining <= 5) severity = 'warning';
  }

  if (monthlyLimit !== null) {
    const mRemaining = msgUsage.monthly.remaining;
    const mText = `${mRemaining}/${monthlyLimit} this month`;
    if (dailyLimit !== null) {
      text += ` · ${mText}`;
    } else {
      text = mText;
    }
    if (mRemaining <= 5) severity = 'critical';
    else if (mRemaining <= 10) severity = severity || 'warning';
  }

  counter.textContent = text;
  counter.className = 'message-counter' + (severity ? ` ${severity}` : '');
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
  } catch { /* non-critical */ }
}

// ========================
// Profile
// ========================
function setupProfileListeners() {
  $('profileModalClose').addEventListener('click', () => $('profileModal').style.display = 'none');
  $('profileSave').addEventListener('click', saveProfile);
  $('profileModal').addEventListener('click', (e) => {
    if (e.target === $('profileModal')) $('profileModal').style.display = 'none';
  });
}

function openProfile() {
  if (!currentUser) return;
  const p = currentUser.profile || {};
  $('profileAge').value = p.age || '';
  $('profileGrade').value = p.gradeLevel || '';
  $('profileClasses').value = (p.favoriteClasses || []).join(', ');
  $('profileCareerInterests').value = (p.careerInterests || []).join(', ');
  $('profileAbout').value = p.aboutMe || '';
  $('profileSaveMsg').style.display = 'none';
  $('profileModal').style.display = 'flex';
}

async function saveProfile() {
  const profile = {
    age: $('profileAge').value.trim(),
    gradeLevel: $('profileGrade').value,
    favoriteClasses: $('profileClasses').value.split(',').map(s => s.trim()).filter(Boolean),
    careerInterests: $('profileCareerInterests').value.split(',').map(s => s.trim()).filter(Boolean),
    aboutMe: $('profileAbout').value.trim()
  };

  try {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
      body: JSON.stringify({ profile })
    });
    const data = await res.json();
    if (data.error) {
      showMsg('profileSaveMsg', data.error, '#991b1b');
      return;
    }
    currentUser = data.user;
    showMsg('profileSaveMsg', 'Profile saved!', '#059669');
    setTimeout(() => $('profileModal').style.display = 'none', 1200);
  } catch {
    showMsg('profileSaveMsg', 'Failed to save.', '#991b1b');
  }
}

// ========================
// Settings
// ========================
function setupSettingsListeners() {
  $('settingsModalClose').addEventListener('click', () => $('settingsModal').style.display = 'none');
  $('settingsModal').addEventListener('click', (e) => {
    if (e.target === $('settingsModal')) $('settingsModal').style.display = 'none';
  });

  // Tabs
  document.querySelectorAll('.settings-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.settings-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      $(`settings${capitalize(tab.dataset.tab)}`).classList.add('active');
      // Load invites when switching to invites tab
      if (tab.dataset.tab === 'invites') loadInvitesList();
    });
  });

  // General save
  $('settingsSaveGeneral').addEventListener('click', saveGeneralSettings);

  // Privacy save
  $('settingsSavePrivacy').addEventListener('click', savePrivacySettings);

  // Account actions
  $('settingsLogout').addEventListener('click', logout);
  $('settingsDeleteAccount').addEventListener('click', deleteAccount);
  $('settingsUpgradeBtn').addEventListener('click', () => {
    $('settingsModal').style.display = 'none';
    openUpgrade();
  });

  // Admin tier switcher
  document.querySelectorAll('.admin-tier-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const plan = btn.dataset.plan;
      const msg = $('adminTierMsg');
      try {
        const res = await fetch('/api/auth/admin/plan', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
          body: JSON.stringify({ plan })
        });
        const data = await res.json();
        if (data.success) {
          currentUser = data.user;
          document.querySelectorAll('.admin-tier-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          msg.textContent = `Switched to ${plan} tier. Refresh to see full UI changes.`;
          msg.style.display = 'block';
          msg.style.color = '#10b981';
          updateEngineUI();
          updateGreeting();
        } else {
          msg.textContent = data.error || 'Failed to switch tier';
          msg.style.display = 'block';
          msg.style.color = '#ef4444';
        }
      } catch {
        msg.textContent = 'Network error';
        msg.style.display = 'block';
        msg.style.color = '#ef4444';
      }
    });
  });
}

function openSettings() {
  if (!currentUser) {
    openAuthModal('login');
    return;
  }

  // Populate general tab
  $('settingsDisplayName').value = currentUser.settings?.displayName || currentUser.name || '';
  $('settingsEmail').value = currentUser.email || '';

  // Populate privacy tab
  $('settingsMemory').checked = currentUser.settings?.memory !== false;
  $('settingsHelpImprove').checked = currentUser.settings?.helpImprove !== false;

  // Populate account tab
  const planNames = { free: 'Explorer (Free)', pro: 'Coach ($25/mo)', elite: 'Consultant ($50/mo)', premium: 'Coach (Legacy)' };
  const planLimits = { free: 3, pro: 10, elite: 20, premium: 10 };
  const plan = currentUser.plan || 'free';
  $('currentPlanDisplay').innerHTML = `
    <span class="plan-name">${planNames[plan] || plan}</span>
    <span class="plan-detail">${planLimits[plan] || 3} Engine queries/day</span>
  `;

  // Show admin tier section if admin
  const adminSection = $('adminTierSection');
  if (currentUser.isAdmin) {
    adminSection.style.display = '';
    document.querySelectorAll('.admin-tier-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.plan === plan);
    });
  } else {
    adminSection.style.display = 'none';
  }

  // Reset to general tab
  document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.settings-panel').forEach(p => p.classList.remove('active'));
  document.querySelector('.settings-tab[data-tab="general"]').classList.add('active');
  $('settingsGeneral').classList.add('active');

  $('settingsModal').style.display = 'flex';
}

async function saveGeneralSettings() {
  const displayName = $('settingsDisplayName').value.trim();
  try {
    const res = await fetch(`${API_BASE}/auth/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
      body: JSON.stringify({ settings: { displayName } })
    });
    const data = await res.json();
    if (data.error) {
      showMsg('settingsGeneralMsg', data.error, '#991b1b');
      return;
    }
    currentUser = data.user;
    updateGreeting();
    updateAuthUI();
    showMsg('settingsGeneralMsg', 'Settings saved!', '#059669');
  } catch {
    showMsg('settingsGeneralMsg', 'Failed to save.', '#991b1b');
  }
}

async function savePrivacySettings() {
  const memory = $('settingsMemory').checked;
  const helpImprove = $('settingsHelpImprove').checked;
  try {
    const res = await fetch(`${API_BASE}/auth/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
      body: JSON.stringify({ settings: { memory, helpImprove } })
    });
    const data = await res.json();
    if (data.error) {
      showMsg('settingsPrivacyMsg', data.error, '#991b1b');
      return;
    }
    currentUser = data.user;
    showMsg('settingsPrivacyMsg', 'Privacy settings saved!', '#059669');
  } catch {
    showMsg('settingsPrivacyMsg', 'Failed to save.', '#991b1b');
  }
}

async function deleteAccount() {
  const confirmed = confirm('Are you sure you want to delete your account? All your data will be permanently removed. This cannot be undone.');
  if (!confirmed) return;

  const doubleConfirm = confirm('This is your final confirmation. Delete account and all data?');
  if (!doubleConfirm) return;

  try {
    const res = await fetch(`${API_BASE}/auth/account`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (res.ok) {
      alert('Your account has been deleted.');
      authToken = null;
      currentUser = null;
      sessionId = null;
      localStorage.clear();
      location.reload();
    }
  } catch {
    alert('Failed to delete account. Please try again.');
  }
}

// ========================
// Upgrade / Plans
// ========================
// Plan display names — backend uses pro/elite internally
const PLAN_DISPLAY = { free: 'Explorer', pro: 'Coach', elite: 'Consultant' };

function setupUpgradeListeners() {
  $('upgradeModalClose').addEventListener('click', () => $('upgradeModal').style.display = 'none');
  $('upgradeModal').addEventListener('click', (e) => {
    if (e.target === $('upgradeModal')) $('upgradeModal').style.display = 'none';
  });

  // Unified plans — Coach $25, Consultant $50
  $('planCoachBtn').addEventListener('click', () => handlePlanUpgrade('pro'));
  $('planConsultantBtn').addEventListener('click', () => handlePlanUpgrade('elite'));

  // Essay credit packs
  $('essayPack5Btn').addEventListener('click', () => handleEssayPurchase('starter'));
  $('essayPack10Btn').addEventListener('click', () => handleEssayPurchase('standard'));
  $('essayPack20Btn').addEventListener('click', () => handleEssayPurchase('bulk'));
}

function openUpgrade() {
  if (!currentUser) {
    openAuthModal('signup');
    return;
  }

  const plan = normalizePlan(currentUser.plan || 'free');
  const isProOrHigher = plan === 'pro' || plan === 'elite';

  // Free button
  $('planFreeBtn').textContent = plan === 'free' ? 'Current Plan' : 'Free Plan';
  $('planFreeBtn').className = plan === 'free' ? 'plan-btn plan-btn-current' : 'plan-btn plan-btn-upgrade';

  // Coach button ($25)
  $('planCoachBtn').textContent = isProOrHigher ? 'Current Plan' : 'Upgrade — $25/mo';
  $('planCoachBtn').className = isProOrHigher ? 'plan-btn plan-btn-current' : 'plan-btn plan-btn-upgrade';
  $('planCoachBtn').disabled = isProOrHigher;

  // Consultant button ($50)
  $('planConsultantBtn').textContent = plan === 'elite' ? 'Current Plan' : 'Upgrade — $50/mo';
  $('planConsultantBtn').className = plan === 'elite' ? 'plan-btn plan-btn-current' : 'plan-btn plan-btn-upgrade';
  $('planConsultantBtn').disabled = plan === 'elite';

  // Essay credits — available for Coach/Consultant
  const essaySection = $('essayAddonSection');
  if (essaySection) {
    essaySection.style.display = isProOrHigher ? 'block' : 'none';
  }

  $('upgradeModal').style.display = 'flex';
}

function normalizePlan(plan) {
  if (plan === 'premium') return 'pro'; // Legacy migration
  return plan || 'free';
}

function planDisplayName(plan) {
  return PLAN_DISPLAY[normalizePlan(plan)] || 'Explorer';
}

let _checkoutInProgress = false;
async function handlePlanUpgrade(plan) {
  if (_checkoutInProgress) return; // Prevent double-clicks
  _checkoutInProgress = true;

  // Disable all plan buttons while processing
  const btns = document.querySelectorAll('.plan-btn');
  btns.forEach(b => { b.disabled = true; b.style.opacity = '0.6'; });

  try {
    // Check if Stripe is configured
    const statusRes = await fetch(`${API_BASE}/stripe/status`);
    const statusData = await statusRes.json();

    if (!statusData.configured) {
      alert(`Stripe payments are being set up. Contact support@wayfinderai.org to upgrade in the meantime.`);
      return;
    }

    // Create Stripe Checkout session
    const res = await fetch(`${API_BASE}/stripe/create-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ plan })
    });

    const data = await res.json();
    if (data.error) {
      // If auth failed, prompt re-login instead of confusing error
      if (res.status === 401) {
        alert('Your session has expired. Please log in again to upgrade.');
        logout();
        openAuthModal('login');
      } else {
        alert(data.error);
      }
      return;
    }

    if (data.url) {
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    }
  } catch (err) {
    alert('Unable to process upgrade right now. Please try again later.');
    console.error('Upgrade error:', err);
  } finally {
    // Re-enable buttons after a short delay (in case redirect doesn't happen)
    setTimeout(() => {
      _checkoutInProgress = false;
      btns.forEach(b => { b.disabled = false; b.style.opacity = '1'; });
    }, 3000);
  }
}

let _essayPurchaseInProgress = false;
async function handleEssayPurchase(pack) {
  if (_essayPurchaseInProgress) return;
  _essayPurchaseInProgress = true;

  const btns = document.querySelectorAll('.essay-pack-btn');
  btns.forEach(b => { b.disabled = true; b.style.opacity = '0.6'; });

  try {
    const statusRes = await fetch(`${API_BASE}/stripe/status`);
    const statusData = await statusRes.json();
    if (!statusData.configured) {
      alert('Payments are being set up. Contact support@wayfinderai.org.');
      return;
    }

    const res = await fetch(`${API_BASE}/stripe/purchase-essays`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ pack })
    });
    const data = await res.json();

    // Admin users get a message instead of a checkout URL
    if (data.message) { alert(data.message); return; }

    if (data.error) {
      if (res.status === 401) {
        alert('Your session has expired. Please log in again.');
        logout();
        openAuthModal('login');
      } else {
        alert(data.error);
      }
      return;
    }
    if (data.url) window.location.href = data.url;
  } catch {
    alert('Unable to process purchase right now.');
  } finally {
    setTimeout(() => {
      _essayPurchaseInProgress = false;
      btns.forEach(b => { b.disabled = false; b.style.opacity = '1'; });
    }, 3000);
  }
}

// ========================
// Auth Functions
// ========================
function setupAuthListeners() {
  $('topLoginBtn').addEventListener('click', () => openAuthModal('login'));
  $('topSignupBtn').addEventListener('click', () => openAuthModal('signup'));
  $('modalClose').addEventListener('click', closeAuthModal);
  $('showSignup').addEventListener('click', (e) => { e.preventDefault(); switchAuthForm('signup'); });
  $('showLogin').addEventListener('click', (e) => { e.preventDefault(); switchAuthForm('login'); });
  $('showForgotPassword').addEventListener('click', (e) => { e.preventDefault(); switchAuthForm('forgot'); });
  $('backToLogin').addEventListener('click', (e) => { e.preventDefault(); switchAuthForm('login'); });
  $('forgotSubmit').addEventListener('click', submitForgotPassword);
  $('resetSubmit').addEventListener('click', submitResetPassword);

  $('authModal').addEventListener('click', (e) => {
    if (e.target === $('authModal')) closeAuthModal();
  });

  $('loginSubmit').addEventListener('click', submitLogin);
  $('signupSubmit').addEventListener('click', submitSignup);

  $('loginPassword').addEventListener('keydown', (e) => { if (e.key === 'Enter') submitLogin(); });
  $('signupPassword').addEventListener('keydown', (e) => { if (e.key === 'Enter') submitSignup(); });

  // Avatar click opens settings
  $('topbarAvatar').addEventListener('click', openSettings);

  // Consent
  $('consentAccept').addEventListener('click', () => {
    localStorage.setItem('wayfinder_consent', 'true');
    $('consentBanner').style.display = 'none';
  });
  $('consentDismiss').addEventListener('click', () => {
    $('consentBanner').style.display = 'none';
  });
}

function openAuthModal(mode) {
  $('authModal').style.display = 'flex';
  switchAuthForm(mode);
}

function closeAuthModal() {
  $('authModal').style.display = 'none';
  $('loginError').style.display = 'none';
  $('signupError').style.display = 'none';
  if ($('forgotError')) $('forgotError').style.display = 'none';
  if ($('resetError')) $('resetError').style.display = 'none';
  // Reset forgot password form state
  if ($('forgotStep1')) $('forgotStep1').style.display = 'block';
  if ($('forgotStep2')) $('forgotStep2').style.display = 'none';
}

function switchAuthForm(mode) {
  $('loginForm').style.display = mode === 'login' ? 'block' : 'none';
  $('signupForm').style.display = mode === 'signup' ? 'block' : 'none';
  $('forgotPasswordForm').style.display = mode === 'forgot' ? 'block' : 'none';
  if (mode === 'login') $('loginEmail').focus();
  else if (mode === 'forgot') $('forgotEmail').focus();
  else $('signupName').focus();
}

function showAuthError(formId, message) {
  const el = $(formId);
  el.textContent = message;
  el.style.display = 'block';
}

async function submitLogin() {
  const email = $('loginEmail').value.trim();
  const password = $('loginPassword').value;
  if (!email || !password) { showAuthError('loginError', 'Please fill in both fields'); return; }

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.error) { showAuthError('loginError', data.error); return; }

    authToken = data.token;
    currentUser = data.user;
    localStorage.setItem('wayfinder_token', authToken);
    engineRemaining = currentUser.engineRemaining || 3;
    updateAuthUI();
    updateEngineUI();
    updateGreeting();
    fetchEngineUsage();
    loadChatHistory();
    closeAuthModal();
    showDavidWidget();

    // Initialize message usage counter
    if (currentUser.messageUsage) {
      updateMessageCounter(currentUser.messageUsage);
    }

    sessionId = null;
    localStorage.removeItem('wayfinder_session');
  } catch {
    showAuthError('loginError', 'Connection error. Is the server running?');
  }
}

let forgotEmail = ''; // track email across forgot/reset steps

async function submitForgotPassword() {
  const email = $('forgotEmail').value.trim();
  if (!email) { showAuthError('forgotError', 'Please enter your email'); return; }

  $('forgotSubmit').disabled = true;
  $('forgotSubmit').textContent = 'Sending...';

  try {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (data.error) {
      showAuthError('forgotError', data.error);
    } else {
      forgotEmail = email;
      $('forgotStep1').style.display = 'none';
      $('forgotStep2').style.display = 'block';
      $('resetCode').focus();
    }
  } catch {
    showAuthError('forgotError', 'Connection error. Please try again.');
  } finally {
    $('forgotSubmit').disabled = false;
    $('forgotSubmit').textContent = 'Send Reset Code';
  }
}

async function submitResetPassword() {
  const code = $('resetCode').value.trim();
  const newPassword = $('resetNewPassword').value;
  if (!code || !newPassword) { showAuthError('resetError', 'Please enter the code and a new password'); return; }

  $('resetSubmit').disabled = true;
  $('resetSubmit').textContent = 'Resetting...';

  try {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: forgotEmail, code, newPassword })
    });
    const data = await res.json();
    if (data.error) {
      showAuthError('resetError', data.error);
    } else {
      // Success — switch to login with pre-filled email
      switchAuthForm('login');
      $('loginEmail').value = forgotEmail;
      $('loginPassword').focus();
      $('forgotStep1').style.display = 'block';
      $('forgotStep2').style.display = 'none';
      showAuthError('loginError', '');
      $('loginError').style.display = 'none';
      // Show success message briefly
      const msg = document.createElement('p');
      msg.style.cssText = 'color:#059669;text-align:center;font-size:14px;margin-bottom:10px;';
      msg.textContent = 'Password reset! Log in with your new password.';
      $('loginForm').insertBefore(msg, $('loginSubmit'));
      setTimeout(() => msg.remove(), 5000);
    }
  } catch {
    showAuthError('resetError', 'Connection error. Please try again.');
  } finally {
    $('resetSubmit').disabled = false;
    $('resetSubmit').textContent = 'Reset Password';
  }
}

async function submitSignup() {
  // Always require a validated invite code
  if (!validatedInviteCode) {
    showAuthError('signupError', 'Please enter a valid invitation code first.');
    return;
  }

  const name = $('signupName').value.trim();
  const email = $('signupEmail').value.trim();
  const password = $('signupPassword').value;
  const userType = $('signupType').value;
  const consent = $('signupConsent').checked;

  if (!name || !email || !password) { showAuthError('signupError', 'Please fill in all required fields'); return; }
  if (password.length < 6) { showAuthError('signupError', 'Password must be at least 6 characters'); return; }
  if (!email.includes('@')) { showAuthError('signupError', 'Please enter a valid email'); return; }

  try {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email, password, name, userType,
        consentGiven: consent,
        inviteCode: validatedInviteCode
      })
    });
    const data = await res.json();
    if (data.error) { showAuthError('signupError', data.error); return; }

    authToken = data.token;
    currentUser = data.user;
    localStorage.setItem('wayfinder_token', authToken);
    if (consent) localStorage.setItem('wayfinder_consent', 'true');
    engineRemaining = 3;
    validatedInviteCode = null;
    updateAuthUI();
    updateEngineUI();
    updateGreeting();
    loadChatHistory();
    closeAuthModal();

    sessionId = null;
    localStorage.removeItem('wayfinder_session');
  } catch {
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
      updateGreeting();
      fetchEngineUsage();
      loadChatHistory();
      showDavidWidget();
      // Initialize message usage counter
      if (currentUser.messageUsage) {
        updateMessageCounter(currentUser.messageUsage);
      }
    } else {
      authToken = null;
      localStorage.removeItem('wayfinder_token');
      updateAuthUI();
      updateEngineUI();
      hideDavidWidget();
    }
  } catch {
    updateAuthUI();
    hideDavidWidget();
  }
}

function updateAuthUI() {
  const isLoggedIn = currentUser && authToken;

  $('topbarAuth').style.display = isLoggedIn ? 'none' : 'flex';
  $('topbarUser').style.display = isLoggedIn ? 'flex' : 'none';

  // Hide chat input and sidebar for non-logged-in visitors
  const inputArea = document.querySelector('.input-area');
  if (inputArea) inputArea.style.display = isLoggedIn ? 'block' : 'none';
  if (sidebar) sidebar.style.display = isLoggedIn ? '' : 'none';

  if (isLoggedIn) {
    const initial = (currentUser.name || currentUser.email || 'U')[0].toUpperCase();
    $('topbarAvatar').textContent = initial;

    const displayName = currentUser.settings?.displayName || currentUser.name || 'Settings';
    $('sidebarUserName').textContent = displayName;
  }

  updateWelcomeView();
}

function checkUpgradeReturn() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('upgrade') === 'success') {
    const plan = normalizePlan(params.get('plan') || 'pro');
    const displayName = planDisplayName(plan);
    setTimeout(() => {
      alert(`Welcome to Wayfinder ${displayName}! Your plan has been upgraded. Enjoy your new tools and features.`);
    }, 1000);
    // Clean URL
    window.history.replaceState({}, '', window.location.pathname);
    // Refresh user data to get new plan
    checkAuth();
  } else if (params.get('upgrade') === 'cancelled') {
    window.history.replaceState({}, '', window.location.pathname);
  }
}

function checkConsent() {
  const consent = localStorage.getItem('wayfinder_consent');
  if (!consent && !authToken) {
    setTimeout(() => { $('consentBanner').style.display = 'flex'; }, 3000);
  }
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
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
    const safe = sanitizeUrl(url);
    return safe ? `<a href="${safe}" target="_blank" rel="noopener">${text}</a>` : text;
  });
  // Headings
  html = html.replace(/^### (.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^## (.+)$/gm, '<h3>$1</h3>');
  // Tables (pipe-delimited)
  html = html.replace(/^(\|.+\|)\n(\|[-| :]+\|)\n((?:\|.+\|\n?)+)/gm, (match, headerRow, sepRow, bodyRows) => {
    const headers = headerRow.split('|').filter(Boolean).map(h => `<th>${h.trim()}</th>`).join('');
    const rows = bodyRows.trim().split('\n').map(row => {
      const cells = row.split('|').filter(Boolean).map(c => `<td>${c.trim()}</td>`).join('');
      return `<tr>${cells}</tr>`;
    }).join('');
    return `<table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
  });
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
  // Clean up
  html = html.replace(/<p>\s*<\/p>/g, '');
  html = html.replace(/<p>(<ul>)/g, '$1');
  html = html.replace(/(<\/ul>)<\/p>/g, '$1');
  html = html.replace(/<p>(<pre>)/g, '$1');
  html = html.replace(/(<\/pre>)<\/p>/g, '$1');
  html = html.replace(/<p>(<h[34]>)/g, '$1');
  html = html.replace(/(<\/h[34]>)<\/p>/g, '$1');
  html = html.replace(/<p>(<hr>)<\/p>/g, '$1');
  html = html.replace(/<p>(<table>)/g, '$1');
  html = html.replace(/(<\/table>)<\/p>/g, '$1');

  return html;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function sanitizeUrl(url) {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') return url;
  } catch {}
  return '';
}

/**
 * Convert markdown text to safe HTML for strategy output.
 * Handles: headers, bold, italic, tables, lists, checkboxes, blockquotes, hr, code blocks.
 */
function renderMarkdownToHTML(md) {
  // Escape HTML entities first for safety
  let text = escapeHtml(md);

  // Code blocks (``` ... ```)
  text = text.replace(/```[\s\S]*?```/g, (match) => {
    const code = match.replace(/^```\w*\n?/, '').replace(/\n?```$/, '');
    return `<pre><code>${code}</code></pre>`;
  });

  // Tables: detect lines with | separators
  text = text.replace(/((?:^|\n)\|.+\|(?:\n\|.+\|)+)/g, (tableBlock) => {
    const rows = tableBlock.trim().split('\n').filter(r => r.trim());
    if (rows.length < 2) return tableBlock;

    let html = '<table>';
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i].trim();
      // Skip separator rows like |---|---|
      if (/^\|[\s\-:]+\|$/.test(row) || /^\|(\s*-+\s*\|)+$/.test(row) || /^\|[\s\-:|]+\|$/.test(row)) continue;
      const cells = row.split('|').filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
      const tag = i === 0 ? 'th' : 'td';
      html += '<tr>' + cells.map(c => `<${tag}>${c.trim()}</${tag}>`).join('') + '</tr>';
    }
    html += '</table>';
    return html;
  });

  // Process line by line for headers, lists, blockquotes, checkboxes
  const lines = text.split('\n');
  let result = [];
  let inList = false;
  let listType = '';

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Headers
    if (/^####\s/.test(line)) { closeLists(); result.push(`<h4>${line.slice(5)}</h4>`); continue; }
    if (/^###\s/.test(line)) { closeLists(); result.push(`<h3>${line.slice(4)}</h3>`); continue; }
    if (/^##\s/.test(line)) { closeLists(); result.push(`<h2>${line.slice(3)}</h2>`); continue; }
    if (/^#\s/.test(line)) { closeLists(); result.push(`<h2>${line.slice(2)}</h2>`); continue; }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) { closeLists(); result.push('<hr>'); continue; }

    // Blockquote
    if (/^&gt;\s?/.test(line)) {
      closeLists();
      const content = line.replace(/^(&gt;\s?)+/, '');
      result.push(`<blockquote>${content}</blockquote>`);
      continue;
    }

    // Checkbox items
    if (/^[-*]\s\[[ x]\]\s/.test(line)) {
      if (!inList) { result.push('<ul style="list-style:none;padding-left:0;">'); inList = true; listType = 'check'; }
      const checked = /^[-*]\s\[x\]/.test(line);
      const content = line.replace(/^[-*]\s\[[ x]\]\s/, '');
      result.push(`<li class="checklist-item"><input type="checkbox" ${checked ? 'checked' : ''} disabled> ${content}</li>`);
      continue;
    }

    // Unordered list
    if (/^[-*+]\s/.test(line)) {
      if (!inList || listType !== 'ul') { closeLists(); result.push('<ul>'); inList = true; listType = 'ul'; }
      result.push(`<li>${line.replace(/^[-*+]\s/, '')}</li>`);
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      if (!inList || listType !== 'ol') { closeLists(); result.push('<ol>'); inList = true; listType = 'ol'; }
      result.push(`<li>${line.replace(/^\d+\.\s/, '')}</li>`);
      continue;
    }

    // Empty line = paragraph break
    if (line.trim() === '') {
      closeLists();
      result.push('');
      continue;
    }

    // Regular text
    closeLists();
    result.push(line);
  }
  closeLists();

  function closeLists() {
    if (inList) {
      result.push(listType === 'ol' ? '</ol>' : '</ul>');
      inList = false;
      listType = '';
    }
  }

  // Join and wrap paragraphs
  text = result.join('\n');

  // Wrap consecutive text lines in <p> tags
  text = text.replace(/\n{2,}/g, '</p><p>');
  text = text.replace(/\n/g, '<br>');

  // Inline formatting
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Clean up empty paragraphs
  text = text.replace(/<p>\s*<\/p>/g, '');
  text = text.replace(/^<br>|<br>$/g, '');

  // Wrap in paragraph if not starting with a block element
  if (!/^<(h[1-6]|table|ul|ol|blockquote|pre|hr)/.test(text.trim())) {
    text = `<p>${text}</p>`;
  }

  return text;
}

// ========================
// Invite System
// ========================
function setupInviteListeners() {
  // Invite code validation on signup form
  const inviteInput = $('signupInviteCode');
  if (inviteInput) {
    inviteInput.addEventListener('input', debounce(validateInviteCode, 500));
    inviteInput.addEventListener('paste', () => setTimeout(() => validateInviteCode(), 100));
  }

  // Welcome screen "join with invite" link
  const joinLink = $('welcomeJoinLink');
  if (joinLink) {
    joinLink.addEventListener('click', (e) => {
      e.preventDefault();
      openAuthModal('signup');
    });
  }

  // Send invite button in settings
  const invSendBtn = $('inviteSendBtn');
  if (invSendBtn) {
    invSendBtn.addEventListener('click', sendInvite);
  }

  // Event delegation for invite actions (delete, copy link) — attached to settings modal
  // This is CSP-safe: no inline onclick needed
  const settingsModal = $('settingsModal');
  if (settingsModal) {
    settingsModal.addEventListener('click', (e) => {
      const deleteBtn = e.target.closest('[data-delete-code]');
      if (deleteBtn) {
        e.stopPropagation(); // Don't close modal
        handleDeleteInvite(deleteBtn.dataset.deleteCode);
        return;
      }
      const copyBtn = e.target.closest('[data-copy-link]');
      if (copyBtn) {
        e.stopPropagation(); // Don't close modal
        navigator.clipboard.writeText(copyBtn.dataset.copyLink).then(() => {
          copyBtn.textContent = 'Copied!';
          setTimeout(() => { copyBtn.textContent = 'Copy link'; }, 2000);
        });
        return;
      }
    });
  }

  // Splash page buttons
  const splashJoin = $('splashJoinBtn');
  if (splashJoin) splashJoin.addEventListener('click', () => openAuthModal('signup'));
  const splashLogin = $('splashLoginBtn');
  if (splashLogin) splashLogin.addEventListener('click', () => openAuthModal('login'));
}

async function validateInviteCode() {
  const input = $('signupInviteCode');
  const statusEl = $('inviteCodeStatus');
  const fieldsEl = $('signupFields');
  const code = input.value.trim().toUpperCase();

  if (!code || code.length < 4) {
    statusEl.textContent = '';
    statusEl.className = 'invite-code-status';
    fieldsEl.style.display = 'none';
    validatedInviteCode = null;
    return;
  }

  statusEl.textContent = 'Checking...';
  statusEl.className = 'invite-code-status checking';

  try {
    const res = await fetch(`${API_BASE}/invites/validate/${encodeURIComponent(code)}`);
    const data = await res.json();

    if (data.valid) {
      statusEl.textContent = '✓ Valid';
      statusEl.className = 'invite-code-status valid';
      fieldsEl.style.display = 'block';
      validatedInviteCode = code;

      // Show who invited them
      if (data.invite.inviterName) {
        const welcomeEl = $('inviteWelcome');
        const textEl = $('inviteWelcomeText');
        textEl.textContent = `Invited by ${data.invite.inviterName}`;
        welcomeEl.style.display = 'block';
      }

      // Pre-fill email if invite was sent to a specific address
      if (data.invite.recipientEmail) {
        $('signupEmail').value = data.invite.recipientEmail;
        $('signupEmail').readOnly = true;
        $('signupEmail').style.opacity = '0.7';
      } else {
        $('signupEmail').readOnly = false;
        $('signupEmail').style.opacity = '1';
      }

      // Focus the name field
      $('signupName').focus();
    } else {
      statusEl.textContent = data.error || 'Invalid code';
      statusEl.className = 'invite-code-status invalid';
      fieldsEl.style.display = 'none';
      validatedInviteCode = null;
    }
  } catch {
    statusEl.textContent = 'Could not verify';
    statusEl.className = 'invite-code-status invalid';
    fieldsEl.style.display = 'none';
    validatedInviteCode = null;
  }
}

function checkInviteCodeInURL() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('invite');
  if (code && !authToken) {
    // Open signup modal with pre-filled invite code
    openAuthModal('signup');
    $('signupInviteCode').value = code.toUpperCase();
    validateInviteCode();
    // Clean URL
    window.history.replaceState({}, '', window.location.pathname);
  }
}

async function sendInvite() {
  const emailInput = $('inviteEmailInput');
  const email = emailInput.value.trim();

  if (!email || !email.includes('@')) {
    showMsg('inviteSendMsg', 'Please enter a valid email address.', '#991b1b');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/invites/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ email })
    });

    const data = await res.json();

    if (data.error) {
      showMsg('inviteSendMsg', data.error, '#991b1b');
      return;
    }

    const appUrl = window.location.origin;
    const inviteLink = `${appUrl}/?invite=${data.invite.code}`;

    showMsg('inviteSendMsg',
      `Invitation sent to ${escapeHtml(data.invite.recipientEmail)}! <button class="invite-copy-link" data-copy-link="${escapeHtml(inviteLink)}" style="margin-left:4px;">Copy link</button>`,
      '#059669');
    emailInput.value = '';

    // Update balance
    $('inviteBalanceCount').textContent = data.remaining;

    // Refresh invite list
    loadInvitesList();
  } catch {
    showMsg('inviteSendMsg', 'Failed to send invitation.', '#991b1b');
  }
}

async function loadInvitesList() {
  if (!authToken) return;

  try {
    const res = await fetch(`${API_BASE}/invites/mine`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await res.json();

    // Update balance
    if (data.balance) {
      $('inviteBalanceCount').textContent = data.balance.remaining;
    }

    // Render invites list
    const listEl = $('invitesList');
    if (!data.invites || data.invites.length === 0) {
      listEl.innerHTML = '<p class="settings-desc">No invitations sent yet.</p>';
      return;
    }

    const appUrl = window.location.origin;
    listEl.innerHTML = data.invites.map(inv => {
      let status = '';
      let statusClass = '';
      let statusDetail = '';
      if (inv.redeemed) {
        const who = inv.redeemedByName || inv.redeemedByEmail || '';
        const when = inv.redeemedAt ? new Date(inv.redeemedAt).toLocaleDateString() : '';
        status = 'Joined';
        statusClass = 'invite-status-accepted';
        statusDetail = who ? `<span class="invite-redeemed-detail">${escapeHtml(who)}${when ? ' · ' + when : ''}</span>` : '';
      } else if (inv.expired) {
        status = 'Expired';
        statusClass = 'invite-status-expired';
      } else {
        status = 'Pending';
        statusClass = 'invite-status-pending';
      }

      const link = `${appUrl}/?invite=${inv.code}`;
      // Show delete button for non-redeemed invites (pending or expired)
      const canDelete = !inv.redeemed;

      return `
        <div class="invite-item" id="invite-${inv.code}">
          <div class="invite-item-info">
            <span class="invite-item-email">${escapeHtml(inv.recipientEmail || 'Anyone')}</span>
            <span class="invite-item-code">${inv.code}</span>
            ${statusDetail}
          </div>
          <div class="invite-item-right">
            <span class="invite-status ${statusClass}">${status}</span>
            ${!inv.redeemed && !inv.expired ? `<button class="invite-copy-link" data-copy-link="${escapeHtml(link)}">Copy link</button>` : ''}
            ${canDelete ? `<button class="invite-delete-btn" data-delete-code="${inv.code}" title="Delete invitation">✕</button>` : ''}
          </div>
        </div>
      `;
    }).join('');
  } catch {
    // Non-critical
  }
}

// Event delegation for invite list actions (CSP-safe — no inline onclick)
document.addEventListener('click', (e) => {
  // Handle copy-link buttons
  const copyBtn = e.target.closest('[data-copy-link]');
  if (copyBtn) {
    const link = copyBtn.dataset.copyLink;
    navigator.clipboard.writeText(link).then(() => {
      copyBtn.textContent = 'Copied!';
      setTimeout(() => { copyBtn.textContent = 'Copy link'; }, 2000);
    });
    return;
  }

  // Handle delete-invite buttons
  const deleteBtn = e.target.closest('[data-delete-code]');
  if (deleteBtn) {
    const code = deleteBtn.dataset.deleteCode;
    handleDeleteInvite(code);
    return;
  }
});

async function handleDeleteInvite(code) {
  if (!authToken || !code) return;

  const inviteEl = document.getElementById(`invite-${code}`);
  if (inviteEl) {
    inviteEl.style.opacity = '0.5';
  }

  try {
    const res = await fetch(`${API_BASE}/invites/${encodeURIComponent(code)}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await res.json();

    if (data.error) {
      if (inviteEl) inviteEl.style.opacity = '1';
      showMsg('inviteSendMsg', data.error, '#991b1b');
      return;
    }

    // Remove from DOM with fade animation
    if (inviteEl) {
      inviteEl.style.transition = 'opacity 0.3s, max-height 0.3s';
      inviteEl.style.opacity = '0';
      inviteEl.style.maxHeight = '0';
      inviteEl.style.overflow = 'hidden';
      setTimeout(() => inviteEl.remove(), 300);
    }

    showMsg('inviteSendMsg', 'Invitation deleted.', '#059669');

    // Refresh balance and list
    loadInvitesList();
  } catch {
    if (inviteEl) inviteEl.style.opacity = '1';
    showMsg('inviteSendMsg', 'Failed to delete invitation.', '#991b1b');
  }
}

function updateWelcomeView() {
  const splash = $('welcomeSplash');
  const loggedIn = $('welcomeLoggedIn');
  if (currentUser) {
    if (splash) splash.style.display = 'none';
    if (loggedIn) loggedIn.style.display = 'block';
  } else {
    if (splash) splash.style.display = 'block';
    if (loggedIn) loggedIn.style.display = 'none';
  }
}

// ========================
// Demographics Tool
// ========================

const RACE_COLORS = {
  white: '#3b82f6', asian: '#10b981', hispanic: '#f59e0b', black: '#8b5cf6',
  two_or_more_races: '#ec4899', nonresident_alien: '#6366f1',
  american_indian_alaska_native: '#14b8a6', native_hawaiian_pacific_islander: '#f97316', unknown: '#94a3b8'
};
const RACE_LABELS = {
  white: 'White', asian: 'Asian', black: 'Black', hispanic: 'Hispanic',
  two_or_more_races: 'Two+', nonresident_alien: 'International',
  american_indian_alaska_native: 'AIAN', native_hawaiian_pacific_islander: 'NHPI', unknown: 'Unknown'
};
const RACE_ORDER = ['white', 'asian', 'hispanic', 'black', 'two_or_more_races', 'nonresident_alien', 'american_indian_alaska_native', 'native_hawaiian_pacific_islander', 'unknown'];

let demographicsSchoolsCache = null;

function openDemographics() {
  if (!currentUser) {
    openAuthModal('login');
    return;
  }
  $('demographicsModal').style.display = 'flex';
  closeSidebarOnMobile();
  // Load school list if not cached
  if (!demographicsSchoolsCache) loadDemographicsSchools();
  initDemographicsListeners();
}

let demoListenersAttached = false;
function initDemographicsListeners() {
  if (demoListenersAttached) return;
  demoListenersAttached = true;

  $('demographicsModalClose').addEventListener('click', () => $('demographicsModal').style.display = 'none');
  $('demographicsModal').addEventListener('click', (e) => {
    if (e.target === $('demographicsModal')) $('demographicsModal').style.display = 'none';
  });

  // Search input
  $('demographicsSearchInput').addEventListener('input', debounce(async function () {
    const q = this.value.trim();
    const resultsEl = $('demographicsSearchResults');
    if (q.length < 2) { resultsEl.style.display = 'none'; return; }

    try {
      const res = await fetch(`/api/demographics/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        resultsEl.innerHTML = data.results.map(s =>
          `<div class="demographics-search-item" data-unitid="${s.unitId}">
            ${s.school}<span class="search-completions">${s.totalCompletions.toLocaleString()} graduates</span>
          </div>`
        ).join('');
        resultsEl.style.display = 'block';
      } else {
        resultsEl.innerHTML = '<div class="demographics-search-item">No schools found</div>';
        resultsEl.style.display = 'block';
      }
    } catch {
      resultsEl.style.display = 'none';
    }
  }, 250));

  // Search result click
  $('demographicsSearchResults').addEventListener('click', (e) => {
    const item = e.target.closest('.demographics-search-item');
    if (item && item.dataset.unitid) {
      loadSchoolDemographics(parseInt(item.dataset.unitid));
      $('demographicsSearchResults').style.display = 'none';
      $('demographicsSearchInput').value = item.textContent.trim().split(/\d/)[0].trim();
    }
  });

  // Quick pick chips
  $('demographicsQuickPicks').addEventListener('click', (e) => {
    const chip = e.target.closest('.demographics-chip');
    if (chip && chip.dataset.unitid) {
      // Update active state
      document.querySelectorAll('.demographics-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      loadSchoolDemographics(parseInt(chip.dataset.unitid));
      $('demographicsSearchInput').value = chip.textContent.trim();
    }
  });

  // Upgrade button in nudge
  if ($('demographicsUpgradeBtn')) {
    $('demographicsUpgradeBtn').addEventListener('click', () => {
      $('demographicsModal').style.display = 'none';
      openUpgrade();
    });
  }

  // Close search results on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.demographics-search-wrap')) {
      $('demographicsSearchResults').style.display = 'none';
    }
  });
}

async function loadDemographicsSchools() {
  try {
    const res = await fetch('/api/demographics/schools');
    const data = await res.json();
    demographicsSchoolsCache = data.schools || [];
  } catch { demographicsSchoolsCache = []; }
}

async function loadSchoolDemographics(unitId) {
  const contentEl = $('demographicsContent');
  contentEl.innerHTML = '<div class="demographics-loading"><div class="spinner"></div>Loading demographics...</div>';

  try {
    const headers = {};
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
    const res = await fetch(`/api/demographics/school/${unitId}`, { headers });
    const data = await res.json();

    if (data.error) {
      contentEl.innerHTML = `<div class="demographics-empty-state"><p>${data.error}</p></div>`;
      return;
    }

    renderSchoolDemographics(data.school, data._fullAccess);

    // Show/hide upgrade nudge
    $('demographicsUpgradeNudge').style.display = data._fullAccess ? 'none' : 'block';

  } catch (err) {
    contentEl.innerHTML = `<div class="demographics-empty-state"><p>Failed to load demographics data.</p></div>`;
  }
}

function renderSchoolDemographics(school, fullAccess) {
  const contentEl = $('demographicsContent');
  const agg = school.schoolAggregate;

  let html = `<div class="demo-school-card">`;
  html += `<div class="demo-school-name">${school.school}${school._preview ? '<span class="demo-preview-badge">Preview</span>' : ''}</div>`;
  html += `<div class="demo-school-meta">${school.year} &middot; ${(agg?.demographics?.total || 0).toLocaleString()} bachelor's completions &middot; ${school.totalMajorsWithData} majors with data</div>`;

  // Legend
  html += `<div class="demo-legend">`;
  for (const race of RACE_ORDER) {
    if ((agg?.percentages?.[race] || 0) > 0.5) {
      html += `<div class="demo-legend-item"><div class="demo-legend-swatch" style="background:${RACE_COLORS[race]}"></div>${RACE_LABELS[race]}</div>`;
    }
  }
  html += `</div>`;

  // School-wide bar chart
  if (agg && agg.percentages) {
    html += `<div class="demo-bar-chart">`;
    for (const race of RACE_ORDER) {
      const pct = agg.percentages[race] || 0;
      if (pct < 0.3) continue; // Skip negligible
      html += `<div class="demo-bar-row">
        <span class="demo-bar-label">${RACE_LABELS[race]}</span>
        <div class="demo-bar-track"><div class="demo-bar-fill ${race}" style="width:${pct}%"></div></div>
        <span class="demo-bar-value">${pct}%</span>
      </div>`;
    }
    html += `</div>`;
  }

  // Majors breakdown
  if (school.majors && school.majors.length > 0) {
    const majorCount = school.majors.length;
    const label = fullAccess ? `Demographics by Major (${majorCount})` : `Top Majors (${majorCount} of ${school.totalMajorsWithData})`;
    html += `<div class="demo-majors-header">${label}</div>`;

    for (const major of school.majors) {
      html += `<div class="demo-major-row">
        <div><div class="demo-major-name">${major.majorName}</div><div class="demo-major-total">${(major.demographics?.total || 0).toLocaleString()} graduates</div></div>
        <div class="demo-major-bars">`;

      if (major.percentages) {
        for (const race of RACE_ORDER) {
          const pct = major.percentages[race] || 0;
          if (pct < 0.5) continue;
          const count = major.demographics?.[race];
          const tooltip = count ? `${RACE_LABELS[race]}: ${count.toLocaleString()} (${pct}%)` : `${RACE_LABELS[race]}: ${pct}%`;
          html += `<div class="demo-major-segment" style="width:${pct}%;background:${RACE_COLORS[race]}" data-tooltip="${tooltip}"></div>`;
        }
      }

      // Show numerical breakdown below the bar for paid users
      if (major.demographics && Object.keys(major.demographics).length > 2) {
        html += `</div><div class="demo-major-counts">`;
        for (const race of RACE_ORDER) {
          const count = major.demographics[race];
          const pct = major.percentages?.[race] || 0;
          if (!count || count < 1) continue;
          html += `<span class="demo-count-chip" style="border-left: 3px solid ${RACE_COLORS[race]}">${RACE_LABELS[race]}: ${count.toLocaleString()} <small>(${pct}%)</small></span>`;
        }
        html += `</div></div>`;
      } else {
        html += `</div></div>`;
      }
    }

    // Preview message
    if (school._previewMessage) {
      html += `<div style="text-align:center;padding:12px 0;color:#94a3b8;font-size:13px;">${school._previewMessage}</div>`;
    }
  }

  html += `</div>`;
  contentEl.innerHTML = html;
}

// ========================
// Utility
// ========================
function showMsg(id, text, color) {
  const el = $(id);
  el.innerHTML = text;
  el.style.color = color;
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 5000);
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function closeSidebarOnMobile() {
  if (window.innerWidth <= 768) {
    sidebar.classList.add('collapsed');
    const bd = document.querySelector('.sidebar-backdrop');
    if (bd) bd.classList.remove('visible');
  }
}

function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// ========================
// Tool Listeners (v2)
// ========================
function setupToolListeners() {
  // Sidebar tool buttons
  $('sidebarTimeline').addEventListener('click', openTimeline);
  $('sidebarEssays').addEventListener('click', openEssays);
  $('sidebarInternships').addEventListener('click', openInternships);
  $('sidebarScholarships').addEventListener('click', openScholarships);
  $('sidebarPrograms').addEventListener('click', openPrograms);
  $('sidebarFinancialAid').addEventListener('click', openFinancialAid);

  // Modal close handlers
  setupModalClose('timelineModal', 'timelineModalClose');
  // Essays use full-page view now (no modal)
  setupModalClose('internshipsModal', 'internshipsModalClose');
  setupModalClose('scholarshipsModal', 'scholarshipsModalClose');
  setupModalClose('programsModal', 'programsModalClose');
  setupModalClose('financialAidModal', 'financialAidModalClose');

  // Upgrade gate buttons
  const upgradeGateBtns = ['timelineUpgradeBtn', 'internshipsUpgradeBtn', 'scholarshipsUpgradeBtn', 'programsUpgradeBtn', 'financialAidUpgradeBtn'];
  for (const id of upgradeGateBtns) {
    const el = $(id);
    if (el) el.addEventListener('click', () => {
      document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = 'none');
      openUpgrade();
    });
  }

  // Timeline
  if ($('timelineSaveProfile')) $('timelineSaveProfile').addEventListener('click', saveTimelineProfile);

  // Essays — listeners handled inside setupEssayView() for the full-page view

  // Internships search
  if ($('internshipSearchBtn')) $('internshipSearchBtn').addEventListener('click', searchInternships);

  // Scholarships search + filter auto-search
  if ($('scholarshipSearchBtn')) $('scholarshipSearchBtn').addEventListener('click', searchScholarships);
  ['scholarshipScope', 'scholarshipCategory', 'scholarshipState', 'scholarshipAmount', 'scholarshipFormat'].forEach(id => {
    if ($(id)) $(id).addEventListener('change', searchScholarships);
  });

  // Programs search
  if ($('programSearchBtn')) $('programSearchBtn').addEventListener('click', searchPrograms);

  // Financial Aid tab buttons
  document.querySelectorAll('.finaid-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchFinaidTab(btn.dataset.finaidTab));
  });

  // Financial Aid search (button + Enter key)
  if ($('finaidSearchBtn')) $('finaidSearchBtn').addEventListener('click', searchFinancialAid);
  if ($('finaidSearch')) $('finaidSearch').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); searchFinancialAid(); }
  });

  // Grants state change + filter toggle
  if ($('grantsState')) $('grantsState').addEventListener('change', searchStateGrants);
  document.querySelectorAll('.grants-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.grants-toggle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyGrantsFilter(btn.dataset.grantsFilter);
    });
  });

  // School picker
  initSchoolPicker();

  // Strategy button
  if ($('strategyBtn')) $('strategyBtn').addEventListener('click', generateMyStrategy);

  // SAI Calculator
  if ($('saiQuickBtn')) $('saiQuickBtn').addEventListener('click', calculateSAIQuick);
  if ($('saiDetailedBtn')) $('saiDetailedBtn').addEventListener('click', calculateSAIDetailed);
  document.querySelectorAll('.sai-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => switchSAIMode(btn.dataset.saiMode));
  });
}

// ─── School Picker ────────────────────────────────────────────
let schoolPickerData = [];
let selectedSchools = [];

async function initSchoolPicker() {
  const input = $('schoolPickerSearch');
  if (!input) return;

  // Load school list from API
  try {
    const res = await fetch(`${API_BASE}/financial-aid/schools?limit=500`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (res.ok) {
      const data = await res.json();
      schoolPickerData = (data.results || []).map(s => ({ id: s.id, name: s.name, type: s.type, state: s.state }));
    }
  } catch { /* use empty list if API fails */ }

  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    const dropdown = $('schoolPickerDropdown');
    if (query.length < 2) { dropdown.style.display = 'none'; return; }

    const matches = schoolPickerData
      .filter(s => !selectedSchools.find(sel => sel.id === s.id))
      .filter(s => s.name.toLowerCase().includes(query))
      .slice(0, 15);

    if (matches.length === 0) {
      dropdown.innerHTML = '<div class="school-picker-option" style="color:#94a3b8;">No matches found</div>';
    } else {
      dropdown.innerHTML = matches.map(s =>
        `<div class="school-picker-option" data-school-id="${s.id}" data-school-name="${escapeHtml(s.name)}">
          <span>${escapeHtml(s.name)}</span>
          <span class="school-type">${s.type || ''} ${s.state || ''}</span>
        </div>`
      ).join('');
    }
    dropdown.style.display = 'block';
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') $('schoolPickerDropdown').style.display = 'none';
  });

  $('schoolPickerDropdown').addEventListener('click', (e) => {
    const opt = e.target.closest('.school-picker-option');
    if (!opt || !opt.dataset.schoolId) return;
    if (selectedSchools.length >= 10) return;
    selectedSchools.push({ id: opt.dataset.schoolId, name: opt.dataset.schoolName });
    input.value = '';
    $('schoolPickerDropdown').style.display = 'none';
    renderSelectedSchools();
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#schoolPickerContainer')) {
      $('schoolPickerDropdown').style.display = 'none';
    }
  });
}

function renderSelectedSchools() {
  const container = $('schoolPickerSelected');
  container.innerHTML = selectedSchools.map((s, i) =>
    `<span class="school-picker-chip">${escapeHtml(s.name)}<button onclick="removeSchoolPick(${i})">&times;</button></span>`
  ).join('');
  // Update hidden input
  $('strategySchools').value = selectedSchools.map(s => s.name).join(', ');
}

function removeSchoolPick(index) {
  selectedSchools.splice(index, 1);
  renderSelectedSchools();
}

// ─── Grants Filter Toggle ─────────────────────────────────────
function applyGrantsFilter(filter) {
  const results = $('grantsResults');
  if (!results) return;
  const federalSections = results.querySelectorAll('[data-grant-type="federal"]');
  const stateSections = results.querySelectorAll('[data-grant-type="state"]');

  federalSections.forEach(el => el.style.display = (filter === 'state') ? 'none' : '');
  stateSections.forEach(el => el.style.display = (filter === 'federal') ? 'none' : '');
}

// ─── SAI Calculator ──────────────────────────────────────────
function switchSAIMode(mode) {
  document.querySelectorAll('.sai-mode-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`[data-sai-mode="${mode}"]`)?.classList.add('active');
  if ($('saiQuickForm')) $('saiQuickForm').style.display = mode === 'quick' ? 'block' : 'none';
  if ($('saiDetailedForm')) $('saiDetailedForm').style.display = mode === 'detailed' ? 'block' : 'none';
}

async function calculateSAIQuick() {
  const income = parseFloat($('saiQuickIncome')?.value) || 0;
  const assets = parseFloat($('saiQuickAssets')?.value) || 0;
  const familySize = parseInt($('saiQuickFamilySize')?.value) || 4;
  const state = $('saiQuickState')?.value || '';
  const filing = $('saiQuickFiling')?.value || 'married';

  if (!income && !assets) {
    $('saiResults').style.display = 'block';
    $('saiResults').innerHTML = '<div class="sai-tip tip-warning"><span class="sai-tip-icon">!</span><span>Please enter your household income or assets to calculate.</span></div>';
    return;
  }

  await runSAICalculation({
    mode: 'quick',
    householdIncome: income,
    parentAssets: assets,
    familySize,
    state,
    filingStatus: filing
  });
}

async function calculateSAIDetailed() {
  const parentAGI = parseFloat($('saiParentAGI')?.value) || 0;
  const incomeTax = parseFloat($('saiParentIncomeTax')?.value) || 0;
  const untaxedIncome = parseFloat($('saiParentUntaxedIncome')?.value) || 0;
  const parentAssets = parseFloat($('saiParentAssets')?.value) || 0;
  const parent1Income = parseFloat($('saiParent1Income')?.value) || 0;
  const parent2Income = parseFloat($('saiParent2Income')?.value) || 0;
  const familySize = parseInt($('saiDetailedFamilySize')?.value) || 4;
  const state = $('saiDetailedState')?.value || '';
  const filing = $('saiDetailedFiling')?.value || 'married';
  const studentIncome = parseFloat($('saiStudentIncome')?.value) || 0;
  const studentAssets = parseFloat($('saiStudentAssets')?.value) || 0;

  if (!parentAGI && !parent1Income) {
    $('saiResults').style.display = 'block';
    $('saiResults').innerHTML = '<div class="sai-tip tip-warning"><span class="sai-tip-icon">!</span><span>Please enter parent income information to calculate.</span></div>';
    return;
  }

  await runSAICalculation({
    mode: 'detailed',
    parentAGI,
    parentIncomeTax: incomeTax,
    parentUntaxedIncome: untaxedIncome,
    parentAssets,
    parent1Income,
    parent2Income,
    familySize,
    state,
    filingStatus: filing,
    studentIncome,
    studentAssets
  });
}

async function runSAICalculation(payload) {
  $('saiLoading').style.display = 'flex';
  $('saiResults').style.display = 'none';
  $('saiResults').innerHTML = '';

  try {
    const res = await fetch(`${API_BASE}/financial-aid/calculate-sai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Calculation failed');
    }

    const data = await res.json();
    renderSAIResults(data);
  } catch (err) {
    $('saiResults').style.display = 'block';
    $('saiResults').innerHTML = `<div class="sai-tip tip-warning"><span class="sai-tip-icon">!</span><span>Error: ${escapeHtml(err.message)}</span></div>`;
  } finally {
    $('saiLoading').style.display = 'none';
  }
}

function renderSAIResults(data) {
  const r = data;
  const sai = r.sai;
  const pell = r.pellGrant || 0;
  const steps = r.steps || [];
  const warnings = r.warnings || [];
  const tips = r.tips || [];
  const context = r.context || {};

  // Determine SAI color class
  let colorClass = 'sai-very-high';
  if (sai <= -1500) colorClass = 'sai-negative';
  else if (sai <= 0) colorClass = 'sai-negative';
  else if (sai <= 6000) colorClass = 'sai-low';
  else if (sai <= 20000) colorClass = 'sai-medium';
  else if (sai <= 40000) colorClass = 'sai-high';

  // SAI meaning
  let meaning = '';
  if (sai <= -1500) meaning = 'Maximum financial need. You qualify for the full Pell Grant and likely significant institutional aid.';
  else if (sai <= 0) meaning = 'Very high financial need. You qualify for a full Pell Grant and strong federal aid.';
  else if (sai <= 6000) meaning = 'High financial need. You qualify for a partial Pell Grant and substantial aid.';
  else if (sai <= 15000) meaning = 'Moderate financial need. You may qualify for need-based institutional grants at many schools.';
  else if (sai <= 30000) meaning = 'Some financial need demonstrated. You will likely need a mix of merit scholarships and loans.';
  else meaning = 'Lower demonstrated need on FAFSA. Focus on merit scholarships, institutional aid, and school-specific net price calculators.';

  // Pell badge
  let pellBadgeClass = 'pell-none';
  let pellBadgeText = 'Not Pell Eligible';
  if (pell >= 7000) { pellBadgeClass = 'pell-full'; pellBadgeText = `Full Pell Grant: ${fmtDollar(pell)}`; }
  else if (pell > 0) { pellBadgeClass = 'pell-partial'; pellBadgeText = `Partial Pell Grant: ${fmtDollar(pell)}`; }

  // Build steps HTML
  let stepsHTML = '';
  if (steps.length > 0) {
    stepsHTML = steps.map(s => {
      const val = typeof s.value === 'number' ? fmtDollar(s.value) : String(s.value || '');
      const valClass = typeof s.value === 'number' ? (s.value < 0 ? 'negative' : (s.value > 0 ? 'positive' : '')) : '';
      if (s.label === '---') return '<hr class="sai-step-separator">';
      return `<div class="sai-step"><span class="sai-step-label">${escapeHtml(s.label)}</span><span class="sai-step-value ${valClass}">${val}</span></div>`;
    }).join('');
  }

  // Build tips HTML
  let tipsHTML = '';
  if (tips.length > 0 || warnings.length > 0) {
    const allTips = [
      ...warnings.map(w => ({ text: w, type: 'warning' })),
      ...tips.map(t => ({ text: t, type: 'info' }))
    ];
    tipsHTML = '<div class="sai-tips">' + allTips.map(t => {
      const icon = t.type === 'warning' ? '!' : (t.type === 'success' ? '\u2713' : '\u2139');
      return `<div class="sai-tip tip-${t.type}"><span class="sai-tip-icon">${icon}</span><span>${escapeHtml(t.text)}</span></div>`;
    }).join('') + '</div>';
  }

  // Context info
  let contextHTML = '';
  if (context.subsidizedLoan) {
    contextHTML += `<div class="sai-tip tip-info"><span class="sai-tip-icon">\u2139</span><span><strong>Subsidized Loan Eligibility:</strong> Up to ${fmtDollar(context.subsidizedLoan.maxAmount || 3500)} (first-year dependent student). The government pays interest while enrolled.</span></div>`;
  }

  const html = `
    <div class="sai-score-hero">
      <div class="sai-score-number ${colorClass}">${sai < 0 ? '-$' : '$'}${Math.abs(sai).toLocaleString()}</div>
      <div class="sai-score-details">
        <div class="sai-score-label">Your Estimated Student Aid Index (SAI)</div>
        <div class="sai-score-meaning">${meaning}</div>
        <div class="sai-pell-badge ${pellBadgeClass}">${pellBadgeText}</div>
      </div>
    </div>

    ${tipsHTML}
    ${contextHTML}

    ${stepsHTML ? `
      <div class="sai-breakdown">
        <div class="sai-breakdown-title" onclick="toggleSAIBreakdown()">
          <span class="sai-chevron open" id="saiChevron">&#9654;</span>
          Calculation Breakdown
        </div>
        <div id="saiStepsContainer" class="sai-steps">${stepsHTML}</div>
      </div>
    ` : ''}

    <div class="sai-disclaimer">
      <strong>Disclaimer:</strong> This is an estimate based on the 2025-26 FAFSA Simplification Act formula for dependent students (Formula A). Actual SAI may vary based on additional FAFSA questions and verification. Use your school's Net Price Calculator for institution-specific estimates. The official FAFSA at <a href="https://studentaid.gov" target="_blank" style="color:#60a5fa;">studentaid.gov</a> is the only way to get your actual SAI.
    </div>
  `;

  $('saiResults').innerHTML = html;
  $('saiResults').style.display = 'block';
  $('saiResults').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function toggleSAIBreakdown() {
  const container = $('saiStepsContainer');
  const chevron = $('saiChevron');
  if (!container) return;
  if (container.style.display === 'none') {
    container.style.display = 'flex';
    if (chevron) chevron.classList.add('open');
  } else {
    container.style.display = 'none';
    if (chevron) chevron.classList.remove('open');
  }
}

function fmtDollar(num) {
  if (typeof num !== 'number' || isNaN(num)) return '$0';
  const sign = num < 0 ? '-' : '';
  return sign + '$' + Math.abs(Math.round(num)).toLocaleString();
}

function setupModalClose(modalId, closeId) {
  $(closeId).addEventListener('click', () => $(modalId).style.display = 'none');
  $(modalId).addEventListener('click', (e) => {
    if (e.target === $(modalId)) $(modalId).style.display = 'none';
  });
}

function userPlan() {
  return normalizePlan(currentUser?.plan);
}

function canAccess(feature) {
  // Admin always has full access
  if (currentUser?.isAdmin) return true;
  const plan = userPlan();
  const access = {
    admissions_timeline: ['pro', 'elite'],
    essay_reviewer: ['pro', 'elite'],
    internships_preview: ['pro', 'elite'],
    internships_full: ['elite'],
    scholarships_preview: ['pro'],
    scholarships: ['elite'],
    programs_preview: ['pro'],
    programs: ['elite'],
    financial_aid_preview: ['pro', 'elite'],
    financial_aid: ['elite'],
  };
  return (access[feature] || []).includes(plan);
}

// ========================
// Timeline Tool
// ========================
function openTimeline() {
  if (!currentUser) { openAuthModal('login'); return; }
  closeSidebarOnMobile();
  $('timelineModal').style.display = 'flex';

  if (!canAccess('admissions_timeline')) {
    $('timelineSetup').style.display = 'none';
    $('timelineContent').style.display = 'none';
    $('timelineLoading').style.display = 'none';
    $('timelineRequiresUpgrade').style.display = 'block';
    return;
  }

  $('timelineRequiresUpgrade').style.display = 'none';
  loadTimelineProfile();
}

async function loadTimelineProfile() {
  $('timelineLoading').style.display = 'flex';
  $('timelineSetup').style.display = 'none';
  $('timelineContent').style.display = 'none';

  try {
    const res = await fetch(`${API_BASE}/timeline/profile`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await res.json();

    if (data.profile?.graduationYear) {
      // Has profile, load events
      loadTimelineEvents();
    } else {
      $('timelineLoading').style.display = 'none';
      $('timelineSetup').style.display = 'block';
    }
  } catch {
    $('timelineLoading').style.display = 'none';
    $('timelineSetup').style.display = 'block';
  }
}

async function saveTimelineProfile() {
  const gradYear = $('timelineGradYear').value;
  const schoolsRaw = $('timelineSchools').value;
  const majorsRaw = $('timelineMajors').value;
  const state = $('timelineState').value.trim().toUpperCase();

  if (!gradYear) { showMsg('timelineSetupMsg', 'Please select a graduation year.', '#991b1b'); return; }

  const targetSchools = schoolsRaw.split(',').map(s => s.trim()).filter(Boolean).map(name => ({ name }));
  const intendedMajors = majorsRaw.split(',').map(m => m.trim()).filter(Boolean);

  try {
    const res = await fetch(`${API_BASE}/timeline/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
      body: JSON.stringify({ graduationYear: parseInt(gradYear), targetSchools, intendedMajors, state })
    });
    const data = await res.json();
    if (data.error) { showMsg('timelineSetupMsg', data.error, '#991b1b'); return; }

    showMsg('timelineSetupMsg', 'Profile saved!', '#059669');
    loadTimelineEvents();
  } catch {
    showMsg('timelineSetupMsg', 'Failed to save profile.', '#991b1b');
  }
}

async function loadTimelineEvents() {
  $('timelineLoading').style.display = 'flex';
  $('timelineSetup').style.display = 'none';
  $('timelineContent').style.display = 'none';

  try {
    const [eventsRes, upcomingRes] = await Promise.all([
      fetch(`${API_BASE}/timeline/events`, { headers: { 'Authorization': `Bearer ${authToken}` } }),
      fetch(`${API_BASE}/timeline/upcoming`, { headers: { 'Authorization': `Bearer ${authToken}` } })
    ]);
    const eventsData = await eventsRes.json();
    const upcomingData = await upcomingRes.json();

    $('timelineLoading').style.display = 'none';
    $('timelineContent').style.display = 'block';

    renderTimelineUpcoming(upcomingData.events || []);
    renderTimelineEvents(eventsData.events || []);
  } catch {
    $('timelineLoading').style.display = 'none';
    $('timelineContent').style.display = 'block';
    $('timelineEvents').innerHTML = '<p style="color:#94a3b8;text-align:center;">Failed to load timeline events.</p>';
  }
}

function renderTimelineUpcoming(events) {
  const el = $('timelineUpcoming');
  if (!events.length) { el.innerHTML = '<p style="color:#94a3b8;padding:12px;">No upcoming events in the next 14 days.</p>'; return; }

  el.innerHTML = `<div class="upcoming-header">Coming Up</div>` +
    events.map(e => {
      const urgencyClass = e.daysUntil <= 1 ? 'urgent' : (e.daysUntil <= 3 ? 'soon' : '');
      return `<div class="upcoming-item ${urgencyClass}">
        <div class="upcoming-date">${e.date}</div>
        <div class="upcoming-label">${escapeHtml(e.label)}</div>
        <div class="upcoming-days">${e.daysUntil === 0 ? 'Today' : `${e.daysUntil}d`}</div>
      </div>`;
    }).join('');
}

function renderTimelineEvents(events) {
  const el = $('timelineEvents');
  if (!events.length) { el.innerHTML = '<p style="color:#94a3b8;text-align:center;">No timeline events yet. Set up your profile to get started.</p>'; return; }

  // Group by month
  const grouped = {};
  for (const e of events) {
    const month = e.date ? e.date.slice(0, 7) : 'undated';
    if (!grouped[month]) grouped[month] = [];
    grouped[month].push(e);
  }

  let html = '';
  for (const [month, items] of Object.entries(grouped)) {
    const monthLabel = month === 'undated' ? 'Ongoing' : new Date(month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    html += `<div class="timeline-month">
      <div class="timeline-month-label">${monthLabel}</div>
      ${items.map(e => `<div class="timeline-event ${e.category || ''}">
        <div class="timeline-event-dot"></div>
        <div class="timeline-event-body">
          <div class="timeline-event-label">${escapeHtml(e.label)}</div>
          <div class="timeline-event-date">${e.date || ''} ${e.source ? `&middot; ${e.source}` : ''}</div>
        </div>
      </div>`).join('')}
    </div>`;
  }
  el.innerHTML = html;
}

// ========================
// Essay Reviewer Tool
// ========================
// ─── Word Limits by Essay Type ───────────────────────────────
const ESSAY_WORD_LIMITS = {
  'common-app': { limit: 650, label: 'Common App max: 650 words' },
  'supplemental': { limit: 400, label: 'Typical max: ~400 words' },
  'why-school': { limit: 400, label: 'Typical max: ~400 words' },
  'diversity': { limit: 650, label: 'Typical max: ~650 words' },
  'activity': { limit: 150, label: 'Common App activity: 150 words' },
  'community': { limit: 400, label: 'Typical max: ~400 words' },
  'challenge': { limit: 650, label: 'Typical max: ~650 words' },
  'other': { limit: 0, label: '' }
};

let evInitialized = false;

function openEssays() {
  if (!currentUser) { openAuthModal('login'); return; }
  closeSidebarOnMobile();

  // Hide chat, show essay full-page view
  document.querySelector('.chat-container').style.display = 'none';
  $('essayView').style.display = 'flex';

  if (!evInitialized) {
    setupEssayView();
    evInitialized = true;
  }

  const hasAccess = canAccess('essay_reviewer');

  if (!hasAccess) {
    // Hide all panels, show upgrade gate
    document.querySelectorAll('.ev-panel').forEach(p => p.style.display = 'none');
    $('evNav').style.display = 'none';
    $('evCreditsBar').style.display = 'none';
    $('evUpgradeGate').style.display = 'flex';
  } else {
    $('evUpgradeGate').style.display = 'none';
    $('evNav').style.display = 'flex';
    $('evCreditsBar').style.display = 'flex';
    switchEvTab('compose');
    loadEssayCredits();
    loadEssayPrompts();
  }
}

function closeEssays() {
  $('essayView').style.display = 'none';
  document.querySelector('.chat-container').style.display = '';
}

function setupEssayView() {
  // Back button
  $('essayBackBtn').addEventListener('click', closeEssays);

  // Nav tabs
  document.querySelectorAll('.ev-nav-tab').forEach(tab => {
    tab.addEventListener('click', () => switchEvTab(tab.dataset.tab));
  });

  // Submit button
  $('evSubmitBtn').addEventListener('click', submitEssayReview);

  // Buy credits
  $('evBuyMoreBtn').addEventListener('click', () => handleEssayPurchase('standard'));

  // Upgrade button
  const upgradeBtn = $('evUpgradeBtn');
  if (upgradeBtn) upgradeBtn.addEventListener('click', () => { closeEssays(); openUpgrade(); });

  // Essay type change → update word limit
  $('evEssayType').addEventListener('change', updateWordLimit);

  // Textarea input → update word/char counts
  $('evEssayText').addEventListener('input', updateEssayCounts);

  // History filter
  const histFilter = $('evHistoryTypeFilter');
  if (histFilter) histFilter.addEventListener('change', () => loadEssayHistory());

  // Tracker filter
  const trackFilter = $('evTrackerTypeFilter');
  if (trackFilter) trackFilter.addEventListener('change', () => {
    const type = trackFilter.value;
    if (type) loadScoreProgression(type);
  });

  // Init word limit display
  updateWordLimit();

  // Essay pane resizer
  setupEvResizer();
}

function setupEvResizer() {
  const resizer = $('evResizer');
  if (!resizer) return;
  const split = resizer.closest('.ev-split');
  if (!split) return;

  let dragging = false;
  let startX = 0;
  let startLeftW = 0;

  resizer.addEventListener('mousedown', (e) => {
    e.preventDefault();
    dragging = true;
    startX = e.clientX;
    const leftPane = split.querySelector('.ev-input-pane');
    startLeftW = leftPane.getBoundingClientRect().width;
    resizer.classList.add('dragging');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  });

  document.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const totalW = split.getBoundingClientRect().width - 6; // minus resizer width
    const newLeftW = Math.max(200, Math.min(totalW - 200, startLeftW + dx));
    const leftFr = newLeftW / totalW;
    const rightFr = 1 - leftFr;
    split.style.gridTemplateColumns = `${leftFr}fr 6px ${rightFr}fr`;
  });

  document.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    resizer.classList.remove('dragging');
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  });

  // Touch support for mobile/tablet
  resizer.addEventListener('touchstart', (e) => {
    e.preventDefault();
    dragging = true;
    startX = e.touches[0].clientX;
    const leftPane = split.querySelector('.ev-input-pane');
    startLeftW = leftPane.getBoundingClientRect().width;
    resizer.classList.add('dragging');
  });

  document.addEventListener('touchmove', (e) => {
    if (!dragging) return;
    const dx = e.touches[0].clientX - startX;
    const totalW = split.getBoundingClientRect().width - 6;
    const newLeftW = Math.max(200, Math.min(totalW - 200, startLeftW + dx));
    const leftFr = newLeftW / totalW;
    const rightFr = 1 - leftFr;
    split.style.gridTemplateColumns = `${leftFr}fr 6px ${rightFr}fr`;
  });

  document.addEventListener('touchend', () => {
    if (!dragging) return;
    dragging = false;
    resizer.classList.remove('dragging');
  });
}

function switchEvTab(tabName) {
  document.querySelectorAll('.ev-nav-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.ev-panel').forEach(p => p.style.display = 'none');

  const tab = document.querySelector(`.ev-nav-tab[data-tab="${tabName}"]`);
  if (tab) tab.classList.add('active');

  if (tabName === 'compose') {
    $('evComposePanel').style.display = 'block';
  } else if (tabName === 'history') {
    $('evHistoryPanel').style.display = 'block';
    loadEssayHistory();
  } else if (tabName === 'tracker') {
    $('evTrackerPanel').style.display = 'block';
  }
}

function updateWordLimit() {
  const type = $('evEssayType').value;
  const info = ESSAY_WORD_LIMITS[type] || ESSAY_WORD_LIMITS.other;
  const limitEl = $('evWordLimit');
  if (info.limit > 0) {
    limitEl.textContent = info.label;
    limitEl.style.display = '';
  } else {
    limitEl.textContent = '';
    limitEl.style.display = 'none';
  }
  // Re-check if over limit
  updateEssayCounts();
}

function updateEssayCounts() {
  const text = $('evEssayText').value;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;

  $('evWordCount').textContent = `${words} words`;
  $('evCharCount').textContent = `${chars} / 15,000 characters`;

  const type = $('evEssayType').value;
  const info = ESSAY_WORD_LIMITS[type] || ESSAY_WORD_LIMITS.other;
  const limitEl = $('evWordLimit');

  if (info.limit > 0) {
    if (words > info.limit) {
      limitEl.className = 'ev-word-limit over-limit';
      limitEl.textContent = `${words - info.limit} words over limit!`;
    } else if (words > info.limit * 0.9) {
      limitEl.className = 'ev-word-limit near-limit';
      limitEl.textContent = `${info.limit - words} words remaining`;
    } else {
      limitEl.className = 'ev-word-limit';
      limitEl.textContent = info.label;
    }
  }
}

async function loadEssayCredits() {
  try {
    const res = await fetch(`${API_BASE}/essays/credits`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await res.json();
    const credits = data.credits ?? data.remaining ?? 0;
    $('evCreditsCount').textContent = `${credits} reviews`;
    $('evSubmitBtn').disabled = credits === 0;
  } catch {}
}

let evPromptsLoaded = false;
async function loadEssayPrompts() {
  if (evPromptsLoaded) return;
  try {
    const res = await fetch(`${API_BASE}/essays/prompts`);
    const prompts = await res.json();

    const categorySelect = $('evPromptCategory');
    const promptSelect = $('evPromptSelect');
    const promptSelectGroup = $('evPromptSelectGroup');

    categorySelect.innerHTML = '<option value="">Choose a prompt set...</option>';
    Object.keys(prompts).forEach(key => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = prompts[key].label;
      categorySelect.appendChild(option);
    });

    categorySelect.addEventListener('change', (e) => {
      const selectedKey = e.target.value;
      if (!selectedKey) {
        promptSelectGroup.style.display = 'none';
        promptSelect.innerHTML = '<option value="">Choose a specific prompt...</option>';
        return;
      }

      const category = prompts[selectedKey];
      promptSelect.innerHTML = '<option value="">Choose a specific prompt...</option>';
      category.prompts.forEach(p => {
        const option = document.createElement('option');
        option.value = p.text;
        option.textContent = p.text.substring(0, 60) + (p.text.length > 60 ? '...' : '');
        option.dataset.fullText = p.text;
        option.dataset.essayType = mapPromptToEssayType(selectedKey, p.id);
        promptSelect.appendChild(option);
      });
      promptSelectGroup.style.display = 'block';
    });

    promptSelect.addEventListener('change', (e) => {
      if (e.target.value) {
        const selectedOption = e.target.options[e.target.selectedIndex];
        const fullText = selectedOption.dataset.fullText || e.target.value;
        const essayType = selectedOption.dataset.essayType;
        $('evPrompt').value = fullText;
        if (essayType && essayType !== 'other') {
          $('evEssayType').value = essayType;
          updateWordLimit();
        }
      }
    });
    evPromptsLoaded = true;
  } catch (err) {
    console.error('Failed to load essay prompts:', err);
  }
}

function mapPromptToEssayType(category, promptId) {
  // Auto-select essay type based on prompt source
  if (category === 'commonApp2025') {
    return 'common-app';
  } else if (category === 'ucPIQ') {
    return 'other'; // UC essays are varied
  } else if (category === 'coalition') {
    return 'supplemental';
  } else if (category === 'supplements') {
    // Map supplement types based on prompt ID
    if (promptId === 'sup-why') return 'why-school';
    if (promptId === 'sup-diversity') return 'diversity';
    if (promptId === 'sup-activity') return 'activity';
    if (promptId === 'sup-community') return 'community';
    return 'supplemental';
  }
  return 'other';
}

async function submitEssayReview() {
  const essayText = $('evEssayText').value.trim();
  const essayType = $('evEssayType').value;
  const targetSchool = $('evTargetSchool').value.trim();
  const prompt = $('evPrompt').value.trim();

  if (essayText.length < 50) { showMsg('evSubmitMsg', 'Essay must be at least 50 characters.', '#991b1b'); return; }

  $('evSubmitBtn').disabled = true;
  $('evSubmitBtn').textContent = 'Reviewing...';

  try {
    const res = await fetch(`${API_BASE}/essays/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
      body: JSON.stringify({ essayText, essayType, targetSchool, prompt })
    });
    const data = await res.json();

    if (data.error) {
      showMsg('evSubmitMsg', data.error, '#991b1b');
      $('evSubmitBtn').disabled = false;
      $('evSubmitBtn').textContent = 'Submit for Review (1 credit)';
      return;
    }

    // Show result
    renderEssayReview(data.review);
    loadEssayCredits();
    $('evSubmitBtn').textContent = 'Submit for Review (1 credit)';
    $('evSubmitBtn').disabled = false;
  } catch {
    showMsg('evSubmitMsg', 'Failed to submit essay.', '#991b1b');
    $('evSubmitBtn').disabled = false;
    $('evSubmitBtn').textContent = 'Submit for Review (1 credit)';
  }
}

function renderEssayReview(review) {
  const el = $('evReviewResult');
  const r = review;

  let html = `<div class="essay-result-card">`;

  // Score section with gauge, label, word count, reading level
  const scoreClass = r.overallScore >= 8 ? 'score-high' : (r.overallScore >= 5 ? 'score-mid' : 'score-low');
  const scorePercent = (r.overallScore / 10) * 100;
  html += `<div class="essay-score-section">
    <div class="essay-score-gauge" style="--score-percent: ${scorePercent}%">
      <div class="essay-score-num">${r.overallScore}</div>
    </div>
    <div class="essay-score-details">
      <div class="essay-score-label">${escapeHtml(r.scoreLabel || 'Assessment')}</div>
      ${r.wordCount ? `<div class="essay-meta">Word count: ${r.wordCount}</div>` : ''}
      ${r.readingLevel ? `<div class="essay-meta">Reading level: ${escapeHtml(r.readingLevel)}</div>` : ''}
    </div>
  </div>`;

  // Top Priority callout (if exists)
  if (r.topPriority) {
    html += `<div class="essay-top-priority">
      <div class="essay-priority-icon">🎯</div>
      <div class="essay-priority-content">
        <div class="essay-priority-title">Top Priority</div>
        <div class="essay-priority-text">${escapeHtml(r.topPriority)}</div>
      </div>
    </div>`;
  }

  // Summary section
  if (r.summary) {
    html += `<div class="essay-summary-callout">
      <div class="essay-summary-text">${escapeHtml(r.summary)}</div>
    </div>`;
  }

  // Voice Assessment with notes
  if (r.voiceAssessment) {
    html += `<div class="essay-section">
      <h4 class="essay-section-header">Voice Assessment</h4>
      <div class="essay-voice">
        <span class="voice-badge ${r.voiceAssessment.authentic ? 'authentic' : 'concern'}">
          ${r.voiceAssessment.authentic ? '✓ Authentic voice' : '⚠ Voice concerns'}
        </span>
        ${r.voiceAssessment.sounds_like_teenager !== undefined ? `<span class="voice-badge ${r.voiceAssessment.sounds_like_teenager ? 'authentic' : 'concern'}">
          ${r.voiceAssessment.sounds_like_teenager ? '✓ Age-appropriate' : '⚠ Sounds too polished'}
        </span>` : ''}
      </div>
      ${r.voiceAssessment.notes ? `<div class="essay-voice-notes">${escapeHtml(r.voiceAssessment.notes)}</div>` : ''}
    </div>`;
  }

  // Admissions Impact section
  if (r.admissionsImpact) {
    const impact = r.admissionsImpact;
    const levelToColor = (lvl) => {
      if (lvl === 'high') return 'impact-high';
      if (lvl === 'medium') return 'impact-medium';
      return 'impact-low';
    };
    html += `<div class="essay-section">
      <h4 class="essay-section-header">Admissions Impact</h4>
      <div class="essay-impact-row">
        <div class="essay-impact-metric">
          <div class="essay-impact-label">Memorability</div>
          <span class="essay-impact-level ${levelToColor(impact.memorability)}">${escapeHtml(impact.memorability || 'N/A')}</span>
        </div>
        <div class="essay-impact-metric">
          <div class="essay-impact-label">Distinctiveness</div>
          <span class="essay-impact-level ${levelToColor(impact.distinctiveness)}">${escapeHtml(impact.distinctiveness || 'N/A')}</span>
        </div>
      </div>
      ${impact.wouldDiscussInCommittee ? `<div class="essay-impact-committee">
        <span class="essay-impact-indicator">✓</span> Likely to be discussed in committee
      </div>` : ''}
      ${impact.notes ? `<div class="essay-impact-notes">${escapeHtml(impact.notes)}</div>` : ''}
    </div>`;
  }

  // Strengths section
  if (r.strengths?.length) {
    html += `<div class="essay-section">
      <h4 class="essay-section-header">Strengths</h4>
      <ul class="essay-strengths">
        ${r.strengths.map(s => `<li>${escapeHtml(s)}</li>`).join('')}
      </ul>
    </div>`;
  }

  // Improvements section with priority badges
  if (r.improvements?.length) {
    html += `<div class="essay-section">
      <h4 class="essay-section-header">Areas for Improvement</h4>
      <div class="essay-improvements">
        ${r.improvements.map(i => {
          const priority = i.priority || 'medium';
          const priorityColor = priority === 'high' ? 'high' : (priority === 'low' ? 'low' : 'medium');
          return `<div class="essay-improvement-item">
            <div class="essay-improvement-header">
              <span class="essay-priority-badge essay-priority-${priorityColor}">${priority}</span>
              <strong class="essay-improvement-area">${escapeHtml(i.area || '')}</strong>
            </div>
            <div class="essay-improvement-suggestion">${escapeHtml(i.suggestion || '')}</div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  }

  // Line Notes section
  if (r.lineNotes?.length) {
    html += `<div class="essay-section">
      <h4 class="essay-section-header">Line-by-Line Feedback</h4>
      <div class="essay-line-notes">
        ${r.lineNotes.map(note => `<div class="essay-line-note">
          <div class="essay-line-quote">"${escapeHtml(note.text)}"</div>
          <div class="essay-line-feedback">${escapeHtml(note.note)}</div>
        </div>`).join('')}
      </div>
    </div>`;
  }

  // Structure section with checkmarks
  if (r.structure) {
    const struct = r.structure;
    html += `<div class="essay-section">
      <h4 class="essay-section-header">Structure Analysis</h4>
      <div class="essay-structure-checks">
        <div class="essay-structure-check">
          <span class="essay-structure-icon ${struct.hasHook ? 'has' : 'missing'}">
            ${struct.hasHook ? '✓' : '✗'}
          </span>
          <span class="essay-structure-label">Strong Hook</span>
        </div>
        <div class="essay-structure-check">
          <span class="essay-structure-icon ${struct.hasNarrative ? 'has' : 'missing'}">
            ${struct.hasNarrative ? '✓' : '✗'}
          </span>
          <span class="essay-structure-label">Clear Narrative</span>
        </div>
        <div class="essay-structure-check">
          <span class="essay-structure-icon ${struct.hasReflection ? 'has' : 'missing'}">
            ${struct.hasReflection ? '✓' : '✗'}
          </span>
          <span class="essay-structure-label">Thoughtful Reflection</span>
        </div>
      </div>
      ${struct.notes ? `<div class="essay-structure-notes">${escapeHtml(struct.notes)}</div>` : ''}
    </div>`;
  }

  // Emotional Arc section
  if (r.emotionalArc) {
    const arc = r.emotionalArc;
    html += `<div class="essay-section">
      <h4 class="essay-section-header">Emotional Arc</h4>
      <div class="essay-emotional-arc">
        <div class="essay-arc-stage">
          <div class="essay-arc-label">Opening</div>
          <div class="essay-arc-value">${escapeHtml(arc.openingTone || '—')}</div>
        </div>
        <div class="essay-arc-arrow">→</div>
        <div class="essay-arc-stage">
          <div class="essay-arc-label">Shift</div>
          <div class="essay-arc-value">${escapeHtml(arc.shift || '—')}</div>
        </div>
        <div class="essay-arc-arrow">→</div>
        <div class="essay-arc-stage">
          <div class="essay-arc-label">Closing</div>
          <div class="essay-arc-value">${escapeHtml(arc.closingTone || '—')}</div>
        </div>
      </div>
      ${arc.notes ? `<div class="essay-arc-notes">${escapeHtml(arc.notes)}</div>` : ''}
    </div>`;
  }

  html += `</div>`;
  el.innerHTML = html;
  el.scrollIntoView({ behavior: 'smooth' });
}

// ========================
// Essay History & Score Tracking (Full-Page View)
// ========================

async function loadEssayHistory() {
  const typeFilter = $('evHistoryTypeFilter')?.value || '';
  const listContainer = $('evHistoryList');
  const loadingEl = $('evHistoryLoading');
  const chartContainer = $('evScoreChart');

  if (!listContainer) return;

  listContainer.innerHTML = '';
  loadingEl.style.display = 'flex';
  chartContainer.innerHTML = '';

  try {
    const url = `${API_BASE}/essays/history${typeFilter ? `?essayType=${typeFilter}` : ''}`;
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await res.json();
    const reviews = data.reviews || [];

    loadingEl.style.display = 'none';

    if (reviews.length === 0) {
      listContainer.innerHTML = `<div class="essay-history-empty"><p>No reviews yet. Submit your first essay for review to get started.</p></div>`;
      return;
    }

    // Render score progression chart if showing a specific essay type
    if (typeFilter && reviews.length > 1) {
      loadScoreProgression(typeFilter);
    } else if (!typeFilter && reviews.length > 1) {
      chartContainer.innerHTML = `<div class="essay-score-progression-message">Filter by essay type to see score progression</div>`;
    }

    // Render history cards
    reviews.forEach(review => {
      const card = createHistoryCard(review);
      listContainer.appendChild(card);
    });
  } catch (err) {
    loadingEl.style.display = 'none';
    listContainer.innerHTML = `<div class="essay-history-empty"><p>Failed to load history. Please try again.</p></div>`;
  }
}

function createHistoryCard(review) {
  const card = document.createElement('div');
  card.className = 'essay-history-card';

  const date = new Date(review.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const scoreColor = review.score >= 8 ? '#10b981' : (review.score >= 5 ? '#f59e0b' : '#ef4444');

  const summaryText = review.summary ? review.summary.substring(0, 120) + (review.summary.length > 120 ? '...' : '') : 'No summary available';

  const schoolText = review.targetSchool ? `<div class="essay-history-meta-item">School: ${escapeHtml(review.targetSchool)}</div>` : '';

  const html = `
    <div class="essay-history-card-header">
      <div style="flex: 1; min-width: 0;">
        <div style="margin-bottom: 6px;">
          <span class="essay-history-type-badge">${review.essayType.replace(/-/g, ' ')}</span>
          <span class="essay-history-date">${date}</span>
        </div>
      </div>
      <div class="essay-history-score">
        <span class="essay-history-score-num" style="color: ${scoreColor};">${review.score || '—'}</span>
        <div>
          <div class="essay-history-score-label">${review.scoreLabel || 'N/A'}</div>
        </div>
      </div>
    </div>
    <div class="essay-history-card-body">
      <div class="essay-history-summary">${escapeHtml(summaryText)}</div>
      <div class="essay-history-meta">
        ${schoolText}
        <div class="essay-history-meta-item">Words: ${review.wordCount}</div>
      </div>
    </div>
    <button class="essay-history-view-btn" onclick="viewEssayReviewFull('${review.id}')">View Full Review</button>
  `;

  card.innerHTML = html;
  return card;
}

async function viewEssayReviewFull(reviewId) {
  try {
    const res = await fetch(`${API_BASE}/essays/review/${reviewId}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const reviewRecord = await res.json();
    renderEssayReview(reviewRecord.review);
    switchEvTab('compose');
  } catch (err) {
    alert('Failed to load review. Please try again.');
  }
}

async function loadScoreProgression(essayType) {
  const chartContainer = $('evScoreChart');
  chartContainer.innerHTML = '';

  try {
    const res = await fetch(`${API_BASE}/essays/drafts/${essayType}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await res.json();
    const drafts = data.drafts || [];

    if (drafts.length < 2) {
      chartContainer.innerHTML = `<div class="essay-score-progression-message">Submit another draft of this essay type to track your score progression</div>`;
      return;
    }

    renderScoreChart(drafts);
  } catch (err) {
    console.error('Failed to load score progression:', err);
  }
}

function renderScoreChart(drafts) {
  const container = $('evScoreChart');
  container.innerHTML = '';

  const chartHtml = `
    <div class="essay-chart-container">
      ${drafts.map((draft, idx) => {
        const scorePercent = (draft.overallScore / 10) * 100;
        const date = new Date(draft.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return `
          <div class="essay-chart-bar-wrapper">
            <div class="essay-chart-bar" style="height: ${scorePercent}px;">
              <div class="essay-chart-bar-score">${draft.overallScore}</div>
            </div>
            <div class="essay-chart-label">${date}</div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  container.innerHTML = chartHtml;
}

// ========================
// Internships Tool
// ========================
function openInternships() {
  if (!currentUser) { openAuthModal('login'); return; }
  closeSidebarOnMobile();
  $('internshipsModal').style.display = 'flex';

  // Always show filters — free users see preview data as teaser
  $('internshipsRequiresUpgrade').style.display = 'none';
  $('internshipsFilters').style.display = 'flex';
  $('internshipsResults').style.display = 'block';

  // Load featured on open
  searchInternships();
}

async function searchInternships() {
  $('internshipsLoading').style.display = 'flex';
  $('internshipsResults').innerHTML = '';

  const params = new URLSearchParams();
  if ($('internshipLevel')?.value) params.set('level', $('internshipLevel').value);
  if ($('internshipState').value) params.set('state', $('internshipState').value);
  if ($('internshipField').value) params.set('field', $('internshipField').value);
  if ($('internshipCost').value === 'paid') params.set('paid', 'true');
  if ($('internshipCost').value === 'unpaid') params.set('paid', 'false');
  if ($('internshipFormat')?.value) params.set('format', $('internshipFormat').value);
  if ($('internshipSearch').value.trim()) params.set('q', $('internshipSearch').value.trim());

  try {
    const res = await fetch(`${API_BASE}/internships/search?${params}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await res.json();
    $('internshipsLoading').style.display = 'none';
    renderToolResults('internshipsResults', data.results || [], data._fullAccess, data._previewMessage, 'internship', data.total);
  } catch {
    $('internshipsLoading').style.display = 'none';
    $('internshipsResults').innerHTML = '<p style="color:#94a3b8;text-align:center;">Failed to load internships.</p>';
  }
}

// ========================
// Scholarships Tool
// ========================
function openScholarships() {
  if (!currentUser) { openAuthModal('login'); return; }
  closeSidebarOnMobile();
  $('scholarshipsModal').style.display = 'flex';

  $('scholarshipsRequiresUpgrade').style.display = 'none';
  $('scholarshipsFilters').style.display = 'flex';
  $('scholarshipsResults').style.display = 'block';
  searchScholarships();
}

async function searchScholarships() {
  $('scholarshipsLoading').style.display = 'flex';
  $('scholarshipsResults').innerHTML = '';

  const params = new URLSearchParams();
  if ($('scholarshipCategory').value) params.set('category', $('scholarshipCategory').value);
  if ($('scholarshipState').value) params.set('state', $('scholarshipState').value);
  if ($('scholarshipScope')?.value) params.set('scope', $('scholarshipScope').value);
  if ($('scholarshipAmount')?.value) params.set('amountRange', $('scholarshipAmount').value);
  if ($('scholarshipFormat')?.value) params.set('applicationFormat', $('scholarshipFormat').value);
  if ($('scholarshipSearch').value.trim()) params.set('q', $('scholarshipSearch').value.trim());

  try {
    const res = await fetch(`${API_BASE}/scholarships/search?${params}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await res.json();
    $('scholarshipsLoading').style.display = 'none';
    renderToolResults('scholarshipsResults', data.results || [], data._fullAccess, data._previewMessage, 'scholarship');
  } catch {
    $('scholarshipsLoading').style.display = 'none';
    $('scholarshipsResults').innerHTML = '<p style="color:#94a3b8;text-align:center;">Failed to load scholarships.</p>';
  }
}

// ========================
// Programs Tool
// ========================
function openPrograms() {
  if (!currentUser) { openAuthModal('login'); return; }
  closeSidebarOnMobile();
  $('programsModal').style.display = 'flex';

  $('programsRequiresUpgrade').style.display = 'none';
  $('programsFilters').style.display = 'flex';
  $('programsResults').style.display = 'block';
  searchPrograms();
}

async function searchPrograms() {
  $('programsLoading').style.display = 'flex';
  $('programsResults').innerHTML = '';

  const params = new URLSearchParams();
  if ($('programCategory').value) params.set('category', $('programCategory').value);
  if ($('programState')?.value) params.set('state', $('programState').value);
  if ($('programGrade')?.value) params.set('grade', $('programGrade').value);
  if ($('programCost').value) params.set('cost', $('programCost').value);
  if ($('programFormat')?.value) params.set('format', $('programFormat').value);
  if ($('programSelectivity').value) params.set('selectivity', $('programSelectivity').value);
  if ($('programSearch').value.trim()) params.set('q', $('programSearch').value.trim());

  try {
    const res = await fetch(`${API_BASE}/programs/search?${params}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await res.json();
    $('programsLoading').style.display = 'none';
    renderToolResults('programsResults', data.results || [], data._fullAccess, data._previewMessage, 'program');
  } catch {
    $('programsLoading').style.display = 'none';
    $('programsResults').innerHTML = '<p style="color:#94a3b8;text-align:center;">Failed to load programs.</p>';
  }
}

// ========================
// Financial Aid Tool
// ========================
function openFinancialAid() {
  if (!currentUser) { openAuthModal('login'); return; }
  closeSidebarOnMobile();
  $('financialAidModal').style.display = 'flex';

  if (!canAccess('financial_aid_preview')) {
    // Free users: show upgrade gate, hide content
    $('financialAidRequiresUpgrade').style.display = 'block';
    ['finaidTabSearch', 'finaidTabStrategy', 'finaidTabGrants', 'finaidTabSAI'].forEach(id => {
      if ($(id)) $(id).style.display = 'none';
    });
    return;
  }

  $('financialAidRequiresUpgrade').style.display = 'none';
  // Show search tab by default
  switchFinaidTab('search');
  searchFinancialAid();
}

function switchFinaidTab(tab) {
  // Hide all tab content
  ['finaidTabSearch', 'finaidTabStrategy', 'finaidTabGrants', 'finaidTabSAI'].forEach(id => {
    if ($(id)) $(id).style.display = 'none';
  });
  // Remove active from all tab buttons
  document.querySelectorAll('.finaid-tab-btn').forEach(btn => btn.classList.remove('active'));
  // Show selected tab
  if (tab === 'search') {
    if ($('finaidTabSearch')) $('finaidTabSearch').style.display = 'block';
    document.querySelector('[data-finaid-tab="search"]')?.classList.add('active');
  } else if (tab === 'strategy') {
    if (!canAccess('financial_aid')) {
      if ($('finaidTabStrategy')) $('finaidTabStrategy').style.display = 'block';
      document.querySelector('[data-finaid-tab="strategy"]')?.classList.add('active');
      $('strategyResults').innerHTML = '<div class="tool-upgrade-teaser"><div class="tool-upgrade-content"><p>Personalized financial aid strategies require an Elite plan.</p><button onclick="openUpgrade()" class="tool-upgrade-btn">Upgrade to Elite</button></div></div>';
      return;
    }
    if ($('finaidTabStrategy')) $('finaidTabStrategy').style.display = 'block';
    document.querySelector('[data-finaid-tab="strategy"]')?.classList.add('active');
  } else if (tab === 'grants') {
    if ($('finaidTabGrants')) $('finaidTabGrants').style.display = 'block';
    document.querySelector('[data-finaid-tab="grants"]')?.classList.add('active');
    searchStateGrants();
  } else if (tab === 'sai') {
    if ($('finaidTabSAI')) $('finaidTabSAI').style.display = 'block';
    document.querySelector('[data-finaid-tab="sai"]')?.classList.add('active');
  }
}

async function searchFinancialAid() {
  $('finaidLoading').style.display = 'flex';
  $('finaidResults').innerHTML = '';

  const params = new URLSearchParams();
  if ($('finaidState')?.value) params.set('state', $('finaidState').value);
  if ($('finaidType')?.value) params.set('type', $('finaidType').value);
  if ($('finaidTags')?.value) params.set('tags', $('finaidTags').value);
  if ($('finaidIncome')?.value) params.set('incomeBracket', $('finaidIncome').value);
  if ($('finaidSearch')?.value?.trim()) params.set('q', $('finaidSearch').value.trim());

  try {
    const res = await fetch(`${API_BASE}/financial-aid/search?${params}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.json();
    $('finaidLoading').style.display = 'none';
    renderFinaidResults(data.results || [], data._fullAccess, data._previewMessage, data.total);
  } catch {
    $('finaidLoading').style.display = 'none';
    $('finaidResults').innerHTML = '<p style="color:#94a3b8;text-align:center;">Failed to load data.</p>';
  }
}

function renderFinaidResults(results, fullAccess, previewMessage, totalCount) {
  const el = $('finaidResults');
  if (!results.length) {
    el.innerHTML = '<div class="tool-empty"><p>No schools found matching your filters.</p></div>';
    return;
  }
  const countText = (!fullAccess && totalCount && totalCount > results.length)
    ? `Showing ${results.length} of ${totalCount} results`
    : `${results.length} result${results.length !== 1 ? 's' : ''}`;
  let html = `<div class="tool-result-count">${countText}</div>`;

  for (const school of results) {
    const tags = (school.tags || []).map(t => `<span class="tool-tag">${escapeHtml(t)}</span>`).join('');
    const netPrice = school.netPriceByIncome || {};
    let priceInfo = '';
    if (Object.keys(netPrice).length > 0 && fullAccess) {
      const prices = Object.values(netPrice).filter(p => typeof p === 'number');
      if (prices.length > 0) {
        priceInfo = `<div class="finaid-prices">
          <span>Net price: $${Math.min(...prices).toLocaleString()} &ndash; $${Math.max(...prices).toLocaleString()}</span>
        </div>`;
      }
    }
    // Cost breakdown (tuition, room & board)
    const cb = school.costBreakdown;
    let costDetail = '';
    if (cb && fullAccess) {
      const isPublic = school.type === 'public';
      costDetail = `<div class="finaid-cost-breakdown">
        ${school.inStateTuition ? `<span>In-State Tuition: $${school.inStateTuition.toLocaleString()}</span>` : ''}
        <span>${isPublic ? 'Out-of-State Tuition' : 'Tuition'}: $${(cb.tuition || 0).toLocaleString()}</span>
        <span>Fees: $${(cb.fees || 0).toLocaleString()}</span>
        <span>Room &amp; Board: $${(cb.roomBoard || 0).toLocaleString()}</span>
      </div>`;
    }
    html += `<div class="tool-card ${school._preview ? 'preview' : ''}">
      <div class="tool-card-header">
        <h4>${escapeHtml(school.name)}</h4>
        ${school.needBlind ? '<span class="tool-tag paid">Need-Blind</span>' : ''}
        ${school.meetsFullNeed ? '<span class="tool-tag free">Meets Full Need</span>' : ''}
      </div>
      <div class="tool-card-meta">
        <span>${escapeHtml(school.type || '')}</span>
        <span>${escapeHtml(school.state || '')}</span>
        <span>Total Cost: $${(school.stickerPrice || 0).toLocaleString()}</span>
        ${school.deadline ? `<span>Aid Deadline: ${escapeHtml(school.deadline)}</span>` : ''}
      </div>
      ${costDetail}
      ${priceInfo}
      ${school.keyInsight && fullAccess ? `<p class="tool-card-desc">${escapeHtml(school.keyInsight)}</p>` : ''}
      <div class="tool-card-tags">${tags}</div>
    </div>`;
  }

  if (previewMessage && !fullAccess) {
    html += `<div class="tool-upgrade-teaser">
      <div class="tool-upgrade-blur"></div>
      <div class="tool-upgrade-content">
        <p>${escapeHtml(previewMessage)}</p>
        <button onclick="openUpgrade()" class="tool-upgrade-btn">Unlock Full Access</button>
      </div>
    </div>`;
  }
  el.innerHTML = html;
}

async function searchStateGrants() {
  $('grantsLoading').style.display = 'flex';
  $('grantsResults').innerHTML = '';

  const params = new URLSearchParams();
  if ($('grantsState')?.value) params.set('state', $('grantsState').value);

  try {
    const res = await fetch(`${API_BASE}/financial-aid/state-grants?${params}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.json();
    $('grantsLoading').style.display = 'none';

    const federalPrograms = data.federalPrograms || [];
    const stateResults = data.stateResults || data.results || [];
    let html = '';

    // ── Federal Programs Section ──
    if (federalPrograms.length > 0) {
      const grants = federalPrograms.filter(p => p.type === 'grant');
      const loans = federalPrograms.filter(p => p.type === 'loan');
      const workStudy = federalPrograms.filter(p => p.type === 'work-study');

      html += '<div data-grant-type="federal" class="grants-section-header">Federal Grants</div>';
      for (const p of grants) {
        html += `<div data-grant-type="federal">${renderGrantCard(p, 'federal')}</div>`;
      }

      if (workStudy.length) {
        html += '<div data-grant-type="federal" class="grants-section-header">Federal Work-Study</div>';
        for (const p of workStudy) {
          html += `<div data-grant-type="federal">${renderGrantCard(p, 'federal')}</div>`;
        }
      }

      html += '<div data-grant-type="federal" class="grants-section-header">Federal Loans</div>';
      for (const p of loans) {
        html += `<div data-grant-type="federal"><div class="tool-card">
          <div class="tool-card-header">
            <h4>${escapeHtml(p.name)}</h4>
            <span class="tool-tag amount">${p.maxAward ? `Up to $${p.maxAward.toLocaleString()}` : 'Varies'}</span>
          </div>
          <div class="tool-card-meta">
            <span>Federal</span>
            ${p.interestRate ? `<span>Rate: ${escapeHtml(p.interestRate)}</span>` : ''}
            ${p.repaymentRequired ? '<span class="tool-tag">Repayment Required</span>' : ''}
          </div>
          ${p.description ? `<p class="tool-card-desc">${escapeHtml(p.description)}</p>` : ''}
          ${p.eligibility ? `<p class="tool-card-desc" style="font-size:12px;color:#94a3b8;"><strong>Eligibility:</strong> ${escapeHtml(p.eligibility)}</p>` : ''}
        </div></div>`;
      }
    }

    // ── State Programs Section ──
    if (stateResults.length > 0) {
      const stateName = $('grantsState')?.value ? $('grantsState').selectedOptions[0]?.text || 'Selected State' : 'All States';
      html += `<div data-grant-type="state" class="grants-section-header">${escapeHtml(stateName)} — ${stateResults.length} Program${stateResults.length !== 1 ? 's' : ''}</div>`;
      for (const g of stateResults) {
        html += `<div data-grant-type="state">${renderGrantCard(g, 'state')}</div>`;
      }
    } else if ($('grantsState')?.value) {
      html += '<div data-grant-type="state" class="grants-section-header">State Programs</div>';
      html += '<div data-grant-type="state" class="tool-empty"><p>No state programs found for this state.</p></div>';
    } else {
      html += '<div data-grant-type="state" class="grants-section-header">State Programs</div>';
      html += '<div data-grant-type="state" class="tool-empty"><p>Select a state to view state-specific grants and scholarships.</p></div>';
    }

    $('grantsResults').innerHTML = html;
  } catch {
    $('grantsLoading').style.display = 'none';
    $('grantsResults').innerHTML = '<p style="color:#94a3b8;text-align:center;">Failed to load grants and aid programs.</p>';
  }
}

function renderGrantCard(g, source) {
  const typeLabel = g.type === 'grant' ? 'Grant' : g.type === 'loan' ? 'Loan' : g.type === 'work-study' ? 'Work-Study' : 'Aid';
  return `<div class="tool-card">
    <div class="tool-card-header">
      <h4>${escapeHtml(g.name)}</h4>
      <span class="tool-tag amount">Up to $${(g.maxAward || 0).toLocaleString()}</span>
    </div>
    <div class="tool-card-meta">
      <span>${source === 'federal' ? 'Federal' : escapeHtml(g.state || '')}</span>
      <span>${escapeHtml(typeLabel)}</span>
      ${g.deadline ? `<span>Deadline: ${escapeHtml(g.deadline)}</span>` : ''}
      ${g.needBased ? '<span>Need-Based</span>' : ''}
      ${g.meritBased ? '<span>Merit-Based</span>' : ''}
      ${g.repaymentRequired === false ? '<span class="tool-tag free">No Repayment</span>' : ''}
    </div>
    ${(g.keyDetail || g.description) ? `<p class="tool-card-desc">${escapeHtml(g.keyDetail || g.description)}</p>` : ''}
    ${g.eligibility ? `<p class="tool-card-desc" style="font-size:12px;color:#94a3b8;"><strong>Eligibility:</strong> ${escapeHtml(g.eligibility)}</p>` : ''}
  </div>`;
}

async function generateMyStrategy() {
  const income = $('strategyIncome')?.value;
  const assets = $('strategyAssets')?.value;
  const familySize = $('strategyFamilySize')?.value;
  const state = $('strategyState')?.value;
  const gpa = $('strategyGPA')?.value;
  const schools = $('strategySchools')?.value;
  const context = $('strategyContext')?.value || '';

  if (!income || (!schools && selectedSchools.length === 0)) {
    $('strategyResults').innerHTML = '<p style="color:#f87171;">Please enter at least your household income and select target schools.</p>';
    return;
  }

  $('strategyLoading').style.display = 'flex';
  $('strategyResults').innerHTML = '';
  $('strategyBtn').disabled = true;

  // Use selected schools from picker, or fall back to hidden input value
  const schoolList = selectedSchools.length > 0
    ? selectedSchools.map(s => s.name)
    : schools.split(',').map(s => s.trim()).filter(Boolean);

  try {
    const res = await fetch(`${API_BASE}/financial-aid/my-strategy`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        householdIncome: parseFloat(income),
        assets: parseFloat(assets) || 0,
        familySize: parseInt(familySize) || 4,
        state: state || '',
        studentGPA: parseFloat(gpa) || 0,
        targetSchools: schoolList,
        additionalContext: context.trim().slice(0, 500),
        includeSAI: true
      })
    });
    const data = await res.json();
    $('strategyLoading').style.display = 'none';
    $('strategyBtn').disabled = false;

    if (!res.ok || data.error) {
      $('strategyResults').innerHTML = `<p style="color:#f87171;">${escapeHtml(data.error || 'Failed to generate strategy.')}</p>`;
      return;
    }

    // Render the strategy as safe HTML with rich markdown support
    const strategyText = data.strategy || 'No strategy generated.';
    const formatted = renderMarkdownToHTML(strategyText);

    let html = `<div class="strategy-result">${formatted}</div>`;

    // Show matched school cards if available
    if (data.schools && data.schools.length) {
      html += '<div class="strategy-schools"><h4>Your Target Schools — Cost Summary</h4>';
      for (const s of data.schools) {
        const netPrice = (s.netPrice != null && s.netPrice >= 0) ? `$${s.netPrice.toLocaleString()}` : 'varies';
        const cb = s.costBreakdown;
        html += `<div class="tool-card">
          <div class="tool-card-header"><h4>${escapeHtml(s.name)}</h4></div>
          <div class="tool-card-meta">
            <span>Total: $${(s.stickerPrice || 0).toLocaleString()}</span>
            <span>Est. Net: ${netPrice}</span>
            ${s.needBlind ? '<span class="tool-tag paid">Need-Blind</span>' : ''}
            ${s.meetsFullNeed ? '<span class="tool-tag free">Meets Full Need</span>' : ''}
          </div>
          ${cb ? `<div class="finaid-cost-breakdown">
            ${s.inStateTuition ? `<span>In-State Tuition: $${s.inStateTuition.toLocaleString()}</span>` : ''}
            <span>${s.inStateTuition ? 'Out-of-State' : 'Tuition'}: $${(cb.tuition || 0).toLocaleString()}</span>
            <span>Fees: $${(cb.fees || 0).toLocaleString()}</span>
            <span>Room &amp; Board: $${(cb.roomBoard || 0).toLocaleString()}</span>
          </div>` : ''}
        </div>`;
      }
      html += '</div>';
    }

    $('strategyResults').innerHTML = html;
  } catch {
    $('strategyLoading').style.display = 'none';
    $('strategyBtn').disabled = false;
    $('strategyResults').innerHTML = '<p style="color:#f87171;">Failed to generate strategy. Please try again.</p>';
  }
}

// ========================
// Shared Tool Results Renderer
// ========================
function renderToolResults(containerId, results, fullAccess, previewMessage, type, totalCount) {
  const el = $(containerId);

  if (!results.length) {
    el.innerHTML = `<div class="tool-empty">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      <p>No ${type}s found matching your filters. Try broadening your search.</p>
    </div>`;
    return;
  }

  // Show "X of Y results" when in preview mode with total count available
  const countText = (!fullAccess && totalCount && totalCount > results.length)
    ? `Showing ${results.length} of ${totalCount} results`
    : `${results.length} result${results.length !== 1 ? 's' : ''}`;
  let html = `<div class="tool-result-count">${countText}</div>`;

  for (const item of results) {
    html += renderToolCard(item, type, fullAccess);
  }

  if (previewMessage && !fullAccess) {
    html += `<div class="tool-upgrade-teaser">
      <div class="tool-upgrade-blur"></div>
      <div class="tool-upgrade-content">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <p>${escapeHtml(previewMessage)}</p>
        <button onclick="openUpgrade()" class="tool-upgrade-btn">Unlock Full Access</button>
      </div>
    </div>`;
  }

  el.innerHTML = html;
}

function renderToolCard(item, type, fullAccess) {
  const isPreview = item._preview;

  if (type === 'internship') {
    return `<div class="tool-card ${isPreview ? 'preview' : ''}">
      <div class="tool-card-header">
        <h4>${escapeHtml(item.title || item.name || 'Internship')}</h4>
        ${item.paid ? '<span class="tool-tag paid">Paid</span>' : '<span class="tool-tag unpaid">Unpaid</span>'}
        ${item.format ? `<span class="tool-tag format">${escapeHtml(item.format)}</span>` : ''}
        ${item.field ? `<span class="tool-tag">${escapeHtml(item.field)}</span>` : ''}
      </div>
      <div class="tool-card-meta">
        ${item.company ? `<span>${escapeHtml(item.company)}</span>` : ''}
        ${item.location?.state ? `<span>${item.location.state}</span>` : ''}
        ${item.deadline ? `<span>Deadline: ${item.deadline}</span>` : ''}
      </div>
      ${item.description && !isPreview ? `<p class="tool-card-desc">${escapeHtml(item.description.slice(0, 200))}${item.description.length > 200 ? '...' : ''}</p>` : ''}
      ${item.url && fullAccess && sanitizeUrl(item.url) ? `<a href="${sanitizeUrl(item.url)}" target="_blank" rel="noopener" class="tool-card-link">Learn more</a>` : ''}
    </div>`;
  }

  if (type === 'scholarship') {
    const amountStr = item.amount?.max ? `Up to $${item.amount.max.toLocaleString()}` : (item.amount || 'Varies');
    const scopeLabel = item.scope === 'state' ? 'State' : item.scope === 'regional' ? 'Regional' : 'National';
    const fmtLabels = { essay: 'Essay', video: 'Video', portfolio: 'Portfolio', project: 'Project', 'research-paper': 'Research', 'application-only': 'App Only', interview: 'Interview' };
    const fmtTag = item.applicationFormat && fmtLabels[item.applicationFormat] ? `<span class="tool-tag format">${fmtLabels[item.applicationFormat]}</span>` : '';
    return `<div class="tool-card ${isPreview ? 'preview' : ''}">
      <div class="tool-card-header">
        <h4>${escapeHtml(item.name || 'Scholarship')}</h4>
        <span class="tool-tag amount">${typeof amountStr === 'string' ? escapeHtml(amountStr) : amountStr}</span>
        <span class="tool-tag scope-${item.scope || 'national'}">${scopeLabel}</span>
        ${fmtTag}
      </div>
      <div class="tool-card-meta">
        ${item.provider ? `<span>${escapeHtml(item.provider)}</span>` : ''}
        ${item.deadline ? `<span>Deadline: ${item.deadline}</span>` : ''}
        ${item.competitiveness ? `<span>${capitalize(item.competitiveness)}</span>` : ''}
        ${item._verified ? '<span class="tool-tag verified">Verified</span>' : ''}
      </div>
      ${item.url && fullAccess && sanitizeUrl(item.url) ? `<a href="${sanitizeUrl(item.url)}" target="_blank" rel="noopener" class="tool-card-link">Apply</a>` : ''}
    </div>`;
  }

  if (type === 'program') {
    return `<div class="tool-card ${isPreview ? 'preview' : ''}">
      <div class="tool-card-header">
        <h4>${escapeHtml(item.name || 'Program')}</h4>
        ${item.admissionsImpact ? `<span class="tool-tag impact-${item.admissionsImpact}">${capitalize(item.admissionsImpact.replace('_', ' '))}</span>` : ''}
        ${item.selectivity ? `<span class="tool-tag">${capitalize(item.selectivity.replace('_', ' '))}</span>` : ''}
        ${item.format ? `<span class="tool-tag format">${escapeHtml(item.format)}</span>` : ''}
      </div>
      <div class="tool-card-meta">
        ${item.provider ? `<span>${escapeHtml(item.provider)}</span>` : ''}
        ${item.category ? `<span>${capitalize(item.category)}</span>` : ''}
        ${item.cost?.type === 'free' || item.cost?.amount === 0 ? '<span class="tool-tag free">Free</span>' : ''}
        ${item.deadline ? `<span>Deadline: ${item.deadline}</span>` : ''}
      </div>
      ${item.url && fullAccess && sanitizeUrl(item.url) ? `<a href="${sanitizeUrl(item.url)}" target="_blank" rel="noopener" class="tool-card-link">Learn more</a>` : ''}
    </div>`;
  }

  return '';
}

// ========================
// David Coach — Floating Chat Widget
// ========================

let davidHistory = [];
let davidInitialized = false;

function setupDavidCoach() {
  const widget = $('davidWidget');
  const toggle = $('davidToggle');
  const chat = $('davidChat');
  const closeBtn = $('davidClose');
  const input = $('davidInput');
  const sendBtn = $('davidSend');

  if (!widget || !toggle) return;

  // Show widget only when user is logged in
  // (checkAuth will call showDavidWidget when appropriate)

  toggle.addEventListener('click', () => {
    const isOpen = chat.style.display !== 'none';
    chat.style.display = isOpen ? 'none' : 'flex';
    if (!isOpen) {
      // On desktop, focus input immediately. On mobile, don't auto-focus —
      // let user see the chat + welcome message first, then tap input when ready.
      const isMobile = window.innerWidth <= 500;
      if (!isMobile) {
        input.focus();
      }
    }
  });

  closeBtn.addEventListener('click', () => {
    chat.style.display = 'none';
  });

  sendBtn.addEventListener('click', () => sendDavidMessage());

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendDavidMessage();
    }
  });

  davidInitialized = true;
}

function showDavidWidget() {
  const widget = $('davidWidget');
  if (widget) widget.style.display = 'block';
}

function hideDavidWidget() {
  const widget = $('davidWidget');
  if (widget) widget.style.display = 'none';
}

async function sendDavidMessage() {
  const input = $('davidInput');
  const messagesEl = $('davidMessages');
  const sendBtn = $('davidSend');
  const message = input.value.trim();

  if (!message || message.length < 2) return;

  // Add user message to UI
  const userDiv = document.createElement('div');
  userDiv.className = 'david-msg david-msg-user';
  userDiv.innerHTML = `<div class="david-msg-bubble">${escapeHtml(message)}</div>`;
  messagesEl.appendChild(userDiv);

  // Clear input
  input.value = '';
  sendBtn.disabled = true;

  // Add typing indicator
  const typingDiv = document.createElement('div');
  typingDiv.className = 'david-msg david-msg-typing';
  typingDiv.innerHTML = `<div class="david-msg-bubble">David is thinking...</div>`;
  messagesEl.appendChild(typingDiv);
  messagesEl.scrollTop = messagesEl.scrollHeight;

  // Add to history
  davidHistory.push({ role: 'user', content: message });

  try {
    const res = await fetch(`${API_BASE}/coach/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ message, history: davidHistory })
    });

    const data = await res.json();

    // Remove typing indicator
    typingDiv.remove();

    if (data.error) {
      const errDiv = document.createElement('div');
      errDiv.className = 'david-msg david-msg-assistant';
      errDiv.innerHTML = `<div class="david-msg-bubble">${escapeHtml(data.error)}</div>`;
      messagesEl.appendChild(errDiv);
    } else {
      const reply = data.reply;
      davidHistory.push({ role: 'assistant', content: reply });

      const assistantDiv = document.createElement('div');
      assistantDiv.className = 'david-msg david-msg-assistant';
      assistantDiv.innerHTML = `<div class="david-msg-bubble">${formatDavidReply(reply)}</div>`;
      messagesEl.appendChild(assistantDiv);
    }
  } catch {
    typingDiv.remove();
    const errDiv = document.createElement('div');
    errDiv.className = 'david-msg david-msg-assistant';
    errDiv.innerHTML = `<div class="david-msg-bubble">Sorry, I couldn't connect. Please try again in a moment.</div>`;
    messagesEl.appendChild(errDiv);
  }

  sendBtn.disabled = false;
  messagesEl.scrollTop = messagesEl.scrollHeight;
  input.focus();
}

function formatDavidReply(text) {
  // Basic markdown-like formatting for David's replies
  return escapeHtml(text)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '</p><p style="margin-top:8px;">')
    .replace(/\n/g, '<br>');
}

