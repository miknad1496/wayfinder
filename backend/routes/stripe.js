import { Router } from 'express';
import Stripe from 'stripe';
import rateLimit from 'express-rate-limit';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { verifyToken, updateUserPlan, findUserByStripeCustomerId, findUserByToken } from '../services/auth.js';

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
const PRICE_IDS = {
  premium: process.env.STRIPE_PRICE_PREMIUM || null,
  pro: process.env.STRIPE_PRICE_PRO || null
};

/**
 * POST /api/stripe/create-checkout
 * Creates a Stripe Checkout session for upgrading to premium or pro
 */
router.post('/create-checkout', checkoutLimiter, async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = await verifyToken(token);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    const { plan } = req.body;
    if (!plan || !['premium', 'pro'].includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    const priceId = PRICE_IDS[plan];
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
      // Save Stripe customer ID to user
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
 * POST /api/stripe/webhook
 * Handles Stripe webhooks for subscription events
 */
router.post('/webhook', webhookLimiter, async (req, res) => {
  const stripe = getStripe();
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    if (webhookSecret) {
      // PRODUCTION: Verify webhook signature — this is critical
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else if (process.env.NODE_ENV !== 'production') {
      // DEVELOPMENT ONLY: Allow unsigned events for local testing
      console.warn('⚠️  Webhook signature verification SKIPPED (dev mode only)');
      event = JSON.parse(req.body.toString());
    } else {
      // PRODUCTION without webhook secret = REJECT
      console.error('🚫 STRIPE_WEBHOOK_SECRET not set in production — rejecting webhook');
      await auditLog('webhook_rejected', { reason: 'Missing webhook secret in production' });
      return res.status(500).send('Webhook secret not configured');
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    await auditLog('webhook_sig_failed', { error: err.message, ip: req.ip });
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Idempotency check — prevent double-processing
  if (event.id && processedEvents.has(event.id)) {
    console.log(`ℹ️ Skipping already-processed event: ${event.id}`);
    return res.json({ received: true, duplicate: true });
  }

  // Validate event structure
  if (!event.type || !event.data?.object) {
    await auditLog('webhook_malformed', { eventId: event.id });
    return res.status(400).send('Malformed event');
  }

  // Only process events we expect
  const ALLOWED_EVENTS = [
    'checkout.session.completed',
    'customer.subscription.updated',
    'customer.subscription.deleted',
    'invoice.payment_failed'
  ];

  if (!ALLOWED_EVENTS.includes(event.type)) {
    // Silently acknowledge events we don't handle
    return res.json({ received: true });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const plan = session.metadata?.plan;
        const customerId = session.customer;

        // Validate plan value
        if (!plan || !['premium', 'pro'].includes(plan)) {
          await auditLog('webhook_invalid_plan', { plan, customerId, eventId: event.id });
          break;
        }

        if (customerId) {
          const user = await findUserByStripeCustomerId(customerId);
          if (user) {
            await updateUserPlan(user.token, {
              plan: plan,
              stripeCustomerId: customerId,
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
          const plan = subscription.metadata?.plan || 'premium';
          if (!['premium', 'pro'].includes(plan)) break;
          const user = await findUserByStripeCustomerId(customerId);
          if (user) {
            await updateUserPlan(user.token, { plan });
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
          await updateUserPlan(user.token, { plan: 'free', planExpiresAt: null });
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

    // Mark as processed (idempotency)
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
  const configured = !!(process.env.STRIPE_SECRET_KEY && PRICE_IDS.premium && PRICE_IDS.pro);
  res.json({ configured });
});

export default router;
