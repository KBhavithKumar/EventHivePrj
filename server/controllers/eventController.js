import { Event, Organization, Participant } from '../models/index.js';

/**
 * Get all published events (public endpoint)
 */
export const getPublicEvents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      type,
      search,
      sortBy = 'startDateTime',
      sortOrder = 'asc'
    } = req.query;

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
        .populate('organizer', 'name logo website')
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
 * Get single event details (public endpoint)
 */
export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findOne({
      _id: id,
      status: 'PUBLISHED'
    }).populate('organizer', 'name logo website description contactEmail mobileNumber');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Add registration status if user is authenticated
    let registrationStatus = null;
    if (req.user) {
      const participation = await Participant.findOne({
        user: req.user.id,
        event: id
      });
      registrationStatus = participation ? participation.status : null;
    }

    res.json({
      success: true,
      data: {
        event: {
          ...event.toObject(),
          registrationStatus,
          isRegistered: !!registrationStatus
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event details',
      error: error.message
    });
  }
};

/**
 * Get featured events (public endpoint)
 */
export const getFeaturedEvents = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const events = await Event.find({
      status: 'PUBLISHED',
      startDateTime: { $gt: new Date() },
      registrationEndDate: { $gt: new Date() },
      isFeatured: true
    })
      .populate('organizer', 'name logo')
      .sort({ startDateTime: 1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: { events }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured events',
      error: error.message
    });
  }
};

/**
 * Get events by category (public endpoint)
 */
export const getEventsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 10 } = req.query;

    const events = await Event.find({
      status: 'PUBLISHED',
      category: category.toUpperCase(),
      startDateTime: { $gt: new Date() },
      registrationEndDate: { $gt: new Date() }
    })
      .populate('organizer', 'name logo')
      .sort({ startDateTime: 1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: { events, category }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events by category',
      error: error.message
    });
  }
};

/**
 * Get upcoming events (public endpoint)
 */
export const getUpcomingEvents = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const events = await Event.find({
      status: 'PUBLISHED',
      startDateTime: { $gt: new Date() },
      registrationEndDate: { $gt: new Date() }
    })
      .populate('organizer', 'name logo')
      .sort({ startDateTime: 1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: { events }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming events',
      error: error.message
    });
  }
};

/**
 * Get event statistics (public endpoint)
 */
export const getEventStats = async (req, res) => {
  try {
    const [
      totalEvents,
      upcomingEvents,
      totalOrganizations,
      totalParticipants,
      eventsByCategory
    ] = await Promise.all([
      Event.countDocuments({ status: 'PUBLISHED' }),
      Event.countDocuments({
        status: 'PUBLISHED',
        startDateTime: { $gt: new Date() }
      }),
      Organization.countDocuments({ approvalStatus: 'APPROVED' }),
      Participant.countDocuments(),
      Event.aggregate([
        { $match: { status: 'PUBLISHED' } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    const stats = {
      totalEvents,
      upcomingEvents,
      totalOrganizations,
      totalParticipants,
      eventsByCategory
    };

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event statistics',
      error: error.message
    });
  }
};

/**
 * Search events (public endpoint)
 */
export const searchEvents = async (req, res) => {
  try {
    const {
      q: searchTerm,
      category,
      type,
      startDate,
      endDate,
      page = 1,
      limit = 20
    } = req.query;

    if (!searchTerm || searchTerm.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search term must be at least 2 characters long'
      });
    }

    const query = {
      status: 'PUBLISHED',
      startDateTime: { $gt: new Date() },
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { tags: { $in: [new RegExp(searchTerm, 'i')] } }
      ]
    };

    if (category) query.category = category;
    if (type) query.type = type;
    if (startDate) {
      query.startDateTime = { 
        ...query.startDateTime,
        $gte: new Date(startDate)
      };
    }
    if (endDate) {
      query.startDateTime = {
        ...query.startDateTime,
        $lte: new Date(endDate)
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [events, total] = await Promise.all([
      Event.find(query)
        .populate('organizer', 'name logo')
        .sort({ startDateTime: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Event.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        events,
        searchTerm,
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
      message: 'Failed to search events',
      error: error.message
    });
  }
};

/**
 * Get event categories (public endpoint)
 */
export const getEventCategories = async (req, res) => {
  try {
    const categories = await Event.aggregate([
      { $match: { status: 'PUBLISHED' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event categories',
      error: error.message
    });
  }
};

export default {
  getPublicEvents,
  getEventById,
  getFeaturedEvents,
  getEventsByCategory,
  getUpcomingEvents,
  getEventStats,
  searchEvents,
  getEventCategories
};
