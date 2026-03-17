import { Router } from 'express';
import { createUser, loginUser, verifyToken, updateProfile, getUserSessions, getEngineUsage, deleteUser, updateSettings, getUserChatHistory, searchUserChats, checkTokenUsage } from '../services/auth.js';
import { validateInvite, redeemInvite } from '../services/invites.js';

const router = Router();

// POST /api/auth/signup — invite code always required
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name, userType, school, interests, consentGiven, inviteCode } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // All signups require a valid invite code — no exceptions
    if (!inviteCode) {
      return res.status(400).json({ error: 'An invitation code is required to join Wayfinder.' });
    }

    const inviteCheck = await validateInvite(inviteCode);
    if (inviteCheck.error) {
      return res.status(400).json({ error: inviteCheck.error });
    }

    // If invite is email-locked, verify it matches
    if (inviteCheck.invite.recipientEmail && inviteCheck.invite.recipientEmail !== email.toLowerCase().trim()) {
      return res.status(400).json({ error: 'This invitation was sent to a different email address.' });
    }

    const result = await createUser({ email, password, name, userType, school, interests });

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    // Redeem the invite
    await redeemInvite(inviteCode, result.user.id, email);

    // If consent was given during signup, update the user record
    if (consentGiven && result.token) {
      await updateProfile(result.token, { consentGiven: true });
    }

    res.json(result);
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await loginUser(email, password);

    if (result.error) {
      return res.status(401).json({ error: result.error });
    }

    res.json(result);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Failed to log in' });
  }
});

// GET /api/auth/me - Get current user from token
router.get('/me', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const user = await verifyToken(token);

  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  res.json({ user });
});

// PUT /api/auth/profile - Update user profile
router.put('/profile', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const result = await updateProfile(token, req.body);

  if (result.error) {
    return res.status(400).json({ error: result.error });
  }

  res.json(result);
});

// POST /api/auth/consent - Record data usage consent
router.post('/consent', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const result = await updateProfile(token, { consentGiven: true });

  if (result.error) {
    return res.status(400).json({ error: result.error });
  }

  res.json({ success: true, message: 'Consent recorded' });
});

// GET /api/auth/sessions - Get user's past session IDs
router.get('/sessions', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const sessions = await getUserSessions(token);
  res.json({ sessions });
});

// GET /api/auth/engine-usage - Get Wayfinder Engine usage for today
router.get('/engine-usage', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const usage = await getEngineUsage(token);
  res.json(usage);
});

// GET /api/auth/token-usage - Get daily token usage
router.get('/token-usage', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const usage = await checkTokenUsage(token);
  res.json(usage);
});

// DELETE /api/auth/account - Delete user account
router.delete('/account', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const result = await deleteUser(token);

  if (result.error) {
    return res.status(400).json({ error: result.error });
  }

  res.json(result);
});

// PUT /api/auth/settings - Update user settings
router.put('/settings', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const result = await updateSettings(token, req.body.settings || {});

  if (result.error) {
    return res.status(400).json({ error: result.error });
  }

  res.json(result);
});

// GET /api/auth/history - Get user's chat history
router.get('/history', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const history = await getUserChatHistory(token);
  res.json({ history });
});

// GET /api/auth/search - Search user's chats
router.get('/search', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const query = req.query.q || '';
  const results = await searchUserChats(token, query);
  res.json({ results });
});

export default router;
