import express from 'express';
import { body } from 'express-validator';
import { validate, validatePagination, validateSort } from '../middleware/validation.js';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getDashboardStats,
  getProfile,
  updateProfile,
  getAvailableEvents,
  registerForEvent,
  getRegisteredEvents,
  cancelRegistration,
  getNotifications,
  markNotificationRead
} from '../controllers/userController.js';

const router = express.Router();

// Apply user authentication to all routes
router.use(authenticate);
router.use(authorize('USER'));

/**
 * @route   GET /api/users/dashboard/stats
 * @desc    Get user dashboard statistics
 * @access  Private (User)
 */
router.get('/dashboard/stats', getDashboardStats);

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile
 * @access  Private (User)
 */
router.get('/profile', getProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private (User)
 */
router.put('/profile',
  [
    body('firstName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('First name must be between 2 and 50 characters'),
    body('lastName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Last name must be between 2 and 50 characters'),
    body('mobileNumber')
      .optional()
      .matches(/^[\+]?[1-9][\d]{0,15}$/)
      .withMessage('Please provide a valid mobile number'),
    body('year')
      .optional()
      .isInt({ min: 1, max: 6 })
      .withMessage('Year must be between 1 and 6'),
    body('skills')
      .optional()
      .isArray()
      .withMessage('Skills must be an array'),
    body('skills.*')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Each skill must be between 1 and 50 characters')
  ],
  validate,
  updateProfile
);

/**
 * @route   GET /api/users/events/available
 * @desc    Get available events for user
 * @access  Private (User)
 */
router.get('/events/available',
  validatePagination,
  validateSort(['title', 'startDateTime', 'registrationEndDate']),
  getAvailableEvents
);

/**
 * @route   POST /api/users/events/:eventId/register
 * @desc    Register for an event
 * @access  Private (User)
 */
router.post('/events/:eventId/register',
  [
    body('teamMembers')
      .optional()
      .isArray()
      .withMessage('Team members must be an array'),
    body('teamMembers.*.name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Team member name must be between 2 and 100 characters'),
    body('teamMembers.*.email')
      .optional()
      .isEmail()
      .withMessage('Please provide valid email for team member'),
    body('additionalInfo')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Additional info cannot exceed 500 characters')
  ],
  validate,
  registerForEvent
);

/**
 * @route   GET /api/users/events/registered
 * @desc    Get user's registered events
 * @access  Private (User)
 */
router.get('/events/registered',
  validatePagination,
  validateSort(['registeredAt', 'status']),
  getRegisteredEvents
);

/**
 * @route   DELETE /api/users/events/:eventId/register
 * @desc    Cancel event registration
 * @access  Private (User)
 */
router.delete('/events/:eventId/register', cancelRegistration);

/**
 * @route   GET /api/users/notifications
 * @desc    Get user notifications
 * @access  Private (User)
 */
router.get('/notifications',
  validatePagination,
  getNotifications
);

/**
 * @route   PUT /api/users/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private (User)
 */
router.put('/notifications/:id/read', markNotificationRead);

export default router;
