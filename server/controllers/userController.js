import { User, Event, Participant, Notification } from '../models/index.js';

/**
 * Get user dashboard statistics
 */
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [
      registeredEvents,
      upcomingEvents,
      completedEvents,
      notifications
    ] = await Promise.all([
      Participant.countDocuments({ user: userId }),
      Participant.countDocuments({ 
        user: userId, 
        status: 'CONFIRMED',
        event: { $in: await Event.find({ startDateTime: { $gt: new Date() } }).select('_id') }
      }),
      Participant.countDocuments({ 
        user: userId,
        event: { $in: await Event.find({ status: 'COMPLETED' }).select('_id') }
      }),
      Notification.countDocuments({ recipient: userId, isRead: false })
    ]);

    const stats = {
      events: {
        registered: registeredEvents,
        upcoming: upcomingEvents,
        completed: completedEvents
      },
      notifications: {
        unread: notifications
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
 * Get user profile
 */
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData.password;
    delete updateData.email;
    delete updateData.accountStatus;
    delete updateData.isEmailVerified;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

/**
 * Get available events for user
 */
export const getAvailableEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      page = 1,
      limit = 20,
      category,
      type,
      search,
      sortBy = 'startDateTime',
      sortOrder = 'asc'
    } = req.query;

    // Get user details for eligibility check
    const user = await User.findById(userId);

    const query = {
      status: 'PUBLISHED',
      startDateTime: { $gt: new Date() },
      registrationEndDate: { $gt: new Date() }
    };
    
    if (category) query.category = category;
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [events, total] = await Promise.all([
      Event.find(query)
        .populate('organizer', 'name logo')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Event.countDocuments(query)
    ]);

    // Filter events based on eligibility and add registration status
    const eventsWithStatus = await Promise.all(
      events.map(async (event) => {
        const eventObj = event.toObject();
        
        // Check eligibility
        eventObj.isEligible = event.isUserEligible(user);
        
        // Check if user is already registered
        const participation = await Participant.findOne({
          user: userId,
          event: event._id
        });
        
        eventObj.registrationStatus = participation ? participation.status : null;
        eventObj.isRegistered = !!participation;
        
        return eventObj;
      })
    );

    res.json({
      success: true,
      data: {
        events: eventsWithStatus,
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
 * Register for an event
 */
export const registerForEvent = async (req, res) => {
  try {
    const userId = req.user.id;
    const { eventId } = req.params;
    const { teamMembers, additionalInfo } = req.body;

    // Get event and user details
    const [event, user] = await Promise.all([
      Event.findById(eventId),
      User.findById(userId)
    ]);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if event is open for registration
    if (!event.isRegistrationOpen()) {
      return res.status(400).json({
        success: false,
        message: 'Registration is not open for this event'
      });
    }

    // Check eligibility
    if (!event.isUserEligible(user)) {
      return res.status(400).json({
        success: false,
        message: 'You are not eligible for this event'
      });
    }

    // Check if already registered
    const existingParticipation = await Participant.findOne({
      user: userId,
      event: eventId
    });

    if (existingParticipation) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event'
      });
    }

    // Check if event is full
    if (event.currentParticipants >= event.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Event is full'
      });
    }

    // Create participation record
    const participation = new Participant({
      user: userId,
      event: eventId,
      registeredAt: new Date(),
      status: 'PENDING',
      teamMembers: teamMembers || [],
      additionalInfo
    });

    await participation.save();

    // Update event participant count
    event.currentParticipants += 1;
    await event.save();

    // Create notification
    const notification = new Notification({
      recipient: userId,
      recipientType: 'USER',
      type: 'EVENT_REGISTRATION',
      title: 'Event Registration Successful',
      message: `You have successfully registered for "${event.title}"`,
      relatedEvent: eventId,
      channels: ['IN_APP']
    });

    await notification.save();

    res.status(201).json({
      success: true,
      message: 'Successfully registered for the event',
      data: { participation }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to register for event',
      error: error.message
    });
  }
};

/**
 * Get user's registered events
 */
export const getRegisteredEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      page = 1,
      limit = 20,
      status,
      sortBy = 'registeredAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { user: userId };
    if (status) query.status = status;

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [participations, total] = await Promise.all([
      Participant.find(query)
        .populate({
          path: 'event',
          populate: {
            path: 'organizer',
            select: 'name logo'
          }
        })
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Participant.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        participations,
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
      message: 'Failed to fetch registered events',
      error: error.message
    });
  }
};

/**
 * Cancel event registration
 */
export const cancelRegistration = async (req, res) => {
  try {
    const userId = req.user.id;
    const { eventId } = req.params;

    const participation = await Participant.findOne({
      user: userId,
      event: eventId
    });

    if (!participation) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    // Check if cancellation is allowed
    const event = await Event.findById(eventId);
    const now = new Date();
    const eventStart = new Date(event.startDateTime);
    const hoursUntilEvent = (eventStart - now) / (1000 * 60 * 60);

    if (hoursUntilEvent < 24) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel registration less than 24 hours before the event'
      });
    }

    // Remove participation
    await Participant.findByIdAndDelete(participation._id);

    // Update event participant count
    event.currentParticipants = Math.max(0, event.currentParticipants - 1);
    await event.save();

    res.json({
      success: true,
      message: 'Registration cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to cancel registration',
      error: error.message
    });
  }
};

/**
 * Get user notifications
 */
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      page = 1,
      limit = 20,
      isRead,
      type
    } = req.query;

    const query = { recipient: userId };
    if (isRead !== undefined) query.isRead = isRead === 'true';
    if (type) query.type = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .populate('relatedEvent', 'title')
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
export const markNotificationRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: userId },
      { isRead: true, readAt: new Date() },
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

export default {
  getDashboardStats,
  getProfile,
  updateProfile,
  getAvailableEvents,
  registerForEvent,
  getRegisteredEvents,
  cancelRegistration,
  getNotifications,
  markNotificationRead
};
