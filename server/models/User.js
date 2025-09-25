import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
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
    select: false // Don't include password in queries by default
  },
  
  // Contact Information
  mobileNumber: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid mobile number']
  },
  
  // Academic Information
  studentId: {
    type: String,
    trim: true,
    sparse: true, // Allows multiple null values but unique non-null values
    index: true
  },
  stream: {
    type: String,
    enum: ['PUC', 'B.TECH', 'M.TECH', 'MBA', 'MCA', 'B.SC', 'M.SC', 'B.COM', 'M.COM', 'BA', 'MA', 'OTHER'],
    uppercase: true
  },
  year: {
    type: Number,
    min: [1, 'Year must be at least 1'],
    max: [6, 'Year cannot exceed 6']
  },
  department: {
    type: String,
    trim: true,
    maxlength: [100, 'Department name cannot exceed 100 characters']
  },
  
  // Profile Information
  profilePicture: {
    type: String, // URL to uploaded image
    default: null
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    trim: true
  },
  skills: [{
    type: String,
    trim: true,
    maxlength: [50, 'Skill name cannot exceed 50 characters']
  }],
  resume: {
    type: String, // URL to uploaded resume
    default: null
  },
  
  // Account Status
  accountStatus: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'],
    default: 'PENDING_VERIFICATION',
    uppercase: true
  },
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
  
  // Event Participation History
  eventsParticipated: [{
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    },
    registrationDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['REGISTERED', 'SELECTED', 'REJECTED', 'ATTENDED', 'ABSENT'],
      default: 'REGISTERED'
    },
    role: {
      type: String,
      enum: ['PARTICIPANT', 'VOLUNTEER'],
      required: true
    }
  }],
  
  // Preferences
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    smsNotifications: {
      type: Boolean,
      default: false
    },
    eventCategories: [{
      type: String,
      enum: ['TECHNICAL', 'CULTURAL', 'SPORTS', 'ACADEMIC', 'WORKSHOP', 'SEMINAR', 'COMPETITION', 'OTHER']
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ studentId: 1 });
userSchema.index({ stream: 1, year: 1 });
userSchema.index({ accountStatus: 1 });
userSchema.index({ 'eventsParticipated.event': 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for active events
userSchema.virtual('activeEvents').get(function() {
  return this.eventsParticipated.filter(event => 
    ['REGISTERED', 'SELECTED'].includes(event.status)
  );
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate email verification token
userSchema.methods.generateEmailVerificationToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  
  this.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  return token;
};

// Method to generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return token;
};

// Static method to find by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find eligible users for event
userSchema.statics.findEligibleUsers = function(criteria) {
  const query = { accountStatus: 'ACTIVE', isEmailVerified: true };
  
  if (criteria.streams && criteria.streams.length > 0) {
    query.stream = { $in: criteria.streams };
  }
  
  if (criteria.years && criteria.years.length > 0) {
    query.year = { $in: criteria.years };
  }
  
  if (criteria.departments && criteria.departments.length > 0) {
    query.department = { $in: criteria.departments };
  }
  
  return this.find(query);
};

export default mongoose.model('User', userSchema);
