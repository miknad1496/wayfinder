import { Router } from 'express';
import Stripe from 'stripe';
import { verifyToken, updateUserPlan, findUserByStripeCustomerId, findUserByToken } from '../services/auth.js';

const router = Router();

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
router.post('/create-checkout', async (req, res) => {
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
router.post('/webhook', async (req, res) => {
  const stripe = getStripe();
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      // In development without webhook signing
      event = JSON.parse(req.body.toString());
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const plan = session.metadata?.plan;
        const wayfinderId = session.metadata?.wayfinderId;
        const customerId = session.customer;

        if (plan && customerId) {
          const user = await findUserByStripeCustomerId(customerId);
          if (user) {
            await updateUserPlan(user.token, {
              plan: plan,
              stripeCustomerId: customerId,
              planExpiresAt: null // subscription is ongoing
            });
            console.log(`✅ User ${user.email} upgraded to ${plan}`);
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        if (subscription.status === 'active') {
          const plan = subscription.metadata?.plan || 'premium';
          const user = await findUserByStripeCustomerId(customerId);
          if (user) {
            await updateUserPlan(user.token, { plan });
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        // Subscription cancelled or expired — downgrade to free
        const subscription = event.data.object;
        const customerId = subscription.customer;

        const user = await findUserByStripeCustomerId(customerId);
        if (user) {
          await updateUserPlan(user.token, { plan: 'free', planExpiresAt: null });
          console.log(`⬇️ User ${user.email} downgraded to free (subscription ended)`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        const user = await findUserByStripeCustomerId(customerId);
        if (user) {
          console.warn(`⚠️ Payment failed for ${user.email}`);
          // Don't immediately downgrade — Stripe will retry
        }
        break;
      }

      default:
        // Unhandled event type
        break;
    }
  } catch (err) {
    console.error('Webhook processing error:', err);
  }

  res.json({ received: true });
});

/**
 * POST /api/stripe/portal
 * Creates a Stripe Customer Portal session for managing subscription
 */
router.post('/portal', async (req, res) => {
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
