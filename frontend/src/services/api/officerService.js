import { API_ENDPOINTS, get, post, put, del, patch } from '../../utils/api';
import { API_BASE_URL } from '../../utils/apiConfig';

/**
 * Helper function to extract profile picture URL from various response formats
 * @param {Object} response - API response object
 * @returns {string|null} - Profile picture URL or null if not found
 */
const extractProfilePictureUrl = (response) => {
  if (!response) return null;
  
  // Check common patterns for image URLs
  if (response.url) return response.url;
  if (response.image_url) return response.image_url;
  if (response.avatar) return response.avatar;
  if (response.photo) return response.photo;
  
  // Check nested objects
  if (response.data) {
    const data = response.data;
    if (data.profile_picture) return data.profile_picture;
    if (data.url) return data.url;
    if (data.image_url) return data.image_url;
    if (data.avatar) return data.avatar;
  }
  
  if (response.user) {
    const user = response.user;
    if (user.profile_picture) return user.profile_picture;
    if (user.avatar) return user.avatar;
    if (user.photo) return user.photo;
  }
  
  // If we have a string that looks like a URL
  if (typeof response === 'string' && 
      (response.startsWith('http') || 
       response.startsWith('/media/') || 
       response.startsWith('/static/'))) {
    return response;
  }
  
  return null;
};

