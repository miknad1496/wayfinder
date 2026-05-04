// backend/routes/billing.js — patch 84
// Stripe subscription scaffold (Free → Coach → Consultant)
// Marker: REVAMP V2: BILLING SUBSCRIPTION SCAFFOLD PATCH84
//
// HOW TO ACTIVATE:
// 1. Set env vars on Render:
//    STRIPE_SECRET_KEY=sk_live_...
//    STRIPE_WEBHOOK_SECRET=whsec_...
//    STRIPE_PRICE_COACH=price_...        (your Coach monthly price ID from Stripe dashboard)
//    STRIPE_PRICE_CONSULTANT=price_...   (your Consultant monthly price ID)
//    PUBLIC_BASE_URL=https://wayfinderai.org
// 2. In Stripe dashboard, configure webhook to POST to /api/billing/webhook with events:
//    customer.subscription.created, customer.subscription.updated, customer.subscription.deleted,
//    checkout.session.completed
// 3. Buttons in frontend call POST /api/billing/checkout-session { tier: "coach" | "consultant" }
//    → returns { url } → window.location = url

import express from 'express';
import { verifyToken, setUserPlan, findUserByStripeCustomerId } from '../services/auth.js';

const router = express.Router();

let _stripe = null;
function _getStripe() {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  try {
    // Lazy import so missing dep doesn't crash boot
    const Stripe = require('stripe');
    _stripe = new Stripe(key, { apiVersion: '2024-06-20' });
    return _stripe;
  } catch (e) {
    console.warn('[billing] stripe library not installed or key missing:', e.message);
    return null;
  }
}

const TIER_PRICE_ENV = {
  coach: 'STRIPE_PRICE_COACH',
  consultant: 'STRIPE_PRICE_CONSULTANT',
};

// GET /api/billing/config — what tiers are available + whether billing is configured
router.get('/config', (req, res) => {
  const stripeReady = !!process.env.STRIPE_SECRET_KEY;
  res.json({
    enabled: stripeReady,
    tiers: {
      coach: { configured: !!process.env.STRIPE_PRICE_COACH, label: 'Coach', priceUSD: 19, period: 'mo' },
      consultant: { configured: !!process.env.STRIPE_PRICE_CONSULTANT, label: 'Consultant', priceUSD: 49, period: 'mo' },
    },
  });
});

// POST /api/billing/checkout-session — start Stripe checkout for a tier upgrade
router.post('/checkout-session', async (req, res) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth;
    const user = await verifyToken(token);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    const stripe = _getStripe();
    if (!stripe) {
      return res.status(503).json({
        error: 'Billing not yet configured. Email danielyungkim@hotmail.com to upgrade for now.',
        contactEmail: 'danielyungkim@hotmail.com',
      });
    }

    const { tier } = req.body || {};
    const priceEnv = TIER_PRICE_ENV[tier];
    if (!priceEnv) return res.status(400).json({ error: 'Unknown tier. Must be "coach" or "consultant".' });

    const priceId = process.env[priceEnv];
    if (!priceId) return res.status(503).json({ error: 'Tier not configured: ' + tier });

    const baseUrl = process.env.PUBLIC_BASE_URL || ('https://' + req.get('host'));
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: user.email,
      client_reference_id: user.id,
      metadata: { userId: user.id, tier },
      success_url: baseUrl + '/?upgrade=success&tier=' + tier,
      cancel_url: baseUrl + '/?upgrade=cancel',
      allow_promotion_codes: true,
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('[billing/checkout-session] error:', err.message);
    res.status(500).json({ error: 'Checkout failed: ' + err.message });
  }
});

// POST /api/billing/webhook — Stripe webhook to update user plan on subscription events
// MUST receive raw body (not parsed JSON) for signature verification.
// Mount in server.js with: app.use('/api/billing/webhook', express.raw({ type: 'application/json' }), webhookHandler)
router.post('/webhook', async (req, res) => {
  const stripe = _getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    console.warn('[billing/webhook] Stripe not configured — ignoring webhook');
    return res.status(200).json({ ok: true, ignored: true });
  }

  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, secret);
  } catch (err) {
    console.error('[billing/webhook] signature verify failed:', err.message);
    return res.status(400).send('Webhook Error: ' + err.message);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const s = event.data.object;
        const userId = s.client_reference_id || s.metadata?.userId;
        const tier = s.metadata?.tier;
        const customerId = s.customer;
        if (userId && tier) {
          // We resolve the user by stripeCustomerId in subsequent webhooks; persist it here.
          // setUserPlan accepts a token, but we only have userId here. Fall through — auth.js
          // persists customer id via findUserByStripeCustomerId during subscription.updated.
          console.log('[billing/webhook] checkout completed userId=' + userId + ' tier=' + tier + ' customer=' + customerId);
          // Best-effort: try to attach the customer via stripe customer email match
          // (handled in auth.js findUserByStripeCustomerId on first subscription event)
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object;
        const customerId = sub.customer;
        const status = sub.status; // active | trialing | past_due | canceled | ...
        // Determine tier by price ID
        const priceId = sub.items?.data?.[0]?.price?.id;
        let tier = null;
        if (priceId === process.env.STRIPE_PRICE_COACH) tier = 'coach';
        else if (priceId === process.env.STRIPE_PRICE_CONSULTANT) tier = 'consultant';

        if (tier && (status === 'active' || status === 'trialing')) {
          const user = await findUserByStripeCustomerId(customerId);
          if (user && user.token) {
            await setUserPlan(user.token, tier);
            console.log('[billing/webhook] upgraded user=' + user.email + ' to tier=' + tier);
          } else {
            console.warn('[billing/webhook] could not resolve user for customer=' + customerId + ' (will retry on next event)');
          }
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const user = await findUserByStripeCustomerId(sub.customer);
        if (user && user.token) {
          await setUserPlan(user.token, 'free');
          console.log('[billing/webhook] downgraded user=' + user.email + ' to free');
        }
        break;
      }
      default:
        // Ignore other events
        break;
    }
    res.json({ received: true });
  } catch (err) {
    console.error('[billing/webhook] handler error:', err.message);
    res.status(500).send('Webhook handler error');
  }
});

export default router;
