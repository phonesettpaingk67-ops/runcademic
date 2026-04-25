import express from 'express';
import passport from 'passport';
import bcrypt from 'bcrypt';
import { generateToken } from '../auth/jwt.js';
import { queryOne, insert } from '../lib/database.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

const router = express.Router();
const SALT_ROUNDS = 10;

/**
 * Email/Password Registration
 * POST /auth/register or /auth/signup
 */
router.post(['/register', '/signup'], asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password required', 400, 'MISSING_FIELDS');
  }

  // Check if user exists
  const existing = await queryOne('SELECT user_id FROM users WHERE email = $1', [email]);
  if (existing) {
    throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Create user
  const result = await insert('users', {
    email,
    password_hash: passwordHash,
    first_name: firstName || email.split('@')[0],
    last_name: lastName || '',
    username: email,
    role: 'student',
  });

  const user = result;

  // Generate token
  const token = generateToken({
    id: user.user_id,
    email: user.email,
    name: `${user.first_name} ${user.last_name}`.trim(),
    role: user.role
  });

  res.status(201).json({
    token,
    user: {
      id: user.user_id,
      email: user.email,
      name: `${user.first_name} ${user.last_name}`.trim(),
      role: user.role,
    },
  });
}));

/**
 * Email/Password Login
 * POST /auth/login
 */
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password required', 400, 'MISSING_FIELDS');
  }

  // Find user
  const user = await queryOne('SELECT * FROM users WHERE email = $1', [email]);
  if (!user) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  // Check password
  const passwordValid = await bcrypt.compare(password, user.password_hash);
  if (!passwordValid) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  // Generate token
  const token = generateToken({
    id: user.user_id,
    email: user.email,
    name: `${user.first_name} ${user.last_name}`.trim(),
    role: user.role
  });

  res.json({
    token,
    user: {
      id: user.user_id,
      email: user.email,
      name: `${user.first_name} ${user.last_name}`.trim(),
      role: user.role,
    },
  });
}));

/**
 * Initiate GitHub OAuth login
 * Redirects user to GitHub for authorization
 */
router.get('/github', passport.authenticate('github', { scope: ['repo', 'user'] }));

/**
 * GitHub OAuth callback
 * GitHub redirects here after user authorizes
 */
router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: 'http://localhost:5176/login?error=github_auth_failed' }),
  (req, res) => {
    // Successful authentication
    // Generate JWT token for frontend
    const token = generateToken({
      id: req.user.user_id,
      email: req.user.email,
      name: `${req.user.first_name} ${req.user.last_name}`.trim(),
      role: req.user.role
    });
    
    // Store access token for API calls to GitHub if needed
    req.session.githubAccessToken = req.user.accessToken;
    
    // Redirect to frontend dashboard with token
    res.redirect(`http://localhost:5176/login?token=${encodeURIComponent(token)}&user=${encodeURIComponent(JSON.stringify({
      id: req.user.user_id,
      name: `${req.user.first_name} ${req.user.last_name}`.trim(),
      avatarUrl: req.user.avatar_url
    }))}`);
  }
);

/**
 * Logout
 */
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    req.session.destroy();
    res.redirect('/');
  });
});

/**
 * Get current user info
 */
router.get('/me', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({
    user: req.user,
    token: req.session.githubAccessToken,
  });
});

export default router;
