import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler.js';

/**
 * Middleware to verify JWT token from Authorization header
 * Extracts user info and attaches to req.user
 * 
 * Usage: app.get('/protected-route', verifyToken, handler)
 */
export const verifyToken = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No authorization token provided', 401, 'NO_TOKEN');
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.SESSION_SECRET || 'dev-secret-key'
    );

    // Attach user info to request
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }

    res.status(401).json({
      error: error.message || 'Unauthorized',
      code: 'UNAUTHORIZED'
    });
  }
};

/**
 * Middleware to verify user role
 * Usage: app.get('/admin-route', verifyToken, requireRole('admin'), handler)
 */
export const requireRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'No user context',
        code: 'NO_USER'
      });
    }

    if (req.user.role !== requiredRole) {
      return res.status(403).json({
        error: `This action requires ${requiredRole} role`,
        code: 'INSUFFICIENT_ROLE'
      });
    }

    next();
  };
};

/**
 * Middleware to verify token is present (for cookie-based auth)
 * Useful if switching to httpOnly cookie storage
 */
export const verifySession = (req, res, next) => {
  if (!req.isAuthenticated?.()) {
    return res.status(401).json({
      error: 'Not authenticated',
      code: 'NOT_AUTHENTICATED'
    });
  }
  next();
};

export default {
  verifyToken,
  requireRole,
  verifySession,
};
