import { Router } from 'express';
import { createUser, loginUser, verifyToken, updateProfile, getUserSessions } from '../services/auth.js';

const router = Router();

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name, userType, school, interests, consentGiven } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const result = await createUser({ email, password, name, userType, school, interests });

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

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

export default router;
