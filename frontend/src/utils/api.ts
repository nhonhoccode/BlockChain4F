import axios, { AxiosInstance, AxiosResponse, AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { 
  handleAxiosError, 
  AppError, 
  logError, 
  ApiErrorResponse, 
  isNotImplementedError
} from './errorHandler';

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/auth/login/',
    REGISTER: '/api/v1/auth/register/',
    REFRESH: '/api/v1/auth/token/refresh/',
    VERIFY: '/api/v1/auth/token/verify/',
    RESET_PASSWORD: '/api/v1/auth/password/reset/',
    RESET_PASSWORD_CONFIRM: '/api/v1/auth/password/reset/confirm/',
    CHANGE_PASSWORD: '/api/v1/auth/password/change/',
    PROFILE: '/api/v1/auth/profile/'
  },
  CITIZEN: {
    DASHBOARD: '/api/v1/citizen/dashboard/stats/',
    PROFILE: '/api/v1/citizen/profile/',
    DOCUMENTS: '/api/v1/citizen/documents/',
    DOCUMENT_DETAIL: (id: string) => `/api/v1/citizen/documents/${id}/`,
    REQUESTS: '/api/v1/citizen/requests/',
    REQUEST_DETAIL: (id: string) => `/api/v1/citizen/requests/${id}/`,
    CANCEL_REQUEST: (id: string) => `/api/v1/citizen/requests/${id}/cancel/`,
    FEEDBACK: '/api/v1/citizen/feedback/'
  },
  OFFICER: {
    DASHBOARD: '/api/v1/officer/dashboard/stats/',
    PROFILE: '/api/v1/officer/profile/',
    PROFILE_PICTURE: '/api/v1/officer/profile/picture/',
    PENDING_REQUESTS: '/api/v1/officer/requests/pending/',
    REQUEST_DETAIL: (id: string) => `/api/v1/officer/requests/${id}/`,
    ASSIGN_TO_SELF: (id: string) => `/api/v1/officer/requests/${id}/assign-to-self/`,
    PROCESS_REQUEST: (id: string) => `/api/v1/officer/requests/${id}/process/`,
    REJECT_REQUEST: (id: string) => `/api/v1/officer/requests/${id}/reject/`,
    CITIZENS: '/api/v1/officer/citizens/',
    CITIZEN_DETAIL: (id: string) => `/api/v1/officer/citizens/${id}/`,
    STATISTICS: '/api/v1/officer/statistics/'
  },
  CHAIRMAN: {
    DASHBOARD: '/api/v1/chairman/dashboard/stats/',
    PENDING_OFFICER_APPROVALS: '/api/v1/chairman/officer-approvals/pending/',
    APPROVE_OFFICER: (id: string) => `/api/v1/chairman/officer-approvals/${id}/approve/`,
    REJECT_OFFICER: (id: string) => `/api/v1/chairman/officer-approvals/${id}/reject/`,
    PENDING_IMPORTANT_DOCUMENTS: '/api/v1/chairman/important-documents/pending/',
    APPROVE_DOCUMENT: (id: string) => `/api/v1/chairman/important-documents/${id}/approve/`,
    REJECT_DOCUMENT: (id: string) => `/api/v1/chairman/important-documents/${id}/reject/`
  },
  NOTIFICATIONS: {
    LIST: '/api/v1/notifications/',
    MARK_READ: (id: string) => `/api/v1/notifications/${id}/mark-read/`,
    MARK_ALL_READ: '/api/v1/notifications/mark-all-read/',
    DELETE: (id: string) => `/api/v1/notifications/${id}/`,
    DELETE_ALL: '/api/v1/notifications/'
  }
};

// Kiểm tra môi trường
const isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost';
const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
  ? 'http://localhost:8000' 
  : 'https://api.blockchain-admin.gov.vn';

// Tạo instance Axios với cấu hình mặc định
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Biến để theo dõi các lỗi API
const apiErrorCounts: Record<string, number> = {};

