/**
 * Admin Routes
 * Routes for admin dashboard and user management
 * Only accessible by users with 'admin' role
 */

import express from 'express';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { authenticateJWT } from '../auth/jwt.js';
import { requireAdmin, canManageUser } from '../middleware/rbac.js';
import { queryOne, queryMany, update, deleteRow } from '../lib/database.js';
import bcrypt from 'bcrypt';

const router = express.Router();
const SALT_ROUNDS = 10;

// ============ ADMIN DASHBOARD ============

/**
 * GET /admin/dashboard
 * Get dashboard statistics
 */
router.get('/dashboard', authenticateJWT, requireAdmin(), asyncHandler(async (req, res) => {
  try {
    // Get total users
    const totalUsers = await queryOne(
      'SELECT COUNT(*) as count FROM users',
      []
    );

    // Get total admin users
    const adminUsers = await queryOne(
      'SELECT COUNT(*) as count FROM users WHERE role = $1',
      ['admin']
    );

    // Get total regular users
    const regularUsers = await queryOne(
      'SELECT COUNT(*) as count FROM users WHERE role != $1',
      ['admin']
    );

    // Get users by role breakdown
    const roleBreakdown = await queryMany(
      `SELECT role, COUNT(*) as count FROM users GROUP BY role ORDER BY count DESC`,
      []
    );

    // Get recent users (last 10)
    const recentUsers = await queryMany(
      `SELECT user_id, email, first_name, last_name, role, created_at 
       FROM users 
       ORDER BY created_at DESC 
       LIMIT 10`,
      []
    );

    res.json({
      statistics: {
        totalUsers: totalUsers.count,
        adminUsers: adminUsers.count,
        regularUsers: regularUsers.count,
        roleBreakdown: roleBreakdown
      },
      recentUsers
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    throw new AppError('Failed to fetch dashboard data', 500, 'DASHBOARD_ERROR');
  }
}));

// ============ USER MANAGEMENT ============

/**
 * GET /admin/users
 * List all users (admin only)
 * Query params: page, limit, role, search
 */
router.get('/users', authenticateJWT, requireAdmin(), asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, search } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  let query = 'SELECT user_id, email, first_name, last_name, role, created_at FROM users WHERE 1=1';
  const params = [];
  let paramCount = 1;

  // Filter by role if provided
  if (role && role !== 'all') {
    query += ` AND role = $${paramCount}`;
    params.push(role);
    paramCount++;
  }

  // Search by email or name if provided
  if (search) {
    query += ` AND (email ILIKE $${paramCount} OR first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount})`;
    params.push(`%${search}%`);
    paramCount++;
  }

  // Get total count
  const countResult = await queryOne(
    query.replace('SELECT user_id, email, first_name, last_name, role, created_at', 'SELECT COUNT(*) as count'),
    params
  );

  // Get paginated results
  query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  params.push(parseInt(limit), offset);

  const users = await queryMany(query, params);

  res.json({
    data: users,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: countResult.count,
      pages: Math.ceil(countResult.count / parseInt(limit))
    }
  });
}));

/**
 * GET /admin/users/:id
 * Get specific user details (admin only)
 */
router.get('/users/:id', authenticateJWT, requireAdmin(), asyncHandler(async (req, res) => {
  const userId = parseInt(req.params.id, 10); // Convert to integer
  const user = await queryOne(
    'SELECT user_id, email, first_name, last_name, role, created_at, updated_at FROM users WHERE user_id = $1',
    [userId]
  );

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  res.json({ data: user });
}));

/**
 * PUT /admin/users/:id/role
 * Update user role (admin only)
 */
router.put('/users/:id/role', authenticateJWT, requireAdmin(), asyncHandler(async (req, res) => {
  const { role } = req.body;
  const userId = parseInt(req.params.id, 10); // Convert to integer

  console.log(`📝 Role update request: userId=${userId}, newRole=${role}, adminId=${req.user.id}`);

  // Validate role
  const validRoles = ['admin', 'user', 'student', 'instructor'];
  if (!validRoles.includes(role)) {
    console.error(`❌ Invalid role: ${role}`);
    throw new AppError(`Invalid role. Allowed: ${validRoles.join(', ')}`, 400, 'INVALID_ROLE');
  }

  // Prevent admins from demoting themselves
  if (userId === req.user.id && role !== 'admin') {
    console.error(`❌ Admin attempted to demote themselves`);
    throw new AppError('Cannot demote yourself', 400, 'CANNOT_DEMOTE_SELF');
  }

  console.log(`📝 Updating user ${userId} to role ${role}...`);
  const result = await update('users', { role }, userId, 'user_id');

  if (!result) {
    console.error(`❌ User not found: ${userId}`);
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  console.log(`✅ User role updated successfully:`, result);
  res.json({
    message: `User role updated to ${role}`,
    data: result
  });
}));

/**
 * PUT /admin/users/:id/status
 * Disable/Enable user account (admin only)
 */
router.put('/users/:id/status', authenticateJWT, requireAdmin(), asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const userId = req.params.id;

  // Prevent admins from disabling themselves
  if (parseInt(userId) === req.user.id && !isActive) {
    throw new AppError('Cannot disable your own account', 400, 'CANNOT_DISABLE_SELF');
  }

  const result = await update('users', { is_active: isActive }, userId, 'user_id');

  if (!result) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  res.json({
    message: `User account ${isActive ? 'enabled' : 'disabled'}`,
    data: result
  });
}));

/**
 * DELETE /admin/users/:id
 * Delete user (admin only)
 */
router.delete('/users/:id', authenticateJWT, requireAdmin(), asyncHandler(async (req, res) => {
  const userId = parseInt(req.params.id, 10); // Convert to integer

  // Prevent admins from deleting themselves
  if (userId === req.user.id) {
    throw new AppError('Cannot delete your own account', 400, 'CANNOT_DELETE_SELF');
  }

  const result = await deleteRow('users', userId, 'user_id');

  if (!result) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  res.json({ message: 'User deleted successfully' });
}));

/**
 * POST /admin/users
 * Create new user as admin (admin only)
 */
router.post('/users', authenticateJWT, requireAdmin(), asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, role } = req.body;

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
  const userRole = role && ['admin', 'user', 'student', 'instructor'].includes(role) ? role : 'user';
  
  const result = await update('users', {
    email,
    password_hash: passwordHash,
    first_name: firstName || email.split('@')[0],
    last_name: lastName || '',
    username: email,
    role: userRole,
    is_active: true
  }, 'user_id', null, true); // true to insert

  res.status(201).json({
    message: 'User created successfully',
    data: {
      user_id: result.user_id,
      email: result.email,
      first_name: result.first_name,
      last_name: result.last_name,
      role: result.role
    }
  });
}));

/**
 * GET /admin/activity-log
 * Get admin activity log
 */
router.get('/activity-log', authenticateJWT, requireAdmin(), asyncHandler(async (req, res) => {
  const { limit = 50 } = req.query;

  // This would typically come from an activity log table
  // For now, returning a placeholder
  res.json({
    message: 'Activity log feature coming soon',
    data: []
  });
}));

export default router;
