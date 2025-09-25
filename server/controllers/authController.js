import bcrypt from 'bcryptjs';
import { User, Admin, Organization } from '../models/index.js';
import { 
  generateTokenPair, 
  generateOTPWithExpiry, 
  generateEmailVerificationToken,
  generatePasswordResetToken,
  hashToken,
  verifyRefreshToken
} from '../utils/jwt.js';
import { 
  sendWelcomeEmail, 
  sendOTPEmail, 
  sendEmailVerification,
  sendPasswordResetEmail 
} from '../utils/email.js';

/**
 * Register new user
 */
export const registerUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      mobileNumber,
      studentId,
      stream,
      year,
      department
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Check if student ID is already taken
    if (studentId) {
      const existingStudentId = await User.findOne({ studentId });
      if (existingStudentId) {
        return res.status(400).json({
          success: false,
          message: 'Student ID already registered'
        });
      }
    }

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      mobileNumber,
      studentId,
      stream,
      year,
      department
    });

    // Generate email verification token
    const verificationToken = user.generateEmailVerificationToken();
    
    await user.save();

    // Send welcome email with verification link
    const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
    await sendWelcomeEmail(email, `${firstName} ${lastName}`, 'Student', verificationLink);

    // Generate tokens
    const tokens = generateTokenPair(user, 'USER');

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email for verification.',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          studentId: user.studentId,
          stream: user.stream,
          year: user.year,
          isEmailVerified: user.isEmailVerified,
          accountStatus: user.accountStatus
        },
        tokens
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

/**
 * Register new organization
 */
