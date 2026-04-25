/**
 * Workflow Management Routes
 * Handles ticket lifecycle: submission → review → assigned → in_progress → resolved → closed
 */
import express from 'express';
import { authenticateJWT, authorize } from '../auth/jwt.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { queryOne, queryMany, update, insert } from '../lib/database.js';

const router = express.Router();

/**
 * Helper function to record history
 */
async function recordHistory(ticketId, userId, action, fromStatus, toStatus, notes = null) {
  await insert('ticket_history', {
    ticket_id: ticketId,
    user_id: userId,
    action,
    from_status: fromStatus,
    to_status: toStatus,
    notes
  });
}

/**
 * Helper function for state transitions
 */
function validateStateTransition(currentStatus, newStatus, userRole) {
  const validTransitions = {
    // Admins can review from submission
    'submission': {
      'admin': ['review'],
      'student': []
    },
    // Admins can assign from review
    'review': {
      'admin': ['assigned', 'submission'],
      'student': []
    },
    // Staff can mark as in_progress from assigned
    'assigned': {
      'admin': ['assigned', 'submission'],
      'staff': ['in_progress'],
      'faculty': ['in_progress']
    },
    // Staff can resolve from in_progress
    'in_progress': {
      'admin': ['resolved', 'in_progress', 'assigned'],
      'staff': ['resolved', 'in_progress'],
      'faculty': ['resolved', 'in_progress']
    },
    // Admin can close from resolved
    'resolved': {
      'admin': ['closed', 'in_progress'],
      'staff': [],
      'faculty': []
    },
    // Can't transition from closed
    'closed': {}
  };

  const allowed = validTransitions[currentStatus]?.[userRole] || [];
  return allowed.includes(newStatus);
}

/**
 * POST /workflow/review - Admin reviews ticket
 * Transitions: submission → review
 */
router.post(
  '/review/:ticketId',
  authenticateJWT,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const ticketId = parseInt(req.params.ticketId);
    const { notes } = req.body;

    // Get ticket
    const ticket = await queryOne('SELECT * FROM tickets WHERE id = $1', [ticketId]);
    if (!ticket) {
      throw new AppError('Ticket not found', 404, 'TICKET_NOT_FOUND');
    }

    // Validate state transition
    if (!validateStateTransition(ticket.workflow_status, 'review', 'admin')) {
      throw new AppError(
        `Cannot review ticket in ${ticket.workflow_status} state`,
        400,
        'INVALID_STATE_TRANSITION'
      );
    }

    // Update ticket
    const updated = await update(
      'tickets',
      {
        workflow_status: 'review',
        reviewed_at: new Date()
      },
      ticketId,
      'id'
    );

    // Record history
    await recordHistory(
      ticketId,
      req.user.id,
      'REVIEWED',
      ticket.workflow_status,
      'review',
      notes
    );

    res.json({
      message: 'Ticket reviewed successfully',
      data: updated
    });
  })
);

/**
 * POST /workflow/assign - Admin assigns ticket to staff
 * Transitions: review → assigned
 */
router.post(
  '/assign/:ticketId',
  authenticateJWT,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const ticketId = parseInt(req.params.ticketId);
    const { assigned_to, notes } = req.body;

    if (!assigned_to) {
      throw new AppError('assigned_to is required', 400, 'MISSING_FIELD');
    }

    // Verify assigned staff exists
    const staff = await queryOne('SELECT user_id FROM users WHERE user_id = $1', [assigned_to]);
    if (!staff) {
      throw new AppError('Assigned staff member not found', 404, 'USER_NOT_FOUND');
    }

    // Get ticket
    const ticket = await queryOne('SELECT * FROM tickets WHERE id = $1', [ticketId]);
    if (!ticket) {
      throw new AppError('Ticket not found', 404, 'TICKET_NOT_FOUND');
    }

    // Validate state transition
    if (!validateStateTransition(ticket.workflow_status, 'assigned', 'admin')) {
      throw new AppError(
        `Cannot assign ticket in ${ticket.workflow_status} state`,
        400,
        'INVALID_STATE_TRANSITION'
      );
    }

    // Update ticket
    const updated = await update(
      'tickets',
      {
        workflow_status: 'assigned',
        assigned_to: assigned_to,
        assigned_at: new Date()
      },
      ticketId,
      'id'
    );

    // Record history
    await recordHistory(
      ticketId,
      req.user.id,
      'ASSIGNED',
      ticket.workflow_status,
      'assigned',
      `Assigned to user ${assigned_to}. ${notes || ''}`
    );

    res.json({
      message: 'Ticket assigned successfully',
      data: updated
    });
  })
);

/**
 * POST /workflow/start-work - Staff marks ticket as in progress
 * Transitions: assigned → in_progress
 */
router.post(
  '/start-work/:ticketId',
  authenticateJWT,
  authorize('staff', 'faculty', 'admin'),
  asyncHandler(async (req, res) => {
    const ticketId = parseInt(req.params.ticketId);
    const { notes } = req.body;

    // Get ticket
    const ticket = await queryOne('SELECT * FROM tickets WHERE id = $1', [ticketId]);
    if (!ticket) {
      throw new AppError('Ticket not found', 404, 'TICKET_NOT_FOUND');
    }

    // Validate authorization (must be assigned to this user or admin)
    if (ticket.assigned_to !== req.user.id && req.user.role !== 'admin') {
      throw new AppError('Only assigned staff can start work', 403, 'FORBIDDEN');
    }

    // Validate state transition
    if (!validateStateTransition(ticket.workflow_status, 'in_progress', req.user.role)) {
      throw new AppError(
        `Cannot start work on ticket in ${ticket.workflow_status} state`,
        400,
        'INVALID_STATE_TRANSITION'
      );
    }

    // Update ticket
    const updated = await update(
      'tickets',
      {
        workflow_status: 'in_progress',
        status: 'in_progress'
      },
      ticketId,
      'id'
    );

    // Record history
    await recordHistory(
      ticketId,
      req.user.id,
      'WORK_STARTED',
      ticket.workflow_status,
      'in_progress',
      notes
    );

    res.json({
      message: 'Work started on ticket',
      data: updated
    });
  })
);

