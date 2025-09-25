import express from 'express';
import { body } from 'express-validator';
import { validate, validatePagination, validateObjectId } from '../middleware/validation.js';
import { authenticate, authorize, requirePermission } from '../middleware/auth.js';
import {
  getNotifications,
  getPublicNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  sendNotification,
  getNotificationStats
} from '../controllers/notificationController.js';

const router = express.Router();

/**
 * @route   GET /api/notifications/public
 * @desc    Get public notifications
 * @access  Public
 */
router.get('/public',
  validatePagination,
  getPublicNotifications
);

// Apply authentication to all routes below this point
router.use(authenticate);

/**
 * @route   GET /api/notifications
 * @desc    Get notifications for authenticated user
 * @access  Private
 */
router.get('/',
  validatePagination,
  getNotifications
);

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.put('/:id/read',
  validateObjectId('id'),
  markAsRead
);

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.put('/read-all', markAllAsRead);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete notification
 * @access  Private
 */
router.delete('/:id',
  validateObjectId('id'),
  deleteNotification
);

/**
 * @route   POST /api/notifications/send
 * @desc    Send notification (Admin only)
 * @access  Private (Admin)
 */
router.post('/send',
  authorize('ADMIN'),
  [
    body('recipients')
      .isArray({ min: 1 })
      .withMessage('Recipients array is required and must not be empty'),
    body('recipientType')
      .isIn(['USER', 'ORGANIZATION', 'ADMIN'])
      .withMessage('Invalid recipient type'),
    body('type')
      .isIn(['EVENT_UPDATE', 'SYSTEM_ANNOUNCEMENT', 'REMINDER', 'APPROVAL', 'GENERAL'])
      .withMessage('Invalid notification type'),
    body('title')
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage('Title must be between 5 and 200 characters'),
    body('message')
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Message must be between 10 and 1000 characters'),
    body('priority')
      .optional()
      .isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
      .withMessage('Invalid priority level'),
    body('channels')
      .optional()
      .isArray()
      .withMessage('Channels must be an array')
  ],
  validate,
  requirePermission('SEND_NOTIFICATIONS'),
  sendNotification
);

/**
 * @route   GET /api/notifications/stats
 * @desc    Get notification statistics (Admin only)
 * @access  Private (Admin)
 */
router.get('/stats',
  authorize('ADMIN'),
  requirePermission('VIEW_ANALYTICS'),
  getNotificationStats
);

export default router;
