/**
 * API Configuration
 * Central configuration for API endpoints and settings
 */

// API base URL (default to localhost for development)
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// API endpoints for the application
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/auth/token/',
    REGISTER: '/api/v1/auth/register/',
    REGISTER_OFFICER: '/api/v1/auth/register-officer/',
    REGISTER_CHAIRMAN: '/api/v1/auth/register-chairman/',
    USER_PROFILE: '/api/v1/auth/user/',
    REFRESH: '/api/v1/auth/token/refresh/',
    VERIFY: '/api/v1/auth/token/verify/',
    CHANGE_PASSWORD: '/api/v1/auth/change-password/',
    RESET_PASSWORD: '/api/v1/auth/password/reset/',
    RESET_PASSWORD_CONFIRM: '/api/v1/auth/password/reset/confirm/',
    GOOGLE_AUTH: '/api/v1/auth/google-auth/',
    GOOGLE_REGISTER: '/api/v1/auth/google-register/',
    LOGOUT: '/api/v1/auth/logout/'
  },
  CITIZEN: {
    DASHBOARD: '/api/v1/citizen/dashboard/stats/',
    REQUESTS: '/api/v1/citizen/requests/',
    DOCUMENTS: '/api/v1/citizen/documents/',
    PROFILE: '/api/v1/citizen/profile/',
    FEEDBACK: '/api/v1/citizen/feedback/'
  },
  OFFICER: {
    DASHBOARD: '/api/v1/officer/dashboard/stats/',
    REQUESTS: '/api/v1/officer/requests/',
    PENDING_REQUESTS: '/api/v1/officer/requests/pending/',
    CITIZENS: '/api/v1/officer/citizens/',
    PROFILE: '/api/v1/officer/profile/',
    PROCESS_REQUEST: (requestId) => `/api/v1/officer/requests/${requestId}/complete/`,
    REQUEST_DETAIL: (requestId) => `/api/v1/officer/requests/${requestId}/`,
    ASSIGN_TO_SELF: (requestId) => `/api/v1/officer/requests/${requestId}/assign/`,
    REJECT_REQUEST: (requestId) => `/api/v1/officer/requests/${requestId}/reject/`,
    CITIZEN_DETAIL: (citizenId) => `/api/v1/officer/citizens/${citizenId}/`,
    CITIZEN_UPDATE: (citizenId) => `/api/v1/officer/citizens/${citizenId}/update/`,
    CITIZEN_UPDATE_MOCK: (citizenId) => `/api/v1/officer/citizens/${citizenId}/update-mock/`,
    CITIZEN_DELETE: (citizenId) => `/api/v1/officer/citizens/${citizenId}/`,
  },
  CHAIRMAN: {
    DASHBOARD: '/api/v1/chairman/dashboard/stats/',
    OFFICERS: '/api/v1/chairman/officers/',
    OFFICER_DETAIL: (officerId) => `/api/v1/chairman/officers/${officerId}/`,
    OFFICER_BLOCK: (officerId) => `/api/v1/chairman/officers/${officerId}/block/`,
    OFFICER_UNBLOCK: (officerId) => `/api/v1/chairman/officers/${officerId}/unblock/`,
    OFFICER_REMOVE: (officerId) => `/api/v1/chairman/officers/${officerId}/remove/`,
    OFFICER_STATS: (officerId) => `/api/v1/chairman/officers/${officerId}/stats/`,
    OFFICER_REQUESTS: '/api/v1/chairman/officer-requests/',
    OFFICER_REQUEST_DETAIL: (requestId) => `/api/v1/chairman/officer-requests/${requestId}/`,
    APPROVE_OFFICER: (requestId) => `/api/v1/chairman/officer-requests/${requestId}/approve/`,
    REJECT_OFFICER: (requestId) => `/api/v1/chairman/officer-requests/${requestId}/reject/`,
    IMPORTANT_DOCUMENTS: '/api/v1/chairman/important-documents/',
    IMPORTANT_DOCUMENT_DETAIL: (documentId) => `/api/v1/chairman/important-documents/${documentId}/`,
    APPROVE_DOCUMENT: (documentId) => `/api/v1/chairman/important-documents/${documentId}/approve/`,
    REJECT_DOCUMENT: (documentId) => `/api/v1/chairman/important-documents/${documentId}/reject/`,
    BLOCKCHAIN_VERIFY: (documentId) => `/api/v1/chairman/important-documents/${documentId}/verify/`,
    REPORTS: '/api/v1/chairman/reports/',
    PROFILE: '/api/v1/chairman/profile/'
  }
};

// API request timeout in milliseconds
export const API_TIMEOUT = 30000;

// Default pagination settings
export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 10
};

// Error codes and messages
export const API_ERROR_CODES = {
  AUTH_ERROR: 'Authentication error',
  NETWORK_ERROR: 'Network error',
  SERVER_ERROR: 'Server error',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation error'
};

// Helper function to get authentication headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (token) {
    return { 
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }
  return { 
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
};

// Create the api config object for default export
const apiConfig = {
  API_BASE_URL,
  API_ENDPOINTS,
  API_TIMEOUT,
  DEFAULT_PAGINATION,
  API_ERROR_CODES,
  getAuthHeaders
};

export default apiConfig; 