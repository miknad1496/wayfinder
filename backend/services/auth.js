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
import { encryptUserFields, decryptUserFields } from './crypto.js';
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

// ─── Token Index ─────────────────────────────────────────────────
// In-memory Map<token, filename> for O(1) auth lookups.
// Without this, every verifyToken/logoutUser/etc call does an O(n)
// readdir + read-all-files scan. With 100+ users, this means 100+
// file reads on EVERY authenticated API request.
//
// Built once at startup via buildTokenIndex(), then maintained by
// createUser(), loginUser(), and logoutUser().
const tokenIndex = new Map();

// ─── Stripe Customer ID Index ────────────────────────────────────
// In-memory Map<stripeCustomerId, filename> for O(1) webhook lookups.
// Without this, every Stripe webhook (payment, subscription update,
// cancellation) does an O(n) readdir + read-all-files scan.
// Built at startup alongside tokenIndex, maintained by updateUserPlan().
const stripeCustomerIndex = new Map();

/**
 * Build the token → filename index by scanning all user files once.
 * Call this at startup AFTER repairCorruptedUserFiles().
 */
export async function buildTokenIndex() {
  await ensureUsersDir();
  tokenIndex.clear();
  stripeCustomerIndex.clear();
  try {
    const files = await fs.readdir(USERS_DIR);
    for (const file of files.filter(f => f.endsWith('.json'))) {
      try {
        const raw = await fs.readFile(join(USERS_DIR, file), 'utf-8');
        const user = decryptUserFields(JSON.parse(raw));
        // Only index ACTIVE tokens — skip expired ones to bound cache growth.
        // Expired tokens that get queried will still be slow-path-resolved and
        // rejected by verifyToken (isTokenExpired check). Skipping them at boot
        // prevents indefinite accumulation across long-lived processes.
        if (user.token && !isTokenExpired(user.tokenCreatedAt)) {
          tokenIndex.set(user.token, file);
        }
        if (user.stripeCustomerId) {
          stripeCustomerIndex.set(user.stripeCustomerId, file);
        }
      } catch {
        // Skip unreadable files — already handled by repairCorruptedUserFiles
      }
    }
    console.log(`[Auth] Token index built: ${tokenIndex.size} active tokens, ${stripeCustomerIndex.size} Stripe customers`);
  } catch (err) {
    console.error('[Auth] Failed to build token index:', err.message);
  }
}

/**
 * Resolve a token to a {user, filePath, filename} object using the index.
 * Falls back to full directory scan on index miss, then updates the index.
 * Returns null if the token is invalid or expired.
 *
 * This is the core helper that all token-based lookups should use.
 */
async function resolveUserByToken(token) {
  if (!token) return null;

  // Fast path: O(1) index lookup
  const cachedFile = tokenIndex.get(token);
  if (cachedFile) {
    const filePath = join(USERS_DIR, cachedFile);
    try {
      const raw = await fs.readFile(filePath, 'utf-8');
      const user = decryptUserFields(JSON.parse(raw));
      if (user.token === token) {
        return { user, filePath, filename: cachedFile };
      }
      // Token changed (e.g., user re-logged in) — stale index entry
      tokenIndex.delete(token);
    } catch {
      // File unreadable or deleted — remove stale entry
      tokenIndex.delete(token);
    }
  }

  // Slow path: full scan (cold start, index miss, stale entry)
  try {
    const files = await fs.readdir(USERS_DIR);
    for (const file of files.filter(f => f.endsWith('.json'))) {
      try {
        const raw = await fs.readFile(join(USERS_DIR, file), 'utf-8');
        const user = decryptUserFields(JSON.parse(raw));
        if (user.token === token) {
          // Populate index for next time
          tokenIndex.set(token, file);
          return { user, filePath: join(USERS_DIR, file), filename: file };
        }
      } catch {
        continue;
      }
    }
  } catch (err) {
    console.error('[Auth] resolveUserByToken scan error:', err.message);
  }

  return null;
}

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
// Load from env, fallback to hardcoded defaults. Mutable at runtime via admin API.
let VIP_EMAILS = (process.env.VIP_EMAILS || 'mhrkim@yahoo.com,danielyungkim@hotmail.com,serenakimkimkim@gmail.com,benjaminkim042@gmail.com,elenakimjune@gmail.com')
  .split(',')
  .map(e => e.toLowerCase().trim())
  .filter(Boolean);
// REVAMP V2: SLM USAGE TRACKING PATCH54 — added slmTokensPerDay/Month for self-hosted SLM compute caps.
// REVAMP V2: FREE TIER QUOTA BUMP PATCH124 — SLM is free for US/English queries, so the tight
// free-tier caps were leaving real users hitting "out of tokens" too early. Since SLM costs us
// nothing to run for English speakers, lift the lid: 10→30 messages/day, 30→200/month,
// SLM tokens 50K→200K/day and 1M→4M/month. Engine quota stays at 3/day (Opus is real $).
// Pro/Elite get a smaller bump in proportion. Free Korean (Haiku) is still bounded by
// messagesPerDay so cost stays within ~$0.30/day per free user worst case.
const PLAN_LIMITS = {
  free:  { enginePerDay: 3,  dailyTokens: 25000,   monthlyTokens: null,      invites: 1,  messagesPerDay: 30, messagesPerMonth: 200, slmTokensPerDay: 200000,  slmTokensPerMonth: 4000000  },
  pro:   { enginePerDay: 10, dailyTokens: 150000,  monthlyTokens: 3000000,   invites: 5,  messagesPerDay: 60, messagesPerMonth: 500, slmTokensPerDay: 500000,  slmTokensPerMonth: 10000000 },
  elite: { enginePerDay: 20, dailyTokens: 300000,  monthlyTokens: 8000000,   invites: 10, messagesPerDay: 150,messagesPerMonth: 2000,slmTokensPerDay: 2000000, slmTokensPerMonth: 50000000 },
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
  ap_coach:             ['pro', 'elite'], // REVAMP V2: AP COACH ADD-ON PATCH67
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

export function getVIPList() {
  return [...VIP_EMAILS];
}

export function addVIP(email) {
  const normalized = email.toLowerCase().trim();
  if (!normalized) return false;
  if (VIP_EMAILS.includes(normalized)) return false;
  VIP_EMAILS.push(normalized);
  return true;
}

export function removeVIP(email) {
  const normalized = email.toLowerCase().trim();
  const idx = VIP_EMAILS.indexOf(normalized);
  if (idx === -1) return false;
  VIP_EMAILS.splice(idx, 1);
  return true;
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
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (parseErr) {
      console.warn(`[Auth] JSON parse failed for ${filePath}: ${parseErr.message}. Attempting repair...`);
      const repaired = tryRepairJSON(raw);
      if (repaired) {
        await atomicWriteJSON(filePath, repaired);
        console.log(`[Auth] Successfully repaired corrupted user file: ${filePath}`);
        parsed = repaired;
      } else {
        console.error(`[Auth] Could not repair corrupted user file ${filePath}`);
        return null;
      }
    }
    // Decrypt sensitive fields if present (no-op for plaintext / when key missing)
    return decryptUserFields(parsed);
  } catch (err) {
    console.error(`[Auth] Unreadable user file ${filePath}: ${err.message}`);
    return null;
  }
}