/**
 * POST /workflow/resolve - Staff resolves ticket
 * Transitions: in_progress → resolved
 */
router.post(
  '/resolve/:ticketId',
  authenticateJWT,
  authorize('staff', 'faculty', 'admin'),
  asyncHandler(async (req, res) => {
    const ticketId = parseInt(req.params.ticketId);
    const { resolution_notes } = req.body;

    if (!resolution_notes) {
      throw new AppError('Resolution notes are required', 400, 'MISSING_FIELD');
    }

    // Get ticket
    const ticket = await queryOne('SELECT * FROM tickets WHERE id = $1', [ticketId]);
    if (!ticket) {
      throw new AppError('Ticket not found', 404, 'TICKET_NOT_FOUND');
    }

    // Validate authorization
    if (ticket.assigned_to !== req.user.id && req.user.role !== 'admin') {
      throw new AppError('Only assigned staff can resolve this ticket', 403, 'FORBIDDEN');
    }

    // Validate state transition
    if (!validateStateTransition(ticket.workflow_status, 'resolved', req.user.role)) {
      throw new AppError(
        `Cannot resolve ticket in ${ticket.workflow_status} state`,
        400,
        'INVALID_STATE_TRANSITION'
      );
    }

    // Update ticket
    const updated = await update(
      'tickets',
      {
        workflow_status: 'resolved',
        status: 'resolved',
        resolution_notes: resolution_notes,
        resolved_at: new Date()
      },
      ticketId,
      'id'
    );

    // Record history
    await recordHistory(
      ticketId,
      req.user.id,
      'RESOLVED',
      ticket.workflow_status,
      'resolved',
      resolution_notes
    );

    res.json({
      message: 'Ticket resolved successfully',
      data: updated
    });
  })
);

/**
 * POST /workflow/close - Admin closes ticket
 * Transitions: resolved → closed
 */
router.post(
  '/close/:ticketId',
  authenticateJWT,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const ticketId = parseInt(req.params.ticketId);
    const { notes } = req.body;

    // Get ticket
    const ticket = await queryOne('SELECT * FROM tickets WHERE id = $1', [ticketId]);
    if (!ticket) {
      throw new AppError('Ticket not found', 404, 'TICKET_NOT_FOUND');
    }

    // Validate state transition
    if (!validateStateTransition(ticket.workflow_status, 'closed', 'admin')) {
      throw new AppError(
        `Cannot close ticket in ${ticket.workflow_status} state`,
        400,
        'INVALID_STATE_TRANSITION'
      );
    }

    // Update ticket
    const updated = await update(
      'tickets',
      {
        workflow_status: 'closed',
        status: 'closed'
      },
      ticketId,
      'id'
    );

    // Record history
    await recordHistory(
      ticketId,
      req.user.id,
      'CLOSED',
      ticket.workflow_status,
      'closed',
      notes
    );

    res.json({
      message: 'Ticket closed successfully',
      data: updated
    });
  })
);

/**
 * GET /workflow/history/:ticketId - Get ticket history/audit trail
 */
router.get(
  '/history/:ticketId',
  authenticateJWT,
  asyncHandler(async (req, res) => {
    const ticketId = parseInt(req.params.ticketId);

    // Verify ticket exists
    const ticket = await queryOne('SELECT id FROM tickets WHERE id = $1', [ticketId]);
    if (!ticket) {
      throw new AppError('Ticket not found', 404, 'TICKET_NOT_FOUND');
    }

    // Get history
    const history = await queryMany(
      `SELECT 
        h.*,
        u.first_name,
        u.last_name,
        u.email
      FROM ticket_history h
      LEFT JOIN users u ON h.user_id = u.user_id
      WHERE h.ticket_id = $1
      ORDER BY h.created_at DESC`,
      [ticketId]
    );

    res.json({
      data: history,
      total: history.length
    });
  })
);

/**
 * GET /workflow/assigned - Get tickets assigned to current user
 */
router.get(
  '/assigned',
  authenticateJWT,
  asyncHandler(async (req, res) => {
    const tickets = await queryMany(
      `SELECT 
        t.*,
        u.first_name as reporter_first_name,
        u.last_name as reporter_last_name,
        a.first_name as assigned_first_name,
        a.last_name as assigned_last_name
      FROM tickets t
      LEFT JOIN users u ON t.user_id = u.user_id
      LEFT JOIN users a ON t.assigned_to = a.user_id
      WHERE t.assigned_to = $1
      ORDER BY t.priority DESC, t.created_at ASC`,
      [req.user.id]
    );

    res.json({ data: tickets });
  })
);

/**
 * GET /workflow/pending - Get pending tickets (by status)
 */
router.get(
  '/pending',
  authenticateJWT,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const { status = 'submission' } = req.query;

    const tickets = await queryMany(
      `SELECT 
        t.*,
        u.first_name as reporter_first_name,
        u.last_name as reporter_last_name
      FROM tickets t
      LEFT JOIN users u ON t.user_id = u.user_id
      WHERE t.workflow_status = $1
      ORDER BY t.priority DESC, t.created_at ASC`,
      [status]
    );

    res.json({ data: tickets });
  })
);

export default router;
