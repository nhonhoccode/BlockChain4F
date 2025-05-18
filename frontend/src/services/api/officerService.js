import { API_ENDPOINTS, get, post, put } from '../../utils/api';

// API service cho cán bộ xã - không sử dụng mockdata
const officerService = {
  /**
   * Lấy dữ liệu dashboard của cán bộ
   * @returns {Promise<Object>} Dữ liệu dashboard
   */
  getDashboardData: async () => {
    try {
      // Call real API
      const response = await get(API_ENDPOINTS.OFFICER.DASHBOARD);
      console.log('Officer dashboard data from API:', response);
      return response;
    } catch (error) {
      console.error('Error fetching officer dashboard data:', error);
      throw error; // Re-throw error to be handled by component
    }
  },
  
  /**
   * Lấy danh sách yêu cầu đang chờ xử lý
   * @param {Object} filters - Optional filter parameters
   * @returns {Promise<Array>} Danh sách yêu cầu
   */
  getPendingRequests: async (filters = {}) => {
    try {
      // Call real API
      const response = await get(API_ENDPOINTS.OFFICER.PENDING_REQUESTS, filters);
      return response;
    } catch (error) {
      console.error('Error fetching pending requests:', error);
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
      const response = await get(API_ENDPOINTS.OFFICER.REQUEST_DETAIL(requestId));
      return response;
    } catch (error) {
      console.error(`Error fetching request detail for ID ${requestId}:`, error);
      throw error; // Re-throw error to be handled by component
    }
  },
  
  /**
   * Tự phân công xử lý yêu cầu
   * @param {string} requestId - ID của yêu cầu
   * @returns {Promise<Object>} Kết quả nhận yêu cầu
   */
  assignToSelf: async (requestId) => {
    try {
      const response = await post(API_ENDPOINTS.OFFICER.ASSIGN_TO_SELF(requestId));
      return response;
    } catch (error) {
      console.error(`Error assigning request ID ${requestId} to self:`, error);
      throw error;
    }
  },
  
  /**
   * Xử lý yêu cầu
   * @param {string} requestId - ID của yêu cầu
   * @param {Object} processData - Dữ liệu xử lý
   * @returns {Promise<Object>} Kết quả xử lý
   */
  processRequest: async (requestId, processData) => {
    try {
      const response = await post(API_ENDPOINTS.OFFICER.PROCESS_REQUEST(requestId), processData);
      return response;
    } catch (error) {
      console.error(`Error processing request ID ${requestId}:`, error);
      throw error;
    }
  },
  
  /**
   * Từ chối yêu cầu
   * @param {string} requestId - ID của yêu cầu
   * @param {Object} rejectData - Dữ liệu từ chối
   * @returns {Promise<Object>} Kết quả từ chối
   */
  rejectRequest: async (requestId, rejectData) => {
    try {
      const response = await post(API_ENDPOINTS.OFFICER.REJECT_REQUEST(requestId), rejectData);
      return response;
    } catch (error) {
      console.error(`Error rejecting request ID ${requestId}:`, error);
      throw error;
    }
  },
  
  /**
   * Lấy danh sách công dân
   * @param {Object} filters - Optional filter parameters
   * @returns {Promise<Array>} Danh sách công dân
   */
  getCitizens: async (filters = {}) => {
    try {
      // Call real API
      const response = await get(API_ENDPOINTS.OFFICER.CITIZENS, filters);
      return response;
    } catch (error) {
      console.error('Error fetching citizens list:', error);
      throw error; // Re-throw error to be handled by component
    }
  },
  
  /**
   * Lấy chi tiết công dân theo ID
   * @param {string} citizenId - ID của công dân
   * @returns {Promise<Object>} Thông tin chi tiết công dân
   */
  getCitizenDetail: async (citizenId) => {
    try {
      const response = await get(API_ENDPOINTS.OFFICER.CITIZEN_DETAIL(citizenId));
      return response;
    } catch (error) {
      console.error(`Error fetching citizen detail for ID ${citizenId}:`, error);
      throw error; // Re-throw error to be handled by component
    }
  },
  
  /**
   * Lấy thông tin cá nhân của cán bộ
   * @returns {Promise<Object>} Thông tin cá nhân
   */
  getProfile: async () => {
    try {
      const response = await get(API_ENDPOINTS.OFFICER.PROFILE);
      return response;
    } catch (error) {
      console.error('Error fetching officer profile:', error);
      throw error;
    }
  },
  
  /**
   * Cập nhật thông tin cá nhân
   * @param {Object} profileData - Dữ liệu cá nhân
   * @returns {Promise<Object>} Kết quả cập nhật
   */
  updateProfile: async (profileData) => {
    try {
      const response = await put(API_ENDPOINTS.OFFICER.PROFILE, profileData);
      return response;
    } catch (error) {
      console.error('Error updating officer profile:', error);
      throw error;
    }
  },
  
  /**
   * Lấy thống kê
   * @returns {Promise<Object>} Dữ liệu thống kê
   */
  getStatistics: async () => {
    try {
      const response = await get(API_ENDPOINTS.OFFICER.STATISTICS);
      return response;
    } catch (error) {
      console.error('Error fetching officer statistics:', error);
      throw error; // Re-throw error to be handled by component
    }
  }
};

export default officerService; 