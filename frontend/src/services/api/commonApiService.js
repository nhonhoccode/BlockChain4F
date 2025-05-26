import axios from 'axios';
import { getToken } from '../../utils/auth';

// Function to get auth token with enhanced error handling
const getAuthToken = () => {
  try {
    // First try using the utility function
    const token = getToken();
    if (token) return token;
    
    // If that fails, try direct localStorage access
    const localToken = localStorage.getItem('token');
    if (localToken) return localToken;
    
    // If no token is available, log and return null
    console.warn('No authentication token available');
    return null;
  } catch (error) {
    console.error('Error retrieving auth token:', error);
    
    // Last resort: try direct localStorage access
    try {
      return localStorage.getItem('token');
    } catch (e) {
      console.error('Final attempt to get token failed:', e);
      return null;
    }
  }
};

// Create API client
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  config => {
    console.log('API Request:', config.url);
    
    const token = getAuthToken();
    console.log('Token available:', !!token);
    
    if (token) {
      config.headers.Authorization = `Token ${token}`;
      console.log('Authorization header set successfully');
    } else {
      console.warn('No authentication token available for request:', config.url);
    }
    
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  response => response,
  async error => {
    console.error('API Error:', error.message);
    console.log('Error response status:', error.response?.status);
    
    // Handle 401 Unauthorized error (expired token)
    if (error.response && error.response.status === 401) {
      console.log('Received 401 Unauthorized response from:', error.config.url);
      
      // Get the original request
      const originalRequest = error.config;
      
      // Check if we already tried to refresh the token for this request
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          console.log('Attempting to refresh token...');
          
          // Try to get refresh token
          const refreshToken = localStorage.getItem('refreshToken');
          
          if (refreshToken) {
            console.log('Refresh token found, attempting to get new access token');
            
            // Call token refresh endpoint directly (not using apiClient to avoid loop)
            const refreshResponse = await axios.post(
              `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/v1/auth/token/refresh/`,
              { refresh: refreshToken },
              {
                headers: {
                  'Content-Type': 'application/json'
                }
              }
            );
            
            if (refreshResponse.data && (refreshResponse.data.access || refreshResponse.data.token)) {
              // Extract the new token
              const newToken = refreshResponse.data.access || refreshResponse.data.token;
              
              // Store the new token
              localStorage.setItem('token', newToken);
              console.log('New token received and stored');
              
              // Also store new refresh token if provided
              if (refreshResponse.data.refresh) {
                localStorage.setItem('refreshToken', refreshResponse.data.refresh);
                console.log('New refresh token stored');
              }
              
              // Update Authorization header in the original request
              originalRequest.headers.Authorization = `Token ${newToken}`;
              console.log('Retrying original request with new token');
              
              // Retry the original request with the new token
              return apiClient(originalRequest);
            } else {
              console.warn('Token refresh response missing access token');
            }
          } else {
            console.warn('No refresh token available');
          }
          
          // If we reach here, token refresh failed or was not attempted
          console.log('Token refresh failed or not attempted, redirecting to login page');
          
          // Clean up tokens
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          
          // Redirect to login page
          if (typeof window !== 'undefined') {
            // Add a small delay to allow logging to complete
            setTimeout(() => {
              window.location.href = '/auth/login?session=expired';
            }, 100);
          }
        } catch (refreshError) {
          console.error('Error refreshing token:', refreshError.message);
          
          // Clean up tokens
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          
          // Redirect to login page
          if (typeof window !== 'undefined') {
            // Add a small delay to allow logging to complete
            setTimeout(() => {
              window.location.href = '/auth/login?session=expired';
            }, 100);
          }
        }
      } else {
        console.log('Already attempted to refresh token for this request');
      }
    }
    
    return Promise.reject(error);
  }
);

