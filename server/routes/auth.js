import express from 'express';
import { body, query } from 'express-validator';
import { validate } from '../middleware/validation.js';
import { authRateLimit, authenticate } from '../middleware/auth.js';
import {
  registerUser,
  registerOrganization,
  login,
  refreshToken,
  sendOTP,
  verifyOTP,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  logout,
  getProfile
} from '../controllers/authController.js';

const router = express.Router();

// Validation rules
const userRegistrationValidation = [
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
  body('mobileNumber')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid mobile number'),
  body('studentId')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Student ID must be between 1 and 20 characters'),
  body('stream')
    .isIn(['PUC', 'B.TECH', 'M.TECH', 'MBA', 'MCA', 'B.SC', 'M.SC', 'B.COM', 'M.COM', 'BA', 'MA', 'OTHER'])
    .withMessage('Please select a valid stream'),
  body('year')
    .isInt({ min: 1, max: 6 })
    .withMessage('Year must be between 1 and 6'),
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department name cannot exceed 100 characters')
];

const organizationRegistrationValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Organization name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('officialEmail')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid official email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('type')
    .isIn(['DEPARTMENT', 'CLUB', 'SOCIETY', 'COMMITTEE', 'ASSOCIATION', 'EXTERNAL'])
    .withMessage('Please select a valid organization type'),
  body('category')
    .isIn(['ACADEMIC', 'TECHNICAL', 'CULTURAL', 'SPORTS', 'SOCIAL', 'PROFESSIONAL', 'OTHER'])
    .withMessage('Please select a valid category'),
  body('mobileNumber')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid mobile number'),
  body('website')
    .optional()
    .isURL()
    .withMessage('Please provide a valid website URL'),
  body('establishedYear')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .withMessage('Please provide a valid established year')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  body('userType')
    .isIn(['USER', 'ADMIN', 'ORGANIZATION'])
    .withMessage('Please select a valid user type')
];

const otpValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('purpose')
    .optional()
    .isIn(['verification', 'login', 'password_reset'])
    .withMessage('Invalid OTP purpose')
];

const verifyOTPValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be a 6-digit number')
];

const passwordResetValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('userType')
    .isIn(['USER', 'ADMIN', 'ORGANIZATION'])
    .withMessage('Please select a valid user type')
];

const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
];

const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('userType')
    .isIn(['USER', 'ADMIN', 'ORGANIZATION'])
    .withMessage('Please select a valid user type')
];

const refreshTokenValidation = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required')
];

const emailVerificationValidation = [
  query('token')
    .notEmpty()
    .withMessage('Verification token is required'),
  query('type')
    .optional()
    .isIn(['user', 'admin', 'organization'])
    .withMessage('Invalid verification type')
];

// Routes

/**
 * @route   POST /api/auth/register/user
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register/user',
  authRateLimit(5, 15 * 60 * 1000), // 5 attempts per 15 minutes
  userRegistrationValidation,
  validate,
  registerUser
);

/**
 * @route   POST /api/auth/register/organization
 * @desc    Register a new organization
 * @access  Public
 */
router.post('/register/organization',
  authRateLimit(3, 15 * 60 * 1000), // 3 attempts per 15 minutes
  organizationRegistrationValidation,
  validate,
  registerOrganization
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user/admin/organization
 * @access  Public
 */
router.post('/login',
  authRateLimit(5, 15 * 60 * 1000), // 5 attempts per 15 minutes
  loginValidation,
  validate,
  login
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh',
  refreshTokenValidation,
  validate,
  refreshToken
);

/**
 * @route   POST /api/auth/send-otp
 * @desc    Send OTP for verification
 * @access  Public
 */
router.post('/send-otp',
  authRateLimit(3, 5 * 60 * 1000), // 3 attempts per 5 minutes
  otpValidation,
  validate,
  sendOTP
);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP
 * @access  Public
 */
router.post('/verify-otp',
  authRateLimit(5, 15 * 60 * 1000), // 5 attempts per 15 minutes
  verifyOTPValidation,
  validate,
  verifyOTP
);

/**
 * @route   GET /api/auth/verify-email
 * @desc    Verify email address
 * @access  Public
 */
router.get('/verify-email',
  emailVerificationValidation,
  validate,
  verifyEmail
);

/**
 * @route   POST /api/auth/request-password-reset
 * @desc    Request password reset
 * @access  Public
 */
router.post('/request-password-reset',
  authRateLimit(3, 15 * 60 * 1000), // 3 attempts per 15 minutes
  passwordResetValidation,
  validate,
  requestPasswordReset
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset (alias for frontend compatibility)
 * @access  Public
 */
router.post('/forgot-password',
  authRateLimit(3, 15 * 60 * 1000), // 3 attempts per 15 minutes
  forgotPasswordValidation,
  validate,
  requestPasswordReset
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset-password',
  authRateLimit(5, 15 * 60 * 1000), // 5 attempts per 15 minutes
  resetPasswordValidation,
  validate,
  resetPassword
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authenticate, logout);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticate, getProfile);

export default router;
