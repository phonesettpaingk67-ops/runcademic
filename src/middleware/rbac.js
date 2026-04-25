/**
 * Role-Based Access Control (RBAC) Middleware
 * Provides authorization checks for admin and user routes
 */

import { AppError } from './errorHandler.js';

/**
 * Require specific roles
 * @param {...string} allowedRoles - Role names that are allowed
 * @returns {Function} Middleware function
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      throw new AppError('Authentication required', 401, 'UNAUTHENTICATED');
    }

    // Check if user has required role
    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError(
        `Access denied. Required role: ${allowedRoles.join(' or ')}`,
        403,
        'INSUFFICIENT_PERMISSIONS'
      );
    }

    next();
  };
};

/**
 * Require admin role
 * @returns {Function} Middleware function
 */
export const requireAdmin = () => authorize('admin');

/**
 * Require user role (not admin)
 * @returns {Function} Middleware function
 */
export const requireUser = () => authorize('user', 'student');

/**
 * Allow admin or user
 * @returns {Function} Middleware function
 */
export const requireAuthenticatedUser = () => authorize('admin', 'user', 'student');

/**
 * Prevent users from accessing user data if not owner or admin
 * @returns {Function} Middleware function
 */
export const ownOrAdmin = () => {
  return (req, res, next) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401, 'UNAUTHENTICATED');
    }

    const targetUserId = parseInt(req.params.id || req.body.user_id);
    const isOwner = req.user.id === targetUserId;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw new AppError(
        'You can only access your own data. Admins can access any data.',
        403,
        'INSUFFICIENT_PERMISSIONS'
      );
    }

    next();
  };
};

/**
 * Check if user can manage another user
 * Only admins can manage other users
 * @returns {Function} Middleware function
 */
export const canManageUser = () => {
  return (req, res, next) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401, 'UNAUTHENTICATED');
    }

    const targetUserId = parseInt(req.params.id);
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin) {
      throw new AppError(
        'Only admins can manage users',
        403,
        'INSUFFICIENT_PERMISSIONS'
      );
    }

    next();
  };
};
