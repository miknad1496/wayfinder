import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';
import chatRoutes from './routes/chat.js';
import feedbackRoutes from './routes/feedback.js';
import adminRoutes from './routes/admin.js';
import authRoutes from './routes/auth.js';
import stripeRoutes from './routes/stripe.js';
import { ensureDirectories } from './services/storage.js';
import { ensureUsersDir } from './services/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env from project root
config({ path: join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
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

// Routes
app.use('/api/chat', chatRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/stripe', stripeRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  // Serve public assets (logo.svg, favicon.svg, etc.)
  app.use(express.static(join(__dirname, '..', 'frontend', 'public')));
  // Serve built frontend
  app.use(express.static(join(__dirname, '..', 'frontend', 'dist')));

  // Privacy policy route
  app.get('/privacy', (req, res) => {
    res.sendFile(join(__dirname, '..', 'frontend', 'privacy.html'));
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
  app.listen(PORT, () => {
    console.log(`\n🧭 Wayfinder API running on http://localhost:${PORT}`);
    console.log(`   Model: ${process.env.CLAUDE_MODEL || 'claude-sonnet-4-6'}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}\n`);
  });
}

start().catch(console.error);
