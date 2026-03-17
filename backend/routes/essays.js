/**
 * Essay Reviewer API
 *
 * Add-on service for pro/elite users. Each review costs 1 credit.
 * Credits purchased separately via Stripe one-time payment.
 *
 * - GET  /api/essays/credits     — Check remaining credits
 * - GET  /api/essays/types       — List essay types
 * - POST /api/essays/review      — Submit essay for review (costs 1 credit)
 * - GET  /api/essays/history     — Past reviews
 * - GET  /api/essays/review/:id  — Get specific review
 */

import { Router } from 'express';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomBytes } from 'crypto';
import { verifyToken, useEssayCredit, canAccess, findUserByToken } from '../services/auth.js';
import { reviewEssay, getEssayTypes } from '../services/essay-reviewer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REVIEWS_DIR = join(__dirname, '..', 'data', 'essay-reviews');

const router = Router();

// Ensure reviews directory exists
async function ensureDir() {
  await fs.mkdir(REVIEWS_DIR, { recursive: true });
}

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

    // Deduct 1 credit
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
      // Refund the credit on failure (best-effort)
      // TODO: implement credit refund
      return res.status(500).json({ error: 'Review failed. Your credit was not deducted.', details: result.error });
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

    await fs.writeFile(
      join(REVIEWS_DIR, `${reviewId}.json`),
      JSON.stringify(reviewRecord, null, 2)
    );

    res.json({
      id: reviewId,
      review: result.review,
      creditsRemaining: creditResult.remaining,
      tokensUsed: result.tokensUsed
    });
  } catch (err) {
    console.error('Essay review error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET /api/essays/history ───────────────────────────────────
router.get('/history', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = await verifyToken(token);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    await ensureDir();
    const files = await fs.readdir(REVIEWS_DIR);
    const reviews = [];

    for (const file of files.filter(f => f.endsWith('.json'))) {
      try {
        const raw = await fs.readFile(join(REVIEWS_DIR, file), 'utf-8');
        const review = JSON.parse(raw);
        if (review.userId === user.id) {
          reviews.push({
            id: review.id,
            essayType: review.essayType,
            targetSchool: review.targetSchool,
            wordCount: review.wordCount,
            score: review.review?.overallScore,
            scoreLabel: review.review?.scoreLabel,
            createdAt: review.createdAt
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

// ─── GET /api/essays/review/:id ────────────────────────────────
router.get('/review/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = await verifyToken(token);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    await ensureDir();
    const filePath = join(REVIEWS_DIR, `${req.params.id}.json`);

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
