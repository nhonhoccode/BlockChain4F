/**
 * Class AppError để xử lý lỗi trong ứng dụng
 */
export class AppError extends Error {
  /**
   * Constructor cho AppError
   * @param {string} code - Mã lỗi
   * @param {string} message - Thông báo lỗi
   * @param {Object} details - Chi tiết bổ sung về lỗi
   */
  constructor(code, message, details = {}) {
    super(message);
    this.code = code;
    this.name = 'AppError';
    this.details = details;
  }
}

/**
 * Kiểu dữ liệu cho lỗi API
 */
export interface ApiErrorResponse {
  code?: string;
  message?: string;
  error?: string;
  errors?: any;
  non_field_errors?: string[];
  detail?: string;
  response?: {
    data?: any;
    status?: number;
    statusText?: string;
  };
}

/**
 * Kiểm tra lỗi là lỗi khi chưa triển khai tính năng
 * @param {Error} error - Lỗi cần kiểm tra
 * @returns {boolean} - Kết quả
 */
export const isNotImplementedError = (error) => {
  if (error instanceof AppError) {
    return error.code === 'not_implemented';
  }
  return false;
};

/**
 * Ghi log lỗi vào console
 * @param {Error} error - Lỗi cần ghi log
 * @param {string} context - Ngữ cảnh xảy ra lỗi
 */
export const logError = (error, context = '') => {
  if (error instanceof AppError) {
    console.error(`[${context}] ${error.name} (${error.code}): ${error.message}`, error.details);
  } else {
    console.error(`[${context}] Error:`, error);
  }
};

/**
 * Xử lý lỗi từ Axios
 * @param {Error} error - Lỗi từ Axios
 * @returns {AppError} - AppError với mã và thông báo phù hợp
 */
export const handleAxiosError = (error) => {
  if (error.response) {
    // Lỗi từ server với mã lỗi
    const { status, data } = error.response;
    
    // Lỗi xác thực (401)
    if (status === 401) {
      return new AppError('unauthorized', 'Bạn không được phép truy cập tài nguyên này. Vui lòng đăng nhập lại.', { status });
    }
    
    // Lỗi quyền truy cập (403)
    if (status === 403) {
      return new AppError('forbidden', 'Bạn không có quyền truy cập tài nguyên này.', { status });
    }
    
    // Lỗi không tìm thấy tài nguyên (404)
    if (status === 404) {
      return new AppError('not_found', 'Không tìm thấy tài nguyên yêu cầu.', { status });
    }
    
    // Lỗi xác thực dữ liệu (422)
    if (status === 422) {
      return new AppError('validation_error', 'Dữ liệu không hợp lệ.', { status, errors: data?.errors || data });
    }
    
    // Lỗi vai trò không khớp (409)
    if (status === 409 && data?.code === 'role_mismatch') {
      return new AppError('role_mismatch', data.message || 'Vai trò không khớp với tài khoản của bạn.', { status, actual_role: data.actual_role });
    }
    
    // Lỗi server (500)
    if (status >= 500) {
      return new AppError('server_error', 'Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau.', { status });
    }
    
    // Lỗi khác với phản hồi từ server
    return new AppError('api_error', data?.message || data?.error || 'Đã xảy ra lỗi không xác định.', { status, data });
  }
  
  // Lỗi kết nối (network error)
  if (error.request) {
    return new AppError('network_error', 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn.', { request: error.request });
  }
  
  // Lỗi khác
  return new AppError('unknown_error', error.message || 'Đã xảy ra lỗi không xác định.', { originalError: error });
};

export default {
  AppError,
  handleAxiosError,
  logError,
  isNotImplementedError
}; 