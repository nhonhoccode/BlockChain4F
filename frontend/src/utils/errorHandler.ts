import { AxiosError } from 'axios';

// Fix for TypeScript error with captureStackTrace
declare global {
  interface ErrorConstructor {
    captureStackTrace(targetObject: object, constructorOpt?: Function): void;
  }
}

// Custom error class cho ứng dụng
export class AppError extends Error {
  code: string;
  details?: Record<string, any>;
  
  constructor(code: string, message: string, details?: Record<string, any>) {
    super(message);
    this.code = code;
    this.name = 'AppError';
    this.details = details;
    
    // Để stack trace hoạt động đúng với ES6 classes
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

// Interface cho API Error response
export interface ApiErrorResponse {
  message: string;
  code: string;
  details?: Record<string, any>;
}

/**
 * Ghi log lỗi với thông tin chi tiết
 * @param error Lỗi cần xử lý
 * @param context Thông tin bổ sung về ngữ cảnh lỗi
 */
export const logError = (error: any, context?: Record<string, any>): void => {
  let errorDetails: Record<string, any> = {
    timestamp: new Date().toISOString(),
    context: context || {}
  };
  
  if (error instanceof AppError) {
    errorDetails = {
      ...errorDetails,
      name: error.name,
      code: error.code,
      message: error.message,
      details: error.details
    };
  } else if (error instanceof AxiosError) {
    errorDetails = {
      ...errorDetails,
      name: 'AxiosError',
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      responseData: error.response?.data
    };
  } else if (error instanceof Error) {
    errorDetails = {
      ...errorDetails,
      name: error.name,
      message: error.message,
      stack: error.stack
    };
  } else {
    errorDetails = {
      ...errorDetails,
      error
    };
  }
  
  // Gửi thông tin lỗi đến hệ thống theo dõi (monitoring)
  // Ở đây sử dụng console.error, trong môi trường thực tế có thể thay thế bằng 
  // các dịch vụ như Sentry, LogRocket, v.v.
  console.error('Application Error:', errorDetails);
};

/**
 * Chuyển đổi lỗi từ API response thành AppError
 * @param error Lỗi từ Axios
 * @returns AppError đã được xử lý
 */
export const handleApiError = (error: AxiosError<ApiErrorResponse>): AppError => {
  let code = 'unknown_error';
  let message = 'Đã xảy ra lỗi không xác định';
  let details: Record<string, any> | undefined;
  
  if (error.response) {
    // Lỗi từ server với response
    const status = error.response.status;
    const responseData = error.response.data;
    
    if (responseData && typeof responseData === 'object') {
      code = responseData.code || `http_${status}`;
      message = responseData.message || error.message;
      details = responseData.details;
    } else {
      code = `http_${status}`;
      message = error.message;
    }
    
    // Xử lý mã lỗi HTTP phổ biến
    if (!responseData) {
      switch (status) {
        case 400:
          code = 'bad_request';
          message = 'Yêu cầu không hợp lệ';
          break;
        case 401:
          code = 'unauthorized';
          message = 'Không có quyền truy cập';
          break;
        case 403:
          code = 'forbidden';
          message = 'Bạn không có quyền thực hiện hành động này';
          break;
        case 404:
          code = 'not_found';
          message = 'Không tìm thấy tài nguyên yêu cầu';
          break;
        case 422:
          code = 'validation_error';
          message = 'Dữ liệu gửi đi không hợp lệ';
          break;
        case 500:
          code = 'server_error';
          message = 'Lỗi máy chủ, vui lòng thử lại sau';
          break;
      }
    }
  } else if (error.request) {
    // Gửi request nhưng không nhận được response
    code = 'network_error';
    message = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối của bạn.';
  }
  
  return new AppError(code, message, details);
};

/**
 * Phát hiện lỗi API chưa được triển khai
 * @param error Lỗi cần kiểm tra
 * @returns true nếu là lỗi API chưa triển khai
 */
export const isNotImplementedError = (error: AxiosError): boolean => {
  if (!error.response) return false;
  
  const status = error.response.status;
  const data = error.response.data as any;
  
  // Kiểm tra mã lỗi 501 Not Implemented
  if (status === 501) return true;
  
  // Kiểm tra thông báo lỗi hoặc mã lỗi cụ thể
  if (data) {
    const message = data.message?.toLowerCase?.() || '';
    const code = data.code?.toLowerCase?.() || '';
    
    return (
      code === 'not_implemented' ||
      message.includes('not implemented') ||
      message.includes('chưa được triển khai')
    );
  }
  
  return false;
};

export default {
  AppError,
  handleApiError,
  isNotImplementedError
}; 