/**
 * Essay Reviewer API
 *
 * Add-on service for pro/elite users. Each review costs 1 credit.
 * Credits purchased separately via Stripe one-time payment.
 *
 * - GET  /api/essays/credits         — Check remaining credits
 * - GET  /api/essays/types           — List essay types
 * - GET  /api/essays/prompts         — Prompt database (Common App, UC, Coalition, Supplements)
 * - POST /api/essays/review          — Submit essay for review (costs 1 credit)
 * - GET  /api/essays/history         — Past reviews (with optional ?essayType filter)
 * - GET  /api/essays/drafts/:type    — All reviews for essay type (for score progression)
 * - GET  /api/essays/review/:id      — Get specific review (full data)
 */

import { Router } from 'express';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomBytes } from 'crypto';
import { verifyToken, useEssayCredit, refundEssayCredit, canAccess } from '../services/auth.js';
import { reviewEssay, getEssayTypes } from '../services/essay-reviewer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REVIEWS_DIR = join(__dirname, '..', 'data', 'essay-reviews');

const router = Router();

/**
 * Sanitize a review ID to prevent path traversal attacks.
 * Only allows alphanumeric characters, hyphens, and underscores.
 */
function sanitizeReviewId(id) {
  if (!id || typeof id !== 'string') return null;
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) return null;
  if (id.length > 128) return null;
  return id;
}

// Ensure reviews directory exists
async function ensureDir() {
  await fs.mkdir(REVIEWS_DIR, { recursive: true });
}

// ─── GET /api/essays/prompts ───────────────────────────────────
// Public endpoint — no auth required, returns prompt database
router.get('/prompts', (req, res) => {
  const promptDatabase = {
    commonApp2025: {
      label: 'Common App 2025-26',
      prompts: [
        { id: 'ca1', text: 'Some students have a background, identity, interest, or talent that is so meaningful they believe their application would be incomplete without it. If this sounds like you, then please share your story.' },
        { id: 'ca2', text: 'The lessons we take from obstacles we encounter can be fundamental to later success. Recount a time when you faced a challenge, setback, or failure. How did it affect you, and what did you learn from the experience?' },
        { id: 'ca3', text: 'Reflect on a time when you questioned or challenged a belief or idea. What prompted your thinking? What was the outcome?' },
        { id: 'ca4', text: 'Reflect on something that someone has done for you that has made you happy or thankful in a surprising way. How has this gratitude affected or motivated you?' },
        { id: 'ca5', text: 'Discuss an accomplishment, event, or realization that sparked a period of personal growth and a new understanding of yourself or others.' },
        { id: 'ca6', text: 'Describe a topic, idea, or concept you find so engaging that it makes you lose all track of time. Why does it captivate you? What or who do you turn to when you want to learn more?' },
        { id: 'ca7', text: 'Share an essay on any topic of your choice. It can be one you\'ve already written, one that responds to a different prompt, or one of your own design.' }
      ]
    },
    ucPIQ: {
      label: 'UC Personal Insight Questions',
      prompts: [
        { id: 'uc1', text: 'Describe an example of your leadership experience in which you have positively influenced others, helped resolve disputes or contributed to group efforts over time.' },
        { id: 'uc2', text: 'Every person has a creative side, and it can be expressed in many ways: problem solving, original and innovative thinking, and artistically, to name a few. Describe how you express your creative side.' },
        { id: 'uc3', text: 'What would you say is your greatest talent or skill? How have you developed and demonstrated that talent over time?' },
        { id: 'uc4', text: 'Describe how you have taken advantage of a significant educational opportunity or worked to overcome an educational barrier you have faced.' },
        { id: 'uc5', text: 'Describe the most significant challenge you have faced and the steps you have taken to overcome this challenge. How has this challenge affected your academic achievement?' },
        { id: 'uc6', text: 'Think about an academic subject that inspires you. Describe how you have furthered this interest inside and/or outside of the classroom.' },
        { id: 'uc7', text: 'What have you done to make your school or your community a better place?' },
        { id: 'uc8', text: 'Beyond what has already been shared in your application, what do you believe makes you a strong candidate for admissions to the University of California?' }
      ]
    },
    coalition: {
      label: 'Coalition App',
      prompts: [
        { id: 'coal1', text: 'Tell a story from your life, describing an experience that either demonstrates your character or helped to shape it.' },
        { id: 'coal2', text: 'What interests or excites you? How does it shape who you are now or who you might become in the future?' },
        { id: 'coal3', text: 'Describe a time when you had a positive impact on others. What were the challenges? What were the rewards?' },
        { id: 'coal4', text: 'Has there been a time when an idea or belief of yours was questioned? How did you respond? What did you learn?' },
        { id: 'coal5', text: 'What is the hardest part of being a student now? What\'s the best part? What advice would you give a younger sibling or friend (assuming they would listen to you)?' }
      ]
    },
    supplements: {
      label: 'Popular Supplements',
      prompts: [
        { id: 'sup-why', text: 'Why are you interested in [school name]? (Generic Why School)' },
        { id: 'sup-community', text: 'How will you contribute to our campus community?' },
        { id: 'sup-diversity', text: 'Describe an aspect of your identity, background, or experience that has shaped your perspective.' },
        { id: 'sup-activity', text: 'Please briefly elaborate on one of your extracurricular activities or work experiences.' },
        { id: 'sup-intellectual', text: 'Describe an intellectual experience or idea that has been important to your development.' },
        { id: 'sup-roommate', text: 'What would your future roommate find most surprising about you?' },
        { id: 'sup-letter', text: 'Write a letter to your future college roommate.' }
      ]
    }
  };
  res.json(promptDatabase);
});

