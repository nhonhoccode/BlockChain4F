import { API_ENDPOINTS, get, post, put } from '../../utils/api';

// API service cho công dân - không sử dụng mockdata
const citizenService = {
  /**
   * Lấy dữ liệu dashboard của công dân
   * @returns {Promise<Object>} Dữ liệu dashboard
   */
  getDashboardData: async () => {
    try {
      // Call real API
      const response = await get(API_ENDPOINTS.CITIZEN.DASHBOARD);
      console.log('Dashboard data from API:', response);
      return response;
    } catch (error) {
      console.error('Error fetching citizen dashboard data:', error);
      throw error; // Re-throw error to be handled by component
    }
  },
  
  /**
   * Lấy danh sách yêu cầu của công dân
   * @param {Object} filters - Optional filter parameters
   * @returns {Promise<Array>} Danh sách yêu cầu
   */
  getRequests: async (filters = {}) => {
    try {
      // Call real API
      const response = await get(API_ENDPOINTS.CITIZEN.REQUESTS, filters);
      return response;
    } catch (error) {
      console.error('Error fetching citizen requests:', error);
      throw error; // Re-throw error to be handled by component
    }
  },
  
  /**
   * Lấy chi tiết yêu cầu theo ID
   * @param {string} requestId - ID của yêu cầu
   * @returns {Promise<Object>} Thông tin chi tiết yêu cầu
   */
  getRequestDetail: async (requestId) => {
    try {
      const response = await get(API_ENDPOINTS.CITIZEN.REQUEST_DETAIL(requestId));
      return response;
    } catch (error) {
      console.error(`Error fetching request detail for ID ${requestId}:`, error);
      throw error; // Re-throw error to be handled by component
    }
  },
  
  /**
   * Tạo yêu cầu mới
   * @param {Object} requestData - Dữ liệu yêu cầu
   * @returns {Promise<Object>} Kết quả tạo yêu cầu
   */
  createRequest: async (requestData) => {
    try {
      const response = await post(API_ENDPOINTS.CITIZEN.REQUESTS, requestData);
      return response;
    } catch (error) {
      console.error('Error creating request:', error);
      throw error;
    }
  },
  
  /**
   * Hủy yêu cầu
   * @param {string} requestId - ID của yêu cầu
   * @returns {Promise<Object>} Kết quả hủy yêu cầu
   */
  cancelRequest: async (requestId) => {
    try {
      const response = await post(API_ENDPOINTS.CITIZEN.CANCEL_REQUEST(requestId));
      return response;
    } catch (error) {
      console.error(`Error canceling request ID ${requestId}:`, error);
      throw error;
    }
  },
  
  /**
   * Lấy danh sách giấy tờ đã cấp
   * @returns {Promise<Array>} Danh sách giấy tờ
   */
  getDocuments: async () => {
    try {
      const response = await get(API_ENDPOINTS.CITIZEN.DOCUMENTS);
      return response;
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error; // Re-throw error to be handled by component
    }
  },
  
  /**
   * Lấy chi tiết giấy tờ theo ID
   * @param {string} documentId - ID của giấy tờ
   * @returns {Promise<Object>} Thông tin chi tiết giấy tờ
   */
  getDocumentDetail: async (documentId) => {
    try {
      const response = await get(API_ENDPOINTS.CITIZEN.DOCUMENT_DETAIL(documentId));
      return response;
    } catch (error) {
      console.error(`Error fetching document detail for ID ${documentId}:`, error);
      throw error; // Re-throw error to be handled by component
    }
  },
  
  /**
   * Lấy thông tin cá nhân của người dân
   * @returns {Promise<Object>} Thông tin cá nhân
   */
  getProfile: async () => {
    try {
      const response = await get(API_ENDPOINTS.CITIZEN.PROFILE);
      return response;
    } catch (error) {
      console.error('Error fetching citizen profile:', error);
      throw error;
    }
  },
  
  /**
   * Cập nhật thông tin cá nhân
   * @param {Object} profileData - Dữ liệu cá nhân
   * @returns {Promise<Object>} Thông tin cá nhân đã cập nhật
   */
  updateProfile: async (profileData) => {
    try {
      const response = await put(API_ENDPOINTS.CITIZEN.PROFILE, profileData);
      return response;
    } catch (error) {
      console.error('Error updating citizen profile:', error);
      throw error;
    }
  },
  
  /**
   * Gửi phản hồi 
   * @param {Object} feedbackData - Dữ liệu phản hồi
   * @returns {Promise<Object>} Kết quả gửi phản hồi
   */
  submitFeedback: async (feedbackData) => {
    try {
      const response = await post(API_ENDPOINTS.CITIZEN.FEEDBACK, feedbackData);
      return response;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  }
};

export default citizenService; 