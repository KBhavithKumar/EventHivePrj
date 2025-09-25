import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const organizationSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Organization name is required'],
    trim: true,
    maxlength: [100, 'Organization name cannot exceed 100 characters'],
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  // Contact Information
  officialEmail: {
    type: String,
    required: [true, 'Official email is required'],
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
  mobileNumber: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid mobile number']
  },
  
  // Organization Details
  logo: {
    type: String, // URL to uploaded logo
    default: null
  },
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid website URL']
  },
  establishedYear: {
    type: Number,
    min: [1900, 'Established year must be after 1900'],
    max: [new Date().getFullYear(), 'Established year cannot be in the future']
  },
  
  // Organization Type & Category
  type: {
    type: String,
    enum: ['DEPARTMENT', 'CLUB', 'SOCIETY', 'COMMITTEE', 'ASSOCIATION', 'EXTERNAL'],
    required: [true, 'Organization type is required'],
    uppercase: true
  },
  category: {
    type: String,
    enum: ['ACADEMIC', 'TECHNICAL', 'CULTURAL', 'SPORTS', 'SOCIAL', 'PROFESSIONAL', 'OTHER'],
    required: [true, 'Organization category is required'],
    uppercase: true
  },
  
  // Address Information
  address: {
    building: {
      type: String,
      trim: true,
      maxlength: [100, 'Building name cannot exceed 100 characters']
    },
    campus: {
      type: String,
      trim: true,
      maxlength: [100, 'Campus name cannot exceed 100 characters']
    },
    city: {
      type: String,
      trim: true,
      maxlength: [50, 'City name cannot exceed 50 characters']
    },
    state: {
      type: String,
      trim: true,
      maxlength: [50, 'State name cannot exceed 50 characters']
    },
    pincode: {
      type: String,
      trim: true,
      match: [/^\d{6}$/, 'Please enter a valid 6-digit pincode']
    }
  },
  
  // Account Status & Approval
  accountStatus: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'],
    default: 'PENDING_VERIFICATION',
    uppercase: true
  },
  approvalStatus: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'UNDER_REVIEW'],
    default: 'PENDING',
    uppercase: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Rejection reason cannot exceed 500 characters']
  },
  
  // Verification
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    select: false
  },
  emailVerificationExpires: {
    type: Date,
    select: false
  },
  
  // Password Reset
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
  
  // Events Management
  eventsOrganized: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }],
  totalEventsOrganized: {
    type: Number,
    default: 0
  },
  
  // Social Media Links
  socialMedia: {
    facebook: {
      type: String,
      trim: true,
      match: [/^https?:\/\/(www\.)?facebook\.com\/.+/, 'Please enter a valid Facebook URL']
    },
    twitter: {
      type: String,
      trim: true,
      match: [/^https?:\/\/(www\.)?twitter\.com\/.+/, 'Please enter a valid Twitter URL']
    },
    instagram: {
      type: String,
      trim: true,
      match: [/^https?:\/\/(www\.)?instagram\.com\/.+/, 'Please enter a valid Instagram URL']
    },
    linkedin: {
      type: String,
      trim: true,
      match: [/^https?:\/\/(www\.)?linkedin\.com\/.+/, 'Please enter a valid LinkedIn URL']
    }
  },
  
  // Organization Members/Contacts
  contacts: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Contact name cannot exceed 100 characters']
    },
    designation: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Designation cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    mobile: {
      type: String,
      trim: true,
      match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid mobile number']
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  
  // Settings & Preferences
  settings: {
    allowPublicEvents: {
      type: Boolean,
      default: true
    },
    requireApprovalForEvents: {
      type: Boolean,
      default: false
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    autoApproveVolunteers: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
organizationSchema.index({ officialEmail: 1 });
organizationSchema.index({ name: 1 });
organizationSchema.index({ type: 1, category: 1 });
organizationSchema.index({ approvalStatus: 1 });
organizationSchema.index({ accountStatus: 1 });

// Virtual for active events count
organizationSchema.virtual('activeEventsCount').get(function() {
  return this.eventsOrganized ? this.eventsOrganized.length : 0;
});

// Pre-save middleware to hash password
organizationSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to ensure only one primary contact
organizationSchema.pre('save', function(next) {
  if (this.contacts && this.contacts.length > 0) {
    const primaryContacts = this.contacts.filter(contact => contact.isPrimary);
    if (primaryContacts.length > 1) {
      // Keep only the first primary contact
      this.contacts.forEach((contact, index) => {
        if (index > 0 && contact.isPrimary) {
          contact.isPrimary = false;
        }
      });
    }
  }
  next();
});

// Method to compare password
organizationSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate email verification token
organizationSchema.methods.generateEmailVerificationToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  
  this.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  return token;
};

// Method to generate password reset token
organizationSchema.methods.generatePasswordResetToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return token;
};

// Static method to find by email
organizationSchema.statics.findByEmail = function(email) {
  return this.findOne({ officialEmail: email.toLowerCase() });
};

// Static method to find approved organizations
organizationSchema.statics.findApproved = function() {
  return this.find({ 
    approvalStatus: 'APPROVED', 
    accountStatus: 'ACTIVE' 
  });
};

export default mongoose.model('Organization', organizationSchema);
