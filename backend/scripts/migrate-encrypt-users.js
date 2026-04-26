#!/usr/bin/env node
/**
 * One-off migration: re-write every user file with encrypted sensitive fields.
 *
 * Idempotent — files already encrypted (containing _enc wrappers) are detected
 * and re-written using the same encryption (no double-wrapping).
 *
 * USAGE (on Render Shell):
 *   node backend/scripts/migrate-encrypt-users.js
 *
 * Requires ENCRYPTION_KEY env var to be set on Render. If missing, the script
 * exits cleanly with no changes.
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { encryptUserFields, decryptUserFields, isEncryptionAvailable } from '../services/crypto.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const USERS_DIR = join(__dirname, '..', 'data', 'users');

async function main() {
  if (!isEncryptionAvailable()) {
    console.error('ENCRYPTION_KEY not set. Set it in Render env vars and re-run.');
    process.exit(1);
  }

  const files = await fs.readdir(USERS_DIR).catch(() => []);
  const userFiles = files.filter(f => f.endsWith('.json'));
  console.log(`Migrating ${userFiles.length} user files in ${USERS_DIR}`);

  let migrated = 0, alreadyEncrypted = 0, errors = 0;
  for (const f of userFiles) {
    const fp = join(USERS_DIR, f);
    try {
      const raw = await fs.readFile(fp, 'utf8');
      const parsed = JSON.parse(raw);

      // Detect already-encrypted: name is an object with _enc
      const wasEncrypted = parsed.name && typeof parsed.name === 'object' && parsed.name._enc === 'v1';

      // Always decrypt-then-re-encrypt for consistency (idempotent)
      const plain = decryptUserFields(parsed);
      const clone = JSON.parse(JSON.stringify(plain));
      const encrypted = encryptUserFields(clone);

      const tmp = fp + '.mig.tmp';
      await fs.writeFile(tmp, JSON.stringify(encrypted, null, 2));
      await fs.rename(tmp, fp);

      if (wasEncrypted) alreadyEncrypted++;
      else migrated++;
    } catch (err) {
      console.error(`  ${f}: ${err.message}`);
      errors++;
    }
  }

  console.log(`\nDone. Newly encrypted: ${migrated}, re-wrapped existing: ${alreadyEncrypted}, errors: ${errors}`);
}

main().catch(err => { console.error('FATAL:', err); process.exit(1); });
