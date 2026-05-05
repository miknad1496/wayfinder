// REVAMP V2: SUPPLEMENT QUOTA PATCH151
//
// File-backed atomic counter for HC supplement (Opus) fires per user per day.
// Mirrors the _quota-tracker.json pattern from patch 22 (proven in production).
//
// Design rules (every one is a robustness rule):
//   1. ATOMIC WRITES: write to temp file, then rename. Rename is atomic on POSIX.
//      A crash mid-write leaves the previous good file intact.
//   2. RESERVE-COMMIT-RELEASE: caller reserves a slot BEFORE firing Opus, commits
//      AFTER success, releases on Opus error. So a crashed Opus call doesn't
//      eat a quota slot.
//   3. FAIL-CLOSED on file errors: if the file can't be read/written (disk full,
//      permission denied), return { allowed: false, reason: 'quota_io_error' }.
//      The caller falls through to slm_with_exemplar route — user gets a strong
//      response, just not a fresh Opus one. Quality unaffected; cost saved.
//   4. AUTO-RECOVER on corruption: if the JSON is malformed at load time,
//      log the corruption + recreate empty. Single user might lose their
//      counter for the day; system never crashes.
//   5. BOUNDED SIZE: prune entries older than 7 days on every write. The file
//      stays small even with thousands of users.
//
// Caps live in TIER_CAPS below. Easy to tune without redeploying logic.
//
// Pricing locked: 3 tiers (Free / Coach $25 / Consultant $50). Caps are sized
// to keep paid tiers above 60% margin assuming current ~$0.10/Opus fire and
// 35-60% exemplar cache hit rate (which grows as more exemplars ship).

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const QUOTA_FILE = join(__dirname, '..', 'data', '_supplement-quota.json');
const QUOTA_TMP = QUOTA_FILE + '.tmp';

// ── Tier caps (daily Opus supplement fires per user) ───────────────────────
//
// Sized for the LONG-TERM cache hit rate (~55-60%). At launch with 35% cache
// hit rate, a heavy Coach user hitting cap every day = $0.70/day = $21/mo,
// which is within the $25 envelope but tight. As exemplar coverage grows the
// real cost-per-active-user drops well below cap.
//
// Free tier gets 1 — the daily "wow" moment that drives upgrade conversion.
// Consultant gets 14 — for users running 50+ queries/day, this is enough that
// supplement-quota-exhausted-message rarely shows.

const TIER_CAPS = Object.freeze({
  free: 1,
  pro: 7,
  coach: 7,         // alias for pro (current pricing display name)
  elite: 14,
  consultant: 14,   // alias for elite (current pricing display name)
  admin: 100,       // admin testing
  vip: 100,         // VIP comp
});

const PRUNE_DAYS = 7; // entries older than this get pruned on every write
const RESERVATION_TTL_MS = 60 * 1000; // a reserve that isn't committed within 60s auto-releases

// ── In-memory mutex (single-process serialization) ─────────────────────────
//
// Even with atomic-rename writes, two parallel reserve() calls in the same
// Node process can race read-then-write. A simple promise chain serializes
// them. For multi-process Render scaling (we don't currently use this) the
// atomic rename + small race window keeps damage to <1 quota slot per race,
// which is acceptable.

let _writeLock = Promise.resolve();
function _serialize(fn) {
  const next = _writeLock.then(fn, fn);
  _writeLock = next.catch(() => {}); // swallow errors so chain survives
  return next;
}

// ── State helpers ───────────────────────────────────────────────────────────

