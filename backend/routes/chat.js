import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { chat } from '../services/claude.js';
import { saveSession, loadSession } from '../services/storage.js';
import { verifyToken, linkSession } from '../services/auth.js';

const router = Router();

// Helper: extract user from auth header (optional — doesn't fail if no token)
async function getOptionalUser(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  return { user: await verifyToken(token), token };
}

// POST /api/chat - Send a message
router.post('/', async (req, res) => {
  try {
    const { message, sessionId: existingSessionId } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (message.length > 5000) {
      return res.status(400).json({ error: 'Message too long (max 5000 characters)' });
    }

    // Check for authenticated user (optional)
    const auth = await getOptionalUser(req);

    // Load or create session
    const sessionId = existingSessionId || uuidv4();
    let session = await loadSession(sessionId);

    if (!session) {
      session = {
        id: sessionId,
        created: new Date().toISOString(),
        history: [],
        context: {},
        messageCount: 0,
        userId: auth?.user?.id || null
      };
    }

    // If user is logged in, inject their profile into context
    if (auth?.user) {
      session.userId = auth.user.id;
      session.context = {
        ...session.context,
        userName: auth.user.name,
        userType: auth.user.userType,
        school: auth.user.school,
        interests: auth.user.interests,
        profile: auth.user.profile
      };
    }

    // Get response from Claude
    const result = await chat(
      session.history,
      message.trim(),
      session.context
    );

    // Update session history (keep last 20 messages to manage context window)
    session.history.push(
      { role: 'user', content: message.trim() },
      { role: 'assistant', content: result.response }
    );

    // Trim history if too long (keep last 10 exchanges = 20 messages)
    if (session.history.length > 20) {
      session.history = session.history.slice(-20);
    }

    session.messageCount += 1;
    session.lastActive = new Date().toISOString();

    // Save session
    await saveSession(sessionId, session);

    // Link session to user account if logged in
    if (auth?.token) {
      linkSession(auth.token, sessionId).catch(() => {});
    }

    res.json({
      sessionId,
      response: result.response,
      sources: result.retrievedSources,
      usage: result.usage,
      messageCount: session.messageCount
    });

  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({
      error: err.message || 'Failed to generate response'
    });
  }
});

// POST /api/chat/context - Update session context (user profile info)
router.post('/context', async (req, res) => {
  try {
    const { sessionId, context } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    let session = await loadSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    session.context = { ...session.context, ...context };
    await saveSession(sessionId, session);

    res.json({ success: true, context: session.context });
  } catch (err) {
    console.error('Context update error:', err);
    res.status(500).json({ error: 'Failed to update context' });
  }
});

// GET /api/chat/session/:id - Get session info
router.get('/session/:id', async (req, res) => {
  try {
    const session = await loadSession(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json({
      id: session.id,
      created: session.created,
      lastActive: session.lastActive,
      messageCount: session.messageCount,
      context: session.context
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load session' });
  }
});

export default router;
