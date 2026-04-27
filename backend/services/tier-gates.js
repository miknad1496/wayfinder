/* === REVAMP V2: TIER-GATES MODULE === */
// Free-tier tease utilities — quota tracking + field/output abridgement +
// David coach prompt prefixing. In-memory quota counters (reset on deploy)
// for v1 simplicity; can be made persistent later by storing on user JSON.

import { verifyToken } from './auth.js';

const usageMap = new Map(); // userKey → { k8PlanMonth, k8PlanCount, k8AskDay, k8AskCount }

const FREE_LIMITS = {
  k8PlansPerMonth: 1,
  k8AsksPerDay: 3,
  k8AskWordCap: 150,
};

/** Pull the authenticated user from req.headers.authorization (Bearer JWT). */
export async function getUserFromReq(req) {
  const auth = (req && req.headers && req.headers.authorization) || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return null;
  try {
    const result = await verifyToken(token);
    return (result && result.user) || null;
  } catch (_) {
    return null;
  }
}

/** True when the request is anonymous OR plan === 'free'. Admin/VIP are not free. */
export async function isFreeUser(req) {
  const user = await getUserFromReq(req);
  if (!user) return true;                         // anonymous = treat as free
  if (user.isAdmin) return false;                 // admin always full
  return (user.plan || 'free') === 'free';
}

/**
 * Check + consume a monthly/daily quota for a kind ('k8plan' | 'k8ask').
 * Returns { allowed, reason, message, remaining }.
 * Pro/Elite/admin always allowed (returns { allowed:true } without consumption).
 * Anonymous users are blocked with reason='auth-required'.
 */
export async function checkAndConsumeQuota(req, kind) {
  const user = await getUserFromReq(req);
  if (!user) {
    return {
      allowed: false,
      reason: 'auth-required',
      message: 'Sign in to use this feature. Free users get 1 plan/month + 3 questions/day.',
    };
  }
  if (user.isAdmin || (user.plan && user.plan !== 'free')) {
    return { allowed: true, remaining: null }; // unlimited
  }

  const userKey = user.id || user.email;
  let entry = usageMap.get(userKey);
  if (!entry) { entry = {}; usageMap.set(userKey, entry); }

  const now = new Date();
  const monthKey = now.toISOString().slice(0, 7);
  const dayKey = now.toISOString().slice(0, 10);

  if (kind === 'k8plan') {
    if (entry.k8PlanMonth !== monthKey) { entry.k8PlanMonth = monthKey; entry.k8PlanCount = 0; }
    if (entry.k8PlanCount >= FREE_LIMITS.k8PlansPerMonth) {
      return {
        allowed: false,
        reason: 'monthly-quota',
        message: 'You\'ve used your 1 free plan this month. Upgrade to Pro ($25/mo) for unlimited plans + full output (calibration insight, all specialty picks, scholarship guidance).',
        remaining: 0,
      };
    }
    entry.k8PlanCount++;
    return { allowed: true, remaining: FREE_LIMITS.k8PlansPerMonth - entry.k8PlanCount };
  }
  if (kind === 'k8ask') {
    if (entry.k8AskDay !== dayKey) { entry.k8AskDay = dayKey; entry.k8AskCount = 0; }
    if (entry.k8AskCount >= FREE_LIMITS.k8AsksPerDay) {
      return {
        allowed: false,
        reason: 'daily-quota',
        message: 'You\'ve used your 3 free questions today. Upgrade to Pro for unlimited Q&A + longer responses (250-400 words).',
        remaining: 0,
      };
    }
    entry.k8AskCount++;
    return { allowed: true, remaining: FREE_LIMITS.k8AsksPerDay - entry.k8AskCount };
  }
  return { allowed: true };
}

/** Strip session-level fields + truncate scheduleNotes for free users (browse cards). */
export function abridgeBrowseFields(item, isFree) {
  if (!isFree) return item;
  const notes = item.scheduleNotes;
  return {
    ...item,
    sessions: [],
    _scheduleSource: null,
    _scheduleVerifiedDate: null,
    registrationOpens: null,
    scheduleNotes: notes
      ? (notes.length > 80
          ? notes.slice(0, 80) + '… [🔒 Pro: full schedule + scholarship + reg details]'
          : notes)
      : null,
    _teased: true,
  };
}

