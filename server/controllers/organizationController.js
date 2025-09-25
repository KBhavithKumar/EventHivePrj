import { Organization, Event, Participant, Notification } from '../models/index.js';
import { sendNotificationEmail } from '../utils/email.js';

/**
 * Get organization dashboard statistics
 */
export const getDashboardStats = async (req, res) => {
  try {
    const organizationId = req.user.id;

    const [
      totalEvents,
      publishedEvents,
      draftEvents,
      totalParticipants,
      upcomingEvents,
      completedEvents
    ] = await Promise.all([
      Event.countDocuments({ organizer: organizationId }),
      Event.countDocuments({ organizer: organizationId, status: 'PUBLISHED' }),
      Event.countDocuments({ organizer: organizationId, status: 'DRAFT' }),
      Participant.countDocuments({ 
        event: { $in: await Event.find({ organizer: organizationId }).select('_id') }
      }),
      Event.countDocuments({ 
        organizer: organizationId, 
        status: 'PUBLISHED',
        startDateTime: { $gt: new Date() }
      }),
      Event.countDocuments({ 
        organizer: organizationId, 
        status: 'COMPLETED'
      })
    ]);

    const stats = {
      events: {
        total: totalEvents,
        published: publishedEvents,
        draft: draftEvents,
        upcoming: upcomingEvents,
        completed: completedEvents
      },
      participants: {
        total: totalParticipants
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
 * Get organization profile
 */
export const getProfile = async (req, res) => {
  try {
    const organization = await Organization.findById(req.user.id).select('-password');
    
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    res.json({
      success: true,
      data: { organization }
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
 * Update organization profile
 */
export const updateProfile = async (req, res) => {
  try {
    const organizationId = req.user.id;
    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData.password;
    delete updateData.approvalStatus;
    delete updateData.accountStatus;
    delete updateData.approvedBy;
    delete updateData.approvedAt;

    const organization = await Organization.findByIdAndUpdate(
      organizationId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { organization }
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
 * Get organization events
 */
export const getEvents = async (req, res) => {
  try {
    const organizationId = req.user.id;
    const {
      page = 1,
      limit = 20,
      status,
      category,
      type,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { organizer: organizationId };
    
    if (status) query.status = status;
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
 * Create new event
 */
export const createEvent = async (req, res) => {
  try {
    const organizationId = req.user.id;
    const eventData = {
      ...req.body,
      organizer: organizationId
    };

    const event = new Event(eventData);
    await event.save();

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: { event }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create event',
      error: error.message
    });
  }
};

/**
 * Update event
 */
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.id;
    const updateData = req.body;

    // Remove fields that shouldn't be updated via this endpoint
    delete updateData.organizer;
    delete updateData.approvalStatus;
    delete updateData.approvedBy;
    delete updateData.approvedAt;

    const event = await Event.findOneAndUpdate(
      { _id: id, organizer: organizationId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or you do not have permission to update it'
      });
    }

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: { event }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update event',
      error: error.message
    });
  }
};

/**
 * Delete event
 */
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.id;

    const event = await Event.findOneAndDelete({ 
      _id: id, 
      organizer: organizationId,
      status: { $in: ['DRAFT', 'REJECTED'] } // Only allow deletion of draft or rejected events
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or cannot be deleted'
      });
    }

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete event',
      error: error.message
    });
  }
};

/**
 * Get event participants
 */
export const getEventParticipants = async (req, res) => {
  try {
    const { eventId } = req.params;
    const organizationId = req.user.id;
    const {
      page = 1,
      limit = 20,
      status,
      search,
      sortBy = 'registeredAt',
      sortOrder = 'desc'
    } = req.query;

    // Verify event belongs to organization
    const event = await Event.findOne({ _id: eventId, organizer: organizationId });
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or you do not have permission to view participants'
      });
    }

    const query = { event: eventId };
    if (status) query.status = status;

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let participants;
    let total;

    if (search) {
      // If search is provided, we need to populate user data and filter
      participants = await Participant.find(query)
        .populate({
          path: 'user',
          match: {
            $or: [
              { firstName: { $regex: search, $options: 'i' } },
              { lastName: { $regex: search, $options: 'i' } },
              { email: { $regex: search, $options: 'i' } },
              { studentId: { $regex: search, $options: 'i' } }
            ]
          },
          select: 'firstName lastName email studentId stream year'
        })
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));

      // Filter out participants where user didn't match search
      participants = participants.filter(p => p.user);
      total = participants.length;
    } else {
      [participants, total] = await Promise.all([
        Participant.find(query)
          .populate('user', 'firstName lastName email studentId stream year')
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit)),
        Participant.countDocuments(query)
      ]);
    }

    res.json({
      success: true,
      data: {
        participants,
        event: {
          id: event._id,
          title: event.title,
          maxParticipants: event.maxParticipants,
          currentParticipants: event.currentParticipants
        },
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
      message: 'Failed to fetch event participants',
      error: error.message
    });
  }
};

/**
 * Send notification to participants
 */
export const sendParticipantNotification = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { subject, message, recipientType = 'ALL' } = req.body;
    const organizationId = req.user.id;

    // Verify event belongs to organization
    const event = await Event.findOne({ _id: eventId, organizer: organizationId });
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or you do not have permission'
      });
    }

    // Get participants based on recipient type
    let participantQuery = { event: eventId };
    if (recipientType === 'CONFIRMED') {
      participantQuery.status = 'CONFIRMED';
    } else if (recipientType === 'PENDING') {
      participantQuery.status = 'PENDING';
    }

    const participants = await Participant.find(participantQuery)
      .populate('user', 'firstName lastName email');

    // Send notifications
    const notifications = [];
    for (const participant of participants) {
      // Create notification record
      const notification = new Notification({
        recipient: participant.user._id,
        recipientType: 'USER',
        sender: organizationId,
        senderType: 'ORGANIZATION',
        type: 'EVENT_UPDATE',
        title: subject,
        message,
        relatedEvent: eventId,
        channels: ['EMAIL', 'IN_APP']
      });

      notifications.push(notification);

      // Send email
      await sendNotificationEmail(
        participant.user.email,
        `${participant.user.firstName} ${participant.user.lastName}`,
        subject,
        message
      );
    }

    // Save all notifications
    await Notification.insertMany(notifications);

    res.json({
      success: true,
      message: `Notification sent to ${participants.length} participants`,
      data: {
        recipientCount: participants.length,
        recipientType
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

export default {
  getDashboardStats,
  getProfile,
  updateProfile,
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventParticipants,
  sendParticipantNotification
};
