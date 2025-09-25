import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Email configuration
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true' || false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
};

// Create transporter
let transporter;

const createTransporter = () => {
  try {
    transporter = nodemailer.createTransport(EMAIL_CONFIG);
    console.log('✓ Email transporter created successfully');
  } catch (error) {
    console.error('❌ Failed to create email transporter:', error.message);
  }
};

// Initialize transporter
createTransporter();

/**
 * Verify email configuration
 * @returns {Promise<Boolean>} Configuration status
 */
export const verifyEmailConfig = async () => {
  try {
    if (!transporter) {
      throw new Error('Email transporter not initialized');
    }

    await transporter.verify();
    console.log('✓ Email configuration verified');
    return true;
  } catch (error) {
    console.error('❌ Email configuration verification failed:', error.message);
    return false;
  }
};

/**
 * Load email template
 * @param {String} templateName - Template file name
 * @param {Object} variables - Variables to replace in template
 * @returns {String} Processed template
 */
const loadTemplate = (templateName, variables = {}) => {
  try {
    const templatePath = path.join(__dirname, '../templates/email', `${templateName}.html`);
    let template = fs.readFileSync(templatePath, 'utf8');
    
    // Replace variables in template
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      template = template.replace(regex, variables[key]);
    });
    
    return template;
  } catch (error) {
    console.error(`❌ Failed to load email template ${templateName}:`, error.message);
    return null;
  }
};

/**
 * Send email
 * @param {Object} options - Email options
 * @returns {Promise<Object>} Send result
 */
export const sendEmail = async (options) => {
  try {
    if (!transporter) {
      throw new Error('Email transporter not initialized');
    }

    const {
      to,
      subject,
      text,
      html,
      template,
      templateVariables = {},
      attachments = []
    } = options;

    let emailHtml = html;
    
    // Use template if provided
    if (template) {
      emailHtml = loadTemplate(template, {
        ...templateVariables,
        currentYear: new Date().getFullYear(),
        appName: 'EventHive',
        appUrl: process.env.CLIENT_URL || 'http://localhost:5173'
      });
    }

    const mailOptions = {
      from: {
        name: process.env.FROM_NAME || 'EventHive',
        address: process.env.FROM_EMAIL || process.env.SMTP_USER
      },
      to,
      subject,
      text,
      html: emailHtml,
      attachments
    };

    const result = await transporter.sendMail(mailOptions);
    
    console.log(`✓ Email sent successfully to ${to}`);
    return {
      success: true,
      messageId: result.messageId,
      response: result.response
    };
  } catch (error) {
    console.error(`❌ Failed to send email to ${options.to}:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Send OTP email
 * @param {String} email - Recipient email
 * @param {String} otp - OTP code
 * @param {String} userName - User name
 * @param {String} purpose - Purpose of OTP
 * @returns {Promise<Object>} Send result
 */
export const sendOTPEmail = async (email, otp, userName, purpose = 'verification') => {
  const subject = `EventHive - Your ${purpose} code`;
  
  return await sendEmail({
    to: email,
    subject,
    template: 'otp',
    templateVariables: {
      userName,
      otp,
      purpose,
      expiryMinutes: 10
    }
  });
};

/**
 * Send welcome email
 * @param {String} email - Recipient email
 * @param {String} userName - User name
 * @param {String} userType - Type of user
 * @param {String} verificationLink - Email verification link
 * @returns {Promise<Object>} Send result
 */
export const sendWelcomeEmail = async (email, userName, userType, verificationLink) => {
  const subject = 'Welcome to EventHive - Verify Your Email';
  
  return await sendEmail({
    to: email,
    subject,
    template: 'welcome',
    templateVariables: {
      userName,
      userType,
      verificationLink
    }
  });
};

/**
 * Send email verification
 * @param {String} email - Recipient email
 * @param {String} userName - User name
 * @param {String} verificationLink - Verification link
 * @returns {Promise<Object>} Send result
 */
export const sendEmailVerification = async (email, userName, verificationLink) => {
  const subject = 'EventHive - Verify Your Email Address';
  
  return await sendEmail({
    to: email,
    subject,
    template: 'email-verification',
    templateVariables: {
      userName,
      verificationLink
    }
  });
};

/**
 * Send password reset email
 * @param {String} email - Recipient email
 * @param {String} userName - User name
 * @param {String} resetLink - Password reset link
 * @returns {Promise<Object>} Send result
 */
export const sendPasswordResetEmail = async (email, userName, resetLink) => {
  const subject = 'EventHive - Reset Your Password';
  
  return await sendEmail({
    to: email,
    subject,
    template: 'password-reset',
    templateVariables: {
      userName,
      resetLink,
      expiryMinutes: 10
    }
  });
};

/**
 * Send organization approval email
 * @param {String} email - Recipient email
 * @param {String} organizationName - Organization name
 * @param {String} status - Approval status
 * @param {String} reason - Reason for rejection (if applicable)
 * @returns {Promise<Object>} Send result
 */
export const sendOrganizationApprovalEmail = async (email, organizationName, status, reason = '') => {
  const subject = `EventHive - Organization ${status === 'APPROVED' ? 'Approved' : 'Application Update'}`;
  
  return await sendEmail({
    to: email,
    subject,
    template: 'organization-approval',
    templateVariables: {
      organizationName,
      status,
      reason,
      isApproved: status === 'APPROVED'
    }
  });
};

/**
 * Send event notification email
 * @param {String} email - Recipient email
 * @param {String} userName - User name
 * @param {Object} eventDetails - Event details
 * @param {String} notificationType - Type of notification
 * @returns {Promise<Object>} Send result
 */
export const sendEventNotificationEmail = async (email, userName, eventDetails, notificationType) => {
  const subjectMap = {
    'registration_confirmation': 'Event Registration Confirmed',
    'event_reminder': 'Event Reminder',
    'event_update': 'Event Update',
    'event_cancellation': 'Event Cancelled'
  };
  
  const subject = `EventHive - ${subjectMap[notificationType] || 'Event Notification'}`;
  
  return await sendEmail({
    to: email,
    subject,
    template: 'event-notification',
    templateVariables: {
      userName,
      eventTitle: eventDetails.title,
      eventDate: eventDetails.startDateTime,
      eventVenue: eventDetails.venue?.name || 'Online',
      notificationType,
      eventDetails
    }
  });
};

/**
 * Send notification email
 * @param {String} email - Recipient email
 * @param {String} userName - User name
 * @param {String} subject - Email subject
 * @param {String} message - Email message
 * @returns {Promise<Object>} Send result
 */
export const sendNotificationEmail = async (email, userName, subject, message) => {
  return await sendEmail({
    to: email,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Hello ${userName},</h2>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0; line-height: 1.6;">${message}</p>
        </div>
        <p style="color: #666; font-size: 14px;">
          Best regards,<br>
          EventHive Team
        </p>
      </div>
    `
  });
};