// Helper function to manually refresh token
const refreshTokenManually = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    console.log('Manually refreshing token');
    
    // Use direct axios call to avoid interceptors
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/v1/auth/token/refresh/`,
      { refresh: refreshToken },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.data && (response.data.access || response.data.token)) {
      // Extract the new token
      const newToken = response.data.access || response.data.token;
      
      // Store the new token
      localStorage.setItem('token', newToken);
      console.log('Manual token refresh successful');
      
      // Also store new refresh token if provided
      if (response.data.refresh) {
        localStorage.setItem('refreshToken', response.data.refresh);
      }
      
      return newToken;
    } else {
      throw new Error('Token refresh response missing access token');
    }
  } catch (error) {
    console.error('Manual token refresh failed:', error.message);
    throw error;
  }
};

// Helper function to manually authenticate requests
const authenticateRequest = async (endpoint, method = 'GET', data = null) => {
  try {
    // Get current token
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('No authentication token available');
    }
    
    // Prepare request config
    const config = {
      method,
      url: endpoint,
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    // Add data for POST, PUT, PATCH requests
    if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      config.data = data;
    }
    
    // Make the request
    console.log(`Making authenticated ${method} request to ${endpoint}`);
    const response = await apiClient(config);
    return response.data;
  } catch (error) {
    console.error(`Authenticated request to ${endpoint} failed:`, error.message);
    throw error;
  }
};

// Unified API endpoints
const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/auth/token/',
    REGISTER: '/api/v1/auth/register/',
    REFRESH: '/api/v1/auth/token/refresh/',
    VERIFY: '/api/v1/auth/token/verify/',
    RESET_PASSWORD: '/api/v1/auth/password/reset/',
    RESET_PASSWORD_CONFIRM: '/api/v1/auth/password/reset/confirm/',
    CHANGE_PASSWORD: '/api/v1/auth/change-password/',
    USER_PROFILE: '/api/v1/auth/user/',
    GOOGLE_AUTH: '/api/v1/auth/google-auth/',
    GOOGLE_REGISTER: '/api/v1/auth/google-register/',
    LOGOUT: '/api/v1/auth/logout/'
  },
  DASHBOARD: {
    STATS: '/api/v1/dashboard/stats/'
  },
  PROFILE: '/api/v1/user/profile/',
  PROFILE_SETTINGS: {
    GET_UPDATE: '/api/v1/profile/',
    UPLOAD_PICTURE: '/api/v1/profile/picture/'
  },
  REQUESTS: {
    LIST: '/api/v1/requests/',
    DETAIL: (id) => `/api/v1/requests/${id}/`,
    CREATE: '/api/v1/requests/',
    UPDATE: (id) => `/api/v1/requests/${id}/`,
    DELETE: (id) => `/api/v1/requests/${id}/`,
    CANCEL: (id) => `/api/v1/requests/${id}/cancel/`,
    SUBMIT: (id) => `/api/v1/requests/${id}/submit/`,
    ASSIGN: (id) => `/api/v1/requests/${id}/assign/`,
    PROCESS: (id) => `/api/v1/requests/${id}/process/`,
    APPROVE: (id) => `/api/v1/requests/${id}/approve/`,
    REJECT: (id) => `/api/v1/requests/${id}/reject/`,
    ADD_ATTACHMENT: (id) => `/api/v1/requests/${id}/attachments/`,
    ATTACHMENTS: (id) => `/api/v1/requests/${id}/attachments/`
  },
  DOCUMENTS: {
    LIST: '/api/v1/documents/',
    DETAIL: (id) => `/api/v1/documents/${id}/`,
    CREATE: '/api/v1/documents/',
    UPDATE: (id) => `/api/v1/documents/${id}/`,
    DELETE: (id) => `/api/v1/documents/${id}/`,
    VERIFY: '/api/v1/documents/verify/'
  },
  DOCUMENT_TYPES: {
    LIST: '/api/v1/document-types/',
    DETAIL: (id) => `/api/v1/document-types/${id}/`
  },
  CITIZENS: {
    LIST: '/api/v1/citizens/',
    DETAIL: (id) => `/api/v1/citizens/${id}/`,
    UPDATE: (id) => `/api/v1/citizens/${id}/`,
    DOCUMENTS: (id) => `/api/v1/citizens/${id}/documents/`
  },
  OFFICERS: {
    LIST: '/api/v1/officers/',
    DETAIL: (id) => `/api/v1/officers/${id}/`,
    APPROVE: (id) => `/api/v1/officers/${id}/approve/`,
    REJECT: (id) => `/api/v1/officers/${id}/reject/`
  },
  APPROVALS: {
    LIST: '/api/v1/approvals/',
    DETAIL: (id) => `/api/v1/approvals/${id}/`,
    APPROVE: (id) => `/api/v1/approvals/${id}/approve/`,
    REJECT: (id) => `/api/v1/approvals/${id}/reject/`
  },
  FEEDBACK: {
    CREATE: '/api/v1/feedback/',
    LIST: '/api/v1/feedback/'
  },
  STATISTICS: {
    GENERAL: '/api/v1/statistics/',
    OFFICERS: '/api/v1/statistics/officers/',
    DOCUMENTS: '/api/v1/statistics/documents/',
    REQUESTS: '/api/v1/statistics/requests/'
  }
};

// Common API service with unified methods
const commonApiService = {
  // Auth methods
  login: async (credentials) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    return response.data;
  },
  
  register: async (userData) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData);
    return response.data;
  },
  
  getUserProfile: async () => {
    const response = await apiClient.get(API_ENDPOINTS.AUTH.USER_PROFILE);
    return response.data;
  },
  
  // Dashboard methods
  getDashboardStats: async () => {
    const response = await apiClient.get(API_ENDPOINTS.DASHBOARD.STATS);
    return response.data;
  },
  
  // Profile methods
  getProfile: async () => {
    const response = await apiClient.get(API_ENDPOINTS.PROFILE_SETTINGS.GET_UPDATE);
    return response.data;
  },
  
  updateProfile: async (profileData) => {
    const response = await apiClient.put(API_ENDPOINTS.PROFILE_SETTINGS.GET_UPDATE, profileData);
    return response.data;
  },
  
  uploadProfilePicture: async (formData) => {
    const response = await apiClient.post(
      API_ENDPOINTS.PROFILE_SETTINGS.UPLOAD_PICTURE, 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  },
  
  // Request methods
  getRequests: async (params) => {
    const response = await apiClient.get(API_ENDPOINTS.REQUESTS.LIST, { params });
    return response.data;
  },
  
  getRequestDetail: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.REQUESTS.DETAIL(id));
    return response.data;
  },
  
  createRequest: async (requestData) => {
    const response = await apiClient.post(API_ENDPOINTS.REQUESTS.CREATE, requestData);
    return response.data;
  },
  
  updateRequest: async (id, requestData) => {
    const response = await apiClient.put(API_ENDPOINTS.REQUESTS.UPDATE(id), requestData);
    return response.data;
  },
  
  cancelRequest: async (id) => {
    const response = await apiClient.post(API_ENDPOINTS.REQUESTS.CANCEL(id));
    return response.data;
  },
  
  assignRequest: async (id, assignData) => {
    const response = await apiClient.post(API_ENDPOINTS.REQUESTS.ASSIGN(id), assignData);
    return response.data;
  },
  
  processRequest: async (id, processData) => {
    const response = await apiClient.post(API_ENDPOINTS.REQUESTS.PROCESS(id), processData);
    return response.data;
  },
  
  approveRequest: async (id, approveData) => {
    const response = await apiClient.post(API_ENDPOINTS.REQUESTS.APPROVE(id), approveData);
    return response.data;
  },
  
  rejectRequest: async (id, rejectData) => {
    const response = await apiClient.post(API_ENDPOINTS.REQUESTS.REJECT(id), rejectData);
    return response.data;
  },
  
  addAttachment: async (id, formData) => {
    const response = await apiClient.post(
      API_ENDPOINTS.REQUESTS.ADD_ATTACHMENT(id),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  },
  
  getAttachments: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.REQUESTS.ATTACHMENTS(id));
    return response.data;
  },
  
  // Document methods
  getDocuments: async (params) => {
    const response = await apiClient.get(API_ENDPOINTS.DOCUMENTS.LIST, { params });
    return response.data;
  },
  
  getDocumentDetail: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.DOCUMENTS.DETAIL(id));
    return response.data;
  },
  
  createDocument: async (documentData) => {
    const response = await apiClient.post(API_ENDPOINTS.DOCUMENTS.CREATE, documentData);
    return response.data;
  },
  
  verifyDocument: async (verificationData) => {
    const response = await apiClient.post(API_ENDPOINTS.DOCUMENTS.VERIFY, verificationData);
    return response.data;
  },
  
  // Citizen methods
  getCitizens: async (params) => {
    const response = await apiClient.get(API_ENDPOINTS.CITIZENS.LIST, { params });
    return response.data;
  },
  
  getCitizenDetail: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.CITIZENS.DETAIL(id));
    return response.data;
  },
  
  updateCitizen: async (id, citizenData) => {
    const response = await apiClient.put(API_ENDPOINTS.CITIZENS.UPDATE(id), citizenData);
    return response.data;
  },
  
  getCitizenDocuments: async (id, params) => {
    const response = await apiClient.get(API_ENDPOINTS.CITIZENS.DOCUMENTS(id), { params });
    return response.data;
  },
  
  // Officer methods
  getOfficers: async (params) => {
    const response = await apiClient.get(API_ENDPOINTS.OFFICERS.LIST, { params });
    return response.data;
  },
  
  getOfficerDetail: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.OFFICERS.DETAIL(id));
    return response.data;
  },
  
  approveOfficer: async (id, approvalData) => {
    const response = await apiClient.post(API_ENDPOINTS.OFFICERS.APPROVE(id), approvalData);
    return response.data;
  },
  
  rejectOfficer: async (id, rejectionData) => {
    const response = await apiClient.post(API_ENDPOINTS.OFFICERS.REJECT(id), rejectionData);
    return response.data;
  },
  
  // Approval methods
  getApprovals: async (params) => {
    const response = await apiClient.get(API_ENDPOINTS.APPROVALS.LIST, { params });
    return response.data;
  },
  
  getApprovalDetail: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.APPROVALS.DETAIL(id));
    return response.data;
  },
  
  approveApproval: async (id, approvalData) => {
    const response = await apiClient.post(API_ENDPOINTS.APPROVALS.APPROVE(id), approvalData);
    return response.data;
  },
  
  rejectApproval: async (id, rejectionData) => {
    const response = await apiClient.post(API_ENDPOINTS.APPROVALS.REJECT(id), rejectionData);
    return response.data;
  },
  
  // Feedback methods
  submitFeedback: async (feedbackData) => {
    const response = await apiClient.post(API_ENDPOINTS.FEEDBACK.CREATE, feedbackData);
    return response.data;
  },
  
  getFeedback: async (params) => {
    const response = await apiClient.get(API_ENDPOINTS.FEEDBACK.LIST, { params });
    return response.data;
  },
  
  // Statistics methods
  getStatistics: async () => {
    try {
      console.log('Requesting statistics with authenticated request');
      return await authenticateRequest(API_ENDPOINTS.STATISTICS.GENERAL);
    } catch (error) {
      console.error('Error in getStatistics:', error.message);
      if (error.response && error.response.status === 401) {
        console.log('Authentication error in getStatistics, trying to refresh token');
        // Try to refresh token and retry the request
        try {
          await refreshTokenManually();
          return await authenticateRequest(API_ENDPOINTS.STATISTICS.GENERAL);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError.message);
          throw error;
        }
      }
      throw error;
    }
  },
  
  getOfficerStatistics: async () => {
    try {
      return await authenticateRequest(API_ENDPOINTS.STATISTICS.OFFICERS);
    } catch (error) {
      console.error('Error in getOfficerStatistics:', error.message);
      throw error;
    }
  },
  
  getDocumentStatistics: async () => {
    try {
      return await authenticateRequest(API_ENDPOINTS.STATISTICS.DOCUMENTS);
    } catch (error) {
      console.error('Error in getDocumentStatistics:', error.message);
      throw error;
    }
  },
  
  getRequestStatistics: async () => {
    try {
      return await authenticateRequest(API_ENDPOINTS.STATISTICS.REQUESTS);
    } catch (error) {
      console.error('Error in getRequestStatistics:', error.message);
      throw error;
    }
  }
};

export { API_ENDPOINTS, authenticateRequest, refreshTokenManually };
export default commonApiService; 