import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh-token`,
            { refreshToken }
          );

          const { accessToken } = response.data.data.tokens;
          localStorage.setItem('accessToken', accessToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  // User registration
  registerUser: (userData) => api.post('/auth/register/user', userData),
  
  // Organization registration
  registerOrganization: (orgData) => api.post('/auth/register/organization', orgData),
  
  // Admin registration
  registerAdmin: (adminData) => api.post('/auth/register/admin', adminData),
  
  // Login
  login: (credentials) => api.post('/auth/login', credentials),
  
  // Verify OTP
  verifyOTP: (otpData) => api.post('/auth/verify-otp', otpData),
  
  // Forgot password
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  
  // Reset password
  resetPassword: (resetData) => api.post('/auth/reset-password', resetData),
  
  // Refresh token
  refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken }),
  
  // Logout
  logout: () => api.post('/auth/logout'),
};

// Events API
export const eventsAPI = {
  // Get all public events
  getPublicEvents: (params = {}) => api.get('/events', { params }),
  
  // Get single event
  getEventById: (id) => api.get(`/events/${id}`),
  
  // Get featured events
  getFeaturedEvents: (limit = 6) => api.get('/events/featured', { params: { limit } }),
  
  // Get upcoming events
  getUpcomingEvents: (limit = 10) => api.get('/events/upcoming', { params: { limit } }),
  
  // Get events by category
  getEventsByCategory: (category, limit = 10) => api.get(`/events/category/${category}`, { params: { limit } }),
  
  // Search events
  searchEvents: (params) => api.get('/events/search', { params }),
  
  // Get event categories
  getEventCategories: () => api.get('/events/categories'),
  
  // Get event statistics
  getEventStats: () => api.get('/events/stats'),
};

// User API
export const userAPI = {
  // Get dashboard stats
  getDashboardStats: () => api.get('/users/dashboard/stats'),
  
  // Get profile
  getProfile: () => api.get('/users/profile'),
  
  // Update profile
  updateProfile: (profileData) => api.put('/users/profile', profileData),
  
  // Get available events
  getAvailableEvents: (params = {}) => api.get('/users/events/available', { params }),
  
  // Register for event
  registerForEvent: (eventId, registrationData) => api.post(`/users/events/${eventId}/register`, registrationData),
  
  // Get registered events
  getRegisteredEvents: (params = {}) => api.get('/users/events/registered', { params }),
  
  // Cancel registration
  cancelRegistration: (eventId) => api.delete(`/users/events/${eventId}/register`),
  
  // Get notifications
  getNotifications: (params = {}) => api.get('/users/notifications', { params }),
  
  // Mark notification as read
  markNotificationRead: (notificationId) => api.put(`/users/notifications/${notificationId}/read`),
};

// Organization API
export const organizationAPI = {
  // Get dashboard stats
  getDashboardStats: () => api.get('/organizations/dashboard/stats'),
  
  // Get profile
  getProfile: () => api.get('/organizations/profile'),
  
  // Update profile
  updateProfile: (profileData) => api.put('/organizations/profile', profileData),
  
  // Get organization events
  getEvents: (params = {}) => api.get('/organizations/events', { params }),
  
  // Create event
  createEvent: (eventData) => api.post('/organizations/events', eventData),
  
  // Update event
  updateEvent: (eventId, eventData) => api.put(`/organizations/events/${eventId}`, eventData),
  
  // Delete event
  deleteEvent: (eventId) => api.delete(`/organizations/events/${eventId}`),
  
  // Get event participants
  getEventParticipants: (eventId, params = {}) => api.get(`/organizations/events/${eventId}/participants`, { params }),
  
  // Send notification to participants
  sendParticipantNotification: (eventId, notificationData) => api.post(`/organizations/events/${eventId}/notifications`, notificationData),
};

// Admin API
export const adminAPI = {
  // Get dashboard stats
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  
  // Get users
  getUsers: (params = {}) => api.get('/admin/users', { params }),
  
  // Update user status
  updateUserStatus: (userId, statusData) => api.put(`/admin/users/${userId}/status`, statusData),
  
  // Get organizations
  getOrganizations: (params = {}) => api.get('/admin/organizations', { params }),
  
  // Update organization approval
  updateOrganizationApproval: (orgId, approvalData) => api.put(`/admin/organizations/${orgId}/approval`, approvalData),

  // Update organization status
  updateOrganizationStatus: (orgId, statusData) => api.put(`/admin/organizations/${orgId}/status`, statusData),
  
  // Get events
  getEvents: (params = {}) => api.get('/admin/events', { params }),
  
  // Update event approval
  updateEventApproval: (eventId, approvalData) => api.put(`/admin/events/${eventId}/approval`, approvalData),

  // Update event status
  updateEventStatus: (eventId, statusData) => api.put(`/admin/events/${eventId}/status`, statusData),
  
  // Create admin
  createAdmin: (adminData) => api.post('/admin/admins', adminData),
};

// Notifications API
export const notificationsAPI = {
  // Get public notifications
  getPublicNotifications: (params = {}) => api.get('/notifications/public', { params }),

  // Get notifications
  getNotifications: (params = {}) => api.get('/notifications', { params }),

  // Mark as read
  markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
  
  // Mark all as read
  markAllAsRead: () => api.put('/notifications/read-all'),
  
  // Delete notification
  deleteNotification: (notificationId) => api.delete(`/notifications/${notificationId}`),
  
  // Send notification (Admin)
  sendNotification: (notificationData) => api.post('/notifications/send', notificationData),
  
  // Get notification stats (Admin)
  getNotificationStats: (timeframe = '30d') => api.get('/notifications/stats', { params: { timeframe } }),
};

// Tickets API
export const ticketsAPI = {
  // Create ticket
  createTicket: (ticketData) => api.post('/tickets', ticketData),
  
  // Get user tickets
  getUserTickets: (params = {}) => api.get('/tickets', { params }),
  
  // Get ticket by ID
  getTicketById: (ticketId) => api.get(`/tickets/${ticketId}`),
  
  // Add message to ticket
  addTicketMessage: (ticketId, messageData) => api.post(`/tickets/${ticketId}/messages`, messageData),
  
  // Get all tickets (Admin)
  getAllTickets: (params = {}) => api.get('/tickets/admin/all', { params }),
  
  // Update ticket (Admin)
  updateTicket: (ticketId, updateData) => api.put(`/tickets/${ticketId}`, updateData),
  
  // Get ticket stats (Admin)
  getTicketStats: (timeframe = '30d') => api.get('/tickets/admin/stats', { params: { timeframe } }),
};

// Utility functions
export const apiUtils = {
  // Handle API errors
  handleError: (error) => {
    if (error.response) {
      // Server responded with error status
      return {
        message: error.response.data.message || 'An error occurred',
        status: error.response.status,
        errors: error.response.data.errors || [],
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        message: 'Network error. Please check your connection.',
        status: 0,
        errors: [],
      };
    } else {
      // Something else happened
      return {
        message: error.message || 'An unexpected error occurred',
        status: 0,
        errors: [],
      };
    }
  },
  
  // Format API response
  formatResponse: (response) => {
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message,
    };
  },
};

// Organizations API
export const organizationsAPI = {
  // Get all active organizations
  getActiveOrganizations: (limit = 10) => api.get('/organizations', { params: { status: 'ACTIVE', limit } }),

  // Get organization by ID
  getOrganizationById: (id) => api.get(`/organizations/${id}`),

  // Get organization events
  getOrganizationEvents: (id, params = {}) => api.get(`/organizations/${id}/events`, { params }),

  // Get organization stats
  getOrganizationStats: (id) => api.get(`/organizations/${id}/stats`),
};

export default api;
