// Central export file for all database models
// This provides a clean interface for importing models throughout the application

import User from './User.js';
import Admin from './Admin.js';
import Organization from './Organization.js';
import Event from './Event.js';
import Participant from './Participant.js';
import Notification from './Notification.js';
import Ticket from './Ticket.js';

// Export all models
export {
  User,
  Admin,
  Organization,
  Event,
  Participant,
  Notification,
  Ticket
};

// Default export for convenience
export default {
  User,
  Admin,
  Organization,
  Event,
  Participant,
  Notification,
  Ticket
};

// Model relationships and references for documentation
export const MODEL_RELATIONSHIPS = {
  User: {
    references: ['Event', 'Participant', 'Notification', 'Ticket'],
    referencedBy: ['Participant', 'Notification', 'Ticket', 'Admin']
  },
  Admin: {
    references: ['User', 'Organization', 'Event', 'Ticket'],
    referencedBy: ['Organization', 'Event', 'Ticket']
  },
  Organization: {
    references: ['Admin', 'Event'],
    referencedBy: ['Event', 'Notification', 'Ticket', 'Admin']
  },
  Event: {
    references: ['Organization', 'Admin'],
    referencedBy: ['Participant', 'Notification', 'Ticket']
  },
  Participant: {
    references: ['User', 'Event'],
    referencedBy: ['Notification', 'Ticket']
  },
  Notification: {
    references: ['User', 'Admin', 'Organization', 'Event', 'Participant'],
    referencedBy: []
  },
  Ticket: {
    references: ['User', 'Admin', 'Organization', 'Event', 'Participant'],
    referencedBy: []
  }
};

// Collection names for reference
export const COLLECTION_NAMES = {
  USERS: 'users',
  ADMINS: 'admins',
  ORGANIZATIONS: 'organizations',
  EVENTS: 'events',
  PARTICIPANTS: 'participants',
  NOTIFICATIONS: 'notifications',
  TICKETS: 'tickets'
};

// Enum values for reference across the application
export const ENUMS = {
  USER_STREAMS: ['PUC', 'B.TECH', 'M.TECH', 'MBA', 'MCA', 'B.SC', 'M.SC', 'B.COM', 'M.COM', 'BA', 'MA', 'OTHER'],
  USER_YEARS: [1, 2, 3, 4, 5, 6],
  ACCOUNT_STATUS: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'],
  
  ORGANIZATION_TYPES: ['DEPARTMENT', 'CLUB', 'SOCIETY', 'COMMITTEE', 'ASSOCIATION', 'EXTERNAL'],
  ORGANIZATION_CATEGORIES: ['ACADEMIC', 'TECHNICAL', 'CULTURAL', 'SPORTS', 'SOCIAL', 'PROFESSIONAL', 'OTHER'],
  APPROVAL_STATUS: ['PENDING', 'APPROVED', 'REJECTED', 'UNDER_REVIEW'],
  
  ADMIN_ROLES: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'],
  
  EVENT_CATEGORIES: ['TECHNICAL', 'CULTURAL', 'SPORTS', 'ACADEMIC', 'WORKSHOP', 'SEMINAR', 'COMPETITION', 'OTHER'],
  EVENT_TYPES: ['ONLINE', 'OFFLINE', 'HYBRID'],
  EVENT_STATUS: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'PUBLISHED', 'ONGOING', 'COMPLETED', 'CANCELLED'],
  
  PARTICIPANT_STATUS: ['REGISTERED', 'WAITLISTED', 'SELECTED', 'REJECTED', 'CONFIRMED', 'ATTENDED', 'ABSENT', 'CANCELLED'],
  PARTICIPANT_ROLES: ['PARTICIPANT', 'VOLUNTEER', 'SPEAKER', 'JUDGE', 'COORDINATOR'],
  PAYMENT_STATUS: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'NOT_REQUIRED'],
  
  NOTIFICATION_TYPES: ['EMAIL', 'SMS', 'PUSH', 'IN_APP', 'SYSTEM'],
  NOTIFICATION_CATEGORIES: [
    'EVENT_REGISTRATION', 'EVENT_UPDATE', 'EVENT_REMINDER', 'EVENT_CANCELLATION',
    'PAYMENT_CONFIRMATION', 'PAYMENT_REMINDER', 'PAYMENT_FAILED',
    'ACCOUNT_VERIFICATION', 'PASSWORD_RESET', 'LOGIN_ALERT',
    'ORGANIZATION_APPROVAL', 'ORGANIZATION_REJECTION',
    'GENERAL_ANNOUNCEMENT', 'SYSTEM_MAINTENANCE', 'SECURITY_ALERT',
    'CERTIFICATE_READY', 'FEEDBACK_REQUEST', 'OTHER'
  ],
  
  TICKET_CATEGORIES: [
    'TECHNICAL_ISSUE', 'ACCOUNT_PROBLEM', 'EVENT_INQUIRY', 'PAYMENT_ISSUE',
    'REGISTRATION_PROBLEM', 'FEATURE_REQUEST', 'BUG_REPORT', 'GENERAL_INQUIRY',
    'ORGANIZATION_SUPPORT', 'CERTIFICATE_ISSUE', 'OTHER'
  ],
  TICKET_PRIORITIES: ['LOW', 'NORMAL', 'HIGH', 'URGENT'],
  TICKET_STATUS: ['OPEN', 'IN_PROGRESS', 'PENDING_USER', 'PENDING_INTERNAL', 'RESOLVED', 'CLOSED', 'CANCELLED']
};

