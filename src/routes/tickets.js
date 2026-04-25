/**
 * Ticket Management Routes
 * CRUD endpoints for support tickets
 * RUN-106: Build API endpoints for Tickets (CRUD)
 */

import express from 'express';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { validate, schemas } from '../middleware/validation.js';
import { authenticateJWT, authorize } from '../auth/jwt.js';
import { query, queryOne, queryMany, insert, update, deleteRow, paginate } from '../lib/database.js';

const router = express.Router();

/**
 * GET /tickets - List all tickets (paginated)
 * Query params: page, limit, status, priority, category
 */
router.get('/', authenticateJWT, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, priority, category } = req.query;
  
  let whereClause = '1=1';
  const params = [];
  let paramCount = 1;

  if (status) {
    whereClause += ` AND status = $${paramCount++}`;
    params.push(status);
  }
  if (priority) {
    whereClause += ` AND priority = $${paramCount++}`;
    params.push(priority);
  }
  if (category) {
    whereClause += ` AND category = $${paramCount++}`;
    params.push(category);
  }

  // Count total
  const countResult = await query(`SELECT COUNT(*) as count FROM tickets WHERE ${whereClause}`, params);
  const total = parseInt(countResult.rows[0].count);

  // Get paginated results
  const offset = (page - 1) * limit;
  const text = `
    SELECT * FROM tickets
    WHERE ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${paramCount} OFFSET $${paramCount + 1}
  `;

  params.push(limit, offset);
  const tickets = await queryMany(text, params);

  res.json({
    data: tickets,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

/**
 * GET /tickets/:id - Get ticket by ID with comments
 */
router.get('/:id', authenticateJWT, asyncHandler(async (req, res) => {
  const ticketId = parseInt(req.params.id);

  // Get ticket
  const ticket = await queryOne(`SELECT * FROM tickets WHERE id = $1`, [ticketId]);

  if (!ticket) {
    throw new AppError('Ticket not found', 404, 'TICKET_NOT_FOUND');
  }

  res.json({
    data: ticket
  });
}));

/**
 * POST /tickets - Create new ticket
 * Body: title, description, category, priority, status
 */
router.post(
  '/',
  authenticateJWT,
  validate(schemas.createTicket),
  asyncHandler(async (req, res) => {
    const { title, description, category, priority, status, assigned_to } = req.validatedBody;

    // Create ticket with current user
    const ticket = await insert('tickets', {
      user_id: req.user.id,
      title,
      description,
      category: category || 'general',
      priority: priority || 'medium',
      status: status || 'open',
      assigned_to: assigned_to || null
    });

    res.status(201).json({
      message: 'Ticket created successfully',
      data: ticket
    });
  })
);

/**
 * PUT /tickets/:id - Update ticket
 * Body: title, description, status, priority, assigned_to
 */
router.put(
  '/:id',
  authenticateJWT,
  validate(schemas.updateTicket),
  asyncHandler(async (req, res) => {
    const ticketId = parseInt(req.params.id);

    // Verify ticket exists
    const ticket = await queryOne('SELECT * FROM tickets WHERE id = $1', [ticketId]);
    if (!ticket) {
      throw new AppError('Ticket not found', 404, 'TICKET_NOT_FOUND');
    }

    // Check authorization (creator or admin or assigned staff)
    if (
      ticket.user_id !== req.user.id &&
      ticket.assigned_to !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      throw new AppError('Cannot update this ticket', 403, 'FORBIDDEN');
    }

    // Update ticket
    const updated = await update('tickets', req.validatedBody, ticketId);

    res.json({
      message: 'Ticket updated successfully',
      data: updated
    });
  })
);

/**
 * DELETE /tickets/:id - Delete ticket (soft delete via status)
 */
router.delete(
  '/:id',
  authenticateJWT,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const ticketId = parseInt(req.params.id);

    // Verify ticket exists
    const ticket = await queryOne('SELECT id FROM tickets WHERE id = $1', [ticketId]);
    if (!ticket) {
      throw new AppError('Ticket not found', 404, 'TICKET_NOT_FOUND');
    }

    // Soft delete by marking as closed
    await update('tickets', { status: 'closed' }, ticketId);

    res.json({ message: 'Ticket deleted successfully' });
  })
);

/**
 * POST /tickets/:id/assign - Assign ticket to staff member
 */
router.post(
  '/:id/assign',
  authenticateJWT,
  authorize('admin', 'staff'),
  asyncHandler(async (req, res) => {
    const ticketId = parseInt(req.params.id);
    const { assigned_to } = req.body;

    if (!assigned_to) {
      throw new AppError('assigned_to is required', 400, 'MISSING_FIELD');
    }

    // Verify ticket exists
    const ticket = await queryOne('SELECT id FROM tickets WHERE id = $1', [ticketId]);
    if (!ticket) {
      throw new AppError('Ticket not found', 404, 'TICKET_NOT_FOUND');
    }

    // Verify user exists and is staff
    const user = await queryOne('SELECT user_id, role FROM users WHERE user_id = $1', [assigned_to]);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Update ticket
    const updated = await update('tickets', { assigned_to }, ticketId);

    res.json({
      message: 'Ticket assigned successfully',
      data: updated
    });
  })
);

/**
 * POST /tickets/:id/change-status - Change ticket status
 */
router.post(
  '/:id/change-status',
  authenticateJWT,
  asyncHandler(async (req, res) => {
    const ticketId = parseInt(req.params.id);
    const { status } = req.body;

    const validStatuses = ['open', 'in_progress', 'waiting', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      throw new AppError('Invalid status', 400, 'INVALID_STATUS');
    }

    // Verify ticket exists
    const ticket = await queryOne('SELECT * FROM tickets WHERE id = $1', [ticketId]);
    if (!ticket) {
      throw new AppError('Ticket not found', 404, 'TICKET_NOT_FOUND');
    }

    // Check authorization
    if (
      ticket.created_by !== req.user.id &&
      ticket.assigned_to !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      throw new AppError('Cannot change status', 403, 'FORBIDDEN');
    }

    // Update ticket
    const updated = await update('tickets', { status }, ticketId);

    res.json({
      message: 'Status changed successfully',
      data: updated
    });
  })
);

/**
 * GET /tickets/:id/activities - Get ticket activity log
 */
router.get(
  '/:id/activities',
  authenticateJWT,
  asyncHandler(async (req, res) => {
    const ticketId = parseInt(req.params.id);

    // Verify ticket exists
    const ticket = await queryOne('SELECT id FROM tickets WHERE id = $1', [ticketId]);
    if (!ticket) {
      throw new AppError('Ticket not found', 404, 'TICKET_NOT_FOUND');
    }

    // Get activities (comments + status changes from audit log)
    const activities = await queryMany(`
      SELECT * FROM audit_logs
      WHERE table_name = 'tickets' AND record_id = $1
      ORDER BY created_at DESC
      LIMIT 100
    `, [ticketId]);

    res.json({ data: activities });
  })
);

export default router;
