import { Router } from 'express';
import { createUser, loginUser, logoutUser, verifyToken, updateProfile, getUserSessions, getEngineUsage, deleteUser, updateSettings, getUserChatHistory, searchUserChats, checkTokenUsage, isAdmin, setUserPlan, requestPasswordReset, resetPassword } from '../services/auth.js';
import { validateInvite, redeemInvite } from '../services/invites.js';
import { sendPasswordResetEmail } from '../services/email.js';

const router = Router();

// POST /api/auth/signup — invite code always required
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name, userType, school, interests, consentGiven, inviteCode } = req.body;

    // Sanitize email: trim and lowercase
    const sanitizedEmail = email ? email.toLowerCase().trim() : '';

    if (!sanitizedEmail || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
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
    if (inviteCheck.invite.recipientEmail && inviteCheck.invite.recipientEmail !== sanitizedEmail) {
      return res.status(400).json({ error: 'This invitation was sent to a different email address.' });
    }

    const result = await createUser({ email: sanitizedEmail, password, name, userType, school, interests });

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    // Redeem the invite (pass name so inviter can see who joined)
    await redeemInvite(inviteCode, result.user.id, email, name);

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

    // Sanitize email: trim and lowercase
    const sanitizedEmail = email ? email.toLowerCase().trim() : '';

    if (!sanitizedEmail || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await loginUser(sanitizedEmail, password);

    if (result.error) {
      return res.status(401).json({ error: result.error });
    }

    res.json(result);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Failed to log in' });
  }
});

// POST /api/auth/forgot-password — Request a password reset code
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const result = await requestPasswordReset(email);

    // If we got a reset code, send the email
    if (result.resetCode) {
      await sendPasswordResetEmail(email, result.userName, result.resetCode);
    }

    // Always return success to not reveal whether account exists
    res.json({ success: true, message: 'If an account exists with that email, a reset code has been sent.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Failed to process reset request' });
  }
});

// POST /api/auth/reset-password — Reset password with code
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Email, code, and new password are required' });
    }

    const result = await resetPassword(email, code, newPassword);
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ success: true, message: 'Password has been reset. You can now log in.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Failed to reset password' });
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

// POST /api/auth/admin/secret-login — Login with admin secret (for admin dashboard)
// Returns a token for a built-in admin user, creating it if needed
router.post('/admin/secret-login', async (req, res) => {
  try {
    const { secret } = req.body;
    if (!secret || secret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ error: 'Invalid admin secret.' });
    }

    // Try to login as the built-in 'admin' account
    // If it doesn't exist, create it first
    const adminEmail = 'admin';
    const adminPassword = secret; // Use the secret as the password
    let result = await loginUser(adminEmail, adminPassword);

    if (result.error) {
      // Account might not exist — create it
      const createResult = await createUser({
        email: adminEmail,
        password: adminPassword,
        name: 'Admin',
        userType: 'advisor'
      });
      if (createResult.error && !createResult.error.includes('already exists')) {
        return res.status(500).json({ error: 'Failed to bootstrap admin account: ' + createResult.error });
      }
      // Try login again (if create said 'already exists', password mismatch — update it)
      result = await loginUser(adminEmail, adminPassword);
      if (result.error) {
        return res.status(500).json({ error: 'Admin account exists but password mismatch. Reset manually.' });
      }
    }

    res.json({ token: result.token, email: adminEmail, isAdmin: true });
  } catch (err) {
    console.error('Admin secret login error:', err);
    res.status(500).json({ error: 'Failed to authenticate' });
  }
});

// POST /api/auth/admin/create — Create admin account (no invite needed)
// Protected by ADMIN_SECRET header — for bootstrapping admin accounts
router.post('/admin/create', async (req, res) => {
  try {
    const secret = req.headers['x-admin-secret'];
    if (!secret || secret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ error: 'Invalid admin secret.' });
    }

    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required.' });
    }

    const sanitizedEmail = email.toLowerCase().trim();

    // Verify this email is in the ADMIN_EMAILS list
    if (!isAdmin(sanitizedEmail)) {
      return res.status(403).json({ error: 'This email is not in the ADMIN_EMAILS list. Add it to your Render env vars first.' });
    }

    const result = await createUser({ email: sanitizedEmail, password, name, userType: 'advisor' });

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ success: true, message: `Admin account created for ${sanitizedEmail}. You can now log in.` });
  } catch (err) {
    console.error('Admin create error:', err);
    res.status(500).json({ error: 'Failed to create admin account' });
  }
});

// PUT /api/auth/admin/plan - Admin-only: switch effective plan for testing
router.put('/admin/plan', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const user = await verifyToken(token);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  if (!user.isAdmin) return res.status(403).json({ error: 'Admin only' });

  const { plan } = req.body;
  if (!['free', 'pro', 'elite'].includes(plan)) {
    return res.status(400).json({ error: 'Invalid plan. Must be free, pro, or elite.' });
  }

  const result = await setUserPlan(token, plan);
  if (result.error) return res.status(400).json({ error: result.error });
  res.json(result);
});

// GET /api/auth/history - Get user's chat history
router.get('/history', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No auth token provided', history: [] });
  }
  try {
    const history = await getUserChatHistory(token);
    res.json({ history });
  } catch (err) {
    console.error('[Auth/History] Error loading history:', err.message);
    res.status(500).json({ error: 'Failed to load history', history: [] });
  }
});

// POST /api/auth/logout - Log out user and invalidate token
router.post('/logout', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const result = await logoutUser(token);

  if (result.error) {
    return res.status(400).json({ error: result.error });
  }

  res.json({ success: true, message: 'Logged out successfully' });
});

// GET /api/auth/search - Search user's chats
router.get('/search', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const query = (req.query.q || '').trim();

  // Validate query length (max 200 chars)
  if (query.length > 200) {
    return res.status(400).json({ error: 'Search query must be 200 characters or less' });
  }

  const results = await searchUserChats(token, query);
  res.json({ results });
});

export default router;
