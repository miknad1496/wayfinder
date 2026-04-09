/**
 * Reminder Scheduler Service
 *
 * Runs on server startup, checks hourly for upcoming events
 * that need email reminders sent to pro/elite users.
 *
 * Reminder rules:
 * - 7 days before deadline → first reminder
 * - 3 days before deadline → second reminder
 * - 1 day before deadline → urgent reminder
 * - Day of decision → decision alert
 * - Weekly digest (Mondays at ~9am)
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { sendDeadlineReminder, sendDecisionDateAlert } from './email.js';
import { canAccess } from './auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const USERS_DIR = join(__dirname, '..', 'data', 'users');
const REMINDERS_DIR = join(__dirname, '..', 'data', 'reminders');

const CHECK_INTERVAL = 60 * 60 * 1000; // Check every hour
const REMINDER_DAYS = [7, 3, 1, 0]; // Days before event to send reminders

// Track sent reminders to avoid duplicates
async function loadSentReminders(userId) {
  try {
    await fs.mkdir(REMINDERS_DIR, { recursive: true });
    const raw = await fs.readFile(join(REMINDERS_DIR, `${userId}.json`), 'utf8');
    return JSON.parse(raw);
  } catch {
    return { sentReminders: [] };
  }
}

async function saveSentReminder(userId, reminderId) {
  await fs.mkdir(REMINDERS_DIR, { recursive: true });
  const data = await loadSentReminders(userId);
  data.sentReminders.push({ id: reminderId, sentAt: new Date().toISOString() });
  // Keep only last 500 to prevent file growth
  if (data.sentReminders.length > 500) {
    data.sentReminders = data.sentReminders.slice(-500);
  }
  await fs.writeFile(join(REMINDERS_DIR, `${userId}.json`), JSON.stringify(data, null, 2));
}

async function wasReminderSent(userId, reminderId) {
  const data = await loadSentReminders(userId);
  return data.sentReminders.some(r => r.id === reminderId);
}

// Load decision dates
let decisionDatesCache = null;
async function loadDecisionDates() {
  if (decisionDatesCache) return decisionDatesCache;
  try {
    const paths = [
      join(__dirname, '..', 'data', 'scraped', 'decision-dates.json'),
    ];
    for (const p of paths) {
      try {
        const raw = await fs.readFile(p, 'utf8');
        decisionDatesCache = JSON.parse(raw);
        return decisionDatesCache;
      } catch {}
    }
    // GitHub fallback
    const resp = await fetch('https://raw.githubusercontent.com/miknad1496/wayfinder/main/backend/data/scraped/decision-dates.json', { signal: AbortSignal.timeout(10000) });
    if (resp.ok) {
      decisionDatesCache = await resp.json();
      return decisionDatesCache;
    }
  } catch {}
  return null;
}

// Get all pro/elite users with reminders enabled
async function getEligibleUsers() {
  try {
    const files = await fs.readdir(USERS_DIR);
    const users = [];
    for (const file of files.filter(f => f.endsWith('.json'))) {
      try {
        const raw = await fs.readFile(join(USERS_DIR, file), 'utf8');
        const user = JSON.parse(raw);
        if (canAccess(user.plan, 'email_reminders') &&
            user.admissionsProfile?.reminderPreferences?.email !== false) {
          users.push(user);
        }
      } catch {}
    }
    return users;
  } catch {
    return [];
  }
}

// Main check function
async function checkReminders() {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  try {
    const users = await getEligibleUsers();
    if (users.length === 0) return;

    const decisionDates = await loadDecisionDates();

    for (const user of users) {
      const profile = user.admissionsProfile;
      if (!profile?.graduationYear || !profile?.targetSchools?.length) continue;

      const upcomingEvents = [];

      // Check decision dates for target schools
      if (decisionDates?.schools) {
        for (const target of profile.targetSchools) {
          const schoolData = decisionDates.schools.find(s =>
            s.name?.toLowerCase().includes(target.name?.toLowerCase()) ||
            s.unitId === target.unitId
          );
          if (schoolData?.dates) {
            for (const d of schoolData.dates) {
              if (!d.date) continue;
              const daysUntil = Math.ceil((new Date(d.date) - now) / (1000 * 60 * 60 * 24));

              // Check if this falls on a reminder day
              for (const reminderDay of REMINDER_DAYS) {
                if (daysUntil === reminderDay) {
                  const reminderId = `${user.id}_${schoolData.name}_${d.date}_${reminderDay}d`;
                  const alreadySent = await wasReminderSent(user.id, reminderId);

                  if (!alreadySent) {
                    upcomingEvents.push({
                      date: d.date,
                      label: `${schoolData.name} — ${d.label || d.type}`,
                      category: d.type?.includes('deadline') ? 'deadline' : 'decision',
                      daysUntil,
                      reminderId
                    });
                  }
                }
              }
            }
          }
        }
      }

      // Send consolidated reminder email if there are events
      if (upcomingEvents.length > 0) {
        const result = await sendDeadlineReminder(
          user.email,
          user.name,
          upcomingEvents
        );

        if (result.success) {
          for (const event of upcomingEvents) {
            await saveSentReminder(user.id, event.reminderId);
          }
          console.log(`[Scheduler] Sent ${upcomingEvents.length} reminders to ${user.email}`);
        }
      }
    }
  } catch (err) {
    console.error('[Scheduler] Error checking reminders:', err.message);
  }
}

// Start the scheduler
export function startScheduler() {
  console.log('[Scheduler] Starting reminder scheduler (checking hourly)');

  // Run first check after 30 seconds (let server settle)
  setTimeout(() => {
    checkReminders().catch(err => console.error('[Scheduler] Initial check error:', err));
  }, 30000);

  // Then check every hour
  setInterval(() => {
    checkReminders().catch(err => console.error('[Scheduler] Check error:', err));
  }, CHECK_INTERVAL);
}
