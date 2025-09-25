import { Notification, User, Admin, Organization } from '../models/index.js';
import { sendNotificationEmail } from '../utils/email.js';

/**
 * Get public notifications (no authentication required)
 */
export const getPublicNotifications = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      priority
    } = req.query;

    const query = {
      isPublic: true,
      status: 'ACTIVE'
    };

    if (type) query.type = type;
    if (priority) query.priority = priority;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .populate('sender', 'firstName lastName name')
        .populate('relatedEvent', 'title startDateTime venue')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Notification.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching public notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
};

/**
 * Get notifications for authenticated user
 */
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.userType;
    const {
      page = 1,
      limit = 20,
      isRead,
      type,
      priority
    } = req.query;

    const query = { 
      recipient: userId,
      recipientType: userType.toUpperCase()
    };
    
    if (isRead !== undefined) query.isRead = isRead === 'true';
    if (type) query.type = type;
    if (priority) query.priority = priority;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .populate('sender', 'firstName lastName name')
        .populate('relatedEvent', 'title startDateTime')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Notification.countDocuments(query),
      Notification.countDocuments({ 
        recipient: userId, 
        recipientType: userType.toUpperCase(), 
        isRead: false 
      })
    ]);

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
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
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

/**
 * Mark notification as read
 */
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userType = req.user.userType;

    const notification = await Notification.findOneAndUpdate(
      { 
        _id: id, 
        recipient: userId,
        recipientType: userType.toUpperCase()
      },
      { 
        isRead: true, 
        readAt: new Date() 
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: { notification }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.userType;

    const result = await Notification.updateMany(
      { 
        recipient: userId,
        recipientType: userType.toUpperCase(),
        isRead: false
      },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`,
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
};

/**
 * Delete notification
 */
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userType = req.user.userType;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      recipient: userId,
      recipientType: userType.toUpperCase()
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
};

/**
 * Send notification (Admin only)
 */
export const sendNotification = async (req, res) => {
  try {
    const {
      recipients,
      recipientType,
      type,
      title,
      message,
      priority = 'MEDIUM',
      channels = ['IN_APP'],
      relatedEvent
    } = req.body;

    const senderId = req.user.id;
    const senderType = req.user.userType;

    // Validate recipients
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Recipients array is required'
      });
    }

    const notifications = [];
    const emailPromises = [];

    for (const recipientId of recipients) {
      // Create notification record
      const notification = new Notification({
        recipient: recipientId,
        recipientType: recipientType.toUpperCase(),
        sender: senderId,
        senderType: senderType.toUpperCase(),
        type,
        title,
        message,
        priority,
        channels,
        relatedEvent
      });

      notifications.push(notification);

      // Send email if email channel is enabled
      if (channels.includes('EMAIL')) {
        let recipientData;
        
        switch (recipientType.toUpperCase()) {
          case 'USER':
            recipientData = await User.findById(recipientId).select('firstName lastName email');
            break;
          case 'ORGANIZATION':
            recipientData = await Organization.findById(recipientId).select('name officialEmail');
            break;
          case 'ADMIN':
            recipientData = await Admin.findById(recipientId).select('firstName lastName email');
            break;
        }

        if (recipientData) {
          const email = recipientData.email || recipientData.officialEmail;
          const name = recipientData.name || `${recipientData.firstName} ${recipientData.lastName}`;
          
          emailPromises.push(
            sendNotificationEmail(email, name, title, message)
          );
        }
      }
    }

    // Save all notifications
    await Notification.insertMany(notifications);

    // Send emails
    if (emailPromises.length > 0) {
      await Promise.allSettled(emailPromises);
    }

    res.status(201).json({
      success: true,
      message: `Notification sent to ${recipients.length} recipients`,
      data: {
        recipientCount: recipients.length,
        channels
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send notification',
      error: error.message
    });
  }
};

/**
 * Get notification statistics (Admin only)
 */
export const getNotificationStats = async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    switch (timeframe) {
      case '7d':
        dateFilter = { createdAt: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) } };
        break;
      case '30d':
        dateFilter = { createdAt: { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) } };
        break;
      case '90d':
        dateFilter = { createdAt: { $gte: new Date(now - 90 * 24 * 60 * 60 * 1000) } };
        break;
    }

    const [
      totalNotifications,
      readNotifications,
      unreadNotifications,
      notificationsByType,
      notificationsByPriority
    ] = await Promise.all([
      Notification.countDocuments(dateFilter),
      Notification.countDocuments({ ...dateFilter, isRead: true }),
      Notification.countDocuments({ ...dateFilter, isRead: false }),
      Notification.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Notification.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    const stats = {
      total: totalNotifications,
      read: readNotifications,
      unread: unreadNotifications,
      readRate: totalNotifications > 0 ? (readNotifications / totalNotifications * 100).toFixed(2) : 0,
      byType: notificationsByType,
      byPriority: notificationsByPriority,
      timeframe
    };

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification statistics',
      error: error.message
    });
  }
};

export default {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  sendNotification,
  getNotificationStats
};
