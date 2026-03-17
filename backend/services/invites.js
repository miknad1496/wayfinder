/**
 * Invitation System for Wayfinder
 *
 * Invite-only registration: existing members can invite others via unique codes.
 * Each user gets a limited number of invites to maintain exclusivity.
 *
 * Invites are stored as JSON files in /data/invites/
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomBytes } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const INVITES_DIR = join(__dirname, '..', 'data', 'invites');
const USERS_DIR = join(__dirname, '..', 'data', 'users');

// How many invites each tier gets
const INVITE_LIMITS = {
  free: 1,
  premium: 3,
  pro: 5
};

// Default fallback
const DEFAULT_INVITE_LIMIT = 1;

// Admin emails with unlimited invites
const UNLIMITED_INVITE_EMAILS = [
  'danielyungkim@hotmail.com'
];

// Invite expiration: 14 days
const INVITE_EXPIRY_DAYS = 14;

export async function ensureInvitesDir() {
  await fs.mkdir(INVITES_DIR, { recursive: true });
}

/**
 * Generate a unique, human-friendly invite code (8 chars, alphanumeric).
 */
function generateInviteCode() {
  // Generate a short, clean code like "WF-A3X9K2"
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I confusion
  let code = 'WF-';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * Get how many invites a user has remaining.
 * @param {string} userId
 * @param {string} userEmail
 * @param {string} userPlan - 'free', 'premium', or 'pro'
 */
export async function getInviteBalance(userId, userEmail, userPlan) {
  await ensureInvitesDir();

  // Check if this user has unlimited invites
  const isUnlimited = userEmail && UNLIMITED_INVITE_EMAILS.includes(userEmail.toLowerCase().trim());
  const limit = INVITE_LIMITS[userPlan || 'free'] || DEFAULT_INVITE_LIMIT;

  try {
    const files = await fs.readdir(INVITES_DIR);
    let sentCount = 0;
    for (const file of files.filter(f => f.endsWith('.json'))) {
      const raw = await fs.readFile(join(INVITES_DIR, file), 'utf-8');
      const invite = JSON.parse(raw);
      if (invite.inviterId === userId) {
        sentCount++;
      }
    }

    if (isUnlimited) {
      return { total: 999, sent: sentCount, remaining: 999, unlimited: true };
    }

    return {
      total: limit,
      sent: sentCount,
      remaining: Math.max(0, limit - sentCount)
    };
  } catch {
    if (isUnlimited) {
      return { total: 999, sent: 0, remaining: 999, unlimited: true };
    }
    return { total: limit, sent: 0, remaining: limit };
  }
}

/**
 * Create a new invite from an authenticated user.
 * Returns the invite code and link.
 */
export async function createInvite(inviterId, inviterName, inviterEmail, recipientEmail, userPlan) {
  await ensureInvitesDir();

  // Check balance (pass email and plan for tier-based limits)
  const balance = await getInviteBalance(inviterId, inviterEmail, userPlan);
  if (balance.remaining <= 0) {
    return { error: 'You have no invitations remaining.' };
  }

  // Check if recipient already has an account
  try {
    const emailFile = `${recipientEmail.toLowerCase().trim().replace(/[^a-z0-9]/g, '_')}.json`;
    await fs.access(join(USERS_DIR, emailFile));
    return { error: 'This person already has a Wayfinder account.' };
  } catch {
    // Good — user doesn't exist yet
  }

  // Check if there's already a pending invite for this email
  try {
    const files = await fs.readdir(INVITES_DIR);
    for (const file of files.filter(f => f.endsWith('.json'))) {
      const raw = await fs.readFile(join(INVITES_DIR, file), 'utf-8');
      const invite = JSON.parse(raw);
      if (invite.recipientEmail === recipientEmail.toLowerCase().trim() && !invite.redeemedAt) {
        return { error: 'An invitation has already been sent to this email.' };
      }
    }
  } catch {
    // OK to proceed
  }

  const code = generateInviteCode();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  const invite = {
    code,
    inviterId,
    inviterName: inviterName || '',
    inviterEmail: inviterEmail || '',
    recipientEmail: recipientEmail.toLowerCase().trim(),
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    redeemedAt: null,
    redeemedBy: null
  };

  await fs.writeFile(
    join(INVITES_DIR, `${code}.json`),
    JSON.stringify(invite, null, 2)
  );

  return {
    success: true,
    invite: {
      code,
      recipientEmail: invite.recipientEmail,
      expiresAt: invite.expiresAt,
      inviterName: invite.inviterName
    },
    remaining: balance.remaining - 1
  };
}

/**
 * Validate an invite code. Returns the invite if valid, error if not.
 */
export async function validateInvite(code) {
  await ensureInvitesDir();

  if (!code) return { error: 'Invitation code is required.' };

  const cleanCode = code.toUpperCase().trim();

  try {
    const raw = await fs.readFile(join(INVITES_DIR, `${cleanCode}.json`), 'utf-8');
    const invite = JSON.parse(raw);

    if (invite.redeemedAt) {
      return { error: 'This invitation has already been used.' };
    }

    if (new Date(invite.expiresAt) < new Date()) {
      return { error: 'This invitation has expired. Ask your contact to send a new one.' };
    }

    return {
      valid: true,
      invite: {
        code: invite.code,
        recipientEmail: invite.recipientEmail,
        inviterName: invite.inviterName,
        expiresAt: invite.expiresAt
      }
    };
  } catch {
    return { error: 'Invalid invitation code. Please check and try again.' };
  }
}

/**
 * Redeem an invite code during signup.
 * Marks the invite as used.
 */
export async function redeemInvite(code, userId, userEmail, userName) {
  await ensureInvitesDir();

  const cleanCode = code.toUpperCase().trim();

  try {
    const filePath = join(INVITES_DIR, `${cleanCode}.json`);
    const raw = await fs.readFile(filePath, 'utf-8');
    const invite = JSON.parse(raw);

    if (invite.redeemedAt) {
      return { error: 'This invitation has already been used.' };
    }

    if (new Date(invite.expiresAt) < new Date()) {
      return { error: 'This invitation has expired.' };
    }

    // Mark as redeemed — store who joined and when
    invite.redeemedAt = new Date().toISOString();
    invite.redeemedBy = userId;
    invite.redeemedByEmail = userEmail;
    // Also store the name for display in the inviter's invite list
    invite.redeemedByName = userName || null;

    await fs.writeFile(filePath, JSON.stringify(invite, null, 2));

    return { success: true };
  } catch {
    return { error: 'Invalid invitation code.' };
  }
}

/**
 * Get all invites sent by a user (for the invite management UI).
 */
export async function getUserInvites(userId) {
  await ensureInvitesDir();

  try {
    const files = await fs.readdir(INVITES_DIR);
    const invites = [];

    for (const file of files.filter(f => f.endsWith('.json'))) {
      const raw = await fs.readFile(join(INVITES_DIR, file), 'utf-8');
      const invite = JSON.parse(raw);
      if (invite.inviterId === userId) {
        invites.push({
          code: invite.code,
          recipientEmail: invite.recipientEmail,
          createdAt: invite.createdAt,
          expiresAt: invite.expiresAt,
          redeemed: !!invite.redeemedAt,
          redeemedAt: invite.redeemedAt,
          redeemedByName: invite.redeemedByName || null,
          redeemedByEmail: invite.redeemedByEmail || null,
          expired: new Date(invite.expiresAt) < new Date() && !invite.redeemedAt
        });
      }
    }

    return invites.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch {
    return [];
  }
}

/**
 * Delete an invite. Only the inviter can delete their own invites.
 * Cannot delete already-redeemed invites.
 */
export async function deleteInvite(code, userId, userEmail) {
  await ensureInvitesDir();

  if (!code) return { error: 'Invite code is required.' };

  const cleanCode = code.toUpperCase().trim();

  try {
    const filePath = join(INVITES_DIR, `${cleanCode}.json`);
    const raw = await fs.readFile(filePath, 'utf-8');
    const invite = JSON.parse(raw);

    // Check ownership: inviter can delete their own, unlimited users can delete any
    const isUnlimited = userEmail && UNLIMITED_INVITE_EMAILS.includes(userEmail.toLowerCase().trim());
    if (invite.inviterId !== userId && !isUnlimited) {
      return { error: 'You can only delete your own invitations.' };
    }

    // Cannot delete already-redeemed invites
    if (invite.redeemedAt) {
      return { error: 'Cannot delete an invitation that has already been accepted.' };
    }

    // Delete the invite file
    await fs.unlink(filePath);

    return { success: true, deletedCode: cleanCode };
  } catch {
    return { error: 'Invitation not found.' };
  }
}

/**
 * Admin: create an invite without needing an existing account.
 * Used for seeding initial invites.
 */
export async function createAdminInvite(recipientEmail) {
  await ensureInvitesDir();

  const code = generateInviteCode();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days for admin invites

  const invite = {
    code,
    inviterId: 'admin',
    inviterName: 'Wayfinder Team',
    inviterEmail: 'team@wayfinderai.org',
    recipientEmail: (recipientEmail || '').toLowerCase().trim(),
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    redeemedAt: null,
    redeemedBy: null,
    isAdminInvite: true
  };

  await fs.writeFile(
    join(INVITES_DIR, `${code}.json`),
    JSON.stringify(invite, null, 2)
  );

  return { success: true, code, expiresAt: invite.expiresAt };
}
