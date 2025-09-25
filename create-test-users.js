import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';
import User from './models/User.js';
import Admin from './models/Admin.js';
import Organization from './models/Organization.js';

config();

const createTestUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eventhive');
    console.log('Connected to MongoDB');

    // Clear existing test users
    await User.deleteMany({ email: { $regex: /test.*@gmail\.com/ } });
    await Admin.deleteMany({ email: { $regex: /admin.*@gmail\.com/ } });
    await Organization.deleteMany({ officialEmail: { $regex: /org.*@gmail\.com/ } });

    console.log('Cleared existing test users');

    // Create test users
    const testUsers = [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'testuser@gmail.com',
        password: 'TestPass123',
        studentId: 'STU001',
        stream: 'B.TECH',
        year: 2,
        college: 'Test University',
        phone: '1234567890',
        isEmailVerified: true,
        accountStatus: 'ACTIVE'
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'testuser2@gmail.com',
        password: 'TestPass123',
        studentId: 'STU002',
        stream: 'M.TECH',
        year: 1,
        college: 'Test University',
        phone: '1234567891',
        isEmailVerified: true,
        accountStatus: 'ACTIVE'
      }
    ];

    // Create test admin
    const testAdmin = {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@gmail.com',
      password: 'AdminPass123',
      phone: '9876543210',
      role: 'SUPER_ADMIN',
      permissions: ['ALL'],
      isEmailVerified: true,
      accountStatus: 'ACTIVE'
    };

    // Create test organization
    const testOrganization = {
      name: 'Test Organization',
      officialEmail: 'org@gmail.com',
      password: 'OrgPass123',
      contactEmail: 'contact@testorg.com',
      phone: '9876543211',
      address: '123 Test Street, Test City',
      website: 'https://testorg.com',
      description: 'A test organization for EventHive',
      category: 'TECHNICAL',
      establishedYear: 2020,
      isEmailVerified: true,
      accountStatus: 'APPROVED'
    };

    // Hash passwords
    const saltRounds = 12;
    for (let user of testUsers) {
      user.password = await bcrypt.hash(user.password, saltRounds);
    }
    testAdmin.password = await bcrypt.hash(testAdmin.password, saltRounds);
    testOrganization.password = await bcrypt.hash(testOrganization.password, saltRounds);

    // Create users
    const createdUsers = await User.insertMany(testUsers);
    const createdAdmin = await Admin.create(testAdmin);
    const createdOrg = await Organization.create(testOrganization);

    console.log('\n✅ Test users created successfully!');
    console.log('\n📋 TEST CREDENTIALS:');
    console.log('==========================================');
    
    console.log('\n👤 USER ACCOUNTS:');
    console.log('Email: testuser@gmail.com');
    console.log('Password: TestPass123');
    console.log('Type: USER');
    console.log('---');
    console.log('Email: testuser2@gmail.com');
    console.log('Password: TestPass123');
    console.log('Type: USER');
    
    console.log('\n👨‍💼 ADMIN ACCOUNT:');
    console.log('Email: admin@gmail.com');
    console.log('Password: AdminPass123');
    console.log('Type: ADMIN');
    
    console.log('\n🏢 ORGANIZATION ACCOUNT:');
    console.log('Email: org@gmail.com');
    console.log('Password: OrgPass123');
    console.log('Type: ORGANIZATION');
    
    console.log('\n==========================================');
    console.log('All accounts are verified and active!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating test users:', error);
    process.exit(1);
  }
};

createTestUsers();
