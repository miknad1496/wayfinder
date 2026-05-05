import { Router } from 'express';
import { decryptUserFields } from '../services/crypto.js';
import { reloadPrompt } from '../services/claude.js';
import { invalidateCache, getKnowledgeDB } from '../services/knowledge.js';
import { listKnowledgeFiles, loadAllFeedback } from '../services/storage.js';
import { getScheduleStatus, forceRunScraper } from '../services/scraper-scheduler.js';
import { getSLMStatus, getSLMWarmStatus, invalidateSLMPromptCache } from '../services/slm.js';
import { getMemoryStats } from '../services/conversation-memory.js';
import { getRoutingStats } from '../services/telemetry.js';
import { getRoutingLog } from './chat.js';
import { verifyToken, isAdmin as checkIsAdmin, getVIPList, addVIP, removeVIP } from '../services/auth.js';
import { getIntelligenceAnalytics } from '../services/intelligence-analytics.js';
import { sendAdminDailyPulse } from '../services/email.js'; // PATCH140
import { promises as _fsP140 } from 'fs';
import { join as _join140, dirname as _dirname140 } from 'path';
import { fileURLToPath as _fu140 } from 'url';
const _DIR140 = _dirname140(_fu140(import.meta.url));
const _USERS_DIR140 = _join140(_DIR140, '..', 'data', 'users');
const _SESSIONS_DIR140 = _join140(_DIR140, '..', 'data', 'sessions');

const router = Router();

// ─── Admin Authentication Middleware ─────────────────────────
// ALL admin endpoints require a valid token from an admin user
router.use(async (req, res, next) => {
  try {
    // ── Internal task token fallback (for scheduled-task automation) ──
    // Allows external scheduled tasks to call admin endpoints without a user JWT.
    // Set INTERNAL_TASK_TOKEN as a long random secret on Render.
    const taskToken = req.headers['x-task-token'];
    if (taskToken && process.env.INTERNAL_TASK_TOKEN && taskToken === process.env.INTERNAL_TASK_TOKEN) {
      req.adminUser = { email: 'internal-task', isAdmin: true, _taskAuth: true };
      return next();
    }

    /* === REVAMP V2: QUERY-PARAM TOKEN FALLBACK === */
    // Query-param token fallback (for tools that can't set custom headers like
    // workspace web_fetch GET). Same secret as the x-task-token header.
    const qToken = req.query?.token;
    if (qToken && process.env.INTERNAL_TASK_TOKEN && qToken === process.env.INTERNAL_TASK_TOKEN) {
      req.adminUser = { email: 'internal-task', isAdmin: true, _taskAuth: true };
      return next();
    }

    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Admin authentication required' });
    }
    const user = await verifyToken(token);
    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    if (!user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    req.adminUser = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Authentication failed' });
  }
});

