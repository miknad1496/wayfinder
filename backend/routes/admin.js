import { Router } from 'express';
import { reloadPrompt } from '../services/claude.js';
import { invalidateCache, getKnowledgeDB } from '../services/knowledge.js';
import { listKnowledgeFiles, loadAllFeedback } from '../services/storage.js';
import { getScheduleStatus, forceRunScraper } from '../services/scraper-scheduler.js';
import { getSLMStatus, getSLMWarmStatus, invalidateSLMPromptCache } from '../services/slm.js';
import { getMemoryStats } from '../services/conversation-memory.js';

const router = Router();

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
        topUsersByMessages
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

export default router;
