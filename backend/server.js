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
import demographicsRoutes from './routes/demographics.js';
import timelineRoutes from './routes/timeline.js';
import essayRoutes from './routes/essays.js';
import internshipRoutes from './routes/internships.js';
import scholarshipRoutes from './routes/scholarships.js';
import programRoutes from './routes/programs.js';
import financialAidRoutes from './routes/financial-aid.js';
import coachRoutes from './routes/essay-coach.js';
import intelligenceRoutes from './routes/intelligence.js';
import { ensureDirectories } from './services/storage.js';
import { ensureUsersDir, repairCorruptedUserFiles, buildTokenIndex } from './services/auth.js';
import { ensureInvitesDir } from './services/invites.js';
import { startScheduler } from './services/scheduler.js';
import { startScraperScheduler, stopScraperScheduler } from './services/scraper-scheduler.js';
import { syncCommittedData } from './services/data-sync.js';
import { runDataHealthCheck } from './services/data-integrity.js';
import { restoreFromBackup, startUserBackup, stopUserBackup } from './services/user-backup.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env from project root
config({ path: join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// HTTPS enforcement in production (redirect HTTP to HTTPS)
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    // Render (and most PaaS) set x-forwarded-proto
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    next();
  });
  app.set('trust proxy', 1); // Trust first proxy (Render)
}

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.stripe.com", "https://js.stripe.com"],
      frameSrc: ["https://js.stripe.com", "https://hooks.stripe.com"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    }
  },
  crossOriginEmbedderPolicy: false, // needed for Google Fonts
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  noSniff: true,
  xssFilter: true,
  hidePoweredBy: true
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

const adminLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // 5 requests per minute per IP for admin routes
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many admin requests. Please slow down.' }
});

// Expensive endpoints: essay reviews and financial aid strategy generation
// These hit Opus/Sonnet directly and cost $0.10-$0.40+ per call
const expensiveLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 3, // 3 expensive API calls per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Please wait before generating another strategy or review.' }
});

// CORS — locked to specific origins, no wildcard fallback
const ALLOWED_ORIGINS = process.env.NODE_ENV === 'production'
  ? [process.env.FRONTEND_URL || 'https://wayfinderai.org', 'https://www.wayfinderai.org']
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, curl, Stripe webhooks)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
// Stripe webhook needs raw body for signature verification
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));
// Strict request size validation: 100KB for non-webhook routes
app.use(express.json({ limit: '100kb' }));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Health check (no sensitive info like model names)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

// Routes (with rate limiting)
app.use('/api/chat', chatLimiter, chatRoutes);
app.use('/api/feedback', apiLimiter, feedbackRoutes);
app.use('/api/admin', adminLimiter, adminRoutes);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/invites', apiLimiter, inviteRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/demographics', apiLimiter, demographicsRoutes);
app.use('/api/timeline', apiLimiter, timelineRoutes);
// Essay: expensive limiter on POST /review only; normal limiter on GETs (credits, types, prompts, history)
app.post('/api/essays/review', expensiveLimiter);
app.use('/api/essays', apiLimiter, essayRoutes);
app.use('/api/internships', apiLimiter, internshipRoutes);
app.use('/api/scholarships', apiLimiter, scholarshipRoutes);
app.use('/api/programs', apiLimiter, programRoutes);
// Financial aid: expensive limiter on POST routes only (my-strategy, calculate-sai);
// GET routes (search, schools, stats, estimate, state-grants, strategies) use normal limiter
app.post('/api/financial-aid/my-strategy', expensiveLimiter);
app.post('/api/financial-aid/calculate-sai', expensiveLimiter);
app.use('/api/financial-aid', apiLimiter, financialAidRoutes);
app.use('/api/coach', chatLimiter, coachRoutes);
app.use('/api/intelligence', apiLimiter, intelligenceRoutes);

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

  // Admin dashboard (standalone HTML, not part of the SPA)
  app.get('/admin-dashboard.html', (req, res) => {
    res.sendFile(join(__dirname, '..', 'frontend', 'admin-dashboard.html'));
  });
  app.get('/admin', (req, res) => {
    res.sendFile(join(__dirname, '..', 'frontend', 'admin-dashboard.html'));
  });

  app.get('*', (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.sendFile(join(__dirname, '..', 'frontend', 'dist', 'index.html'));
  });
}

// 404 handler for undefined API routes (no stack trace leak)
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

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
  await restoreFromBackup();
  await repairCorruptedUserFiles();
  await buildTokenIndex();
  app.listen(PORT, async () => {
    console.log(`\n🧭 Wayfinder API running on http://localhost:${PORT}`);
    console.log(`   Model: ${process.env.CLAUDE_MODEL || 'claude-sonnet-4-6'}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}\n`);

    // Sync committed data files to persistent disk (fixes Render mount issue)
    // Must run BEFORE scrapers — completely non-fatal
    try { await syncCommittedData(); } catch (e) { console.error('[Data Sync] Error (non-fatal):', e.message); }

    // Data health check — logs warnings if duplicates or invalid entries found
    try { await runDataHealthCheck(); } catch (e) { console.error('[Data Health] Error (non-fatal):', e.message); }

    // Start reminder scheduler in production
    if (process.env.NODE_ENV === 'production') {
      startScheduler();
      startScraperScheduler();
      startUserBackup();
    }
  });
}

start().catch(console.error);

// Graceful shutdown — run final user backup before exit
let isShuttingDown = false;
async function gracefulShutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`[Server] ${signal} received, shutting down gracefully...`);
  try { stopScraperScheduler(); } catch (e) { console.error('[Scraper] Shutdown error:', e.message); }
  try { await stopUserBackup(); } catch (e) { console.error('[Backup] Shutdown error:', e.message); }
  process.exit(0);
}
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
