/**
 * User Authentication Service
 *
 * Stores users as JSON files. For MVP/free hosting this is fine.
 * Upgrade path: swap for a proper database (SQLite, PostgreSQL, etc.)
 *
 * Security:
 * - Passwords hashed with bcrypt (cost factor 12)
 * - Tokens expire after 30 days
 * - Legacy SHA256 passwords auto-migrate on login
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash, randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const USERS_DIR = join(__dirname, '..', 'data', 'users');

const BCRYPT_ROUNDS = 12;
const TOKEN_TTL_DAYS = 30; // Tokens expire after 30 days
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// ─── Plan Configuration ──────────────────────────────────────────
// Internal plan keys: free / pro / elite
// Display names: Career Explorer / Coach ($25/mo) / Consultant ($50/mo)
// Free: Sonnet (selective lite brain context)
// Coach/Consultant engine pulls: Opus if CLAUDE_MODEL_ENGINE is set
const PLAN_DISPLAY_NAMES = { free: 'Explorer', pro: 'Coach ($25/mo)', elite: 'Consultant ($50/mo)' };

// Admin emails — can switch plans to test tier behavior, always get elite limits
// 'admin' is the built-in admin account (always included). Dan's personal email behaves like a normal user.
// ADMIN_EMAILS env var adds additional admins; 'admin' is always admin regardless.
const ADMIN_EMAILS = [
  'admin', // Built-in admin — always recognized, cannot be removed via env var
  ...(process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(e => e.toLowerCase().trim())
    .filter(Boolean)
];

// VIP emails — always get elite-tier access (not admin, just full access)
// Load from env, fallback to hardcoded defaults
const VIP_EMAILS = (process.env.VIP_EMAILS || 'mhrkim@yahoo.com,danielyungkim@hotmail.com,serenakimkimkim@gmail.com,benjaminkim042@gmail.com,elenakimjune@gmail.com')
  .split(',')
  .map(e => e.toLowerCase().trim())
  .filter(Boolean);
const PLAN_LIMITS = {
  free:  { enginePerDay: 3,  dailyTokens: 25000,   monthlyTokens: null,      invites: 1,  messagesPerDay: 10, messagesPerMonth: 30  },
  pro:   { enginePerDay: 10, dailyTokens: 150000,  monthlyTokens: 3000000,   invites: 5,  messagesPerDay: 20, messagesPerMonth: 60  },
  elite: { enginePerDay: 20, dailyTokens: 300000,  monthlyTokens: 8000000,   invites: 10, messagesPerDay: 50, messagesPerMonth: 200 },
};

// Feature access control
const FEATURE_ACCESS = {
  demographics_full:    ['pro', 'elite'],
  demographics_compare: ['elite'],
  decision_dates:       ['pro', 'elite'],
  admissions_timeline:  ['pro', 'elite'],
  internships_preview:  ['pro'],
  internships_full:     ['elite'],
  scholarships_preview: ['pro'],
  scholarships:         ['elite'],
  programs_preview:     ['pro'],
  programs:             ['elite'],
  financial_aid_preview: ['pro'],
  financial_aid:         ['elite'],
  email_reminders:      ['pro', 'elite'],
  email_full_reminders: ['elite'],
  essay_reviewer:       ['pro', 'elite'],
};

export function getPlanLimits(plan) {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
}

// canAccess(plan, feature) or canAccess(plan, feature, email)
// Admin/VIP emails always get access regardless of plan
export function canAccess(planOrUser, feature, email = null) {
  // Support passing a sanitized user object (has .plan, .isAdmin, .email)
  if (planOrUser && typeof planOrUser === 'object') {
    if (planOrUser.isAdmin || isVIP(planOrUser.email)) return true;
    return (FEATURE_ACCESS[feature] || []).includes(planOrUser.plan || 'free');
  }
  // String plan + optional email
  if (email && (ADMIN_EMAILS.includes(email.toLowerCase()) || VIP_EMAILS.includes(email.toLowerCase()))) return true;
  return (FEATURE_ACCESS[feature] || []).includes(planOrUser);
}

export function isAdmin(email) {
  return email && ADMIN_EMAILS.includes(email.toLowerCase());
}

export function isVIP(email) {
  return email && VIP_EMAILS.includes(email.toLowerCase());
}

// Ensure users directory exists
export async function ensureUsersDir() {
  await fs.mkdir(USERS_DIR, { recursive: true });
}

/**
 * Scan and repair all corrupted user files on startup.
 * Fixes the race condition where concurrent writes corrupt JSON.
 */
export async function repairCorruptedUserFiles() {
  await ensureUsersDir();
  try {
    const files = await fs.readdir(USERS_DIR);
    let repaired = 0;
    let failed = 0;
    for (const file of files.filter(f => f.endsWith('.json'))) {
      const filePath = join(USERS_DIR, file);
      try {
        const raw = await fs.readFile(filePath, 'utf-8');
        JSON.parse(raw); // test if valid
      } catch {
        // File is corrupted — attempt repair
        console.warn(`[Auth] Startup repair: corrupted file detected: ${file}`);
        try {
          const raw = await fs.readFile(filePath, 'utf-8');
          const fixed = tryRepairJSON(raw);
          if (fixed && fixed.email) {
            await atomicWriteJSON(filePath, fixed);
            console.log(`[Auth] Startup repair: FIXED ${file} (user: ${fixed.email})`);
            repaired++;
          } else {
            console.error(`[Auth] Startup repair: FAILED to repair ${file}`);
            failed++;
          }
        } catch (err) {
          console.error(`[Auth] Startup repair: error processing ${file}: ${err.message}`);
          failed++;
        }
      }
    }
    if (repaired > 0 || failed > 0) {
      console.log(`[Auth] Startup repair complete: ${repaired} fixed, ${failed} failed`);
    }
  } catch (err) {
    console.error('[Auth] Startup repair scan error:', err.message);
  }
}

