import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [200, 'Event title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    trim: true,
    maxlength: [2000, 'Event description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: [300, 'Short description cannot exceed 300 characters']
  },
  
  // Event Classification
  category: {
    type: String,
    enum: ['TECHNICAL', 'CULTURAL', 'SPORTS', 'ACADEMIC', 'WORKSHOP', 'SEMINAR', 'COMPETITION', 'OTHER'],
    required: [true, 'Event category is required'],
    uppercase: true
  },
  type: {
    type: String,
    enum: ['ONLINE', 'OFFLINE', 'HYBRID'],
    required: [true, 'Event type is required'],
    uppercase: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  
  // Organizer Information
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: [true, 'Event organizer is required']
  },
  coOrganizers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  }],
  
  // Event Timing
  startDateTime: {
    type: Date,
    required: [true, 'Event start date and time is required']
  },
  endDateTime: {
    type: Date,
    required: [true, 'Event end date and time is required'],
    validate: {
      validator: function(value) {
        return value > this.startDateTime;
      },
      message: 'End date must be after start date'
    }
  },
  timezone: {
    type: String,
    default: 'Asia/Kolkata'
  },
  
  // Registration Details
  registrationStartDate: {
    type: Date,
    required: [true, 'Registration start date is required']
  },
  registrationEndDate: {
    type: Date,
    required: [true, 'Registration end date is required'],
    validate: {
      validator: function(value) {
        return value > this.registrationStartDate && value <= this.startDateTime;
      },
      message: 'Registration end date must be after start date and before event start'
    }
  },
  
  // Capacity & Limits
  maxParticipants: {
    type: Number,
    required: [true, 'Maximum participants limit is required'],
    min: [1, 'Maximum participants must be at least 1']
  },
  currentParticipants: {
    type: Number,
    default: 0,
    min: [0, 'Current participants cannot be negative']
  },
  maxVolunteers: {
    type: Number,
    default: 0,
    min: [0, 'Maximum volunteers cannot be negative']
  },
  currentVolunteers: {
    type: Number,
    default: 0,
    min: [0, 'Current volunteers cannot be negative']
  },
  
  // Eligibility Criteria
  eligibility: {
    streams: [{
      type: String,
      enum: ['PUC', 'B.TECH', 'M.TECH', 'MBA', 'MCA', 'B.SC', 'M.SC', 'B.COM', 'M.COM', 'BA', 'MA', 'OTHER'],
      uppercase: true
    }],
    years: [{
      type: Number,
      min: 1,
      max: 6
    }],
    departments: [{
      type: String,
      trim: true
    }],
    isOpenToAll: {
      type: Boolean,
      default: false
    }
  },
  
  // Location Information
  venue: {
    name: {
      type: String,
      trim: true,
      maxlength: [200, 'Venue name cannot exceed 200 characters']
    },
    address: {
      type: String,
      trim: true,
      maxlength: [500, 'Venue address cannot exceed 500 characters']
    },
    city: {
      type: String,
      trim: true,
      maxlength: [100, 'City cannot exceed 100 characters']
    },
    state: {
      type: String,
      trim: true,
      maxlength: [100, 'State cannot exceed 100 characters']
    },
    pincode: {
      type: String,
      trim: true,
      match: [/^\d{6}$/, 'Please enter a valid 6-digit pincode']
    },
    coordinates: {
      latitude: {
        type: Number,
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90']
      },
      longitude: {
        type: Number,
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180']
      }
    }
  },
  
  // Online Event Details
  onlineDetails: {
    platform: {
      type: String,
      enum: ['ZOOM', 'GOOGLE_MEET', 'MICROSOFT_TEAMS', 'WEBEX', 'OTHER'],
      uppercase: true
    },
    meetingLink: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.+/, 'Please enter a valid meeting link']
    },
    meetingId: {
      type: String,
      trim: true
    },
    passcode: {
      type: String,
      trim: true
    }
  },
  
  // Media & Resources
  images: [{
    url: {
      type: String,
      required: true
    },
    caption: {
      type: String,
      trim: true,
      maxlength: [200, 'Image caption cannot exceed 200 characters']
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  documents: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Document name cannot exceed 200 characters']
    },
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['BROCHURE', 'SCHEDULE', 'RULES', 'GUIDELINES', 'OTHER'],
      uppercase: true
    },
    size: {
      type: Number // Size in bytes
    }
  }],

  // Pricing & Payment
  pricing: {
    isFree: {
      type: Boolean,
      default: true
    },
    participantFee: {
      type: Number,
      default: 0,
      min: [0, 'Participant fee cannot be negative']
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true
    }
  },

  // Event Status & Approval
  status: {
    type: String,
    enum: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'PUBLISHED', 'ONGOING', 'COMPLETED', 'CANCELLED'],
    default: 'DRAFT',
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

  // Registration Settings
  registrationSettings: {
    requireApproval: {
      type: Boolean,
      default: false
    },
    allowWaitlist: {
      type: Boolean,
      default: true
    },
    sendConfirmationEmail: {
      type: Boolean,
      default: true
    },
    collectAdditionalInfo: {
      type: Boolean,
      default: false
    },
    additionalFields: [{
      fieldName: {
        type: String,
        required: true,
        trim: true
      },
      fieldType: {
        type: String,
        enum: ['TEXT', 'EMAIL', 'NUMBER', 'DATE', 'SELECT', 'TEXTAREA'],
        required: true
      },
      isRequired: {
        type: Boolean,
        default: false
      },
      options: [String] // For SELECT type fields
    }]
  },

  // Contact Information
  contactInfo: {
    primaryContact: {
      name: {
        type: String,
        required: true,
        trim: true
      },
      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
      },
      mobile: {
        type: String,
        trim: true
      }
    },
    secondaryContacts: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
      },
      mobile: {
        type: String,
        trim: true
      },
      role: {
        type: String,
        trim: true
      }
    }]
  },

  // Analytics & Metrics
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    registrations: {
      type: Number,
      default: 0
    },
    attendance: {
      type: Number,
      default: 0
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      count: {
        type: Number,
        default: 0
      }
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
eventSchema.index({ organizer: 1 });
eventSchema.index({ category: 1, type: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ approvalStatus: 1 });
eventSchema.index({ startDateTime: 1 });
eventSchema.index({ registrationStartDate: 1, registrationEndDate: 1 });
eventSchema.index({ 'eligibility.streams': 1 });
eventSchema.index({ 'eligibility.years': 1 });
eventSchema.index({ tags: 1 });
eventSchema.index({ 'venue.city': 1, 'venue.state': 1 });

// Virtual for registration status
eventSchema.virtual('registrationStatus').get(function() {
  const now = new Date();
  if (now < this.registrationStartDate) return 'NOT_STARTED';
  if (now > this.registrationEndDate) return 'CLOSED';
  if (this.currentParticipants >= this.maxParticipants) return 'FULL';
  return 'OPEN';
});

// Virtual for event status based on dates
eventSchema.virtual('eventStatus').get(function() {
  const now = new Date();
  if (this.status === 'CANCELLED') return 'CANCELLED';
  if (this.status === 'COMPLETED') return 'COMPLETED';
  if (now < this.startDateTime) return 'UPCOMING';
  if (now >= this.startDateTime && now <= this.endDateTime) return 'ONGOING';
  if (now > this.endDateTime) return 'COMPLETED';
  return 'UPCOMING';
});

// Virtual for available spots
eventSchema.virtual('availableSpots').get(function() {
  return Math.max(0, this.maxParticipants - this.currentParticipants);
});

// Virtual for duration in hours
eventSchema.virtual('durationHours').get(function() {
  return Math.round((this.endDateTime - this.startDateTime) / (1000 * 60 * 60));
});

// Virtual for primary image
eventSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary ? primary.url : (this.images.length > 0 ? this.images[0].url : null);
});

