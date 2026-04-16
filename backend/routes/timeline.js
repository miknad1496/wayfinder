/**
 * Admissions Timeline API
 *
 * Personalized timeline combining decision dates, scholarship deadlines,
 * and admissions milestones based on user's target schools and graduation year.
 *
 * - POST /api/timeline/profile     — Save/update admissions profile
 * - GET  /api/timeline/profile     — Get current profile
 * - GET  /api/timeline/events      — Get personalized timeline events
 * - POST /api/timeline/dismiss     — Dismiss/snooze a reminder
 * - GET  /api/timeline/upcoming    — Next 7 days (compact widget view)
 */

import { Router } from 'express';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { verifyToken, updateAdmissionsProfile, canAccess, findUserByToken } from '../services/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();

// Load decision dates from knowledge base
let decisionDatesCache = null;
async function loadDecisionDates() {
  if (decisionDatesCache) return decisionDatesCache;

  const paths = [
    join(__dirname, '..', 'data', 'scraped', 'decision-dates.json'),
    join(process.cwd(), 'data', 'scraped', 'decision-dates.json'),
  ];

  for (const p of paths) {
    try {
      const raw = await fs.readFile(p, 'utf8');
      decisionDatesCache = JSON.parse(raw);
      return decisionDatesCache;
    } catch {}
  }

  // GitHub fallback
  try {
    const resp = await fetch('https://raw.githubusercontent.com/miknad1496/wayfinder/main/backend/data/scraped/decision-dates.json', { signal: AbortSignal.timeout(10000) });
    if (resp.ok) {
      decisionDatesCache = await resp.json();
      return decisionDatesCache;
    }
  } catch {}

  return null;
}

// Standard admissions milestones (relative to graduation year)
function getStandardMilestones(gradYear) {
  const appYear = gradYear - 1; // Apply the year before graduation
  return [
    { date: `${appYear}-06-01`, label: 'Start college research list', category: 'milestone', priority: 'medium' },
    { date: `${appYear}-07-01`, label: 'Begin Common App essay brainstorming', category: 'milestone', priority: 'high' },
    { date: `${appYear}-08-01`, label: 'Request letters of recommendation', category: 'milestone', priority: 'high' },
    { date: `${appYear}-08-15`, label: 'Common App opens — create account', category: 'milestone', priority: 'high' },
    { date: `${appYear}-09-01`, label: 'Finalize college list', category: 'milestone', priority: 'high' },
    { date: `${appYear}-09-15`, label: 'SAT/ACT registration deadline (fall)', category: 'milestone', priority: 'medium' },
    { date: `${appYear}-10-01`, label: 'Start supplemental essays', category: 'milestone', priority: 'high' },
    { date: `${appYear}-10-15`, label: 'FAFSA opens', category: 'financial', priority: 'high' },
    { date: `${appYear}-11-01`, label: 'Early Decision / Early Action deadlines', category: 'deadline', priority: 'critical' },
    { date: `${appYear}-11-15`, label: 'CSS Profile due (many schools)', category: 'financial', priority: 'high' },
    { date: `${appYear}-12-15`, label: 'ED/EA decisions released', category: 'decision', priority: 'high' },
    { date: `${gradYear}-01-01`, label: 'Regular Decision deadlines begin', category: 'deadline', priority: 'critical' },
    { date: `${gradYear}-01-15`, label: 'Most RD deadlines (Jan 1-15)', category: 'deadline', priority: 'critical' },
    { date: `${gradYear}-02-15`, label: 'FAFSA priority deadline (many schools)', category: 'financial', priority: 'high' },
    { date: `${gradYear}-03-15`, label: 'Scholarship application deadlines', category: 'scholarship', priority: 'high' },
    { date: `${gradYear}-03-28`, label: 'Ivy Day — Ivy League decisions', category: 'decision', priority: 'high' },
    { date: `${gradYear}-04-01`, label: 'Most RD decisions released', category: 'decision', priority: 'high' },
    { date: `${gradYear}-04-15`, label: 'Compare financial aid offers', category: 'financial', priority: 'high' },
    { date: `${gradYear}-05-01`, label: 'National Decision Day — commit!', category: 'deadline', priority: 'critical' },
    { date: `${gradYear}-06-01`, label: 'Send final transcript', category: 'milestone', priority: 'medium' },
    { date: `${gradYear}-06-15`, label: 'Summer internship applications', category: 'internship', priority: 'medium' },
  ];
}

