import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '30d';

/**
 * Generate JWT Access Token
 * @param {Object} payload - User data to encode
 * @returns {String} JWT token
 */
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
    issuer: 'eventhive',
    audience: 'eventhive-users'
  });
};

/**
 * Generate JWT Refresh Token
 * @param {Object} payload - User data to encode
 * @returns {String} JWT refresh token
 */
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRE,
    issuer: 'eventhive',
    audience: 'eventhive-users'
  });
};

/**
 * Verify JWT Access Token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded payload
 */
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'eventhive',
      audience: 'eventhive-users'
    });
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Verify JWT Refresh Token
 * @param {String} token - JWT refresh token to verify
 * @returns {Object} Decoded payload
 */
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'eventhive',
      audience: 'eventhive-users'
    });
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

/**
 * Generate OTP
 * @param {Number} length - Length of OTP (default: 6)
 * @returns {String} Generated OTP
 */
export const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  
  return otp;
};

/**
 * Generate secure random token
 * @param {Number} bytes - Number of bytes (default: 32)
 * @returns {String} Generated token
 */
export const generateSecureToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

/**
 * Hash token using SHA256
 * @param {String} token - Token to hash
 * @returns {String} Hashed token
 */
export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Create token payload for different user types
 * @param {Object} user - User object
 * @param {String} userType - Type of user (USER, ADMIN, ORGANIZATION)
 * @returns {Object} Token payload
 */
export const createTokenPayload = (user, userType) => {
  const basePayload = {
    id: user._id,
    email: user.email || user.officialEmail,
    userType: userType.toUpperCase(),
    isEmailVerified: user.isEmailVerified,
    accountStatus: user.accountStatus
  };

  // Add user-specific fields based on type
  switch (userType.toUpperCase()) {
    case 'USER':
      return {
        ...basePayload,
        firstName: user.firstName,
        lastName: user.lastName,
        studentId: user.studentId,
        stream: user.stream,
        year: user.year
      };
      
    case 'ADMIN':
      return {
        ...basePayload,
        firstName: user.firstName,
        lastName: user.lastName,
        employeeId: user.employeeId,
        role: user.role,
        permissions: user.permissions
      };
      
    case 'ORGANIZATION':
      return {
        ...basePayload,
        name: user.name,
        type: user.type,
        category: user.category,
        approvalStatus: user.approvalStatus
      };
      
    default:
      return basePayload;
  }
};

/**
 * Generate token pair (access + refresh)
 * @param {Object} user - User object
 * @param {String} userType - Type of user
 * @returns {Object} Token pair
 */
export const generateTokenPair = (user, userType) => {
  const payload = createTokenPayload(user, userType);
  
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken({
    id: payload.id,
    userType: payload.userType
  });
  
  return {
    accessToken,
    refreshToken,
    expiresIn: JWT_EXPIRE,
    tokenType: 'Bearer'
  };
};

/**
 * Extract token from Authorization header
 * @param {String} authHeader - Authorization header value
 * @returns {String|null} Extracted token
 */
export const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7); // Remove 'Bearer ' prefix
};

/**
 * Validate token payload
 * @param {Object} payload - Decoded token payload
 * @returns {Boolean} Is valid
 */
export const validateTokenPayload = (payload) => {
  const requiredFields = ['id', 'email', 'userType', 'accountStatus'];
  
  return requiredFields.every(field => payload.hasOwnProperty(field)) &&
         ['USER', 'ADMIN', 'ORGANIZATION'].includes(payload.userType) &&
         ['ACTIVE', 'PENDING_VERIFICATION'].includes(payload.accountStatus);
};

/**
 * Check if token is about to expire
 * @param {Object} payload - Decoded token payload
 * @param {Number} bufferMinutes - Buffer time in minutes (default: 15)
 * @returns {Boolean} Is expiring soon
 */
export const isTokenExpiringSoon = (payload, bufferMinutes = 15) => {
  if (!payload.exp) return false;
  
  const expirationTime = payload.exp * 1000; // Convert to milliseconds
  const bufferTime = bufferMinutes * 60 * 1000; // Convert to milliseconds
  const currentTime = Date.now();
  
  return (expirationTime - currentTime) <= bufferTime;
};

/**
 * Generate password reset token with expiry
 * @returns {Object} Token and expiry
 */
export const generatePasswordResetToken = () => {
  const token = generateSecureToken();
  const hashedToken = hashToken(token);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  
  return {
    token,
    hashedToken,
    expiresAt
  };
};

/**
 * Generate email verification token with expiry
 * @returns {Object} Token and expiry
 */
export const generateEmailVerificationToken = () => {
  const token = generateSecureToken();
  const hashedToken = hashToken(token);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  
  return {
    token,
    hashedToken,
    expiresAt
  };
};

/**
 * Generate OTP with expiry
 * @param {Number} length - OTP length
 * @param {Number} expiryMinutes - Expiry in minutes
 * @returns {Object} OTP and expiry
 */
export const generateOTPWithExpiry = (length = 6, expiryMinutes = 10) => {
  const otp = generateOTP(length);
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
  
  return {
    otp,
    expiresAt
  };
};

export default {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateOTP,
  generateSecureToken,
  hashToken,
  createTokenPayload,
  generateTokenPair,
  extractTokenFromHeader,
  validateTokenPayload,
  isTokenExpiringSoon,
  generatePasswordResetToken,
  generateEmailVerificationToken,
  generateOTPWithExpiry
};
