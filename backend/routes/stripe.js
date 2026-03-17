import { Router } from 'express';
import Stripe from 'stripe';
import rateLimit from 'express-rate-limit';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { verifyToken, updateUserPlan, findUserByStripeCustomerId, findUserByToken, addEssayCredits } from '../services/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();

// ---- Rate limiters for payment endpoints ----
const checkoutLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // 5 checkout attempts per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many checkout requests. Please wait a moment.' }
});

const portalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please wait a moment.' }
});

const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60, // Stripe can send bursts of webhooks
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many webhook requests.' }
});

// ---- Idempotency: track processed webhook event IDs ----
const processedEvents = new Set();
const MAX_PROCESSED_EVENTS = 10000;

function markEventProcessed(eventId) {
  processedEvents.add(eventId);
  // Prevent memory leak — trim oldest entries
  if (processedEvents.size > MAX_PROCESSED_EVENTS) {
    const entries = Array.from(processedEvents);
    for (let i = 0; i < entries.length - MAX_PROCESSED_EVENTS / 2; i++) {
      processedEvents.delete(entries[i]);
    }
  }
}

// ---- Audit logging for payment events ----
const AUDIT_DIR = join(__dirname, '..', 'data', 'audit');

async function auditLog(event, details) {
  try {
    await fs.mkdir(AUDIT_DIR, { recursive: true });
    const entry = {
      timestamp: new Date().toISOString(),
      event,
      ...details
    };
    const filename = `${new Date().toISOString().slice(0, 10)}-stripe.log`;
    await fs.appendFile(
      join(AUDIT_DIR, filename),
      JSON.stringify(entry) + '\n'
    );
  } catch (err) {
    console.error('Audit log write failed:', err.message);
  }
}

// Initialize Stripe — requires STRIPE_SECRET_KEY in env
function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY not configured');
  return new Stripe(key);
}

// Price IDs from Stripe Dashboard — set these in .env
// Subscription plans
const PLAN_PRICE_IDS = {
  pro: process.env.STRIPE_PRICE_PRO || null,
  elite: process.env.STRIPE_PRICE_ELITE || null
};

// Essay review credit packs (one-time purchases)
const ESSAY_PRICE_IDS = {
  starter:  process.env.STRIPE_PRICE_ESSAY_5 || null,   // 5 reviews = $10
  standard: process.env.STRIPE_PRICE_ESSAY_10 || null,   // 10 reviews = $15
  bulk:     process.env.STRIPE_PRICE_ESSAY_20 || null,   // 20 reviews = $18
};

const ESSAY_PACK_SIZES = { starter: 5, standard: 10, bulk: 20 };

// Legacy support: map old premium plan to pro
function normalizePlan(plan) {
  if (plan === 'premium') return 'pro';
  return plan;
}

/**
 * POST /api/stripe/create-checkout
 * Creates a Stripe Checkout session for upgrading to pro or elite
 */
router.post('/create-checkout', checkoutLimiter, async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = await verifyToken(token);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    const { plan } = req.body;
    if (!plan || !['pro', 'elite'].includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan. Choose pro or elite.' });
    }

    const priceId = PLAN_PRICE_IDS[plan];
    if (!priceId) {
      return res.status(500).json({ error: 'Stripe prices not configured. Contact support.' });
    }

    const stripe = getStripe();

    // Get or create Stripe customer
    const fullUser = await findUserByToken(token);
    let customerId = fullUser?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { wayfinderId: user.id }
      });
      customerId = customer.id;
      await updateUserPlan(token, { stripeCustomerId: customerId });
    }

    // Create checkout session
    const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}?upgrade=success&plan=${plan}`,
      cancel_url: `${baseUrl}?upgrade=cancelled`,
      metadata: {
        wayfinderId: user.id,
        plan: plan
      },
      subscription_data: {
        metadata: {
          wayfinderId: user.id,
          plan: plan
        }
      }
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

/**
 * POST /api/stripe/purchase-essays
 * Creates a Stripe Checkout session for one-time essay credit purchase
 */
router.post('/purchase-essays', checkoutLimiter, async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = await verifyToken(token);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    // Essay reviewer requires pro or elite plan
    if (!['pro', 'elite'].includes(user.plan)) {
      return res.status(403).json({ error: 'Essay reviewer requires an Admissions Coach plan.' });
    }

    const { pack } = req.body;
    if (!pack || !ESSAY_PRICE_IDS[pack]) {
      return res.status(400).json({ error: 'Invalid pack. Choose starter (5/$10), standard (10/$15), or bulk (20/$18).' });
    }

    const priceId = ESSAY_PRICE_IDS[pack];
    if (!priceId) {
      return res.status(500).json({ error: 'Essay pricing not configured. Contact support.' });
    }

    const stripe = getStripe();

    // Get or create Stripe customer
    const fullUser = await findUserByToken(token);
    let customerId = fullUser?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { wayfinderId: user.id }
      });
      customerId = customer.id;
      await updateUserPlan(token, { stripeCustomerId: customerId });
    }

    const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}?essay_purchase=success&pack=${pack}`,
      cancel_url: `${baseUrl}?essay_purchase=cancelled`,
      metadata: {
        wayfinderId: user.id,
        type: 'essay_credits',
        pack: pack,
        quantity: String(ESSAY_PACK_SIZES[pack])
      }
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Essay purchase error:', err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

/**
 * POST /api/stripe/webhook
 * Handles Stripe webhooks for subscription + one-time payment events
 */
