import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [], requireAuth = true }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // If user is authenticated but doesn't have required role
  if (requireAuth && isAuthenticated && allowedRoles.length > 0) {
    const userRole = user?.userType || user?.role;
    if (!allowedRoles.includes(userRole)) {
      // Redirect to appropriate dashboard based on user role
      switch (userRole) {
        case 'ADMIN':
          return <Navigate to="/admin/dashboard" replace />;
        case 'ORGANIZATION':
          return <Navigate to="/organisation/dashboard" replace />;
        case 'USER':
          return <Navigate to="/users/dashboard" replace />;
        default:
          return <Navigate to="/" replace />;
      }
    }
  }

  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (isAuthenticated && (location.pathname === '/signin' || location.pathname === '/signup')) {
    const userRole = user?.userType || user?.role;
    switch (userRole) {
      case 'ADMIN':
        return <Navigate to="/admin/dashboard" replace />;
      case 'ORGANIZATION':
        return <Navigate to="/organisation/dashboard" replace />;
      case 'USER':
        return <Navigate to="/users/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
