import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS as REAL_API_ENDPOINTS } from './apiConfig';

// Base URL cho tất cả các API calls
export const API_URL = API_BASE_URL;

// Config to control mock data fallback behavior
export const API_CONFIG = {
  // When true, will use mock data if API fails with 404/500
  useMockDataFallback: false,
  // When true, will log detailed API requests/responses for debugging
  enableDetailedLogs: true,
  // When true, will show a warning in console when mock data is used
  showMockDataWarnings: true
};

// API Endpoints - Use endpoints from apiConfig.js
export const API_ENDPOINTS = REAL_API_ENDPOINTS;

// Utility function to handle mock data warnings
const logMockDataWarning = (endpoint) => {
  if (API_CONFIG.showMockDataWarnings) {
    console.warn(`🔶 MOCK DATA: Using mock data for endpoint ${endpoint}. Backend API server is not responding.`);
    console.warn('🔶 To connect to the real backend, make sure your API server is running at ' + API_BASE_URL);
  }
};

// Utility function for detailed request logging
const logRequest = (method, url, data = null) => {
  if (API_CONFIG.enableDetailedLogs) {
    console.log(`🌐 API Request: ${method.toUpperCase()} ${url}`);
    if (data) {
      console.log('📦 Request Data:', data);
    }
  }
};

// Utility function for detailed response logging
const logResponse = (response) => {
  if (API_CONFIG.enableDetailedLogs) {
    console.log(`✅ API Response (${response.status}):`, response.data);
  }
  return response;
};

// Utility function for detailed error logging
const logError = (error, url) => {
  if (API_CONFIG.enableDetailedLogs) {
    if (error.response) {
      console.error(`❌ API Error (${error.response.status}) for ${url}:`, error.response.data);
    } else if (error.request) {
      console.error(`❌ API Request Error for ${url}: No response received`);
    } else {
      console.error(`❌ API Setup Error for ${url}:`, error.message);
    }
  } else {
    console.error('API Error:', error.response || error);
  }
  return error;
};

// Tạo axios instance với các cấu hình mặc định
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Thêm interceptor để tự động thêm token vào header khi cần
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Django REST framework expects: "Authorization: Token <token>"
      // Remove any existing prefix to avoid duplication
      const tokenValue = token.replace(/^(Bearer |Token )/, '');
      
      // Use Token prefix for Django REST framework
      config.headers.Authorization = `Token ${tokenValue}`;
      
      console.log(`[API] Using token for request: ${config.url}`);
    }
    
    // Log detailed request info if enabled
    logRequest(config.method, config.url, config.data);
    
    return config;
  },
  (error) => {
    logError(error, 'REQUEST_ERROR');
    return Promise.reject(error);
  }
);

// Interceptor để xử lý các lỗi HTTP chung
api.interceptors.response.use(
  (response) => {
    // Log detailed response if enabled
    logResponse(response);
    return response;
  },
  (error) => {
    // Enhanced error logging
    logError(error, error.config?.url || 'UNKNOWN_ENDPOINT');
    
    // Specific handling for token/verify 404 errors - don't treat as fatal
    if (error.response && error.response.status === 404 && 
        error.config && error.config.url && 
        error.config.url.includes('/token/verify')) {
      console.warn('Token verification endpoint not found (404). This is expected if the endpoint is not implemented yet.');
      return Promise.reject(error);
    }
    
    // Special handling for logout 401s - this can happen if token is already invalid
    if (error.response && error.response.status === 401 && 
        error.config && error.config.url && 
        error.config.url.includes('/logout')) {
      console.warn('401 on logout endpoint - this is expected if token is already invalid');
      // Return success for the client side since we're logging out anyway
      return Promise.resolve({ data: { success: true, message: 'Logged out successfully' }});
    }
    
    // Xử lý lỗi đăng nhập (401)
    if (error.response && error.response.status === 401) {
      // Don't automatically redirect to login when token verification fails
      if (error.config && error.config.url && error.config.url.includes('/token/verify/')) {
        console.warn('⚠️ Token verification failed. Not redirecting to login automatically.');
        return Promise.reject(error);
      }
      
      // Chỉ clear localStorage nếu token không hợp lệ và có token trong localStorage
      if (localStorage.getItem('token')) {
        console.warn('⚠️ Authentication token invalid or expired. Logging out...');
        localStorage.removeItem('token');
        localStorage.removeItem('authUser');
        
        // Chuyển hướng đến trang đăng nhập - chỉ khi người dùng đã đăng nhập trước đó và không phải đang ở trang login
        if (!window.location.pathname.includes('/auth/login')) {
          console.log('Redirecting to login page due to 401 error');
          window.location.href = '/auth/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

/**
 * Kiểm tra xem có nên sử dụng mock data không dựa trên lỗi
 * @param {Error} error - Đối tượng lỗi
 * @returns {boolean} - True nếu nên sử dụng mock data
 */
export const shouldUseMockData = (error) => {
  // Always return false to prevent using mock data
  return false;
};

/**
 * GET request helper
 * @param {string} url - URL endpoint
 * @param {Object} params - Query parameters
 * @param {Object} config - Additional config
 * @returns {Promise} - Promise with response data
 */
export const get = async (url, params = {}, config = {}) => {
  try {
    const response = await api.get(url, { ...config, params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * POST request helper
 * @param {string} url - URL endpoint
 * @param {Object} data - Data to post
 * @param {Object} config - Additional config
 * @returns {Promise} - Promise with response data
 */
export const post = async (url, data = {}, config = {}) => {
  try {
    const response = await api.post(url, data, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * PUT request helper
 * @param {string} url - URL endpoint
 * @param {Object} data - Data to update
 * @param {Object} config - Additional config
 * @returns {Promise} - Promise with response data
 */
export const put = async (url, data = {}, config = {}) => {
  try {
    const response = await api.put(url, data, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * DELETE request helper
 * @param {string} url - URL endpoint
 * @param {Object} config - Additional config
 * @returns {Promise} - Promise with response data
 */
export const del = async (url, config = {}) => {
  try {
    const response = await api.delete(url, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Export functions for mock data handling
export const mockDataUtils = {
  logMockDataWarning,
  shouldUseMockData
};

// Tạo đối tượng để export mặc định
const apiService = {
  api,
  get,
  post,
  put,
  delete: del,
  API_ENDPOINTS,
  API_CONFIG,
  mockDataUtils
};

export default apiService; 