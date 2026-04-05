import { Router } from 'express';
import { saveFeedback, loadAllFeedback } from '../services/storage.js';
import { verifyToken } from '../services/auth.js';

const router = Router();

// POST /api/feedback - Submit feedback on a response
router.post('/', async (req, res) => {
  try {
    const { sessionId, messageIndex, rating, comment, userMessage, assistantResponse } = req.body;

    if (!sessionId || rating === undefined) {
      return res.status(400).json({ error: 'sessionId and rating are required' });
    }

    if (typeof rating !== 'number' || rating < -1 || rating > 1) {
      return res.status(400).json({ error: 'Rating must be -1 (bad), 0 (neutral), or 1 (good)' });
    }

    // Validate string inputs to prevent injection/abuse
    if (typeof sessionId !== 'string' || sessionId.length > 128) {
      return res.status(400).json({ error: 'Invalid sessionId' });
    }
    if (comment && (typeof comment !== 'string' || comment.length > 2000)) {
      return res.status(400).json({ error: 'Comment must be under 2000 characters' });
    }

    await saveFeedback({
      sessionId,
      messageIndex,
      rating,
      comment: comment ? comment.substring(0, 2000) : null,
      userMessage: userMessage ? String(userMessage).substring(0, 500) : null,
      assistantResponse: assistantResponse ? String(assistantResponse).substring(0, 500) : null
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Feedback error:', err);
    res.status(500).json({ error: 'Failed to save feedback' });
  }
});

// GET /api/feedback/stats - Get feedback statistics (admin only)
router.get('/stats', async (req, res) => {
  try {
    // Require admin authentication — stats contain user messages/comments
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = await verifyToken(token);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const feedback = await loadAllFeedback();
    const total = feedback.length;
    const positive = feedback.filter(f => f.rating === 1).length;
    const negative = feedback.filter(f => f.rating === -1).length;
    const neutral = feedback.filter(f => f.rating === 0).length;
    const withComments = feedback.filter(f => f.comment).length;

    res.json({
      total,
      positive,
      negative,
      neutral,
      withComments,
      satisfactionRate: total > 0 ? ((positive / total) * 100).toFixed(1) + '%' : 'N/A',
      recentComments: feedback
        .filter(f => f.comment)
        .slice(-10)
        .reverse()
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load feedback stats' });
  }
});

export default router;