// Legacy password check (SHA256) — only for migration
function legacyHashPassword(password, salt) {
  return createHash('sha256').update(password + salt).digest('hex');
}

function generateToken() {
  return randomBytes(32).toString('hex');
}

/**
 * Attempt to repair corrupted JSON by extracting the first valid JSON object.
 * Handles the common case of extra data appended after valid JSON (race condition).
 */
function tryRepairJSON(raw) {
  // Try parsing as-is first
  try { return JSON.parse(raw); } catch {}

  // Find the last } in the file and try parsing up to there
  // The corruption is usually extra content appended after the closing brace
  let depth = 0;
  let inString = false;
  let escape = false;
  let lastValidEnd = -1;

  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\' && inString) { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{') depth++;
    if (ch === '}') {
      depth--;
      if (depth === 0) { lastValidEnd = i + 1; break; }
    }
  }

  if (lastValidEnd > 0) {
    try {
      return JSON.parse(raw.substring(0, lastValidEnd));
    } catch {}
  }

  return null;
}

/**
 * Safely read and parse a JSON user file.
 * If corrupted, attempts to repair by extracting valid JSON.
 * Prevents one bad file from crashing auth for ALL users.
 */
async function safeReadUserFile(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    try {
      return JSON.parse(raw);
    } catch (parseErr) {
      console.warn(`[Auth] JSON parse failed for ${filePath}: ${parseErr.message}. Attempting repair...`);
      const repaired = tryRepairJSON(raw);
      if (repaired) {
        // Write the repaired file back (atomic)
        await atomicWriteJSON(filePath, repaired);
        console.log(`[Auth] Successfully repaired corrupted user file: ${filePath}`);
        return repaired;
      }
      console.error(`[Auth] Could not repair corrupted user file ${filePath}`);
      return null;
    }
  } catch (err) {
    console.error(`[Auth] Unreadable user file ${filePath}: ${err.message}`);
    return null;
  }
}

/**
 * Atomic write: write to a temp file then rename, preventing partial writes.
 */
async function atomicWriteJSON(filePath, data) {
  const tmpPath = filePath + '.tmp';
  await fs.writeFile(tmpPath, JSON.stringify(data, null, 2));
  await fs.rename(tmpPath, filePath);
}

function isTokenExpired(tokenCreatedAt) {
  // If tokenCreatedAt is missing (legacy user), treat as NOT expired
  // — the token will be backfilled on next verifyToken call
  if (!tokenCreatedAt) return false;
  const created = new Date(tokenCreatedAt).getTime();
  if (isNaN(created)) return false; // malformed date — don't lock out user
  const now = Date.now();
  const ttlMs = TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;
  return (now - created) > ttlMs;
}

/**
 * Validate password strength.
 * Requirements: minimum 8 characters, at least one number and one letter
 */
function validatePasswordStrength(password) {
  if (!password) {
    return { valid: false, error: 'Password is required' };
  }
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number' };
  }
  if (!/[a-zA-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one letter' };
  }
  return { valid: true };
}

/**
 * Create a new user account.
 */
export async function createUser({ email, password, name, userType, school, interests }) {
  await ensureUsersDir();

  const emailLower = email.toLowerCase().trim();
  const userFile = join(USERS_DIR, `${emailLower.replace(/[^a-z0-9]/g, '_')}.json`);

  // Validate password strength
  const passValidation = validatePasswordStrength(password);
  if (!passValidation.valid) {
    return { error: passValidation.error };
  }

  // Check if user exists
  try {
    await fs.access(userFile);
    return { error: 'An account with this email already exists' };
  } catch {
    // Good — user doesn't exist yet
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const token = generateToken();
  const now = new Date().toISOString();

  const user = {
    id: randomBytes(8).toString('hex'),
    email: emailLower,
    name: name || '',
    userType: userType || 'student', // student, pre-college, advisor, general
    school: school || '',
    interests: interests || [],
    passwordHash: passwordHash,
    // salt no longer needed with bcrypt — kept for legacy migration only
    token,
    tokenCreatedAt: now,
    createdAt: now,
    lastLogin: now,
    failedLoginAttempts: 0,
    lastFailedLoginAt: null,
    accountLockedUntil: null,
    sessionHistory: [], // Links to past session IDs
    profile: {
      age: '',
      gradeLevel: '',       // e.g. '10th', 'Freshman', 'Junior', 'Working Professional'
      favoriteClasses: [],   // e.g. ['Math', 'Biology', 'Art']
      careerInterests: [],   // e.g. ['Software Engineering', 'Medicine']
      aboutMe: ''            // freeform description
    },
    plan: 'free',           // free | pro ($25/mo) | elite ($50/mo)
    settings: {
      displayName: name || '',
      memory: true,         // whether wayfinder remembers conversations
      helpImprove: true     // consent for using data to improve
    },
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    planExpiresAt: null,
    engineUsesToday: 0,
    engineLastReset: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
    tokensUsedToday: 0,
    tokenLastReset: new Date().toISOString().slice(0, 10),
    tokensUsedMonth: 0,
    tokenMonthReset: new Date().toISOString().slice(0, 7),  // YYYY-MM

    // Essay reviewer credits (add-on purchase)
    essayReviewsRemaining: 0,
    essayReviewsPurchased: [],

    // Admissions profile (for timeline + reminders)
    admissionsProfile: {
      graduationYear: null,
      targetSchools: [],       // [{name, unitId, deadline, decisionType}]
      intendedMajors: [],
      state: null,             // Home state for internship filtering
      reminderPreferences: {
        email: true,
        frequency: 'weekly',   // daily | weekly | monthly
        types: ['deadlines', 'decisions', 'scholarships']
      }
    },

    consentGiven: false,
    consentTimestamp: null
  };

  await atomicWriteJSON(userFile, user);

  return {
    success: true,
    user: sanitizeUser(user),
    token
  };
}

/**
 * Log in an existing user.
 */
export async function loginUser(email, password) {
  await ensureUsersDir();

  const emailLower = email.toLowerCase().trim();
  const userFile = join(USERS_DIR, `${emailLower.replace(/[^a-z0-9]/g, '_')}.json`);

  let user;
  try {
    const raw = await fs.readFile(userFile, 'utf-8');
    try {
      user = JSON.parse(raw);
    } catch (parseErr) {
      // Attempt to repair corrupted JSON (race condition from concurrent writes)
      console.warn(`[Auth] Login: corrupted user file ${userFile}, attempting repair...`);
      user = tryRepairJSON(raw);
      if (user) {
        await atomicWriteJSON(userFile, user);
        console.log(`[Auth] Login: repaired user file ${userFile}`);
      } else {
        console.error(`[Auth] Login: could not repair ${userFile}`);
        return { error: 'Invalid email or password' };
      }
    }
  } catch {
    return { error: 'Invalid email or password' };
  }

  // Check if account is locked
  if (user.accountLockedUntil) {
    const lockUntil = new Date(user.accountLockedUntil).getTime();
    const now = Date.now();
    if (now < lockUntil) {
      const minutesRemaining = Math.ceil((lockUntil - now) / 60000);
      return { error: `Account is locked. Try again in ${minutesRemaining} minute(s).` };
    } else {
      // Unlock the account
      user.accountLockedUntil = null;
      user.failedLoginAttempts = 0;
    }
  }

  // Check password — support both bcrypt (new) and SHA256 (legacy)
  let passwordValid = false;

  if (user.passwordHash.startsWith('$2b$') || user.passwordHash.startsWith('$2a$')) {
    // bcrypt hash
    passwordValid = await bcrypt.compare(password, user.passwordHash);
  } else if (user.salt) {
    // Legacy SHA256 hash — check and migrate
    const legacyHash = legacyHashPassword(password, user.salt);
    passwordValid = (legacyHash === user.passwordHash);

    if (passwordValid) {
      // Auto-migrate to bcrypt
      user.passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
      delete user.salt;
      console.log(`🔒 Migrated ${emailLower} from SHA256 to bcrypt`);
    }
  }

  if (!passwordValid) {
    // Track failed login attempt
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
    user.lastFailedLoginAt = new Date().toISOString();

    // Lock account after MAX_LOGIN_ATTEMPTS failed attempts
    if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
      user.accountLockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS).toISOString();
      console.log(`🔒 Account locked for ${emailLower} after ${MAX_LOGIN_ATTEMPTS} failed attempts`);
    }

    await atomicWriteJSON(userFile, user);
    return { error: 'Invalid email or password' };
  }

  // Successful login — reset failed attempt counter
  user.failedLoginAttempts = 0;
  user.lastFailedLoginAt = null;

  // Generate new token with expiration tracking
  const now = new Date().toISOString();
  user.token = generateToken();
  user.tokenCreatedAt = now;
  user.lastLogin = now;
  await atomicWriteJSON(userFile, user);

  return {
    success: true,
    user: sanitizeUser(user),
    token: user.token
  };
}

