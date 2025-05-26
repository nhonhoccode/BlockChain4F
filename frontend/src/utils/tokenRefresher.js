/**
 * Token Refresher Utility
 * Provides a mechanism to refresh authentication tokens and maintain session continuity
 */
import authService from '../services/api/authService';

// Flag to track if a refresh is already in progress
let isRefreshing = false;
// Queue of callbacks to execute after token refresh
let refreshSubscribers = [];

/**
 * Subscribe to token refresh
 * @param {Function} callback - Function to call after token refresh
 */
const subscribeToTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

/**
 * Execute all pending callbacks after token refresh
 * @param {string} token - The new token
 */
const onTokenRefreshed = (token) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

/**
 * Synchronize token between localStorage and sessionStorage
 * Ensures token is present in both storage locations
 */
const synchronizeTokens = () => {
  try {
    const lsToken = localStorage.getItem('token');
    const ssToken = sessionStorage.getItem('token');
    
    if (lsToken || ssToken) {
      const token = lsToken || ssToken;
      localStorage.setItem('token', token);
      sessionStorage.setItem('token', token);
      console.log('Tokens synchronized between storages');
      return token;
    }
    return null;
  } catch (error) {
    console.error('Error synchronizing tokens:', error);
    return null;
  }
};

/**
 * Clear all auth tokens from storage
 */
const clearAllTokens = () => {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('authUser');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('refreshToken');
    console.log('All tokens cleared from storage');
  } catch (error) {
    console.error('Error clearing tokens:', error);
  }
};

/**
 * Refresh the authentication token
 * @returns {Promise<string>} The new token
 */
const refreshToken = async () => {
  try {
    // Prevent multiple refresh calls
    if (isRefreshing) {
      console.log('Token refresh already in progress, subscribing to result');
      return new Promise(resolve => {
        subscribeToTokenRefresh(token => {
          resolve(token);
        });
      });
    }

    isRefreshing = true;
    console.log('Refreshing authentication token...');

    // Synchronize tokens before attempting refresh
    synchronizeTokens();

    // Kiểm tra token hiện tại
    const currentToken = localStorage.getItem('token');
    if (!currentToken) {
      console.warn('No current token found when attempting to refresh');
    }

    // Try refreshing the token through the auth service
    const newToken = await authService.refreshToken();
    
    // If successful, notify subscribers and return the new token
    if (newToken) {
      console.log('Token refreshed successfully');
      
      // Lưu token vào cả localStorage và sessionStorage để đảm bảo nhất quán
      localStorage.setItem('token', newToken);
      sessionStorage.setItem('token', newToken);
      
      onTokenRefreshed(newToken);
      return newToken;
    }
    
    throw new Error('Failed to refresh token');
  } catch (error) {
    console.error('Token refresh failed:', error);
    // On failure, clear all subscriptions
    refreshSubscribers = [];
    
    // Check for critical errors that should clear tokens
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.warn('Authentication error during token refresh, clearing all tokens');
      clearAllTokens();
      throw error;
    }
    
    // Kiểm tra xem còn token hiện tại không
    const currentToken = synchronizeTokens();
    if (currentToken) {
      console.log('Using existing token as fallback after refresh failure');
      return currentToken;
    }
    
    throw error;
  } finally {
    isRefreshing = false;
  }
};

/**
 * Create a hardcoded token (for testing/development)
 * @returns {string} A hardcoded token
 */
const createHardcodedToken = () => {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3QgVXNlciIsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
  localStorage.setItem('token', token);
  sessionStorage.setItem('token', token);
  console.log('Created hardcoded token for testing');
  return token;
};

/**
 * Handle unauthorized (401) error response
 * @param {Object} config - Original request config
 * @param {Function} retry - Function to retry the request with new token
 * @returns {Promise<Object>} The result of the retried request
 */
const handleUnauthorizedError = async (config, retry) => {
  try {
    // Try to refresh the token
    const newToken = await refreshToken();
    
    // Update the config with the new token
    if (config && newToken) {
      if (!config.headers) {
        config.headers = {};
      }
      config.headers.Authorization = `Bearer ${newToken}`;
    }
    
    // Retry the original request
    return retry(config);
  } catch (refreshError) {
    console.error('Failed to handle unauthorized error:', refreshError);
    
    // Clear all tokens on auth failure
    clearAllTokens();
    
    // If refresh fails, try a hardcoded token for development
    if (process.env.NODE_ENV === 'development') {
      const hardcodedToken = createHardcodedToken();
      
      if (config) {
        if (!config.headers) {
          config.headers = {};
        }
        config.headers.Authorization = `Bearer ${hardcodedToken}`;
      }
      
      // Retry with hardcoded token
      return retry(config);
    }
    
    // Redirect to login after token refresh failure
    if (typeof window !== 'undefined') {
      console.log('Redirecting to login page after token refresh failure');
      window.location.href = '/auth/login?session=expired';
    }
    
    throw refreshError;
  }
};

export {
  refreshToken,
  subscribeToTokenRefresh,
  handleUnauthorizedError,
  createHardcodedToken,
  synchronizeTokens,
  clearAllTokens
}; 