/**
 * Send bulk emails
 * @param {Array} recipients - Array of recipient objects
 * @param {Object} emailOptions - Email options
 * @returns {Promise<Array>} Array of send results
 */
export const sendBulkEmails = async (recipients, emailOptions) => {
  const results = [];
  
  for (const recipient of recipients) {
    try {
      const result = await sendEmail({
        ...emailOptions,
        to: recipient.email,
        templateVariables: {
          ...emailOptions.templateVariables,
          userName: recipient.name,
          ...recipient.variables
        }
      });
      
      results.push({
        email: recipient.email,
        ...result
      });
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      results.push({
        email: recipient.email,
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
};

/**
 * Test email configuration
 * @param {String} testEmail - Test email address
 * @returns {Promise<Object>} Test result
 */
export const testEmailConfig = async (testEmail) => {
  try {
    const result = await sendEmail({
      to: testEmail,
      subject: 'EventHive - Email Configuration Test',
      text: 'This is a test email to verify your email configuration.',
      html: '<h2>Email Configuration Test</h2><p>This is a test email to verify your email configuration.</p>'
    });
    
    return result;
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Initialize email verification on startup
verifyEmailConfig();

export default {
  sendEmail,
  sendOTPEmail,
  sendWelcomeEmail,
  sendEmailVerification,
  sendPasswordResetEmail,
  sendOrganizationApprovalEmail,
  sendEventNotificationEmail,
  sendNotificationEmail,
  sendBulkEmails,
  testEmailConfig,
  verifyEmailConfig
};
