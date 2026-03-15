/**
 * Simple User Authentication Service
 *
 * Stores users as JSON files. For MVP/free hosting this is fine.
 * Upgrade path: swap for a proper database (SQLite, PostgreSQL, etc.)
 *
 * Passwords are hashed with Node's built-in crypto (no bcrypt dependency needed).
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash, randomBytes } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const USERS_DIR = join(__dirname, '..', 'data', 'users');

// Ensure users directory exists
export async function ensureUsersDir() {
  await fs.mkdir(USERS_DIR, { recursive: true });
}

function hashPassword(password, salt) {
  return createHash('sha256').update(password + salt).digest('hex');
}

function generateToken() {
  return randomBytes(32).toString('hex');
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

  const salt = randomBytes(16).toString('hex');
  const hashedPassword = hashPassword(password, salt);
  const token = generateToken();

  const user = {
    id: randomBytes(8).toString('hex'),
    email: emailLower,
    name: name || '',
    userType: userType || 'student', // student, pre-college, advisor
    school: school || '',
    interests: interests || [],
    passwordHash: hashedPassword,
    salt,
    token,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    sessionHistory: [], // Links to past session IDs
    profile: {
      age: '',
      gradeLevel: '',       // e.g. '10th', 'Freshman', 'Junior', 'Working Professional'
      favoriteClasses: [],   // e.g. ['Math', 'Biology', 'Art']
      careerInterests: [],   // e.g. ['Software Engineering', 'Medicine']
      aboutMe: ''            // freeform description
    },
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

  const hashedPassword = hashPassword(password, user.salt);
  if (hashedPassword !== user.passwordHash) {
    return { error: 'Invalid email or password' };
  }

  // Generate new token
  user.token = generateToken();
  user.lastLogin = new Date().toISOString();
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

  try {
    const files = await fs.readdir(USERS_DIR);
    for (const file of files.filter(f => f.endsWith('.json'))) {
      const raw = await fs.readFile(join(USERS_DIR, file), 'utf-8');
      const user = JSON.parse(raw);
      if (user.token === token) {
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

  const MAX_ENGINE_USES = 3;
  const today = new Date().toISOString().slice(0, 10);

  try {
    const files = await fs.readdir(USERS_DIR);
    for (const file of files.filter(f => f.endsWith('.json'))) {
      const raw = await fs.readFile(join(USERS_DIR, file), 'utf-8');
      const user = JSON.parse(raw);
      if (user.token === token) {
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
    return { usesToday: 0, remaining: 0, max: MAX_ENGINE_USES };
  }
  return { usesToday: 0, remaining: 0, max: MAX_ENGINE_USES };
}

/**
 * Increment engine usage for today. Returns false if limit reached.
 */
export async function useEngine(token) {
  if (!token) return { allowed: false, remaining: 0 };

  const MAX_ENGINE_USES = 3;
  const today = new Date().toISOString().slice(0, 10);

  try {
    const files = await fs.readdir(USERS_DIR);
    for (const file of files.filter(f => f.endsWith('.json'))) {
      const raw = await fs.readFile(join(USERS_DIR, file), 'utf-8');
      const user = JSON.parse(raw);
      if (user.token === token) {
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
    return { allowed: false, remaining: 0, max: MAX_ENGINE_USES };
  }
  return { allowed: false, remaining: 0, max: MAX_ENGINE_USES };
}

// Remove sensitive fields before sending to client
function sanitizeUser(user) {
  const today = new Date().toISOString().slice(0, 10);
  const usesToday = user.engineLastReset === today ? (user.engineUsesToday || 0) : 0;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    userType: user.userType,
    school: user.school,
    interests: user.interests,
    profile: user.profile,
    consentGiven: user.consentGiven,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin,
    sessionCount: (user.sessionHistory || []).length,
    engineUsesToday: usesToday,
    engineRemaining: Math.max(0, 3 - usesToday)
  };
}
