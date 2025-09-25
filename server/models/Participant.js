import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema({
  // Core References
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event reference is required']
  },
  
  // Registration Details
  registrationDate: {
    type: Date,
    default: Date.now
  },
  registrationNumber: {
    type: String,
    unique: true,
    required: true
  },
  
  // Participation Status
  status: {
    type: String,
    enum: ['REGISTERED', 'WAITLISTED', 'SELECTED', 'REJECTED', 'CONFIRMED', 'ATTENDED', 'ABSENT', 'CANCELLED'],
    default: 'REGISTERED',
    uppercase: true
  },
  
  // Role in Event
  role: {
    type: String,
    enum: ['PARTICIPANT', 'VOLUNTEER', 'SPEAKER', 'JUDGE', 'COORDINATOR'],
    default: 'PARTICIPANT',
    uppercase: true
  },
  
  // Additional Information Collected During Registration
  additionalInfo: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: new Map()
  },
  
  // Team Information (for team events)
  team: {
    isTeamEvent: {
      type: Boolean,
      default: false
    },
    teamName: {
      type: String,
      trim: true,
      maxlength: [100, 'Team name cannot exceed 100 characters']
    },
    teamLeader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    teamMembers: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      role: {
        type: String,
        enum: ['LEADER', 'MEMBER'],
        default: 'MEMBER'
      },
      joinedAt: {
        type: Date,
        default: Date.now
      }
    }],
    maxTeamSize: {
      type: Number,
      min: 1,
      max: 10
    }
  },
  
  // Payment Information
  payment: {
    isRequired: {
      type: Boolean,
      default: false
    },
    amount: {
      type: Number,
      default: 0,
      min: [0, 'Payment amount cannot be negative']
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true
    },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'NOT_REQUIRED'],
      default: 'NOT_REQUIRED',
      uppercase: true
    },
    transactionId: {
      type: String,
      trim: true
    },
    paymentDate: {
      type: Date
    },
    paymentMethod: {
      type: String,
      enum: ['ONLINE', 'CASH', 'BANK_TRANSFER', 'UPI', 'CARD'],
      uppercase: true
    }
  },
  
  // Attendance Tracking
  attendance: {
    checkedIn: {
      type: Boolean,
      default: false
    },
    checkInTime: {
      type: Date
    },
    checkedOut: {
      type: Boolean,
      default: false
    },
    checkOutTime: {
      type: Date
    },
    attendancePercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  
  // Feedback & Rating
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, 'Feedback comment cannot exceed 1000 characters']
    },
    submittedAt: {
      type: Date
    }
  },
  
  // Certificate Information
  certificate: {
    isEligible: {
      type: Boolean,
      default: false
    },
    isGenerated: {
      type: Boolean,
      default: false
    },
    certificateUrl: {
      type: String
    },
    generatedAt: {
      type: Date
    },
    certificateNumber: {
      type: String,
      unique: true,
      sparse: true
    }
  },
  
  // Communication Preferences
  notifications: {
    emailReminders: {
      type: Boolean,
      default: true
    },
    smsReminders: {
      type: Boolean,
      default: false
    },
    eventUpdates: {
      type: Boolean,
      default: true
    }
  },
  
  // Special Requirements
  specialRequirements: {
    dietaryRestrictions: {
      type: String,
      trim: true,
      maxlength: [200, 'Dietary restrictions cannot exceed 200 characters']
    },
    accessibilityNeeds: {
      type: String,
      trim: true,
      maxlength: [200, 'Accessibility needs cannot exceed 200 characters']
    },
    emergencyContact: {
      name: {
        type: String,
        trim: true,
        maxlength: [100, 'Emergency contact name cannot exceed 100 characters']
      },
      relationship: {
        type: String,
        trim: true,
        maxlength: [50, 'Relationship cannot exceed 50 characters']
      },
      mobile: {
        type: String,
        trim: true,
        match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid mobile number']
      }
    }
  },
  
  // Status History for Audit Trail
  statusHistory: [{
    status: {
      type: String,
      required: true
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'statusHistory.changedByModel'
    },
    changedByModel: {
      type: String,
      enum: ['User', 'Admin', 'Organization']
    },
    reason: {
      type: String,
      trim: true,
      maxlength: [200, 'Status change reason cannot exceed 200 characters']
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for better performance
participantSchema.index({ user: 1, event: 1 }, { unique: true });
participantSchema.index({ event: 1, status: 1 });
participantSchema.index({ user: 1, status: 1 });
participantSchema.index({ registrationNumber: 1 });
participantSchema.index({ 'team.teamLeader': 1 });
participantSchema.index({ 'payment.status': 1 });
participantSchema.index({ 'attendance.checkedIn': 1 });

// Virtual for team size
participantSchema.virtual('teamSize').get(function() {
  return this.team.teamMembers ? this.team.teamMembers.length + 1 : 1; // +1 for team leader
});

// Virtual for payment status display
participantSchema.virtual('paymentStatusDisplay').get(function() {
  if (!this.payment.isRequired) return 'Not Required';
  return this.payment.status.replace('_', ' ').toLowerCase()
    .replace(/\b\w/g, l => l.toUpperCase());
});

// Pre-save middleware to generate registration number
participantSchema.pre('save', async function(next) {
  if (this.isNew && !this.registrationNumber) {
    const event = await mongoose.model('Event').findById(this.event);
    if (event) {
      const count = await mongoose.model('Participant').countDocuments({ event: this.event });
      const eventCode = event.title.substring(0, 3).toUpperCase();
      const year = new Date().getFullYear().toString().slice(-2);
      this.registrationNumber = `${eventCode}${year}${String(count + 1).padStart(4, '0')}`;
    }
  }
  next();
});

// Pre-save middleware to track status changes
participantSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date()
    });
  }
  next();
});

// Method to check if participant can check in
participantSchema.methods.canCheckIn = function() {
  return ['CONFIRMED', 'SELECTED'].includes(this.status) && 
         !this.attendance.checkedIn &&
         (!this.payment.isRequired || this.payment.status === 'COMPLETED');
};

// Method to check in participant
participantSchema.methods.checkIn = function() {
  if (this.canCheckIn()) {
    this.attendance.checkedIn = true;
    this.attendance.checkInTime = new Date();
    if (this.status === 'CONFIRMED' || this.status === 'SELECTED') {
      this.status = 'ATTENDED';
    }
    return this.save();
  }
  throw new Error('Participant cannot check in');
};

// Method to check out participant
participantSchema.methods.checkOut = function() {
  if (this.attendance.checkedIn && !this.attendance.checkedOut) {
    this.attendance.checkedOut = true;
    this.attendance.checkOutTime = new Date();
    return this.save();
  }
  throw new Error('Participant cannot check out');
};

// Method to submit feedback
participantSchema.methods.submitFeedback = function(rating, comment) {
  this.feedback.rating = rating;
  this.feedback.comment = comment;
  this.feedback.submittedAt = new Date();
  return this.save();
};

// Static method to find participants by event
participantSchema.statics.findByEvent = function(eventId, status = null) {
  const query = { event: eventId };
  if (status) query.status = status;
  
  return this.find(query)
    .populate('user', 'firstName lastName email studentId stream year')
    .sort({ registrationDate: 1 });
};

// Static method to get event statistics
participantSchema.statics.getEventStats = function(eventId) {
  return this.aggregate([
    { $match: { event: mongoose.Types.ObjectId(eventId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

export default mongoose.model('Participant', participantSchema);