export const registerOrganization = async (req, res) => {
  try {
    const {
      name,
      description,
      officialEmail,
      password,
      mobileNumber,
      type,
      category,
      website,
      establishedYear,
      address,
      contacts
    } = req.body;

    // Check if organization already exists
    const existingOrg = await Organization.findByEmail(officialEmail);
    if (existingOrg) {
      return res.status(400).json({
        success: false,
        message: 'Organization with this email already exists'
      });
    }

    // Check if organization name is already taken
    const existingName = await Organization.findOne({ name });
    if (existingName) {
      return res.status(400).json({
        success: false,
        message: 'Organization name already registered'
      });
    }

    // Create new organization
    const organization = new Organization({
      name,
      description,
      officialEmail,
      password,
      mobileNumber,
      type,
      category,
      website,
      establishedYear,
      address,
      contacts
    });

    // Generate email verification token
    const verificationToken = organization.generateEmailVerificationToken();
    
    await organization.save();

    // Send welcome email
    const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}&type=organization`;
    await sendWelcomeEmail(officialEmail, name, 'Organization', verificationLink);

    // Generate tokens
    const tokens = generateTokenPair(organization, 'ORGANIZATION');

    res.status(201).json({
      success: true,
      message: 'Organization registered successfully. Please check your email for verification and wait for admin approval.',
      data: {
        organization: {
          id: organization._id,
          name: organization.name,
          officialEmail: organization.officialEmail,
          type: organization.type,
          category: organization.category,
          isEmailVerified: organization.isEmailVerified,
          accountStatus: organization.accountStatus,
          approvalStatus: organization.approvalStatus
        },
        tokens
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Organization registration failed',
      error: error.message
    });
  }
};

/**
 * Login user/organization/admin
 */
export const login = async (req, res) => {
  try {
    const { email, password, userType } = req.body;

    let user;
    let Model;

    // Determine which model to use based on userType
    switch (userType.toUpperCase()) {
      case 'USER':
        Model = User;
        break;
      case 'ADMIN':
        Model = Admin;
        break;
      case 'ORGANIZATION':
        Model = Organization;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid user type'
        });
    }

    // Find user by email
    if (userType.toUpperCase() === 'ORGANIZATION') {
      user = await Model.findOne({ officialEmail: email }).select('+password');
    } else {
      user = await Model.findOne({ email }).select('+password');
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check account status
    if (user.accountStatus === 'SUSPENDED') {
      return res.status(403).json({
        success: false,
        message: 'Account has been suspended'
      });
    }

    // Update login tracking
    user.lastLoginAt = new Date();
    user.loginCount += 1;
    await user.save();

    // Generate tokens
    const tokens = generateTokenPair(user, userType);

    // Prepare user data (exclude sensitive fields)
    const userData = user.toObject();
    delete userData.password;
    delete userData.emailVerificationToken;
    delete userData.passwordResetToken;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        tokens
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

/**
 * Refresh access token
 */
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    let user;
    let Model;

    // Get user based on type
    switch (decoded.userType) {
      case 'USER':
        Model = User;
        break;
      case 'ADMIN':
        Model = Admin;
        break;
      case 'ORGANIZATION':
        Model = Organization;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid user type in token'
        });
    }

    user = await Model.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check account status
    if (user.accountStatus !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'Account is not active'
      });
    }

    // Generate new tokens
    const tokens = generateTokenPair(user, decoded.userType);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: { tokens }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
      error: error.message
    });
  }
};

/**
 * Send OTP for verification
 */
export const sendOTP = async (req, res) => {
  try {
    const { email, purpose = 'verification' } = req.body;

    // Generate OTP
    const { otp, expiresAt } = generateOTPWithExpiry();

    // Store OTP in session or cache (for demo, we'll use a simple in-memory store)
    // In production, use Redis or database
    if (!global.otpStore) global.otpStore = new Map();
    global.otpStore.set(email, { otp, expiresAt, purpose });

    // Send OTP email
    await sendOTPEmail(email, otp, 'User', purpose);

    res.json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        email,
        expiresAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP',
      error: error.message
    });
  }
};

/**
 * Verify OTP
 */
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Get stored OTP
    const storedOTP = global.otpStore?.get(email);
    
    if (!storedOTP) {
      return res.status(400).json({
        success: false,
        message: 'OTP not found or expired'
      });
    }

    // Check if OTP is expired
    if (new Date() > storedOTP.expiresAt) {
      global.otpStore.delete(email);
      return res.status(400).json({
        success: false,
        message: 'OTP has expired'
      });
    }

    // Verify OTP
    if (storedOTP.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Remove OTP from store
    global.otpStore.delete(email);

    res.json({
      success: true,
      message: 'OTP verified successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'OTP verification failed',
      error: error.message
    });
  }
};

/**
 * Verify email address
 */
export const verifyEmail = async (req, res) => {
  try {
    const { token, type = 'user' } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    const hashedToken = hashToken(token);
    let user;
    let Model;

    // Determine model based on type
    switch (type.toLowerCase()) {
      case 'organization':
        Model = Organization;
        break;
      case 'admin':
        Model = Admin;
        break;
      default:
        Model = User;
    }

    // Find user with matching token
    user = await Model.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Update user verification status
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    
    // Activate account if it was pending verification
    if (user.accountStatus === 'PENDING_VERIFICATION') {
      user.accountStatus = 'ACTIVE';
    }

    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Email verification failed',
      error: error.message
    });
  }
};

/**
 * Request password reset
 */
export const requestPasswordReset = async (req, res) => {
  try {
    const { email, userType } = req.body;

    let user;
    let userFound = false;

    // If userType is provided, search in specific model
    if (userType) {
      let Model;
      switch (userType.toUpperCase()) {
        case 'USER':
          Model = User;
          break;
        case 'ADMIN':
          Model = Admin;
          break;
        case 'ORGANIZATION':
          Model = Organization;
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid user type'
          });
      }

      // Find user in specific model
      if (userType.toUpperCase() === 'ORGANIZATION') {
        user = await Model.findOne({ email }).select('+password');
      } else {
        user = await Model.findOne({ email }).select('+password');
      }

      if (user) {
        userFound = true;
      }
    } else {
      // Search in all models if userType not provided
      const models = [
        { Model: User, type: 'USER' },
        { Model: Organization, type: 'ORGANIZATION' },
        { Model: Admin, type: 'ADMIN' }
      ];

      for (const { Model, type } of models) {
        user = await Model.findOne({ email }).select('+password');
        if (user) {
          userFound = true;
          break;
        }
      }
    }

    // Always return success for security (don't reveal if email exists)
    if (!userFound) {
      return res.json({
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent.'
      });
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // Send reset email
    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    const userName = user.firstName ? `${user.firstName} ${user.lastName}` : user.name;

    await sendPasswordResetEmail(user.email || user.officialEmail, userName, resetLink);

    res.json({
      success: true,
      message: 'If an account with this email exists, a password reset link has been sent.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Password reset request failed',
      error: error.message
    });
  }
};

/**
 * Reset password
 */
export const resetPassword = async (req, res) => {
  try {
    const { token, password, userType } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required'
      });
    }

    const hashedToken = hashToken(token);
    let user;
    let Model;

    // Determine model based on userType
    switch (userType.toUpperCase()) {
      case 'USER':
        Model = User;
        break;
      case 'ADMIN':
        Model = Admin;
        break;
      case 'ORGANIZATION':
        Model = Organization;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid user type'
        });
    }

    // Find user with valid reset token
    user = await Model.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Password reset failed',
      error: error.message
    });
  }
};

/**
 * Logout (client-side token invalidation)
 */
export const logout = async (req, res) => {
  try {
    // In a production app, you might want to blacklist the token
    // For now, we'll just send a success response
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: error.message
    });
  }
};

/**
 * Get current user profile
 */
export const getProfile = async (req, res) => {
  try {
    const { id, userType } = req.user;
    let user;
    let Model;

    switch (userType) {
      case 'USER':
        Model = User;
        break;
      case 'ADMIN':
        Model = Admin;
        break;
      case 'ORGANIZATION':
        Model = Organization;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid user type'
        });
    }

    user = await Model.findById(id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message
    });
  }
};

export default {
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
};