// ─── GET /api/essays/types ─────────────────────────────────────
router.get('/types', (req, res) => {
  res.json({ types: getEssayTypes() });
});

// ─── GET /api/essays/credits ───────────────────────────────────
router.get('/credits', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = await verifyToken(token);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    if (!canAccess(user, 'essay_reviewer')) {
      return res.json({
        credits: 0,
        available: false,
        message: 'Essay reviewer requires an Admissions Coach Pro or Elite plan.'
      });
    }

    res.json({
      credits: user.essayReviewsRemaining || 0,
      available: true,
      packs: [
        { id: 'starter',  reviews: 5,  price: '$10', perReview: '$2.00' },
        { id: 'standard', reviews: 10, price: '$15', perReview: '$1.50' },
        { id: 'bulk',     reviews: 20, price: '$18', perReview: '$0.90' },
      ]
    });
  } catch (err) {
    console.error('Essay credits error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── POST /api/essays/review ───────────────────────────────────
router.post('/review', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = await verifyToken(token);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    if (!canAccess(user, 'essay_reviewer')) {
      return res.status(403).json({
        error: 'Essay reviewer requires an Admissions Coach Pro or Elite plan.',
        _requiresUpgrade: true
      });
    }

    const { essayText, essayType, targetSchool, prompt } = req.body;

    if (!essayText || essayText.trim().length < 50) {
      return res.status(400).json({ error: 'Essay must be at least 50 characters.' });
    }

    if (essayText.length > 15000) {
      return res.status(400).json({ error: 'Essay too long. Maximum 15,000 characters (~3,000 words).' });
    }

    // Deduct 1 credit (essays are credit-gated, not daily-limit-gated)
    const creditResult = await useEssayCredit(token);
    if (!creditResult.allowed) {
      return res.status(402).json({
        error: 'No essay review credits remaining. Purchase more to continue.',
        creditsRemaining: 0,
        _requiresPurchase: true
      });
    }

    // Run the review
    const result = await reviewEssay(essayText, essayType, targetSchool, prompt);

    if (!result.success) {
      // Refund the credit on failure
      const refund = await refundEssayCredit(token);
      console.warn(`Essay review failed for user ${user.id}. Credit refunded.`, result.error);
      return res.status(500).json({
        error: 'Review failed. Your credit has been refunded.',
        details: result.error,
        creditsRemaining: refund.remaining
      });
    }

    // Check if review has a valid overall score (ensure the review is usable)
    if (!result.review || typeof result.review.overallScore !== 'number') {
      // Invalid review structure - refund the credit
      const refund = await refundEssayCredit(token);
      console.warn(`Essay review produced invalid structure for user ${user.id}. Credit refunded.`);
      return res.status(500).json({
        error: 'Review generated invalid data. Your credit has been refunded.',
        creditsRemaining: refund.remaining
      });
    }

    // Save review to disk
    await ensureDir();
    const reviewId = `rev_${randomBytes(8).toString('hex')}`;
    const reviewRecord = {
      id: reviewId,
      userId: user.id,
      essayType: essayType || 'other',
      targetSchool: targetSchool || null,
      wordCount: essayText.split(/\s+/).length,
      review: result.review,
      createdAt: new Date().toISOString()
    };

    // Atomic write: temp file then rename to prevent corruption on crash
    const reviewPath = join(REVIEWS_DIR, `${reviewId}.json`);
    const tmpPath = reviewPath + '.tmp';
    await fs.writeFile(tmpPath, JSON.stringify(reviewRecord, null, 2));
    await fs.rename(tmpPath, reviewPath);

    res.json({
      id: reviewId,
      review: result.review,
      creditsRemaining: creditResult.remaining,
      tokensUsed: result.tokensUsed
    });
  } catch (err) {
    console.error('Essay review error:', err);
    // Try to refund the credit even if something went wrong
    try {
      const tok = req.headers.authorization?.replace('Bearer ', '');
      if (tok) {
        const refund = await refundEssayCredit(tok);
        return res.status(500).json({
          error: 'Internal server error. Your credit has been refunded.',
          creditsRemaining: refund.remaining
        });
      }
    } catch (refundErr) {
      console.error('Failed to refund credit after error:', refundErr);
    }
    return res.status(500).json({
      error: 'Internal server error. Please contact support if credit was not refunded.',
      supportNote: 'Credit refund may have failed'
    });
  }
});