// Validation helpers
export const VALIDATION_PATTERNS = {
  EMAIL: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
  MOBILE: /^[\+]?[1-9][\d]{0,15}$/,
  PINCODE: /^\d{6}$/,
  URL: /^https?:\/\/.+/,
  FACEBOOK_URL: /^https?:\/\/(www\.)?facebook\.com\/.+/,
  TWITTER_URL: /^https?:\/\/(www\.)?twitter\.com\/.+/,
  INSTAGRAM_URL: /^https?:\/\/(www\.)?instagram\.com\/.+/,
  LINKEDIN_URL: /^https?:\/\/(www\.)?linkedin\.com\/.+/
};

// Default values for common fields
export const DEFAULTS = {
  TIMEZONE: 'Asia/Kolkata',
  CURRENCY: 'INR',
  PAGINATION_LIMIT: 20,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  
  SLA_RESPONSE_TIME: 240, // 4 hours in minutes
  SLA_RESOLUTION_TIME: 2880, // 48 hours in minutes
  
  PASSWORD_MIN_LENGTH: 8,
  OTP_EXPIRY_MINUTES: 10,
  EMAIL_VERIFICATION_EXPIRY_HOURS: 24,
  PASSWORD_RESET_EXPIRY_MINUTES: 10
};

// Database configuration helpers
export const DB_CONFIG = {
  // Connection options
  CONNECTION_OPTIONS: {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    bufferCommands: false
  },
  
  // Index creation for all models
  createIndexes: async () => {
    try {
      console.log('Creating database indexes...');
      
      // User indexes
      await User.createIndexes();
      console.log('✓ User indexes created');
      
      // Admin indexes
      await Admin.createIndexes();
      console.log('✓ Admin indexes created');
      
      // Organization indexes
      await Organization.createIndexes();
      console.log('✓ Organization indexes created');
      
      // Event indexes
      await Event.createIndexes();
      console.log('✓ Event indexes created');
      
      // Participant indexes
      await Participant.createIndexes();
      console.log('✓ Participant indexes created');
      
      // Notification indexes
      await Notification.createIndexes();
      console.log('✓ Notification indexes created');
      
      // Ticket indexes
      await Ticket.createIndexes();
      console.log('✓ Ticket indexes created');
      
      console.log('All database indexes created successfully!');
    } catch (error) {
      console.error('Error creating database indexes:', error);
      throw error;
    }
  }
};