/**
 * Generate a password reset token for a user.
 * Token is 6-digit numeric code, valid for 15 minutes.
 */
export async function requestPasswordReset(email) {
  await ensureUsersDir();
  const emailLower = email.toLowerCase().trim();
  const userFile = join(USERS_DIR, `${emailLower.replace(/[^a-z0-9]/g, '_')}.json`);

  let user;
  try {
    const raw = await fs.readFile(userFile, 'utf-8');
    user = JSON.parse(raw);
  } catch {
    // Don't reveal whether account exists
    return { success: true };
  }

  // Generate 6-digit reset code using cryptographically secure random
  const resetCode = String(100000 + (randomBytes(4).readUInt32BE(0) % 900000));
  user.resetCode = resetCode;
  user.resetCodeExpires = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 min

  await atomicWriteJSON(userFile, user);
  return { success: true, resetCode, userName: user.name || emailLower };
}

/**
 * Reset password using a valid reset code.
 */
export async function resetPassword(email, code, newPassword) {
  await ensureUsersDir();
  const emailLower = email.toLowerCase().trim();
  const userFile = join(USERS_DIR, `${emailLower.replace(/[^a-z0-9]/g, '_')}.json`);

  let user;
  try {
    const raw = await fs.readFile(userFile, 'utf-8');
    user = JSON.parse(raw);
  } catch {
    return { error: 'Invalid reset code.' };
  }

  // Verify code
  if (!user.resetCode || user.resetCode !== code) {
    return { error: 'Invalid reset code.' };
  }

  // Check expiry
  if (new Date(user.resetCodeExpires) < new Date()) {
    user.resetCode = null;
    user.resetCodeExpires = null;
    await atomicWriteJSON(userFile, user);
    return { error: 'Reset code has expired. Please request a new one.' };
  }

  // Validate new password strength (same rules as signup)
  const passValidation = validatePasswordStrength(newPassword);
  if (!passValidation.valid) {
    return { error: passValidation.error };
  }

  // Hash and save
  user.passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  delete user.salt; // Remove legacy salt if present
  user.resetCode = null;
  user.resetCodeExpires = null;
  user.failedLoginAttempts = 0;
  user.accountLockedUntil = null;

  await atomicWriteJSON(userFile, user);
  return { success: true };
}

/**
 * Log out a user by invalidating their token.
 */
export async function logoutUser(token) {
  if (!token) return { error: 'No token provided' };

  try {
    const files = await fs.readdir(USERS_DIR);
    for (const file of files.filter(f => f.endsWith('.json'))) {
      const filePath = join(USERS_DIR, file);
      let user;
      try {
        const raw = await fs.readFile(filePath, 'utf-8');
        user = JSON.parse(raw);
      } catch { continue; }
      if (user.token === token) {
        // Invalidate token by setting it to null
        user.token = null;
        user.tokenCreatedAt = null;
        await atomicWriteJSON(filePath, user);
        return { success: true };
      }
    }
    return { error: 'User not found' };
  } catch (err) {
    return { error: 'Failed to log out' };
  }
}

