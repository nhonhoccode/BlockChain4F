import axios from 'axios';

// Simple AppError implementation
class AppError extends Error {
  constructor(code, message, details) {
    super(message);
    this.code = code;
    this.name = 'AppError';
    this.details = details;
  }
}

// Create a basic axios instance for API calls
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor to include auth token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

/**
 * Service quản lý thông báo người dùng
 */
const notificationService = {
  /**
   * Lấy danh sách thông báo của người dùng hiện tại
   * @returns Danh sách thông báo
   */
  getNotifications: async () => {
    try {
      const response = await api.get('/api/v1/notifications/');
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error instanceof AppError 
        ? error 
        : new AppError('get_notifications_failed', 'Không thể lấy danh sách thông báo. Vui lòng thử lại sau.');
    }
  },

  /**
   * Đánh dấu thông báo đã đọc
   * @param notificationId ID của thông báo
   * @returns Kết quả
   */
  markAsRead: async (notificationId) => {
    try {
      const response = await api.post(
        `/api/v1/notifications/${notificationId}/mark-read/`
      );
      return response.data;
    } catch (error) {
      console.error(`Error marking notification (ID: ${notificationId}) as read:`, error);
      throw error instanceof AppError 
        ? error 
        : new AppError('mark_notification_failed', 'Không thể đánh dấu thông báo đã đọc. Vui lòng thử lại sau.');
    }
  },

  /**
   * Đánh dấu tất cả thông báo đã đọc
   * @returns Kết quả
   */
  markAllAsRead: async () => {
    try {
      const response = await api.post('/api/v1/notifications/mark-all-read/');
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error instanceof AppError 
        ? error 
        : new AppError('mark_all_notifications_failed', 'Không thể đánh dấu tất cả thông báo đã đọc. Vui lòng thử lại sau.');
    }
  },

  /**
   * Xóa một thông báo
   * @param notificationId ID của thông báo
   * @returns Kết quả
   */
  deleteNotification: async (notificationId) => {
    try {
      const response = await api.delete(`/api/v1/notifications/${notificationId}/`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting notification (ID: ${notificationId}):`, error);
      throw error instanceof AppError 
        ? error 
        : new AppError('delete_notification_failed', 'Không thể xóa thông báo. Vui lòng thử lại sau.');
    }
  },

  /**
   * Xóa tất cả thông báo
   * @returns Kết quả
   */
  deleteAllNotifications: async () => {
    try {
      const response = await api.delete('/api/v1/notifications/');
      return response.data;
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      throw error instanceof AppError 
        ? error 
        : new AppError('delete_all_notifications_failed', 'Không thể xóa tất cả thông báo. Vui lòng thử lại sau.');
    }
  }
};

export default notificationService; 