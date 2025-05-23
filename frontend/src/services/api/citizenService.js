import axios from 'axios';

// API base URL - có thể cấu hình dựa trên môi trường
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

// Tạo instance axios với cấu hình mặc định
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 giây timeout
});

// Thêm interceptor cho request để thêm token xác thực
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Thêm interceptor cho response để xử lý lỗi thông dụng
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Xử lý các lỗi phổ biến (401, 403, 500, v.v.)
    if (error.response) {
      if (error.response.status === 401) {
        // Không được phép - chuyển hướng tới trang đăng nhập
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Service cho API của công dân
 */
const citizenService = {
  /**
   * Lấy thống kê dashboard cho công dân
   * @returns {Promise} Promise với dữ liệu thống kê dashboard
   */
  getDashboardStats: async () => {
    const response = await apiClient.get('/citizen/dashboard/stats/');
    return response.data;
  },

  /**
   * Lấy thông tin hồ sơ công dân
   * @returns {Promise} Promise với dữ liệu hồ sơ công dân
   */
  getProfile: async () => {
    const response = await apiClient.get('/auth/user/');
    return response.data;
  },

  /**
   * Cập nhật hồ sơ công dân
   * @param {Object} profileData - Dữ liệu hồ sơ cần cập nhật
   * @returns {Promise} Promise với dữ liệu hồ sơ đã cập nhật
   */
  updateProfile: async (profileData) => {
    const response = await apiClient.patch('/auth/user/', profileData);
    return response.data;
  },

  /**
   * Lấy yêu cầu của công dân với bộ lọc và phân trang
   * @param {Object} options - Các tùy chọn như page, limit, search, status, sort, order
   * @returns {Promise} Promise với danh sách yêu cầu đã phân trang
   */
  getRequests: async (options = {}) => {
    const { page = 1, limit = 10, search = '', status, sort = 'requestDate', order = 'desc' } = options;
    
    // Convert to params object for API request
    const params = {
      page: page,
      limit: limit,
      search: search,
      ordering: `${order === 'desc' ? '-' : ''}${sort}`
    };
    
    // Add status filter if provided
    if (status && status !== 'all') {
      params.status = status;
    }
    
    try {
      const response = await apiClient.get('/citizen/requests/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching requests:', error);
      // Return empty data structure to prevent UI errors
      return {
        results: [],
        count: 0,
        stats: {
          all: 0,
          pending: 0,
          processing: 0,
          completed: 0,
          rejected: 0
        }
      };
    }
  },

  /**
   * Lấy chi tiết một yêu cầu cụ thể
   * @param {string} requestId - ID của yêu cầu
   * @returns {Promise} Promise với chi tiết yêu cầu
   */
  getRequestDetails: async (requestId) => {
    const response = await apiClient.get(`/citizen/requests/${requestId}/`);
    return response.data;
  },

  /**
   * Tạo một yêu cầu mới
   * @param {Object} requestData - Dữ liệu yêu cầu
   * @returns {Promise} Promise với yêu cầu đã tạo
   */
  createRequest: async (requestData) => {
    const response = await apiClient.post('/citizen/requests/', requestData);
    return response.data;
  },

  /**
   * Hủy một yêu cầu
   * @param {string} requestId - ID của yêu cầu cần hủy
   * @returns {Promise} Promise với yêu cầu đã cập nhật
   */
  cancelRequest: async (requestId) => {
    const response = await apiClient.post(`/citizen/requests/${requestId}/cancel/`);
    return response.data;
  },

  /**
   * Lấy danh sách giấy tờ của công dân
   * @param {number} page - Số trang (bắt đầu từ 1)
   * @param {Object} filters - Các bộ lọc
   * @param {Object} sort - Tùy chọn sắp xếp
   * @returns {Promise} Promise với danh sách giấy tờ đã phân trang
   */
  getDocuments: async (page = 1, filters = {}, sort = {}) => {
    const params = {
      page,
      ...filters,
      ordering: sort.field ? `${sort.direction === 'desc' ? '-' : ''}${sort.field}` : '-created_at'
    };
    
    const response = await apiClient.get('/citizen/documents/', { params });
    return response.data;
  },

  /**
   * Lấy chi tiết một giấy tờ
   * @param {string} documentId - ID của giấy tờ
   * @returns {Promise} Promise với chi tiết giấy tờ
   */
  getDocumentDetails: async (documentId) => {
    const response = await apiClient.get(`/citizen/documents/${documentId}/`);
    return response.data;
  },
  
  /**
   * Tải xuống giấy tờ
   * @param {string} documentId - ID của giấy tờ
   * @returns {Promise} Promise với blob dữ liệu giấy tờ
   */
  downloadDocument: async (documentId) => {
    const response = await apiClient.get(`/citizen/documents/${documentId}/download/`, {
      responseType: 'blob'
    });
    return response.data;
  },
  
  /**
   * Xác thực giấy tờ trên blockchain
   * @param {string} documentId - ID của giấy tờ
   * @returns {Promise} Promise với thông tin xác thực
   */
  verifyDocument: async (documentId) => {
    const response = await apiClient.get(`/citizen/documents/${documentId}/verify/`);
    return response.data;
  },

  /**
   * Gửi phản hồi
   * @param {Object} feedbackData - Dữ liệu phản hồi
   * @returns {Promise} Promise với xác nhận phản hồi
   */
  submitFeedback: async (feedbackData) => {
    const response = await apiClient.post('/citizen/feedback/', feedbackData);
    return response.data;
  }
};

export default citizenService; 