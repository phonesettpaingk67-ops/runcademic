/**
 * User Management Routes
 * CRUD endpoints for users
 * RUN-105: Build API endpoints for Users management
 */

import express from 'express';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { validate, schemas } from '../middleware/validation.js';
import { authenticateJWT, authorize } from '../auth/jwt.js';
import { queryOne, queryMany, insert, update, deleteRow, paginate } from '../lib/database.js';

const router = express.Router();

/**
 * GET /users - List all users (paginated)
 * Query params: page, limit, sort, order
 */
router.get('/', authenticateJWT, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  
  const result = await paginate('users', parseInt(page), parseInt(limit), 'created_at');
  
  res.json({
    data: result.rows,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      pages: result.pages
    }
  });
}));

/**
 * GET /users/me - Get current user profile
 */
router.get('/me', authenticateJWT, asyncHandler(async (req, res) => {
  const user = await queryOne('SELECT * FROM users WHERE user_id = $1', [req.user.id]);
  
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  // Remove sensitive data
  delete user.password_hash;
  
  res.json({ data: user });
}));

/**
 * PUT /users/me - Update current user profile
 */
router.put(
  '/me',
  authenticateJWT,
  validate(schemas.updateUser),
  asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Verify user exists
    const existing = await queryOne('SELECT user_id FROM users WHERE user_id = $1', [userId]);
    if (!existing) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Update user
    const user = await update('users', req.validatedBody, userId, 'user_id');
    delete user.password_hash;
    
    res.json({
      message: 'User updated successfully',
      data: user
    });
  })
);

/**
 * GET /users/:id - Get user by ID
 */
router.get('/:id', authenticateJWT, asyncHandler(async (req, res) => {
  const user = await queryOne('SELECT * FROM users WHERE user_id = $1', [req.params.id]);
  
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  // Remove sensitive data
  delete user.password_hash;
  
  res.json({ data: user });
}));

/**
 * POST /users - Create new user
 * Body: email, password, name, phone (optional), role (optional)
 */
router.post(
  '/',
  validate(schemas.createUser),
  asyncHandler(async (req, res) => {
    const { email, password, name, phone, role } = req.validatedBody;
    
    // Check if email already exists
    const existing = await queryOne('SELECT id FROM users WHERE email = $1', [email]);
    if (existing) {
      throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');
    }

    // Hash password (in production, use bcrypt)
    const bcrypt = require('bcrypt');
    const password_hash = await bcrypt.hash(password, 10);

    // Create user
    const user = await insert('users', {
      email,
      password_hash,
      name,
      phone: phone || null,
      role: role || 'student'
    });

    delete user.password_hash;
    
    res.status(201).json({
      message: 'User created successfully',
      data: user
    });
  })
);

/**
 * PUT /users/:id - Update user
 * Only admins can update other users, users can update themselves
 */
router.put(
  '/:id',
  authenticateJWT,
  validate(schemas.updateUser),
  asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.id);
    
    // Check authorization
    if (userId !== req.user.id && req.user.role !== 'admin') {
      throw new AppError('Cannot update other users', 403, 'FORBIDDEN');
    }

    // Verify user exists
    const existing = await queryOne('SELECT user_id FROM users WHERE user_id = $1', [userId]);
    if (!existing) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Update user
    const user = await update('users', req.validatedBody, userId, 'user_id');
    delete user.password_hash;
    
    res.json({
      message: 'User updated successfully',
      data: user
    });
  })
);

/**
 * DELETE /users/:id - Delete user
 * Only admins can delete users
 */
router.delete(
  '/:id',
  authenticateJWT,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.id);
    
    // Prevent self-deletion
    if (userId === req.user.id) {
      throw new AppError('Cannot delete your own account', 400, 'CANNOT_DELETE_SELF');
    }

    const deleted = await deleteRow('users', userId, 'user_id');
    if (!deleted) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    
    res.json({ message: 'User deleted successfully' });
  })
);

/**
 * GET /users/:id/tickets - Get user's tickets
 */
router.get(
  '/:id/tickets',
  authenticateJWT,
  asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.id);
    const { page = 1, limit = 20 } = req.query;

    // Verify user exists
    const user = await queryOne('SELECT user_id FROM users WHERE user_id = $1', [userId]);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const text = `
      SELECT t.* FROM tickets t
      WHERE t.user_id = $1 OR t.assigned_to = $1
      ORDER BY t.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const offset = (page - 1) * limit;
    const tickets = await queryMany(text, [userId, limit, offset]);

    res.json({
      data: tickets,
      pagination: { page, limit }
    });
  })
);

/**
 * GET /users/search/:query - Search users
 */
router.get(
  '/search/:query',
  authenticateJWT,
  asyncHandler(async (req, res) => {
    const searchTerm = `%${req.params.query}%`;
    
    const text = `
      SELECT id, name, email, phone, role, created_at
      FROM users
      WHERE name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1
      LIMIT 20
    `;
    
    const users = await queryMany(text, [searchTerm]);
    res.json({ data: users });
  })
);

export default router;
