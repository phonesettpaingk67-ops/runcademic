/**
 * Request Validation Middleware
 * Validates request bodies against schemas
 */

import Joi from 'joi';

/**
 * Validate request body against schema
 * @param {Object} schema - Joi schema
 */
function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const messages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type
      }));

      console.log('❌ Validation Error:', {
        path: req.path,
        body: req.body,
        errors: messages
      });

      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: messages
      });
    }

    req.validatedBody = value;
    next();
  };
}

// Common validation schemas
const schemas = {
  // User schemas
  createUser: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    name: Joi.string().required(),
    phone: Joi.string().optional(),
    role: Joi.string().valid('student', 'faculty', 'admin', 'staff').default('student')
  }),

  updateUser: Joi.object({
    first_name: Joi.string().max(100).optional().allow(null, ''),
    last_name: Joi.string().max(100).optional().allow(null, ''),
    name: Joi.string().max(200).optional().allow(null, ''),
    email: Joi.string().email().max(255).optional().allow(null, ''),
    phone: Joi.string().max(20).optional().allow(null, ''),
    username: Joi.string().max(100).optional(),
    avatar_url: Joi.string().uri().optional(),
    department_id: Joi.number().optional()
  }).min(1), // At least one field must be provided

  // Ticket schemas
  createTicket: Joi.object({
    title: Joi.string().min(5).max(200).required(),
    description: Joi.string().min(10).required(),
    category: Joi.string().optional(),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
    status: Joi.string().valid('open', 'in_progress', 'waiting', 'resolved', 'closed').default('open'),
    assigned_to: Joi.number().optional().allow(null)
  }),

  updateTicket: Joi.object({
    title: Joi.string().min(5).max(200).optional(),
    description: Joi.string().min(10).optional(),
    category: Joi.string().optional(),
    status: Joi.string().valid('open', 'in_progress', 'waiting', 'resolved', 'closed').optional(),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
    assigned_to: Joi.number().optional().allow(null)
  }),

  // Comment schemas
  createComment: Joi.object({
    comment_text: Joi.string().min(1).required()
  }),

  // Schedule schemas
  createSchedule: Joi.object({
    title: Joi.string().min(3).required(),
    description: Joi.string().optional(),
    start_time: Joi.date().iso().required(),
    end_time: Joi.date().iso().required(),
    location: Joi.string().optional(),
    department_id: Joi.number().required()
  }),

  updateSchedule: Joi.object({
    title: Joi.string().min(3).optional(),
    description: Joi.string().optional(),
    start_time: Joi.date().iso().optional(),
    end_time: Joi.date().iso().optional(),
    location: Joi.string().optional()
  }),

  // Task schemas
  createTask: Joi.object({
    title: Joi.string().min(3).required(),
    description: Joi.string().optional(),
    ticket_id: Joi.number().required(),
    assigned_to: Joi.number().required(),
    due_date: Joi.date().iso().optional(),
    priority: Joi.string().valid('low', 'medium', 'high').default('medium')
  }),

  updateTask: Joi.object({
    title: Joi.string().min(3).optional(),
    description: Joi.string().optional(),
    status: Joi.string().valid('pending', 'in_progress', 'completed').optional(),
    assigned_to: Joi.number().optional(),
    due_date: Joi.date().iso().optional(),
    priority: Joi.string().valid('low', 'medium', 'high').optional()
  }),

  // Pagination schema
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().optional(),
    order: Joi.string().valid('asc', 'desc').default('desc')
  })
};

export {
  validate,
  schemas
};
