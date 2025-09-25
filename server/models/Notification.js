import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  // Core Information
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  
  // Notification Type & Category
  type: {
    type: String,
    enum: ['EMAIL', 'SMS', 'PUSH', 'IN_APP', 'SYSTEM'],
    required: [true, 'Notification type is required'],
    uppercase: true
  },
  category: {
    type: String,
    enum: [
      'EVENT_REGISTRATION', 'EVENT_UPDATE', 'EVENT_REMINDER', 'EVENT_CANCELLATION',
      'PAYMENT_CONFIRMATION', 'PAYMENT_REMINDER', 'PAYMENT_FAILED',
      'ACCOUNT_VERIFICATION', 'PASSWORD_RESET', 'LOGIN_ALERT',
      'ORGANIZATION_APPROVAL', 'ORGANIZATION_REJECTION',
      'GENERAL_ANNOUNCEMENT', 'SYSTEM_MAINTENANCE', 'SECURITY_ALERT',
      'CERTIFICATE_READY', 'FEEDBACK_REQUEST', 'OTHER'
    ],
    required: [true, 'Notification category is required'],
    uppercase: true
  },
  
  // Sender Information
  sender: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'sender.model'
    },
    model: {
      type: String,
      enum: ['Admin', 'Organization', 'System'],
      default: 'System'
    },
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Sender name cannot exceed 100 characters']
    }
  },
  
  // Recipient Information
  recipients: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED'],
      default: 'PENDING',
      uppercase: true
    },
    sentAt: {
      type: Date
    },
    deliveredAt: {
      type: Date
    },
    readAt: {
      type: Date
    },
    failureReason: {
      type: String,
      trim: true,
      maxlength: [200, 'Failure reason cannot exceed 200 characters']
    }
  }],
  
  // Targeting Criteria (for bulk notifications)
  targeting: {
    isTargeted: {
      type: Boolean,
      default: false
    },
    criteria: {
      streams: [{
        type: String,
        enum: ['PUC', 'B.TECH', 'M.TECH', 'MBA', 'MCA', 'B.SC', 'M.SC', 'B.COM', 'M.COM', 'BA', 'MA', 'OTHER']
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
      eventCategories: [{
        type: String,
        enum: ['TECHNICAL', 'CULTURAL', 'SPORTS', 'ACADEMIC', 'WORKSHOP', 'SEMINAR', 'COMPETITION', 'OTHER']
      }],
      organizations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization'
      }]
    }
  },
  
  // Related Entity (Event, Organization, etc.)
  relatedEntity: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'relatedEntity.model'
    },
    model: {
      type: String,
      enum: ['Event', 'Organization', 'User', 'Participant']
    }
  },
  
  // Scheduling
  scheduling: {
    isScheduled: {
      type: Boolean,
      default: false
    },
    scheduledFor: {
      type: Date
    },
    isRecurring: {
      type: Boolean,
      default: false
    },
    recurringPattern: {
      frequency: {
        type: String,
        enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'],
        uppercase: true
      },
      interval: {
        type: Number,
        min: 1,
        default: 1
      },
      endDate: {
        type: Date
      },
      maxOccurrences: {
        type: Number,
        min: 1
      }
    }
  },
  
  // Email Specific Details
  emailDetails: {
    subject: {
      type: String,
      trim: true,
      maxlength: [200, 'Email subject cannot exceed 200 characters']
    },
    htmlContent: {
      type: String
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
        type: Number // Size in bytes
      }
    }]
  },
  
  // SMS Specific Details
  smsDetails: {
    shortMessage: {
      type: String,
      trim: true,
      maxlength: [160, 'SMS message cannot exceed 160 characters']
    }
  },
  
  // Push Notification Details
  pushDetails: {
    icon: {
      type: String
    },
    image: {
      type: String
    },
    actionUrl: {
      type: String,
      trim: true
    },
    actions: [{
      title: {
        type: String,
        required: true,
        trim: true
      },
      action: {
        type: String,
        required: true,
        trim: true
      }
    }]
  },
  
  // Delivery Status & Analytics
  deliveryStatus: {
    totalRecipients: {
      type: Number,
      default: 0
    },
    sentCount: {
      type: Number,
      default: 0
    },
    deliveredCount: {
      type: Number,
      default: 0
    },
    readCount: {
      type: Number,
      default: 0
    },
    failedCount: {
      type: Number,
      default: 0
    },
    openRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    clickRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  
  // Status & Priority
  status: {
    type: String,
    enum: ['DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'FAILED', 'CANCELLED'],
    default: 'DRAFT',
    uppercase: true
  },
  priority: {
    type: String,
    enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'],
    default: 'NORMAL',
    uppercase: true
  },
  
  // Template Information
  template: {
    isTemplate: {
      type: Boolean,
      default: false
    },
    templateName: {
      type: String,
      trim: true,
      maxlength: [100, 'Template name cannot exceed 100 characters']
    },
    variables: {
      type: Map,
      of: String
    }
  },
  
  // Retry Configuration
  retryConfig: {
    maxRetries: {
      type: Number,
      default: 3,
      min: 0,
      max: 10
    },
    retryCount: {
      type: Number,
      default: 0
    },
    nextRetryAt: {
      type: Date
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
notificationSchema.index({ type: 1, category: 1 });
notificationSchema.index({ status: 1 });
notificationSchema.index({ 'scheduling.scheduledFor': 1 });
notificationSchema.index({ 'recipients.user': 1 });
notificationSchema.index({ 'recipients.status': 1 });
notificationSchema.index({ 'sender.id': 1 });
notificationSchema.index({ 'relatedEntity.id': 1 });
notificationSchema.index({ createdAt: -1 });

// Virtual for success rate
notificationSchema.virtual('successRate').get(function() {
  if (this.deliveryStatus.totalRecipients === 0) return 0;
  return Math.round((this.deliveryStatus.deliveredCount / this.deliveryStatus.totalRecipients) * 100);
});

// Virtual for failure rate
notificationSchema.virtual('failureRate').get(function() {
  if (this.deliveryStatus.totalRecipients === 0) return 0;
  return Math.round((this.deliveryStatus.failedCount / this.deliveryStatus.totalRecipients) * 100);
});

// Pre-save middleware to update delivery statistics
notificationSchema.pre('save', function(next) {
  if (this.recipients && this.recipients.length > 0) {
    this.deliveryStatus.totalRecipients = this.recipients.length;
    this.deliveryStatus.sentCount = this.recipients.filter(r => r.status === 'SENT' || r.status === 'DELIVERED' || r.status === 'READ').length;
    this.deliveryStatus.deliveredCount = this.recipients.filter(r => r.status === 'DELIVERED' || r.status === 'READ').length;
    this.deliveryStatus.readCount = this.recipients.filter(r => r.status === 'READ').length;
    this.deliveryStatus.failedCount = this.recipients.filter(r => r.status === 'FAILED').length;
    
    // Calculate rates
    if (this.deliveryStatus.totalRecipients > 0) {
      this.deliveryStatus.openRate = Math.round((this.deliveryStatus.readCount / this.deliveryStatus.totalRecipients) * 100);
    }
  }
  next();
});

// Method to mark as read for a specific user
notificationSchema.methods.markAsRead = function(userId) {
  const recipient = this.recipients.find(r => r.user.toString() === userId.toString());
  if (recipient && recipient.status !== 'READ') {
    recipient.status = 'READ';
    recipient.readAt = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to mark as delivered for a specific user
notificationSchema.methods.markAsDelivered = function(userId) {
  const recipient = this.recipients.find(r => r.user.toString() === userId.toString());
  if (recipient && recipient.status === 'SENT') {
    recipient.status = 'DELIVERED';
    recipient.deliveredAt = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to mark as failed for a specific user
notificationSchema.methods.markAsFailed = function(userId, reason) {
  const recipient = this.recipients.find(r => r.user.toString() === userId.toString());
  if (recipient) {
    recipient.status = 'FAILED';
    recipient.failureReason = reason;
    return this.save();
  }
  return Promise.resolve(this);
};

// Static method to find notifications for user
notificationSchema.statics.findForUser = function(userId, options = {}) {
  const { limit = 20, skip = 0, unreadOnly = false } = options;
  
  const query = { 'recipients.user': userId };
  if (unreadOnly) {
    query['recipients.status'] = { $ne: 'READ' };
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('sender.id', 'name')
    .populate('relatedEntity.id', 'title name');
};

// Static method to get unread count for user
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({
    'recipients.user': userId,
    'recipients.status': { $ne: 'read' }
  });
};

export default mongoose.model('Notification', notificationSchema);