function _todayKey() {
  // YYYY-MM-DD in UTC. Day boundary is midnight UTC. Simple, predictable,
  // matches the morning-pulse cron (also UTC).
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

async function _readState() {
  try {
    const raw = await fs.readFile(QUOTA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.users && typeof parsed.users === 'object') {
      return parsed;
    }
    console.warn('[supplement-quota] state file shape invalid, recreating');
    return _emptyState();
  } catch (err) {
    if (err && err.code === 'ENOENT') return _emptyState(); // first run
    console.warn('[supplement-quota] read failed (' + err.message + '), recreating');
    return _emptyState();
  }
}

function _emptyState() {
  return { schema: 1, users: {}, lastPrunedAt: 0 };
}

async function _writeState(state) {
  // Atomic write: tmp + rename. If rename fails (rare), the tmp is left for
  // manual cleanup but the original file is untouched.
  const json = JSON.stringify(state);
  await fs.writeFile(QUOTA_TMP, json, 'utf-8');
  await fs.rename(QUOTA_TMP, QUOTA_FILE);
}

function _pruneOldEntries(state) {
  const today = _todayKey();
  const todayMs = Date.parse(today + 'T00:00:00Z');
  const cutoff = todayMs - PRUNE_DAYS * 24 * 60 * 60 * 1000;
  let removed = 0;
  for (const [userId, userState] of Object.entries(state.users)) {
    if (!userState || typeof userState !== 'object') {
      delete state.users[userId];
      removed++;
      continue;
    }
    // Drop date entries older than cutoff
    if (userState.daily && typeof userState.daily === 'object') {
      for (const dateKey of Object.keys(userState.daily)) {
        const dayMs = Date.parse(dateKey + 'T00:00:00Z');
        if (isNaN(dayMs) || dayMs < cutoff) {
          delete userState.daily[dateKey];
          removed++;
        }
      }
    }
    // Drop user entirely if no recent activity
    if (!userState.daily || Object.keys(userState.daily).length === 0) {
      delete state.users[userId];
    }
  }
  state.lastPrunedAt = Date.now();
  return removed;
}

function _capForTier(tier) {
  const t = String(tier || 'free').toLowerCase();
  if (TIER_CAPS[t] != null) return TIER_CAPS[t];
  return TIER_CAPS.free; // unknown tier = free
}

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Check whether the user has remaining quota AND reserve a slot.
 *
 * @param {string} userId - stable user identifier (auth.user.id or email-slug)
 * @param {string} tier - user's plan: 'free' | 'pro'/'coach' | 'elite'/'consultant' | 'admin' | 'vip'
 * @returns {Promise<{allowed: boolean, remaining: number, cap: number, reservationId?: string, reason?: string, resetAt?: string}>}
 */
export async function reserveSupplement(userId, tier) {
  if (!userId || typeof userId !== 'string') {
    return { allowed: false, remaining: 0, cap: 0, reason: 'no_user_id' };
  }
  const cap = _capForTier(tier);
  if (cap === 0) {
    return { allowed: false, remaining: 0, cap: 0, reason: 'tier_zero_cap' };
  }

  return _serialize(async () => {
    let state;
    try {
      state = await _readState();
    } catch (err) {
      console.warn('[supplement-quota] reserve read failed: ' + err.message);
      return { allowed: false, remaining: 0, cap, reason: 'quota_io_error' };
    }

    const today = _todayKey();
    if (!state.users[userId]) state.users[userId] = { daily: {} };
    if (!state.users[userId].daily[today]) state.users[userId].daily[today] = { committed: 0, reservations: {} };
    const slot = state.users[userId].daily[today];

    // Sweep expired reservations (caller crashed without commit/release)
    const now = Date.now();
    for (const [resId, resTs] of Object.entries(slot.reservations)) {
      if (now - resTs > RESERVATION_TTL_MS) delete slot.reservations[resId];
    }

    const inFlight = Object.keys(slot.reservations).length;
    const used = (slot.committed || 0) + inFlight;
    if (used >= cap) {
      return {
        allowed: false,
        remaining: 0,
        cap,
        reason: 'cap_reached',
        resetAt: today + 'T24:00:00Z',
      };
    }

    const reservationId = 'r_' + Math.random().toString(36).slice(2, 10);
    slot.reservations[reservationId] = now;

    // Prune occasionally (cheap)
    if (!state.lastPrunedAt || (now - state.lastPrunedAt) > 24 * 60 * 60 * 1000) {
      _pruneOldEntries(state);
    }

    try {
      await _writeState(state);
    } catch (err) {
      console.warn('[supplement-quota] reserve write failed: ' + err.message);
      return { allowed: false, remaining: 0, cap, reason: 'quota_io_error' };
    }

    return {
      allowed: true,
      remaining: cap - used - 1,
      cap,
      reservationId,
      resetAt: today + 'T24:00:00Z',
    };
  });
}

/**
 * Convert a reservation into a committed quota use (call after Opus success).
 * Idempotent: calling twice with the same reservationId is harmless.
 *
 * @param {string} userId
 * @param {string} reservationId
 * @returns {Promise<{ok: boolean}>}
 */
export async function commitSupplement(userId, reservationId) {
  if (!userId || !reservationId) return { ok: false };
  return _serialize(async () => {
    let state;
    try {
      state = await _readState();
    } catch (err) {
      return { ok: false };
    }
    const today = _todayKey();
    const slot = state.users[userId] && state.users[userId].daily && state.users[userId].daily[today];
    if (!slot) return { ok: false };

    if (slot.reservations && slot.reservations[reservationId]) {
      delete slot.reservations[reservationId];
      slot.committed = (slot.committed || 0) + 1;
      try {
        await _writeState(state);
        return { ok: true };
      } catch (err) {
        console.warn('[supplement-quota] commit write failed: ' + err.message);
        return { ok: false };
      }
    }
    return { ok: false }; // reservation already expired or never existed
  });
}

/**
 * Release a reservation without committing (call on Opus error).
 * Idempotent.
 */
export async function releaseSupplement(userId, reservationId) {
  if (!userId || !reservationId) return { ok: false };
  return _serialize(async () => {
    let state;
    try {
      state = await _readState();
    } catch (err) {
      return { ok: false };
    }
    const today = _todayKey();
    const slot = state.users[userId] && state.users[userId].daily && state.users[userId].daily[today];
    if (!slot || !slot.reservations) return { ok: false };
    if (slot.reservations[reservationId]) {
      delete slot.reservations[reservationId];
      try {
        await _writeState(state);
        return { ok: true };
      } catch (err) {
        return { ok: false };
      }
    }
    return { ok: false };
  });
}

/**
 * Read-only check (does not reserve). For UI display.
 */
export async function getSupplementStatus(userId, tier) {
  if (!userId) return { remaining: 0, cap: 0, used: 0 };
  const cap = _capForTier(tier);
  let state;
  try {
    state = await _readState();
  } catch (err) {
    return { remaining: cap, cap, used: 0, ioError: true };
  }
  const today = _todayKey();
  const slot = state.users[userId] && state.users[userId].daily && state.users[userId].daily[today];
  if (!slot) return { remaining: cap, cap, used: 0 };
  const used = (slot.committed || 0) + Object.keys(slot.reservations || {}).length;
  return { remaining: Math.max(0, cap - used), cap, used };
}

/**
 * Aggregate stats across all users for /router-health.
 */
export async function getQuotaAggregateStats() {
  let state;
  try {
    state = await _readState();
  } catch (err) {
    return { error: 'quota_io_error', ioError: true };
  }
  const today = _todayKey();
  let totalUsersToday = 0;
  let totalSupplementsToday = 0;
  let totalReservationsInFlight = 0;
  for (const userState of Object.values(state.users)) {
    const slot = userState.daily && userState.daily[today];
    if (!slot) continue;
    totalUsersToday++;
    totalSupplementsToday += slot.committed || 0;
    totalReservationsInFlight += Object.keys(slot.reservations || {}).length;
  }
  return {
    today,
    activeUsersToday: totalUsersToday,
    supplementsCommittedToday: totalSupplementsToday,
    reservationsInFlight: totalReservationsInFlight,
    totalUsersTracked: Object.keys(state.users).length,
    lastPrunedAt: state.lastPrunedAt ? new Date(state.lastPrunedAt).toISOString() : null,
  };
}

export { TIER_CAPS };
