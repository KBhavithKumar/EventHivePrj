import { User, Admin, Organization, Event, Participant, Notification, Ticket } from '../models/index.js';
import { generateTokenPair } from '../utils/jwt.js';
import { sendWelcomeEmail, sendNotificationEmail } from '../utils/email.js';

/**
 * Get admin dashboard statistics
 */
export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalOrganizations,
      totalEvents,
      pendingOrganizations,
      pendingEvents,
      activeEvents,
      totalParticipants,
      recentTickets
    ] = await Promise.all([
      User.countDocuments(),
      Organization.countDocuments(),
      Event.countDocuments(),
      Organization.countDocuments({ approvalStatus: 'PENDING' }),
      Event.countDocuments({ approvalStatus: 'PENDING' }),
      Event.countDocuments({ status: 'PUBLISHED', startDateTime: { $gt: new Date() } }),
      Participant.countDocuments(),
      Ticket.countDocuments({ status: 'OPEN' })
    ]);

    const stats = {
      overview: {
        totalUsers,
        totalOrganizations,
        totalEvents,
        totalParticipants
      },
      pending: {
        organizations: pendingOrganizations,
        events: pendingEvents
      },
      active: {
        events: activeEvents,
        tickets: recentTickets
      }
    };

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
};

/**
 * Get all users with pagination and filters
 */
export const getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      stream,
      year,
      accountStatus,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (stream) query.stream = stream;
    if (year) query.year = parseInt(year);
    if (accountStatus) query.accountStatus = accountStatus;

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

/**
 * Get all organizations with pagination and filters
 */
export const getOrganizations = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      type,
      category,
      approvalStatus,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { officialEmail: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (type) query.type = type;
    if (category) query.category = category;
    if (approvalStatus) query.approvalStatus = approvalStatus;

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [organizations, total] = await Promise.all([
      Organization.find(query)
        .select('-password')
        .populate('approvedBy', 'firstName lastName')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Organization.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        organizations,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch organizations',
      error: error.message
    });
  }
};

/**
 * Approve or reject organization
 */
export const updateOrganizationApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { approvalStatus, rejectionReason } = req.body;
    const adminId = req.user.id;

    const organization = await Organization.findById(id);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    organization.approvalStatus = approvalStatus;
    organization.approvedBy = adminId;
    organization.approvedAt = new Date();

    if (approvalStatus === 'REJECTED') {
      organization.rejectionReason = rejectionReason;
    } else if (approvalStatus === 'APPROVED') {
      organization.accountStatus = 'ACTIVE';
      organization.rejectionReason = undefined;
    }

    await organization.save();

    // Send notification email
    const statusText = approvalStatus === 'APPROVED' ? 'approved' : 'rejected';
    await sendNotificationEmail(
      organization.officialEmail,
      organization.name,
      `Organization ${statusText}`,
      `Your organization has been ${statusText}.${approvalStatus === 'REJECTED' ? ` Reason: ${rejectionReason}` : ''}`
    );

    res.json({
      success: true,
      message: `Organization ${statusText} successfully`,
      data: { organization }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update organization approval',
      error: error.message
    });
  }
};

/**
 * Get all events with pagination and filters
 */
export const getEvents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      type,
      status,
      approvalStatus,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) query.category = category;
    if (type) query.type = type;
    if (status) query.status = status;
    if (approvalStatus) query.approvalStatus = approvalStatus;

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [events, total] = await Promise.all([
      Event.find(query)
        .populate('organizer', 'name logo')
        .populate('approvedBy', 'firstName lastName')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Event.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        events,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events',
      error: error.message
    });
  }
};

/**
 * Approve or reject event
 */
export const updateEventApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { approvalStatus, rejectionReason } = req.body;
    const adminId = req.user.id;

    const event = await Event.findById(id).populate('organizer', 'name officialEmail');
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    event.approvalStatus = approvalStatus;
    event.approvedBy = adminId;
    event.approvedAt = new Date();

    if (approvalStatus === 'REJECTED') {
      event.rejectionReason = rejectionReason;
      event.status = 'REJECTED';
    } else if (approvalStatus === 'APPROVED') {
      event.status = 'APPROVED';
      event.rejectionReason = undefined;
    }

    await event.save();

    // Send notification email to organizer
    const statusText = approvalStatus === 'APPROVED' ? 'approved' : 'rejected';
    await sendNotificationEmail(
      event.organizer.officialEmail,
      event.organizer.name,
      `Event ${statusText}: ${event.title}`,
      `Your event "${event.title}" has been ${statusText}.${approvalStatus === 'REJECTED' ? ` Reason: ${rejectionReason}` : ''}`
    );

    res.json({
      success: true,
      message: `Event ${statusText} successfully`,
      data: { event }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update event approval',
      error: error.message
    });
  }
};

/**
 * Update user account status
 */
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { accountStatus, reason } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const oldStatus = user.accountStatus;
    user.accountStatus = accountStatus;
    
    if (accountStatus === 'SUSPENDED' && reason) {
      user.suspensionReason = reason;
    } else {
      user.suspensionReason = undefined;
    }

    await user.save();

    // Send notification email
    if (oldStatus !== accountStatus) {
      await sendNotificationEmail(
        user.email,
        `${user.firstName} ${user.lastName}`,
        `Account status updated`,
        `Your account status has been changed to ${accountStatus}.${reason ? ` Reason: ${reason}` : ''}`
      );
    }

    res.json({
      success: true,
      message: 'User status updated successfully',
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: error.message
    });
  }
};

/**
 * Create new admin
 */
export const createAdmin = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      role,
      permissions
    } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin with this email already exists'
      });
    }

    // Create new admin
    const admin = new Admin({
      firstName,
      lastName,
      email,
      password,
      role,
      permissions,
      createdBy: req.user.id
    });

    await admin.save();

    // Send welcome email
    await sendWelcomeEmail(email, `${firstName} ${lastName}`, 'Admin');

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: {
        admin: {
          id: admin._id,
          firstName: admin.firstName,
          lastName: admin.lastName,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create admin',
      error: error.message
    });
  }
};

/**
 * Update organization status
 */
export const updateOrganizationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const organization = await Organization.findById(id);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Update status
    organization.status = status;
    await organization.save();

    res.json({
      success: true,
      message: `Organization status updated to ${status.toLowerCase()} successfully`,
      data: { organization }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update organization status',
      error: error.message
    });
  }
};

/**
 * Update event status
 */
export const updateEventStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Update status
    event.status = status;
    await event.save();

    res.json({
      success: true,
      message: `Event status updated to ${status.toLowerCase()} successfully`,
      data: { event }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update event status',
      error: error.message
    });
  }
};

export default {
  getDashboardStats,
  getUsers,
  getOrganizations,
  updateOrganizationApproval,
  updateOrganizationStatus,
  getEvents,
  updateEventApproval,
  updateEventStatus,
  updateUserStatus,
  createAdmin
};
