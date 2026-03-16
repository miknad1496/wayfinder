import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';
import chatRoutes from './routes/chat.js';
import feedbackRoutes from './routes/feedback.js';
import adminRoutes from './routes/admin.js';
import authRoutes from './routes/auth.js';
import stripeRoutes from './routes/stripe.js';
import inviteRoutes from './routes/invites.js';
import { ensureDirectories } from './services/storage.js';
import { ensureUsersDir } from './services/auth.js';
import { ensureInvitesDir } from './services/invites.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env from project root
config({ path: join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.stripe.com"],
    }
  },
  crossOriginEmbedderPolicy: false // needed for Google Fonts
}));

// Compression
app.use(compression());

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute per IP for general API
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again in a moment.' }
});

const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 15, // 15 chat messages per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many messages. Please slow down and try again in a moment.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 login/signup attempts per 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' }
});

// CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? (process.env.FRONTEND_URL || true) // true allows same-origin in production
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
// Stripe webhook needs raw body for signature verification
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '1mb' }));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-6',
    timestamp: new Date().toISOString()
  });
});

// Routes (with rate limiting)
app.use('/api/chat', chatLimiter, chatRoutes);
app.use('/api/feedback', apiLimiter, feedbackRoutes);
app.use('/api/admin', apiLimiter, adminRoutes);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/invites', apiLimiter, inviteRoutes);
app.use('/api/stripe', stripeRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  // Serve public assets (logo.svg, favicon.svg, etc.)
  app.use(express.static(join(__dirname, '..', 'frontend', 'public')));
  // Serve built frontend
  app.use(express.static(join(__dirname, '..', 'frontend', 'dist')));

  // Legal pages
  app.get('/privacy', (req, res) => {
    res.sendFile(join(__dirname, '..', 'frontend', 'privacy.html'));
  });
  app.get('/terms', (req, res) => {
    res.sendFile(join(__dirname, '..', 'frontend', 'terms.html'));
  });
  app.get('/why', (req, res) => {
    res.sendFile(join(__dirname, '..', 'frontend', 'why.html'));
  });

  app.get('*', (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.sendFile(join(__dirname, '..', 'frontend', 'dist', 'index.html'));
  });
}

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Initialize storage and start
async function start() {
  await ensureDirectories();
  await ensureUsersDir();
  await ensureInvitesDir();
  app.listen(PORT, () => {
    console.log(`\n🧭 Wayfinder API running on http://localhost:${PORT}`);
    console.log(`   Model: ${process.env.CLAUDE_MODEL || 'claude-sonnet-4-6'}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}\n`);
  });
}

start().catch(console.error);
