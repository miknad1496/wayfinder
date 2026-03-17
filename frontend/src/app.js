/**
 * Wayfinder Chat Application — v2.0
 *
 * Claude AI-style interface with:
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
  setupChatListeners();
  setupSidebarListeners();
  setupAuthListeners();
  setupProfileListeners();
  setupEngineListeners();
  setupSettingsListeners();
  setupUpgradeListeners();
  setupInviteListeners();
  setupToolListeners();
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
  $('sidebarClose').addEventListener('click', () => sidebar.classList.add('collapsed'));
  $('sidebarOpen').addEventListener('click', () => sidebar.classList.remove('collapsed'));
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

  appendMessage('user', message);
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
      throw new Error(err.error || `Server error (${response.status})`);
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

    typingEl.remove();
    appendMessage('assistant', data.response, data.sources, data.mode);

    if (engineActive) {
      engineActive = false;
      engineToggle.classList.remove('active');
    }

    // Refresh chat history in sidebar
    loadChatHistory();

  } catch (err) {
    typingEl.remove();
    appendError(err.message);
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
  messageEl.className = 'message';

  const initial = currentUser ? (currentUser.name || 'U')[0].toUpperCase() : 'U';

  // Mode badge
  let badgeHTML = '';
  if (role === 'assistant' && mode) {
    const modeLabel = mode === 'engine' ? 'Wayfinder Engine' : 'Standard';
    badgeHTML = `<div class="engine-badge ${mode}">${modeLabel}</div>`;
  }

  // Header
  const avatarHTML = role === 'user'
    ? `<div class="message-avatar user-avatar">${initial}</div>`
    : `<div class="message-avatar"><img src="/logo.svg" alt="Wayfinder"></div>`;

  const roleName = role === 'user'
    ? (currentUser?.name || 'You')
    : 'Wayfinder';

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
}

function appendError(message) {
  const el = document.createElement('div');
  el.className = 'error-message';
  el.textContent = `Something went wrong: ${message}. Please try again.`;
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
  // Show Opus 4.6 badge for paid tiers
  const modelBadge = $('engineModelBadge');
  if (modelBadge) {
    const plan = userPlan();
    if (plan === 'pro' || plan === 'elite') {
      modelBadge.style.display = 'inline-flex';
      modelBadge.textContent = 'Opus 4.6';
    } else {
      modelBadge.style.display = 'none';
    }
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
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
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
  const planNames = { free: 'Career Explorer (Free)', pro: 'Coach ($25/mo)', elite: 'Consultant ($50/mo)', premium: 'Premium (Legacy)' };
  const planLimits = { free: 3, pro: 20, elite: 40, premium: 10 };
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
let currentPathway = 'career'; // 'career' or 'admissions'

function setupUpgradeListeners() {
  $('upgradeModalClose').addEventListener('click', () => $('upgradeModal').style.display = 'none');
  $('upgradeModal').addEventListener('click', (e) => {
    if (e.target === $('upgradeModal')) $('upgradeModal').style.display = 'none';
  });

  // Pathway toggle
  $('pathwayCareerBtn').addEventListener('click', () => switchPathway('career'));
  $('pathwayAdmissionsBtn').addEventListener('click', () => switchPathway('admissions'));

  // Career plans — backend uses same 'pro'/'elite' keys with product context
  $('planCareerProBtn').addEventListener('click', () => handlePlanUpgrade('pro', 'career'));
  $('planCareerEliteBtn').addEventListener('click', () => handlePlanUpgrade('elite', 'career'));

  // Admissions plans
  $('planCoachBtn').addEventListener('click', () => handlePlanUpgrade('pro', 'admissions'));
  $('planConsultantBtn').addEventListener('click', () => handlePlanUpgrade('elite', 'admissions'));

  // Essay credit packs
  $('essayPack5Btn').addEventListener('click', () => handleEssayPurchase('starter'));
  $('essayPack10Btn').addEventListener('click', () => handleEssayPurchase('standard'));
  $('essayPack20Btn').addEventListener('click', () => handleEssayPurchase('bulk'));
}

function switchPathway(path) {
  currentPathway = path;
  $('pathwayCareerBtn').classList.toggle('active', path === 'career');
  $('pathwayAdmissionsBtn').classList.toggle('active', path === 'admissions');
  $('careerPlans').style.display = path === 'career' ? 'grid' : 'none';
  $('admissionsPlans').style.display = path === 'admissions' ? 'grid' : 'none';
  $('essayAddonSection').style.display = path === 'admissions' ? 'block' : 'none';
}

function openUpgrade(pathway) {
  if (!currentUser) {
    openAuthModal('signup');
    return;
  }

  // Auto-detect pathway from user type or use passed value
  if (pathway) {
    switchPathway(pathway);
  } else {
    // Default: admissions for pre-college/parent, career for others
    const ut = currentUser.userType || '';
    const defaultPath = (ut.includes('parent') || ut.includes('pre-college') || ut.includes('high school'))
      ? 'admissions' : currentPathway;
    switchPathway(defaultPath);
  }

  // Normalize legacy plans
  const plan = normalizePlan(currentUser.plan || 'free');

  // Free buttons
  $('planFreeBtn').textContent = plan === 'free' ? 'Current Plan' : 'Free Plan';
  $('planFreeBtn').className = plan === 'free' ? 'plan-btn plan-btn-current' : 'plan-btn plan-btn-upgrade';

  // Career Pro button
  const isProOrHigher = plan === 'pro' || plan === 'elite';
  $('planCareerProBtn').textContent = isProOrHigher ? 'Current Plan' : 'Upgrade — $15/mo';
  $('planCareerProBtn').className = isProOrHigher ? 'plan-btn plan-btn-current' : 'plan-btn plan-btn-upgrade';
  $('planCareerProBtn').disabled = isProOrHigher;

  // Career Elite button
  $('planCareerEliteBtn').textContent = plan === 'elite' ? 'Current Plan' : 'Upgrade — $30/mo';
  $('planCareerEliteBtn').className = plan === 'elite' ? 'plan-btn plan-btn-current' : 'plan-btn plan-btn-upgrade';
  $('planCareerEliteBtn').disabled = plan === 'elite';

  // Coach button (admissions)
  $('planCoachBtn').textContent = plan === 'pro' ? 'Current Plan' : (plan === 'elite' ? 'Included' : 'Upgrade — $25/mo');
  $('planCoachBtn').className = isProOrHigher ? 'plan-btn plan-btn-current' : 'plan-btn plan-btn-upgrade';
  $('planCoachBtn').disabled = isProOrHigher;

  // Consultant button (admissions)
  $('planConsultantBtn').textContent = plan === 'elite' ? 'Current Plan' : 'Upgrade — $50/mo';
  $('planConsultantBtn').className = plan === 'elite' ? 'plan-btn plan-btn-current' : 'plan-btn plan-btn-upgrade';
  $('planConsultantBtn').disabled = plan === 'elite';

  // Essay credits visibility — available for Coach/Consultant
  if (currentPathway === 'admissions') {
    $('essayAddonSection').style.display = (plan === 'pro' || plan === 'elite') ? 'block' : 'none';
  }

  $('upgradeModal').style.display = 'flex';
}

function normalizePlan(plan) {
  if (plan === 'premium') return 'pro'; // Legacy migration
  return plan || 'free';
}

function planDisplayName(plan) {
  return PLAN_DISPLAY[normalizePlan(plan)] || 'Career Explorer';
}

async function handlePlanUpgrade(plan, product = 'admissions') {
  try {
    // Check if Stripe is configured
    const statusRes = await fetch(`${API_BASE}/stripe/status`);
    const statusData = await statusRes.json();

    if (!statusData.configured) {
      alert(`Stripe payments are being set up. Contact support@wayfinderai.org to upgrade in the meantime.`);
      return;
    }

    // Create Stripe Checkout session — pass product context for pricing
    const res = await fetch(`${API_BASE}/stripe/create-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ plan, product })
    });

    const data = await res.json();
    if (data.error) {
      alert(data.error);
      return;
    }

    if (data.url) {
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    }
  } catch (err) {
    alert('Unable to process upgrade right now. Please try again later.');
    console.error('Upgrade error:', err);
  }
}

async function handleEssayPurchase(pack) {
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
    if (data.error) { alert(data.error); return; }
    if (data.url) window.location.href = data.url;
  } catch {
    alert('Unable to process purchase right now.');
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
}

function switchAuthForm(mode) {
  $('loginForm').style.display = mode === 'login' ? 'block' : 'none';
  $('signupForm').style.display = mode === 'signup' ? 'block' : 'none';
  if (mode === 'login') $('loginEmail').focus();
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

    sessionId = null;
    localStorage.removeItem('wayfinder_session');
  } catch {
    showAuthError('loginError', 'Connection error. Is the server running?');
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
    } else {
      authToken = null;
      localStorage.removeItem('wayfinder_token');
      updateAuthUI();
      updateEngineUI();
    }
  } catch {
    updateAuthUI();
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
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
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
      if (inv.redeemed) {
        status = 'Accepted';
        statusClass = 'invite-status-accepted';
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
          html += `<div class="demo-major-segment" style="width:${pct}%;background:${RACE_COLORS[race]}" data-tooltip="${RACE_LABELS[race]}: ${pct}%"></div>`;
        }
      }

      html += `</div></div>`;
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
  if (window.innerWidth <= 768) sidebar.classList.add('collapsed');
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

  // Modal close handlers
  setupModalClose('timelineModal', 'timelineModalClose');
  setupModalClose('essaysModal', 'essaysModalClose');
  setupModalClose('internshipsModal', 'internshipsModalClose');
  setupModalClose('scholarshipsModal', 'scholarshipsModalClose');
  setupModalClose('programsModal', 'programsModalClose');

  // Upgrade gate buttons
  const upgradeGateBtns = ['timelineUpgradeBtn', 'essaysUpgradeBtn', 'internshipsUpgradeBtn', 'scholarshipsUpgradeBtn', 'programsUpgradeBtn'];
  for (const id of upgradeGateBtns) {
    const el = $(id);
    if (el) el.addEventListener('click', () => {
      document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = 'none');
      openUpgrade();
    });
  }

  // Timeline
  if ($('timelineSaveProfile')) $('timelineSaveProfile').addEventListener('click', saveTimelineProfile);

  // Essays
  if ($('essaySubmitBtn')) $('essaySubmitBtn').addEventListener('click', submitEssayReview);
  if ($('essayBuyMoreBtn')) $('essayBuyMoreBtn').addEventListener('click', () => {
    $('essaysModal').style.display = 'none';
    openUpgrade();
  });
  if ($('essayText')) {
    $('essayText').addEventListener('input', () => {
      $('essayCharCount').textContent = `${$('essayText').value.length} / 15,000 characters`;
    });
  }

  // Internships search
  if ($('internshipSearchBtn')) $('internshipSearchBtn').addEventListener('click', searchInternships);

  // Scholarships search
  if ($('scholarshipSearchBtn')) $('scholarshipSearchBtn').addEventListener('click', searchScholarships);

  // Programs search
  if ($('programSearchBtn')) $('programSearchBtn').addEventListener('click', searchPrograms);
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
  const plan = userPlan();
  const access = {
    admissions_timeline: ['pro', 'elite'],
    essay_reviewer: ['pro', 'elite'],
    internships_preview: ['pro'],
    internships_full: ['elite'],
    scholarships_preview: ['pro'],
    scholarships: ['elite'],
    programs_preview: ['pro'],
    programs: ['elite'],
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
function openEssays() {
  if (!currentUser) { openAuthModal('login'); return; }
  closeSidebarOnMobile();
  $('essaysModal').style.display = 'flex';

  // Always show the essay form so free users can see what it does
  $('essaysContent').style.display = 'block';

  if (!canAccess('essay_reviewer')) {
    // Free users see the form but can't submit — show upgrade nudge below
    $('essaySubmitBtn').disabled = true;
    $('essaySubmitBtn').textContent = 'Upgrade to Coach for Essay Reviews';
    $('essayCreditsBar').style.display = 'none';
    $('essaysRequiresUpgrade').style.display = 'block';
  } else {
    $('essaySubmitBtn').disabled = false;
    $('essaySubmitBtn').textContent = 'Submit for Review (1 credit)';
    $('essayCreditsBar').style.display = 'flex';
    $('essaysRequiresUpgrade').style.display = 'none';
    loadEssayCredits();
  }
}

async function loadEssayCredits() {
  try {
    const res = await fetch(`${API_BASE}/essays/credits`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await res.json();
    $('essayCreditsCount').textContent = `${data.remaining || 0} reviews remaining`;
    $('essaySubmitBtn').disabled = (data.remaining || 0) === 0;
  } catch {}
}

async function submitEssayReview() {
  const essayText = $('essayText').value.trim();
  const essayType = $('essayType').value;
  const targetSchool = $('essayTargetSchool').value.trim();
  const prompt = $('essayPrompt').value.trim();

  if (essayText.length < 50) { showMsg('essaySubmitMsg', 'Essay must be at least 50 characters.', '#991b1b'); return; }

  $('essaySubmitBtn').disabled = true;
  $('essaySubmitBtn').textContent = 'Reviewing...';
  $('essayReviewResult').style.display = 'none';

  try {
    const res = await fetch(`${API_BASE}/essays/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
      body: JSON.stringify({ essayText, essayType, targetSchool, prompt })
    });
    const data = await res.json();

    if (data.error) {
      showMsg('essaySubmitMsg', data.error, '#991b1b');
      $('essaySubmitBtn').disabled = false;
      $('essaySubmitBtn').textContent = 'Submit for Review (1 credit)';
      return;
    }

    // Show result
    renderEssayReview(data.review);
    loadEssayCredits();
    $('essaySubmitBtn').textContent = 'Submit for Review (1 credit)';
    $('essaySubmitBtn').disabled = false;
  } catch {
    showMsg('essaySubmitMsg', 'Failed to submit essay.', '#991b1b');
    $('essaySubmitBtn').disabled = false;
    $('essaySubmitBtn').textContent = 'Submit for Review (1 credit)';
  }
}

function renderEssayReview(review) {
  const el = $('essayReviewResult');
  const r = review;
  const scoreClass = r.overallScore >= 8 ? 'score-high' : (r.overallScore >= 5 ? 'score-mid' : 'score-low');

  let html = `<div class="essay-result-card">
    <div class="essay-score ${scoreClass}">
      <div class="essay-score-num">${r.overallScore}</div>
      <div class="essay-score-label">out of 10</div>
    </div>`;

  if (r.voiceAssessment) {
    html += `<div class="essay-voice">
      <span class="voice-badge ${r.voiceAssessment.authentic ? 'authentic' : 'concern'}">
        ${r.voiceAssessment.authentic ? 'Authentic voice' : 'Voice concerns'}
      </span>
      ${r.voiceAssessment.sounds_like_teenager !== undefined ? `<span class="voice-badge ${r.voiceAssessment.sounds_like_teenager ? 'authentic' : 'concern'}">
        ${r.voiceAssessment.sounds_like_teenager ? 'Age-appropriate' : 'Sounds too polished'}
      </span>` : ''}
    </div>`;
  }

  if (r.strengths?.length) {
    html += `<div class="essay-section"><h4>Strengths</h4><ul>${r.strengths.map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ul></div>`;
  }

  if (r.improvements?.length) {
    html += `<div class="essay-section"><h4>Areas for Improvement</h4><ul>${r.improvements.map(i =>
      `<li><strong>${escapeHtml(i.area || '')}</strong>: ${escapeHtml(i.suggestion || i)}</li>`
    ).join('')}</ul></div>`;
  }

  if (r.structure) {
    html += `<div class="essay-section"><h4>Structure</h4><p>${escapeHtml(typeof r.structure === 'string' ? r.structure : JSON.stringify(r.structure))}</p></div>`;
  }

  html += `</div>`;
  el.innerHTML = html;
  el.style.display = 'block';
  el.scrollIntoView({ behavior: 'smooth' });
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
  if ($('internshipState').value) params.set('state', $('internshipState').value);
  if ($('internshipField').value) params.set('field', $('internshipField').value);
  if ($('internshipCost').value === 'paid') params.set('paid', 'true');
  if ($('internshipSearch').value.trim()) params.set('q', $('internshipSearch').value.trim());

  try {
    const res = await fetch(`${API_BASE}/internships/search?${params}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await res.json();
    $('internshipsLoading').style.display = 'none';
    renderToolResults('internshipsResults', data.results || [], data._fullAccess, data._previewMessage, 'internship');
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
  if ($('programCost').value) params.set('cost', $('programCost').value);
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
// Shared Tool Results Renderer
// ========================
function renderToolResults(containerId, results, fullAccess, previewMessage, type) {
  const el = $(containerId);

  if (!results.length) {
    el.innerHTML = `<div class="tool-empty">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      <p>No ${type}s found matching your filters. Try broadening your search.</p>
    </div>`;
    return;
  }

  let html = `<div class="tool-result-count">${results.length} result${results.length !== 1 ? 's' : ''}${!fullAccess ? ' (preview)' : ''}</div>`;

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
        ${item.paid ? '<span class="tool-tag paid">Paid</span>' : ''}
        ${item.field ? `<span class="tool-tag">${escapeHtml(item.field)}</span>` : ''}
      </div>
      <div class="tool-card-meta">
        ${item.company ? `<span>${escapeHtml(item.company)}</span>` : ''}
        ${item.location?.state ? `<span>${item.location.state}</span>` : ''}
        ${item.deadline ? `<span>Deadline: ${item.deadline}</span>` : ''}
      </div>
      ${item.description && !isPreview ? `<p class="tool-card-desc">${escapeHtml(item.description.slice(0, 200))}${item.description.length > 200 ? '...' : ''}</p>` : ''}
      ${item.url && fullAccess ? `<a href="${item.url}" target="_blank" rel="noopener" class="tool-card-link">Learn more</a>` : ''}
    </div>`;
  }

  if (type === 'scholarship') {
    const amountStr = item.amount?.max ? `Up to $${item.amount.max.toLocaleString()}` : (item.amount || 'Varies');
    return `<div class="tool-card ${isPreview ? 'preview' : ''}">
      <div class="tool-card-header">
        <h4>${escapeHtml(item.name || 'Scholarship')}</h4>
        <span class="tool-tag amount">${typeof amountStr === 'string' ? escapeHtml(amountStr) : amountStr}</span>
      </div>
      <div class="tool-card-meta">
        ${item.provider ? `<span>${escapeHtml(item.provider)}</span>` : ''}
        ${item.deadline ? `<span>Deadline: ${item.deadline}</span>` : ''}
        ${item.competitiveness ? `<span>${capitalize(item.competitiveness)}</span>` : ''}
      </div>
      ${item.url && fullAccess ? `<a href="${item.url}" target="_blank" rel="noopener" class="tool-card-link">Apply</a>` : ''}
    </div>`;
  }

  if (type === 'program') {
    return `<div class="tool-card ${isPreview ? 'preview' : ''}">
      <div class="tool-card-header">
        <h4>${escapeHtml(item.name || 'Program')}</h4>
        ${item.admissionsImpact ? `<span class="tool-tag impact-${item.admissionsImpact}">${capitalize(item.admissionsImpact.replace('_', ' '))}</span>` : ''}
        ${item.selectivity ? `<span class="tool-tag">${capitalize(item.selectivity.replace('_', ' '))}</span>` : ''}
      </div>
      <div class="tool-card-meta">
        ${item.provider ? `<span>${escapeHtml(item.provider)}</span>` : ''}
        ${item.category ? `<span>${capitalize(item.category)}</span>` : ''}
        ${item.cost?.type === 'free' || item.cost?.amount === 0 ? '<span class="tool-tag free">Free</span>' : ''}
        ${item.deadline ? `<span>Deadline: ${item.deadline}</span>` : ''}
      </div>
      ${item.url && fullAccess ? `<a href="${item.url}" target="_blank" rel="noopener" class="tool-card-link">Learn more</a>` : ''}
    </div>`;
  }

  return '';
}