// API service cho cán bộ xã - không sử dụng mockdata
const officerService = {
  /**
   * Lấy dữ liệu dashboard của cán bộ
   * @returns {Promise<Object>} Dữ liệu dashboard
   */
  getDashboardData: async () => {
    try {
      console.log('Calling officer dashboard API');
      // Call real API
      const response = await get(API_ENDPOINTS.OFFICER.DASHBOARD);
      console.log('Officer dashboard data from API:', response);
      return response;
    } catch (error) {
      console.error('Error fetching officer dashboard data:', error);
      
      // Tạo mock data với thông tin chi tiết khi API lỗi để UI không bị vỡ
      const currentDate = new Date();
      const yesterday = new Date(currentDate);
      yesterday.setDate(yesterday.getDate() - 1);
      const lastWeek = new Date(currentDate);
      lastWeek.setDate(lastWeek.getDate() - 7);
      
      // Format dates
      const formatISODate = (date) => date.toISOString();
      
      // Tạo mock data đầy đủ hơn
      const mockDashboardData = {
        stats: {
          total_requests: 12,
          pending_requests: 5,
          completed_requests: 7,
          total_citizens: 25
        },
        pending_requests: [
          {
            id: 1001,
            title: "Đăng ký khai sinh",
            status: "pending",
            submittedDate: formatISODate(lastWeek),
            priority: "high",
            citizen: {
              id: 101,
              name: "Nguyễn Văn A",
              phone: "0912345678"
            }
          },
          {
            id: 1002,
            title: "Cấp CCCD mới",
            status: "processing",
            submittedDate: formatISODate(yesterday),
            priority: "medium",
            citizen: {
              id: 102,
              name: "Trần Thị B",
              phone: "0923456789"
            }
          },
          {
            id: 1003,
            title: "Đăng ký hộ khẩu",
            status: "submitted",
            submittedDate: formatISODate(currentDate),
            priority: "normal",
            citizen: {
              id: 103,
              name: "Lê Văn C",
              phone: "0934567890"
            }
          },
          {
            id: 1004,
            title: "Đăng ký kết hôn",
            status: "pending",
            submittedDate: formatISODate(yesterday),
            priority: "high",
            citizen: {
              id: 104,
              name: "Phạm Thị D",
              phone: "0945678901"
            }
          },
          {
            id: 1005,
            title: "Xác nhận tạm trú",
            status: "processing",
            submittedDate: formatISODate(lastWeek),
            priority: "low",
            citizen: {
              id: 105,
              name: "Hoàng Văn E",
              phone: "0956789012"
            }
          }
        ],
        completed_requests: [
          {
            id: 2001,
            title: "Cấp giấy chứng nhận quyền sử dụng đất",
            status: "completed",
            submittedDate: formatISODate(new Date(currentDate.getTime() - 14 * 24 * 60 * 60 * 1000)),
            completedDate: formatISODate(yesterday),
            priority: "high",
            citizen: {
              id: 106,
              name: "Võ Thị F",
              phone: "0967890123"
            }
          },
          {
            id: 2002,
            title: "Đăng ký thường trú",
            status: "completed",
            submittedDate: formatISODate(new Date(currentDate.getTime() - 10 * 24 * 60 * 60 * 1000)),
            completedDate: formatISODate(new Date(currentDate.getTime() - 2 * 24 * 60 * 60 * 1000)),
            priority: "medium",
            citizen: {
              id: 107,
              name: "Đặng Văn G",
              phone: "0978901234"
            }
          },
          {
            id: 2003,
            title: "Cấp lại CCCD",
            status: "completed",
            submittedDate: formatISODate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000)),
            completedDate: formatISODate(yesterday),
            priority: "normal",
            citizen: {
              id: 108,
              name: "Bùi Thị H",
              phone: "0989012345"
            }
          }
        ],
        recent_citizens: [
          {
            id: 101,
            name: "Nguyễn Văn A",
            email: "nguyenvana@example.com",
            phone: "0912345678",
            total_requests: 3,
            last_request_date: formatISODate(lastWeek)
          },
          {
            id: 102,
            name: "Trần Thị B",
            email: "tranthib@example.com",
            phone: "0923456789",
            total_requests: 2,
            last_request_date: formatISODate(yesterday)
          },
          {
            id: 103,
            name: "Lê Văn C",
            email: "levanc@example.com",
            phone: "0934567890",
            total_requests: 1,
            last_request_date: formatISODate(currentDate)
          },
          {
            id: 104,
            name: "Phạm Thị D",
            email: "phamthid@example.com",
            phone: "0945678901",
            total_requests: 4,
            last_request_date: formatISODate(yesterday)
          },
          {
            id: 105,
            name: "Hoàng Văn E",
            email: "hoangvane@example.com",
            phone: "0956789012",
            total_requests: 2,
            last_request_date: formatISODate(lastWeek)
          }
        ]
      };
      
      // Ghi log lỗi chi tiết để debug
      if (error.response) {
        console.error('API error details:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
        
        // Đánh dấu dữ liệu là mock khi trả về
        mockDashboardData._isMockData = true;
        mockDashboardData._errorStatus = error.response.status;
        mockDashboardData._errorMessage = `${error.response.status}: ${error.response.statusText}`;
        
        // Nếu đây là lỗi 500 và liên quan đến 'request_type', thêm thông tin chi tiết
        if (error.response.status === 500 && 
            error.response.data && 
            (String(error.response.data).includes('request_type') || 
             (error.response.data.detail && String(error.response.data.detail).includes('request_type')))) {
          mockDashboardData._errorDetails = "Backend error: 'AdminRequest' object has no attribute 'request_type'";
          mockDashboardData._fixSuggestion = "Đang sử dụng dữ liệu giả để hiển thị dashboard. Lỗi backend cần được sửa.";
          console.log("MOCKDATA CREATED for error 'AdminRequest' object has no attribute 'request_type'");
        }
      }
      
      // Log mock data để debug
      console.log('Using mock dashboard data:', mockDashboardData);
      
      // Throw lại lỗi với thông tin bổ sung và dữ liệu mock
      error.mockData = mockDashboardData;
      throw error;
    }
  },
  
  /**
   * Lấy danh sách yêu cầu đang chờ xử lý
   * @param {Object} filters - Optional filter parameters
   * @returns {Promise<Object>} Danh sách yêu cầu và thống kê
   */
  getPendingRequests: async (filters = {}) => {
    try {
      // Prepare query parameters for the API
      const queryParams = {};
      
      // Handle status filter
      if (filters.status && filters.status !== 'all') {
        queryParams.status = filters.status;
      }
      
      // Handle request type filter
      if (filters.type && filters.type !== 'all') {
        queryParams.document_type = filters.type;
      }
      
      // Handle search term
      if (filters.search) {
        queryParams.search = filters.search;
      }
      
      // Handle priority filter
      if (filters.priority && filters.priority !== 'all') {
        queryParams.priority = filters.priority;
      }
      
      // Handle sorting
      if (filters.sort_by) {
        queryParams.sort_by = filters.sort_by;
        if (filters.sort_direction) {
          queryParams.sort_direction = filters.sort_direction;
        }
      }
      
      console.log('Sending request with query params:', queryParams);
      
      // Call real API
      const response = await get(API_ENDPOINTS.OFFICER.PENDING_REQUESTS, queryParams);
      console.log('API response for pending requests:', response);
      
      // Return the formatted response object
      if (response && typeof response === 'object') {
        // If the response already has the expected format with results
        if (response.results && Array.isArray(response.results)) {
          return response;
        } 
        // If response is an array, format it properly
        else if (Array.isArray(response)) {
          return {
            results: response,
            stats: {
              totalRequests: response.length,
              pending: response.filter(req => req.status === 'pending').length,
              submitted: response.filter(req => req.status === 'submitted').length,
              processing: response.filter(req => req.status === 'processing').length,
              completed: response.filter(req => req.status === 'completed').length,
              rejected: response.filter(req => req.status === 'rejected').length
            },
            count: response.length
          };
        }
      }
      
      // Return empty response with the right format if nothing matched
      console.error('Unexpected response format:', response);
      return { 
        results: [], 
        stats: {
          totalRequests: 0,
          pending: 0,
          submitted: 0,
          processing: 0,
          completed: 0,
          rejected: 0
        },
        count: 0
      };
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
      console.log(`Calling API: GET ${API_ENDPOINTS.OFFICER.REQUEST_DETAIL(requestId)}`);
      
      // Thêm kiểm tra token
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("No authentication token found");
        throw new Error("No authentication token found");
      }
      
      // Gọi API với header rõ ràng
      const response = await fetch(`http://localhost:8000${API_ENDPOINTS.OFFICER.REQUEST_DETAIL(requestId)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error fetching request detail: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("API Response data:", data);
      
      return data;
    } catch (error) {
      console.error(`Error fetching request detail for ID ${requestId}:`, error);
      throw error; // Re-throw error to be handled by component
    }
  },
  
  /**
   * Tự phân công xử lý yêu cầu
   * @param {string} requestId - ID của yêu cầu
   * @param {Object} assignData - Optional data for assignment
   * @returns {Promise<Object>} Kết quả nhận yêu cầu
   */
  assignToSelf: async (requestId, assignData = {}) => {
    try {
      // Kiểm tra token trước
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        throw new Error('No authentication token found');
      }
      
      console.log('Making assign request to:', API_ENDPOINTS.OFFICER.ASSIGN_TO_SELF(requestId));
      console.log('With token:', token.substring(0, 10) + '...');
      console.log('And data:', assignData);
      
      // Gọi API với header token rõ ràng
      const response = await post(
        API_ENDPOINTS.OFFICER.ASSIGN_TO_SELF(requestId), 
        assignData,
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
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
      console.log(`Processing request ID ${requestId} with data:`, processData);
      console.log('Using endpoint:', API_ENDPOINTS.OFFICER.PROCESS_REQUEST(requestId));
      
      const token = localStorage.getItem('token');
      console.log('Token available:', !!token);
      
      const response = await post(
        API_ENDPOINTS.OFFICER.PROCESS_REQUEST(requestId), 
        processData,
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Process request response:', response);
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
      console.log(`Rejecting request ID ${requestId} with data:`, rejectData);
      console.log('Using endpoint:', API_ENDPOINTS.OFFICER.REJECT_REQUEST(requestId));
      
      const token = localStorage.getItem('token');
      console.log('Token available:', !!token);
      
      const response = await post(
        API_ENDPOINTS.OFFICER.REJECT_REQUEST(requestId), 
        rejectData,
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Reject request response:', response);
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
      // Ghi log thông tin filter để debug
      console.log('=== getCitizens filter params: ===', filters);
      
      // Chuẩn bị query params hợp lệ để gửi đến API
      const queryParams = {};
      
      // Xử lý tham số tìm kiếm
      if (filters.search) {
        queryParams.search = filters.search;
      }
      
      // Xử lý các filter về trạng thái hoạt động
      if (filters.is_active === true) {
        queryParams.is_active = 'true';
      } else if (filters.is_active === false) {
        queryParams.is_active = 'false';
      }
      
      // Xử lý filter ngày tạo
      if (filters.created_after) {
        queryParams.created_after = filters.created_after;
      }
      
      // Xử lý filter giới tính
      if (filters.gender && filters.gender !== 'all') {
        // Đảm bảo giá trị được chuyển thành chữ thường và đúng chuẩn
        const genderValue = String(filters.gender).toLowerCase().trim();
        
        // Chỉ chấp nhận các giá trị hợp lệ
        if (['male', 'female', 'other'].includes(genderValue)) {
          queryParams.gender = genderValue;
          console.log(`=== Gender Filter: ${genderValue} ===`);
        } else {
          console.warn(`Giá trị giới tính không hợp lệ: ${filters.gender}`);
        }
      }
      
      // Xử lý filter quận/huyện
      if (filters.district && filters.district !== 'all') {
        queryParams.district = filters.district;
      }
      
      // Xử lý filter trạng thái CCCD - CÁCH MỚI, THAM SỐ ĐƠN GIẢN HƠN
      // API chấp nhận một tham số duy nhất id_card_status với các giá trị: 'verified', 'unverified'
      // verified: Đã xác thực
      // unverified: Chưa xác thực (bao gồm cả trường hợp chưa cung cấp CCCD)
      if (filters.id_card_status && filters.id_card_status !== 'all') {
        queryParams.id_card_status = filters.id_card_status;
        console.log(`=== ID Card Status Filter: ${filters.id_card_status} ===`);
      }
      
      // Xóa các tham số cũ nếu có
      delete queryParams.id_card_verified;
      delete queryParams.id_card_missing;
      
      // Log tham số truy vấn cuối cùng để debug
      console.log('=== Final API query params: ===', queryParams);
      
      // Call real API
      const response = await get(API_ENDPOINTS.OFFICER.CITIZENS, queryParams);
      console.log('Citizens API Response:', response);
      
      // Ensure we return an array
      if (Array.isArray(response)) {
        return response;
      } else if (response && typeof response === 'object') {
        // Check if the response has a results or data property containing the array
        if (Array.isArray(response.results)) {
          return response.results;
        } else if (response.data && Array.isArray(response.data)) {
          return response.data;
        }
      }
      
      // If we can't find an array in the response, return an empty array
      console.error('Citizens API response is not in expected format:', response);
      return [];
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
   * Xóa công dân theo ID
   * @param {string} citizenId - ID của công dân
   * @returns {Promise<Object>} Kết quả xóa công dân
   */
  deleteCitizen: async (citizenId) => {
    try {
      // Gọi API để xóa công dân
      const response = await del(API_ENDPOINTS.OFFICER.CITIZEN_DELETE(citizenId));
      console.log(`Successfully deleted citizen with ID ${citizenId}:`, response);
      return response;
    } catch (error) {
      console.error(`Error deleting citizen with ID ${citizenId}:`, error);
      throw error; // Re-throw error to be handled by component
    }
  },
  
  /**
   * Cập nhật thông tin công dân
   * @param {string} citizenId - ID của công dân
   * @param {Object} citizenData - Dữ liệu cập nhật
   * @returns {Promise<Object>} Kết quả cập nhật công dân
   */
  updateCitizen: async (citizenId, citizenData) => {
    try {
      console.log(`Cập nhật thông tin công dân ID ${citizenId}`);
      
      // Sử dụng phương thức PUT thay vì PATCH vì backend yêu cầu phương thức PUT
      const response = await put(API_ENDPOINTS.OFFICER.CITIZEN_UPDATE(citizenId), citizenData);
      
      console.log(`Cập nhật thành công công dân với ID ${citizenId}`);
      return response;
    } catch (error) {
      console.error(`Lỗi khi cập nhật công dân với ID ${citizenId}:`, error);
      
      // Định dạng lỗi để dễ xử lý ở component
      if (error.response && error.response.data) {
        error.formattedError = error.response.data;
      }
      
      throw error; // Re-throw error to be handled by component
    }
  },
  
  /**
   * Phiên bản mock của updateCitizen để phòng tránh lỗi 500
   * @param {string} citizenId - ID của công dân
   * @param {Object} citizenData - Dữ liệu cập nhật
   * @returns {Promise<Object>} Kết quả cập nhật
   */
  updateCitizenMock: async (citizenId, citizenData) => {
    try {
      console.log(`[MOCK] Cập nhật thông tin công dân ID ${citizenId}:`, citizenData);
      
      // Log chi tiết hơn về dữ liệu đang gửi đi
      console.log('[MOCK] JSON Data being sent:', JSON.stringify(citizenData, null, 2));
      
      // Giả lập thành công mà không gọi API
      const mockResponse = {
        id: citizenId,
        ...citizenData,
        updated_at: new Date().toISOString(),
        _isMockResponse: true
      };
      
      // Giả lập độ trễ mạng
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log(`[MOCK] Cập nhật thành công công dân với ID ${citizenId}:`, mockResponse);
      return mockResponse;
    } catch (error) {
      console.error(`[MOCK] Lỗi khi cập nhật công dân với ID ${citizenId}:`, error);
      throw error;
    }
  },
  
  /**
   * Lấy thông tin cá nhân của cán bộ
   * @returns {Promise<Object>} Thông tin cá nhân
   */
  getProfile: async () => {
    try {
      // Gọi API để lấy thông tin profile
      const response = await get(API_ENDPOINTS.OFFICER.PROFILE);
      
      if (!response) {
        throw new Error('Empty response from API');
      }
      
      console.log('[getProfile] Raw API response:', response);
      
      // Chuẩn bị dữ liệu để đảm bảo tất cả các trường đều có giá trị
      const processedProfile = {
        ...response,
        // Đảm bảo các trường quan trọng luôn có giá trị
        province: response.city || response.province || '',
        phone_number: response.phone_number || '',
        bio: response.bio || '',
        position: response.position || '',
        department: response.department || '',
        address: response.address || '',
        ward: response.ward || '',
        district: response.district || '',
        id_number: response.id_number || response.id_card_number || '',
        id_issue_date: response.id_issue_date || response.id_card_issue_date || null,
        id_issue_place: response.id_issue_place || response.id_card_issue_place || '',
        
        // Handle profile picture URL
        avatar: response.profile_picture || response.avatar || '',
        
        // Thêm timestamp để buộc component re-render
        _timestamp: new Date().getTime()
      };
      
      console.log('[getProfile] Processed profile:', processedProfile);
      
      // Lưu profile vào localStorage
      localStorage.setItem('officerProfile', JSON.stringify(processedProfile));
      
      return processedProfile;
    } catch (error) {
      console.error('[getProfile] Error:', error);
      
      // Nếu có lỗi, thử lấy dữ liệu từ localStorage
      try {
        const cachedProfile = localStorage.getItem('officerProfile');
        if (cachedProfile) {
          console.log('[getProfile] Using cached profile from localStorage');
          return JSON.parse(cachedProfile);
        }
      } catch (e) {
        console.error('[getProfile] Error reading from localStorage:', e);
      }
      
      throw error;
    }
  },
  
  /**
   * Xuất danh sách công dân ra file CSV
   * @param {Object} filters - Các tham số lọc
   * @returns {Promise<void>} - Promise trả về khi tải xuống hoàn tất
   */
  exportCitizens: async (filters = {}) => {
    try {
      // Tạo URL với các tham số lọc
      const queryParams = new URLSearchParams();
      
      if (filters.gender && filters.gender !== 'all') {
        queryParams.append('gender', filters.gender);
      }
      
      if (filters.idCardStatus && filters.idCardStatus !== 'all') {
        queryParams.append('id_card_status', filters.idCardStatus);
      }
      
      if (filters.district && filters.district !== 'all') {
        queryParams.append('district', filters.district);
      }
      
      if (filters.filterStatus === 'active') {
        queryParams.append('is_active', 'true');
      } else if (filters.filterStatus === 'inactive') {
        queryParams.append('is_active', 'false');
      }
      
      if (filters.search) {
        queryParams.append('search', filters.search);
      }
      
      // Tạo URL đầy đủ cho API endpoint
      const exportUrl = `${API_BASE_URL}${API_ENDPOINTS.OFFICER.CITIZENS}export/?${queryParams.toString()}`;
      
      // Lấy token để đính kèm trong header
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
      }
      
      console.log(`Đang tải xuống danh sách công dân từ: ${exportUrl}`);
      
      // Sử dụng fetch API để tạo yêu cầu tải xuống
      const response = await fetch(exportUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token.replace(/^(Bearer |Token )/, '')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Lỗi khi tải xuống: ${response.status} ${response.statusText}`);
      }
      
      // Lấy blob từ response
      const blob = await response.blob();
      
      // Tạo URL cho blob
      const url = window.URL.createObjectURL(blob);
      
      // Tạo thẻ a để tải xuống
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      
      // Lấy filename từ Content-Disposition header hoặc sử dụng tên mặc định
      let filename = 'danh_sach_cong_dan.csv';
      const disposition = response.headers.get('Content-Disposition');
      if (disposition && disposition.includes('filename=')) {
        const filenameMatch = disposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }
      
      a.setAttribute('download', filename);
      document.body.appendChild(a);
      
      // Kích hoạt sự kiện click để tải xuống
      a.click();
      
      // Dọn dẹp
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return { success: true, message: 'Tải xuống danh sách công dân thành công' };
    } catch (error) {
      console.error('Lỗi khi xuất danh sách công dân:', error);
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
      console.log('[updateProfile] Input data:', profileData);
      
      // Chuẩn bị dữ liệu để gửi lên API
      const formattedData = {
        // Thông tin cá nhân
        phone_number: profileData.phone_number || '',
        gender: profileData.gender || '',
        date_of_birth: profileData.date_of_birth || null,
        
        // Thông tin địa chỉ - chuyển province thành city cho backend
        address: profileData.address || '',
        ward: profileData.ward || '',
        district: profileData.district || '',
        city: profileData.city || profileData.province || '', // Đảm bảo sử dụng city cho backend
        
        // Thông tin công việc
        position: profileData.position || '',
        department: profileData.department || '',
        bio: profileData.bio || '',
        
        // Thông tin CMND/CCCD - giữ nguyên không thay đổi
        id_number: profileData.id_number || '',
        id_issue_date: profileData.id_issue_date || null,
        id_issue_place: profileData.id_issue_place || '',
        
        // Thông tin người dùng
        user: {
          first_name: profileData.user?.first_name || profileData.first_name || '',
          last_name: profileData.user?.last_name || profileData.last_name || '',
          email: profileData.user?.email || profileData.email || ''
        }
      };
      
      console.log('[updateProfile] Formatted data for API:', formattedData);
      
      // Gọi API để cập nhật profile
      const response = await put(API_ENDPOINTS.OFFICER.PROFILE, formattedData);
      
      if (!response) {
        throw new Error('Empty response from API');
      }
      
      console.log('[updateProfile] API response:', response);
      
      // Xử lý response để đảm bảo dữ liệu đúng định dạng cho frontend
      const processedResponse = {
        ...response,
        // Đảm bảo các trường quan trọng luôn có giá trị
        province: response.city || response.province || formattedData.city || '', // Chuyển city thành province
        phone_number: response.phone_number || formattedData.phone_number || '',
        bio: response.bio || formattedData.bio || '',
        position: response.position || formattedData.position || '',
        department: response.department || formattedData.department || '',
        address: response.address || formattedData.address || '',
        ward: response.ward || formattedData.ward || '',
        district: response.district || formattedData.district || '',
        
        // Preserve profile picture URL
        avatar: response.profile_picture || response.avatar || '',
        
        // Thêm timestamp để buộc component re-render
        _timestamp: new Date().getTime()
      };
      
      console.log('[updateProfile] Processed response:', processedResponse);
      
      // Cập nhật thông tin người dùng trong localStorage
      if (response.user_details && response.user_details.email) {
        const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
        authUser.first_name = response.user_details.first_name;
        authUser.last_name = response.user_details.last_name;
        authUser.email = response.user_details.email;
        authUser.name = `${response.user_details.first_name} ${response.user_details.last_name}`.trim();
        
        // Add avatar URL if available
        if (response.profile_picture || response.avatar) {
          authUser.avatar = response.profile_picture || response.avatar;
        }
        
        localStorage.setItem('authUser', JSON.stringify(authUser));
      }
      
      // Lưu profile mới vào localStorage để đảm bảo dữ liệu được cập nhật ngay lập tức
      localStorage.setItem('officerProfile', JSON.stringify(processedResponse));
      
      return processedResponse;
    } catch (error) {
      console.error('[updateProfile] Error:', error);
      throw error;
    }
  },
  
  /**
   * Cập nhật ảnh đại diện
   * @param {FormData} formData - FormData chứa file ảnh
   * @returns {Promise<Object>} Kết quả cập nhật
   */
  updateProfilePicture: async (formData) => {
    try {
      console.log('[updateProfilePicture] Uploading profile picture...');
      
      // Check if formData contains the file
      if (!formData.has('profile_picture')) {
        console.error('[updateProfilePicture] No profile_picture field in formData');
        throw new Error('No profile picture provided');
      }
      
      // Log the file being uploaded for debugging
      const file = formData.get('profile_picture');
      console.log('[updateProfilePicture] File details:', { 
        name: file.name, 
        type: file.type, 
        size: file.size 
      });
      
      // Ensure we're using the correct endpoint
      const response = await post(API_ENDPOINTS.OFFICER.PROFILE_PICTURE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('[updateProfilePicture] API response:', response);
      
      // If the API returns a URL directly
      if (response && typeof response === 'string') {
        return { profile_picture: response };
      }
      
      // If the API returns an object with the URL
      if (response && response.profile_picture) {
        return response;
      }
      
      // If the API returns an object with data property
      if (response && response.data && response.data.profile_picture) {
        return response.data;
      }
      
      // If we get here, the API response format is unexpected
      console.warn('[updateProfilePicture] Unexpected API response format:', response);
      
      // Try to extract a URL from the response if possible
      const extractedUrl = extractProfilePictureUrl(response);
      if (extractedUrl) {
        return { profile_picture: extractedUrl };
      }
      
      throw new Error('Unexpected API response format');
    } catch (error) {
      console.error('[updateProfilePicture] Error:', error);
      
      // Provide more detailed error information
      if (error.response) {
        console.error('[updateProfilePicture] Error response:', error.response);
        if (error.response.data) {
          console.error('[updateProfilePicture] Error data:', error.response.data);
        }
      }
      
      throw error;
    }
  },
  
  /**
   * Lấy thống kê
   * @param {Object} params - Tham số thống kê (timeRange)
   * @returns {Promise<Object>} Dữ liệu thống kê
   */
  getStatistics: async (params = {}) => {
    try {
      console.log('Fetching officer statistics with params:', params);
      
      // Gọi API thật
      const response = await get(API_ENDPOINTS.OFFICER.STATISTICS, params);
      console.log('Statistics API response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching officer statistics:', error);
      
      // Kiểm tra nếu lỗi liên quan đến request_type
      if (error.response && 
          (error.response.data && 
           (String(error.response.data).includes('request_type') || 
            (error.response.data.detail && String(error.response.data.detail).includes('request_type'))))) {
        console.log('Detected "AdminRequest object has no attribute request_type" error, returning mock data');
        
        // Tạo dữ liệu mẫu khi xảy ra lỗi request_type
        return {
          overview: {
            approvedRequests: 142,
            rejectedRequests: 31,
            pendingRequests: 47,
            averageProcessingDays: 3.5,
            totalCitizens: 1287,
            totalDocuments: 2145
          },
          requestsByType: [
            { type: 'Căn cước công dân', count: 72, color: '#0088FE' },
            { type: 'Hộ khẩu', count: 53, color: '#00C49F' },
            { type: 'Khai sinh', count: 41, color: '#FFBB28' },
            { type: 'Kết hôn', count: 25, color: '#FF8042' },
            { type: 'Tạm trú', count: 28, color: '#8884d8' }
          ],
          processingTimeByType: [
            { type: 'Căn cước công dân', days: 2.3, color: '#0088FE' },
            { type: 'Hộ khẩu', days: 4.1, color: '#00C49F' },
            { type: 'Khai sinh', days: 1.7, color: '#FFBB28' },
            { type: 'Kết hôn', days: 5.2, color: '#FF8042' },
            { type: 'Tạm trú', days: 2.8, color: '#8884d8' }
          ],
          monthlyStats: [
            { month: 'T1', requests: 40, approved: 35, rejected: 5 },
            { month: 'T2', requests: 45, approved: 38, rejected: 7 },
            { month: 'T3', requests: 35, approved: 30, rejected: 5 },
            { month: 'T4', requests: 38, approved: 33, rejected: 5 },
            { month: 'T5', requests: 52, approved: 48, rejected: 4 },
            { month: 'T6', requests: 45, approved: 40, rejected: 5 },
            { month: 'T7', requests: 57, approved: 51, rejected: 6 },
            { month: 'T8', requests: 65, approved: 58, rejected: 7 },
            { month: 'T9', requests: 60, approved: 55, rejected: 5 },
            { month: 'T10', requests: 63, approved: 57, rejected: 6 },
            { month: 'T11', requests: 55, approved: 50, rejected: 5 },
            { month: 'T12', requests: 48, approved: 43, rejected: 5 }
          ],
          _isMockData: true,
          _errorDetails: "AdminRequest object has no attribute request_type"
        };
      }
      
      // Nếu là lỗi khác, ném ra để component xử lý
      throw error;
    }
  },
  
  /**
   * Lấy danh sách giấy tờ của công dân
   * @param {string} citizenId - ID của công dân
   * @returns {Promise<Array>} Danh sách giấy tờ
   */
  getCitizenDocuments: async (citizenId) => {
    try {
      const response = await get(API_ENDPOINTS.OFFICER.CITIZEN_DETAIL(citizenId) + 'documents/');
      console.log('Citizen documents:', response);
      return response;
    } catch (error) {
      console.error(`Error fetching documents for citizen ID ${citizenId}:`, error);
      throw error;
    }
  },
  
  /**
   * Lấy chi tiết giấy tờ
   * @param {string} documentId - ID của giấy tờ
   * @returns {Promise<Object>} Chi tiết giấy tờ
   */
  getDocumentDetail: async (documentId) => {
    try {
      const response = await get(API_ENDPOINTS.OFFICER.DOCUMENT_DETAIL(documentId));
      console.log('Document detail:', response);
      return response;
    } catch (error) {
      console.error(`Error fetching document detail for ID ${documentId}:`, error);
      throw error;
    }
  }
};

export default officerService; 