/**
 * Verify a token and return the user.
 */
export async function verifyToken(token) {
  if (!token) return null;

  try {
    const files = await fs.readdir(USERS_DIR);
    for (const file of files.filter(f => f.endsWith('.json'))) {
      let user;
      try {
        const raw = await fs.readFile(join(USERS_DIR, file), 'utf-8');
        user = JSON.parse(raw);
      } catch (parseErr) {
        // Skip corrupted user files — don't let one bad file break ALL auth
        console.error(`[Auth] Corrupted user file ${file}: ${parseErr.message}`);
        continue;
      }

      if (user.token === token) {
        // Check token expiration
        if (isTokenExpired(user.tokenCreatedAt)) {
          console.log(`[Auth] Token expired for ${user.email} — must re-login`);
          return null;
        }

        // Backfill tokenCreatedAt for legacy users missing the field
        if (!user.tokenCreatedAt) {
          user.tokenCreatedAt = new Date().toISOString();
          await atomicWriteJSON(join(USERS_DIR, file), user);
          console.log(`[Auth] Backfilled tokenCreatedAt for legacy user ${user.email}`);
        }

        return sanitizeUser(user);
      }
    }
  } catch (err) {
    console.error('[Auth] verifyToken error:', err.message);
    return null;
  }

  return null;
}

/**
 * Update user profile.
 */
export async function updateProfile(token, updates) {
  if (!token) return { error: 'Not authenticated' };

  try {
    const files = await fs.readdir(USERS_DIR);
    for (const file of files.filter(f => f.endsWith('.json'))) {
      const user = await safeReadUserFile(join(USERS_DIR, file));
      if (!user) continue;
      if (user.token === token) {
        // Update allowed fields
        if (updates.name) user.name = updates.name;
        if (updates.userType) user.userType = updates.userType;
        if (updates.school) user.school = updates.school;
        if (updates.interests) user.interests = updates.interests;
        if (updates.profile) {
          user.profile = { ...user.profile, ...updates.profile };
        }
        if (updates.consentGiven !== undefined) {
          user.consentGiven = updates.consentGiven;
          user.consentTimestamp = new Date().toISOString();
        }

        await atomicWriteJSON(join(USERS_DIR, file), user);
        return { success: true, user: sanitizeUser(user) };
      }
    }
  } catch (err) {
    return { error: 'Failed to update profile' };
  }

  return { error: 'User not found' };
}

/**
 * Link a session to a user account.
 */
export async function linkSession(token, sessionId) {
  if (!token) return;

  try {
    const files = await fs.readdir(USERS_DIR);
    for (const file of files.filter(f => f.endsWith('.json'))) {
      const user = await safeReadUserFile(join(USERS_DIR, file));
      if (!user) continue;
      if (user.token === token) {
        if (!user.sessionHistory.includes(sessionId)) {
          user.sessionHistory.push(sessionId);
          // Keep last 50 sessions
          if (user.sessionHistory.length > 50) {
            user.sessionHistory = user.sessionHistory.slice(-50);
          }
        }
        await atomicWriteJSON(join(USERS_DIR, file), user);
        return;
      }
    }
  } catch {
    // Non-critical, don't throw
  }
}

/**
 * Get user's past sessions.
 */
export async function getUserSessions(token) {
  if (!token) return [];

  try {
    const files = await fs.readdir(USERS_DIR);
    for (const file of files.filter(f => f.endsWith('.json'))) {
      const user = await safeReadUserFile(join(USERS_DIR, file));
      if (!user) continue;
      if (user.token === token) {
        return user.sessionHistory;
      }
    }
  } catch {
    return [];
  }

  return [];
}

/**
 * Check engine uses remaining today. Resets daily.
 */
export async function getEngineUsage(token) {
  if (!token) return { usesToday: 0, remaining: 0 };

  const today = new Date().toISOString().slice(0, 10);

  try {
    const files = await fs.readdir(USERS_DIR);
    for (const file of files.filter(f => f.endsWith('.json'))) {
      const user = await safeReadUserFile(join(USERS_DIR, file));
      if (!user) continue;
      if (user.token === token) {
        const limits = getPlanLimits(user.plan || 'free');
        // Reset if new day
        if (user.engineLastReset !== today) {
          user.engineUsesToday = 0;
          user.engineLastReset = today;
          await atomicWriteJSON(join(USERS_DIR, file), user);
        }
        return {
          usesToday: user.engineUsesToday || 0,
          remaining: Math.max(0, limits.enginePerDay - (user.engineUsesToday || 0)),
          max: limits.enginePerDay
        };
      }
    }
  } catch {
    return { usesToday: 0, remaining: 0, max: 3 };
  }
  return { usesToday: 0, remaining: 0, max: 3 };
}

/**
 * Delete a user account.
 */
export async function deleteUser(token) {
  if (!token) return { error: 'Not authenticated' };

  try {
    const files = await fs.readdir(USERS_DIR);
    for (const file of files.filter(f => f.endsWith('.json'))) {
      const user = await safeReadUserFile(join(USERS_DIR, file));
      if (!user) continue;
      if (user.token === token) {
        await fs.unlink(join(USERS_DIR, file));
        return { success: true };
      }
    }
  } catch (err) {
    return { error: 'Failed to delete user' };
  }

  return { error: 'User not found' };
}

/**
 * Update user settings.
 */
export async function updateSettings(token, settings) {
  if (!token) return { error: 'Not authenticated' };

  try {
    const files = await fs.readdir(USERS_DIR);
    for (const file of files.filter(f => f.endsWith('.json'))) {
      const user = await safeReadUserFile(join(USERS_DIR, file));
      if (!user) continue;
      if (user.token === token) {
        // Update allowed settings fields
        if (!user.settings) user.settings = {};
        if (settings.displayName !== undefined) user.settings.displayName = settings.displayName;
        if (settings.memory !== undefined) user.settings.memory = settings.memory;
        if (settings.helpImprove !== undefined) user.settings.helpImprove = settings.helpImprove;

        await atomicWriteJSON(join(USERS_DIR, file), user);
        return { success: true, user: sanitizeUser(user) };
      }
    }
  } catch (err) {
    return { error: 'Failed to update settings' };
  }

  return { error: 'User not found' };
}

