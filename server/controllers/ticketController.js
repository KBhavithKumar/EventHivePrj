import { Ticket, User, Admin, Organization, Event } from '../models/index.js';
import { sendNotificationEmail } from '../utils/email.js';

/**
 * Create a new support ticket
 */
export const createTicket = async (req, res) => {
  try {
    const {
      subject,
      description,
      category,
      priority = 'MEDIUM',
      relatedEvent
    } = req.body;

    const userId = req.user.id;
    const userType = req.user.userType;

    // Generate unique ticket number
    const ticketCount = await Ticket.countDocuments();
    const ticketNumber = `TKT-${Date.now()}-${String(ticketCount + 1).padStart(4, '0')}`;

    const ticket = new Ticket({
      ticketNumber,
      subject,
      description,
      category,
      priority,
      status: 'OPEN',
      createdBy: userId,
      createdByType: userType.toUpperCase(),
      relatedEvent,
      messages: [{
        sender: userId,
        senderType: userType.toUpperCase(),
        message: description,
        timestamp: new Date()
      }]
    });

    await ticket.save();

    // Populate the ticket for response
    await ticket.populate([
      { path: 'createdBy', select: 'firstName lastName name email officialEmail' },
      { path: 'relatedEvent', select: 'title' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Support ticket created successfully',
      data: { ticket }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create support ticket',
      error: error.message
    });
  }
};

/**
 * Get tickets for authenticated user
 */
export const getUserTickets = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.userType;
    const {
      page = 1,
      limit = 20,
      status,
      category,
      priority,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { 
      createdBy: userId,
      createdByType: userType.toUpperCase()
    };
    
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [tickets, total] = await Promise.all([
      Ticket.find(query)
        .populate('assignedTo', 'firstName lastName')
        .populate('relatedEvent', 'title')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Ticket.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        tickets,
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
      message: 'Failed to fetch tickets',
      error: error.message
    });
  }
};

/**
 * Get single ticket details
 */
export const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userType = req.user.userType;

    let query = { _id: id };
    
    // Non-admin users can only see their own tickets
    if (userType !== 'ADMIN') {
      query.createdBy = userId;
      query.createdByType = userType.toUpperCase();
    }

    const ticket = await Ticket.findOne(query)
      .populate('createdBy', 'firstName lastName name email officialEmail')
      .populate('assignedTo', 'firstName lastName email')
      .populate('relatedEvent', 'title startDateTime')
      .populate('messages.sender', 'firstName lastName name');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    res.json({
      success: true,
      data: { ticket }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ticket details',
      error: error.message
    });
  }
};

/**
 * Add message to ticket
 */
export const addTicketMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.user.id;
    const userType = req.user.userType;

    let query = { _id: id };
    
    // Non-admin users can only add messages to their own tickets
    if (userType !== 'ADMIN') {
      query.createdBy = userId;
      query.createdByType = userType.toUpperCase();
    }

    const ticket = await Ticket.findOne(query);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Add new message
    ticket.messages.push({
      sender: userId,
      senderType: userType.toUpperCase(),
      message,
      timestamp: new Date()
    });

    // Update ticket status if it was resolved and user is adding a message
    if (ticket.status === 'RESOLVED' && userType !== 'ADMIN') {
      ticket.status = 'OPEN';
    }

    ticket.lastUpdated = new Date();
    await ticket.save();

    // Populate the new message
    await ticket.populate('messages.sender', 'firstName lastName name');

    res.json({
      success: true,
      message: 'Message added successfully',
      data: { 
        ticket,
        newMessage: ticket.messages[ticket.messages.length - 1]
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add message',
      error: error.message
    });
  }
};

/**
 * Get all tickets (Admin only)
 */
export const getAllTickets = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      category,
      priority,
      assignedTo,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;
    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { ticketNumber: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [tickets, total] = await Promise.all([
      Ticket.find(query)
        .populate('createdBy', 'firstName lastName name email officialEmail')
        .populate('assignedTo', 'firstName lastName')
        .populate('relatedEvent', 'title')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Ticket.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        tickets,
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
      message: 'Failed to fetch tickets',
      error: error.message
    });
  }
};

/**
 * Update ticket (Admin only)
 */
export const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      priority,
      assignedTo,
      category,
      internalNotes
    } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (assignedTo) updateData.assignedTo = assignedTo;
    if (category) updateData.category = category;
    if (internalNotes) updateData.internalNotes = internalNotes;

    updateData.lastUpdated = new Date();

    // Set resolution date if status is being changed to RESOLVED
    if (status === 'RESOLVED') {
      updateData.resolvedAt = new Date();
      updateData.resolvedBy = req.user.id;
    }

    const ticket = await Ticket.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: 'createdBy', select: 'firstName lastName name email officialEmail' },
      { path: 'assignedTo', select: 'firstName lastName email' },
      { path: 'resolvedBy', select: 'firstName lastName' },
      { path: 'relatedEvent', select: 'title' }
    ]);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Send notification to ticket creator about status change
    if (status && ticket.createdBy) {
      const email = ticket.createdBy.email || ticket.createdBy.officialEmail;
      const name = ticket.createdBy.name || `${ticket.createdBy.firstName} ${ticket.createdBy.lastName}`;
      
      if (email) {
        await sendNotificationEmail(
          email,
          name,
          `Ticket Update: ${ticket.ticketNumber}`,
          `Your support ticket "${ticket.subject}" has been updated. New status: ${status}`
        );
      }
    }

    res.json({
      success: true,
      message: 'Ticket updated successfully',
      data: { ticket }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update ticket',
      error: error.message
    });
  }
};

/**
 * Get ticket statistics (Admin only)
 */
export const getTicketStats = async (req, res) => {
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
      totalTickets,
      openTickets,
      resolvedTickets,
      ticketsByCategory,
      ticketsByPriority,
      avgResolutionTime
    ] = await Promise.all([
      Ticket.countDocuments(dateFilter),
      Ticket.countDocuments({ ...dateFilter, status: 'OPEN' }),
      Ticket.countDocuments({ ...dateFilter, status: 'RESOLVED' }),
      Ticket.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Ticket.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Ticket.aggregate([
        { 
          $match: { 
            ...dateFilter, 
            status: 'RESOLVED',
            resolvedAt: { $exists: true }
          }
        },
        {
          $project: {
            resolutionTime: {
              $subtract: ['$resolvedAt', '$createdAt']
            }
          }
        },
        {
          $group: {
            _id: null,
            avgTime: { $avg: '$resolutionTime' }
          }
        }
      ])
    ]);

    const stats = {
      total: totalTickets,
      open: openTickets,
      resolved: resolvedTickets,
      resolutionRate: totalTickets > 0 ? (resolvedTickets / totalTickets * 100).toFixed(2) : 0,
      avgResolutionHours: avgResolutionTime.length > 0 ? 
        Math.round(avgResolutionTime[0].avgTime / (1000 * 60 * 60)) : 0,
      byCategory: ticketsByCategory,
      byPriority: ticketsByPriority,
      timeframe
    };

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ticket statistics',
      error: error.message
    });
  }
};

export default {
  createTicket,
  getUserTickets,
  getTicketById,
  addTicketMessage,
  getAllTickets,
  updateTicket,
  getTicketStats
};
