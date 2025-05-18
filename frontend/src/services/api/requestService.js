import { api } from '../../utils/api';

/**
 * Service quản lý yêu cầu giấy tờ
 */
const requestService = {
  /**
   * Lấy danh sách yêu cầu
   * @param {Object} params - Tham số tìm kiếm và phân trang
   * @returns {Promise<Object>} Danh sách yêu cầu
   */
  getRequests: async (params = {}) => {
    return await api.get('/api/v1/requests/', { params });
  },

  /**
   * Lấy chi tiết yêu cầu
   * @param {number} requestId - ID của yêu cầu
   * @returns {Promise<Object>} Chi tiết yêu cầu
   */
  getRequestDetail: async (requestId) => {
    return await api.get(`/api/v1/requests/${requestId}/`);
  },

  /**
   * Tạo yêu cầu mới
   * @param {Object} requestData - Dữ liệu yêu cầu
   * @returns {Promise<Object>} Yêu cầu mới tạo
   */
  createRequest: async (requestData) => {
    return await api.post('/api/v1/requests/', requestData);
  },

  /**
   * Cập nhật yêu cầu
   * @param {number} requestId - ID của yêu cầu
   * @param {Object} requestData - Dữ liệu cập nhật
   * @returns {Promise<Object>} Yêu cầu sau khi cập nhật
   */
  updateRequest: async (requestId, requestData) => {
    return await api.put(`/api/v1/requests/${requestId}/`, requestData);
  },

  /**
   * Xóa yêu cầu
   * @param {number} requestId - ID của yêu cầu
   * @returns {Promise<Object>} Kết quả xóa
   */
  deleteRequest: async (requestId) => {
    return await api.delete(`/api/v1/requests/${requestId}/`);
  },

  /**
   * Phê duyệt yêu cầu
   * @param {number} requestId - ID của yêu cầu
   * @param {Object} approvalData - Dữ liệu phê duyệt
   * @returns {Promise<Object>} Kết quả phê duyệt
   */
  approveRequest: async (requestId, approvalData) => {
    return await api.post(`/api/v1/requests/${requestId}/approve/`, approvalData);
  },

  /**
   * Từ chối yêu cầu
   * @param {number} requestId - ID của yêu cầu
   * @param {Object} rejectionData - Dữ liệu từ chối
   * @returns {Promise<Object>} Kết quả từ chối
   */
  rejectRequest: async (requestId, rejectionData) => {
    return await api.post(`/api/v1/requests/${requestId}/reject/`, rejectionData);
  },

  /**
   * Gán yêu cầu cho cán bộ xã
   * @param {number} requestId - ID của yêu cầu
   * @param {Object} assignmentData - Dữ liệu gán (officer_id)
   * @returns {Promise<Object>} Kết quả gán
   */
  assignRequest: async (requestId, assignmentData) => {
    return await api.post(`/api/v1/requests/${requestId}/assign/`, assignmentData);
  },

  /**
   * Lấy danh sách yêu cầu đang chờ xử lý
   * @param {Object} params - Tham số tìm kiếm và phân trang
   * @returns {Promise<Object>} Danh sách yêu cầu
   */
  getPendingRequests: async (params = {}) => {
    return await api.get('/api/v1/requests/pending/', { params });
  },

  /**
   * Lấy danh sách yêu cầu đã xử lý
   * @param {Object} params - Tham số tìm kiếm và phân trang
   * @returns {Promise<Object>} Danh sách yêu cầu
   */
  getCompletedRequests: async (params = {}) => {
    return await api.get('/api/v1/requests/completed/', { params });
  },

  /**
   * Lấy danh sách yêu cầu đã bị từ chối
   * @param {Object} params - Tham số tìm kiếm và phân trang
   * @returns {Promise<Object>} Danh sách yêu cầu
   */
  getRejectedRequests: async (params = {}) => {
    return await api.get('/api/v1/requests/rejected/', { params });
  },

  /**
   * Lấy lịch sử xử lý yêu cầu
   * @param {number} requestId - ID của yêu cầu
   * @returns {Promise<Object>} Lịch sử xử lý
   */
  getRequestHistory: async (requestId) => {
    return await api.get(`/api/v1/requests/${requestId}/history/`);
  },

  /**
   * Tạo giấy tờ từ yêu cầu
   * @param {number} requestId - ID của yêu cầu
   * @param {Object} documentData - Dữ liệu giấy tờ
   * @returns {Promise<Object>} Giấy tờ mới tạo
   */
  createDocumentFromRequest: async (requestId, documentData) => {
    return await api.post(`/api/v1/requests/${requestId}/create-document/`, documentData);
  },

  /**
   * Lấy thống kê yêu cầu
   * @param {Object} params - Tham số thống kê (time_range, status)
   * @returns {Promise<Object>} Dữ liệu thống kê
   */
  getRequestStats: async (params = {}) => {
    return await api.get('/api/v1/requests/stats/', { params });
  }
};

export default requestService;