/**
 * Get user's chat history with session summaries.
 */
export async function getUserChatHistory(token) {
  if (!token) return [];

  try {
    const files = await fs.readdir(USERS_DIR);
    for (const file of files.filter(f => f.endsWith('.json'))) {
      const user = await safeReadUserFile(join(USERS_DIR, file));
      if (!user) continue;
      if (user.token === token) {
        const sessionHistory = [];
        const SESSIONS_DIR = join(__dirname, '..', 'data', 'sessions');

        for (const sessionId of user.sessionHistory || []) {
          try {
            const sessionFile = join(SESSIONS_DIR, `${sessionId}.json`);
            const sessionRaw = await fs.readFile(sessionFile, 'utf-8');
            const session = JSON.parse(sessionRaw);

            // Extract first user message as title (truncated to 50 chars)
            let title = '';
            if (session.history && session.history.length > 0) {
              const firstUserMsg = session.history.find(msg => msg.role === 'user');
              if (firstUserMsg) {
                title = firstUserMsg.content.substring(0, 50);
              }
            }

            sessionHistory.push({
              id: session.id,
              title: title || '(Empty session)',
              created: session.created,
              lastActive: session.lastActive,
              messageCount: session.messageCount || 0
            });
          } catch {
            // Skip sessions that can't be loaded
          }
        }

        // Sort by lastActive descending
        return sessionHistory.sort((a, b) => new Date(b.lastActive) - new Date(a.lastActive));
      }
    }
  } catch {
    return [];
  }

  return [];
}

/**
 * Search user's chat history for a query string.
 */
export async function searchUserChats(token, query) {
  if (!token || !query) return [];

  const lowerQuery = query.toLowerCase();

  try {
    const files = await fs.readdir(USERS_DIR);
    for (const file of files.filter(f => f.endsWith('.json'))) {
      const user = await safeReadUserFile(join(USERS_DIR, file));
      if (!user) continue;
      if (user.token === token) {
        const matchingSessions = [];
        const SESSIONS_DIR = join(__dirname, '..', 'data', 'sessions');

        for (const sessionId of user.sessionHistory || []) {
          try {
            const sessionFile = join(SESSIONS_DIR, `${sessionId}.json`);
            const sessionRaw = await fs.readFile(sessionFile, 'utf-8');
            const session = JSON.parse(sessionRaw);

            // Search through message content
            let matchingSnippet = '';
            if (session.history) {
              for (const msg of session.history) {
                if (msg.content.toLowerCase().includes(lowerQuery)) {
                  // Get a snippet around the match
                  const index = msg.content.toLowerCase().indexOf(lowerQuery);
                  const start = Math.max(0, index - 30);
                  const end = Math.min(msg.content.length, index + lowerQuery.length + 30);
                  matchingSnippet = '...' + msg.content.substring(start, end) + '...';
                  break;
                }
              }
            }

            if (matchingSnippet) {
              matchingSessions.push({
                id: session.id,
                created: session.created,
                lastActive: session.lastActive,
                messageCount: session.messageCount || 0,
                matchingSnippet
              });
            }
          } catch {
            // Skip sessions that can't be loaded
          }
        }

        return matchingSessions;
      }
    }
  } catch {
    return [];
  }

  return [];
}

/**
 * Increment engine usage for today. Returns false if limit reached.
 */
export async function useEngine(token) {
  if (!token) return { allowed: false, remaining: 0 };

  const today = new Date().toISOString().slice(0, 10);

  try {
    const files = await fs.readdir(USERS_DIR);
    for (const file of files.filter(f => f.endsWith('.json'))) {
      const user = await safeReadUserFile(join(USERS_DIR, file));
      if (!user) continue;
      if (user.token === token) {
        const limits = getPlanLimits(user.plan || 'free');
        // Reset if new day
        if (user.engineLastReset !== today) {
          user.engineUsesToday = 0;
          user.engineLastReset = today;
        }

        if ((user.engineUsesToday || 0) >= limits.enginePerDay) {
          return { allowed: false, remaining: 0, max: limits.enginePerDay };
        }

        user.engineUsesToday = (user.engineUsesToday || 0) + 1;
        await atomicWriteJSON(join(USERS_DIR, file), user);

        return {
          allowed: true,
          remaining: limits.enginePerDay - user.engineUsesToday,
          max: limits.enginePerDay
        };
      }
    }
  } catch {
    return { allowed: false, remaining: 0, max: 3 };
  }
  return { allowed: false, remaining: 0, max: 3 };
}

/**
 * Get daily token limit based on plan (uses centralized PLAN_LIMITS).
 */
function getDailyTokenLimit(plan) {
  return (PLAN_LIMITS[plan] || PLAN_LIMITS.free).dailyTokens;
}

/**
 * Get monthly token limit based on plan (null = unlimited/no monthly cap).
 */
function getMonthlyTokenLimit(plan) {
  return (PLAN_LIMITS[plan] || PLAN_LIMITS.free).monthlyTokens;
}

/**
 * Check daily + monthly token usage. Returns { allowed, tokensUsed, tokensRemaining, limit, monthly }.
 */
