/**
 * API Configuration
 */

// Base API URL - use environment variable if set, otherwise default to local development server
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// API Timeout in milliseconds
export const API_TIMEOUT = 30000;

// API Version
export const API_VERSION = 'v1';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  REGISTER: '/api/auth/register',
  REFRESH_TOKEN: '/api/auth/refresh',
  CHANGE_PASSWORD: '/api/auth/change-password',
  RESET_PASSWORD: '/api/auth/reset-password',
  
  // User Management
  USER_PROFILE: '/api/v1/users/profile',
  
  // Citizen
  CITIZEN_DASHBOARD: '/api/v1/citizen/dashboard/stats/',
  CITIZEN_REQUESTS: '/api/v1/citizen/requests/',
  CITIZEN_DOCUMENTS: '/api/v1/citizen/documents/',
  CITIZEN_FEEDBACK: '/api/v1/citizen/feedback/',
  
  // Officer
  OFFICER_DASHBOARD: '/api/v1/officer/dashboard',
  OFFICER_REQUESTS: '/api/v1/officer/requests',
  OFFICER_CITIZENS: '/api/v1/officer/citizens',
  OFFICER_DOCUMENTS: '/api/v1/officer/documents',
  OFFICER_PROFILE: '/api/v1/officer/profile',
  OFFICER_APPROVAL_STATUS: '/api/v1/officer/approval-status',
  
  // Chairman
  CHAIRMAN_DASHBOARD: '/api/v1/chairman/dashboard',
  CHAIRMAN_OFFICER_APPROVALS: '/api/v1/chairman/officer-approvals',
  CHAIRMAN_OFFICER_MANAGEMENT: '/api/v1/chairman/officers',
  CHAIRMAN_IMPORTANT_DOCUMENTS: '/api/v1/chairman/important-documents',
  CHAIRMAN_REPORTS: '/api/v1/chairman/reports',
  
  // Document Management
  DOCUMENTS: '/api/v1/documents',
  DOCUMENT_TYPES: '/api/v1/document-types',
  DOCUMENT_REQUESTS: '/api/v1/document-requests',
  
  // Verification
  VERIFICATION: '/api/v1/verification',
  GENERATE_CODE: '/api/v1/verification/generate-code',
  VERIFY_DOCUMENT: '/api/v1/verification/verify',
  
  // Blockchain
  BLOCKCHAIN_STATUS: '/api/v1/blockchain/status',
  BLOCKCHAIN_TRANSACTIONS: '/api/v1/blockchain/transactions',
};

// Request Headers
export const getAuthHeaders = (token) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
});

// API Error Codes
export const API_ERROR_CODES = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 422,
  SERVER_ERROR: 500,
};

// Default pagination params
export const DEFAULT_PAGINATION = {
  page: 1,
  pageSize: 10,
};

export default {
  API_URL,
  API_TIMEOUT,
  API_VERSION,
  API_ENDPOINTS,
  getAuthHeaders,
  API_ERROR_CODES,
  DEFAULT_PAGINATION,
}; 