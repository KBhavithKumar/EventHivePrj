import express from 'express';
import { body } from 'express-validator';
import { validate, validatePagination, validateSort, validateObjectId } from '../middleware/validation.js';
import { authenticate, authorize, requirePermission } from '../middleware/auth.js';
import {
  createTicket,
  getUserTickets,
  getTicketById,
  addTicketMessage,
  getAllTickets,
  updateTicket,
  getTicketStats
} from '../controllers/ticketController.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

/**
 * @route   POST /api/tickets
 * @desc    Create a new support ticket
 * @access  Private
 */
router.post('/',
  [
    body('subject')
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage('Subject must be between 5 and 200 characters'),
    body('description')
      .trim()
      .isLength({ min: 10, max: 2000 })
      .withMessage('Description must be between 10 and 2000 characters'),
    body('category')
      .isIn(['TECHNICAL', 'BILLING', 'GENERAL', 'EVENT_RELATED', 'ACCOUNT', 'BUG_REPORT', 'FEATURE_REQUEST'])
      .withMessage('Invalid ticket category'),
    body('priority')
      .optional()
      .isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
      .withMessage('Invalid priority level')
  ],
  validate,
  createTicket
);

/**
 * @route   GET /api/tickets
 * @desc    Get tickets for authenticated user
 * @access  Private
 */
router.get('/',
  validatePagination,
  validateSort(['createdAt', 'lastUpdated', 'priority', 'status']),
  getUserTickets
);

/**
 * @route   GET /api/tickets/:id
 * @desc    Get single ticket details
 * @access  Private
 */
router.get('/:id',
  validateObjectId('id'),
  getTicketById
);

/**
 * @route   POST /api/tickets/:id/messages
 * @desc    Add message to ticket
 * @access  Private
 */
router.post('/:id/messages',
  validateObjectId('id'),
  [
    body('message')
      .trim()
      .isLength({ min: 1, max: 2000 })
      .withMessage('Message must be between 1 and 2000 characters')
  ],
  validate,
  addTicketMessage
);

/**
 * @route   GET /api/tickets/admin/all
 * @desc    Get all tickets (Admin only)
 * @access  Private (Admin)
 */
router.get('/admin/all',
  authorize('ADMIN'),
  validatePagination,
  validateSort(['createdAt', 'lastUpdated', 'priority', 'status']),
  requirePermission('MANAGE_TICKETS'),
  getAllTickets
);

/**
 * @route   PUT /api/tickets/:id
 * @desc    Update ticket (Admin only)
 * @access  Private (Admin)
 */
router.put('/:id',
  authorize('ADMIN'),
  validateObjectId('id'),
  [
    body('status')
      .optional()
      .isIn(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'])
      .withMessage('Invalid ticket status'),
    body('priority')
      .optional()
      .isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
      .withMessage('Invalid priority level'),
    body('category')
      .optional()
      .isIn(['TECHNICAL', 'BILLING', 'GENERAL', 'EVENT_RELATED', 'ACCOUNT', 'BUG_REPORT', 'FEATURE_REQUEST'])
      .withMessage('Invalid ticket category'),
    body('internalNotes')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Internal notes cannot exceed 1000 characters')
  ],
  validate,
  requirePermission('MANAGE_TICKETS'),
  updateTicket
);

/**
 * @route   GET /api/tickets/admin/stats
 * @desc    Get ticket statistics (Admin only)
 * @access  Private (Admin)
 */
router.get('/admin/stats',
  authorize('ADMIN'),
  requirePermission('VIEW_ANALYTICS'),
  getTicketStats
);

export default router;
