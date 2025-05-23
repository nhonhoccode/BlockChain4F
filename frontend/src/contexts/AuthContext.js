import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/api/authService';

// Create context
const AuthContext = createContext();

/**
 * AuthProvider Component - Provides authentication context to the app
 */
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userLoading, setUserLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        console.log('Checking authentication status...');
        setUserLoading(true);
        
        // Check if token and user data exist in localStorage
        const token = localStorage.getItem('token');
        const authUserStr = localStorage.getItem('authUser');
        
        if (token && authUserStr) {
          try {
            // Parse user data from localStorage
            const userData = JSON.parse(authUserStr);
            setCurrentUser(userData);
            setIsAuthenticated(true);
            console.log('User authenticated from localStorage:', userData.email);
            
            // Verify token with API in the background
            try {
              const result = await authService.verifyToken();
              if (result && !result.isValid) {
                console.warn('Token is invalid, logging out...');
                await logout();
              }
            } catch (verifyError) {
              // Xử lý lỗi nhẹ nhàng hơn - không đăng xuất người dùng nếu API không khả dụng
              console.error('Error verifying token:', verifyError);
              
              // Chỉ đăng xuất nếu lỗi không phải là 404 (endpoint không tồn tại)
              if (verifyError.response && verifyError.response.status !== 404) {
                console.warn('Token verification failed, logging out...');
                await logout();
              } else {
                console.log('Token verification endpoint not available, continuing with localStorage data');
              }
            }
          } catch (parseError) {
            console.error('Error parsing user data:', parseError);
            // Clear invalid data
            localStorage.removeItem('token');
            localStorage.removeItem('authUser');
            setIsAuthenticated(false);
            setCurrentUser(null);
          }
        } else {
          // No token or user data
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Authentication check error:', error);
        setError(error.message || 'Authentication check failed');
      } finally {
        setUserLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);
  
  /**
   * Login function
   * @param {Object} credentials - Login credentials
   * @returns {Promise} Login result with user data
   */
  const login = async (credentials) => {
    setError(null);
    try {
      const response = await authService.login(credentials);
      
      // Check if we have a token in the response, which indicates successful login
      if (!response.token) {
        throw new Error(response.message || 'Login failed: No authentication token received');
      }
      
      // Extract user data and token from response
      const { token, user_id, email, first_name, last_name, role } = response;
      
      // Create user object
      const userData = {
        id: user_id || response.user?.id,
        email: email || response.user?.email,
        name: `${first_name || response.user?.first_name || ''} ${last_name || response.user?.last_name || ''}`.trim(),
        role: role || response.user?.role || credentials.role || 'citizen',
        token
      };
      
      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('authUser', JSON.stringify(userData));
      
      // Update state
      setCurrentUser(userData);
      setIsAuthenticated(true);
      
      console.log('Login successful:', userData.email);
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed');
      throw error;
    }
  };
  
  /**
   * Logout function
   */
  const logout = async () => {
    try {
      // Call logout API
      await authService.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Always clear local storage and state regardless of API success
      localStorage.removeItem('token');
      localStorage.removeItem('authUser');
      setCurrentUser(null);
      setIsAuthenticated(false);
    }
  };
  
  /**
   * Register function
   * @param {Object} userData - Registration data
   * @returns {Promise} Registration result
   */
  const register = async (userData) => {
    setError(null);
    try {
      const response = await authService.register(userData);
      
      // Check for successful registration (response should contain user_id or user object)
      if (!response.user_id && !response.user) {
        throw new Error(response.message || 'Registration failed: No user data received');
      }
      
      console.log('Registration successful. Please login.');
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Registration failed');
      throw error;
    }
  };
  
  /**
   * Check if user has a specific role
   * @param {string} role - Role to check
   * @returns {boolean} Whether user has the role
   */
  const hasRole = (role) => {
    if (!currentUser) return false;
    
    // Chairman can access everything
    if (currentUser.role === 'chairman') return true;
    
    return currentUser.role === role;
  };
  
  // Context value
  const contextValue = {
    currentUser,
    isAuthenticated,
    userLoading,
    error,
    login,
    logout,
    register,
    hasRole
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth hook - Custom hook to use auth context
 * @returns {Object} Auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
