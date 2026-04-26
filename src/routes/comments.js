/**
 * Comments Management Routes
 * CRUD endpoints for ticket comments
 * RUN-107: Build API endpoints for Comments
 */

import express from 'express';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { validate, schemas } from '../middleware/validation.js';
import { authenticateJWT, authorize } from '../auth/jwt.js';
import { queryOne, queryMany, insert, update, deleteRow, paginate } from '../lib/database.js';

const router = express.Router();

/**
 * GET /comments?ticket_id=X - Get all comments for a ticket
 */
router.get('/', authenticateJWT, asyncHandler(async (req, res) => {
  const ticketId = parseInt(req.query.ticket_id, 10);
  if (!ticketId) {
    throw new AppError('ticket_id query parameter is required', 400, 'MISSING_TICKET_ID');
  }

  const ticket = await queryOne('SELECT id FROM tickets WHERE id = $1', [ticketId]);
  if (!ticket) {
    throw new AppError('Ticket not found', 404, 'TICKET_NOT_FOUND');
  }

  const text = `
    SELECT c.*, CONCAT(u.first_name, ' ', u.last_name) as author_name, u.role as author_role
    FROM comments c
    LEFT JOIN users u ON c.user_id = u.user_id
    WHERE c.ticket_id = $1
    ORDER BY c.created_at ASC
  `;

  const comments = await queryMany(text, [ticketId]);
  res.json({
    data: comments,
    total: comments.length
  });
}));

/**
 * POST /comments - Create new comment
 * Body: ticket_id, comment_text
 */
router.post(
  '/',
  authenticateJWT,
  validate(schemas.createComment),
  asyncHandler(async (req, res) => {
    const ticketId = parseInt(req.body.ticket_id, 10);
    const { comment_text } = req.validatedBody;

    if (!ticketId) {
      throw new AppError('ticket_id is required', 400, 'MISSING_TICKET_ID');
    }

    const ticket = await queryOne('SELECT id FROM tickets WHERE id = $1', [ticketId]);
    if (!ticket) {
      throw new AppError('Ticket not found', 404, 'TICKET_NOT_FOUND');
    }

    const comment = await insert('comments', {
      ticket_id: ticketId,
      user_id: req.user.id,
      comment_text,
      created_at: new Date()
    });

    res.status(201).json({
      message: 'Comment added successfully',
      data: comment
    });
  })
);

/**
 * GET /tickets/:ticketId/comments - Get all comments for a ticket
 */
router.get('/:ticketId/comments', authenticateJWT, asyncHandler(async (req, res) => {
  const ticketId = parseInt(req.params.ticketId);

  // Verify ticket exists
  const ticket = await queryOne('SELECT id FROM tickets WHERE id = $1', [ticketId]);
  if (!ticket) {
    throw new AppError('Ticket not found', 404, 'TICKET_NOT_FOUND');
  }

  // Get comments with user info
  const text = `
    SELECT c.*, CONCAT(u.first_name, ' ', u.last_name) as author_name, u.role as author_role
    FROM comments c
    LEFT JOIN users u ON c.user_id = u.user_id
    WHERE c.ticket_id = $1
    ORDER BY c.created_at ASC
  `;

  const comments = await queryMany(text, [ticketId]);

  res.json({
    data: comments,
    total: comments.length
  });
}));

/**
 * GET /comments/:id - Get specific comment
 */
router.get('/:id', authenticateJWT, asyncHandler(async (req, res) => {
  const commentId = parseInt(req.params.id);

  const comment = await queryOne(`
    SELECT c.*, CONCAT(u.first_name, ' ', u.last_name) as author_name
    FROM comments c
    LEFT JOIN users u ON c.user_id = u.user_id
    WHERE c.id = $1
  `, [commentId]);

  if (!comment) {
    throw new AppError('Comment not found', 404, 'COMMENT_NOT_FOUND');
  }

  res.json({ data: comment });
}));

/**
 * POST /tickets/:ticketId/comments - Create new comment
 * Body: comment_text (required)
 */
router.post(
  '/:ticketId/comments',
  authenticateJWT,
  validate(schemas.createComment),
  asyncHandler(async (req, res) => {
    const ticketId = parseInt(req.params.ticketId);
    const { comment_text } = req.validatedBody;

    // Verify ticket exists
    const ticket = await queryOne('SELECT id FROM tickets WHERE id = $1', [ticketId]);
    if (!ticket) {
      throw new AppError('Ticket not found', 404, 'TICKET_NOT_FOUND');
    }

    // Create comment
    const comment = await insert('comments', {
      ticket_id: ticketId,
      user_id: req.user.id,
      comment_text: comment_text,
      created_at: new Date()
    });

    res.status(201).json({
      message: 'Comment added successfully',
      data: comment
    });
  })
);

/**
 * PUT /comments/:id - Update comment
 * Only creator and admins can update
 */
router.put(
  '/:id',
  authenticateJWT,
  asyncHandler(async (req, res) => {
    const commentId = parseInt(req.params.id);
    const { comment_text } = req.body;

    if (!comment_text) {
      throw new AppError('Comment text is required', 400, 'MISSING_FIELD');
    }

    // Get comment
    const comment = await queryOne('SELECT * FROM comments WHERE id = $1', [commentId]);
    if (!comment) {
      throw new AppError('Comment not found', 404, 'COMMENT_NOT_FOUND');
    }

    // Check authorization
    if (comment.user_id !== req.user.id && req.user.role !== 'admin') {
      throw new AppError('Cannot edit this comment', 403, 'FORBIDDEN');
    }

    // Update comment
    const updated = await update('comments', { comment_text: comment_text }, commentId, 'id');

    res.json({
      message: 'Comment updated successfully',
      data: updated
    });
  })
);

/**
 * DELETE /comments/:id - Delete comment
 * Only creator and admins can delete
 */
router.delete(
  '/:id',
  authenticateJWT,
  asyncHandler(async (req, res) => {
    const commentId = parseInt(req.params.id);

    // Get comment
    const comment = await queryOne('SELECT * FROM comments WHERE id = $1', [commentId]);
    if (!comment) {
      throw new AppError('Comment not found', 404, 'COMMENT_NOT_FOUND');
    }

    // Check authorization
    if (comment.user_id !== req.user.id && req.user.role !== 'admin') {
      throw new AppError('Cannot delete this comment', 403, 'FORBIDDEN');
    }

    // Delete comment
    const deleted = await deleteRow('comments', commentId, 'id');
    if (!deleted) {
      throw new AppError('Failed to delete comment', 500, 'DELETE_ERROR');
    }

    res.json({ message: 'Comment deleted successfully' });
  })
);

// Pin/unpin functionality removed - not in current schema

// Pinned comments functionality removed - not in current schema

export default router;
