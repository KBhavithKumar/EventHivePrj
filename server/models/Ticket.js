import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  // Basic Information
  ticketNumber: {
    type: String,
    unique: true,
    required: true
  },
  subject: {
    type: String,
    required: [true, 'Ticket subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Ticket description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  
  // Ticket Classification
  category: {
    type: String,
    enum: [
      'TECHNICAL_ISSUE', 'ACCOUNT_PROBLEM', 'EVENT_INQUIRY', 'PAYMENT_ISSUE',
      'REGISTRATION_PROBLEM', 'FEATURE_REQUEST', 'BUG_REPORT', 'GENERAL_INQUIRY',
      'ORGANIZATION_SUPPORT', 'CERTIFICATE_ISSUE', 'OTHER'
    ],
    required: [true, 'Ticket category is required'],
    uppercase: true
  },
  priority: {
    type: String,
    enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'],
    default: 'NORMAL',
    uppercase: true
  },
  severity: {
    type: String,
    enum: ['MINOR', 'MODERATE', 'MAJOR', 'CRITICAL'],
    default: 'MODERATE',
    uppercase: true
  },
  
  // Requester Information
  requester: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization'
    },
    requesterType: {
      type: String,
      enum: ['USER', 'ORGANIZATION', 'GUEST'],
      required: true,
      uppercase: true
    },
    contactEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    contactName: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Contact name cannot exceed 100 characters']
    },
    contactPhone: {
      type: String,
      trim: true,
      match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
    }
  },
  
  // Assignment & Handling
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  },
  assignedAt: {
    type: Date,
    default: null
  },
  department: {
    type: String,
    enum: ['TECHNICAL', 'SUPPORT', 'BILLING', 'GENERAL', 'EVENTS', 'ORGANIZATIONS'],
    default: 'GENERAL',
    uppercase: true
  },
  
  // Status & Resolution
  status: {
    type: String,
    enum: ['OPEN', 'IN_PROGRESS', 'PENDING_USER', 'PENDING_INTERNAL', 'RESOLVED', 'CLOSED', 'CANCELLED'],
    default: 'OPEN',
    uppercase: true
  },
  resolution: {
    summary: {
      type: String,
      trim: true,
      maxlength: [1000, 'Resolution summary cannot exceed 1000 characters']
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    resolvedAt: {
      type: Date
    },
    resolutionTime: {
      type: Number // Time in minutes
    }
  },
  
  // Related Entities
  relatedEntities: {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization'
    },
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Participant'
    }
  },
  
  // Communication Thread
  messages: [{
    sender: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'messages.sender.model'
      },
      model: {
        type: String,
        enum: ['User', 'Admin', 'Organization'],
        required: true
      },
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
      }
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters']
    },
    messageType: {
      type: String,
      enum: ['MESSAGE', 'STATUS_UPDATE', 'INTERNAL_NOTE', 'SYSTEM_MESSAGE'],
      default: 'MESSAGE',
      uppercase: true
    },
    isInternal: {
      type: Boolean,
      default: false
    },
    attachments: [{
      filename: {
        type: String,
        required: true
      },
      url: {
        type: String,
        required: true
      },
      size: {
        type: Number
      },
      mimeType: {
        type: String
      }
    }],
    timestamp: {
      type: Date,
      default: Date.now
    },
    isRead: {
      type: Boolean,
      default: false
    }
  }],
  
  // Attachments (Initial ticket attachments)
  attachments: [{
    filename: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    size: {
      type: Number
    },
    mimeType: {
      type: String
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'attachments.uploaderModel'
    },
    uploaderModel: {
      type: String,
      enum: ['User', 'Admin', 'Organization']
    }
  }],
  
  // SLA & Timing
  sla: {
    responseTime: {
      target: {
        type: Number, // Target response time in minutes
        default: 240 // 4 hours
      },
      actual: {
        type: Number // Actual response time in minutes
      },
      isMet: {
        type: Boolean,
        default: null
      }
    },
    resolutionTime: {
      target: {
        type: Number, // Target resolution time in minutes
        default: 2880 // 48 hours
      },
      actual: {
        type: Number // Actual resolution time in minutes
      },
      isMet: {
        type: Boolean,
        default: null
      }
    }
  },
  
  // Escalation
  escalation: {
    isEscalated: {
      type: Boolean,
      default: false
    },
    escalatedAt: {
      type: Date
    },
    escalatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    escalationReason: {
      type: String,
      trim: true,
      maxlength: [500, 'Escalation reason cannot exceed 500 characters']
    },
    escalationLevel: {
      type: Number,
      min: 1,
      max: 3,
      default: 1
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
  
  // Tags for better organization
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  
  // Auto-close settings
  autoClose: {
    isEnabled: {
      type: Boolean,
      default: true
    },
    daysAfterResolution: {
      type: Number,
      default: 7,
      min: 1,
      max: 30
    },
    scheduledCloseDate: {
      type: Date
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
ticketSchema.index({ ticketNumber: 1 });
ticketSchema.index({ status: 1, priority: 1 });
ticketSchema.index({ category: 1 });
ticketSchema.index({ assignedTo: 1 });
ticketSchema.index({ 'requester.user': 1 });
ticketSchema.index({ 'requester.organization': 1 });
ticketSchema.index({ 'requester.contactEmail': 1 });
ticketSchema.index({ createdAt: -1 });
ticketSchema.index({ 'sla.responseTime.isMet': 1 });
ticketSchema.index({ 'escalation.isEscalated': 1 });

// Virtual for age in hours
ticketSchema.virtual('ageInHours').get(function() {
  return Math.round((Date.now() - this.createdAt) / (1000 * 60 * 60));
});

// Virtual for last message
ticketSchema.virtual('lastMessage').get(function() {
  return this.messages.length > 0 ? this.messages[this.messages.length - 1] : null;
});

// Virtual for unread messages count
ticketSchema.virtual('unreadMessagesCount').get(function() {
  return this.messages.filter(msg => !msg.isRead && !msg.isInternal).length;
});

// Pre-save middleware to generate ticket number
ticketSchema.pre('save', async function(next) {
  if (this.isNew && !this.ticketNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Ticket').countDocuments({
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1)
      }
    });
    this.ticketNumber = `TKT${year}${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Pre-save middleware to calculate SLA metrics
ticketSchema.pre('save', function(next) {
  const now = new Date();
  
  // Calculate response time if first response is added
  if (this.messages.length > 0 && !this.sla.responseTime.actual) {
    const firstResponse = this.messages.find(msg => 
      msg.sender.model === 'Admin' && msg.messageType === 'MESSAGE'
    );
    if (firstResponse) {
      this.sla.responseTime.actual = Math.round((firstResponse.timestamp - this.createdAt) / (1000 * 60));
      this.sla.responseTime.isMet = this.sla.responseTime.actual <= this.sla.responseTime.target;
    }
  }
  
  // Calculate resolution time if ticket is resolved
  if (this.status === 'RESOLVED' && this.resolution.resolvedAt && !this.sla.resolutionTime.actual) {
    this.sla.resolutionTime.actual = Math.round((this.resolution.resolvedAt - this.createdAt) / (1000 * 60));
    this.sla.resolutionTime.isMet = this.sla.resolutionTime.actual <= this.sla.resolutionTime.target;
    this.resolution.resolutionTime = this.sla.resolutionTime.actual;
  }
  
  // Set auto-close date when resolved
  if (this.status === 'RESOLVED' && this.autoClose.isEnabled && !this.autoClose.scheduledCloseDate) {
    this.autoClose.scheduledCloseDate = new Date(now.getTime() + (this.autoClose.daysAfterResolution * 24 * 60 * 60 * 1000));
  }
  
  next();
});

// Method to add message
ticketSchema.methods.addMessage = function(sender, message, messageType = 'MESSAGE', isInternal = false, attachments = []) {
  this.messages.push({
    sender,
    message,
    messageType,
    isInternal,
    attachments,
    timestamp: new Date()
  });
  
  // Update status if it's the first response from admin
  if (sender.model === 'Admin' && this.status === 'OPEN') {
    this.status = 'IN_PROGRESS';
  }
  
  return this.save();
};

// Method to assign ticket
ticketSchema.methods.assignTo = function(adminId) {
  this.assignedTo = adminId;
  this.assignedAt = new Date();
  if (this.status === 'OPEN') {
    this.status = 'IN_PROGRESS';
  }
  return this.save();
};

// Method to resolve ticket
ticketSchema.methods.resolve = function(summary, resolvedBy) {
  this.status = 'RESOLVED';
  this.resolution.summary = summary;
  this.resolution.resolvedBy = resolvedBy;
  this.resolution.resolvedAt = new Date();
  return this.save();
};

// Method to escalate ticket
ticketSchema.methods.escalate = function(reason, escalatedBy) {
  this.escalation.isEscalated = true;
  this.escalation.escalatedAt = new Date();
  this.escalation.escalatedBy = escalatedBy;
  this.escalation.escalationReason = reason;
  this.escalation.escalationLevel += 1;
  this.priority = this.priority === 'LOW' ? 'NORMAL' : 
                  this.priority === 'NORMAL' ? 'HIGH' : 'URGENT';
  return this.save();
};

// Static method to find tickets by user
ticketSchema.statics.findByUser = function(userId, status = null) {
  const query = { 'requester.user': userId };
  if (status) query.status = status;
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .populate('assignedTo', 'firstName lastName')
    .populate('relatedEntities.event', 'title')
    .populate('relatedEntities.organization', 'name');
};

// Static method to find overdue tickets
ticketSchema.statics.findOverdue = function() {
  const now = new Date();
  return this.find({
    status: { $in: ['OPEN', 'IN_PROGRESS'] },
    $or: [
      {
        'sla.responseTime.actual': null,
        createdAt: { $lt: new Date(now.getTime() - 4 * 60 * 60 * 1000) } // 4 hours ago
      },
      {
        status: 'IN_PROGRESS',
        createdAt: { $lt: new Date(now.getTime() - 48 * 60 * 60 * 1000) } // 48 hours ago
      }
    ]
  });
};

export default mongoose.model('Ticket', ticketSchema);