/**
 * Atomic write: write to a temp file then rename, preventing partial writes.
 */
async function atomicWriteJSON(filePath, data) {
  // If writing into the users directory, encrypt sensitive fields on a deep clone
  // so the in-memory user object handed to the caller stays plaintext.
  let toWrite = data;
  if (filePath.includes(USERS_DIR) && data && typeof data === 'object') {
    const clone = JSON.parse(JSON.stringify(data));
    toWrite = encryptUserFields(clone);
  }
  const tmpPath = filePath + '.tmp';
  await fs.writeFile(tmpPath, JSON.stringify(toWrite, null, 2));
  await fs.rename(tmpPath, filePath);
}

/**
 * Per-user lock for credit operations to prevent race conditions.
 * Uses a simple in-memory Map of promises so concurrent credit ops
 * on the same user are serialized.
 */
const _creditLocks = new Map();
async function withCreditLock(userId, fn) {
  const prev = _creditLocks.get(userId) || Promise.resolve();
  const current = prev.then(fn, fn); // Run fn after previous completes (even on error)
  _creditLocks.set(userId, current);
  try {
    return await current;
  } finally {
    // Clean up if this was the last operation
    if (_creditLocks.get(userId) === current) {
      _creditLocks.delete(userId);
    }
  }
}

function isTokenExpired(tokenCreatedAt) {
  // Missing or invalid timestamps are treated as expired for security.
  // Legacy users will need to re-login, which backfills the timestamp.
  if (!tokenCreatedAt) return true;
  const created = new Date(tokenCreatedAt).getTime();
  if (isNaN(created)) return true;
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
    // REVAMP V2: SLM USAGE TRACKING PATCH54 — SLM token tracking (self-hosted, separate from Anthropic API)
    slmTokensToday: 0,
    slmTokensMonth: 0,
    slmDayReset: new Date().toISOString().slice(0, 10),
    slmMonthReset: new Date().toISOString().slice(0, 7),

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

  // Update token index for O(1) lookups
  const filename = userFile.split('/').pop() || userFile.split('\\').pop();
  tokenIndex.set(token, filename);

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
      user = decryptUserFields(JSON.parse(raw));
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
  const oldToken = user.token;
  const now = new Date().toISOString();
  user.token = generateToken();
  user.tokenCreatedAt = now;
  user.lastLogin = now;
  await atomicWriteJSON(userFile, user);

  // Update token index: remove old token, add new one
  if (oldToken) tokenIndex.delete(oldToken);
  const filename = userFile.split('/').pop() || userFile.split('\\').pop();
  tokenIndex.set(user.token, filename);

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
    user = decryptUserFields(JSON.parse(raw));
  } catch {
    // Don't reveal whether account exists
    return { success: true };
  }

  // Generate 6-digit reset code using cryptographically secure random
  const resetCode = String(100000 + (randomBytes(4).readUInt32BE(0) % 900000));
  user.resetCode = resetCode;
  user.resetCodeExpires = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 min
  user.resetAttempts = 0; // Clear attempt counter on new code

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
    user = decryptUserFields(JSON.parse(raw));
  } catch {
    return { error: 'Invalid reset code.' };
  }

  // Track failed reset attempts — invalidate code after 5 failures
  // This prevents distributed brute-force attacks on the 6-digit code
  if (!user.resetCode || user.resetCode !== code) {
    user.resetAttempts = (user.resetAttempts || 0) + 1;
    if (user.resetAttempts >= 5) {
      // Invalidate the code entirely after 5 wrong guesses
      user.resetCode = null;
      user.resetCodeExpires = null;
      user.resetAttempts = 0;
      await atomicWriteJSON(userFile, user);
      return { error: 'Too many incorrect attempts. Please request a new reset code.' };
    }
    await atomicWriteJSON(userFile, user);
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
  user.resetAttempts = 0;
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
    const resolved = await resolveUserByToken(token);
    if (!resolved) return { error: 'User not found' };

    const { user, filePath } = resolved;
    // Invalidate token by setting it to null
    user.token = null;
    user.tokenCreatedAt = null;
    tokenIndex.delete(token);
    await atomicWriteJSON(filePath, user);
    return { success: true };
  } catch (err) {
    return { error: 'Failed to log out' };
  }
}

/**
 * Verify a token and return the user.
 * Uses token index for O(1) lookup instead of scanning all user files.
 */
export async function verifyToken(token) {
  if (!token) return null;

  try {
    const resolved = await resolveUserByToken(token);
    if (!resolved) return null;

    const { user, filePath } = resolved;

    // Check token expiration
    if (isTokenExpired(user.tokenCreatedAt)) {
      console.log(`[Auth] Token expired for ${user.email} — must re-login`);
      tokenIndex.delete(token);
      return null;
    }

    return sanitizeUser(user);
  } catch (err) {
    console.error('[Auth] verifyToken error:', err.message);
    return null;
  }
}

/**
 * Update user profile.
 */
export async function updateProfile(token, updates) {
  if (!token) return { error: 'Not authenticated' };

  try {
    const resolved = await resolveUserByToken(token);
    if (!resolved) return { error: 'User not found' };

    const { user, filePath } = resolved;

    // Allowlist of updatable fields — prevents mass assignment
    const ALLOWED_FIELDS = ['name', 'userType', 'school', 'interests', 'profile', 'consentGiven'];
    for (const key of Object.keys(updates)) {
      if (!ALLOWED_FIELDS.includes(key)) continue; // Silently ignore disallowed fields

      if (key === 'name' && typeof updates.name === 'string') {
        user.name = updates.name.slice(0, 100);
      } else if (key === 'userType' && typeof updates.userType === 'string') {
        const validTypes = ['student', 'parent', 'counselor', 'other'];
        if (validTypes.includes(updates.userType)) user.userType = updates.userType;
      } else if (key === 'school' && typeof updates.school === 'string') {
        user.school = updates.school.slice(0, 200);
      } else if (key === 'interests' && Array.isArray(updates.interests)) {
        user.interests = updates.interests.filter(i => typeof i === 'string').slice(0, 20).map(i => i.slice(0, 100));
      } else if (key === 'profile' && typeof updates.profile === 'object' && updates.profile !== null) {
        // Only merge safe string/number/boolean/array values into profile
        const safeProfile = {};
        const PROFILE_ARRAY_FIELDS = new Set(['favoriteClasses', 'careerInterests']);
        for (const [pk, pv] of Object.entries(updates.profile)) {
          if (pk === '__proto__' || pk === 'constructor' || pk === 'prototype') continue; // Prototype pollution guard
          if (pk.length > 50) continue;
          if (typeof pv === 'string') {
            safeProfile[pk] = pv.slice(0, 500);
          } else if (typeof pv === 'number' || typeof pv === 'boolean') {
            safeProfile[pk] = pv;
          } else if (Array.isArray(pv) && PROFILE_ARRAY_FIELDS.has(pk)) {
            // Allow known array fields — sanitize each element
            safeProfile[pk] = pv.filter(i => typeof i === 'string').slice(0, 20).map(i => i.slice(0, 100));
          }
        }
        user.profile = { ...user.profile, ...safeProfile };
      } else if (key === 'consentGiven' && typeof updates.consentGiven === 'boolean') {
        user.consentGiven = updates.consentGiven;
        user.consentTimestamp = new Date().toISOString();
      }
    }

    await atomicWriteJSON(filePath, user);
    return { success: true, user: sanitizeUser(user) };
  } catch (err) {
    return { error: 'Failed to update profile' };
  }
}

