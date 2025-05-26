import axios from 'axios';

// API base URL - có thể cấu hình dựa trên môi trường
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Tạo instance axios với cấu hình mặc định
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 giây timeout
});

// Thêm interceptor để tự động thêm token xác thực
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Token ${token}`;
    }
    console.log('Sending request to:', config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
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

// Helper function to map frontend feedback type to backend feedback_type
const mapFeedbackType = (category, type) => {
  // Backend expects: 'suggestion', 'complaint', 'question', 'bug_report', 'other'
  
  // Map based on category
  const categoryMap = {
    'service': type === 'positive' ? 'suggestion' : 'complaint',
    'website': type === 'negative' ? 'bug_report' : 'suggestion',
    'system': type === 'negative' ? 'bug_report' : 'suggestion',
    'officers': type === 'positive' ? 'suggestion' : 'complaint',
    'process': 'suggestion',
    'other': 'other'
  };
  
  // Use the mapping or default to 'suggestion'
  return category ? categoryMap[category] || 'suggestion' : 'suggestion';
};

/**
 * Service cho API của công dân
 */
const citizenService = {
  /**
   * Lấy danh sách các loại thủ tục hành chính
   * @returns {Promise} Promise với danh sách các loại thủ tục
   */
  getProcedureTypes: async () => {
    try {
      console.log('Fetching procedure types from API');
      // Try the citizen document-types endpoint first
      const response = await apiClient.get('/api/v1/citizen/document-types/');
      console.log('API response:', response);
      
      // Kiểm tra dữ liệu trả về
      if (!response.data) {
        console.warn('API trả về dữ liệu null hoặc undefined');
        return { results: [] }; // Trả về đối tượng với mảng results rỗng
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching procedure types from citizen endpoint:', error);
      
      // Try alternate endpoints if first one fails
      try {
        console.log('Trying officer endpoint for procedure types');
        const response = await apiClient.get('/api/v1/officer/document-types/');
        
        // Kiểm tra dữ liệu trả về từ endpoint thay thế
        if (!response.data) {
          console.warn('API thay thế trả về dữ liệu null hoặc undefined');
          return { results: [] }; // Trả về đối tượng với mảng results rỗng
        }
        
        return response.data;
      } catch (altError) {
        console.error('Error fetching from officer endpoint:', altError);
        
        // As a last resort, try the common endpoint
        try {
          console.log('Trying common endpoint for procedure types');
          const response = await apiClient.get('/api/v1/document-types/');
          
          if (!response.data) {
            console.warn('Common API endpoint trả về dữ liệu null hoặc undefined');
            return { results: [] };
          }
          
          return response.data;
        } catch (commonError) {
          console.error('Error fetching from common endpoint:', commonError);
          // Trả về một đối tượng với mảng rỗng để component có thể xử lý nhất quán
          return { results: [] };
        }
      }
    }
  },

  /**
   * Lấy thông tin thống kê dashboard cho công dân
   * @returns {Promise} Promise với dữ liệu thống kê
   */
  getDashboardStats: async () => {
    try {
      console.log('Fetching citizen dashboard stats...');
      const response = await apiClient.get('/api/v1/citizen/dashboard/stats/');
      console.log('Dashboard stats response:', response.data);
      
      // Check if we have data in the expected format
      if (response.data) {
        return response.data;
      } else {
        console.error('Unexpected response format from dashboard stats API:', response);
        throw new Error('Định dạng dữ liệu không hợp lệ');
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      
      // Fallback to alternative endpoint if the first one fails
      try {
        console.log('Trying alternate endpoint for dashboard stats');
        const alternateResponse = await apiClient.get('/api/citizen/dashboard/stats/');
        console.log('Alternate endpoint response:', alternateResponse.data);
        
        if (alternateResponse.data) {
          return alternateResponse.data;
        }
      } catch (altError) {
        console.error('Error fetching from alternate endpoint:', altError);
      }
      
      // If all else fails, throw the original error
      throw error;
    }
  },

  /**
   * Lấy danh sách yêu cầu hành chính của công dân
   * @param {number} page - Số trang (bắt đầu từ 1)
   * @param {number} limit - Số lượng kết quả trên mỗi trang
   * @param {string} search - Từ khóa tìm kiếm
   * @param {string} status - Trạng thái yêu cầu để lọc
   * @param {string} ordering - Cách sắp xếp kết quả
   * @param {string} type - Loại yêu cầu để lọc
   * @returns {Promise} Promise với danh sách yêu cầu đã phân trang
   */
  getRequests: async (page = 1, limit = 10, search = '', status = '', ordering = '-requestDate', type = '') => {
    const params = {
      page,
      limit,
      search,
      ordering
    };
    
    if (status && status !== 'all') {
      params.status = status;
    }
    
    if (type && type !== 'all') {
      params.type = type;
    }
    
    console.log('Sending request to:', `/api/v1/citizen/requests/`);
    console.log('With params:', params);
    
    try {
      const response = await apiClient.get('/api/v1/citizen/requests/', { params });
      console.log('API response:', response);
      
      // Check if response.data is already an array (some APIs might return this)
      if (Array.isArray(response.data)) {
        return {
          data: {
            results: response.data,
            count: response.data.length
          }
        };
      }
      
      // Return the standard response
      return response;
    } catch (error) {
      console.error('Error fetching requests:', error);
      
      // Try the secondary endpoint if the first fails
      try {
        console.log('Trying alternate endpoint for requests');
        const alternateResponse = await apiClient.get('/api/v1/requests/', { params });
        
        if (Array.isArray(alternateResponse.data)) {
          return {
            data: {
              results: alternateResponse.data,
              count: alternateResponse.data.length
            }
          };
        }
        
        return alternateResponse;
      } catch (altError) {
        console.error('Error fetching from alternate endpoint:', altError);
        throw altError;
      }
    }
  },

  /**
   * Lấy chi tiết một yêu cầu cụ thể
   * @param {string} requestId - ID của yêu cầu
   * @returns {Promise} Promise với chi tiết yêu cầu
   */
  getRequestDetails: async (requestId) => {
    try {
      console.log(`Fetching details for request ID: ${requestId}`);
      const response = await apiClient.get(`/api/v1/citizen/requests/${requestId}/`);
      console.log('Request details retrieved successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching request details:', error);
      
      let errorMessage = 'Không thể tải thông tin yêu cầu. Vui lòng thử lại sau.';
      
      if (error.response) {
        console.error('Error details:', error.response.data);
        console.error('Status code:', error.response.status);
        
        if (error.response.status === 404) {
          errorMessage = `Không tìm thấy yêu cầu với mã: ${requestId}`;
        } else if (error.response.status === 403) {
          errorMessage = 'Bạn không có quyền xem yêu cầu này.';
        } else if (error.response.data && error.response.data.detail) {
          errorMessage = error.response.data.detail;
        }
      }
      
      throw new Error(errorMessage);
    }
  },

  /**
   * Tạo một yêu cầu mới
   * @param {Object} requestData - Dữ liệu yêu cầu
   * @returns {Promise} Promise với yêu cầu đã tạo
   */
  createRequest: async (requestData) => {
    try {
      console.log('Creating new request with data:', requestData);
      
      // Chuyển đổi dữ liệu để tương thích với backend
      const modifiedData = { ...requestData };
      
      // Gửi cả hai trường để tăng khả năng thành công
      // Serializer sẽ đọc 'type' và ánh xạ tới 'document_type'
      // Chúng ta cũng gửi 'document_type' với hy vọng model sẽ sử dụng nó
      if (modifiedData.type) {
        modifiedData.document_type = modifiedData.type;
        // Giữ nguyên trường 'type'
      }
      
      // Loại bỏ các trường không cần thiết có thể gây ra lỗi
      ['contact_phone', 'contact_email', 'additional_info'].forEach(field => {
        if (modifiedData[field] === '') {
          delete modifiedData[field];
        }
      });
      
      // Thêm các trường có thể cần thiết cho model
      if (!modifiedData.reference_number) {
        modifiedData.reference_number = `REF-${Date.now()}`;
      }
      
      // Đảm bảo có trường title nếu không có
      if (!modifiedData.title && modifiedData.document_type) {
        modifiedData.title = `Yêu cầu ${modifiedData.document_type}`;
      }
      
      console.log('Modified request data for backend:', modifiedData);
      
      // Ensure Content-Type is application/json
      const response = await apiClient.post('/api/v1/citizen/requests/', modifiedData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Create request response:', response);
      return response.data;
    } catch (error) {
      console.error('Error creating request with primary endpoint:', error);
      if (error.response) {
        console.error('Error details:', error.response.data);
        console.error('Status code:', error.response.status);
        
        // Thêm thông tin lỗi chi tiết hơn
        if (error.response.status === 400) {
          const errorData = error.response.data;
          let errorDetails = '';
          
          // Xử lý lỗi dữ liệu validation
          if (typeof errorData === 'object') {
            // Trích xuất các thông báo lỗi cụ thể từ response
            errorDetails = Object.entries(errorData)
              .map(([field, errors]) => {
                if (Array.isArray(errors)) {
                  return `${field}: ${errors.join(', ')}`;
                } else if (typeof errors === 'string') {
                  return `${field}: ${errors}`;
                } else {
                  return `${field}: Dữ liệu không hợp lệ`;
                }
              })
              .join('; ');
          }
          
          throw new Error(`Lỗi dữ liệu: ${errorDetails || JSON.stringify(errorData)}`);
        } else if (error.response.status === 404) {
          throw new Error('Không tìm thấy API endpoint. Vui lòng kiểm tra cấu hình máy chủ.');
        } else if (error.response.status === 500) {
          throw new Error('Lỗi máy chủ. Vui lòng thử lại sau.');
        }
      }
      
      // Nếu không có response từ server (ví dụ: lỗi mạng)
      if (error.request && !error.response) {
        throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
      }
      
      throw error;
    }
  },

  /**
   * Thêm tệp đính kèm vào yêu cầu
   * @param {string} requestId - ID của yêu cầu
   * @param {FormData} formData - FormData chứa tệp đính kèm
   * @returns {Promise} Promise với kết quả tải lên
   */
  addRequestAttachment: async (requestId, formData) => {
    try {
      // Add attachment_type if not present
      if (!formData.has('attachment_type')) {
        formData.append('attachment_type', 'supporting_document');
      }
      
      // Add name if not present
      if (!formData.has('name')) {
        const fileName = formData.get('file')?.name || 'Document';
        formData.append('name', fileName);
      }
      
      // Log the complete form data for debugging
      console.log('Form data contents:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value instanceof File ? `File: ${value.name} (${value.size} bytes)` : value}`);
      }
      
      // Try primary endpoint
      console.log('Uploading attachment to primary endpoint');
      console.log('Request ID:', requestId);
      console.log('FormData contains files:', formData.has('file'));
      
      const response = await apiClient.post(`/api/v1/citizen/requests/${requestId}/attachments/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Attachment upload response:', response);
      return response.data;
    } catch (error) {
      console.error('Error uploading attachment to primary endpoint:', error);
      
      if (error.response) {
        console.error('Error details:', error.response.data);
        console.error('Status code:', error.response.status);
        
        if (error.response.status === 400) {
          const errorData = error.response.data;
          let errorMessage = 'Lỗi tải tệp đính kèm';
          
          if (typeof errorData === 'object') {
            const errorDetails = Object.entries(errorData)
              .map(([field, errors]) => {
                if (Array.isArray(errors)) {
                  return `${field}: ${errors.join(', ')}`;
                }
                return `${field}: ${errors}`;
              })
              .join('; ');
            
            errorMessage += `: ${errorDetails}`;
          } else if (typeof errorData === 'string') {
            errorMessage += `: ${errorData}`;
          }
          
          throw new Error(errorMessage);
        } else if (error.response.status === 404) {
          throw new Error(`Không tìm thấy yêu cầu với ID: ${requestId}`);
        }
      }
      
      throw error;
    }
  },

  /**
   * Hủy một yêu cầu
   * @param {string} requestId - ID của yêu cầu cần hủy
   * @returns {Promise} Promise với yêu cầu đã cập nhật
   */
  cancelRequest: async (requestId) => {
    try {
      console.log(`Attempting to cancel request with ID: ${requestId}`);
      
      const response = await apiClient.post(`/api/v1/citizen/requests/${requestId}/cancel/`);
      console.log('Request cancelled successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error cancelling request:', error);
      
      let errorMessage = 'Không thể hủy yêu cầu. Vui lòng thử lại sau.';
      
      if (error.response) {
        console.error('Error details:', error.response.data);
        console.error('Status code:', error.response.status);
        
        if (error.response.status === 404) {
          errorMessage = `Không tìm thấy yêu cầu với ID: ${requestId}`;
        } else if (error.response.status === 403) {
          errorMessage = 'Bạn không có quyền hủy yêu cầu này.';
        } else if (error.response.status === 400) {
          // Handle specific 400 errors from the backend
          if (error.response.data && error.response.data.detail) {
            errorMessage = error.response.data.detail;
          }
        }
      }
      
      throw new Error(errorMessage);
    }
  },

  /**
   * Lấy danh sách giấy tờ của công dân
   * @param {number} page - Số trang
   * @param {Object} filters - Các bộ lọc (search, document_type, status)
   * @param {Object} sorting - Các thông số sắp xếp (field, direction)
   * @returns {Promise<Object>} Kết quả từ API
   */
  getDocuments: async (page = 1, filters = {}, sorting = {}) => {
    try {
      console.log('Calling getDocuments API with:', { page, filters, sorting });
      
      const params = {
        page,
        limit: 10, // Số lượng mỗi trang
        ...filters
      };
      
      // Thêm thông số sắp xếp nếu có
      if (sorting && sorting.field) {
        params.ordering = sorting.direction === 'desc' ? `-${sorting.field}` : sorting.field;
      }
      
      // Log params trước khi gửi request
      console.log('Request params:', params);
      
      // Thử gọi API documents của citizen
      const response = await apiClient.get('/api/v1/citizen/documents/', { params });
      console.log('Documents API response:', response);
      
      // Kiểm tra và chuyển đổi dữ liệu nếu cần
      if (response.data && Array.isArray(response.data.results)) {
        return {
          results: response.data.results,
          count: response.data.count || response.data.results.length,
          next: response.data.next,
          previous: response.data.previous
        };
      } else if (Array.isArray(response.data)) {
        // Trường hợp API trả về mảng thay vì object có phân trang
        return {
          results: response.data,
          count: response.data.length,
          next: null,
          previous: null
        };
      } else {
        // Trả về dữ liệu như nhận được
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      
      // Thử endpoint thay thế
      try {
        console.log('Trying alternate endpoint for documents');
        const params = {
          page,
          limit: 10,
          ...filters
        };
        
        if (sorting && sorting.field) {
          params.ordering = sorting.direction === 'desc' ? `-${sorting.field}` : sorting.field;
        }
        
        // Thử endpoint của resulting_documents từ requests đã hoàn thành
        const alternateResponse = await apiClient.get('/api/v1/citizen/requests/completed/', { params });
        console.log('Alternate response:', alternateResponse);
        
        if (alternateResponse.data && alternateResponse.data.results) {
          // Lấy documents từ các requests đã hoàn thành
          const documents = alternateResponse.data.results
            .filter(req => req.resulting_document)
            .map(req => ({
              id: req.resulting_document.id || req.id,
              document_id: req.resulting_document.document_id || `DOC-${req.reference_number}`,
              document_type: req.document_type || { name: req.title },
              title: req.resulting_document?.title || req.title,
              status: req.resulting_document?.status || 'active',
              issued_at: req.completed_date || req.updated_at,
              citizen: req.requestor || null
            }));
          
          return {
            results: documents,
            count: documents.length,
            next: null,
            previous: null
          };
        }
        
        return {
          results: [],
          count: 0,
          next: null,
          previous: null
        };
      } catch (altError) {
        console.error('Error fetching from alternate endpoint:', altError);
        // Trả về mảng rỗng trong trường hợp lỗi
        return {
          results: [],
          count: 0,
          next: null,
          previous: null
        };
      }
    }
  },

  /**
   * Lấy chi tiết một giấy tờ
   * @param {string} documentId - ID của giấy tờ
   * @returns {Promise} Promise với chi tiết giấy tờ
   */
  getDocumentDetails: async (documentId) => {
    try {
      // Kiểm tra documentId hợp lệ chi tiết hơn
      if (!documentId) {
        console.error('getDocumentDetails: documentId is null or undefined');
        throw new Error('ID giấy tờ không hợp lệ');
      }
      
      if (typeof documentId !== 'string') {
        console.error('getDocumentDetails: documentId is not a string:', typeof documentId);
        throw new Error('ID giấy tờ không đúng định dạng');
      }
      
      if (documentId.trim() === '' || documentId === 'undefined' || documentId === 'null') {
        console.error('getDocumentDetails: documentId has invalid value:', documentId);
        throw new Error('ID giấy tờ không hợp lệ');
      }
      
      console.log(`citizenService.getDocumentDetails: Fetching document details for ID: ${documentId}`);
      const response = await apiClient.get(`/api/v1/citizen/documents/${documentId}/`);
      console.log('citizenService.getDocumentDetails: Raw response data:', response.data);
      
      if (!response.data) {
        console.error('citizenService.getDocumentDetails: Empty response data received');
        throw new Error('Không nhận được dữ liệu từ máy chủ');
      }
      
      // Map the API response to the format expected by the DocumentDetailPage component
      const apiData = response.data;
      
      // Create a properly formatted document object
      const formattedDocument = {
        id: apiData.id || documentId,
        documentId: apiData.document_id || apiData.id || documentId,
        documentType: apiData.document_type || 'other',
        title: apiData.title || 'Giấy tờ',
        status: apiData.status === 'active' ? 'VALID' : apiData.status?.toUpperCase() || 'UNKNOWN',
        issuedAt: apiData.issue_date || apiData.created_at,
        expiresAt: apiData.valid_until || null,
        issuedBy: apiData.issued_by?.department || 'Ủy ban Nhân dân Xã',
        officerId: apiData.issued_by?.id || null,
        officerName: apiData.issued_by?.full_name || null,
        verificationCode: apiData.document_id || documentId,
        contentHash: apiData.blockchain_tx_id || null,
        transactionId: apiData.blockchain_tx_id || null,
        blockchainTimestamp: apiData.blockchain_timestamp || apiData.created_at,
        details: {
          ...(apiData.content || {}),
          // Add basic details if available
          fullName: apiData.citizen?.full_name || null,
          dateOfBirth: apiData.citizen?.profile?.date_of_birth || null,
          permanentAddress: apiData.citizen?.profile?.address || null
        },
        // Create a default transaction history if none exists
        transactionHistory: [
          {
            action: 'CREATE',
            timestamp: apiData.created_at,
            userId: apiData.issued_by?.id || 'SYSTEM',
            userName: apiData.issued_by?.full_name || 'Hệ thống',
            role: 'officer'
          }
        ]
      };
      
      // Add blockchain transaction if available
      if (apiData.blockchain_status && apiData.blockchain_timestamp) {
        formattedDocument.transactionHistory.push({
          action: 'RECORD_ON_BLOCKCHAIN',
          timestamp: apiData.blockchain_timestamp,
          userId: 'SYSTEM',
          userName: 'Hệ thống',
          role: 'system'
        });
      }
      
      console.log('Formatted document details:', formattedDocument);
      return formattedDocument;
    } catch (error) {
      console.error('Error fetching document details:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        
        if (error.response.status === 404) {
          throw new Error(`Không tìm thấy giấy tờ với ID: ${documentId}`);
        } else if (error.response.status === 403) {
          throw new Error('Bạn không có quyền xem giấy tờ này');
        } else if (error.response.status === 500) {
          throw new Error('Lỗi máy chủ. Vui lòng thử lại sau');
        }
      }
      throw error.message ? error : new Error('Không thể tải thông tin giấy tờ. Vui lòng thử lại sau.');
    }
  },
  
  /**
   * Tải xuống tài liệu
   * @param {string} documentId - ID của giấy tờ
   * @returns {Promise} Promise với kết quả tải xuống
   */
  downloadDocument: async (documentId) => {
    try {
      // Kiểm tra documentId hợp lệ chi tiết hơn
      if (!documentId) {
        console.error('downloadDocument: documentId is null or undefined');
        throw new Error('ID giấy tờ không hợp lệ');
      }
      
      if (typeof documentId !== 'string') {
        console.error('downloadDocument: documentId is not a string:', typeof documentId);
        throw new Error('ID giấy tờ không đúng định dạng');
      }
      
      if (documentId.trim() === '' || documentId === 'undefined' || documentId === 'null') {
        console.error('downloadDocument: documentId has invalid value:', documentId);
        throw new Error('ID giấy tờ không hợp lệ');
      }
      
      console.log(`citizenService.downloadDocument: Downloading document with ID: ${documentId}`);
      
      // Gọi API tải xuống
      const response = await apiClient.get(`/api/v1/citizen/documents/${documentId}/download/`, {
        responseType: 'blob'
      });
      
      console.log('Download response received:', response);
      
      // Tạo đối tượng URL cho blob và thiết lập tải xuống
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Lấy tên file từ header hoặc tạo tên mặc định
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'document.pdf';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch.length > 1) {
          filename = filenameMatch[1];
        }
      }
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return { success: true, message: 'Tải xuống thành công' };
    } catch (error) {
      console.error('Error downloading document:', error);
      throw error;
    }
  },
  
  /**
   * Lấy dữ liệu in của giấy tờ
   * @param {string} documentId - ID của giấy tờ
   * @returns {Promise} Promise với dữ liệu in
   */
  printDocument: async (documentId) => {
    try {
      // Kiểm tra documentId hợp lệ chi tiết hơn
      if (!documentId) {
        console.error('printDocument: documentId is null or undefined');
        throw new Error('ID giấy tờ không hợp lệ');
      }
      
      if (typeof documentId !== 'string') {
        console.error('printDocument: documentId is not a string:', typeof documentId);
        throw new Error('ID giấy tờ không đúng định dạng');
      }
      
      if (documentId.trim() === '' || documentId === 'undefined' || documentId === 'null') {
        console.error('printDocument: documentId has invalid value:', documentId);
        throw new Error('ID giấy tờ không hợp lệ');
      }
      
      console.log(`citizenService.printDocument: Requesting print data for document: ${documentId}`);
      const response = await apiClient.get(`/api/v1/citizen/documents/${documentId}/print/`);
      console.log('Print data response:', response);
      
      // Kiểm tra và xử lý dữ liệu phản hồi
      if (response.data) {
        return response.data;
      } else {
        // Nếu API không trả về dữ liệu in hợp lệ, tạo dữ liệu in từ thông tin giấy tờ
        console.log('Print endpoint did not return valid data, generating from document details');
        
        // Lấy thông tin giấy tờ
        const documentResponse = await apiClient.get(`/api/v1/citizen/documents/${documentId}/`);
        const document = documentResponse.data;
        
        // Tạo dữ liệu in từ thông tin giấy tờ
        const now = new Date();
        
        const printData = {
          document_id: document.document_id || documentId,
          document_type: document.document_type || 'Giấy tờ',
          title: document.title || 'Giấy tờ hành chính',
          description: document.description,
          status: document.status || 'active',
          issue_date: document.issue_date || document.created_at,
          valid_from: document.valid_from || document.created_at,
          valid_until: document.valid_until,
          created_at: document.created_at,
          updated_at: document.updated_at,
          blockchain_status: document.blockchain_status || false,
          blockchain_tx_id: document.blockchain_tx_id,
          blockchain_timestamp: document.blockchain_timestamp,
          
          // Thông tin công dân
          citizen: document.citizen ? {
            id: document.citizen.id,
            full_name: document.citizen.full_name || `${document.citizen.first_name || ''} ${document.citizen.last_name || ''}`,
            username: document.citizen.username,
            email: document.citizen.email,
            profile: document.citizen.profile || {}
          } : null,
          
          // Thông tin người cấp
          issued_by: document.issued_by ? {
            id: document.issued_by.id,
            full_name: document.issued_by.full_name || `${document.issued_by.first_name || ''} ${document.issued_by.last_name || ''}`,
            position: document.issued_by.position || 'Cán bộ xã',
            department: document.issued_by.department || 'UBND Xã'
          } : null,
          
          // Nội dung
          content: document.content || {},
          
          // Thông tin xác thực
          verification: {
            qr_code: `https://verify.example.com/${document.document_id || documentId}`,
            verification_code: document.document_id || documentId,
            instructions: "Quét mã QR hoặc truy cập website và nhập mã xác thực để kiểm tra tính hợp lệ của giấy tờ."
          },
          
          // Thông tin in
          print_info: {
            generated_at: now.toLocaleString('vi-VN'),
            print_id: `PRINT-${document.document_id || documentId}-${now.getTime()}`,
            issuing_authority: 'ỦY BAN NHÂN DÂN XÃ',
            province: 'TỈNH/THÀNH PHỐ',
            footer_text: 'Giấy tờ này có giá trị pháp lý và đã được xác thực.'
          },
          
          // Header và footer
          document_header: {
            title: 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM',
            subtitle: 'Độc lập - Tự do - Hạnh phúc',
            separator: '-------------------'
          },
          
          document_footer: {
            place_and_date: `....., ngày ${now.getDate()} tháng ${now.getMonth() + 1} năm ${now.getFullYear()}`,
            position: 'CHỦ TỊCH',
            signature_placeholder: '(Ký tên, đóng dấu)',
            officer_name: document.issued_by ? (document.issued_by.full_name || `${document.issued_by.first_name || ''} ${document.issued_by.last_name || ''}`) : 'Chưa xác định'
          }
        };
        
        return printData;
      }
    } catch (error) {
      console.error('Error fetching print data:', error);
      if (error.response) {
        console.error('Error details:', error.response.data);
        console.error('Status code:', error.response.status);
      }
      throw new Error('Không thể lấy dữ liệu in. Vui lòng thử lại sau.');
    }
  },
  
  /**
   * Tải xuống giấy tờ
   * @param {string} documentId - ID của giấy tờ
   * @returns {Promise} Promise với blob dữ liệu giấy tờ
   */
  downloadDocument: async (documentId) => {
    try {
      // Kiểm tra documentId hợp lệ
      if (!documentId || documentId === '' || documentId === 'undefined' || documentId === 'null') {
        throw new Error('ID giấy tờ không hợp lệ');
      }
      
      const response = await apiClient.get(`/api/v1/citizen/documents/${documentId}/download/`, {
        responseType: 'blob'
      });
      
      // Tạo URL và tải xuống file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `document-${documentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return response.data;
    } catch (error) {
      console.error('Error downloading document:', error);
      throw new Error('Không thể tải xuống giấy tờ. Vui lòng thử lại sau.');
    }
  },
  
  /**
   * Xác thực giấy tờ trên blockchain
   * @param {string} documentId - ID của giấy tờ
   * @returns {Promise} Promise với thông tin xác thực
   */
  verifyDocument: async (documentId) => {
    const response = await apiClient.get(`/api/v1/citizen/documents/${documentId}/verify/`);
    return response.data;
  },
  /**
   * Gửi phản hồi của công dân
   * @param {Object} feedbackData - Dữ liệu phản hồi
   * @returns {Promise} Promise với phản hồi đã tạo
   */
  submitFeedback: async (feedbackData) => {
    // Format the data according to what the API expects
    const formattedData = {
      title: feedbackData.category ? `Phản hồi về ${feedbackData.category}` : 'Phản hồi mới',
      content: feedbackData.content,
      feedback_type: mapFeedbackType(feedbackData.category, feedbackData.type),
      is_anonymous: false,
      is_public: true
    };
    
    console.log('Sending feedback data:', formattedData);
    const response = await apiClient.post('/api/v1/citizen/feedback/', formattedData);
    console.log('Submit feedback response:', response);
    return response.data;
  },

  /**
   * Lấy danh sách phản hồi của công dân
   * @param {number} page - Số trang
   * @param {string} ordering - Cách sắp xếp
   * @returns {Promise} Promise với danh sách phản hồi
   */
  getFeedbacks: async (page = 1, ordering = '-created_at') => {
    console.log('Sending request to:', `/api/v1/citizen/feedback/`);
    const params = { page, ordering };
    console.log('With params:', params);
    
    const response = await apiClient.get('/api/v1/citizen/feedback/', { params });
    console.log('API response:', response);
    
    // Check if response.data is already an array (some APIs might return this)
    if (Array.isArray(response.data)) {
      return {
        data: {
          results: response.data,
          count: response.data.length
        }
      };
    }
    
    // Return the standard response
    return response;
  },

  /**
   * Lấy thông tin hồ sơ của công dân
   * @returns {Promise} Promise với thông tin hồ sơ
   */
  getProfile: async () => {
    const response = await apiClient.get('/api/v1/citizen/profile/');
    return response.data;
  },

  /**
   * Cập nhật thông tin hồ sơ của công dân
   * @param {Object} profileData - Dữ liệu hồ sơ cần cập nhật
   * @returns {Promise} Promise với thông tin hồ sơ đã cập nhật
   */
  updateProfile: async (profileData) => {
    const response = await apiClient.put('/api/v1/citizen/profile/', profileData);
    return response.data;
  },

  /**
   * Tải lên ảnh đại diện
   * @param {File} imageFile - File ảnh đại diện
   * @returns {Promise} Promise với đường dẫn ảnh đã tải lên
   */
  uploadProfilePicture: async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await apiClient.post('/api/v1/citizen/profile/picture/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  }
};

export default citizenService;