// POST /api/admin/reload-prompt - Reload system prompt from disk
router.post('/reload-prompt', async (req, res) => {
  try {
    reloadPrompt();
    res.json({ success: true, message: 'System prompt will be reloaded on next request' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reload prompt' });
  }
});

// POST /api/admin/reload-knowledge - Refresh knowledge base cache
router.post('/reload-knowledge', async (req, res) => {
  try {
    invalidateCache();
    res.json({ success: true, message: 'Knowledge cache cleared, will reload on next query' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reload knowledge base' });
  }
});

// GET /api/admin/knowledge-files - List all knowledge base files
router.get('/knowledge-files', async (req, res) => {
  try {
    const files = await listKnowledgeFiles();
    res.json({ files, count: files.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list knowledge files' });
  }
});

// GET /api/admin/knowledge-db - Get SQLite knowledge DB stats and query it
router.get('/knowledge-db', async (req, res) => {
  const db = await getKnowledgeDB();
  if (!db) {
    return res.json({
      available: false,
      message: 'SQLite knowledge DB not available. Install sql.js and run: python3 scripts/build-knowledge-db.py'
    });
  }
  const metadata = db.getMetadata();
  res.json({ available: true, metadata });
});

// GET /api/admin/knowledge-db/occupation/:soc - Get full occupation profile
router.get('/knowledge-db/occupation/:soc', async (req, res) => {
  const db = await getKnowledgeDB();
  if (!db) return res.status(503).json({ error: 'SQLite knowledge DB not available' });
  const profile = db.getOccupationProfile(req.params.soc);
  if (!profile) return res.status(404).json({ error: 'Occupation not found' });
  res.json(profile);
});

// GET /api/admin/knowledge-db/search?q=keyword - Search occupations
router.get('/knowledge-db/search', async (req, res) => {
  const db = await getKnowledgeDB();
  if (!db) return res.status(503).json({ error: 'SQLite knowledge DB not available' });
  const results = db.searchOccupations(req.query.q || '');
  res.json({ query: req.query.q, results, count: results.length });
});

// GET /api/admin/knowledge-db/h1b/:soc - Get H1B data for an occupation
router.get('/knowledge-db/h1b/:soc', async (req, res) => {
  const db = await getKnowledgeDB();
  if (!db) return res.status(503).json({ error: 'SQLite knowledge DB not available' });
  const occ = db.getH1BOccupation(req.params.soc);
  const companies = db.getH1BCompanies(req.params.soc, parseInt(req.query.limit) || 20);
  res.json({ occupation: occ, companies });
});

// GET /api/admin/slm-status - Get SLM service status + warm-up diagnostics
router.get('/slm-status', (req, res) => {
  const status = getSLMStatus();
  const warmStatus = getSLMWarmStatus();
  res.json({
    ...status,
    warm: warmStatus,
    env: {
      SLM_ENABLED: process.env.SLM_ENABLED || '(not set)',
      SLM_ENDPOINT: process.env.SLM_ENDPOINT ? '✓ set' : '✗ NOT SET',
      SLM_API_KEY: process.env.SLM_API_KEY ? '✓ set' : '✗ NOT SET',
      SLM_TIMEOUT: process.env.SLM_TIMEOUT || '(default 90000)',
      SLM_IDLE_TIMEOUT: process.env.SLM_IDLE_TIMEOUT || '(default 120000)',
    }
  });
});

// POST /api/admin/slm-warmup - Manually trigger SLM warm-up and return result
router.post('/slm-warmup', async (req, res) => {
  try {
    const { warmUpSLM } = await import('../services/slm.js');
    console.log('[ADMIN] Manual SLM warm-up triggered');
    const result = await warmUpSLM();
    const warmStatus = getSLMWarmStatus();
    res.json({ ...result, warmStatus });
  } catch (err) {
    res.json({ warmed: false, error: err.message });
  }
});

// POST /api/admin/reload-slm-prompt - Reload SLM system prompt
router.post('/reload-slm-prompt', (req, res) => {
  invalidateSLMPromptCache();
  res.json({ success: true, message: 'SLM prompt cache cleared' });
});

// GET /api/admin/dashboard - Get overall system stats
router.get('/dashboard', async (req, res) => {
  try {
    const [files, feedback] = await Promise.all([
      listKnowledgeFiles(),
      loadAllFeedback()
    ]);

    const last24h = feedback.filter(f => {
      const age = Date.now() - new Date(f.timestamp).getTime();
      return age < 24 * 60 * 60 * 1000;
    });

    res.json({
      knowledgeFiles: files.length,
      totalFeedback: feedback.length,
      feedback24h: last24h.length,
      satisfactionRate: feedback.length > 0
        ? ((feedback.filter(f => f.rating === 1).length / feedback.length) * 100).toFixed(1) + '%'
        : 'N/A',
      lowRatedQueries: feedback
        .filter(f => f.rating === -1)
        .slice(-5)
        .map(f => ({ question: f.userMessage, comment: f.comment, timestamp: f.timestamp }))
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load dashboard data' });
  }
});

// ─── Admin Stats Endpoint ──────────────────────────

// ---- /stats response cache: 60-second TTL ----
// Avoids re-reading every user file on every dashboard tab refresh.
let _statsCache = { at: 0, payload: null };
const STATS_TTL_MS = 60 * 1000;

// GET /api/admin/stats - Comprehensive dashboard stats
router.get('/stats', async (req, res) => {
  // Cache hit: serve stale-up-to-60s payload
  if (_statsCache.payload && Date.now() - _statsCache.at < STATS_TTL_MS) {
    return res.json({ ..._statsCache.payload, _cached: true, _ageMs: Date.now() - _statsCache.at });
  }
  try {
    const { promises: fs } = await import('fs');
    const { join, dirname } = await import('path');
    const { fileURLToPath } = await import('url');

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const DATA_DIR = join(__dirname, '..', 'data');
    const USERS_DIR = join(DATA_DIR, 'users');
    const SESSIONS_DIR = join(DATA_DIR, 'sessions');
    const INVITES_DIR = join(DATA_DIR, 'invites');
    const FEEDBACK_FILE = join(DATA_DIR, 'feedback', 'feedback.jsonl');

    // Utility: time boundaries
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Load all users
    const userFiles = await fs.readdir(USERS_DIR).catch(() => []);
    const users = await Promise.all(
      userFiles
        .filter(f => f.endsWith('.json'))
        .map(async f => {
          try {
            const raw = await fs.readFile(join(USERS_DIR, f), 'utf-8');
            return decryptUserFields(JSON.parse(raw));
          } catch {
            return null;
          }
        })
    );
    const validUsers = users.filter(Boolean);

    // User stats
    const totalUsers = validUsers.length;
    const usersByPlan = {
      free: validUsers.filter(u => (u.plan || 'free') === 'free').length,
      pro: validUsers.filter(u => u.plan === 'pro').length,
      elite: validUsers.filter(u => u.plan === 'elite').length
    };

    // Last 30 days signup trend
    const signupsByDate = {};
    validUsers.forEach(u => {
      const created = new Date(u.createdAt);
      if (created >= thirtyDaysAgo) {
        const dateStr = created.toISOString().split('T')[0];
        signupsByDate[dateStr] = (signupsByDate[dateStr] || 0) + 1;
      }
    });

    // Load all sessions
    const sessionFiles = await fs.readdir(SESSIONS_DIR).catch(() => []);
    const sessions = await Promise.all(
      sessionFiles
        .filter(f => f.endsWith('.json'))
        .map(async f => {
          try {
            const raw = await fs.readFile(join(SESSIONS_DIR, f), 'utf-8');
            return JSON.parse(raw);
          } catch {
            return null;
          }
        })
    );
    const validSessions = sessions.filter(Boolean);

    // Session stats
    const totalSessions = validSessions.length;
    const totalMessages = validSessions.reduce((sum, s) => sum + (s.messageCount || 0), 0);
    const avgMessagesPerSession = totalSessions > 0 ? (totalMessages / totalSessions).toFixed(1) : 0;

    // Active users (by last active session)
    const activeUsersToday = new Set();
    const activeUsersThisWeek = new Set();
    const activeUsersThisMonth = new Set();

    validSessions.forEach(s => {
      const lastActive = new Date(s.lastActive || s.created);
      if (lastActive >= today) activeUsersToday.add(s.id);
      if (lastActive >= sevenDaysAgo) activeUsersThisWeek.add(s.id);
      if (lastActive >= thirtyDaysAgo) activeUsersThisMonth.add(s.id);
    });

    // Load feedback
    const feedback = await (async () => {
      try {
        const raw = await fs.readFile(FEEDBACK_FILE, 'utf-8');
        return raw
          .trim()
          .split('\n')
          .filter(Boolean)
          .map(line => {
            try {
              return JSON.parse(line);
            } catch {
              return null;
            }
          })
          .filter(Boolean);
      } catch {
        return [];
      }
    })();

    // Feedback stats
    const feedbackCount = feedback.length;
    const feedbackToday = feedback.filter(f => {
      const ts = new Date(f.timestamp);
      return ts >= today;
    }).length;

    // Rating distribution
    const ratingDist = {
      positive: feedback.filter(f => f.rating === 1).length,
      neutral: feedback.filter(f => f.rating === 0).length,
      negative: feedback.filter(f => f.rating === -1).length
    };

    // Top users by message count
    const topUsersByMessages = validUsers
      .map(u => ({
        email: u.email,
        name: u.name,
        messageCount: (u.sessionHistory || []).reduce((sum, sessionId) => {
          const session = validSessions.find(s => s.id === sessionId);
          return sum + (session ? session.messageCount || 0 : 0);
        }, 0)
      }))
      .filter(u => u.messageCount > 0)
      .sort((a, b) => b.messageCount - a.messageCount)
      .slice(0, 10);

    // Engine queries (sum of engineUsesToday across all users)
    const engineQueriesToday = validUsers.reduce((sum, u) => {
      const today_str = new Date().toISOString().slice(0, 10);
      if (u.engineLastReset === today_str) {
        return sum + (u.engineUsesToday || 0);
      }
      return sum;
    }, 0);

    // Token usage
    const today_str = new Date().toISOString().slice(0, 10);
    const thisMonth_str = new Date().toISOString().slice(0, 7);
    const tokenUsageToday = validUsers.reduce((sum, u) => {
      if (u.tokenLastReset === today_str) {
        return sum + (u.tokensUsedToday || 0);
      }
      return sum;
    }, 0);
    const tokenUsageMonth = validUsers.reduce((sum, u) => {
      if (u.tokenMonthReset === thisMonth_str) {
        return sum + (u.tokensUsedMonth || 0);
      }
      return sum;
    }, 0);

    // Revenue metrics
    const usersWithStripe = validUsers.filter(u => u.stripeCustomerId).length;
    const proUsers = usersByPlan.pro;
    const eliteUsers = usersByPlan.elite;
    // Potential MRR: pro users * $25 + elite users * $50
    const potentialMRR = (proUsers * 25) + (eliteUsers * 50);

    // Load all invites for per-user invite counts
    const inviteFiles = await fs.readdir(INVITES_DIR).catch(() => []);
    const invites = (await Promise.all(
      inviteFiles.filter(f => f.endsWith('.json')).map(async f => {
        try {
          const raw = await fs.readFile(join(INVITES_DIR, f), 'utf-8');
          return JSON.parse(raw);
        } catch { return null; }
      })
    )).filter(Boolean);

    // Build full user list with invite counts
    const allUsersList = validUsers.map(u => {
      const plan = u.plan === 'premium' ? 'pro' : (u.plan || 'free');
      const sentInvites = invites.filter(inv => inv.inviterId === u.id);
      const pendingInvites = sentInvites.filter(inv => !inv.redeemedAt && new Date(inv.expiresAt) > now);
      const redeemedInvites = sentInvites.filter(inv => inv.redeemedAt);
      return {
        name: u.name || '(no name)',
        email: u.email,
        plan,
        createdAt: u.createdAt,
        lastLogin: u.lastLogin,
        invitesSent: sentInvites.length,
        invitesPending: pendingInvites.length,
        invitesRedeemed: redeemedInvites.length
      };
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    _statsCache = { at: Date.now(), payload: {
      timestamp: new Date().toISOString(),
      overview: {
        totalUsers,
        totalSessions,
        totalMessages,
        avgMessagesPerSession
      },
      users: {
        byPlan: usersByPlan,
        activeToday: activeUsersToday.size,
        activeThisWeek: activeUsersThisWeek.size,
        activeThisMonth: activeUsersThisMonth.size,
        signupTrend: signupsByDate,
        topUsersByMessages,
        allUsers: allUsersList
      },
      usage: {
        engineQueriesToday,
        tokenUsageToday,
        tokenUsageMonth,
        totalFeedback: feedbackCount,
        feedbackToday,
        feedbackRating: ratingDist
      },
      revenue: {
        usersWithStripe,
        proUsers,
        eliteUsers,
        potentialMRR
      }
    } }; res.json({ ..._statsCache.payload, _cached: false });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Failed to load stats' });
  }
});

// ─── Conversation Memory Stats ────────────────────────────────

// GET /api/admin/memory-stats - Get conversation memory + training data stats
router.get('/memory-stats', async (req, res) => {
  try {
    const stats = await getMemoryStats();
    res.json({
      success: true,
      memory: {
        entries: stats.memoryEntries,
        files: stats.memoryFiles,
        description: 'Q&A pairs captured for RAG retrieval'
      },
      training: {
        pairs: stats.trainingPairs,
        files: stats.trainingFiles,
        description: 'SLM fine-tuning data in OpenAI JSONL format'
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load memory stats' });
  }
});

// GET /api/admin/routing-log - Last 20 routing decisions with all variables
router.get('/routing-log', (req, res) => {
  res.json({ decisions: getRoutingLog() });
});

// GET /api/admin/routing-stats - Get routing tier breakdown since last deploy
router.get('/routing-stats', (req, res) => {
  try {
    const routing = getRoutingStats();
    const slm = getSLMWarmStatus();
    res.json({
      success: true,
      routing,
      slm: {
        state: slm.state,
        available: slm.available,
        warmLatencyMs: slm.warmLatencyMs,
        lastWarmAt: slm.lastWarmAt || null,
        idleTimeoutMs: slm.idleTimeoutMs || null,
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load routing stats' });
  }
});

// ─── Scraper Scheduler Admin Endpoints ──────────────────────────

// GET /api/admin/scrapers - Get all scraper schedule status
router.get('/scrapers', async (req, res) => {
  try {
    const status = await getScheduleStatus();
    res.json({ scrapers: status });
  } catch (err) {
    console.error('Scraper status error:', err);
    res.status(500).json({ error: 'Failed to load scraper status' });
  }
});

// POST /api/admin/scrapers/:key/run - Force-run a specific scraper
router.post('/scrapers/:key/run', async (req, res) => {
  try {
    const result = await forceRunScraper(req.params.key);
    if (result.error) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (err) {
    console.error('Force-run scraper error:', err);
    res.status(500).json({ error: 'Failed to run scraper' });
  }
});

// ─── VIP Management ────────────────────────────────────────

// GET /api/admin/vip - Get current VIP list
router.get('/vip', (req, res) => {
  res.json({ vipEmails: getVIPList() });
});

// POST /api/admin/vip - Add a VIP email
router.post('/vip', (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email required' });
  }
  const added = addVIP(email);
  res.json({ success: true, added, vipEmails: getVIPList() });
});

// DELETE /api/admin/vip - Remove a VIP email
router.delete('/vip', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }
  const removed = removeVIP(email);
  res.json({ success: true, removed, vipEmails: getVIPList() });
});

// ─── Intelligence Analytics ───────────────────────────────

// GET /api/admin/intelligence-analytics - Get AI layer performance stats
router.get('/intelligence-analytics', (req, res) => {
  try {
    const analytics = getIntelligenceAnalytics();
    res.json({ success: true, analytics });
  } catch (err) {
    console.error('Intelligence analytics error:', err);
    res.status(500).json({ error: 'Failed to load intelligence analytics' });
  }
});

// ─── Per-User Token & API Activity ─────────────────────────

// GET /api/admin/user-activity - Get per-user token/engine/message usage
// REVAMP V2: SLM USAGE TRACKING PATCH54 — top-N users by SLM token consumption (per Dan request).
router.get('/slm-usage', async (req, res) => {
  try {
    const { promises: fs } = await import('fs');
    const { join, dirname } = await import('path');
    const { fileURLToPath } = await import('url');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const USERS_DIR = join(__dirname, '..', 'data', 'users');
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 25));
    const today_str = new Date().toISOString().slice(0, 10);
    const thisMonth_str = new Date().toISOString().slice(0, 7);

    const userFiles = await fs.readdir(USERS_DIR).catch(() => []);
    const users = await Promise.all(
      userFiles.filter(f => f.endsWith('.json')).map(async f => {
        try {
          const raw = await fs.readFile(join(USERS_DIR, f), 'utf-8');
          return decryptUserFields(JSON.parse(raw));
        } catch { return null; }
      })
    );

    const rows = users.filter(Boolean).map(u => ({
      email: u.email,
      name: u.name || '',
      plan: u.plan || 'free',
      slmTokensToday: (u.slmDayReset === today_str) ? (u.slmTokensToday || 0) : 0,
      slmTokensMonth: (u.slmMonthReset === thisMonth_str) ? (u.slmTokensMonth || 0) : 0,
      messagesUsedToday: (u.messageLastDayReset === today_str) ? (u.messagesUsedToday || 0) : 0,
      lastLogin: u.lastLogin || null,
    }))
    .sort((a, b) => b.slmTokensMonth - a.slmTokensMonth)
    .slice(0, limit);

    const totals = {
      slmTokensTodayAll: rows.reduce((s, r) => s + r.slmTokensToday, 0),
      slmTokensMonthAll: rows.reduce((s, r) => s + r.slmTokensMonth, 0),
      activeUsersToday: rows.filter(r => r.slmTokensToday > 0).length,
    };
    res.json({ totals, top: rows });
  } catch (err) {
    console.error('[admin/slm-usage] error:', err);
    res.status(500).json({ error: 'Failed to load SLM usage: ' + err.message });
  }
});

router.get('/user-activity', async (req, res) => {
  try {
    const { promises: fs } = await import('fs');
    const { join, dirname } = await import('path');
    const { fileURLToPath } = await import('url');

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const USERS_DIR = join(__dirname, '..', 'data', 'users');

    const userFiles = await fs.readdir(USERS_DIR).catch(() => []);
    const today_str = new Date().toISOString().slice(0, 10);
    const thisMonth_str = new Date().toISOString().slice(0, 7);

    const users = await Promise.all(
      userFiles.filter(f => f.endsWith('.json')).map(async f => {
        try {
          const raw = await fs.readFile(join(USERS_DIR, f), 'utf-8');
          return decryptUserFields(JSON.parse(raw));
        } catch { return null; }
      })
    );

    const activity = users.filter(Boolean).map(u => ({
      email: u.email,
      name: u.name || '(no name)',
      plan: u.plan || 'free',
      engineUsesToday: (u.engineLastReset === today_str) ? (u.engineUsesToday || 0) : 0,
      tokensUsedToday: (u.tokenLastReset === today_str) ? (u.tokensUsedToday || 0) : 0,
      tokensUsedMonth: (u.tokenMonthReset === thisMonth_str) ? (u.tokensUsedMonth || 0) : 0,
      messagesUsedToday: (u.messageLastReset === today_str) ? (u.messagesUsedToday || 0) : 0,
      messagesUsedMonth: (u.messageMonthReset === thisMonth_str) ? (u.messagesUsedMonth || 0) : 0,
      essayCreditsRemaining: u.essayReviewsRemaining || 0,
      lastLogin: u.lastLogin || null
    }))
    .sort((a, b) => (b.tokensUsedToday + b.tokensUsedMonth) - (a.tokensUsedToday + a.tokensUsedMonth));

    res.json({ activity });
  } catch (err) {
    console.error('User activity error:', err);
    res.status(500).json({ error: 'Failed to load user activity' });
  }
});


// REVAMP V2: ADMIN USER-SESSIONS PATCH34 — retrieve a specific user's recent chat sessions for diagnostic review
// GET /api/admin/user-sessions/:emailOrId?limit=10
router.get('/user-sessions/:emailOrId', async (req, res) => {
  try {
    const { promises: fs } = await import('fs');
    const { join, dirname } = await import('path');
    const { fileURLToPath } = await import('url');

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const USERS_DIR = join(__dirname, '..', 'data', 'users');
    const SESSIONS_DIR = join(__dirname, '..', 'data', 'sessions');

    const raw = String(req.params.emailOrId || '').trim();
    if (!raw) return res.status(400).json({ error: 'emailOrId is required' });
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));

    // Resolve user — try as email first (slug-normalized), then scan for id
    const slug = raw.toLowerCase().replace(/[^a-z0-9]/g, '_');
    let userFile = join(USERS_DIR, slug + '.json');
    let user = null;
    try {
      const txt = await fs.readFile(userFile, 'utf-8');
      user = decryptUserFields(JSON.parse(txt));
    } catch {
      // Fallback: scan all user files for a matching id or substring email match
      const files = await fs.readdir(USERS_DIR).catch(() => []);
      for (const f of files) {
        if (!f.endsWith('.json')) continue;
        try {
          const txt = await fs.readFile(join(USERS_DIR, f), 'utf-8');
          const u = decryptUserFields(JSON.parse(txt));
          if (u.id === raw || (u.email && u.email.toLowerCase().includes(raw.toLowerCase()))) {
            user = u;
            userFile = join(USERS_DIR, f);
            break;
          }
        } catch { /* skip unreadable */ }
      }
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found by email or id: ' + raw });
    }

    const sessionIds = Array.isArray(user.sessionHistory) ? user.sessionHistory.slice() : [];
    // Most recent first — sessionHistory is appended in chronological order
    const recent = sessionIds.slice(-limit).reverse();

    const sessions = [];
    let missing = 0;
    let totalMessages = 0;
    let mostRecentAt = null;

    for (const sid of recent) {
      // Sanity check the id (mirror storage.js sanitization)
      if (!/^[a-zA-Z0-9_-]+$/.test(sid) || sid.length > 128) { missing++; continue; }
      const filePath = join(SESSIONS_DIR, sid + '.json');
      try {
        const txt = await fs.readFile(filePath, 'utf-8');
        const session = JSON.parse(txt);
        const msgCount = Array.isArray(session.history) ? session.history.length : 0;
        totalMessages += msgCount;
        const ts = session.lastUpdated || session.created;
        if (ts && (!mostRecentAt || ts > mostRecentAt)) mostRecentAt = ts;
        sessions.push({
          id: session.id || sid,
          created: session.created || null,
          lastUpdated: session.lastUpdated || null,
          messageCount: msgCount,
          mode: session.mode || null,
          context: session.context || {},
          history: session.history || [],
        });
      } catch {
        missing++;
      }
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name || '',
        plan: user.plan || 'free',
        userType: user.userType || 'student',
        school: user.school || '',
        createdAt: user.createdAt || null,
        lastLogin: user.lastLogin || null,
        engineUsesToday: user.engineUsesToday || 0,
        messagesUsedToday: user.messagesUsedToday || 0,
        messagesUsedMonth: user.messagesUsedMonth || 0,
        profile: user.profile || {},
        sessionCount: sessionIds.length,
      },
      sessions,
      summary: {
        totalSessions: sessionIds.length,
        returnedSessions: sessions.length,
        missingSessions: missing,
        avgMessagesPerSession: sessions.length > 0 ? Math.round((totalMessages / sessions.length) * 10) / 10 : 0,
        mostRecentAt,
      },
    });
  } catch (err) {
    console.error('user-sessions error:', err);
    res.status(500).json({ error: 'Failed to load user sessions: ' + err.message });
  }
});


// ─── PII Protection — backfill + audit endpoints (Apr 2026) ─────────

import { redactPII } from '../services/pii-redactor.js';

// POST /api/admin/pii-backfill — Run the backfill script in-process
router.post('/pii-backfill', async (req, res) => {
  try {
    const { promises: fs } = await import('fs');
    const { join, dirname } = await import('path');
    const { fileURLToPath } = await import('url');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const DATA_DIR = join(__dirname, '..', 'data');
    const MEMORY_DIR = join(DATA_DIR, 'memory');
    const TRAINING_DIR = join(DATA_DIR, 'training-capture');

    const stats = { files: 0, filesModified: 0, entriesScanned: 0, entriesAlreadyRedacted: 0, entriesRedactedNow: 0, redactionsByType: {}, errors: [] };

    function applyToEntry(entry) {
      if (entry?.piiRedacted || entry?._piiRedacted) { stats.entriesAlreadyRedacted++; return { entry, changed: false }; }
      let touched = false; const types = new Set();
      for (const f of ['query', 'response', 'userMessage']) {
        if (typeof entry[f] === 'string') {
          const r = redactPII(entry[f]);
          if (r.redactedCount > 0) { entry[f] = r.text; touched = true; r.types.forEach(t => types.add(t)); stats.entriesRedactedNow++; }
        }
      }
      if (Array.isArray(entry.messages)) {
        for (const m of entry.messages) {
          if (m && typeof m.content === 'string' && m.role !== 'system') {
            const r = redactPII(m.content);
            if (r.redactedCount > 0) { m.content = r.text; touched = true; r.types.forEach(t => types.add(t)); }
          }
        }
      }
      if (touched) {
        const rec = { count: types.size, types: Array.from(types), at: new Date().toISOString(), backfill: true };
        if (entry.messages) entry._piiRedacted = rec; else entry.piiRedacted = rec;
        types.forEach(t => { stats.redactionsByType[t] = (stats.redactionsByType[t] || 0) + 1; });
      }
      return { entry, changed: touched };
    }

    async function processFile(filepath) {
      stats.files++;
      const raw = await fs.readFile(filepath, 'utf8').catch(() => null);
      if (!raw) { stats.errors.push({ file: filepath, error: 'read failed' }); return; }
      const lines = raw.split('\n'); const out = []; let changed = false;
      for (const line of lines) {
        if (!line.trim()) { out.push(line); continue; }
        let entry; try { entry = JSON.parse(line); } catch { out.push(line); continue; }
        stats.entriesScanned++;
        const r = applyToEntry(entry); if (r.changed) changed = true;
        out.push(JSON.stringify(r.entry));
      }
      if (changed) {
        const tmp = filepath + '.bf.tmp';
        await fs.writeFile(tmp, out.join('\n'));
        await fs.rename(tmp, filepath);
        stats.filesModified++;
      }
    }

    async function listJsonl(dir) {
      try { return (await fs.readdir(dir)).filter(n => n.endsWith('.jsonl')).map(n => join(dir, n)); }
      catch { return []; }
    }

    const memFiles = await listJsonl(MEMORY_DIR);
    const trnFiles = await listJsonl(TRAINING_DIR);
    for (const f of [...memFiles, ...trnFiles]) await processFile(f);

    res.json({ success: true, stats });
  } catch (err) {
    console.error('[pii-backfill] error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/memory-recent?days=7 — Fetch recent memory entries for audit
// Returns entries from the last N days, with a stable index for patching.
router.get('/memory-recent', async (req, res) => {
  try {
    const days = Math.min(parseInt(req.query.days || '7', 10), 30);
    const { promises: fs } = await import('fs');
    const { join, dirname } = await import('path');
    const { fileURLToPath } = await import('url');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const MEMORY_DIR = join(__dirname, '..', 'data', 'memory');
    const TRAINING_DIR = join(__dirname, '..', 'data', 'training-capture');

    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    const out = { memory: [], training: [], totalEntries: 0 };

    async function collect(dir, kind) {
      try {
        const files = await fs.readdir(dir);
        for (const file of files.filter(f => f.endsWith('.jsonl'))) {
          const filepath = join(dir, file);
          const raw = await fs.readFile(filepath, 'utf8');
          const lines = raw.split('\n');
          for (let i = 0; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            let e; try { e = JSON.parse(lines[i]); } catch { continue; }
            if (e._claudeAudited) continue;
            const ts = e.timestamp || e.metadata?.timestamp;
            if (ts && new Date(ts).getTime() < cutoff) continue;
            const ref = { _file: file, _line: i, kind };
            if (kind === 'memory') out.memory.push({ ...ref, query: e.query, response: e.response });
            else out.training.push({ ...ref, messages: e.messages?.filter(m => m.role !== 'system') });
            out.totalEntries++;
          }
        }
      } catch (err) { /* dir may not exist */ }
    }

    await collect(MEMORY_DIR, 'memory');
    await collect(TRAINING_DIR, 'training');
    res.json({ success: true, days, ...out });
  } catch (err) {
    console.error('[memory-recent] error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/memory-patch — Apply audit patches
// Body: { patches: [{ kind, file, line, query?, response?, messageContents? }] }
// where messageContents = ['user content...', 'assistant content...'] (system stripped)
router.post('/memory-patch', async (req, res) => {
  try {
    const patches = Array.isArray(req.body?.patches) ? req.body.patches : [];
    if (patches.length === 0) return res.json({ success: true, applied: 0 });

    const { promises: fs } = await import('fs');
    const { join, dirname } = await import('path');
    const { fileURLToPath } = await import('url');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const MEMORY_DIR = join(__dirname, '..', 'data', 'memory');
    const TRAINING_DIR = join(__dirname, '..', 'data', 'training-capture');

    // Group patches by file
    const byFile = new Map();
    for (const p of patches) {
      const dir = p.kind === 'training' ? TRAINING_DIR : MEMORY_DIR;
      const key = join(dir, p.file);
      if (!byFile.has(key)) byFile.set(key, []);
      byFile.get(key).push(p);
    }

    let applied = 0;
    for (const [filepath, ps] of byFile) {
      const raw = await fs.readFile(filepath, 'utf8').catch(() => null);
      if (!raw) continue;
      const lines = raw.split('\n');
      for (const p of ps) {
        if (typeof p.line !== 'number' || !lines[p.line]) continue;
        let e; try { e = JSON.parse(lines[p.line]); } catch { continue; }
        if (p.kind === 'memory') {
          if (typeof p.query === 'string') e.query = p.query;
          if (typeof p.response === 'string') e.response = p.response;
        } else if (p.kind === 'training' && Array.isArray(p.messageContents) && Array.isArray(e.messages)) {
          let idx = 0;
          for (const m of e.messages) {
            if (m.role === 'system') continue;
            if (idx < p.messageContents.length && typeof p.messageContents[idx] === 'string') {
              m.content = p.messageContents[idx];
            }
            idx++;
          }
        }
        e._claudeAudited = { at: new Date().toISOString() };
        lines[p.line] = JSON.stringify(e);
        applied++;
      }
      const tmp = filepath + '.patch.tmp';
      await fs.writeFile(tmp, lines.join('\n'));
      await fs.rename(tmp, filepath);
    }

    res.json({ success: true, applied });
  } catch (err) {
    console.error('[memory-patch] error:', err);
    res.status(500).json({ error: err.message });
  }
});


/* === WAYFINDER REVAMP V2: GRINDER-WRITE ENDPOINT === */
// POST /api/admin/grinder-write — atomic multi-file commit endpoint for scheduled-task grinders.
// Replaces the bash + git clone + node + helper pattern with a single HTTP call.
// Applies a list of operations server-side and writes them all in ONE git commit
// via the GitHub Git Data API (blob -> tree -> commit -> ref).
//
// Auth: x-task-token header OR ?token=<INTERNAL_TASK_TOKEN> query param.
//   (Header preferred; query-param fallback is for tools that can't set custom headers.)
//
// Body (POST): { operations: [...], message: "..." }
// Or GET: ?token=...&ops=<base64-of-the-JSON-body>
//
// Supported operations (each must include "path"):
//   { op:"append-array", path:".json", key:"programs", items:[...] }
//   { op:"prepend-array-section-items", path:".json", sectionId:"field-notes", items:[...], max:30 }
//   { op:"set", path:".json", key:"metadata.totalCount", value: 950 }
//   { op:"merge", path:".json", value: { ...shallowMergeIntoRoot } }
//   { op:"rewrite", path:"any", content:"<full new content>" }
//   { op:"append-text", path:".md|.txt", text:"..." }
//   { op:"prepend-text", path:".md|.txt", text:"..." }
//
// Returns { ok:true, commit:<sha>, commitUrl, pathsTouched:[...] }
router.all('/grinder-write', async (req, res) => {
  try {
    // Auth: query-param token works alongside the middleware's x-task-token header
    if (!req.adminUser?._taskAuth) {
      const qTok = req.query?.token;
      if (qTok && process.env.INTERNAL_TASK_TOKEN && qTok === process.env.INTERNAL_TASK_TOKEN) {
        // already passed top middleware — nothing to do
      } else if (!req.adminUser) {
        return res.status(401).json({ error: 'auth required' });
      }
    }

    let body = req.method === 'POST' ? (req.body || {}) : {};
    if ((!body || !body.operations) && req.query?.ops) {
      try {
        body = JSON.parse(Buffer.from(String(req.query.ops), 'base64').toString('utf8'));
      } catch (e) {
        return res.status(400).json({ error: 'Invalid ops query param: ' + e.message });
      }
    }
    const operations = Array.isArray(body.operations) ? body.operations : null;
    const message = body.message;
    if (!operations || !operations.length || !message) {
      return res.status(400).json({ error: 'body must include { operations:[...], message:"..." }' });
    }

    const owner = process.env.WAYFINDER_GH_OWNER || 'miknad1496';
    const repoName = process.env.WAYFINDER_GH_REPO || 'wayfinder';
    const branch = process.env.WAYFINDER_GH_BRANCH || 'main';
    const ghToken = process.env.WAYFINDER_GH_TOKEN || process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
    if (!ghToken) return res.status(500).json({ error: 'WAYFINDER_GH_TOKEN env not set' });

    const ghHeaders = {
      'User-Agent': 'wayfinder-grinder-write',
      'Accept': 'application/vnd.github+json',
      'Authorization': 'Bearer ' + ghToken,
      'X-GitHub-Api-Version': '2022-11-28',
    };
    const gh = async (method, urlPath, json) => {
      const r = await fetch('https://api.github.com' + urlPath, {
        method,
        headers: { ...ghHeaders, ...(json ? { 'Content-Type': 'application/json' } : {}) },
        body: json ? JSON.stringify(json) : undefined,
      });
      if (!r.ok) {
        const txt = await r.text();
        throw new Error('GitHub ' + method + ' ' + urlPath + ' -> ' + r.status + ': ' + txt.slice(0, 400));
      }
      return r.json();
    };

    // 1. Get base commit + tree
    const ref = await gh('GET', '/repos/' + owner + '/' + repoName + '/git/ref/heads/' + branch);
    const baseCommitSha = ref.object.sha;
    const baseCommit = await gh('GET', '/repos/' + owner + '/' + repoName + '/git/commits/' + baseCommitSha);
    const baseTreeSha = baseCommit.tree.sha;

    /* === REVAMP V2: GRINDER-WRITE READ-AT-COMMIT-SHA === */
    // 2. Fetch current content for each path touched.
    //    IMPORTANT: pin the read to the *commit SHA* (immutable), not the
    //    branch ref. GitHub's contents API at ?ref=<branch> is eventually
    //    consistent — when two writes land within ~30s, the second one can
    //    read stale content and silently revert the first. Reading at the
    //    commit SHA we just resolved from the ref guarantees a consistent read.
    const pathsToTouch = new Set();
    for (const op of operations) if (op.path) pathsToTouch.add(op.path);

    const fileContents = {};
    for (const p of pathsToTouch) {
      try {
        const enc = p.split('/').map(encodeURIComponent).join('/');
        const f = await gh('GET', '/repos/' + owner + '/' + repoName + '/contents/' + enc + '?ref=' + encodeURIComponent(baseCommitSha));
        if (f.encoding === 'base64' && f.content) {
          fileContents[p] = Buffer.from(String(f.content).replace(/\n/g, ''), 'base64').toString('utf8');
        } else if (f.download_url) {
          const r = await fetch(f.download_url, { headers: { 'User-Agent': 'wayfinder-grinder-write' } });
          if (!r.ok) throw new Error('Raw fetch ' + f.download_url + ' -> ' + r.status);
          fileContents[p] = await r.text();
        } else {
          throw new Error('Unexpected getFile shape for ' + p);
        }
      } catch (e) {
        if (String(e.message).includes('-> 404')) {
          fileContents[p] = ''; // new file
        } else {
          throw e;
        }
      }
    }

    // 3. Parse JSON paths
    const isJson = (p) => p.endsWith('.json');
    const dataObjects = {};
    for (const p of Object.keys(fileContents)) {
      if (isJson(p)) {
        try {
          dataObjects[p] = fileContents[p] ? JSON.parse(fileContents[p]) : {};
        } catch (e) {
          return res.status(500).json({ error: 'Failed to parse JSON for ' + p + ': ' + e.message });
        }
      }
    }

    function setNested(obj, dottedKey, value) {
      const keys = dottedKey.split('.');
      let cur = obj;
      for (let i = 0; i < keys.length - 1; i++) {
        if (typeof cur[keys[i]] !== 'object' || cur[keys[i]] === null) cur[keys[i]] = {};
        cur = cur[keys[i]];
      }
      cur[keys[keys.length - 1]] = value;
    }
    function getNested(obj, dottedKey) {
      const keys = dottedKey.split('.');
      let cur = obj;
      for (const k of keys) { if (cur == null) return undefined; cur = cur[k]; }
      return cur;
    }

    // REVAMP V2: VALIDATION GATE PATCH32 — capture pre-mutation array counts for diff-sanity check
    const _v32_preCounts = {};
    const _v32_TRACKED_KEYS = ['programs', 'internships', 'scholarships', 'opportunities'];
    for (const _v32_p of Object.keys(dataObjects)) {
      const _v32_data = dataObjects[_v32_p];
      for (const _v32_k of _v32_TRACKED_KEYS) {
        if (Array.isArray(_v32_data && _v32_data[_v32_k])) {
          _v32_preCounts[_v32_p + ':' + _v32_k] = _v32_data[_v32_k].length;
        }
      }
    }

    // 4. Apply operations
    for (const op of operations) {
      const p = op.path;
      if (!p) return res.status(400).json({ error: 'op missing path: ' + JSON.stringify(op).slice(0,200) });

      switch (op.op) {
        case 'append-array': {
          if (!isJson(p)) return res.status(400).json({ error: 'append-array requires .json path: ' + p });
          const data = dataObjects[p];
          const arr = Array.isArray(getNested(data, op.key)) ? getNested(data, op.key) : [];
          setNested(data, op.key, arr.concat(op.items || []));
          break;
        }
        case 'prepend-array-section-items': {
          if (!isJson(p)) return res.status(400).json({ error: 'prepend-array-section-items requires .json: ' + p });
          const data = dataObjects[p];
          const sections = Array.isArray(data.sections) ? data.sections : [];
          const sec = sections.find(s => s && s.id === op.sectionId);
          if (!sec) return res.status(400).json({ error: 'Section not found in ' + p + ': ' + op.sectionId });
          const merged = (op.items || []).concat(Array.isArray(sec.items) ? sec.items : []);
          sec.items = (op.max && merged.length > op.max) ? merged.slice(0, op.max) : merged;
          break;
        }
        case 'set': {
          if (!isJson(p)) return res.status(400).json({ error: 'set requires .json: ' + p });
          setNested(dataObjects[p], op.key, op.value);
          break;
        }
        case 'merge': {
          if (!isJson(p)) return res.status(400).json({ error: 'merge requires .json: ' + p });
          Object.assign(dataObjects[p], op.value || {});
          break;
        }
        case 'rewrite': {
          if (isJson(p)) {
            try { dataObjects[p] = JSON.parse(op.content); }
            catch (e) { return res.status(400).json({ error: 'rewrite content not valid JSON for ' + p + ': ' + e.message }); }
          } else {
            fileContents[p] = String(op.content == null ? '' : op.content);
          }
          break;
        }
        case 'append-text': {
          if (isJson(p)) return res.status(400).json({ error: 'append-text not for .json: ' + p });
          fileContents[p] = (fileContents[p] || '') + String(op.text || '');
          break;
        }
        case 'prepend-text': {
          if (isJson(p)) return res.status(400).json({ error: 'prepend-text not for .json: ' + p });
          fileContents[p] = String(op.text || '') + (fileContents[p] || '');
          break;
        }
        /* === REVAMP V2: UPDATE-ARRAY-ITEMS OP === */
        case 'update-array-items': {
          // op: { op:"update-array-items", path:".json", key:"programs",
          //       updates:[ { match:{name:"...",provider:"..."}, set:{...fields...}, unset?:[...] } ] }
          // Matches strings case/whitespace-insensitively, other types strictly.
          // Soft-skips items that don't match (returned in updateReports).
          if (!isJson(p)) return res.status(400).json({ error: 'update-array-items requires .json: ' + p });
          const data = dataObjects[p];
          const arr = getNested(data, op.key);
          if (!Array.isArray(arr)) return res.status(400).json({ error: 'update-array-items: key did not resolve to array: ' + op.key });
          const updates = Array.isArray(op.updates) ? op.updates : [];
          const notFound = [];
          let updated = 0;
          for (const u of updates) {
            if (!u.match || typeof u.match !== 'object') { notFound.push({ match: u.match, reason: 'invalid match' }); continue; }
            const idx = arr.findIndex(item => {
              if (!item || typeof item !== 'object') return false;
              for (const k of Object.keys(u.match)) {
                const expected = u.match[k];
                const actual = item[k];
                if (typeof expected === 'string' && typeof actual === 'string') {
                  if (expected.trim().toLowerCase() !== actual.trim().toLowerCase()) return false;
                } else if (actual !== expected) {
                  return false;
                }
              }
              return true;
            });
            if (idx < 0) { notFound.push({ match: u.match, reason: 'not found' }); continue; }
            if (u.set && typeof u.set === 'object') Object.assign(arr[idx], u.set);
            if (Array.isArray(u.unset)) for (const f of u.unset) delete arr[idx][f];
            updated++;
          }
          if (!Array.isArray(req._updateReports)) req._updateReports = [];
          req._updateReports.push({ path: p, key: op.key, updated, notFoundCount: notFound.length, notFound: notFound.slice(0, 20) });
          break;
        }
        default:
          return res.status(400).json({ error: 'Unknown op: ' + op.op });
      }
    }

    // REVAMP V2: VALIDATION GATE PATCH32 — VALIDATION GATE: refuse catastrophic writes BEFORE they land
    {
      const issues = [];

      // (a) Per-call quota: refuse if total appended entries via append-array > 50
      const QUOTA_PER_CALL = 50;
      let totalAppended = 0;
      for (const op of operations) {
        if (op.op === 'append-array' && Array.isArray(op.items)) totalAppended += op.items.length;
      }
      if (totalAppended > QUOTA_PER_CALL) {
        issues.push('Per-call quota exceeded: ' + totalAppended + ' entries (limit ' + QUOTA_PER_CALL + '). Split into smaller batches.');
      }

      // (b) Diff sanity: refuse >2% shrinkage in any tracked array
      const SHRINK_THRESHOLD = 0.98;
      for (const p of Object.keys(dataObjects)) {
        const data = dataObjects[p];
        for (const k of _v32_TRACKED_KEYS) {
          const before = _v32_preCounts[p + ':' + k];
          if (typeof before !== 'number') continue;
          const after = Array.isArray(data && data[k]) ? data[k].length : 0;
          if (after < before * SHRINK_THRESHOLD) {
            const dropPct = ((before - after) / before * 100).toFixed(1);
            issues.push('Diff sanity FAIL on ' + p + '.' + k + ': ' + before + ' -> ' + after + ' entries (' + dropPct + '% drop). Refusing to commit. If intentional, split into multiple smaller commits or contact admin.');
          }
        }
      }

      // (c) Schema validation on appended entries
      const VALID_STATE = /^[A-Z]{2}$|^ALL$/;
      const VALID_DATE = /^\d{4}-\d{2}-\d{2}$/;
      const VALID_URL = /^https?:\/\//i;
      for (const op of operations) {
        if (op.op !== 'append-array' || !Array.isArray(op.items)) continue;
        for (let idx = 0; idx < op.items.length; idx++) {
          const item = op.items[idx];
          const tag = (op.path || '?') + '.' + (op.key || '?') + '[+' + idx + ']';
          if (!item || typeof item !== 'object') {
            issues.push(tag + ': not a valid object');
            continue;
          }
          if (!item.name || typeof item.name !== 'string' || !item.name.trim()) {
            issues.push(tag + ': missing or empty "name" field');
          }
          // Provider OR organization (different modules use different keys)
          if (!item.provider && !item.organization) {
            issues.push(tag + ': missing "provider" or "organization" field');
          }
          // _source MUST be a real URL (the patch24 era data-quality rule)
          if (!item._source || typeof item._source !== 'string' || !VALID_URL.test(item._source)) {
            issues.push(tag + ': missing or invalid _source URL (must start with http:// or https://)');
          }
          if (item._verifiedDate && !VALID_DATE.test(String(item._verifiedDate))) {
            issues.push(tag + ': _verifiedDate must be YYYY-MM-DD format, got "' + item._verifiedDate + '"');
          }
          // State code (if present) must be 2 letters or 'ALL'
          const stateCode = (item.location && item.location.state) || item.state;
          if (stateCode && !VALID_STATE.test(String(stateCode).toUpperCase())) {
            issues.push(tag + ': invalid state code "' + stateCode + '" (must be 2-letter uppercase or "ALL")');
          }
        }
      }

      // (d) Duplicate detection: appended entries against existing + within batch
      // (Ops have already mutated dataObjects, so existing arrays now contain the
      // appended entries at the END. We slice off the appended portion to recover
      // the pre-append set for comparison.)
      for (const op of operations) {
        if (op.op !== 'append-array' || !Array.isArray(op.items) || !op.path || !op.path.endsWith('.json')) continue;
        const data = dataObjects[op.path];
        if (!data) continue;
        const arr = Array.isArray(data[op.key]) ? data[op.key] : null;
        if (!arr) continue;
        const appendedCount = op.items.length;
        const existingBefore = arr.slice(0, arr.length - appendedCount);
        const keyOf = (e) => {
          const n = (e && e.name ? String(e.name) : '').trim().toLowerCase();
          const p = (e && (e.provider || e.organization) ? String(e.provider || e.organization) : '').trim().toLowerCase();
          return n + '|' + p;
        };
        const existingKeys = new Set(existingBefore.map(keyOf));
        const seenInBatch = new Set();
        op.items.forEach((item, idx) => {
          if (!item || !item.name) return; // schema check above will catch
          const tag = (op.path || '?') + '.' + (op.key || '?') + '[+' + idx + ']';
          const k = keyOf(item);
          if (existingKeys.has(k)) {
            issues.push(tag + ': duplicate of existing entry "' + item.name + '" by "' + (item.provider || item.organization || '?') + '". Use update-array-items to modify, or change name/provider to differentiate.');
          }
          if (seenInBatch.has(k)) {
            issues.push(tag + ': duplicate within this batch (same name+provider as another item in the same call)');
          }
          seenInBatch.add(k);
        });
      }

      if (issues.length > 0) {
        console.warn('[grinder-write VALIDATION GATE PATCH32] rejected with ' + issues.length + ' issue(s):');
        for (const i of issues) console.warn('  - ' + i);
        return res.status(422).json({
          error: 'Validation gate rejected this write — ' + issues.length + ' issue(s) found. See "issues" array for details.',
          rejectedBy: 'PATCH32',
          issues,
          retriable: false,
        });
      }
    }

    // 5. Serialize JSON paths back to text
    for (const p of Object.keys(dataObjects)) {
      fileContents[p] = JSON.stringify(dataObjects[p], null, 2) + '\n';
    }

    // 6. Create blobs
    const blobShas = {};
    for (const p of Object.keys(fileContents)) {
      const blob = await gh('POST', '/repos/' + owner + '/' + repoName + '/git/blobs', {
        content: Buffer.from(fileContents[p], 'utf8').toString('base64'),
        encoding: 'base64',
      });
      blobShas[p] = blob.sha;
    }

    // 7. Create new tree (based on baseTreeSha — only touched paths included)
    const treeEntries = Object.keys(blobShas).map(p => ({
      path: p, mode: '100644', type: 'blob', sha: blobShas[p],
    }));
    const newTree = await gh('POST', '/repos/' + owner + '/' + repoName + '/git/trees', {
      base_tree: baseTreeSha,
      tree: treeEntries,
    });

    // 8. Create commit
    const newCommit = await gh('POST', '/repos/' + owner + '/' + repoName + '/git/commits', {
      message,
      tree: newTree.sha,
      parents: [baseCommitSha],
    });

    // REVAMP V2: GRINDER-WRITE NO-FORCE-PUSH PATCH27
    // 9. Update branch ref — explicit fetch so we can capture HTTP 422 (non-fast-forward
    //    = race detected: branch tip moved between our getRef and our PATCH). On 422
    //    we surface 409 Conflict with retriable=true so submit-nourishment retries
    //    the whole batch with a fresh base. We also do a POST-WRITE VERIFY to detect
    //    any case where PATCH appeared to succeed but the tip is not actually our
    //    newCommit.sha (defensive — covers any GitHub eventual-consistency edge case).
    const _refUpdateResp = await fetch(
      'https://api.github.com/repos/' + owner + '/' + repoName + '/git/refs/heads/' + branch,
      {
        method: 'PATCH',
        headers: { ...ghHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ sha: newCommit.sha, force: false }),
      }
    );
    if (!_refUpdateResp.ok) {
      const _errText = await _refUpdateResp.text();
      console.error('[grinder-write] PATCH ref ' + _refUpdateResp.status + ': ' + _errText.slice(0, 300));
      if (_refUpdateResp.status === 422) {
        return res.status(409).json({
          error: 'Race conflict: branch tip moved between getRef and PATCH (non-fast-forward). Retry with fresh base.',
          retriable: true,
          baseSha: baseCommitSha,
          attemptedNewSha: newCommit.sha,
        });
      }
      return res.status(_refUpdateResp.status).json({
        error: 'PATCH ref failed: ' + _errText.slice(0, 300),
      });
    }
    // Post-write verify: re-read the ref and confirm we are the tip. If a
    // competing writer landed in the milliseconds between our PATCH succeeding
    // and this verify, surface as 409 (and don't claim success).
    try {
      const _verifyRef = await gh('GET', '/repos/' + owner + '/' + repoName + '/git/ref/heads/' + branch);
      if (_verifyRef.object.sha !== newCommit.sha) {
        console.error('[grinder-write] post-write verify mismatch: ref is ' + _verifyRef.object.sha + ', expected ' + newCommit.sha);
        return res.status(409).json({
          error: 'Race conflict: post-write verify shows tip moved to ' + _verifyRef.object.sha + ' (we set ' + newCommit.sha + '). Retry.',
          retriable: true,
          observedTip: _verifyRef.object.sha,
          attemptedNewSha: newCommit.sha,
        });
      }
    } catch (_verifyErr) {
      // Verify failure is NOT fatal — the PATCH already succeeded. Just log
      // and continue. (If the next caller does grinder-write, it'll see fresh state.)
      console.warn('[grinder-write] post-write verify error (non-fatal): ' + _verifyErr.message);
    }

    res.json({
      ok: true,
      commit: newCommit.sha,
      commitUrl: 'https://github.com/' + owner + '/' + repoName + '/commit/' + newCommit.sha,
      pathsTouched: Object.keys(fileContents),
      updateReports: (req._updateReports && req._updateReports.length) ? req._updateReports : undefined,
    });
  } catch (err) {
    console.error('[grinder-write]', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── PATCH140: Daily morning pulse — admin email digest ───────────────────
// POST /api/admin/morning-pulse
// Gathers stats from last 24h, builds an HTML report, emails Dan, returns
// the JSON summary. Designed to be called once daily by the wayfinder-morning-
// pulse Cowork task (which adds a snapshot tag after this endpoint succeeds).
//
// Auth: admin token OR x-task-token header (same as other admin endpoints).
router.post('/morning-pulse', async (req, res) => {
  try {
    const _t0 = Date.now();
    const dryRun = !!(req.query.dryRun || (req.body && req.body.dryRun));

    // ── Gather stats in parallel where possible ──
    const stats = {
      generatedAt: new Date().toISOString(),
      site: { url: 'https://wayfinderai.org', status: 'unknown' },
      deploy: { latestSha: null, latestSubject: null, ageHours: null },
      users: { total: 0, free: 0, pro: 0, elite: 0, coach: 0, consultant: 0, admin: 0 },
      newSignups24h: 0,
      activity: { totalChats24h: 0, intlChats24h: 0, activeSessions24h: 0 },
      generation: { slm: 0, haiku_advisor: 0, haiku_assistant: 0, engine: 0, fallback: 0 },
      quality: { refusals24h: 0, avgLatencyMs: null },
      ap: { studyGuideDownloads24h: 0 },
      essays: { reviews24h: 0 },
      cost: { estHaikuTokens24h: 0, estOpusTokens24h: 0, estSlmTokens24h: 0 },
      anomalies: [],
      lastError: null,
    };

    // 1. Site uptime ping (PATCH143: was /api/me which is 404; correct path is /api/health)
    try {
      const r = await fetch('https://wayfinderai.org/api/health', { method: 'GET', signal: AbortSignal.timeout(8000) });
      stats.site.status = r.status === 200 ? 'UP' : 'DEGRADED';
      stats.site.httpStatus = r.status;
    } catch (e) {
      stats.site.status = 'DOWN';
      stats.site.error = e.message;
      stats.anomalies.push('Site uptime check failed: ' + e.message);
    }

    // PATCH144: live route smoke test — for each critical user-facing path,
    // verify the response signature matches expectations. Catches the patch
    // 143 bug class IN PRODUCTION (status checks see 200 but the catchall
    // is serving wrong content). If any check fails, it lands in the
    // anomalies block of the daily email digest so Dan sees it within 24h.
    const routeChecks = [
      { path: '/privacy.html', mustInclude: 'Privacy', maxBytes: 80000, name: 'Privacy Policy page' },
      { path: '/terms.html', mustInclude: 'Terms', maxBytes: 80000, name: 'Terms of Service page' },
      { path: '/forgot-password.html', mustInclude: 'reset', maxBytes: 80000, name: 'Forgot-password reset form' },
      { path: '/admin-dashboard.html', mustInclude: 'admin', maxBytes: 200000, name: 'Admin dashboard' },
    ];
    for (const rc of routeChecks) {
      try {
        const r = await fetch('https://wayfinderai.org' + rc.path, { signal: AbortSignal.timeout(6000) });
        if (r.status !== 200) {
          stats.anomalies.push(`${rc.name} (${rc.path}) returned HTTP ${r.status} — broken link.`);
          continue;
        }
        const body = await r.text();
        if (body.length > rc.maxBytes) {
          stats.anomalies.push(`${rc.name} (${rc.path}) returned ${body.length} bytes (expected <${rc.maxBytes}). Likely SPA catchall serving wrong content.`);
          continue;
        }
        if (rc.mustInclude && !body.toLowerCase().includes(rc.mustInclude.toLowerCase())) {
          stats.anomalies.push(`${rc.name} (${rc.path}) returned 200 but missing expected content "${rc.mustInclude}".`);
        }
      } catch (e) {
        stats.anomalies.push(`Route smoke test failed for ${rc.path}: ${e.message}`);
      }
    }

    // 2. Deploy state — read latest commit from local git history (the running
    //    process is on the deployed commit, so HEAD = production)
    try {
      const { execSync } = await import('child_process');
      const sha = execSync('git rev-parse --short HEAD', { cwd: '/opt/render/project/src', encoding: 'utf8' }).trim();
      const subject = execSync('git log -1 --format=%s HEAD', { cwd: '/opt/render/project/src', encoding: 'utf8' }).trim();
      const dateIso = execSync('git log -1 --format=%cI HEAD', { cwd: '/opt/render/project/src', encoding: 'utf8' }).trim();
      stats.deploy.latestSha = sha;
      stats.deploy.latestSubject = subject.slice(0, 120);
      stats.deploy.ageHours = Math.round((Date.now() - new Date(dateIso).getTime()) / 3600000);
    } catch (e) {
      stats.deploy.error = e.message;
    }

    // 3. User counts + 24h new signups
    try {
      const files = await _fsP140.readdir(_USERS_DIR140);
      const cutoff = Date.now() - 86400000;
      for (const f of files.filter(x => x.endsWith('.json'))) {
        try {
          const raw = await _fsP140.readFile(_join140(_USERS_DIR140, f), 'utf8');
          const u = JSON.parse(raw);
          stats.users.total++;
          const plan = String(u.plan || 'free').toLowerCase();
          if (stats.users[plan] !== undefined) stats.users[plan]++;
          if (u.createdAt && new Date(u.createdAt).getTime() >= cutoff) stats.newSignups24h++;
        } catch (_) {}
      }
    } catch (e) { stats.anomalies.push('User scan failed: ' + e.message); }

    // 4. 24h activity from sessions
    try {
      const files = await _fsP140.readdir(_SESSIONS_DIR140).catch(() => []);
      const cutoff = Date.now() - 86400000;
      const activeUserIds = new Set();
      for (const f of files.filter(x => x.endsWith('.json'))) {
        try {
          const raw = await _fsP140.readFile(_join140(_SESSIONS_DIR140, f), 'utf8');
          const s = JSON.parse(raw);
          if (!s.history || !Array.isArray(s.history)) continue;
          let sessionTouched24h = false;
          for (const m of s.history) {
            const ts = m.timestamp ? new Date(m.timestamp).getTime() : 0;
            if (ts >= cutoff) {
              if (m.role === 'user') {
                stats.activity.totalChats24h++;
                if (m.content && /[ㄱ-힝]/.test(m.content)) stats.activity.intlChats24h++;
              }
              sessionTouched24h = true;
            }
          }
          if (sessionTouched24h && s.userId) activeUserIds.add(s.userId);
        } catch (_) {}
      }
      stats.activity.activeSessions24h = activeUserIds.size;
    } catch (e) { stats.anomalies.push('Session scan failed: ' + e.message); }

    // 5. Routing breakdown (last 24h) from getRoutingStats if available
    try {
      const rs = getRoutingStats();
      if (rs && rs.modes) {
        Object.keys(stats.generation).forEach(k => { stats.generation[k] = rs.modes[k] || 0; });
      }
    } catch (e) { /* non-fatal */ }

    // 6. Build HTML report
    const fmtNum = (n) => (typeof n === 'number') ? n.toLocaleString() : String(n);
    const _intlPct = stats.activity.totalChats24h > 0
      ? Math.round((stats.activity.intlChats24h / stats.activity.totalChats24h) * 100)
      : 0;
    const _siteColor = stats.site.status === 'UP' ? '#22c55e' : (stats.site.status === 'DEGRADED' ? '#f59e0b' : '#ef4444');
    const _anomaliesHtml = stats.anomalies.length === 0
      ? '<div style="color:#22c55e;">✓ none</div>'
      : '<ul style="margin:0; padding-left:18px;">' + stats.anomalies.map(a => '<li style="color:#b91c1c;">' + a + '</li>').join('') + '</ul>';

    const dateLocal = new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });

    const html = `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; max-width:640px; margin:0 auto; color:#0f172a;">
  <h2 style="margin:0 0 4px 0;">Wayfinder daily pulse</h2>
  <p style="color:#64748b; margin:0 0 18px 0; font-size:13px;">${dateLocal}</p>

  <div style="background:#f8fafc; border-left:4px solid ${_siteColor}; padding:12px 14px; margin-bottom:14px; border-radius:6px;">
    <div style="font-weight:700;">Site: <span style="color:${_siteColor};">${stats.site.status}</span> ${stats.site.httpStatus ? '(HTTP ' + stats.site.httpStatus + ')' : ''}</div>
    <div style="font-size:13px; color:#475569; margin-top:3px;">Deploy: <code>${stats.deploy.latestSha || 'unknown'}</code> · ${stats.deploy.ageHours !== null ? stats.deploy.ageHours + 'h ago' : '?'}<br>${stats.deploy.latestSubject ? '<em style="color:#64748b;">' + stats.deploy.latestSubject + '</em>' : ''}</div>
  </div>

  <table style="width:100%; border-collapse:collapse; font-size:14px; margin-bottom:14px;">
    <tr style="background:#f1f5f9;"><th colspan="2" style="text-align:left; padding:8px 12px;">Activity (24h)</th></tr>
    <tr><td style="padding:6px 12px;">Total chats</td><td style="padding:6px 12px; text-align:right; font-weight:600;">${fmtNum(stats.activity.totalChats24h)}</td></tr>
    <tr><td style="padding:6px 12px;">— Korean</td><td style="padding:6px 12px; text-align:right;">${fmtNum(stats.activity.intlChats24h)} <span style="color:#64748b;">(${_intlPct}%)</span></td></tr>
    <tr><td style="padding:6px 12px;">Active users</td><td style="padding:6px 12px; text-align:right; font-weight:600;">${fmtNum(stats.activity.activeSessions24h)}</td></tr>
    <tr><td style="padding:6px 12px;">New signups</td><td style="padding:6px 12px; text-align:right; font-weight:600;">${fmtNum(stats.newSignups24h)}</td></tr>
  </table>

  <table style="width:100%; border-collapse:collapse; font-size:14px; margin-bottom:14px;">
    <tr style="background:#f1f5f9;"><th colspan="2" style="text-align:left; padding:8px 12px;">Total users by tier</th></tr>
    <tr><td style="padding:6px 12px;">Total</td><td style="padding:6px 12px; text-align:right; font-weight:600;">${fmtNum(stats.users.total)}</td></tr>
    <tr><td style="padding:6px 12px;">Free</td><td style="padding:6px 12px; text-align:right;">${fmtNum(stats.users.free)}</td></tr>
    <tr><td style="padding:6px 12px;">Pro / Coach</td><td style="padding:6px 12px; text-align:right;">${fmtNum(stats.users.pro + stats.users.coach)}</td></tr>
    <tr><td style="padding:6px 12px;">Elite / Consultant</td><td style="padding:6px 12px; text-align:right;">${fmtNum(stats.users.elite + stats.users.consultant)}</td></tr>
    <tr><td style="padding:6px 12px;">Admin</td><td style="padding:6px 12px; text-align:right;">${fmtNum(stats.users.admin)}</td></tr>
  </table>

  <table style="width:100%; border-collapse:collapse; font-size:14px; margin-bottom:14px;">
    <tr style="background:#f1f5f9;"><th colspan="2" style="text-align:left; padding:8px 12px;">Generation breakdown</th></tr>
    <tr><td style="padding:6px 12px;">SLM (free, primary)</td><td style="padding:6px 12px; text-align:right;">${fmtNum(stats.generation.slm)}</td></tr>
    <tr><td style="padding:6px 12px;">Haiku Advisor (paid Korean)</td><td style="padding:6px 12px; text-align:right;">${fmtNum(stats.generation.haiku_advisor)}</td></tr>
    <tr><td style="padding:6px 12px;">Haiku Assistant (free Korean)</td><td style="padding:6px 12px; text-align:right;">${fmtNum(stats.generation.haiku_assistant)}</td></tr>
    <tr><td style="padding:6px 12px;">Engine (Opus)</td><td style="padding:6px 12px; text-align:right;">${fmtNum(stats.generation.engine)}</td></tr>
  </table>

  <div style="background:#fffbeb; border:1px solid #fde68a; padding:10px 14px; margin-bottom:14px; border-radius:6px;">
    <div style="font-weight:700; margin-bottom:6px;">Anomalies / things to know</div>
    ${_anomaliesHtml}
  </div>

  <p style="color:#94a3b8; font-size:12px; text-align:center; margin-top:24px;">Generated in ${Date.now() - _t0}ms · <a href="https://wayfinderai.org/admin-dashboard.html" style="color:#64748b;">admin dashboard</a></p>
</div>`;

    const subject = `Wayfinder ${dateLocal} — ${fmtNum(stats.activity.totalChats24h)} chats · ${fmtNum(stats.newSignups24h)} new · Site ${stats.site.status}`;

    const text = `Wayfinder daily pulse — ${dateLocal}\n\nSite: ${stats.site.status}\nDeploy: ${stats.deploy.latestSha} (${stats.deploy.ageHours}h ago)\n\nActivity 24h: ${stats.activity.totalChats24h} chats (${stats.activity.intlChats24h} Korean, ${_intlPct}%), ${stats.activity.activeSessions24h} active users, ${stats.newSignups24h} new signups\n\nTotal users: ${stats.users.total} (free ${stats.users.free}, pro ${stats.users.pro}, elite ${stats.users.elite}, coach ${stats.users.coach}, consultant ${stats.users.consultant}, admin ${stats.users.admin})\n\nAnomalies: ${stats.anomalies.length === 0 ? 'none' : stats.anomalies.join('; ')}`;

    // 7. Send email (skip if dryRun for testing)
    let emailResult = { sent: false, dryRun };
    if (!dryRun) {
      try {
        emailResult = await sendAdminDailyPulse(subject, html, text);
        emailResult.sent = !!(emailResult && (emailResult.success !== false));
      } catch (e) {
        emailResult.error = e.message;
        stats.anomalies.push('Email send failed: ' + e.message);
      }
    }

    res.json({ ok: true, stats, subject, emailResult, durationMs: Date.now() - _t0 });
  } catch (err) {
    console.error('[morning-pulse]', err);
    res.status(500).json({ error: err.message, stack: err.stack && err.stack.split('\n').slice(0, 3).join(' | ') });
  }
});

export default router;