/**
 * Link a session to a user account.
 */
export async function linkSession(token, sessionId) {
  if (!token) return;

  try {
    const resolved = await resolveUserByToken(token);
    if (!resolved) return;

    const { user, filePath } = resolved;
    if (!user.sessionHistory) user.sessionHistory = [];
    if (!user.sessionHistory.includes(sessionId)) {
      user.sessionHistory.push(sessionId);
      if (user.sessionHistory.length > 50) {
        user.sessionHistory = user.sessionHistory.slice(-50);
      }
    }
    await atomicWriteJSON(filePath, user);
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
    const resolved = await resolveUserByToken(token);
    if (!resolved) return [];
    return resolved.user.sessionHistory || [];
  } catch {
    return [];
  }
}

/**
 * Check engine uses remaining today. Resets daily.
 */
export async function getEngineUsage(token) {
  if (!token) return { usesToday: 0, remaining: 0 };

  const today = new Date().toISOString().slice(0, 10);

  try {
    const resolved = await resolveUserByToken(token);
    if (!resolved) return { usesToday: 0, remaining: 0, max: 3 };

    const { user, filePath } = resolved;
    const effectivePlan = (isAdmin(user.email) || isVIP(user.email)) ? 'elite' : (user.plan || 'free');
    const limits = getPlanLimits(effectivePlan);
    // Reset if new day
    if (user.engineLastReset !== today) {
      user.engineUsesToday = 0;
      user.engineLastReset = today;
      await atomicWriteJSON(filePath, user);
    }
    return {
      usesToday: user.engineUsesToday || 0,
      remaining: Math.max(0, limits.enginePerDay - (user.engineUsesToday || 0)),
      max: limits.enginePerDay
    };
  } catch {
    return { usesToday: 0, remaining: 0, max: 3 };
  }
}

/**
 * Delete a user account.
 */
export async function deleteUser(token) {
  if (!token) return { error: 'Not authenticated' };

  try {
    const resolved = await resolveUserByToken(token);
    if (!resolved) return { error: 'User not found' };

    const { user, filePath } = resolved;
    const sessionIds = Array.isArray(user.sessionHistory) ? [...user.sessionHistory] : [];
    const userId = user.id;
    const userEmail = user.email;

    // 1. Delete the user file
    await fs.unlink(filePath);
    tokenIndex.delete(token);
    if (user.stripeCustomerId) stripeCustomerIndex.delete(user.stripeCustomerId);

    const cascade = { sessionsDeleted: 0, memoryEntriesScrubbed: 0, trainingEntriesScrubbed: 0 };

    // 2. Delete session files belonging to this user
    const SESSIONS_DIR = join(__dirname, '..', 'data', 'sessions');
    for (const sid of sessionIds) {
      // Sanitize sid the same way storage.js does (alphanumeric + hyphen + underscore)
      const safe = String(sid).replace(/[^a-zA-Z0-9_-]/g, '');
      if (!safe) continue;
      try { await fs.unlink(join(SESSIONS_DIR, `${safe}.json`)); cascade.sessionsDeleted++; } catch {}
    }

    // 3. Scrub memory + training entries tied to those sessions
    const MEMORY_DIR = join(__dirname, '..', 'data', 'memory');
    const TRAINING_DIR = join(__dirname, '..', 'data', 'training-capture');
    const sidSet = new Set(sessionIds.map(String));

    async function scrubDir(dir, kind) {
      try {
        const files = await fs.readdir(dir);
        for (const f of files.filter(n => n.endsWith('.jsonl'))) {
          const p2 = join(dir, f);
          const raw = await fs.readFile(p2, 'utf8').catch(() => null);
          if (!raw) continue;
          const lines = raw.split('\n');
          let changed = false;
          for (let i = 0; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            let e; try { e = JSON.parse(lines[i]); } catch { continue; }
            const sid = e.sessionId || e.metadata?.sessionId;
            if (sid && sidSet.has(String(sid))) {
              lines[i] = '';
              changed = true;
              if (kind === 'memory') cascade.memoryEntriesScrubbed++;
              else cascade.trainingEntriesScrubbed++;
            }
          }
          if (changed) {
            const tmp = p2 + '.del.tmp';
            await fs.writeFile(tmp, lines.filter(l => l !== '').join('\n'));
            await fs.rename(tmp, p2);
          }
        }
      } catch {}
    }
    await scrubDir(MEMORY_DIR, 'memory');
    await scrubDir(TRAINING_DIR, 'training');

    // 4. Append tombstone for audit (no PII — just hashed user id + counts)
    try {
      const TOMBSTONE_DIR = join(__dirname, '..', 'data');
      const tombstone = {
        at: new Date().toISOString(),
        userIdHash: (await import('crypto')).createHash('sha256').update(userId).digest('hex').slice(0, 16),
        emailDomain: (userEmail || '').split('@')[1] || null,
        sessionsDeleted: cascade.sessionsDeleted,
        memoryEntriesScrubbed: cascade.memoryEntriesScrubbed,
        trainingEntriesScrubbed: cascade.trainingEntriesScrubbed,
      };
      await fs.appendFile(join(TOMBSTONE_DIR, 'deletion-log.jsonl'), JSON.stringify(tombstone) + '\n');
    } catch {}

    return { success: true, cascade };
  } catch (err) {
    console.error('[Auth] deleteUser cascade error:', err.message);
    return { error: 'Failed to delete user' };
  }
}

/**
 * Update user settings.
 */
export async function updateSettings(token, settings) {
  if (!token) return { error: 'Not authenticated' };
  if (!settings || typeof settings !== 'object') return { error: 'Invalid settings' };

  try {
    const resolved = await resolveUserByToken(token);
    if (!resolved) return { error: 'User not found' };

    const { user, filePath } = resolved;

    if (!user.settings) user.settings = {};
    // Validate and apply only known settings with type checks
    if (typeof settings.displayName === 'string') {
      user.settings.displayName = settings.displayName.slice(0, 100);
    }
    if (typeof settings.memory === 'boolean') {
      user.settings.memory = settings.memory;
    }
    if (typeof settings.helpImprove === 'boolean') {
      user.settings.helpImprove = settings.helpImprove;
    }

    await atomicWriteJSON(filePath, user);
    return { success: true, user: sanitizeUser(user) };
  } catch (err) {
    return { error: 'Failed to update settings' };
  }
}

