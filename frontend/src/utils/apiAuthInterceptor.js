/**
 * API Authentication Interceptor
 * Custom utilities for handling API authentication
 */
import axios from 'axios';
import { handleUnauthorizedError, createHardcodedToken } from './tokenRefresher';

// Create a custom instance for authenticated requests
const authAxios = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Debug function to check token
const checkAuthToken = () => {
  try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    console.log('Auth token check:', token ? `${token.substring(0, 15)}...` : 'null');
    return !!token;
  } catch (error) {
    console.error('Error checking auth token:', error);
    return false;
  }
};

// Function to get the token from localStorage or create a test token if needed
const getAuthToken = () => {
  try {
    // Kiểm tra xem đang ở môi trường development
    const isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost';
    
    // Ưu tiên lấy token từ sessionStorage trước, sau đó đến localStorage
    let token = sessionStorage.getItem('token') || localStorage.getItem('token');
    
    // Nếu tìm thấy token, ghi log nguồn gốc để debug
    if (token) {
      const source = sessionStorage.getItem('token') ? 'sessionStorage' : 'localStorage';
      console.log(`Using token from ${source}: ${token.substring(0, 10)}...`);
      
      // Đồng bộ token giữa localStorage và sessionStorage
      localStorage.setItem('token', token);
      sessionStorage.setItem('token', token);
    } else {
      console.warn('No token found in either localStorage or sessionStorage');
      
      // Chỉ tạo token mặc định trong môi trường development
      if (isDevelopment) {
        console.warn('Creating test token for development environment');
        token = createHardcodedToken();
        
        // Lưu token mặc định vào cả hai storage
        localStorage.setItem('token', token);
        sessionStorage.setItem('token', token);
      }
    }
    
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    
    // Kiểm tra xem đang ở môi trường development
    const isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost';
    
    // Chỉ tạo token mặc định trong môi trường development
    if (isDevelopment) {
      const testToken = createHardcodedToken();
      console.warn('Returning test token due to error:', testToken.substring(0, 10) + '...');
      return testToken;
    }
    
    return null;
  }
};

// Custom request headers for debug and version tracking
const getDebugHeaders = () => {
  return {
    'X-Debug-Token': 'true',
    'X-Client-Version': '1.0.0',
    'X-Client-Timestamp': new Date().toISOString()
  };
};

// Request interceptor to add auth token
authAxios.interceptors.request.use(
  config => {
    try {
      // Get token using our helper function
      const token = getAuthToken();
      
      // Add token to headers
      if (token) {
        config.headers.Authorization = `Token ${token}`;
        console.log(`Adding Authorization header to ${config.url}: Token ${token.substring(0, 15)}...`);
      } else {
        console.warn('No token available for request to:', config.url);
        
        // Kiểm tra nếu là URL bảo mật và không có token, ghi log chi tiết
        if (!config.url.includes('/auth/')) {
          console.error('No token for secure endpoint:', {
            url: config.url,
            localStorage: !!localStorage.getItem('token'),
            sessionStorage: !!sessionStorage.getItem('token'),
            authUser: !!localStorage.getItem('authUser')
          });
        }
      }
      
      // Add debug headers
      Object.assign(config.headers, getDebugHeaders());
      
      return config;
    } catch (err) {
      console.error('Error in request interceptor:', err);
      return config;
    }
  },
  error => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for debugging and token refresh handling
authAxios.interceptors.response.use(
  response => {
    console.log(`Response from ${response.config.url}:`, response.status);
    return response;
  },
  async error => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      console.warn(`401 Unauthorized error from ${error.config.url}`);
      
      // Skip token refresh for auth endpoints to avoid infinite loops
      const isAuthEndpoint = error.config.url.includes('/auth/');
      
      if (!isAuthEndpoint) {
        // Try to refresh token and retry the request using our centralized handler
        try {
          return await handleUnauthorizedError(
            error.config, 
            newConfig => authAxios(newConfig)
          );
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          
          // Đảm bảo xóa token nếu không thể refresh
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('authUser');
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('refreshToken');
          
          // Chuyển hướng người dùng về trang đăng nhập sau khi xóa token
          if (typeof window !== 'undefined') {
            console.log('Redirecting to login page after token refresh failure');
            window.location.href = '/auth/login?session=expired';
          }
        }
      } else {
        console.warn('Skipping token refresh for auth endpoint to avoid loop');
      }
    }
    
    // Log detailed error information
    if (error.response) {
      console.error(`Error ${error.response.status} from ${error.config.url}:`, error.response.data);
    } else if (error.request) {
      console.error('Request error, no response received:', error.message);
    } else {
      console.error('Request error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Direct API request functions with built-in authentication
export const authGet = async (url, params = {}) => {
  try {
    console.log(`Making authenticated GET request to ${url}`);
    const token = getAuthToken();
    
    // Kiểm tra xem đang ở môi trường development
    const isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost';
    
    // Kiểm tra nếu không có token
    if (!token && !url.includes('/auth/')) {
      console.error(`No token available for GET request to protected endpoint: ${url}`);
      throw new Error('No authentication token available');
    }
    
    // Add debug header for API troubleshooting
    const headers = token ? {
      Authorization: `Token ${token}`,
      ...getDebugHeaders()
    } : getDebugHeaders();
    
    const response = await authAxios.get(url, { 
      params,
      headers
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error in authGet to ${url}:`, error.message);
    
    // Kiểm tra xem đang ở môi trường development
    const isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost';
    
    // In development, fallback data for certain endpoints
    if (isDevelopment && url.includes('/dashboard/')) {
      console.warn('Returning mock data for GET request in development');
      return { message: 'Development mode mock data' };
    }
    
    throw error;
  }
};

export const authPost = async (url, data = {}) => {
  try {
    console.log(`Making authenticated POST request to ${url}`);
    const token = getAuthToken();
    
    // Kiểm tra xem đang ở môi trường development
    const isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost';
    
    // Kiểm tra nếu không có token và không phải là endpoint auth
    if (!token && !url.includes('/auth/')) {
      console.error(`No token available for POST request to protected endpoint: ${url}`);
      throw new Error('No authentication token available');
    }
    
    // Add debug header for API troubleshooting
    const headers = token ? {
      Authorization: `Token ${token}`,
      ...getDebugHeaders()
    } : getDebugHeaders();
    
    const response = await authAxios.post(url, data, {
      headers
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error in authPost to ${url}:`, error.message);
    
    // Check if it's a 401 error and trigger token cleanup
    if (error.response && error.response.status === 401) {
      console.error('401 error detected in authPost, clearing tokens');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('authUser');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('refreshToken');
    }
    
    throw error;
  }
};

export { authAxios };

export default {
  authAxios,
  authGet,
  authPost,
  checkAuthToken,
  getAuthToken,
  createHardcodedToken
}; 