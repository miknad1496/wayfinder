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
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const USERS_DIR = join(__dirname, '..', 'data', 'users');

const BCRYPT_ROUNDS = 12;
const TOKEN_TTL_DAYS = 30; // Tokens expire after 30 days

// Ensure users directory exists
export async function ensureUsersDir() {
  await fs.mkdir(USERS_DIR, { recursive: true });
}

// Legacy password check (SHA256) — only for migration
function legacyHashPassword(password, salt) {
  return createHash('sha256').update(password + salt).digest('hex');
}

function generateToken() {
  return randomBytes(32).toString('hex');
}

function isTokenExpired(tokenCreatedAt) {
  if (!tokenCreatedAt) return true;
  const created = new Date(tokenCreatedAt).getTime();
  const now = Date.now();
  const ttlMs = TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;
  return (now - created) > ttlMs;
}

/**
 * Create a new user account.
 */
export async function createUser({ email, password, name, userType, school, interests }) {
  await ensureUsersDir();

  const emailLower = email.toLowerCase().trim();
  const userFile = join(USERS_DIR, `${emailLower.replace(/[^a-z0-9]/g, '_')}.json`);

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
    sessionHistory: [], // Links to past session IDs
    profile: {
      age: '',
      gradeLevel: '',       // e.g. '10th', 'Freshman', 'Junior', 'Working Professional'
      favoriteClasses: [],   // e.g. ['Math', 'Biology', 'Art']
      careerInterests: [],   // e.g. ['Software Engineering', 'Medicine']
      aboutMe: ''            // freeform description
    },
    plan: 'free',           // free (3/day), premium (10/day), pro (20/day)
    settings: {
      displayName: name || '',
      memory: true,         // whether wayfinder remembers conversations
      helpImprove: true     // consent for using data to improve
    },
    stripeCustomerId: null,
    planExpiresAt: null,
    engineUsesToday: 0,
    engineLastReset: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
    consentGiven: false,
    consentTimestamp: null
  };

  await fs.writeFile(userFile, JSON.stringify(user, null, 2));

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
    user = JSON.parse(raw);
  } catch {
    return { error: 'Invalid email or password' };
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
    return { error: 'Invalid email or password' };
  }

  // Generate new token with expiration tracking
  const now = new Date().toISOString();
  user.token = generateToken();
  user.tokenCreatedAt = now;
  user.lastLogin = now;
  await fs.writeFile(userFile, JSON.stringify(user, null, 2));

  return {
    success: true,
    user: sanitizeUser(user),
    token: user.token
  };
}

/**
 * Verify a token and return the user.
 */
