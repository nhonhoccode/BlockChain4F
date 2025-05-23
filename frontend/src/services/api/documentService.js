import { api } from '../../utils/api';

/**
 * Service xử lý các API liên quan đến giấy tờ
 */
const documentService = {
  /**
   * Lấy danh sách loại giấy tờ
   * @returns {Promise<Object>} Danh sách loại giấy tờ
   */
  getDocumentTypes: async () => {
    return await api.get('/api/v1/document-types/');
  },

  /**
   * Lấy danh sách giấy tờ của người dùng
   * @param {Object} filters - Bộ lọc
   * @returns {Promise<Object>} Danh sách giấy tờ
   */
  getUserDocuments: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    if (filters.type) {
      queryParams.append('type', filters.type);
    }
    
    if (filters.status) {
      queryParams.append('status', filters.status);
    }
    
    if (filters.search) {
      queryParams.append('search', filters.search);
    }
    
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return await api.get(`/api/v1/documents${query}`);
  },

  /**
   * Lấy thông tin chi tiết giấy tờ
   * @param {number} documentId - ID của giấy tờ
   * @returns {Promise<Object>} Thông tin chi tiết giấy tờ
   */
  getDocumentById: async (documentId) => {
    return await api.get(`/api/v1/documents/${documentId}/`);
  },

  /**
   * Tạo yêu cầu cấp giấy tờ mới
   * @param {Object} requestData - Dữ liệu yêu cầu
   * @returns {Promise<Object>} Thông tin yêu cầu mới
   */
  createDocumentRequest: async (requestData) => {
    const formData = new FormData();
    
    // Thêm các trường cơ bản
    Object.keys(requestData).forEach(key => {
      if (key !== 'attachments') {
        formData.append(key, requestData[key]);
      }
    });
    
    // Thêm các tệp đính kèm
    if (requestData.attachments && requestData.attachments.length > 0) {
      requestData.attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file);
      });
    }
    
    return await api.post('/api/v1/document-requests/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  /**
   * Cập nhật yêu cầu cấp giấy tờ
   * @param {number} requestId - ID của yêu cầu
   * @param {Object} requestData - Dữ liệu cần cập nhật
   * @returns {Promise<Object>} Thông tin yêu cầu sau khi cập nhật
   */
  updateDocumentRequest: async (requestId, requestData) => {
    if (requestData.attachments && requestData.attachments.length > 0) {
      const formData = new FormData();
      
      Object.keys(requestData).forEach(key => {
        if (key !== 'attachments') {
          formData.append(key, requestData[key]);
        }
      });
      
      requestData.attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file);
      });
      
      return await api.put(`/api/v1/document-requests/${requestId}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } else {
      return await api.put(`/api/v1/document-requests/${requestId}/`, requestData);
    }
  },

  /**
   * Xác minh giấy tờ bằng mã blockchain
   * @param {string} verificationCode - Mã xác minh
   * @returns {Promise<Object>} Kết quả xác minh
   */
  verifyDocument: async (verificationCode) => {
    return await api.get(`/api/v1/documents/verify/?code=${verificationCode}`);
  },
  
  /**
   * Tải xuống giấy tờ
   * @param {number} documentId - ID của giấy tờ
   * @returns {Promise<Blob>} File giấy tờ dạng blob
   */
  downloadDocument: async (documentId) => {
    return await api.get(`/api/v1/documents/${documentId}/download/`, {
      responseType: 'blob'
    });
  },
  
  /**
   * Lấy lịch sử giấy tờ trên blockchain
   * @param {number} documentId - ID của giấy tờ
   * @returns {Promise<Object>} Lịch sử giấy tờ
   */
  getDocumentHistory: async (documentId) => {
    return await api.get(`/api/v1/documents/${documentId}/history/`);
  },
  
  /**
   * Lấy danh sách tài liệu đính kèm của giấy tờ
   * @param {number} documentId - ID của giấy tờ
   * @returns {Promise<Object>} Danh sách tài liệu đính kèm
   */
  getDocumentAttachments: async (documentId) => {
    return await api.get(`/api/v1/documents/${documentId}/attachments/`);
  },
  
  /**
   * Tải xuống tài liệu đính kèm
   * @param {number} attachmentId - ID của tài liệu đính kèm
   * @returns {Promise<Blob>} File tài liệu đính kèm dạng blob
   */
  downloadAttachment: async (attachmentId) => {
    return await api.get(`/api/v1/attachments/${attachmentId}/download/`, {
      responseType: 'blob'
    });
  }
};

export default documentService;
