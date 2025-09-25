// EventHive API Test Script
// This script tests all major API endpoints to ensure everything is working

const API_BASE = 'http://localhost:5000/api';

// Test data
const testUser = {
  firstName: 'Test',
  lastName: 'User',
  email: 'test.user@example.com',
  password: 'TestPass123',
  studentId: 'STU002',
  stream: 'B.TECH',
  year: 3,
  college: 'Test University',
  phone: '9876543210'
};

const testOrganization = {
  name: 'Test Tech Club',
  description: 'A test technology club for students interested in programming and technology',
  type: 'CLUB',
  category: 'TECHNICAL',
  officialEmail: 'tech.club@example.com',
  password: 'TestPass123',
  establishedYear: 2020,
  website: 'https://techclub.example.com'
};

const testEvent = {
  title: 'Test Workshop',
  description: 'A test workshop for learning',
  category: 'WORKSHOP',
  type: 'OFFLINE',
  startDateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  endDateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
  venue: {
    name: 'Test Hall',
    address: 'Test Campus',
    capacity: 100
  },
  registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
  maxParticipants: 50,
  eligibilityCriteria: {
    streams: ['B.TECH', 'M.TECH'],
    years: [1, 2, 3, 4],
    colleges: ['Test University']
  }
};

// Helper function to make API requests
async function apiRequest(endpoint, method = 'GET', data = null, token = null) {
  const url = `${API_BASE}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (token) {
    options.headers.Authorization = `Bearer ${token}`;
  }

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || `HTTP ${response.status}`);
    }
    
    return result;
  } catch (error) {
    console.error(`API Error [${method} ${endpoint}]:`, error.message);
    throw error;
  }
}

// Test functions
async function testHealthCheck() {
  console.log('\n🔍 Testing Health Check...');
  try {
    const response = await fetch('http://localhost:5000/health');
    const result = await response.json();
    console.log('✅ Health check passed:', result.message);
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}

async function testUserRegistration() {
  console.log('\n👤 Testing User Registration...');
  try {
    const result = await apiRequest('/auth/register/user', 'POST', testUser);
    console.log('✅ User registration successful');
    return result;
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('ℹ️ User already exists, skipping registration');
      return { success: true };
    }
    console.error('❌ User registration failed:', error.message);
    throw error;
  }
}

async function testUserLogin() {
  console.log('\n🔐 Testing User Login...');
  try {
    const result = await apiRequest('/auth/login', 'POST', {
      email: testUser.email,
      password: testUser.password,
      userType: 'USER'
    });
    console.log('✅ User login successful');
    return result.data.tokens.accessToken;
  } catch (error) {
    console.error('❌ User login failed:', error.message);
    throw error;
  }
}

async function testOrganizationRegistration() {
  console.log('\n🏢 Testing Organization Registration...');
  try {
    const result = await apiRequest('/auth/register/organization', 'POST', testOrganization);
    console.log('✅ Organization registration successful');
    return result;
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('ℹ️ Organization already exists, skipping registration');
      return { success: true };
    }
    console.error('❌ Organization registration failed:', error.message);
    throw error;
  }
}

async function testOrganizationLogin() {
  console.log('\n🔐 Testing Organization Login...');
  try {
    const result = await apiRequest('/auth/login', 'POST', {
      email: testOrganization.officialEmail,
      password: testOrganization.password,
      userType: 'ORGANIZATION'
    });
    console.log('✅ Organization login successful');
    return result.data.tokens.accessToken;
  } catch (error) {
    console.error('❌ Organization login failed:', error.message);
    throw error;
  }
}

async function testPublicEvents() {
  console.log('\n📅 Testing Public Events API...');
  try {
    const result = await apiRequest('/events');
    console.log(`✅ Public events fetched: ${result.data.events.length} events`);
    return result;
  } catch (error) {
    console.error('❌ Public events fetch failed:', error.message);
    throw error;
  }
}

async function testEventCategories() {
  console.log('\n📂 Testing Event Categories API...');
  try {
    const result = await apiRequest('/events/categories');
    console.log(`✅ Event categories fetched: ${result.data.categories.length} categories`);
    return result;
  } catch (error) {
    console.error('❌ Event categories fetch failed:', error.message);
    throw error;
  }
}

async function testUserDashboard(userToken) {
  console.log('\n📊 Testing User Dashboard...');
  try {
    const result = await apiRequest('/users/dashboard/stats', 'GET', null, userToken);
    console.log('✅ User dashboard stats fetched');
    return result;
  } catch (error) {
    console.error('❌ User dashboard failed:', error.message);
    throw error;
  }
}

async function testCreateEvent(orgToken) {
  console.log('\n➕ Testing Event Creation...');
  try {
    const result = await apiRequest('/organizations/events', 'POST', testEvent, orgToken);
    console.log('✅ Event creation successful');
    return result.data.event._id;
  } catch (error) {
    console.error('❌ Event creation failed:', error.message);
    throw error;
  }
}

async function testEventRegistration(userToken, eventId) {
  console.log('\n📝 Testing Event Registration...');
  try {
    const result = await apiRequest(`/users/events/${eventId}/register`, 'POST', {}, userToken);
    console.log('✅ Event registration successful');
    return result;
  } catch (error) {
    console.error('❌ Event registration failed:', error.message);
    throw error;
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting EventHive API Tests...\n');
  
  let userToken, orgToken, eventId;
  
  try {
    // Basic tests
    await testHealthCheck();
    await testUserRegistration();
    userToken = await testUserLogin();
    await testOrganizationRegistration();
    orgToken = await testOrganizationLogin();
    
    // Public API tests
    await testPublicEvents();
    await testEventCategories();
    
    // Authenticated tests
    await testUserDashboard(userToken);
    eventId = await testCreateEvent(orgToken);
    
    if (eventId) {
      await testEventRegistration(userToken, eventId);
    }
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Test Summary:');
    console.log('✅ Health Check');
    console.log('✅ User Registration & Login');
    console.log('✅ Organization Registration & Login');
    console.log('✅ Public Events API');
    console.log('✅ Event Categories API');
    console.log('✅ User Dashboard');
    console.log('✅ Event Creation');
    console.log('✅ Event Registration');
    
  } catch (error) {
    console.error('\n💥 Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  runAllTests();
}

module.exports = {
  runAllTests,
  testHealthCheck,
  testUserRegistration,
  testUserLogin,
  testOrganizationRegistration,
  testOrganizationLogin,
  testPublicEvents,
  testEventCategories,
  testUserDashboard,
  testCreateEvent,
  testEventRegistration
};
