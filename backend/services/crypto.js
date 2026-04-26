/**
 * AES-256-GCM field encryption — Wayfinder
 *
 * App-level encryption for sensitive PII fields stored in user files.
 * Defense-in-depth on top of Render's disk-level encryption: even if file
 * contents are exposed, sensitive fields stay opaque without the key.
 *
 * Key: ENCRYPTION_KEY env var (32 bytes / 64 hex chars / 44 b64 chars).
 * Format: { _enc: "v1", ct: "base64(iv || authTag || ciphertext)" }
 *
 * Lazy migration: if ENCRYPTION_KEY isn't set, encryptField returns the
 * plaintext value unchanged (logged as warning once). Existing plaintext
 * files keep working until the next write, when fields get wrapped.
 */

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const ALGO = 'aes-256-gcm';
const IV_LEN = 12;
const TAG_LEN = 16;

let _key = null;
let _keyLoadAttempted = false;
let _missingKeyWarned = false;

function loadKey() {
  if (_keyLoadAttempted) return _key;
  _keyLoadAttempted = true;

  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) {
    return null;
  }

  // Accept hex (64 chars), base64 (44 chars + padding), or any string ≥32 bytes.
  // For hex/base64 we decode directly; otherwise we derive 32 bytes via scrypt.
  if (/^[0-9a-fA-F]{64}$/.test(raw)) {
    _key = Buffer.from(raw, 'hex');
  } else if (/^[A-Za-z0-9+/]{43}=?$/.test(raw)) {
    _key = Buffer.from(raw, 'base64');
  } else {
    _key = scryptSync(raw, 'wayfinder-encryption-salt-v1', 32);
  }

  if (_key.length !== 32) {
    console.error('[crypto] ENCRYPTION_KEY decoded to', _key.length, 'bytes, expected 32. Disabling.');
    _key = null;
  }
  return _key;
}

export function isEncryptionAvailable() {
  return loadKey() !== null;
}

/**
 * Encrypt a value (string/object/array). Returns the encrypted wrapper or
 * the original value if encryption is unavailable.
 */
export function encryptField(value) {
  const key = loadKey();
  if (!key) {
    if (!_missingKeyWarned) {
      console.warn('[crypto] ENCRYPTION_KEY not set — sensitive fields stored plaintext. Set the env var on Render to enable AES-256-GCM.');
      _missingKeyWarned = true;
    }
    return value;
  }
  if (value === null || value === undefined) return value;

  // Already encrypted? Return as-is.
  if (typeof value === 'object' && value._enc === 'v1' && typeof value.ct === 'string') {
    return value;
  }

  const plaintext = typeof value === 'string' ? value : JSON.stringify(value);
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, key, iv);
  const ct = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  const blob = Buffer.concat([iv, tag, ct]).toString('base64');
  return { _enc: 'v1', ct: blob, _t: typeof value === 'string' ? 's' : 'j' };
}

/**
 * Decrypt a wrapped value. Returns the original plaintext.
 * If passed plaintext (no _enc marker), returns it unchanged.
 */
export function decryptField(value) {
  if (value === null || value === undefined) return value;
  if (typeof value !== 'object' || value._enc !== 'v1' || typeof value.ct !== 'string') {
    // Not an encrypted wrapper — return as-is (covers legacy plaintext).
    return value;
  }
  const key = loadKey();
  if (!key) {
    console.error('[crypto] decrypt requested but ENCRYPTION_KEY missing — returning placeholder');
    return '[ENCRYPTED]';
  }
  try {
    const blob = Buffer.from(value.ct, 'base64');
    const iv = blob.subarray(0, IV_LEN);
    const tag = blob.subarray(IV_LEN, IV_LEN + TAG_LEN);
    const ct = blob.subarray(IV_LEN + TAG_LEN);
    const decipher = createDecipheriv(ALGO, key, iv);
    decipher.setAuthTag(tag);
    const pt = Buffer.concat([decipher.update(ct), decipher.final()]).toString('utf8');
    return value._t === 'j' ? JSON.parse(pt) : pt;
  } catch (err) {
    console.error('[crypto] decrypt failed:', err.message);
    return '[DECRYPT_ERROR]';
  }
}

// ─── Field-set helpers for whole-object operations ──────────────

const SENSITIVE_USER_FIELDS = ['name', 'school', 'interests', 'profile'];

/**
 * Encrypt sensitive fields on a user object before persistence.
 * Mutates and returns the object. Idempotent.
 */
export function encryptUserFields(user) {
  if (!user || typeof user !== 'object') return user;
  for (const f of SENSITIVE_USER_FIELDS) {
    if (f in user && user[f] !== null && user[f] !== undefined) {
      user[f] = encryptField(user[f]);
    }
  }
  if (user.settings && typeof user.settings === 'object' && 'displayName' in user.settings) {
    if (user.settings.displayName !== null && user.settings.displayName !== undefined) {
      user.settings.displayName = encryptField(user.settings.displayName);
    }
  }
  if (isEncryptionAvailable()) user._encryptedFields = SENSITIVE_USER_FIELDS;
  return user;
}

/**
 * Decrypt sensitive fields after loading from disk.
 * Mutates and returns the object. Safe on already-plaintext objects.
 */
export function decryptUserFields(user) {
  if (!user || typeof user !== 'object') return user;
  for (const f of SENSITIVE_USER_FIELDS) {
    if (f in user) user[f] = decryptField(user[f]);
  }
  if (user.settings && typeof user.settings === 'object' && 'displayName' in user.settings) {
    user.settings.displayName = decryptField(user.settings.displayName);
  }
  return user;
}

export const _SENSITIVE_USER_FIELDS = SENSITIVE_USER_FIELDS;