/** Abridge K-8 plan output + drop calibration callout for free. */
export function abridgeK8Plan(plan, calibrationInsight, isFree) {
  if (!isFree) return { plan: plan || {}, calibrationInsight: calibrationInsight || '' };
  const p = plan || {};
  const abridged = {
    summary: p.summary || '',
    anchorRecommendation: p.anchorRecommendation || null,
    specialtyRecommendations: Array.isArray(p.specialtyRecommendations)
      ? p.specialtyRecommendations.slice(0, 1).map(s => ({
          category: s.category,
          rationale: s.rationale
            ? (s.rationale.length > 120 ? s.rationale.slice(0, 120) + '… [🔒 Pro: full reasoning]' : s.rationale)
            : '',
          lookFor: Array.isArray(s.lookFor) ? s.lookFor.slice(0, 1) : [],
          estimatedCost: s.estimatedCost || '',
        }))
      : [],
    wildcardSuggestion: p.wildcardSuggestion
      ? { idea: '🔒 Pro: see your wildcard suggestion', rationale: '' }
      : null,
    scholarshipNote: '🔒 Pro: specific scholarship pathways for your budget level (under-applied state + regional pools, employer FSA + dependent care benefits, demographic-targeted aid)',
    watchOuts: Array.isArray(p.watchOuts) ? p.watchOuts.slice(0, 1) : [],
    nextStep: p.nextStep || '',
    _teased: true,
    _upgradeMessage: 'Free tier: 1 plan/month + abridged output. Upgrade to Pro ($25/mo) for unlimited plans, full specialty picks (3-4 instead of 1), 2026 calibration insight callout, full scholarship guidance, wildcard suggestions, and Print/Email/Copy export.',
  };
  return { plan: abridged, calibrationInsight: '' };
}

/** Cap free-tier ask response at ~150 words + add upgrade footer. */
export function truncateAskResponse(text, isFree) {
  if (!isFree || !text) return text;
  const words = String(text).split(/\s+/);
  if (words.length <= FREE_LIMITS.k8AskWordCap) return text;
  const cut = words.slice(0, FREE_LIMITS.k8AskWordCap).join(' ');
  return cut + '…\n\n🔒 Pro users see full responses (typically 250-400 words) with specific 2026 dates + named programs + scholarship lookups. Upgrade for unlimited questions.';
}

/** Filter insights sections for free tier — hide _aiContext + cap at 5. */
export function filterInsightsForTier(sections, isFree) {
  const arr = Array.isArray(sections) ? sections : [];
  if (!isFree) return arr;
  const userSections = arr.filter(s => !s || !s._aiContext).slice(0, 5);
  const hiddenCount = arr.length - userSections.length;
  if (hiddenCount > 0) {
    userSections.push({
      id: 'pro-upgrade-tease',
      title: '🔒 ' + hiddenCount + ' more sections (Pro)',
      icon: '🔓',
      _teased: true,
      items: [
        {
          label: 'What you\'re missing on Pro',
          detail: 'WA Spotlight (neighborhood-level intelligence on Seattle/Eastside/Islands/etc), Regional Summer Windows 2026, Registration Timing Anchors, Pricing Tiers K-8, K-8 → HS Bridge Intelligence, WA Registration Calendar 2026, Equity-Focused Funding Landscape, HS College-App Program Intelligence — the deep calibration that powers specific, dated, family-actionable answers in /plan and /ask.',
        },
      ],
    });
  }
  return userSections;
}

/**
 * Tier-aware system-prompt prefix for David coach. For free users, asks David
 * to ANNOUNCE upfront that he's in general-advice mode so the user understands
 * the ceiling is higher in Pro — David is NOT actually less capable on free,
 * he's deliberately holding back depth.
 */
export function tierAwareDavidPromptPrefix(isFree) {
  if (!isFree) return '';
  return `[TIER NOTE — internal, do not echo verbatim: this user is on the FREE tier. You are still David — warm, sharp, the most thoughtful K-12 advisor anyone could ask for. Your full ability is much deeper than what this user currently has access to.

When they ask something that calls for specific intelligence (named program guidance, 2026 deadlines, scholarship lookups, equity-funding details, regional anchors, college admissions calculus, etc.), do this gracefully:
  1. Give a real, useful general framing in 2-3 sentences. Don't refuse, don't be cold.
  2. ONCE per conversation (typically your FIRST substantive answer), warmly note: "I'm in general advice mode for free users right now — Pro unlocks my full intelligence with specific 2026 dates, named program guidance, and the deeper calibration data."
  3. After that first announce, just gently signpost: "(more specific Pro-level picks available)" at the end of relevant answers, without repeating the full disclaimer.

Be the warm friend who'd do more if the account allowed. NEVER be dismissive. NEVER suggest they can't get value here.]

`;
}

export const _FREE_LIMITS = FREE_LIMITS;
