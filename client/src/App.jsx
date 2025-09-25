import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Import pages
import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import HelpCenterPage from './pages/public/HelpCenterPage';
import DisclaimerPage from './pages/public/DisclaimerPage';
import TermsPage from './pages/public/TermsPage';
import PrivacyPage from './pages/public/PrivacyPage';
import EventsPage from './pages/public/EventsPage';
import NotificationsPage from './pages/public/NotificationsPage';
import SignInPage from './pages/auth/SignInPage';
import SignUpPage from './pages/auth/SignUpPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';

// Dashboard imports
import UserDashboard from './pages/user/UserDashboard';
import OrganizationDashboard from './pages/organization/OrganizationDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

// Admin pages
import AdminOrganizationsPage from './pages/admin/OrganizationsPage';
import AdminEventsPage from './pages/admin/EventsPage';
import AdminUsersPage from './pages/admin/UsersPage';

// Organization pages
import OrganizationEventsPage from './pages/organization/EventsPage';

// Import context providers
import { AuthProvider } from './context/AuthContext';

// Import auth components
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/help" element={<HelpCenterPage />} />
            <Route path="/disclaimer" element={<DisclaimerPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />

            {/* Auth Routes */}
            <Route path="/signin" element={
              <ProtectedRoute requireAuth={false}>
                <SignInPage />
              </ProtectedRoute>
            } />
            <Route path="/signup" element={
              <ProtectedRoute requireAuth={false}>
                <SignUpPage />
              </ProtectedRoute>
            } />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Dashboard Routes */}
            <Route path="/users/dashboard" element={
              <ProtectedRoute allowedRoles={['USER']}>
                <UserDashboard />
              </ProtectedRoute>
            } />
            <Route path="/organisation/dashboard" element={
              <ProtectedRoute allowedRoles={['ORGANIZATION']}>
                <OrganizationDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin/organizations" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminOrganizationsPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/events" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminEventsPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminUsersPage />
              </ProtectedRoute>
            } />

            {/* Organization Routes */}
            <Route path="/organisation/events" element={
              <ProtectedRoute allowedRoles={['ORGANIZATION']}>
                <OrganizationEventsPage />
              </ProtectedRoute>
            } />
          </Routes>

          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                theme: {
                  primary: 'green',
                  secondary: 'black',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
