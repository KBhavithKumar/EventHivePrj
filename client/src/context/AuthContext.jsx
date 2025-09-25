import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI, apiUtils } from '../services/api';
import toast from 'react-hot-toast';

// Create context
const AuthContext = createContext();

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  userType: null,
  permissions: [],
};

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  SET_ERROR: 'SET_ERROR',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        userType: action.payload.user.userType,
        permissions: action.payload.user.permissions || [],
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        isLoading: false,
      };
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    default:
      return state;
  }
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('accessToken');
      const user = localStorage.getItem('user');

      if (token && user) {
        try {
          const userData = JSON.parse(user);
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: { user: userData },
          });
        } catch (error) {
          console.error('Error parsing user data:', error);
          logout();
        }
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

      const response = await authAPI.login(credentials);
      const { user, tokens } = response.data.data;

      // Store tokens and user data
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user },
      });

      toast.success('Login successful!');
      return { success: true, user };
    } catch (error) {
      const errorData = apiUtils.handleError(error);
      toast.error(errorData.message);
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      return { success: false, error: errorData };
    }
  };

  // Register function
  const register = async (userData, userType) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

      let response;
      switch (userType) {
        case 'USER':
          response = await authAPI.registerUser(userData);
          break;
        case 'ORGANIZATION':
          response = await authAPI.registerOrganization(userData);
          break;
        case 'ADMIN':
          response = await authAPI.registerAdmin(userData);
          break;
        default:
          throw new Error('Invalid user type');
      }

      toast.success('Registration successful! Please check your email for verification.');
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      return { success: true, data: response.data };
    } catch (error) {
      const errorData = apiUtils.handleError(error);
      toast.error(errorData.message);
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      return { success: false, error: errorData };
    }
  };

  // Verify OTP function
  const verifyOTP = async (otpData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

      const response = await authAPI.verifyOTP(otpData);
      const { user, tokens } = response.data.data;

      // Store tokens and user data
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user },
      });

      toast.success('Email verified successfully!');
      return { success: true, user };
    } catch (error) {
      const errorData = apiUtils.handleError(error);
      toast.error(errorData.message);
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      return { success: false, error: errorData };
    }
  };

  // Forgot password function
  const forgotPassword = async (email) => {
    try {
      await authAPI.forgotPassword(email);
      toast.success('Password reset link sent to your email!');
      return { success: true };
    } catch (error) {
      const errorData = apiUtils.handleError(error);
      toast.error(errorData.message);
      return { success: false, error: errorData };
    }
  };

  // Reset password function
  const resetPassword = async (resetData) => {
    try {
      await authAPI.resetPassword(resetData);
      toast.success('Password reset successful! Please login with your new password.');
      return { success: true };
    } catch (error) {
      const errorData = apiUtils.handleError(error);
      toast.error(errorData.message);
      return { success: false, error: errorData };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');

      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      toast.success('Logged out successfully!');
    }
  };

  // Update user function
  const updateUser = (userData) => {
    const updatedUser = { ...state.user, ...userData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    dispatch({
      type: AUTH_ACTIONS.UPDATE_USER,
      payload: userData,
    });
  };

  // Check if user has permission
  const hasPermission = (permission) => {
    if (!state.user || !state.permissions) return false;
    return state.permissions.includes(permission);
  };

  // Check if user has role
  const hasRole = (role) => {
    if (!state.user) return false;
    return state.userType === role;
  };

  // Check if user is admin
  const isAdmin = () => hasRole('ADMIN');

  // Check if user is organization
  const isOrganization = () => hasRole('ORGANIZATION');

  // Check if user is regular user
  const isUser = () => hasRole('USER');

  const value = {
    // State
    ...state,

    // Actions
    login,
    register,
    verifyOTP,
    forgotPassword,
    resetPassword,
    logout,
    updateUser,

    // Utility functions
    hasPermission,
    hasRole,
    isAdmin,
    isOrganization,
    isUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
