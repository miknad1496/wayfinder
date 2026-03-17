/**
 * Invite Routes for Wayfinder
 *
 * Handles invite creation, validation, and management.
 */

import { Router } from 'express';
import { verifyToken, findUserByToken } from '../services/auth.js';
import { sendInviteEmail } from '../services/email.js';
import {
  createInvite,
  validateInvite,
  getInviteBalance,
  getUserInvites,
  deleteInvite,
  createAdminInvite
} from '../services/invites.js';

const router = Router();

/**
 * POST /api/invites/send — Send an invitation (authenticated)
 */
router.post('/send', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = await findUserByToken(token);

    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const result = await createInvite(user.id, user.name, user.email, email, user.plan || 'free');

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    // Send the invitation email
    const inviteLink = `https://wayfinderai.org/?invite=${result.invite.code}`;
    const emailResult = await sendInviteEmail(
      email,
      user.name || 'Someone',
      result.invite.code,
      inviteLink
    );

    if (emailResult.error) {
      console.warn('Email send failed:', emailResult.error);
      // Don't fail the request; the invite was created successfully
    }

    res.json(result);
  } catch (err) {
    console.error('Invite send error:', err);
    res.status(500).json({ error: 'Failed to send invitation.' });
  }
});

/**
 * GET /api/invites/validate/:code — Check if an invite code is valid (public)
 */
router.get('/validate/:code', async (req, res) => {
  try {
    const result = await validateInvite(req.params.code);
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    res.json(result);
  } catch (err) {
    console.error('Invite validate error:', err);
    res.status(500).json({ error: 'Failed to validate invitation.' });
  }
});

/**
 * GET /api/invites/balance — Get remaining invites for current user (authenticated)
 */
router.get('/balance', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = await verifyToken(token);

    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const balance = await getInviteBalance(user.id, user.email, user.plan || 'free');
    res.json(balance);
  } catch (err) {
    console.error('Invite balance error:', err);
    res.status(500).json({ error: 'Failed to get invite balance.' });
  }
});

/**
 * GET /api/invites/mine — Get all invites sent by current user (authenticated)
 */
router.get('/mine', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = await verifyToken(token);

    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const invites = await getUserInvites(user.id);
    const balance = await getInviteBalance(user.id, user.email, user.plan || 'free');
    res.json({ invites, balance });
  } catch (err) {
    console.error('Invite list error:', err);
    res.status(500).json({ error: 'Failed to get invitations.' });
  }
});

/**
 * DELETE /api/invites/:code — Delete an invite (authenticated, owner only)
 */
router.delete('/:code', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = await findUserByToken(token);

    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const result = await deleteInvite(req.params.code, user.id, user.email);

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    res.json(result);
  } catch (err) {
    console.error('Invite delete error:', err);
    res.status(500).json({ error: 'Failed to delete invitation.' });
  }
});

/**
 * POST /api/invites/admin — Create admin invite (requires admin secret)
 */
router.post('/admin', async (req, res) => {
  try {
    const adminSecret = req.headers['x-admin-secret'];
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { email } = req.body;
    const result = await createAdminInvite(email || '');

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    res.json(result);
  } catch (err) {
    console.error('Admin invite error:', err);
    res.status(500).json({ error: 'Failed to create admin invitation.' });
  }
});

export default router;
