/**
 * API Configuration
 * Cấu hình các endpoint API phù hợp với backend thực tế
 */

// Base URL cho tất cả các API calls - sử dụng proxy để tránh CORS
export const API_BASE_URL = '/api';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth - Endpoints chính xác theo backend
  AUTH: {
    LOGIN: '/api/v1/auth/token/',  // Endpoint đăng nhập thực tế
    REGISTER: '/api/v1/auth/register/',
    REGISTER_CHAIRMAN: '/api/v1/auth/register-chairman/',
    REFRESH: '/api/v1/auth/token/refresh/',
    VERIFY: '/api/v1/auth/token/verify/',
    RESET_PASSWORD: '/api/v1/auth/password/reset/',
    RESET_PASSWORD_CONFIRM: '/api/v1/auth/password/reset/confirm/',
    CHANGE_PASSWORD: '/api/v1/auth/change-password/',
    PROFILE: '/api/v1/auth/user/',
    GOOGLE_AUTH: '/api/v1/auth/google-auth/',
    GOOGLE_REGISTER: '/api/v1/auth/google-register/',
    LOGOUT: '/api/v1/auth/logout/'
  },
  CITIZEN: {
    DASHBOARD: '/api/v1/citizen/dashboard/stats/',
    PROFILE: '/api/v1/citizen/profile/',
    DOCUMENTS: '/api/v1/citizen/documents/',
    DOCUMENT_DETAIL: (id) => `/api/v1/citizen/documents/${id}/`,
    REQUESTS: '/api/v1/citizen/requests/',
    REQUEST_DETAIL: (id) => `/api/v1/citizen/requests/${id}/`,
    CANCEL_REQUEST: (id) => `/api/v1/citizen/requests/${id}/cancel/`,
    FEEDBACK: '/api/v1/citizen/feedback/'
  },
  OFFICER: {
    DASHBOARD: '/api/v1/officer/dashboard/stats/',
    PROFILE: '/api/v1/officer/profile/',
    PENDING_REQUESTS: '/api/v1/officer/requests/pending/',
    REQUEST_DETAIL: (id) => `/api/v1/officer/requests/${id}/`,
    ASSIGN_TO_SELF: (id) => `/api/v1/officer/requests/${id}/assign/`,
    PROCESS_REQUEST: (id) => `/api/v1/officer/requests/${id}/complete/`,
    REJECT_REQUEST: (id) => `/api/v1/officer/requests/${id}/reject/`,
    CITIZENS: '/api/v1/officer/citizens/',
    CITIZEN_DETAIL: (id) => `/api/v1/officer/citizens/${id}/`,
    CITIZEN_DOCUMENTS: (id) => `/api/v1/officer/citizens/${id}/documents/`,
    CITIZEN_DELETE: (id) => `/api/v1/officer/citizens/${id}/delete/`,
    CITIZEN_UPDATE: (id) => `/api/v1/officer/citizens/${id}/update/`,
    DOCUMENT_DETAIL: (id) => `/api/v1/officer/citizens/documents/${id}/`,
    STATISTICS: '/api/v1/officer/statistics/',
    PROFILE_PICTURE: '/api/v1/officer/profile/picture/'
  },
  CHAIRMAN: {
    DASHBOARD: '/api/v1/chairman/dashboard/stats/',
    PROFILE: '/api/v1/chairman/profile/',
    OFFICER_APPROVALS: '/api/v1/chairman/officer-approvals/',
    OFFICER_APPROVAL_DETAIL: (id) => `/api/v1/chairman/officer-approvals/${id}/`,
    APPROVE_OFFICER: (id) => `/api/v1/chairman/officer-approvals/${id}/approve/`,
    REJECT_OFFICER: (id) => `/api/v1/chairman/officer-approvals/${id}/reject/`,
    OFFICERS: '/api/v1/chairman/officers/',
    OFFICER_DETAIL: (id) => `/api/v1/chairman/officers/${id}/`,
    IMPORTANT_DOCUMENTS: '/api/v1/chairman/important-documents/',
    IMPORTANT_DOCUMENT_DETAIL: (id) => `/api/v1/chairman/important-documents/${id}/`,
    APPROVE_DOCUMENT: (id) => `/api/v1/chairman/important-documents/${id}/approve/`,
    REJECT_DOCUMENT: (id) => `/api/v1/chairman/important-documents/${id}/reject/`,
    REPORTS: '/api/v1/chairman/reports/'
  }
};

export default {
  API_BASE_URL,
  API_ENDPOINTS
}; 