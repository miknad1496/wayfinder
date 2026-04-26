import { Router } from 'express';
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

// GET /api/admin/stats - Comprehensive dashboard stats
router.get('/stats', async (req, res) => {
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
            return JSON.parse(raw);
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

    res.json({
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
    });
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
          return JSON.parse(raw);
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

export default router;
