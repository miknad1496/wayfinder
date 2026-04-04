import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { promises as fs } from 'fs';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const USERS_DIR = join(__dirname, '..', 'data', 'users');
const SESSIONS_DIR = join(__dirname, '..', 'data', 'sessions');
const INVITES_DIR = join(__dirname, '..', 'data', 'invites');
const BACKUP_DIR = join(__dirname, '..', 'data', 'backup');
const SEED_BACKUP = join(__dirname, '..', '..', 'seed-data', 'user-backup.json');

let backupTimer = null;
const BACKUP_INTERVAL = 30 * 60 * 1000; // 30 minutes in milliseconds

/**
 * Read all JSON files from a directory
 * @param {string} dirPath - Directory path
 * @returns {Promise<Object>} - Object with filenames as keys and file contents as values
 */
async function readDirectoryData(dirPath) {
  try {
    if (!existsSync(dirPath)) {
      return {};
    }

    const files = await fs.readdir(dirPath);
    const data = {};

    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const filePath = join(dirPath, file);
          const content = await fs.readFile(filePath, 'utf-8');
          data[file] = JSON.parse(content);
        } catch (err) {
          console.warn(`Warning: Failed to read file ${file} from ${dirPath}:`, err.message);
        }
      }
    }

    return data;
  } catch (err) {
    console.warn(`Warning: Failed to read directory ${dirPath}:`, err.message);
    return {};
  }
}

/**
 * Create backup directory if it doesn't exist
 */
