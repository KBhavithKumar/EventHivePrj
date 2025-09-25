import { validationResult } from 'express-validator';

/**
 * Validation middleware
 * Checks for validation errors and returns formatted response
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors
    });
  }
  
  next();
};

/**
 * Custom validation for file uploads
 */
export const validateFileUpload = (options = {}) => {
  const {
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif'],
    maxSize = 5 * 1024 * 1024, // 5MB
    required = false
  } = options;

  return (req, res, next) => {
    const file = req.file;
    
    if (!file && required) {
      return res.status(400).json({
        success: false,
        message: 'File is required'
      });
    }
    
    if (file) {
      // Check file type
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
        });
      }
      
      // Check file size
      if (file.size > maxSize) {
        return res.status(400).json({
          success: false,
          message: `File too large. Maximum size: ${Math.round(maxSize / 1024 / 1024)}MB`
        });
      }
    }
    
    next();
  };
};

/**
 * Sanitize input data
 */
export const sanitizeInput = (req, res, next) => {
  // Remove any potential XSS attempts
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  };

  const sanitizeObject = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    const sanitized = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === 'string') {
          sanitized[key] = sanitizeString(obj[key]);
        } else if (typeof obj[key] === 'object') {
          sanitized[key] = sanitizeObject(obj[key]);
        } else {
          sanitized[key] = obj[key];
        }
      }
    }
    return sanitized;
  };

  req.body = sanitizeObject(req.body);
  req.query = sanitizeObject(req.query);
  req.params = sanitizeObject(req.params);
  
  next();
};

/**
 * Validate pagination parameters
 */
export const validatePagination = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const maxLimit = 100;

  if (page < 1) {
    return res.status(400).json({
      success: false,
      message: 'Page number must be greater than 0'
    });
  }

  if (limit < 1 || limit > maxLimit) {
    return res.status(400).json({
      success: false,
      message: `Limit must be between 1 and ${maxLimit}`
    });
  }

  req.pagination = {
    page,
    limit,
    skip: (page - 1) * limit
  };

  next();
};

/**
 * Validate sort parameters
 */
export const validateSort = (allowedFields = []) => {
  return (req, res, next) => {
    const { sortBy, sortOrder } = req.query;
    
    if (sortBy && !allowedFields.includes(sortBy)) {
      return res.status(400).json({
        success: false,
        message: `Invalid sort field. Allowed fields: ${allowedFields.join(', ')}`
      });
    }
    
    if (sortOrder && !['asc', 'desc', '1', '-1'].includes(sortOrder)) {
      return res.status(400).json({
        success: false,
        message: 'Sort order must be "asc" or "desc"'
      });
    }
    
    req.sort = {};
    if (sortBy) {
      const order = sortOrder === 'desc' || sortOrder === '-1' ? -1 : 1;
      req.sort[sortBy] = order;
    }
    
    next();
  };
};

/**
 * Validate search parameters
 */
export const validateSearch = (searchableFields = []) => {
  return (req, res, next) => {
    const { search, searchField } = req.query;
    
    if (search && searchField && !searchableFields.includes(searchField)) {
      return res.status(400).json({
        success: false,
        message: `Invalid search field. Allowed fields: ${searchableFields.join(', ')}`
      });
    }
    
    if (search && search.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search term must be at least 2 characters long'
      });
    }
    
    req.search = {
      term: search,
      field: searchField
    };
    
    next();
  };
};

/**
 * Validate date range parameters
 */
export const validateDateRange = (req, res, next) => {
  const { startDate, endDate } = req.query;
  
  if (startDate && !isValidDate(startDate)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid start date format. Use YYYY-MM-DD'
    });
  }
  
  if (endDate && !isValidDate(endDate)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid end date format. Use YYYY-MM-DD'
    });
  }
  
  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    return res.status(400).json({
      success: false,
      message: 'Start date must be before end date'
    });
  }
  
  req.dateRange = {
    startDate: startDate ? new Date(startDate) : null,
    endDate: endDate ? new Date(endDate) : null
  };
  
  next();
};

/**
 * Helper function to validate date format
 */
const isValidDate = (dateString) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

/**
 * Validate ObjectId parameters
 */
export const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: `${paramName} parameter is required`
      });
    }
    
    // MongoDB ObjectId validation
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!objectIdRegex.test(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName} format`
      });
    }
    
    next();
  };
};

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

/**
 * Validate mobile number format
 */
export const validateMobile = (mobile) => {
  const mobileRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return mobileRegex.test(mobile);
};

/**
 * Validate password strength
 */
export const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return {
    isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers,
    requirements: {
      minLength: password.length >= minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar
    }
  };
};

/**
 * Custom validation for specific business rules
 */
export const validateBusinessRules = {
  // Validate event dates
  eventDates: (req, res, next) => {
    const { startDateTime, endDateTime, registrationStartDate, registrationEndDate } = req.body;
    
    const now = new Date();
    const start = new Date(startDateTime);
    const end = new Date(endDateTime);
    const regStart = new Date(registrationStartDate);
    const regEnd = new Date(registrationEndDate);
    
    if (start <= now) {
      return res.status(400).json({
        success: false,
        message: 'Event start date must be in the future'
      });
    }
    
    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: 'Event end date must be after start date'
      });
    }
    
    if (regEnd >= start) {
      return res.status(400).json({
        success: false,
        message: 'Registration must end before event starts'
      });
    }
    
    if (regStart >= regEnd) {
      return res.status(400).json({
        success: false,
        message: 'Registration start date must be before end date'
      });
    }
    
    next();
  },
  
  // Validate organization approval
  organizationApproval: (req, res, next) => {
    const { approvalStatus, rejectionReason } = req.body;
    
    if (approvalStatus === 'REJECTED' && !rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required when rejecting organization'
      });
    }
    
    next();
  }
};

export default {
  validate,
  validateFileUpload,
  sanitizeInput,
  validatePagination,
  validateSort,
  validateSearch,
  validateDateRange,
  validateObjectId,
  validateEmail,
  validateMobile,
  validatePassword,
  validateBusinessRules
};
