/**
 * Wayfinder Chat Application — v2
 *
 * Claude AI-style interface with:
 * - Collapsible sidebar with chat history
 * - Search across chats
 * - Copy/paste on messages
 * - Settings (general, account, privacy)
 * - Upgrade plans (Free, Premium, Pro)
 * - Time-of-day greeting
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

async function loadChatHistory() {
  if (!authToken) {
    showEmptyHistory();
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/history`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    chatHistoryCache = data.history || [];
    renderChatHistory(chatHistoryCache);
  } catch {
    showEmptyHistory();
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
  const planNames = { free: 'Wayfinder Free', premium: 'Wayfinder Premium', pro: 'Wayfinder Pro' };
  const planLimits = { free: 3, premium: 10, pro: 20 };
  const plan = currentUser.plan || 'free';
  $('currentPlanDisplay').innerHTML = `
    <span class="plan-name">${planNames[plan]}</span>
    <span class="plan-detail">${planLimits[plan]} Engine queries/day</span>
  `;

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
function setupUpgradeListeners() {
  $('upgradeModalClose').addEventListener('click', () => $('upgradeModal').style.display = 'none');
  $('upgradeModal').addEventListener('click', (e) => {
    if (e.target === $('upgradeModal')) $('upgradeModal').style.display = 'none';
  });

  $('planPremiumBtn').addEventListener('click', () => handlePlanUpgrade('premium'));
  $('planProBtn').addEventListener('click', () => handlePlanUpgrade('pro'));
}

function openUpgrade() {
  if (!currentUser) {
    openAuthModal('signup');
    return;
  }

  // Update button states based on current plan
  const plan = currentUser.plan || 'free';
  $('planFreeBtn').textContent = plan === 'free' ? 'Current Plan' : 'Free Plan';
  $('planFreeBtn').className = plan === 'free' ? 'plan-btn plan-btn-current' : 'plan-btn plan-btn-upgrade';

  $('planPremiumBtn').textContent = plan === 'premium' ? 'Current Plan' : 'Upgrade to Premium';
  $('planPremiumBtn').className = plan === 'premium' ? 'plan-btn plan-btn-current' : 'plan-btn plan-btn-upgrade';
  $('planPremiumBtn').disabled = plan === 'premium';

  $('planProBtn').textContent = plan === 'pro' ? 'Current Plan' : 'Upgrade to Pro';
  $('planProBtn').className = plan === 'pro' ? 'plan-btn plan-btn-current' : 'plan-btn plan-btn-upgrade';
  $('planProBtn').disabled = plan === 'pro';

  $('upgradeModal').style.display = 'flex';
}

async function handlePlanUpgrade(plan) {
  try {
    // Check if Stripe is configured
    const statusRes = await fetch(`${API_BASE}/stripe/status`);
    const statusData = await statusRes.json();

    if (!statusData.configured) {
      alert(`Stripe payments are being set up. Contact support@wayfinderai.org to upgrade to ${capitalize(plan)} in the meantime.`);
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
    const plan = params.get('plan') || 'premium';
    setTimeout(() => {
      alert(`Welcome to Wayfinder ${capitalize(plan)}! Your plan has been upgraded. Enjoy your additional Engine queries.`);
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
      `Invitation sent to ${data.invite.recipientEmail}! <button class="invite-copy-link" style="margin-left:4px;" onclick="navigator.clipboard.writeText('${inviteLink}').then(()=>{this.textContent='Copied!';setTimeout(()=>{this.textContent='Copy link'},2000)})">Copy link</button>`,
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
            ${!inv.redeemed && !inv.expired ? `<button class="invite-copy-link" onclick="navigator.clipboard.writeText('${link}').then(()=>{this.textContent='Copied!';setTimeout(()=>{this.textContent='Copy link'},2000)})">Copy link</button>` : ''}
            ${canDelete ? `<button class="invite-delete-btn" onclick="deleteInvite('${inv.code}')" title="Delete invitation">✕</button>` : ''}
          </div>
        </div>
      `;
    }).join('');
  } catch {
    // Non-critical
  }
}

// Make deleteInvite available globally for onclick handlers
window.deleteInvite = async function(code) {
  if (!authToken || !code) return;

  // Confirm deletion
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
};

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
// Utility
// ========================
function showMsg(id, text, color) {
  const el = $(id);
  el.textContent = text;
  el.style.color = color;
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 3000);
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
