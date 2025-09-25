import mongoose from 'mongoose';
import { config } from 'dotenv';
import Event from './models/Event.js';
import Organization from './models/Organization.js';

config();

const createSampleEvents = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eventhive');
    console.log('Connected to MongoDB');

    // Get the test organization
    const organization = await Organization.findOne({ officialEmail: 'org@gmail.com' });
    if (!organization) {
      console.log('❌ Test organization not found. Please run create-test-users.js first.');
      return;
    }

    // Clear existing events
    await Event.deleteMany({});
    console.log('Cleared existing events');

    // Sample events data
    const sampleEvents = [
      {
        title: 'Tech Innovation Summit 2024',
        description: 'Join us for an exciting summit featuring the latest innovations in technology, AI, and software development. Network with industry leaders and discover cutting-edge solutions.',
        category: 'TECHNICAL',
        type: 'OFFLINE',
        startDateTime: new Date('2024-12-15T09:00:00Z'),
        endDateTime: new Date('2024-12-15T17:00:00Z'),
        registrationStartDate: new Date('2024-11-01T00:00:00Z'),
        registrationEndDate: new Date('2024-12-10T23:59:59Z'),
        maxParticipants: 200,
        status: 'PUBLISHED',
        organizer: organization._id,
        tags: ['technology', 'innovation', 'AI', 'networking'],
        contactInfo: {
          primaryContact: {
            name: 'Event Coordinator',
            email: 'coordinator@testorg.com',
            mobile: '9876543210'
          }
        },
        venue: {
          name: 'Main Auditorium',
          address: 'Tech Building, University Campus',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001'
        },
        fees: {
          participationFee: 0,
          currency: 'INR'
        }
      },
      {
        title: 'Cultural Night - Diwali Celebration',
        description: 'Celebrate the festival of lights with traditional performances, delicious food, and cultural activities. Experience the rich heritage and traditions.',
        category: 'CULTURAL',
        type: 'OFFLINE',
        startDateTime: new Date('2024-11-12T18:00:00Z'),
        endDateTime: new Date('2024-11-12T22:00:00Z'),
        registrationStartDate: new Date('2024-10-15T00:00:00Z'),
        registrationEndDate: new Date('2024-11-10T23:59:59Z'),
        maxParticipants: 500,
        status: 'PUBLISHED',
        organizer: organization._id,
        tags: ['cultural', 'festival', 'diwali', 'celebration'],
        contactInfo: {
          primaryContact: {
            name: 'Cultural Committee',
            email: 'cultural@testorg.com',
            mobile: '9876543211'
          }
        },
        venue: {
          name: 'University Grounds',
          address: 'Main Campus',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001'
        },
        fees: {
          participationFee: 50,
          currency: 'INR'
        }
      },
      {
        title: 'Web Development Workshop',
        description: 'Learn modern web development with React, Node.js, and MongoDB. Hands-on workshop with real projects and expert guidance.',
        category: 'WORKSHOP',
        type: 'HYBRID',
        startDateTime: new Date('2024-11-20T10:00:00Z'),
        endDateTime: new Date('2024-11-22T16:00:00Z'),
        registrationStartDate: new Date('2024-10-20T00:00:00Z'),
        registrationEndDate: new Date('2024-11-18T23:59:59Z'),
        maxParticipants: 50,
        status: 'PUBLISHED',
        organizer: organization._id,
        tags: ['workshop', 'web development', 'react', 'nodejs'],
        contactInfo: {
          primaryContact: {
            name: 'Tech Team',
            email: 'tech@testorg.com',
            mobile: '9876543212'
          }
        },
        venue: {
          name: 'Computer Lab 1 & Online',
          address: 'CS Building',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001'
        },
        fees: {
          participationFee: 100,
          currency: 'INR'
        }
      }
    ];

    // Create events
    const createdEvents = await Event.insertMany(sampleEvents);

    console.log('\n✅ Sample events created successfully!');
    console.log(`📅 Created ${createdEvents.length} events:`);
    
    createdEvents.forEach((event, index) => {
      console.log(`${index + 1}. ${event.title} (${event.category}) - ${event.status}`);
    });

    console.log('\n🎉 Events are now available on the Browse Events page!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating sample events:', error);
    process.exit(1);
  }
};

createSampleEvents();
