import express from 'express';
import { validatePagination, validateSort, validateObjectId } from '../middleware/validation.js';
import { optionalAuth } from '../middleware/auth.js';
import {
  getPublicEvents,
  getEventById,
  getFeaturedEvents,
  getEventsByCategory,
  getUpcomingEvents,
  getEventStats,
  searchEvents,
  getEventCategories
} from '../controllers/eventController.js';

const router = express.Router();

/**
 * @route   GET /api/events
 * @desc    Get all published events (public)
 * @access  Public
 */
router.get('/',
  validatePagination,
  validateSort(['title', 'startDateTime', 'registrationEndDate', 'createdAt']),
  getPublicEvents
);

/**
 * @route   GET /api/events/featured
 * @desc    Get featured events (public)
 * @access  Public
 */
router.get('/featured', getFeaturedEvents);

/**
 * @route   GET /api/events/upcoming
 * @desc    Get upcoming events (public)
 * @access  Public
 */
router.get('/upcoming', getUpcomingEvents);

/**
 * @route   GET /api/events/stats
 * @desc    Get event statistics (public)
 * @access  Public
 */
router.get('/stats', getEventStats);

/**
 * @route   GET /api/events/categories
 * @desc    Get event categories (public)
 * @access  Public
 */
router.get('/categories', getEventCategories);

/**
 * @route   GET /api/events/search
 * @desc    Search events (public)
 * @access  Public
 */
router.get('/search',
  validatePagination,
  searchEvents
);

/**
 * @route   GET /api/events/category/:category
 * @desc    Get events by category (public)
 * @access  Public
 */
router.get('/category/:category', getEventsByCategory);

/**
 * @route   GET /api/events/:id
 * @desc    Get single event details (public, with optional auth for registration status)
 * @access  Public
 */
router.get('/:id',
  validateObjectId('id'),
  optionalAuth,
  getEventById
);

export default router;