export async function checkTokenUsage(token) {
  if (!token) return { allowed: true, tokensUsed: 0, tokensRemaining: 50000, limit: 50000 };

  const today = new Date().toISOString().slice(0, 10);
  const thisMonth = new Date().toISOString().slice(0, 7);

  try {
    const files = await fs.readdir(USERS_DIR);
    for (const file of files.filter(f => f.endsWith('.json'))) {
      const user = await safeReadUserFile(join(USERS_DIR, file));
      if (!user) continue;
      if (user.token === token) {
        let dirty = false;

        // Daily reset
        if (user.tokenLastReset !== today) {
          user.tokensUsedToday = 0;
          user.tokenLastReset = today;
          dirty = true;
        }

        // Monthly reset
        if (user.tokenMonthReset !== thisMonth) {
          user.tokensUsedMonth = 0;
          user.tokenMonthReset = thisMonth;
          dirty = true;
        }

        if (dirty) {
          await atomicWriteJSON(join(USERS_DIR, file), user);
        }

        const dailyLimit = getDailyTokenLimit(user.plan || 'free');
        const monthlyLimit = getMonthlyTokenLimit(user.plan || 'free');
        const dailyUsed = user.tokensUsedToday || 0;
        const monthlyUsed = user.tokensUsedMonth || 0;

        // Check both daily and monthly limits
        const dailyOk = dailyUsed < dailyLimit;
        const monthlyOk = monthlyLimit === null || monthlyUsed < monthlyLimit;

        return {
          allowed: dailyOk && monthlyOk,
          tokensUsed: dailyUsed,
          tokensRemaining: Math.max(0, dailyLimit - dailyUsed),
          limit: dailyLimit,
          monthly: monthlyLimit ? {
            used: monthlyUsed,
            limit: monthlyLimit,
            remaining: Math.max(0, monthlyLimit - monthlyUsed)
          } : null
        };
      }
    }
  } catch {
    return { allowed: true, tokensUsed: 0, tokensRemaining: 50000, limit: 50000 };
  }
  return { allowed: true, tokensUsed: 0, tokensRemaining: 50000, limit: 50000 };
}

/**
 * Record token usage for today.
 */
export async function recordTokenUsage(token, tokensUsed) {
  if (!token || !tokensUsed) return;

  const today = new Date().toISOString().slice(0, 10);
  const thisMonth = new Date().toISOString().slice(0, 7);

  try {
    const files = await fs.readdir(USERS_DIR);
    for (const file of files.filter(f => f.endsWith('.json'))) {
      const user = await safeReadUserFile(join(USERS_DIR, file));
      if (!user) continue;
      if (user.token === token) {
        // Daily reset
        if (user.tokenLastReset !== today) {
          user.tokensUsedToday = 0;
          user.tokenLastReset = today;
        }
        // Monthly reset
        if (user.tokenMonthReset !== thisMonth) {
          user.tokensUsedMonth = 0;
          user.tokenMonthReset = thisMonth;
        }
        user.tokensUsedToday = (user.tokensUsedToday || 0) + tokensUsed;
        user.tokensUsedMonth = (user.tokensUsedMonth || 0) + tokensUsed;
        await atomicWriteJSON(join(USERS_DIR, file), user);
        return;
      }
    }
  } catch {
    // Non-critical
  }
}

// ─── Message Usage Tracking ─────────────────────────────────────────
// Tracks messages per day and per month, separate from token tracking.
// All routing modes count (SLM, Haiku Advisor, Welcome Desk, Engine).

/**
 * Check daily + monthly message usage. Returns { allowed, daily, monthly, upgradeReason }.
 */
export async function checkMessageUsage(token) {
  if (!token) return { allowed: true, daily: { used: 0, limit: null, remaining: null }, monthly: { used: 0, limit: null, remaining: null } };

  const today = new Date().toISOString().slice(0, 10);
  const thisMonth = new Date().toISOString().slice(0, 7);

  try {
    const files = await fs.readdir(USERS_DIR);
    for (const file of files.filter(f => f.endsWith('.json'))) {
      const user = await safeReadUserFile(join(USERS_DIR, file));
      if (!user) continue;
      if (user.token === token) {
        let dirty = false;
        const admin = isAdmin(user.email);
        const vip = isVIP(user.email);
        const plan = vip ? 'elite' : (user.plan === 'premium' ? 'pro' : (user.plan || 'free'));
        const limits = (admin || vip) ? getPlanLimits('elite') : getPlanLimits(plan);

        // Daily reset
        if ((user.messageLastDayReset || '') !== today) {
          user.messagesUsedToday = 0;
          user.messageLastDayReset = today;
          dirty = true;
        }
        // Monthly reset
        if ((user.messageLastMonthReset || '') !== thisMonth) {
          user.messagesUsedMonth = 0;
          user.messageLastMonthReset = thisMonth;
          dirty = true;
        }

        if (dirty) {
          await atomicWriteJSON(join(USERS_DIR, file), user);
        }

        const dailyUsed = user.messagesUsedToday || 0;
        const monthlyUsed = user.messagesUsedMonth || 0;
        const dailyLimit = limits.messagesPerDay;
        const monthlyLimit = limits.messagesPerMonth;

        const dailyOk = dailyLimit === null || dailyUsed < dailyLimit;
        const monthlyOk = monthlyLimit === null || monthlyUsed < monthlyLimit;

        let upgradeReason = null;
        if (!dailyOk) upgradeReason = 'daily_messages';
        else if (!monthlyOk) upgradeReason = 'monthly_messages';

        return {
          allowed: dailyOk && monthlyOk,
          upgradeReason,
          daily: {
            used: dailyUsed,
            limit: dailyLimit,
            remaining: dailyLimit !== null ? Math.max(0, dailyLimit - dailyUsed) : null
          },
          monthly: {
            used: monthlyUsed,
            limit: monthlyLimit,
            remaining: monthlyLimit !== null ? Math.max(0, monthlyLimit - monthlyUsed) : null
          }
        };
      }
    }
  } catch {
    return { allowed: true, daily: { used: 0, limit: null, remaining: null }, monthly: { used: 0, limit: null, remaining: null } };
  }
  return { allowed: true, daily: { used: 0, limit: null, remaining: null }, monthly: { used: 0, limit: null, remaining: null } };
}

/**
 * Record one message for today + this month.
 */
