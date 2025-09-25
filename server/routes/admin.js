import express from 'express';
import { body } from 'express-validator';
import { validate, validatePagination, validateSort } from '../middleware/validation.js';
import { authenticate, authorize, requirePermission } from '../middleware/auth.js';
import adminController from '../controllers/adminController.js';

const {
  getDashboardStats,
  getUsers,
  getOrganizations,
  updateOrganizationApproval,
  updateOrganizationStatus,
  getEvents,
  updateEventApproval,
  updateEventStatus,
  updateUserStatus,
  createAdmin
} = adminController;

const router = express.Router();

// Apply admin authentication to all routes
router.use(authenticate);
router.use(authorize('ADMIN'));

/**
 * @route   GET /api/admin/dashboard/stats
 * @desc    Get dashboard statistics
 * @access  Private (Admin)
 */
router.get('/dashboard/stats', getDashboardStats);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with pagination and filters
 * @access  Private (Admin)
 */
router.get('/users',
  validatePagination,
  validateSort(['firstName', 'lastName', 'email', 'createdAt', 'lastLoginAt']),
  getUsers
);

/**
 * @route   PUT /api/admin/users/:id/status
 * @desc    Update user account status
 * @access  Private (Admin)
 */
router.put('/users/:id/status',
  [
    body('accountStatus')
      .isIn(['ACTIVE', 'SUSPENDED', 'INACTIVE'])
      .withMessage('Invalid account status'),
    body('reason')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Reason cannot exceed 500 characters')
  ],
  validate,
  requirePermission('MANAGE_USERS'),
  updateUserStatus
);

/**
 * @route   GET /api/admin/organizations
 * @desc    Get all organizations with pagination and filters
 * @access  Private (Admin)
 */
router.get('/organizations',
  validatePagination,
  validateSort(['name', 'createdAt', 'approvalStatus']),
  getOrganizations
);

/**
 * @route   PUT /api/admin/organizations/:id/approval
 * @desc    Approve or reject organization
 * @access  Private (Admin)
 */
router.put('/organizations/:id/approval',
  [
    body('approvalStatus')
      .isIn(['APPROVED', 'REJECTED'])
      .withMessage('Invalid approval status'),
    body('rejectionReason')
      .if(body('approvalStatus').equals('REJECTED'))
      .notEmpty()
      .withMessage('Rejection reason is required when rejecting')
      .isLength({ max: 500 })
      .withMessage('Rejection reason cannot exceed 500 characters')
  ],
  validate,
  requirePermission('APPROVE_ORGANIZATIONS'),
  updateOrganizationApproval
);

/**
 * @route   PUT /api/admin/organizations/:id/status
 * @desc    Update organization status
 * @access  Private (Admin)
 */
router.put('/organizations/:id/status',
  [
    body('status')
      .isIn(['PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'SUSPENDED'])
      .withMessage('Invalid status')
  ],
  validate,
  updateOrganizationStatus
);

/**
 * @route   GET /api/admin/events
 * @desc    Get all events with pagination and filters
 * @access  Private (Admin)
 */
router.get('/events',
  validatePagination,
  validateSort(['title', 'createdAt', 'startDateTime', 'approvalStatus']),
  getEvents
);

/**
 * @route   PUT /api/admin/events/:id/approval
 * @desc    Approve or reject event
 * @access  Private (Admin)
 */
router.put('/events/:id/approval',
  [
    body('approvalStatus')
      .isIn(['APPROVED', 'REJECTED'])
      .withMessage('Invalid approval status'),
    body('rejectionReason')
      .if(body('approvalStatus').equals('REJECTED'))
      .notEmpty()
      .withMessage('Rejection reason is required when rejecting')
      .isLength({ max: 500 })
      .withMessage('Rejection reason cannot exceed 500 characters')
  ],
  validate,
  requirePermission('APPROVE_EVENTS'),
  updateEventApproval
);

/**
 * @route   PUT /api/admin/events/:id/status
 * @desc    Update event status
 * @access  Private (Admin)
 */
router.put('/events/:id/status',
  [
    body('status')
      .isIn(['PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'CANCELLED'])
      .withMessage('Invalid status')
  ],
  validate,
  updateEventStatus
);

/**
 * @route   POST /api/admin/admins
 * @desc    Create new admin
 * @access  Private (Super Admin)
 */
router.post('/admins',
  [
    body('firstName')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('First name must be between 2 and 50 characters'),
    body('lastName')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Last name must be between 2 and 50 characters'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('role')
      .isIn(['ADMIN', 'SUPER_ADMIN', 'MODERATOR'])
      .withMessage('Invalid admin role')
  ],
  validate,
  requirePermission('MANAGE_ADMINS'),
  createAdmin
);

export default router;