// ─── POST /api/timeline/profile ─────────────────────────────────
router.post('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = await verifyToken(token);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    if (!canAccess(user, 'admissions_timeline')) {
      return res.status(403).json({
        error: 'Admissions Timeline requires Pro or Elite plan.',
        _requiresUpgrade: true
      });
    }

    const { graduationYear, targetSchools, intendedMajors, state, reminderPreferences } = req.body;

    const profile = {};
    if (graduationYear) {
      const gy = parseInt(graduationYear);
      if (!Number.isFinite(gy) || gy < 2020 || gy > 2040) {
        return res.status(400).json({ error: 'Graduation year must be between 2020 and 2040.' });
      }
      profile.graduationYear = gy;
    }
    if (targetSchools) {
      if (!Array.isArray(targetSchools) || targetSchools.length > 30) {
        return res.status(400).json({ error: 'targetSchools must be an array of at most 30 entries.' });
      }
      // Sanitize each entry: only keep known safe fields
      profile.targetSchools = targetSchools.slice(0, 30).map(s => {
        if (typeof s === 'string') return { name: s.slice(0, 200) };
        if (typeof s === 'object' && s !== null) return {
          name: typeof s.name === 'string' ? s.name.slice(0, 200) : '',
          unitId: typeof s.unitId === 'number' ? s.unitId : undefined,
        };
        return null;
      }).filter(Boolean);
    }
    if (intendedMajors) {
      if (!Array.isArray(intendedMajors) || intendedMajors.length > 10) {
        return res.status(400).json({ error: 'intendedMajors must be an array of at most 10 entries.' });
      }
      profile.intendedMajors = intendedMajors
        .filter(m => typeof m === 'string')
        .slice(0, 10)
        .map(m => m.slice(0, 100));
    }
    if (state) {
      if (typeof state !== 'string' || state.length > 5) {
        return res.status(400).json({ error: 'Invalid state code.' });
      }
      profile.state = state.toUpperCase();
    }
    if (reminderPreferences) {
      if (typeof reminderPreferences !== 'object' || Array.isArray(reminderPreferences)) {
        return res.status(400).json({ error: 'Invalid reminderPreferences.' });
      }
      profile.reminderPreferences = reminderPreferences;
    }

    const result = await updateAdmissionsProfile(token, profile);
    if (result.error) return res.status(400).json(result);

    res.json(result);
  } catch (err) {
    console.error('Timeline profile error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET /api/timeline/profile ──────────────────────────────────
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = await verifyToken(token);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    res.json({
      admissionsProfile: user.admissionsProfile || null,
      hasAccess: canAccess(user, 'admissions_timeline')
    });
  } catch (err) {
    console.error('Timeline profile fetch error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET /api/timeline/events ───────────────────────────────────
router.get('/events', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = await verifyToken(token);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    if (!canAccess(user, 'admissions_timeline')) {
      return res.status(403).json({
        error: 'Admissions Timeline requires Pro or Elite plan.',
        _requiresUpgrade: true
      });
    }

    const profile = user.admissionsProfile;
    if (!profile || !profile.graduationYear) {
      return res.json({
        events: [],
        message: 'Set up your admissions profile to see your personalized timeline.',
        needsSetup: true
      });
    }

    const events = [];

    // 1. Standard milestones
    const milestones = getStandardMilestones(profile.graduationYear);
    for (const m of milestones) {
      events.push({
        id: `ms_${m.date}_${m.label.slice(0, 10)}`,
        date: m.date,
        label: m.label,
        category: m.category,
        priority: m.priority,
        source: 'standard'
      });
    }

    // 2. School-specific decision dates from database
    const decisionDates = await loadDecisionDates();
    if (decisionDates && profile.targetSchools?.length > 0) {
      for (const target of profile.targetSchools) {
        const schoolData = decisionDates.schools?.find(s =>
          s.name?.toLowerCase().includes(target.name?.toLowerCase()) ||
          s.unitId === target.unitId
        );
        if (schoolData?.dates) {
          for (const d of schoolData.dates) {
            events.push({
              id: `dd_${target.unitId || target.name}_${d.type}`,
              date: d.date,
              label: `${schoolData.name} — ${d.label || d.type}`,
              category: d.type?.includes('deadline') ? 'deadline' : 'decision',
              priority: 'high',
              source: 'decision_dates',
              school: schoolData.name
            });
          }
        }
      }
    }

    // Sort by date
    events.sort((a, b) => a.date.localeCompare(b.date));

    // Filter: show only events from 3 months ago to 18 months ahead
    const now = new Date();
    const threeMonthsAgo = new Date(now);
    threeMonthsAgo.setMonth(now.getMonth() - 3);
    const eighteenMonthsAhead = new Date(now);
    eighteenMonthsAhead.setMonth(now.getMonth() + 18);

    const filtered = events.filter(e => {
      const d = new Date(e.date);
      return d >= threeMonthsAgo && d <= eighteenMonthsAhead;
    });

    res.json({
      events: filtered,
      totalEvents: filtered.length,
      graduationYear: profile.graduationYear,
      targetSchoolCount: profile.targetSchools?.length || 0
    });
  } catch (err) {
    console.error('Timeline events error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET /api/timeline/upcoming ─────────────────────────────────
router.get('/upcoming', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = await verifyToken(token);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    if (!canAccess(user, 'admissions_timeline')) {
      return res.json({ events: [], hasAccess: false });
    }

    const profile = user.admissionsProfile;
    if (!profile || !profile.graduationYear) {
      return res.json({ events: [], needsSetup: true });
    }

    // Reuse events logic but filter to next 14 days
    const milestones = getStandardMilestones(profile.graduationYear);
    const now = new Date();
    const twoWeeks = new Date(now);
    twoWeeks.setDate(now.getDate() + 14);

    const upcoming = milestones
      .filter(m => {
        const d = new Date(m.date);
        return d >= now && d <= twoWeeks;
      })
      .map(m => ({
        date: m.date,
        label: m.label,
        category: m.category,
        priority: m.priority,
        daysUntil: Math.ceil((new Date(m.date) - now) / (1000 * 60 * 60 * 24))
      }));

    res.json({ events: upcoming, hasAccess: true });
  } catch (err) {
    console.error('Timeline upcoming error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