// Request interceptor để thêm token xác thực
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // Lấy token từ localStorage
    const token = localStorage.getItem('token');
    
    // Nếu có token và config có headers, thêm vào header Authorization
    if (token && config.headers) {
      config.headers.Authorization = `Token ${token}`;
    }
    
    // Log request trong môi trường development
    if (isDevelopment) {
      console.log(`🚀 Request: ${config.method?.toUpperCase()} ${config.url}`, config);
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor để xử lý lỗi chung
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Xử lý response thành công
    const url = response.config.url || '';
    
    // Reset error count for this endpoint on success
    if (apiErrorCounts[url]) {
      apiErrorCounts[url] = 0;
    }
    
    // Log response trong môi trường development
    if (isDevelopment) {
      console.log(`✅ Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    
    return response;
  },
  (error: AxiosError) => {
    // Lấy URL của request
    const url = error.config?.url || '';
    
    // Tăng số lần lỗi cho URL này
    apiErrorCounts[url] = (apiErrorCounts[url] || 0) + 1;
    
    // Log lỗi trong môi trường development
    if (isDevelopment) {
      console.error(`❌ Error: ${error.config?.method?.toUpperCase()} ${url}`, error);
    }
    
    // Xử lý lỗi theo loại lỗi cụ thể
    if (error.response) {
      // Lỗi từ server (status code không phải 2xx)
      const status = error.response.status;
      
      if (status === 401) {
        // Unauthorized - Token hết hạn hoặc không hợp lệ
        localStorage.removeItem('token');
        localStorage.removeItem('authUser');
        
        // Chuyển hướng đến trang login nếu không phải đang ở trang login
        const isLoginPage = window.location.pathname.includes('/auth/login');
        if (!isLoginPage) {
          window.location.href = '/auth/login?reason=session_expired';
        }
      }
      
      return Promise.reject(handleAxiosError(error as AxiosError<ApiErrorResponse>));
    } else if (error.request) {
      // Lỗi network - không nhận được response
      logError(error, 'Network');
      return Promise.reject(new AppError(
        'network_error',
        'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại sau.'
      ));
    } else {
      // Lỗi khi tạo request
      logError(error, 'Request');
      return Promise.reject(new AppError(
        'request_error',
        'Đã xảy ra lỗi khi gửi yêu cầu. Vui lòng thử lại sau.'
      ));
    }
  }
);

/**
 * GET request
 * @param url URL để fetch
 * @param params Query parameters
 * @param config Additional config
 * @returns Promise with response data
 */
export const get = async <T>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response = await api.get<T>(url, { ...config, params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * POST request
 * @param url URL để post
 * @param data Data to post
 * @param config Additional config
 * @returns Promise with response data
 */
export const post = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  try {
    // Kiểm tra nếu data là string JSON và header là application/json
    const isJsonString = typeof data === 'string' && data.startsWith('{') && data.endsWith('}');
    const isJsonContentType = config?.headers?.['Content-Type'] === 'application/json';
    
    // Nếu data đã là string JSON và header là application/json, không cần stringify lại
    const finalConfig = config || {};
    if (isJsonString && isJsonContentType) {
      console.log('DEBUG: Sending pre-stringified JSON data');
      // Đảm bảo axios không stringify lại data
      finalConfig.transformRequest = [(data, headers) => data];
    }
    
    const response = await api.post<T>(url, data, finalConfig);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * PUT request
 * @param url URL to update
 * @param data Data to update
 * @param config Additional config
 * @returns Promise with response data
 */
export const put = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response = await api.put<T>(url, data, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * PATCH request
 * @param url URL to patch
 * @param data Data to patch
 * @param config Additional config
 * @returns Promise with response data
 */
export const patch = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response = await api.patch<T>(url, data, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * DELETE request
 * @param url URL to delete
 * @param config Additional config
 * @returns Promise with response data
 */
export const del = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response = await api.delete<T>(url, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Upload file
 * @param url URL to upload to
 * @param file File to upload
 * @param onProgress Progress callback
 * @param additionalData Additional form data
 * @returns Promise with response data
 */
export const uploadFile = async <T>(
  url: string,
  file: File,
  onProgress?: (percentage: number) => void,
  additionalData?: Record<string, any>
): Promise<T> => {
  const formData = new FormData();
  formData.append('file', file);
  
  // Add additional data to formData if provided
  if (additionalData) {
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });
  }
  
  try {
    const response = await api.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: progressEvent => {
        if (onProgress && progressEvent.total) {
          const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentage);
        }
      }
    });
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Xử lý lỗi API và trả về thông báo lỗi thân thiện
 * @param error Lỗi cần xử lý
 * @returns Thông tin lỗi
 */
export const handleApiError = (error: any): { message: string; code?: string; details?: any } => {
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      details: error.details
    };
  }
  
  if (error instanceof AxiosError) {
    const appError = handleAxiosError(error as AxiosError<ApiErrorResponse>);
    return {
      message: appError.message,
      code: appError.code,
      details: appError.details
    };
  }
  
  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'unknown_error'
    };
  }
  
  return {
    message: 'Đã xảy ra lỗi không xác định. Vui lòng thử lại sau.',
    code: 'unknown_error'
  };
};

export default {
  get,
  post,
  put,
  patch,
  del,
  uploadFile,
  api,
  handleApiError,
  API_ENDPOINTS
}; 