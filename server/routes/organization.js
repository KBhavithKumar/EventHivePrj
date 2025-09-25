import express from 'express';
import { body } from 'express-validator';
import { validate, validatePagination, validateSort, validateBusinessRules } from '../middleware/validation.js';
import { authenticate, authorize, requireOrganizationApproval } from '../middleware/auth.js';
import {
  getDashboardStats,
  getProfile,
  updateProfile,
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventParticipants,
  sendParticipantNotification
} from '../controllers/organizationController.js';

const router = express.Router();

/**
 * @route   GET /api/organizations
 * @desc    Get public list of active organizations
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { limit = 10, status = 'ACTIVE' } = req.query;

    const Organization = (await import('../models/index.js')).Organization;

    const organizations = await Organization.find({
      status: status.toUpperCase(),
      isActive: true
    })
    .select('name type category logo establishedYear')
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'Organizations retrieved successfully',
      data: {
        organizations,
        total: organizations.length
      }
    });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching organizations',
      data: null
    });
  }
});

// Apply organization authentication to protected routes
router.use(authenticate);
router.use(authorize('ORGANIZATION'));

/**
 * @route   GET /api/organizations/dashboard/stats
 * @desc    Get organization dashboard statistics
 * @access  Private (Organization)
 */
router.get('/dashboard/stats', getDashboardStats);

/**
 * @route   GET /api/organizations/profile
 * @desc    Get organization profile
 * @access  Private (Organization)
 */
router.get('/profile', getProfile);

/**
 * @route   PUT /api/organizations/profile
 * @desc    Update organization profile
 * @access  Private (Organization)
 */
router.put('/profile',
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Organization name must be between 2 and 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Description must be between 10 and 1000 characters'),
    body('website')
      .optional()
      .isURL()
      .withMessage('Please provide a valid website URL'),
    body('mobileNumber')
      .optional()
      .matches(/^[\+]?[1-9][\d]{0,15}$/)
      .withMessage('Please provide a valid mobile number')
  ],
  validate,
  updateProfile
);

/**
 * @route   GET /api/organizations/events
 * @desc    Get organization events
 * @access  Private (Organization)
 */
router.get('/events',
  validatePagination,
  validateSort(['title', 'createdAt', 'startDateTime', 'status']),
  getEvents
);

/**
 * @route   POST /api/organizations/events
 * @desc    Create new event
 * @access  Private (Approved Organization)
 */
router.post('/events',
  requireOrganizationApproval,
  [
    body('title')
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage('Event title must be between 5 and 200 characters'),
    body('description')
      .trim()
      .isLength({ min: 20, max: 2000 })
      .withMessage('Event description must be between 20 and 2000 characters'),
    body('category')
      .isIn(['TECHNICAL', 'CULTURAL', 'SPORTS', 'ACADEMIC', 'WORKSHOP', 'SEMINAR', 'COMPETITION', 'OTHER'])
      .withMessage('Please select a valid category'),
    body('type')
      .isIn(['ONLINE', 'OFFLINE', 'HYBRID'])
      .withMessage('Please select a valid event type'),
    body('startDateTime')
      .isISO8601()
      .withMessage('Please provide a valid start date and time'),
    body('endDateTime')
      .isISO8601()
      .withMessage('Please provide a valid end date and time'),
    body('registrationStartDate')
      .isISO8601()
      .withMessage('Please provide a valid registration start date'),
    body('registrationEndDate')
      .isISO8601()
      .withMessage('Please provide a valid registration end date'),
    body('maxParticipants')
      .isInt({ min: 1, max: 10000 })
      .withMessage('Maximum participants must be between 1 and 10000')
  ],
  validate,
  validateBusinessRules.eventDates,
  createEvent
);

/**
 * @route   PUT /api/organizations/events/:id
 * @desc    Update event
 * @access  Private (Organization)
 */
router.put('/events/:id',
  [
    body('title')
      .optional()
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage('Event title must be between 5 and 200 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ min: 20, max: 2000 })
      .withMessage('Event description must be between 20 and 2000 characters'),
    body('startDateTime')
      .optional()
      .isISO8601()
      .withMessage('Please provide a valid start date and time'),
    body('endDateTime')
      .optional()
      .isISO8601()
      .withMessage('Please provide a valid end date and time')
  ],
  validate,
  updateEvent
);

/**
 * @route   DELETE /api/organizations/events/:id
 * @desc    Delete event
 * @access  Private (Organization)
 */
router.delete('/events/:id', deleteEvent);

/**
 * @route   GET /api/organizations/events/:eventId/participants
 * @desc    Get event participants
 * @access  Private (Organization)
 */
router.get('/events/:eventId/participants',
  validatePagination,
  validateSort(['registeredAt', 'status']),
  getEventParticipants
);

/**
 * @route   POST /api/organizations/events/:eventId/notifications
 * @desc    Send notification to event participants
 * @access  Private (Organization)
 */
router.post('/events/:eventId/notifications',
  [
    body('subject')
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage('Subject must be between 5 and 200 characters'),
    body('message')
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Message must be between 10 and 1000 characters'),
    body('recipientType')
      .optional()
      .isIn(['ALL', 'CONFIRMED', 'PENDING'])
      .withMessage('Invalid recipient type')
  ],
  validate,
  sendParticipantNotification
);

export default router;