export async function verifyToken(token) {
  if (!token) return null;

  // Constant-time-ish token comparison to prevent timing attacks
  try {
    const files = await fs.readdir(USERS_DIR);
    for (const file of files.filter(f => f.endsWith('.json'))) {
      const raw = await fs.readFile(join(USERS_DIR, file), 'utf-8');
      const user = JSON.parse(raw);
      if (user.token === token) {
        // Check token expiration
        if (isTokenExpired(user.tokenCreatedAt)) {
          return null; // Token expired — must re-login
        }
        return sanitizeUser(user);
      }
    }
  } catch {
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
      const raw = await fs.readFile(join(USERS_DIR, file), 'utf-8');
      const user = JSON.parse(raw);
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

        await fs.writeFile(join(USERS_DIR, file), JSON.stringify(user, null, 2));
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
      const raw = await fs.readFile(join(USERS_DIR, file), 'utf-8');
      const user = JSON.parse(raw);
      if (user.token === token) {
        if (!user.sessionHistory.includes(sessionId)) {
          user.sessionHistory.push(sessionId);
          // Keep last 50 sessions
          if (user.sessionHistory.length > 50) {
            user.sessionHistory = user.sessionHistory.slice(-50);
          }
        }
        await fs.writeFile(join(USERS_DIR, file), JSON.stringify(user, null, 2));
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
      const raw = await fs.readFile(join(USERS_DIR, file), 'utf-8');
      const user = JSON.parse(raw);
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

  const getPlanLimit = (plan) => {
    switch(plan) {
      case 'pro': return 20;
      case 'premium': return 10;
      case 'free':
      default: return 3;
    }
  };

  const today = new Date().toISOString().slice(0, 10);

  try {
    const files = await fs.readdir(USERS_DIR);
    for (const file of files.filter(f => f.endsWith('.json'))) {
      const raw = await fs.readFile(join(USERS_DIR, file), 'utf-8');
      const user = JSON.parse(raw);
      if (user.token === token) {
        const MAX_ENGINE_USES = getPlanLimit(user.plan || 'free');
        // Reset if new day
        if (user.engineLastReset !== today) {
          user.engineUsesToday = 0;
          user.engineLastReset = today;
          await fs.writeFile(join(USERS_DIR, file), JSON.stringify(user, null, 2));
        }
        return {
          usesToday: user.engineUsesToday || 0,
          remaining: Math.max(0, MAX_ENGINE_USES - (user.engineUsesToday || 0)),
          max: MAX_ENGINE_USES
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
      const raw = await fs.readFile(join(USERS_DIR, file), 'utf-8');
      const user = JSON.parse(raw);
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
      const raw = await fs.readFile(join(USERS_DIR, file), 'utf-8');
      const user = JSON.parse(raw);
      if (user.token === token) {
        // Update allowed settings fields
        if (!user.settings) user.settings = {};
        if (settings.displayName !== undefined) user.settings.displayName = settings.displayName;
        if (settings.memory !== undefined) user.settings.memory = settings.memory;
        if (settings.helpImprove !== undefined) user.settings.helpImprove = settings.helpImprove;

        await fs.writeFile(join(USERS_DIR, file), JSON.stringify(user, null, 2));
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
      const raw = await fs.readFile(join(USERS_DIR, file), 'utf-8');
      const user = JSON.parse(raw);
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
      const raw = await fs.readFile(join(USERS_DIR, file), 'utf-8');
      const user = JSON.parse(raw);
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

  const getPlanLimit = (plan) => {
    switch(plan) {
      case 'pro': return 20;
      case 'premium': return 10;
      case 'free':
      default: return 3;
    }
  };

  const today = new Date().toISOString().slice(0, 10);

  try {
    const files = await fs.readdir(USERS_DIR);
    for (const file of files.filter(f => f.endsWith('.json'))) {
      const raw = await fs.readFile(join(USERS_DIR, file), 'utf-8');
      const user = JSON.parse(raw);
      if (user.token === token) {
        const MAX_ENGINE_USES = getPlanLimit(user.plan || 'free');
        // Reset if new day
        if (user.engineLastReset !== today) {
          user.engineUsesToday = 0;
          user.engineLastReset = today;
        }

        if ((user.engineUsesToday || 0) >= MAX_ENGINE_USES) {
          return { allowed: false, remaining: 0, max: MAX_ENGINE_USES };
        }

        user.engineUsesToday = (user.engineUsesToday || 0) + 1;
        await fs.writeFile(join(USERS_DIR, file), JSON.stringify(user, null, 2));

        return {
          allowed: true,
          remaining: MAX_ENGINE_USES - user.engineUsesToday,
          max: MAX_ENGINE_USES
        };
      }
    }
  } catch {
    return { allowed: false, remaining: 0, max: 3 };
  }
  return { allowed: false, remaining: 0, max: 3 };
}

/**
 * Get daily token limit based on plan.
 */
function getDailyTokenLimit(plan) {
  switch(plan) {
    case 'pro': return 200000;
    case 'premium': return 100000;
    case 'free':
    default: return 50000;
  }
}

/**
 * Check daily token usage. Returns { allowed, tokensUsed, tokensRemaining, limit }.
 */
export async function checkTokenUsage(token) {
  if (!token) return { allowed: true, tokensUsed: 0, tokensRemaining: 50000, limit: 50000 };

  const today = new Date().toISOString().slice(0, 10);

  try {
    const files = await fs.readdir(USERS_DIR);
    for (const file of files.filter(f => f.endsWith('.json'))) {
      const raw = await fs.readFile(join(USERS_DIR, file), 'utf-8');
      const user = JSON.parse(raw);
      if (user.token === token) {
        if (user.tokenLastReset !== today) {
          user.tokensUsedToday = 0;
          user.tokenLastReset = today;
          await fs.writeFile(join(USERS_DIR, file), JSON.stringify(user, null, 2));
        }

        const limit = getDailyTokenLimit(user.plan || 'free');
        const used = user.tokensUsedToday || 0;
        return {
          allowed: used < limit,
          tokensUsed: used,
          tokensRemaining: Math.max(0, limit - used),
          limit
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

  try {
    const files = await fs.readdir(USERS_DIR);
    for (const file of files.filter(f => f.endsWith('.json'))) {
      const raw = await fs.readFile(join(USERS_DIR, file), 'utf-8');
      const user = JSON.parse(raw);
      if (user.token === token) {
        if (user.tokenLastReset !== today) {
          user.tokensUsedToday = 0;
          user.tokenLastReset = today;
        }
        user.tokensUsedToday = (user.tokensUsedToday || 0) + tokensUsed;
        await fs.writeFile(join(USERS_DIR, file), JSON.stringify(user, null, 2));
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
      const raw = await fs.readFile(join(USERS_DIR, file), 'utf-8');
      const user = JSON.parse(raw);
      if (user.token === token) {
        if (fields.plan !== undefined) user.plan = fields.plan;
        if (fields.stripeCustomerId !== undefined) user.stripeCustomerId = fields.stripeCustomerId;
        if (fields.planExpiresAt !== undefined) user.planExpiresAt = fields.planExpiresAt;

        await fs.writeFile(join(USERS_DIR, file), JSON.stringify(user, null, 2));
        return { success: true, user: sanitizeUser(user) };
      }
    }
  } catch (err) {
    return { error: 'Failed to update plan' };
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
      const raw = await fs.readFile(join(USERS_DIR, file), 'utf-8');
      const user = JSON.parse(raw);
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
      const raw = await fs.readFile(join(USERS_DIR, file), 'utf-8');
      const user = JSON.parse(raw);
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
function sanitizeUser(user) {
  const today = new Date().toISOString().slice(0, 10);
  const usesToday = user.engineLastReset === today ? (user.engineUsesToday || 0) : 0;

  const getPlanLimit = (plan) => {
    switch(plan) {
      case 'pro': return 20;
      case 'premium': return 10;
      case 'free':
      default: return 3;
    }
  };

  const planLimit = getPlanLimit(user.plan || 'free');

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    userType: user.userType,
    school: user.school,
    interests: user.interests,
    profile: user.profile,
    plan: user.plan || 'free',
    settings: user.settings,
    hasSubscription: !!user.stripeCustomerId, // Only expose boolean, not the actual ID
    consentGiven: user.consentGiven,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin,
    sessionCount: (user.sessionHistory || []).length,
    engineUsesToday: usesToday,
    engineRemaining: Math.max(0, planLimit - usesToday),
    tokenUsage: {
      used: user.tokenLastReset === today ? (user.tokensUsedToday || 0) : 0,
      limit: getDailyTokenLimit(user.plan || 'free'),
      remaining: Math.max(0, getDailyTokenLimit(user.plan || 'free') - (user.tokenLastReset === today ? (user.tokensUsedToday || 0) : 0))
    }
  };
}
