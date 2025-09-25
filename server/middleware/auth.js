import { verifyAccessToken, extractTokenFromHeader, validateTokenPayload } from '../utils/jwt.js';
import { User, Admin, Organization } from '../models/index.js';

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export const authenticate = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    // Verify token
    const decoded = verifyAccessToken(token);
    
    // Validate token payload
    if (!validateTokenPayload(decoded)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload'
      });
    }

    // Check if account is active
    if (decoded.accountStatus !== 'ACTIVE') {
      return res.status(401).json({
        success: false,
        message: 'Account is not active',
        accountStatus: decoded.accountStatus
      });
    }

    // Attach user info to request
    req.user = decoded;
    req.userType = decoded.userType;
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error: error.message
    });
  }
};

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't require it
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (token) {
      const decoded = verifyAccessToken(token);
      
      if (validateTokenPayload(decoded) && decoded.accountStatus === 'ACTIVE') {
        req.user = decoded;
        req.userType = decoded.userType;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

/**
 * Authorization middleware factory
 * Creates middleware to check user roles
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userRole = req.user.userType;
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        required: allowedRoles,
        current: userRole
      });
    }

    next();
  };
};

/**
 * Admin permission middleware factory
 * Checks specific admin permissions
 */
export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user || req.user.userType !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    if (!req.user.permissions || !req.user.permissions[permission]) {
      return res.status(403).json({
        success: false,
        message: `Permission '${permission}' required`,
        userPermissions: req.user.permissions
      });
    }

    next();
  };
};

/**
 * Email verification middleware
 * Requires verified email for certain actions
 */
export const requireEmailVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: 'Email verification required',
      code: 'EMAIL_NOT_VERIFIED'
    });
  }

  next();
};

/**
 * Organization approval middleware
 * Requires approved organization status
 */
export const requireOrganizationApproval = (req, res, next) => {
  if (!req.user || req.user.userType !== 'ORGANIZATION') {
    return res.status(403).json({
      success: false,
      message: 'Organization access required'
    });
  }

  if (req.user.approvalStatus !== 'APPROVED') {
    return res.status(403).json({
      success: false,
      message: 'Organization approval required',
      approvalStatus: req.user.approvalStatus
    });
  }

  next();
};

/**
 * Rate limiting middleware for authentication endpoints
 */
export const authRateLimit = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const attempts = new Map();

  return (req, res, next) => {
    const key = req.ip + (req.body.email || req.body.officialEmail || '');
    const now = Date.now();
    
    // Clean old entries
    for (const [k, v] of attempts.entries()) {
      if (now - v.firstAttempt > windowMs) {
        attempts.delete(k);
      }
    }

    const userAttempts = attempts.get(key);
    
    if (!userAttempts) {
      attempts.set(key, { count: 1, firstAttempt: now });
      return next();
    }

    if (userAttempts.count >= maxAttempts) {
      const timeLeft = Math.ceil((windowMs - (now - userAttempts.firstAttempt)) / 1000 / 60);
      return res.status(429).json({
        success: false,
        message: `Too many authentication attempts. Try again in ${timeLeft} minutes.`,
        retryAfter: timeLeft
      });
    }

    userAttempts.count++;
    next();
  };
};

/**
 * Middleware to load full user data
 * Fetches complete user object from database
 */
export const loadUserData = async (req, res, next) => {
  try {
    if (!req.user) {
      return next();
    }

    let userData;
    const { id, userType } = req.user;

    switch (userType) {
      case 'USER':
        userData = await User.findById(id).select('-password');
        break;
      case 'ADMIN':
        userData = await Admin.findById(id).select('-password');
        break;
      case 'ORGANIZATION':
        userData = await Organization.findById(id).select('-password');
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid user type'
        });
    }

    if (!userData) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    req.userData = userData;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error loading user data',
      error: error.message
    });
  }
};

/**
 * Middleware to check if user owns resource
 * For user-specific resources
 */
export const requireOwnership = (resourceField = 'user') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Admin can access any resource
    if (req.user.userType === 'ADMIN') {
      return next();
    }

    const resourceId = req.params.id || req.body[resourceField];
    
    if (req.user.id !== resourceId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own resources.'
      });
    }

    next();
  };
};

/**
 * Middleware to validate user account status
 */
export const validateAccountStatus = (allowedStatuses = ['ACTIVE']) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!allowedStatuses.includes(req.user.accountStatus)) {
      return res.status(403).json({
        success: false,
        message: 'Account status does not allow this action',
        accountStatus: req.user.accountStatus,
        allowedStatuses
      });
    }

    next();
  };
};

/**
 * Middleware for API key authentication (for external services)
 */
export const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: 'API key required'
    });
  }

  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({
      success: false,
      message: 'Invalid API key'
    });
  }

  next();
};

export default {
  authenticate,
  optionalAuth,
  authorize,
  requirePermission,
  requireEmailVerification,
  requireOrganizationApproval,
  authRateLimit,
  loadUserData,
  requireOwnership,
  validateAccountStatus,
  authenticateApiKey
};