export async function recordMessageUsage(token) {
  if (!token) return;

  const today = new Date().toISOString().slice(0, 10);
  const thisMonth = new Date().toISOString().slice(0, 7);

  try {
    const files = await fs.readdir(USERS_DIR);
    for (const file of files.filter(f => f.endsWith('.json'))) {
      const user = await safeReadUserFile(join(USERS_DIR, file));
      if (!user) continue;
      if (user.token === token) {
        // Daily reset
        if ((user.messageLastDayReset || '') !== today) {
          user.messagesUsedToday = 0;
          user.messageLastDayReset = today;
        }
        // Monthly reset
        if ((user.messageLastMonthReset || '') !== thisMonth) {
          user.messagesUsedMonth = 0;
          user.messageLastMonthReset = thisMonth;
        }
        user.messagesUsedToday = (user.messagesUsedToday || 0) + 1;
        user.messagesUsedMonth = (user.messagesUsedMonth || 0) + 1;
        await atomicWriteJSON(join(USERS_DIR, file), user);
        return;
      }
    }
  } catch {
    // Non-critical
  }
}

/**
 * Update user plan and Stripe-related fields.
 */
export async function updateUserPlan(token, fields) {
  if (!token) return { error: 'Not authenticated' };

  try {
    const files = await fs.readdir(USERS_DIR);
    for (const file of files.filter(f => f.endsWith('.json'))) {
      const user = await safeReadUserFile(join(USERS_DIR, file));
      if (!user) continue;
      if (user.token === token) {
        if (fields.plan !== undefined) user.plan = fields.plan;
        if (fields.stripeCustomerId !== undefined) user.stripeCustomerId = fields.stripeCustomerId;
        if (fields.stripeSubscriptionId !== undefined) user.stripeSubscriptionId = fields.stripeSubscriptionId;
        if (fields.planExpiresAt !== undefined) user.planExpiresAt = fields.planExpiresAt;

        await atomicWriteJSON(join(USERS_DIR, file), user);
        return { success: true, user: sanitizeUser(user) };
      }
    }
  } catch (err) {
    return { error: 'Failed to update plan' };
  }

  return { error: 'User not found' };
}

/**
 * Add essay review credits to a user account.
 */
export async function addEssayCredits(stripeCustomerId, pack, quantity, stripePaymentId) {
  try {
    const files = await fs.readdir(USERS_DIR);
    for (const file of files.filter(f => f.endsWith('.json'))) {
      const user = await safeReadUserFile(join(USERS_DIR, file));
      if (!user) continue;
      if (user.stripeCustomerId === stripeCustomerId) {
        user.essayReviewsRemaining = (user.essayReviewsRemaining || 0) + quantity;
        if (!user.essayReviewsPurchased) user.essayReviewsPurchased = [];
        user.essayReviewsPurchased.push({
          pack,
          quantity,
          purchasedAt: new Date().toISOString(),
          stripePaymentId
        });
        await atomicWriteJSON(join(USERS_DIR, file), user);
        return { success: true, remaining: user.essayReviewsRemaining };
      }
    }
  } catch (err) {
    return { error: 'Failed to add essay credits' };
  }
  return { error: 'User not found' };
}

/**
 * Use one essay review credit. Returns false if no credits remaining.
 */
export async function useEssayCredit(token) {
  if (!token) return { allowed: false, remaining: 0 };

  try {
    const files = await fs.readdir(USERS_DIR);
    for (const file of files.filter(f => f.endsWith('.json'))) {
      const user = await safeReadUserFile(join(USERS_DIR, file));
      if (!user) continue;
      if (user.token === token) {
        // Admins and VIPs get unlimited credits — never deduct
        if (isAdmin(user.email) || isVIP(user.email)) {
          return { allowed: true, remaining: 999 };
        }
        const remaining = user.essayReviewsRemaining || 0;
        if (remaining <= 0) {
          return { allowed: false, remaining: 0 };
        }
        user.essayReviewsRemaining = remaining - 1;
        await atomicWriteJSON(join(USERS_DIR, file), user);
        return { allowed: true, remaining: user.essayReviewsRemaining };
      }
    }
  } catch {
    return { allowed: false, remaining: 0 };
  }
  return { allowed: false, remaining: 0 };
}

/**
 * Refund one essay review credit. Called when a review fails or returns invalid data.
 */
export async function refundEssayCredit(token) {
  if (!token) return { success: false, remaining: 0 };

  try {
    const files = await fs.readdir(USERS_DIR);
    for (const file of files.filter(f => f.endsWith('.json'))) {
      const user = await safeReadUserFile(join(USERS_DIR, file));
      if (!user) continue;
      if (user.token === token) {
        // Admins and VIPs don't need refunds (they have unlimited)
        if (isAdmin(user.email) || isVIP(user.email)) {
          return { success: true, remaining: 999 };
        }
        // Increment the credit count back
        user.essayReviewsRemaining = (user.essayReviewsRemaining || 0) + 1;
        await atomicWriteJSON(join(USERS_DIR, file), user);
        return { success: true, remaining: user.essayReviewsRemaining };
      }
    }
  } catch (err) {
    return { success: false, remaining: 0 };
  }
  return { success: false, remaining: 0 };
}

/**
 * Update user's admissions profile.
 */
export async function updateAdmissionsProfile(token, profile) {
  if (!token) return { error: 'Not authenticated' };

  try {
    const files = await fs.readdir(USERS_DIR);
    for (const file of files.filter(f => f.endsWith('.json'))) {
      const user = await safeReadUserFile(join(USERS_DIR, file));
      if (!user) continue;
      if (user.token === token) {
        if (!user.admissionsProfile) {
          user.admissionsProfile = { targetSchools: [], intendedMajors: [], reminderPreferences: {} };
        }
        user.admissionsProfile = { ...user.admissionsProfile, ...profile };
        await atomicWriteJSON(join(USERS_DIR, file), user);
        return { success: true, admissionsProfile: user.admissionsProfile };
      }
    }
  } catch (err) {
    return { error: 'Failed to update admissions profile' };
  }
  return { error: 'User not found' };
}