/**
 * Get user's chat history with session summaries.
 */
export async function getUserChatHistory(token) {
  if (!token) return [];

  try {
    const resolved = await resolveUserByToken(token);
    if (!resolved) return [];

    const user = resolved.user;
    const sessionHistory = [];
    const SESSIONS_DIR = join(__dirname, '..', 'data', 'sessions');

    for (const sessionId of user.sessionHistory || []) {
      try {
        const sessionFile = join(SESSIONS_DIR, `${sessionId}.json`);
        const sessionRaw = await fs.readFile(sessionFile, 'utf-8');
        const session = JSON.parse(sessionRaw);

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

    return sessionHistory.sort((a, b) => new Date(b.lastActive) - new Date(a.lastActive));
  } catch {
    return [];
  }
}

/**
 * Search user's chat history for a query string.
 */
export async function searchUserChats(token, query) {
  if (!token || !query) return [];

  const lowerQuery = query.toLowerCase();

  try {
    const resolved = await resolveUserByToken(token);
    if (!resolved) return [];

    const user = resolved.user;
    const matchingSessions = [];
    const SESSIONS_DIR = join(__dirname, '..', 'data', 'sessions');

    for (const sessionId of user.sessionHistory || []) {
      try {
        const sessionFile = join(SESSIONS_DIR, `${sessionId}.json`);
        const sessionRaw = await fs.readFile(sessionFile, 'utf-8');
        const session = JSON.parse(sessionRaw);

        let matchingSnippet = '';
        if (session.history) {
          for (const msg of session.history) {
            if (msg.content.toLowerCase().includes(lowerQuery)) {
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
  } catch {
    return [];
  }
}

/**
 * Increment engine usage for today. Returns false if limit reached.
 * Uses token index for O(1) lookup.
 */
export async function useEngine(token) {
  if (!token) return { allowed: false, remaining: 0 };

  const today = new Date().toISOString().slice(0, 10);

  try {
    const resolved = await resolveUserByToken(token);
    if (!resolved) return { allowed: false, remaining: 0, max: 3 };

    const { user, filePath } = resolved;
    const effectivePlan = (isAdmin(user.email) || isVIP(user.email)) ? 'elite' : (user.plan || 'free');
    const limits = getPlanLimits(effectivePlan);
    // Reset if new day
    if (user.engineLastReset !== today) {
      user.engineUsesToday = 0;
      user.engineLastReset = today;
    }

    if ((user.engineUsesToday || 0) >= limits.enginePerDay) {
      return { allowed: false, remaining: 0, max: limits.enginePerDay };
    }

    user.engineUsesToday = (user.engineUsesToday || 0) + 1;
    await atomicWriteJSON(filePath, user);

    return {
      allowed: true,
      remaining: limits.enginePerDay - user.engineUsesToday,
      max: limits.enginePerDay
    };
  } catch {
    return { allowed: false, remaining: 0, max: 3 };
  }
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
 * Uses token index for O(1) lookup.
 */
export async function checkTokenUsage(token) {
  if (!token) return { allowed: true, tokensUsed: 0, tokensRemaining: 50000, limit: 50000 };

  const today = new Date().toISOString().slice(0, 10);
  const thisMonth = new Date().toISOString().slice(0, 7);

  try {
    const resolved = await resolveUserByToken(token);
    if (!resolved) return { allowed: true, tokensUsed: 0, tokensRemaining: 50000, limit: 50000 };

    const { user, filePath } = resolved;
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
      await atomicWriteJSON(filePath, user);
    }

    const effectivePlan = (isAdmin(user.email) || isVIP(user.email)) ? 'elite' : (user.plan || 'free');
    const dailyLimit = getDailyTokenLimit(effectivePlan);
    const monthlyLimit = getMonthlyTokenLimit(effectivePlan);
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
  } catch {
    return { allowed: true, tokensUsed: 0, tokensRemaining: 50000, limit: 50000 };
  }
}

/**
 * Record token usage for today.
 * Uses token index for O(1) lookup.
 */
// REVAMP V2: SLM USAGE TRACKING PATCH54 — SLM token usage tracking + cap enforcement.
// Returns { allowed, dayRemaining, dayLimit, monthRemaining, monthLimit }.
// If !allowed, caller should fall back to non-SLM path.
export async function useSLMTokens(token, tokensUsed) {
  if (!token || !tokensUsed) return { allowed: true };
  try {
    const resolved = await resolveUserByToken(token);
    if (!resolved) return { allowed: true };
    const { user, filePath } = resolved;
    const today = new Date().toISOString().slice(0, 10);
    const thisMonth = new Date().toISOString().slice(0, 7);
    if (user.slmDayReset !== today) {
      user.slmTokensToday = 0;
      user.slmDayReset = today;
    }
    if (user.slmMonthReset !== thisMonth) {
      user.slmTokensMonth = 0;
      user.slmMonthReset = thisMonth;
    }
    const effectivePlan = (isAdmin(user.email) || isVIP(user.email)) ? 'elite' : (user.plan || 'free');
    const limits = getPlanLimits(effectivePlan);
    const dayLimit = limits.slmTokensPerDay || Infinity;
    const monthLimit = limits.slmTokensPerMonth || Infinity;
    const dayUsed = user.slmTokensToday || 0;
    const monthUsed = user.slmTokensMonth || 0;
    // Pre-emptive check: would this call put us over?
    if (dayUsed + tokensUsed > dayLimit) {
      return {
        allowed: false,
        reason: 'daily_slm_cap',
        dayUsed, dayLimit, dayRemaining: Math.max(0, dayLimit - dayUsed),
        monthUsed, monthLimit, monthRemaining: Math.max(0, monthLimit - monthUsed),
        plan: effectivePlan,
      };
    }
    if (monthUsed + tokensUsed > monthLimit) {
      return {
        allowed: false,
        reason: 'monthly_slm_cap',
        dayUsed, dayLimit, dayRemaining: Math.max(0, dayLimit - dayUsed),
        monthUsed, monthLimit, monthRemaining: Math.max(0, monthLimit - monthUsed),
        plan: effectivePlan,
      };
    }
    user.slmTokensToday = dayUsed + tokensUsed;
    user.slmTokensMonth = monthUsed + tokensUsed;
    await atomicWriteJSON(filePath, user);
    return {
      allowed: true,
      dayUsed: user.slmTokensToday, dayLimit, dayRemaining: Math.max(0, dayLimit - user.slmTokensToday),
      monthUsed: user.slmTokensMonth, monthLimit, monthRemaining: Math.max(0, monthLimit - user.slmTokensMonth),
      plan: effectivePlan,
    };
  } catch (err) {
    console.warn('[useSLMTokens] error (non-fatal):', err.message);
    return { allowed: true };  // fail-open so SLM keeps working
  }
}

export async function getSLMUsage(token) {
  if (!token) return null;
  try {
    const resolved = await resolveUserByToken(token);
    if (!resolved) return null;
    const { user } = resolved;
    const today = new Date().toISOString().slice(0, 10);
    const thisMonth = new Date().toISOString().slice(0, 7);
    const effectivePlan = (isAdmin(user.email) || isVIP(user.email)) ? 'elite' : (user.plan || 'free');
    const limits = getPlanLimits(effectivePlan);
    return {
      plan: effectivePlan,
      slmTokensToday: user.slmDayReset === today ? (user.slmTokensToday || 0) : 0,
      slmTokensMonth: user.slmMonthReset === thisMonth ? (user.slmTokensMonth || 0) : 0,
      dayLimit: limits.slmTokensPerDay || null,
      monthLimit: limits.slmTokensPerMonth || null,
    };
  } catch { return null; }
}

export async function recordTokenUsage(token, tokensUsed) {
  if (!token || !tokensUsed) return;

  const today = new Date().toISOString().slice(0, 10);
  const thisMonth = new Date().toISOString().slice(0, 7);

  try {
    const resolved = await resolveUserByToken(token);
    if (!resolved) return;

    const { user, filePath } = resolved;
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
    await atomicWriteJSON(filePath, user);
  } catch {
    // Non-critical
  }
}

// ─── Message Usage Tracking ─────────────────────────────────────────
// Tracks messages per day and per month, separate from token tracking.
// All routing modes count (SLM, Haiku Advisor, Welcome Desk, Engine).

/**
 * Check daily + monthly message usage. Returns { allowed, daily, monthly, upgradeReason }.
 * Uses token index for O(1) lookup.
 */
export async function checkMessageUsage(token) {
  if (!token) return { allowed: true, daily: { used: 0, limit: null, remaining: null }, monthly: { used: 0, limit: null, remaining: null } };

  const today = new Date().toISOString().slice(0, 10);
  const thisMonth = new Date().toISOString().slice(0, 7);

  try {
    const resolved = await resolveUserByToken(token);
    if (!resolved) return { allowed: true, daily: { used: 0, limit: null, remaining: null }, monthly: { used: 0, limit: null, remaining: null } };

    const { user, filePath } = resolved;
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
      await atomicWriteJSON(filePath, user);
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
  } catch {
    return { allowed: true, daily: { used: 0, limit: null, remaining: null }, monthly: { used: 0, limit: null, remaining: null } };
  }
}

/**
 * Record one message for today + this month.
 * Uses token index for O(1) lookup.
 */
export async function recordMessageUsage(token, count = 1) {
  if (!token) return;
  count = Math.max(1, Math.min(10, Math.floor(count))); // Clamp 1-10

  const today = new Date().toISOString().slice(0, 10);
  const thisMonth = new Date().toISOString().slice(0, 7);

  try {
    const resolved = await resolveUserByToken(token);
    if (!resolved) return;

    const { user, filePath } = resolved;
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
    user.messagesUsedToday = (user.messagesUsedToday || 0) + count;
    user.messagesUsedMonth = (user.messagesUsedMonth || 0) + count;
    await atomicWriteJSON(filePath, user);
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
    const resolved = await resolveUserByToken(token);
    if (!resolved) return { error: 'User not found' };

    const { user, filePath } = resolved;
    if (fields.plan !== undefined) user.plan = fields.plan;
    if (fields.stripeCustomerId !== undefined) {
      // Maintain Stripe customer index
      const oldId = user.stripeCustomerId;
      if (oldId && oldId !== fields.stripeCustomerId) stripeCustomerIndex.delete(oldId);
      user.stripeCustomerId = fields.stripeCustomerId;
      if (fields.stripeCustomerId) {
        stripeCustomerIndex.set(fields.stripeCustomerId, resolved.filename);
      }
    }
    if (fields.stripeSubscriptionId !== undefined) user.stripeSubscriptionId = fields.stripeSubscriptionId;
    if (fields.planExpiresAt !== undefined) user.planExpiresAt = fields.planExpiresAt;
    // PATCH135: persist previewedExam so AP study guide free-tier preview slot
    // actually sticks. Previously updateUserPlan silently ignored this field,
    // which meant POST /guide/preview-select returned 200 but didn't save the
    // exam choice — re-fetch GET /guide/:exam still returned 402 → frontend
    // showed "Could not download" alert. That looked like "OK button does nothing."
    if (fields.previewedExam !== undefined) user.previewedExam = fields.previewedExam;
    if (fields.coachTrialExpiresAt !== undefined) user.coachTrialExpiresAt = fields.coachTrialExpiresAt;

    await atomicWriteJSON(filePath, user);
    return { success: true, user: sanitizeUser(user) };
  } catch (err) {
    return { error: 'Failed to update plan' };
  }
}

/**
 * Add essay review credits to a user account.
 */
export async function addEssayCredits(stripeCustomerId, pack, quantity, stripePaymentId) {
  // Use Stripe customer index for O(1) lookup instead of O(n) scan
  const user = await findUserByStripeCustomerId(stripeCustomerId);
  if (!user) return { error: 'User not found' };

  try {
    // Re-resolve filename from index for write
    const filename = stripeCustomerIndex.get(stripeCustomerId);
    if (!filename) return { error: 'User file not found' };
    const filePath = join(USERS_DIR, filename);

    // ER-02: Use per-user credit lock to prevent race condition with concurrent
    // useEssayCredit/refundEssayCredit calls. Without the lock, a Stripe webhook
    // adding credits while a review deducts could lose one write.
    const lockKey = user.id || user.email;
    return await withCreditLock(lockKey, async () => {
      // Re-read inside lock for freshest data
      const freshData = JSON.parse(await fs.readFile(filePath, 'utf8'));
      freshData.essayReviewsRemaining = (freshData.essayReviewsRemaining || 0) + quantity;
      if (!freshData.essayReviewsPurchased) freshData.essayReviewsPurchased = [];
      freshData.essayReviewsPurchased.push({
        pack,
        quantity,
        purchasedAt: new Date().toISOString(),
        stripePaymentId
      });
      await atomicWriteJSON(filePath, freshData);
      return { success: true, remaining: freshData.essayReviewsRemaining };
    });
  } catch (err) {
    return { error: 'Failed to add essay credits' };
  }
}

/**
 * Use one essay review credit. Returns false if no credits remaining.
 * Uses token index for O(1) lookup.
 */
export async function useEssayCredit(token) {
  if (!token) return { allowed: false, remaining: 0 };

  try {
    const resolved = await resolveUserByToken(token);
    if (!resolved) return { allowed: false, remaining: 0 };

    const { user, filePath } = resolved;

    // Admins and VIPs get unlimited credits — never deduct
    if (isAdmin(user.email) || isVIP(user.email)) {
      return { allowed: true, remaining: 999 };
    }

    // Use per-user lock to prevent race condition where concurrent requests
    // both read the same credit balance and both deduct, going negative.
    return await withCreditLock(user.id || user.email, async () => {
      // Re-read the file inside the lock to get the freshest value
      const freshData = JSON.parse(await fs.readFile(filePath, 'utf8'));
      const remaining = freshData.essayReviewsRemaining || 0;
      if (remaining <= 0) {
        return { allowed: false, remaining: 0 };
      }
      freshData.essayReviewsRemaining = remaining - 1;
      await atomicWriteJSON(filePath, freshData);
      return { allowed: true, remaining: freshData.essayReviewsRemaining };
    });
  } catch {
    return { allowed: false, remaining: 0 };
  }
}

/**
 * Refund one essay review credit. Called when a review fails or returns invalid data.
 * Uses token index for O(1) lookup.
 */
export async function refundEssayCredit(token) {
  if (!token) return { success: false, remaining: 0 };

  try {
    const resolved = await resolveUserByToken(token);
    if (!resolved) return { success: false, remaining: 0 };

    const { user, filePath } = resolved;
    // Admins and VIPs don't need refunds (they have unlimited)
    if (isAdmin(user.email) || isVIP(user.email)) {
      return { success: true, remaining: 999 };
    }

    // Use per-user lock to prevent race condition with concurrent credit operations
    return await withCreditLock(user.id || user.email, async () => {
      const freshData = JSON.parse(await fs.readFile(filePath, 'utf8'));
      freshData.essayReviewsRemaining = (freshData.essayReviewsRemaining || 0) + 1;
      await atomicWriteJSON(filePath, freshData);
      return { success: true, remaining: freshData.essayReviewsRemaining };
    });
  } catch (err) {
    return { success: false, remaining: 0 };
  }
}

/**
 * Update user's admissions profile.
 */
export async function updateAdmissionsProfile(token, profile) {
  if (!token) return { error: 'Not authenticated' };

  try {
    const resolved = await resolveUserByToken(token);
    if (!resolved) return { error: 'User not found' };

    const { user, filePath } = resolved;
    if (!user.admissionsProfile) {
      user.admissionsProfile = { targetSchools: [], intendedMajors: [], reminderPreferences: {} };
    }
    // Filter out prototype pollution keys before merging
    const safeProfileKeys = Object.keys(profile).filter(k => k !== '__proto__' && k !== 'constructor' && k !== 'prototype');
    const safeAdmProfile = {};
    for (const k of safeProfileKeys) {
      safeAdmProfile[k] = profile[k];
    }
    user.admissionsProfile = { ...user.admissionsProfile, ...safeAdmProfile };
    await atomicWriteJSON(filePath, user);
    return { success: true, admissionsProfile: user.admissionsProfile };
  } catch (err) {
    return { error: 'Failed to update admissions profile' };
  }
}

/**
 * Find a user by their Stripe Customer ID. Returns the raw user (with token).
 */
export async function findUserByStripeCustomerId(customerId) {
  if (!customerId) return null;

  // Fast path: O(1) index lookup
  const cachedFile = stripeCustomerIndex.get(customerId);
  if (cachedFile) {
    try {
      const user = await safeReadUserFile(join(USERS_DIR, cachedFile));
      if (user && user.stripeCustomerId === customerId) {
        return user;
      }
      // Stale entry
      stripeCustomerIndex.delete(customerId);
    } catch {
      stripeCustomerIndex.delete(customerId);
    }
  }

  // Slow path: full scan (cold start or stale index)
  try {
    const files = await fs.readdir(USERS_DIR);
    for (const file of files.filter(f => f.endsWith('.json'))) {
      const user = await safeReadUserFile(join(USERS_DIR, file));
      if (!user) continue;
      if (user.stripeCustomerId === customerId) {
        stripeCustomerIndex.set(customerId, file);
        return user;
      }
    }
  } catch {
    return null;
  }

  return null;
}

/**
 * Find a full user record by token (unsanitized, for internal use).
 * Uses token index for O(1) lookup.
 */
export async function findUserByToken(token) {
  if (!token) return null;
  const resolved = await resolveUserByToken(token);
  return resolved ? resolved.user : null;
}

// Remove sensitive fields before sending to client
// Admin-only: set user's plan for testing tier behavior
export async function setUserPlan(token, newPlan) {
  if (!token) return { error: 'No token' };
  try {
    const resolved = await resolveUserByToken(token);
    if (!resolved) return { error: 'User not found' };

    const { user, filePath } = resolved;
    if (!isAdmin(user.email)) return { error: 'Admin only' };
    user.plan = newPlan;
    await atomicWriteJSON(filePath, user);
    return { success: true, user: sanitizeUser(user) };
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
      apCoach: canAccess(plan, 'ap_coach'),
    }
  };
}

// ─── REVAMP V2: AP COACH ADD-ON PATCH67 — AP Coach credit functions (mirror of essay credits) ───
export async function addApCredits(stripeCustomerId, quantity, pack, stripePaymentId) {
  if (!stripeCustomerId || !quantity || quantity <= 0) {
    return { error: 'Invalid parameters' };
  }
  try {
    const filename = stripeCustomerIndex.get(stripeCustomerId);
    if (!filename) return { error: 'User file not found' };
    const filePath = join(USERS_DIR, filename);
    const user = JSON.parse(await fs.readFile(filePath, 'utf8'));
    const lockKey = user.id || user.email;
    return await withCreditLock(lockKey, async () => {
      const freshData = JSON.parse(await fs.readFile(filePath, 'utf8'));
      freshData.apCoachRemaining = (freshData.apCoachRemaining || 0) + quantity;
      if (!freshData.apCoachPurchased) freshData.apCoachPurchased = [];
      freshData.apCoachPurchased.push({
        pack,
        quantity,
        purchasedAt: new Date().toISOString(),
        stripePaymentId,
      });
      await atomicWriteJSON(filePath, freshData);
      return { success: true, remaining: freshData.apCoachRemaining };
    });
  } catch (err) {
    return { error: 'Failed to add AP coach credits' };
  }
}

export async function useApCredit(token) {
  if (!token) return { allowed: false, remaining: 0 };
  try {
    const resolved = await resolveUserByToken(token);
    if (!resolved) return { allowed: false, remaining: 0 };
    const { user, filePath } = resolved;
    if (isAdmin(user.email) || isVIP(user.email)) {
      return { allowed: true, remaining: 999 };
    }
    return await withCreditLock(user.id || user.email, async () => {
      const freshData = JSON.parse(await fs.readFile(filePath, 'utf8'));
      const remaining = freshData.apCoachRemaining || 0;
      if (remaining <= 0) return { allowed: false, remaining: 0 };
      freshData.apCoachRemaining = remaining - 1;
      await atomicWriteJSON(filePath, freshData);
      return { allowed: true, remaining: freshData.apCoachRemaining };
    });
  } catch {
    return { allowed: false, remaining: 0 };
  }
}

export async function refundApCredit(token) {
  if (!token) return { success: false, remaining: 0 };
  try {
    const resolved = await resolveUserByToken(token);
    if (!resolved) return { success: false, remaining: 0 };
    const { user, filePath } = resolved;
    if (isAdmin(user.email) || isVIP(user.email)) {
      return { success: true, remaining: 999 };
    }
    return await withCreditLock(user.id || user.email, async () => {
      const freshData = JSON.parse(await fs.readFile(filePath, 'utf8'));
      freshData.apCoachRemaining = (freshData.apCoachRemaining || 0) + 1;
      await atomicWriteJSON(filePath, freshData);
      return { success: true, remaining: freshData.apCoachRemaining };
    });
  } catch (err) {
    return { success: false, remaining: 0 };
  }
}


// ─── REVAMP V2: AP COACH PRICING REWORK PATCH80 auth.js — Tier-aware AP Coach usage check ───
// Replaces the credit-pack model. Returns { allowed, tier, remainingThisMonth, monthlyCap, trialUsed, unlimited }.
// Free: 1 lifetime trial (apCoachLifetimeUsed boolean)
// Coach: 5/month (apCoachMonthlyUsage = { month: 'YYYY-MM', count: N })
// Consultant / Admin / VIP: unlimited
export async function checkApCoachUsage(token) {
  if (!token) return { allowed: false, tier: 'unauth', remainingThisMonth: 0, monthlyCap: 0, trialUsed: false, unlimited: false };
  try {
    const resolved = await resolveUserByToken(token);
    if (!resolved) return { allowed: false, tier: 'unauth', remainingThisMonth: 0, monthlyCap: 0, trialUsed: false, unlimited: false };
    const { user } = resolved;
    const plan = String(user.plan || 'free').toLowerCase();
    const adminOrVIP = isAdmin(user.email) || isVIP(user.email);
    if (adminOrVIP || plan === 'consultant') {
      return { allowed: true, tier: adminOrVIP ? 'admin' : 'consultant', remainingThisMonth: 999, monthlyCap: 999, trialUsed: false, unlimited: true };
    }
    if (plan === 'coach') {
      const now = new Date();
      const currentMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
      const usage = user.apCoachMonthlyUsage || { month: currentMonth, count: 0 };
      const count = (usage.month === currentMonth) ? (usage.count || 0) : 0;
      const cap = 5;
      return { allowed: count < cap, tier: 'coach', remainingThisMonth: Math.max(0, cap - count), monthlyCap: cap, trialUsed: false, unlimited: false };
    }
    // Free tier
    const trialUsed = !!user.apCoachLifetimeUsed;
    return { allowed: !trialUsed, tier: 'free', remainingThisMonth: trialUsed ? 0 : 1, monthlyCap: 1, trialUsed, unlimited: false };
  } catch (err) {
    return { allowed: false, tier: 'error', remainingThisMonth: 0, monthlyCap: 0, trialUsed: false, unlimited: false };
  }
}

// Record an AP Coach usage event. Increments monthly count for Coach tier OR sets
// lifetime trial flag for Free. No-op for unlimited tiers.
export async function recordApCoachUsage(token) {
  if (!token) return { success: false };
  try {
    const resolved = await resolveUserByToken(token);
    if (!resolved) return { success: false };
    const { user, filePath } = resolved;
    const plan = String(user.plan || 'free').toLowerCase();
    if (isAdmin(user.email) || isVIP(user.email) || plan === 'consultant') {
      return { success: true, recorded: false, tier: plan }; // unlimited tiers don't get tracked
    }
    return await withCreditLock(user.id || user.email, async () => {
      const fresh = JSON.parse(await fs.readFile(filePath, 'utf8'));
      if (plan === 'coach') {
        const now = new Date();
        const currentMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
        const usage = fresh.apCoachMonthlyUsage || { month: currentMonth, count: 0 };
        if (usage.month !== currentMonth) {
          fresh.apCoachMonthlyUsage = { month: currentMonth, count: 1 };
        } else {
          fresh.apCoachMonthlyUsage = { month: currentMonth, count: (usage.count || 0) + 1 };
        }
      } else {
        fresh.apCoachLifetimeUsed = true;
      }
      await atomicWriteJSON(filePath, fresh);
      return { success: true, recorded: true, tier: plan };
    });
  } catch (err) {
    return { success: false, error: err.message };
  }
}


// ─── REVAMP V2: AP COACH FULL MODULE PATCH81 auth — Family Consultant whitelist + AP Coach quotas + invite code ───
const FAMILY_CONSULTANT_EMAILS = [
  'mhrkim@yahoo.com',
  'serenakimkimkim@gmail.com',
  'benjaminkim042@gmail.com',
  'elenakimjune@gmail.com',
];

export function isFamilyConsultant(email) {
  if (!email) return false;
  return FAMILY_CONSULTANT_EMAILS.includes(String(email).toLowerCase());
}

// Effective plan resolution — overrides stored plan for family Consultants AND
// for users whose coach trial (granted by FRIENDS-COACH-1MONTH invite) is still active.
export function getEffectivePlan(user) {
  if (!user) return 'free';
  const email = user.email ? String(user.email).toLowerCase() : '';
  if (isAdmin(email) || isVIP(email)) return 'admin';
  if (isFamilyConsultant(email)) return 'consultant';
  // Coach trial check
  if (user.coachTrialExpiresAt) {
    const exp = new Date(user.coachTrialExpiresAt).getTime();
    if (exp > Date.now()) return 'coach';
  }
  return String(user.plan || 'free').toLowerCase();
}

// Unified AP Coach usage check returning quotas across all 3 modes (Chat / FRQ / Tutor)
export async function getApCoachUsageDetails(token) {
  if (!token) return { tier: 'unauth' };
  try {
    const resolved = await resolveUserByToken(token);
    if (!resolved) return { tier: 'unauth' };
    const { user } = resolved;
    const tier = getEffectivePlan(user);
    const now = new Date();
    const currentMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');

    if (tier === 'admin' || tier === 'consultant') {
      return { tier, unlimited: true, chatRemaining: 999, frqRemaining: 999, tutorRemaining: 999 };
    }
    if (tier === 'coach') {
      const frqUsage = (user.apCoachMonthlyUsage && user.apCoachMonthlyUsage.month === currentMonth) ? (user.apCoachMonthlyUsage.count || 0) : 0;
      const tutorUsage = (user.apTutorMonthlyUsage && user.apTutorMonthlyUsage.month === currentMonth) ? (user.apTutorMonthlyUsage.count || 0) : 0;
      return { tier, unlimited: false,
        chatRemaining: 999, // unlimited chat for paid tiers
        frqRemaining: Math.max(0, 5 - frqUsage), frqCap: 5,
        tutorRemaining: Math.max(0, 10 - tutorUsage), tutorCap: 10 };
    }
    // Free tier
    const chatUsage = (user.apChatMonthlyUsage && user.apChatMonthlyUsage.month === currentMonth) ? (user.apChatMonthlyUsage.count || 0) : 0;
    const trialUsed = !!user.apCoachLifetimeUsed;
    return { tier: 'free', unlimited: false,
      chatRemaining: Math.max(0, 5 - chatUsage), chatCap: 5,
      frqTrialAvailable: !trialUsed,
      frqRemaining: trialUsed ? 0 : 1,
      tutorRemaining: 0, tutorCap: 0 }; // Free tier has zero Tutor access
  } catch (err) {
    return { tier: 'error' };
  }
}

export async function recordApChatUsage(token) {
  if (!token) return { success: false };
  try {
    const resolved = await resolveUserByToken(token);
    if (!resolved) return { success: false };
    const { user, filePath } = resolved;
    const tier = getEffectivePlan(user);
    if (tier === 'admin' || tier === 'consultant' || tier === 'coach') return { success: true, recorded: false };
    return await withCreditLock(user.id || user.email, async () => {
      const fresh = JSON.parse(await fs.readFile(filePath, 'utf8'));
      const now = new Date();
      const currentMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
      const usage = fresh.apChatMonthlyUsage || { month: currentMonth, count: 0 };
      fresh.apChatMonthlyUsage = (usage.month === currentMonth) ? { month: currentMonth, count: (usage.count || 0) + 1 } : { month: currentMonth, count: 1 };
      await atomicWriteJSON(filePath, fresh);
      return { success: true, recorded: true };
    });
  } catch { return { success: false }; }
}

export async function recordApTutorUsage(token) {
  if (!token) return { success: false };
  try {
    const resolved = await resolveUserByToken(token);
    if (!resolved) return { success: false };
    const { user, filePath } = resolved;
    const tier = getEffectivePlan(user);
    if (tier === 'admin' || tier === 'consultant') return { success: true, recorded: false };
    if (tier === 'free') return { success: false, error: 'Tutor not available on free tier' };
    return await withCreditLock(user.id || user.email, async () => {
      const fresh = JSON.parse(await fs.readFile(filePath, 'utf8'));
      const now = new Date();
      const currentMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
      const usage = fresh.apTutorMonthlyUsage || { month: currentMonth, count: 0 };
      fresh.apTutorMonthlyUsage = (usage.month === currentMonth) ? { month: currentMonth, count: (usage.count || 0) + 1 } : { month: currentMonth, count: 1 };
      await atomicWriteJSON(filePath, fresh);
      return { success: true, recorded: true };
    });
  } catch { return { success: false }; }
}

// AP profile (game plan onboarding)
export async function getApProfile(token) {
  if (!token) return null;
  try {
    const resolved = await resolveUserByToken(token);
    if (!resolved) return null;
    return resolved.user.apProfile || null;
  } catch { return null; }
}

export async function setApProfile(token, profile) {
  if (!token) return { success: false };
  try {
    const resolved = await resolveUserByToken(token);
    if (!resolved) return { success: false };
    const { user, filePath } = resolved;
    return await withCreditLock(user.id || user.email, async () => {
      const fresh = JSON.parse(await fs.readFile(filePath, 'utf8'));
      fresh.apProfile = {
        exams: Array.isArray(profile.exams) ? profile.exams.slice(0, 27) : [],
        defaultTargetScore: parseInt(profile.defaultTargetScore, 10) || 4,
        hoursPerWeek: parseInt(profile.hoursPerWeek, 10) || 8,
        targetScores: profile.targetScores || {},
        updatedAt: new Date().toISOString(),
      };
      await atomicWriteJSON(filePath, fresh);
      return { success: true, profile: fresh.apProfile };
    });
  } catch (err) { return { success: false, error: err.message }; }
}

// Reusable invite code: FRIENDS-COACH-1MONTH grants 30-day Coach trial
export async function redeemFriendsCoachCode(token, code) {
  if (!token || !code) return { success: false, error: 'token + code required' };
  if (String(code).toUpperCase().trim() !== 'FRIENDS-COACH-1MONTH') return { success: false, error: 'Invalid code' };
  try {
    const resolved = await resolveUserByToken(token);
    if (!resolved) return { success: false, error: 'Not authenticated' };
    const { user, filePath } = resolved;
    return await withCreditLock(user.id || user.email, async () => {
      const fresh = JSON.parse(await fs.readFile(filePath, 'utf8'));
      const now = Date.now();
      // Extend trial if already active; otherwise set 30 days from now
      const existing = fresh.coachTrialExpiresAt ? new Date(fresh.coachTrialExpiresAt).getTime() : 0;
      const base = existing > now ? existing : now;
      fresh.coachTrialExpiresAt = new Date(base + 30 * 24 * 60 * 60 * 1000).toISOString();
      fresh.coachTrialSource = 'FRIENDS-COACH-1MONTH';
      await atomicWriteJSON(filePath, fresh);
      return { success: true, expiresAt: fresh.coachTrialExpiresAt };
    });
  } catch (err) { return { success: false, error: err.message }; }
}



// PATCH110: Monthly study-guide download limits.
//   Coach tier: 2 downloads / calendar month.
//   Consultant / admin / VIP / Elite / Pro (legacy): unlimited.
//   Free tier: not gated here — preview path in routes/ap-coach.js handles it.
export async function checkStudyGuideDownload(token) {
  if (!token) return { allowed: false, reason: 'Not authenticated' };
  try {
    const resolved = await resolveUserByToken(token);
    if (!resolved) return { allowed: false, reason: 'User not found' };
    const { user } = resolved;
    const planRaw = String(user.plan || 'free').toLowerCase();
    const isUnlimited = (
      planRaw === 'consultant' || planRaw === 'elite' || planRaw === 'pro' || planRaw === 'admin'
      || isAdmin(user.email) || isVIP(user.email)
    );
    if (isUnlimited) return { allowed: true, unlimited: true, count: null, cap: null };

    if (planRaw === 'coach') {
      const now = new Date();
      const currentMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
      const usage = user.studyGuideMonthlyDLs || { month: currentMonth, count: 0 };
      const count = (usage.month === currentMonth) ? (usage.count || 0) : 0;
      const cap = 2;
      return {
        allowed: count < cap,
        unlimited: false,
        count,
        cap,
        reason: count >= cap ? 'Monthly Coach study-guide cap reached (2/mo). Upgrade to Consultant for unlimited downloads, or wait until next month.' : null,
      };
    }

    return { allowed: false, reason: 'Full study-guide downloads require a Coach or Consultant subscription.' };
  } catch (err) {
    return { allowed: false, reason: 'Internal error' };
  }
}

export async function recordStudyGuideDownload(token) {
  if (!token) return;
  try {
    const resolved = await resolveUserByToken(token);
    if (!resolved) return;
    const { user, filePath } = resolved;
    const planRaw = String(user.plan || 'free').toLowerCase();
    if (planRaw !== 'coach') return; // only coach has a counter
    await withCreditLock(user.id || user.email, async () => {
      const fresh = JSON.parse(await (await import('fs')).promises.readFile(filePath, 'utf8'));
      const now = new Date();
      const currentMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
      const usage = fresh.studyGuideMonthlyDLs || { month: currentMonth, count: 0 };
      if (usage.month !== currentMonth) {
        fresh.studyGuideMonthlyDLs = { month: currentMonth, count: 1 };
      } else {
        fresh.studyGuideMonthlyDLs = { month: currentMonth, count: (usage.count || 0) + 1 };
      }
      await atomicWriteJSON(filePath, fresh);
    });
  } catch (err) {
    // non-fatal — never block download on tracking error
  }
}
// END PATCH110
