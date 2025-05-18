/**
 * Các hằng số và enum sử dụng trong ứng dụng
 */

/**
 * Enum các vai trò người dùng
 */
export enum UserRole {
  CITIZEN = 'citizen',
  OFFICER = 'officer',
  CHAIRMAN = 'chairman'
}

/**
 * Enum các trạng thái của yêu cầu
 */
export enum RequestStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

/**
 * Enum các trạng thái của giấy tờ
 */
export enum DocumentStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REVOKED = 'revoked',
  EXPIRED = 'expired'
}

/**
 * Enum các loại giấy tờ
 */
export enum DocumentType {
  RESIDENCE_CERT = 'residence_cert',  // Giấy xác nhận cư trú
  BIRTH_CERT = 'birth_cert',          // Giấy khai sinh
  MARRIAGE_CERT = 'marriage_cert',    // Giấy đăng ký kết hôn
  DEATH_CERT = 'death_cert',          // Giấy chứng tử
  LAND_CERT = 'land_cert',            // Giấy chứng nhận quyền sử dụng đất
  BUSINESS_CERT = 'business_cert',    // Giấy phép kinh doanh
  POVERTY_CERT = 'poverty_cert',      // Giấy xác nhận hộ nghèo
  JUDICIAL_RECORD = 'judicial_record', // Lý lịch tư pháp
  FAMILY_BOOK = 'family_book'         // Sổ hộ khẩu
}

/**
 * Danh sách các API endpoint
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/auth/token/',
    REGISTER: '/api/v1/auth/register/',
    LOGOUT: '/api/v1/auth/logout/',
    RESET_PASSWORD: '/api/v1/auth/reset-password/',
    VERIFY_EMAIL: '/api/v1/auth/verify-email/'
  },
  CITIZEN: {
    DASHBOARD: '/api/v1/citizen/dashboard/stats/',
    PROFILE: '/api/v1/citizen/profile/',
    DOCUMENTS: '/api/v1/citizen/documents/',
    REQUESTS: '/api/v1/citizen/requests/',
    FEEDBACK: '/api/v1/citizen/feedback/'
  },
  OFFICER: {
    DASHBOARD: '/api/v1/officer/dashboard/stats/',
    REQUESTS: '/api/v1/officer/requests/',
    CITIZEN_MANAGEMENT: '/api/v1/officer/citizen-management/',
    PROFILE: '/api/v1/officer/profile/',
    PROCESS_REQUEST: '/api/v1/officer/process-request/',
    DOCUMENTS: '/api/v1/officer/documents/'
  },
  CHAIRMAN: {
    DASHBOARD: '/api/v1/chairman/dashboard/stats/',
    OFFICER_APPROVAL: '/api/v1/chairman/officer-approval/',
    OFFICER_MANAGEMENT: '/api/v1/chairman/officer-management/',
    IMPORTANT_DOCUMENTS: '/api/v1/chairman/important-documents/',
    REPORTS: '/api/v1/chairman/reports/'
  },
  PUBLIC: {
    VERIFY_DOCUMENT: '/api/v1/public/verify-document/'
  }
};

/**
 * Các tùy chọn cho dropdown
 */
export const DROPDOWN_OPTIONS = {
  GENDER: [
    { value: 'male', label: 'Nam' },
    { value: 'female', label: 'Nữ' },
    { value: 'other', label: 'Khác' }
  ],
  DOCUMENT_TYPE: [
    { value: DocumentType.RESIDENCE_CERT, label: 'Giấy xác nhận cư trú' },
    { value: DocumentType.BIRTH_CERT, label: 'Giấy khai sinh' },
    { value: DocumentType.MARRIAGE_CERT, label: 'Giấy đăng ký kết hôn' },
    { value: DocumentType.DEATH_CERT, label: 'Giấy chứng tử' },
    { value: DocumentType.LAND_CERT, label: 'Giấy chứng nhận quyền sử dụng đất' },
    { value: DocumentType.BUSINESS_CERT, label: 'Giấy phép kinh doanh' },
    { value: DocumentType.POVERTY_CERT, label: 'Giấy xác nhận hộ nghèo' },
    { value: DocumentType.JUDICIAL_RECORD, label: 'Lý lịch tư pháp' },
    { value: DocumentType.FAMILY_BOOK, label: 'Sổ hộ khẩu' }
  ],
  REQUEST_STATUS: [
    { value: RequestStatus.PENDING, label: 'Chờ xử lý' },
    { value: RequestStatus.PROCESSING, label: 'Đang xử lý' },
    { value: RequestStatus.APPROVED, label: 'Đã duyệt' },
    { value: RequestStatus.REJECTED, label: 'Từ chối' },
    { value: RequestStatus.COMPLETED, label: 'Hoàn thành' },
    { value: RequestStatus.CANCELLED, label: 'Đã hủy' }
  ]
};

/**
 * Các cài đặt chung của ứng dụng
 */
export const APP_SETTINGS = {
  PAGE_SIZE: 10,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'],
  TOKEN_EXPIRY_DAYS: 7,
  DATE_FORMAT: 'DD/MM/YYYY',
  DATETIME_FORMAT: 'DD/MM/YYYY HH:mm'
};

/**
 * Các thông báo lỗi chung
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại sau.',
  AUTHENTICATION_REQUIRED: 'Bạn cần đăng nhập để thực hiện thao tác này.',
  PERMISSION_DENIED: 'Bạn không có quyền thực hiện thao tác này.',
  SERVER_ERROR: 'Đã xảy ra lỗi từ máy chủ. Vui lòng thử lại sau.',
  VALIDATION_ERROR: 'Vui lòng kiểm tra lại thông tin đã nhập.',
  FILE_TOO_LARGE: `Kích thước file không được vượt quá ${APP_SETTINGS.MAX_FILE_SIZE / (1024 * 1024)}MB.`,
  INVALID_FILE_TYPE: `Định dạng file không được hỗ trợ. Chỉ chấp nhận ${APP_SETTINGS.ALLOWED_FILE_TYPES.join(', ')}.`
};

export default {
  UserRole,
  RequestStatus,
  DocumentStatus,
  DocumentType,
  API_ENDPOINTS,
  DROPDOWN_OPTIONS,
  APP_SETTINGS,
  ERROR_MESSAGES
}; 