import { Router } from 'express';
import { reloadPrompt } from '../services/claude.js';
import { invalidateCache } from '../services/knowledge.js';
import { listKnowledgeFiles, loadAllFeedback } from '../services/storage.js';

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

export default router;