/**
 * Find a user by their Stripe Customer ID. Returns the raw user (with token).
 */
export async function findUserByStripeCustomerId(customerId) {
  if (!customerId) return null;

  try {
    const files = await fs.readdir(USERS_DIR);
    for (const file of files.filter(f => f.endsWith('.json'))) {
      const user = await safeReadUserFile(join(USERS_DIR, file));
      if (!user) continue;
      if (user.stripeCustomerId === customerId) {
        return user; // Returns full user with token
      }
    }
  } catch {
    return null;
  }

  return null;
}

/**
 * Find a full user record by token (unsanitized, for internal use).
 */
export async function findUserByToken(token) {
  if (!token) return null;

  try {
    const files = await fs.readdir(USERS_DIR);
    for (const file of files.filter(f => f.endsWith('.json'))) {
      let user;
      try {
        const raw = await fs.readFile(join(USERS_DIR, file), 'utf-8');
        user = JSON.parse(raw);
      } catch (parseErr) {
        console.error(`[Auth] Corrupted user file ${file}: ${parseErr.message}`);
        continue;
      }
      if (user.token === token) {
        return user; // Returns full user
      }
    }
  } catch {
    return null;
  }

  return null;
}

// Remove sensitive fields before sending to client
// Admin-only: set user's plan for testing tier behavior
export async function setUserPlan(token, newPlan) {
  if (!token) return { error: 'No token' };
  try {
    const files = await fs.readdir(USERS_DIR);
    for (const file of files.filter(f => f.endsWith('.json'))) {
      const filePath = join(USERS_DIR, file);
      const user = await safeReadUserFile(filePath);
      if (!user) continue;
      if (user.token === token) {
        if (!isAdmin(user.email)) return { error: 'Admin only' };
        user.plan = newPlan;
        await atomicWriteJSON(filePath, user);
        return { success: true, user: sanitizeUser(user) };
      }
    }
    return { error: 'User not found' };
  } catch (err) {
    return { error: err.message };
  }
}

function sanitizeUser(user) {
  const today = new Date().toISOString().slice(0, 10);
  const thisMonth = new Date().toISOString().slice(0, 7);
  const usesToday = user.engineLastReset === today ? (user.engineUsesToday || 0) : 0;
  const admin = isAdmin(user.email);
  const vip = isVIP(user.email);
  // Admins: use their set plan for feature flags (so they can test tier UX)
  // but always get elite-level limits (engine pulls, tokens)
  // VIPs: always treated as elite (full access, no admin powers)
  // Normalize legacy 'premium' plan → 'pro' (old Stripe webhook data)
  const rawPlan = user.plan === 'premium' ? 'pro' : (user.plan || 'free');
  const plan = vip ? 'elite' : rawPlan;
  const limits = (admin || vip) ? getPlanLimits('elite') : getPlanLimits(plan);

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    userType: user.userType,
    school: user.school,
    interests: user.interests,
    profile: user.profile,
    plan,
    planDisplayName: PLAN_DISPLAY_NAMES[plan] || 'Career Explorer',
    settings: user.settings,
    hasSubscription: !!user.stripeCustomerId,
    consentGiven: user.consentGiven,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin,
    sessionCount: (user.sessionHistory || []).length,
    engineUsesToday: usesToday,
    engineRemaining: Math.max(0, limits.enginePerDay - usesToday),
    engineMax: limits.enginePerDay,
    tokenUsage: {
      used: user.tokenLastReset === today ? (user.tokensUsedToday || 0) : 0,
      limit: limits.dailyTokens,
      remaining: Math.max(0, limits.dailyTokens - (user.tokenLastReset === today ? (user.tokensUsedToday || 0) : 0))
    },
    monthlyTokenUsage: limits.monthlyTokens ? {
      used: user.tokenMonthReset === thisMonth ? (user.tokensUsedMonth || 0) : 0,
      limit: limits.monthlyTokens,
      remaining: Math.max(0, limits.monthlyTokens - (user.tokenMonthReset === thisMonth ? (user.tokensUsedMonth || 0) : 0))
    } : null,
    messageUsage: {
      daily: {
        used: user.messageLastDayReset === today ? (user.messagesUsedToday || 0) : 0,
        limit: limits.messagesPerDay,
        remaining: limits.messagesPerDay !== null
          ? Math.max(0, limits.messagesPerDay - (user.messageLastDayReset === today ? (user.messagesUsedToday || 0) : 0))
          : null
      },
      monthly: {
        used: user.messageLastMonthReset === thisMonth ? (user.messagesUsedMonth || 0) : 0,
        limit: limits.messagesPerMonth,
        remaining: limits.messagesPerMonth !== null
          ? Math.max(0, limits.messagesPerMonth - (user.messageLastMonthReset === thisMonth ? (user.messagesUsedMonth || 0) : 0))
          : null
      }
    },
    essayReviewsRemaining: (admin || vip) ? 999 : (user.essayReviewsRemaining || 0),
    admissionsProfile: user.admissionsProfile || null,
    isAdmin: admin,
    // Feature access flags for frontend
    // Admins: features follow their SET plan so they can test tier UX
    // (admins still get elite limits for engine/tokens above)
    features: {
      demographicsFull: canAccess(plan, 'demographics_full'),
      demographicsCompare: canAccess(plan, 'demographics_compare'),
      decisionDates: canAccess(plan, 'decision_dates'),
      admissionsTimeline: canAccess(plan, 'admissions_timeline'),
      internshipsFull: canAccess(plan, 'internships_full'),
      internshipsPreview: canAccess(plan, 'internships_preview'),
      scholarships: canAccess(plan, 'scholarships'),
      scholarshipsPreview: canAccess(plan, 'scholarships_preview'),
      programs: canAccess(plan, 'programs'),
      programsPreview: canAccess(plan, 'programs_preview'),
      emailReminders: canAccess(plan, 'email_reminders'),
      essayReviewer: canAccess(plan, 'essay_reviewer'),
    }
  };
}
