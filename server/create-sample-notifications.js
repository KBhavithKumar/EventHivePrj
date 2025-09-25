import mongoose from 'mongoose';
import { config } from 'dotenv';
import Notification from './models/Notification.js';
import Event from './models/Event.js';
import Organization from './models/Organization.js';

config();

const createSampleNotifications = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eventhive');
    console.log('Connected to MongoDB');

    // Get the test organization and events
    const organization = await Organization.findOne({ officialEmail: 'org@gmail.com' });
    const events = await Event.find({ organizer: organization._id }).limit(3);
    
    if (!organization) {
      console.log('❌ Test organization not found. Please run create-test-users.js first.');
      return;
    }

    if (events.length === 0) {
      console.log('❌ No events found. Please run create-sample-events.js first.');
      return;
    }

    // Clear existing notifications
    await Notification.deleteMany({});
    console.log('Cleared existing notifications');

    // Sample notifications data
    const sampleNotifications = [
      {
        title: 'Registration Open: Tech Innovation Summit 2024',
        message: 'Registration is now open for the Tech Innovation Summit 2024! Join us for an exciting summit featuring the latest innovations in technology, AI, and software development. Early bird registration ends in 7 days.',
        type: 'IN_APP',
        category: 'EVENT_REGISTRATION',
        sender: {
          id: organization._id,
          model: 'Organization',
          name: organization.name
        },
        recipients: [], // Empty for public notifications
        relatedEntity: {
          id: events[0]._id,
          model: 'Event'
        }
      },
      {
        title: 'Event Reminder: Cultural Night - Diwali Celebration',
        message: 'Don\'t forget! The Diwali Celebration is happening tomorrow evening. Join us for traditional performances, delicious food, and cultural activities. Gates open at 6:00 PM.',
        type: 'IN_APP',
        category: 'EVENT_REMINDER',
        sender: {
          id: organization._id,
          model: 'Organization',
          name: organization.name
        },
        recipients: [],
        relatedEntity: {
          id: events[1]._id,
          model: 'Event'
        }
      },
      {
        title: 'System Maintenance Scheduled',
        message: 'The EventHive platform will undergo scheduled maintenance on Sunday, November 10th from 2:00 AM to 4:00 AM. During this time, the platform may be temporarily unavailable.',
        type: 'IN_APP',
        category: 'SYSTEM_MAINTENANCE',
        sender: {
          id: organization._id,
          model: 'Organization',
          name: organization.name
        },
        recipients: []
      }
    ];

    // Create notifications
    const createdNotifications = await Notification.insertMany(sampleNotifications);

    console.log('\n✅ Sample notifications created successfully!');
    console.log(`📢 Created ${createdNotifications.length} notifications:`);
    
    createdNotifications.forEach((notification, index) => {
      console.log(`${index + 1}. ${notification.title} (${notification.type}) - ${notification.priority}`);
    });

    console.log('\n🎉 Notifications are now available on the All Notifications page!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating sample notifications:', error);
    process.exit(1);
  }
};

createSampleNotifications();
