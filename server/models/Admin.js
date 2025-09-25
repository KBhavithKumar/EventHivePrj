import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const adminSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  
  // Contact Information
  mobileNumber: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid mobile number']
  },
  
  // Admin Details
  employeeId: {
    type: String,
    required: [true, 'Employee ID is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  designation: {
    type: String,
    required: [true, 'Designation is required'],
    trim: true,
    maxlength: [100, 'Designation cannot exceed 100 characters']
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true,
    maxlength: [100, 'Department cannot exceed 100 characters']
  },
  
  // Role & Permissions
  role: {
    type: String,
    enum: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'],
    default: 'ADMIN',
    uppercase: true
  },
  permissions: {
    // User Management
    canManageUsers: {
      type: Boolean,
      default: true
    },
    canSuspendUsers: {
      type: Boolean,
      default: false
    },
    canDeleteUsers: {
      type: Boolean,
      default: false
    },
    
    // Organization Management
    canManageOrganizations: {
      type: Boolean,
      default: true
    },
    canApproveOrganizations: {
      type: Boolean,
      default: false
    },
    canSuspendOrganizations: {
      type: Boolean,
      default: false
    },
    
    // Event Management
    canManageEvents: {
      type: Boolean,
      default: true
    },
    canApproveEvents: {
      type: Boolean,
      default: false
    },
    canCancelEvents: {
      type: Boolean,
      default: false
    },
    
    // System Management
    canManageAdmins: {
      type: Boolean,
      default: false
    },
    canViewAnalytics: {
      type: Boolean,
      default: true
    },
    canManageSettings: {
      type: Boolean,
      default: false
    },
    canExportData: {
      type: Boolean,
      default: true
    }
  },
  
  // Profile Information
  profilePicture: {
    type: String, // URL to uploaded image
    default: null
  },
  
  // Account Status
  accountStatus: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
    default: 'ACTIVE',
    uppercase: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  
  // Security
  emailVerificationToken: {
    type: String,
    select: false
  },
  emailVerificationExpires: {
    type: Date,
    select: false
  },
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  },
  
  // Activity Tracking
  lastLoginAt: {
    type: Date,
    default: null
  },
  loginCount: {
    type: Number,
    default: 0
  },
  
  // Admin Actions History
  actionsPerformed: [{
    action: {
      type: String,
      required: true,
      enum: [
        'USER_CREATED', 'USER_UPDATED', 'USER_SUSPENDED', 'USER_DELETED',
        'ORG_APPROVED', 'ORG_REJECTED', 'ORG_SUSPENDED', 'ORG_UPDATED',
        'EVENT_APPROVED', 'EVENT_REJECTED', 'EVENT_CANCELLED', 'EVENT_UPDATED',
        'ADMIN_CREATED', 'ADMIN_UPDATED', 'ADMIN_DELETED',
        'SETTINGS_UPDATED', 'DATA_EXPORTED'
      ]
    },
    targetType: {
      type: String,
      enum: ['USER', 'ORGANIZATION', 'EVENT', 'ADMIN', 'SYSTEM'],
      required: true
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: function() {
        return this.targetType !== 'SYSTEM';
      }
    },
    details: {
      type: String,
      maxlength: [500, 'Action details cannot exceed 500 characters']
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Created By (for audit trail)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
adminSchema.index({ email: 1 });
adminSchema.index({ employeeId: 1 });
adminSchema.index({ role: 1 });
adminSchema.index({ accountStatus: 1 });
adminSchema.index({ 'actionsPerformed.timestamp': -1 });

// Virtual for full name
adminSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for recent actions (last 30 days)
adminSchema.virtual('recentActions').get(function() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return this.actionsPerformed.filter(action => action.timestamp >= thirtyDaysAgo);
});

// Pre-save middleware to hash password
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to set permissions based on role
adminSchema.pre('save', function(next) {
  if (this.isModified('role')) {
    switch (this.role) {
      case 'SUPER_ADMIN':
        // Super admin gets all permissions
        Object.keys(this.permissions.toObject()).forEach(permission => {
          this.permissions[permission] = true;
        });
        break;
        
      case 'ADMIN':
        // Admin gets most permissions except critical ones
        this.permissions.canManageUsers = true;
        this.permissions.canManageOrganizations = true;
        this.permissions.canApproveOrganizations = true;
        this.permissions.canManageEvents = true;
        this.permissions.canApproveEvents = true;
        this.permissions.canViewAnalytics = true;
        this.permissions.canExportData = true;
        // Critical permissions remain false
        this.permissions.canDeleteUsers = false;
        this.permissions.canManageAdmins = false;
        this.permissions.canManageSettings = false;
        break;
        
      case 'MODERATOR':
        // Moderator gets limited permissions
        this.permissions.canManageUsers = true;
        this.permissions.canManageOrganizations = true;
        this.permissions.canManageEvents = true;
        this.permissions.canViewAnalytics = true;
        // All other permissions are false
        Object.keys(this.permissions.toObject()).forEach(permission => {
          if (!['canManageUsers', 'canManageOrganizations', 'canManageEvents', 'canViewAnalytics'].includes(permission)) {
            this.permissions[permission] = false;
          }
        });
        break;
    }
  }
  next();
});

// Method to compare password
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate email verification token
adminSchema.methods.generateEmailVerificationToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  
  this.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  return token;
};

// Method to generate password reset token
adminSchema.methods.generatePasswordResetToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return token;
};

// Method to log admin action
adminSchema.methods.logAction = function(action, targetType, targetId = null, details = '') {
  this.actionsPerformed.push({
    action,
    targetType,
    targetId,
    details,
    timestamp: new Date()
  });
  
  // Keep only last 1000 actions to prevent document from growing too large
  if (this.actionsPerformed.length > 1000) {
    this.actionsPerformed = this.actionsPerformed.slice(-1000);
  }
  
  return this.save();
};

// Method to check permission
adminSchema.methods.hasPermission = function(permission) {
  return this.permissions[permission] === true;
};

// Static method to find by email
adminSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find by employee ID
adminSchema.statics.findByEmployeeId = function(employeeId) {
  return this.findOne({ employeeId: employeeId.toUpperCase() });
};

export default mongoose.model('Admin', adminSchema);