// ─── GET /api/essays/history ───────────────────────────────────
router.get('/history', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = await verifyToken(token);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    const essayTypeFilter = req.query.essayType;

    await ensureDir();
    const files = await fs.readdir(REVIEWS_DIR);
    const reviews = [];

    for (const file of files.filter(f => f.endsWith('.json'))) {
      try {
        const raw = await fs.readFile(join(REVIEWS_DIR, file), 'utf-8');
        const review = JSON.parse(raw);
        if (review.userId === user.id) {
          if (essayTypeFilter && review.essayType !== essayTypeFilter) {
            continue;
          }
          reviews.push({
            id: review.id,
            essayType: review.essayType,
            targetSchool: review.targetSchool,
            wordCount: review.wordCount,
            score: review.review?.overallScore,
            scoreLabel: review.review?.scoreLabel,
            createdAt: review.createdAt,
            summary: review.review?.summary
          });
        }
      } catch {
        // Skip corrupt files
      }
    }

    reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ reviews });
  } catch (err) {
    console.error('Essay history error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET /api/essays/drafts/:essayType ────────────────────────────
// Returns all reviews for a specific essay type, sorted chronologically (oldest first)
// Used for score progression tracking
router.get('/drafts/:essayType', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = await verifyToken(token);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    const essayType = req.params.essayType;

    await ensureDir();
    const files = await fs.readdir(REVIEWS_DIR);
    const drafts = [];

    for (const file of files.filter(f => f.endsWith('.json'))) {
      try {
        const raw = await fs.readFile(join(REVIEWS_DIR, file), 'utf-8');
        const review = JSON.parse(raw);
        if (review.userId === user.id && review.essayType === essayType) {
          drafts.push({
            id: review.id,
            essayType: review.essayType,
            targetSchool: review.targetSchool,
            overallScore: review.review?.overallScore,
            scoreLabel: review.review?.scoreLabel,
            wordCount: review.wordCount,
            createdAt: review.createdAt,
            summary: review.review?.summary
          });
        }
      } catch {
        // Skip corrupt files
      }
    }

    drafts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    res.json({ drafts });
  } catch (err) {
    console.error('Essay drafts error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET /api/essays/review/:id ────────────────────────────────
router.get('/review/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = await verifyToken(token);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    await ensureDir();
    const safeId = sanitizeReviewId(req.params.id);
    if (!safeId) {
      return res.status(400).json({ error: 'Invalid review ID' });
    }
    const filePath = join(REVIEWS_DIR, `${safeId}.json`);

    try {
      const raw = await fs.readFile(filePath, 'utf-8');
      const review = JSON.parse(raw);

      if (review.userId !== user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json(review);
    } catch {
      return res.status(404).json({ error: 'Review not found' });
    }
  } catch (err) {
    console.error('Essay review fetch error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
