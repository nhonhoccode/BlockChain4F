import { API_ENDPOINTS, get, post, put } from '../../utils/api';

// API service cho chủ tịch xã - không sử dụng mockdata
const chairmanService = {
  /**
   * Lấy dữ liệu dashboard của chủ tịch
   * @returns {Promise<Object>} Dữ liệu dashboard
   */
  getDashboardData: async () => {
    try {
      // Call real API
      const response = await get(API_ENDPOINTS.CHAIRMAN.DASHBOARD);
      console.log('Chairman dashboard data from API:', response);
      return response;
    } catch (error) {
      console.error('Error fetching chairman dashboard data:', error);
      throw error; // Re-throw error to be handled by component
    }
  },
  
  /**
   * Lấy danh sách cán bộ chờ phê duyệt
   * @param {Object} filters - Optional filter parameters
   * @returns {Promise<Array>} Danh sách cán bộ chờ phê duyệt
   */
  getOfficerApprovals: async (filters = {}) => {
    try {
      // Gọi API thực tế với các tham số lọc
      const response = await get(API_ENDPOINTS.CHAIRMAN.OFFICER_APPROVALS, filters);
      return response;
    } catch (error) {
      console.error('Error fetching officer approvals:', error);
      throw error; // Re-throw error to be handled by component
    }
  },
  
  /**
   * Lấy chi tiết phê duyệt cán bộ theo ID
   * @param {string} approvalId - ID của phê duyệt cán bộ
   * @returns {Promise<Object>} Chi tiết phê duyệt
   */
  getOfficerApprovalDetails: async (approvalId) => {
    try {
      // Gọi API thực tế với ID phê duyệt
      const response = await get(API_ENDPOINTS.CHAIRMAN.OFFICER_APPROVAL_DETAIL(approvalId));
      return response;
    } catch (error) {
      console.error(`Error fetching officer approval details for ID ${approvalId}:`, error);
      throw error;
    }
  },
  
  /**
   * Phê duyệt cán bộ xã
   * @param {string} approvalId - ID của phê duyệt cán bộ
   * @param {Object} approvalData - Dữ liệu phê duyệt
   * @returns {Promise<Object>} Kết quả phê duyệt
   */
  approveOfficer: async (approvalId, approvalData = {}) => {
    try {
      // Gọi API POST để phê duyệt cán bộ
      const response = await post(API_ENDPOINTS.CHAIRMAN.APPROVE_OFFICER(approvalId), approvalData);
      return response;
    } catch (error) {
      console.error(`Error approving officer for approval ID ${approvalId}:`, error);
      throw error;
    }
  },
  
  /**
   * Từ chối phê duyệt cán bộ xã
   * @param {string} approvalId - ID của phê duyệt cán bộ
   * @param {Object} rejectionData - Dữ liệu từ chối (lý do, ghi chú)
   * @returns {Promise<Object>} Kết quả từ chối
   */
  rejectOfficer: async (approvalId, rejectionData) => {
    try {
      // Gọi API POST để từ chối phê duyệt cán bộ
      const response = await post(API_ENDPOINTS.CHAIRMAN.REJECT_OFFICER(approvalId), rejectionData);
      return response;
    } catch (error) {
      console.error(`Error rejecting officer for approval ID ${approvalId}:`, error);
      throw error;
    }
  },
  
  /**
   * Lấy danh sách cán bộ đã được phê duyệt
   * @param {Object} filters - Optional filter parameters
   * @returns {Promise<Array>} Danh sách cán bộ
   */
  getOfficers: async (filters = {}) => {
    try {
      // Gọi API thực tế để lấy danh sách cán bộ
      const response = await get(API_ENDPOINTS.CHAIRMAN.OFFICERS, filters);
      return response;
    } catch (error) {
      console.error('Error fetching officers list:', error);
      throw error; // Re-throw error to be handled by component
    }
  },
  
  /**
   * Lấy thông tin chi tiết cán bộ
   * @param {string} officerId - ID của cán bộ
   * @returns {Promise<Object>} Thông tin cán bộ
   */
  getOfficerDetails: async (officerId) => {
    try {
      // Gọi API thực tế để lấy thông tin cán bộ
      const response = await get(API_ENDPOINTS.CHAIRMAN.OFFICER_DETAIL(officerId));
      return response;
    } catch (error) {
      console.error(`Error fetching officer details for ID ${officerId}:`, error);
      throw error;
    }
  },
  
  /**
   * Lấy danh sách giấy tờ quan trọng chờ phê duyệt
   * @param {Object} filters - Optional filter parameters
   * @returns {Promise<Array>} Danh sách giấy tờ
   */
  getImportantDocuments: async (filters = {}) => {
    try {
      // Gọi API thực tế để lấy danh sách giấy tờ quan trọng
      const response = await get(API_ENDPOINTS.CHAIRMAN.IMPORTANT_DOCUMENTS, filters);
      return response;
    } catch (error) {
      console.error('Error fetching important documents:', error);
      throw error; // Re-throw error to be handled by component
    }
  },
  
  /**
   * Lấy chi tiết giấy tờ quan trọng
   * @param {string} documentId - ID của giấy tờ
   * @returns {Promise<Object>} Chi tiết giấy tờ
   */
  getImportantDocumentDetails: async (documentId) => {
    try {
      // Gọi API thực tế để lấy chi tiết giấy tờ
      const response = await get(API_ENDPOINTS.CHAIRMAN.IMPORTANT_DOCUMENT_DETAIL(documentId));
      return response;
    } catch (error) {
      console.error(`Error fetching important document details for ID ${documentId}:`, error);
      throw error;
    }
  },
  
  /**
   * Phê duyệt giấy tờ quan trọng
   * @param {string} documentId - ID của giấy tờ
   * @param {Object} approvalData - Dữ liệu phê duyệt
   * @returns {Promise<Object>} Kết quả phê duyệt
   */
  approveDocument: async (documentId, approvalData = {}) => {
    try {
      // Gọi API POST để phê duyệt giấy tờ
      const response = await post(API_ENDPOINTS.CHAIRMAN.APPROVE_DOCUMENT(documentId), approvalData);
      return response;
    } catch (error) {
      console.error(`Error approving document ID ${documentId}:`, error);
      throw error;
    }
  },
  
  /**
   * Từ chối giấy tờ quan trọng
   * @param {string} documentId - ID của giấy tờ
   * @param {Object} rejectionData - Dữ liệu từ chối
   * @returns {Promise<Object>} Kết quả từ chối
   */
  rejectDocument: async (documentId, rejectionData) => {
    try {
      // Gọi API POST để từ chối giấy tờ
      const response = await post(API_ENDPOINTS.CHAIRMAN.REJECT_DOCUMENT(documentId), rejectionData);
      return response;
    } catch (error) {
      console.error(`Error rejecting document ID ${documentId}:`, error);
      throw error;
    }
  },
  
  /**
   * Lấy báo cáo và thống kê
   * @param {Object} filters - Tham số lọc báo cáo
   * @returns {Promise<Object>} Dữ liệu báo cáo
   */
  getReports: async (filters = {}) => {
    try {
      // Gọi API thực tế để lấy báo cáo
      const response = await get(API_ENDPOINTS.CHAIRMAN.REPORTS, filters);
      return response;
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error; // Re-throw error to be handled by component
    }
  },
  
  /**
   * Lấy thông tin cá nhân của chủ tịch xã
   * @returns {Promise<Object>} Thông tin cá nhân
   */
  getProfile: async () => {
    try {
      const response = await get(API_ENDPOINTS.CHAIRMAN.PROFILE);
      return response;
    } catch (error) {
      console.error('Error fetching chairman profile:', error);
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
      const response = await put(API_ENDPOINTS.CHAIRMAN.PROFILE, profileData);
      return response;
    } catch (error) {
      console.error('Error updating chairman profile:', error);
      throw error;
    }
  }
};

export default chairmanService; 