async function ensureBackupDirs() {
  try {
    if (!existsSync(BACKUP_DIR)) {
      await fs.mkdir(BACKUP_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn(`Warning: Failed to create backup directory ${BACKUP_DIR}:`, err.message);
  }

  try {
    const seedDir = dirname(SEED_BACKUP);
    if (!existsSync(seedDir)) {
      await fs.mkdir(seedDir, { recursive: true });
    }
  } catch (err) {
    console.warn(`Warning: Failed to create seed-data directory:`, err.message);
  }
}

/**
 * Run a backup immediately
 * Serializes all data from users, sessions, and invites directories
 * @returns {Promise<Object>} - Backup metadata with counts and timestamp
 */
export async function runBackupNow() {
  try {
    await ensureBackupDirs();

    console.log('Starting user backup...');

    // Read all data from directories
    const [usersData, sessionsData, invitesData] = await Promise.all([
      readDirectoryData(USERS_DIR),
      readDirectoryData(SESSIONS_DIR),
      readDirectoryData(INVITES_DIR),
    ]);

    // Create backup payload with metadata
    const backupPayload = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {
        users: usersData,
        sessions: sessionsData,
        invites: invitesData,
      },
      counts: {
        users: Object.keys(usersData).length,
        sessions: Object.keys(sessionsData).length,
        invites: Object.keys(invitesData).length,
      },
    };

    // Write to persistent backup location
    try {
      const backupPath = join(BACKUP_DIR, 'user-backup.json');
      await fs.writeFile(backupPath, JSON.stringify(backupPayload, null, 2));
      console.log(`Backup saved to ${backupPath}`);
    } catch (err) {
      console.warn(`Warning: Failed to save backup to ${BACKUP_DIR}:`, err.message);
    }

    // Write to seed-data location (survives builds)
    try {
      await fs.writeFile(SEED_BACKUP, JSON.stringify(backupPayload, null, 2));
      console.log(`Backup saved to ${SEED_BACKUP}`);
    } catch (err) {
      console.warn(`Warning: Failed to save backup to seed-data:`, err.message);
    }

    console.log(
      `Backup completed. Users: ${backupPayload.counts.users}, Sessions: ${backupPayload.counts.sessions}, Invites: ${backupPayload.counts.invites}`
    );

    return backupPayload;
  } catch (err) {
    console.error('Error during backup:', err);
    throw err;
  }
}

/**
 * Restore data from backup if users directory is empty
 * @returns {Promise<Object>} - Restoration metadata or null if no restore needed
 */
export async function restoreFromBackup() {
  try {
    // Check if users directory exists and has content
    if (existsSync(USERS_DIR)) {
      const files = await fs.readdir(USERS_DIR);
      const jsonFiles = files.filter((f) => f.endsWith('.json'));
      if (jsonFiles.length > 0) {
        console.log('Users directory is not empty, skipping restoration');
        return null;
      }
    }

    // Try to find and read a backup file
    let backupData = null;
    let backupSource = null;

    // Try persistent backup first
    if (existsSync(join(BACKUP_DIR, 'user-backup.json'))) {
      try {
        const content = await fs.readFile(join(BACKUP_DIR, 'user-backup.json'), 'utf-8');
        backupData = JSON.parse(content);
        backupSource = 'persistent backup';
      } catch (err) {
        console.warn('Warning: Failed to read persistent backup:', err.message);
      }
    }

    // Try seed-data backup if persistent failed
    if (!backupData && existsSync(SEED_BACKUP)) {
      try {
        const content = await fs.readFile(SEED_BACKUP, 'utf-8');
        backupData = JSON.parse(content);
        backupSource = 'seed-data backup';
      } catch (err) {
        console.warn('Warning: Failed to read seed-data backup:', err.message);
      }
    }

    if (!backupData) {
      console.log('No backup found for restoration');
      return null;
    }

    console.log(`Restoring from ${backupSource}...`);

    // Ensure directories exist
    await Promise.all([
      fs.mkdir(USERS_DIR, { recursive: true }),
      fs.mkdir(SESSIONS_DIR, { recursive: true }),
      fs.mkdir(INVITES_DIR, { recursive: true }),
    ]);

    // Restore files from backup
    const restored = {
      users: 0,
      sessions: 0,
      invites: 0,
      timestamp: backupData.timestamp,
    };

    // Restore users
    try {
      for (const [filename, content] of Object.entries(backupData.data.users || {})) {
        const filePath = join(USERS_DIR, filename);
        await fs.writeFile(filePath, JSON.stringify(content, null, 2));
        restored.users++;
      }
    } catch (err) {
      console.warn('Warning: Failed to restore users:', err.message);
    }

    // Restore sessions
    try {
      for (const [filename, content] of Object.entries(backupData.data.sessions || {})) {
        const filePath = join(SESSIONS_DIR, filename);
        await fs.writeFile(filePath, JSON.stringify(content, null, 2));
        restored.sessions++;
      }
    } catch (err) {
      console.warn('Warning: Failed to restore sessions:', err.message);
    }

    // Restore invites
    try {
      for (const [filename, content] of Object.entries(backupData.data.invites || {})) {
        const filePath = join(INVITES_DIR, filename);
        await fs.writeFile(filePath, JSON.stringify(content, null, 2));
        restored.invites++;
      }
    } catch (err) {
      console.warn('Warning: Failed to restore invites:', err.message);
    }

    console.log(
      `Restoration completed. Users: ${restored.users}, Sessions: ${restored.sessions}, Invites: ${restored.invites}`
    );

    return restored;
  } catch (err) {
    console.error('Error during restoration:', err);
    throw err;
  }
}

/**
 * Start the periodic backup timer
 * Runs a backup every 30 minutes
 */
export function startUserBackup() {
  if (backupTimer) {
    console.warn('Backup timer already running');
    return;
  }

  console.log('Starting periodic backup service (every 30 minutes)');

  // Run initial backup immediately
  runBackupNow().catch((err) => {
    console.error('Initial backup failed:', err);
  });

  // Set up periodic backup
  backupTimer = setInterval(() => {
    runBackupNow().catch((err) => {
      console.error('Periodic backup failed:', err);
    });
  }, BACKUP_INTERVAL);

  // Ensure timer doesn't prevent process shutdown
  backupTimer.unref();
}

/**
 * Stop the periodic backup timer and run a final backup
 * Call this during graceful shutdown
 */
export async function stopUserBackup() {
  if (backupTimer) {
    console.log('Stopping periodic backup service');
    clearInterval(backupTimer);
    backupTimer = null;
  }

  // Run final backup before shutdown
  try {
    console.log('Running final backup before shutdown');
    await runBackupNow();
    console.log('Final backup completed');
  } catch (err) {
    console.error('Final backup failed:', err);
  }
}