// Pre-save middleware to ensure only one primary image
eventSchema.pre('save', function(next) {
  if (this.images && this.images.length > 0) {
    const primaryImages = this.images.filter(img => img.isPrimary);
    if (primaryImages.length > 1) {
      // Keep only the first primary image
      this.images.forEach((img, index) => {
        if (index > 0 && img.isPrimary) {
          img.isPrimary = false;
        }
      });
    } else if (primaryImages.length === 0 && this.images.length > 0) {
      // Set first image as primary if none is set
      this.images[0].isPrimary = true;
    }
  }
  next();
});

// Pre-save middleware to update analytics
eventSchema.pre('save', function(next) {
  if (this.isModified('currentParticipants')) {
    this.analytics.registrations = this.currentParticipants;
  }
  next();
});

// Method to check if user is eligible
eventSchema.methods.isUserEligible = function(user) {
  if (this.eligibility.isOpenToAll) return true;

  // Check stream eligibility
  if (this.eligibility.streams && this.eligibility.streams.length > 0) {
    if (!this.eligibility.streams.includes(user.stream)) return false;
  }

  // Check year eligibility
  if (this.eligibility.years && this.eligibility.years.length > 0) {
    if (!this.eligibility.years.includes(user.year)) return false;
  }

  // Check department eligibility
  if (this.eligibility.departments && this.eligibility.departments.length > 0) {
    if (!this.eligibility.departments.includes(user.department)) return false;
  }

  return true;
};

// Method to check if registration is open
eventSchema.methods.isRegistrationOpen = function() {
  const now = new Date();
  return now >= this.registrationStartDate &&
         now <= this.registrationEndDate &&
         this.currentParticipants < this.maxParticipants &&
         this.status === 'PUBLISHED';
};

// Method to increment view count
eventSchema.methods.incrementViews = function() {
  this.analytics.views += 1;
  return this.save();
};

// Static method to find upcoming events
eventSchema.statics.findUpcoming = function(limit = 10) {
  return this.find({
    status: 'PUBLISHED',
    startDateTime: { $gt: new Date() }
  })
  .sort({ startDateTime: 1 })
  .limit(limit)
  .populate('organizer', 'name logo');
};

// Static method to find events by category
eventSchema.statics.findByCategory = function(category, limit = 10) {
  return this.find({
    category: category.toUpperCase(),
    status: 'PUBLISHED',
    startDateTime: { $gt: new Date() }
  })
  .sort({ startDateTime: 1 })
  .limit(limit)
  .populate('organizer', 'name logo');
};

// Static method to find events for user based on eligibility
eventSchema.statics.findEligibleForUser = function(user, limit = 10) {
  const query = {
    status: 'PUBLISHED',
    startDateTime: { $gt: new Date() },
    $or: [
      { 'eligibility.isOpenToAll': true },
      {
        $and: [
          { 'eligibility.streams': { $in: [user.stream] } },
          { 'eligibility.years': { $in: [user.year] } }
        ]
      }
    ]
  };

  return this.find(query)
    .sort({ startDateTime: 1 })
    .limit(limit)
    .populate('organizer', 'name logo');
};

export default mongoose.model('Event', eventSchema);
