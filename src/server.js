import dotenv from 'dotenv';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables FIRST before anything else
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env');
const result = dotenv.config({ path: envPath });
if (result.error) {
  console.warn('⚠️  .env error:', result.error.message);
}

import express from 'express';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';

// Import middleware
import { errorHandler, notFoundHandler, asyncHandler } from './middleware/errorHandler.js';

// Import routes
import { initializeGitHub } from './auth/github.js';
import { initializeLocal } from './auth/local.js';
import authRoutes from './routes/auth.js';
import linearRoutes from './routes/linear.js';
import { seedDemoUsers } from './seed-demo-users.js';

// Import database connection
import * as db from './lib/database.js';

// Initialize authentication strategies
initializeGitHub();
initializeLocal();

const app = express();
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-secret-key';

// ============ MIDDLEWARE SETUP ============

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',').map(url => url.trim())
    : 'http://localhost:3000',
  credentials: true
}));

// Static files
app.use(express.static('public'));

// Session configuration
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// ============ HEALTH CHECK ============

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ============ ROUTES ============

// OAuth & Authentication
app.use('/api/auth', authRoutes);

// Linear Integration
app.use('/linear', linearRoutes);

// Users API
try {
  const usersRoutes = (await import('./routes/users.js')).default;
  app.use('/api/users', usersRoutes);
} catch (error) {
  console.warn('Users routes not yet ready:', error.message);
}

// Tickets API
try {
  const ticketsRoutes = (await import('./routes/tickets.js')).default;
  app.use('/api/tickets', ticketsRoutes);
} catch (error) {
  console.warn('Tickets routes not yet ready:', error.message);
}

// Comments API
try {
  const commentsRoutes = (await import('./routes/comments.js')).default;
  app.use('/api/comments', commentsRoutes);
} catch (error) {
  console.warn('Comments routes not yet ready:', error.message);
}

// Admin API (Role-Based Access Control)
try {
  const adminRoutes = (await import('./routes/admin.js')).default;
  app.use('/api/admin', adminRoutes);
} catch (error) {
  console.warn('Admin routes not yet ready:', error.message);
}

// Workflow API (Ticket Lifecycle Management)
try {
  const workflowRoutes = (await import('./routes/workflow.js')).default;
  app.use('/api/workflow', workflowRoutes);
} catch (error) {
  console.warn('Workflow routes not yet ready:', error.message);
}

// ============ DEFAULT ROUTES ============

/**
 * Home route
 */
app.get('/', (req, res) => {
  res.json({
    message: 'Runcademic API Server',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: '/auth/github',
      users: '/api/users',
      tickets: '/api/tickets',
      comments: '/api/comments',
      linear: '/linear',
      health: '/health'
    }
  });
});

/**
 * Protected dashboard route
 */
app.get('/dashboard', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated. Please login.' });
  }
  res.json({
    message: 'Welcome to your dashboard!',
    user: req.user,
  });
});

// ============ ERROR HANDLING ============

// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// ============ START SERVER ============

async function startServer() {
  try {
    // Test database connection (initializes pool)
    console.log('\n🔗 Testing database connection...');
    const dbConnected = await db.testConnection();

    if (!dbConnected) {
      console.warn('⚠️  Database not connected. Some endpoints may not work.');
      process.exit(1);
    }

    // Initialize database schema
    console.log('\n🔧 Initializing database schema...');
    const initPath = join(__dirname, 'database', 'init.sql');
    const schema = fs.readFileSync(initPath, 'utf8');
    const client = await db.pool.connect();
    try {
      await client.query(schema);
      console.log('✅ Database schema initialized');
    } catch (error) {
      console.error('❌ Error initializing schema:', error.message);
    } finally {
      client.release();
    }

    // Seed demo users
    await seedDemoUsers(db.pool);

    const server = app.listen(PORT, () => {
      console.log(`\n✅ Server running at http://localhost:${PORT}`);
      console.log(`🔐 GitHub OAuth: http://localhost:${PORT}/auth/github`);
      console.log(`📋 API Endpoints:`);
      console.log(`   - GET    /api/users`);
      console.log(`   - POST   /api/users`);
      console.log(`   - GET    /api/tickets`);
      console.log(`   - POST   /api/tickets`);
      console.log(`   - GET    /api/comments`);
      console.log(`   - POST   /api/comments`);
      console.log(`🔗 Linear Integration: /linear/issues`);
      console.log(`\n`);
    });

    // Handle port binding errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`\n❌ Port ${PORT} is already in use.`);
        console.error(`   Run: npx kill-port ${PORT}`);
        console.error(`   Or: Get-Process node | Stop-Process -Force (PowerShell)`);
        process.exit(1);
      } else {
        console.error('❌ Server error:', error);
        process.exit(1);
      }
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n\n📴 Shutting down server...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