router.post('/webhook', webhookLimiter, async (req, res) => {
  const stripe = getStripe();
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else if (process.env.NODE_ENV !== 'production') {
      console.warn('⚠️  Webhook signature verification SKIPPED (dev mode only)');
      event = JSON.parse(req.body.toString());
    } else {
      console.error('🚫 STRIPE_WEBHOOK_SECRET not set in production — rejecting webhook');
      await auditLog('webhook_rejected', { reason: 'Missing webhook secret in production' });
      return res.status(500).send('Webhook secret not configured');
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    await auditLog('webhook_sig_failed', { error: err.message, ip: req.ip });
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Idempotency check
  if (event.id && processedEvents.has(event.id)) {
    console.log(`ℹ️ Skipping already-processed event: ${event.id}`);
    return res.json({ received: true, duplicate: true });
  }

  if (!event.type || !event.data?.object) {
    await auditLog('webhook_malformed', { eventId: event.id });
    return res.status(400).send('Malformed event');
  }

  const ALLOWED_EVENTS = [
    'checkout.session.completed',
    'customer.subscription.updated',
    'customer.subscription.deleted',
    'invoice.payment_failed'
  ];

  if (!ALLOWED_EVENTS.includes(event.type)) {
    return res.json({ received: true });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const customerId = session.customer;

        // Check if this is an essay credit purchase (one-time payment)
        if (session.metadata?.type === 'essay_credits') {
          const pack = session.metadata.pack;
          const quantity = parseInt(session.metadata.quantity) || ESSAY_PACK_SIZES[pack] || 0;
          const paymentIntent = session.payment_intent;

          if (customerId && quantity > 0) {
            const result = await addEssayCredits(customerId, pack, quantity, paymentIntent);
            if (result.success) {
              await auditLog('essay_credits_added', {
                customerId, pack, quantity, paymentIntent, eventId: event.id
              });
              console.log(`✅ Added ${quantity} essay credits for customer ${customerId}`);
            }
          }
          break;
        }

        // Otherwise it's a subscription checkout
        let plan = normalizePlan(session.metadata?.plan);
        if (!plan || !['pro', 'elite'].includes(plan)) {
          await auditLog('webhook_invalid_plan', { plan, customerId, eventId: event.id });
          break;
        }

        if (customerId) {
          const user = await findUserByStripeCustomerId(customerId);
          if (user) {
            await updateUserPlan(user.token, {
              plan: plan,
              stripeCustomerId: customerId,
              stripeSubscriptionId: session.subscription || null,
              planExpiresAt: null
            });
            await auditLog('plan_upgrade', { email: user.email, plan, customerId, eventId: event.id });
            console.log(`✅ User ${user.email} upgraded to ${plan}`);
          } else {
            await auditLog('webhook_user_not_found', { customerId, eventId: event.id });
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        if (subscription.status === 'active') {
          let plan = normalizePlan(subscription.metadata?.plan);
          if (!['pro', 'elite'].includes(plan)) break;
          const user = await findUserByStripeCustomerId(customerId);
          if (user) {
            await updateUserPlan(user.token, { plan, stripeSubscriptionId: subscription.id });
            await auditLog('subscription_updated', { email: user.email, plan, eventId: event.id });
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        const user = await findUserByStripeCustomerId(customerId);
        if (user) {
          await updateUserPlan(user.token, { plan: 'free', planExpiresAt: null, stripeSubscriptionId: null });
          await auditLog('plan_downgrade', { email: user.email, reason: 'subscription_deleted', eventId: event.id });
          console.log(`⬇️ User ${user.email} downgraded to free (subscription ended)`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        const user = await findUserByStripeCustomerId(customerId);
        if (user) {
          await auditLog('payment_failed', { email: user.email, customerId, eventId: event.id });
          console.warn(`⚠️ Payment failed for ${user.email}`);
        }
        break;
      }
    }

    if (event.id) markEventProcessed(event.id);

  } catch (err) {
    console.error('Webhook processing error:', err);
    await auditLog('webhook_error', { error: err.message, eventId: event.id });
  }

  res.json({ received: true });
});

/**
 * POST /api/stripe/portal
 * Creates a Stripe Customer Portal session for managing subscription
 */
router.post('/portal', portalLimiter, async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const fullUser = await findUserByToken(token);
    if (!fullUser) return res.status(401).json({ error: 'Not authenticated' });

    if (!fullUser.stripeCustomerId) {
      return res.status(400).json({ error: 'No subscription found' });
    }

    const stripe = getStripe();
    const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;

    const session = await stripe.billingPortal.sessions.create({
      customer: fullUser.stripeCustomerId,
      return_url: baseUrl
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Portal error:', err);
    res.status(500).json({ error: 'Failed to open billing portal' });
  }
});

/**
 * GET /api/stripe/status
 * Check if Stripe is configured (for frontend to show/hide payment buttons)
 */
router.get('/status', (req, res) => {
  const configured = !!(process.env.STRIPE_SECRET_KEY && (PLAN_PRICE_IDS.pro || PLAN_PRICE_IDS.elite));
  res.json({
    configured,
    plans: {
      pro: !!PLAN_PRICE_IDS.pro,
      elite: !!PLAN_PRICE_IDS.elite,
    },
    essayPacks: {
      starter: !!ESSAY_PRICE_IDS.starter,
      standard: !!ESSAY_PRICE_IDS.standard,
      bulk: !!ESSAY_PRICE_IDS.bulk,
    }
  });
});

export default router;
