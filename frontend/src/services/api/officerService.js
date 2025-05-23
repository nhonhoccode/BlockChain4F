import { API_ENDPOINTS, get, post, put, del } from '../../utils/api';
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
      // Prepare query parameters for the API
      const queryParams = {};
      
      // Handle status filter
      if (filters.status && filters.status !== 'all') {
        queryParams.status = filters.status;
      }
      
      // Handle request type filter
      if (filters.type && filters.type !== 'all') {
        queryParams.request_type = filters.type;
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
      
      // Process the response
      if (Array.isArray(response)) {
        return response;
      } else if (response && typeof response === 'object') {
        // Handle if the API returns an object with a data/results property
        if (Array.isArray(response.results)) {
          return response;
        } else if (response.data && Array.isArray(response.data)) {
          return response;
        }
      }
      
      // Default return empty array
      console.error('Unexpected response format:', response);
      return [];
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
      console.log(`Cập nhật thông tin công dân ID ${citizenId}:`, citizenData);
      
      // Gọi API để cập nhật thông tin công dân
      const response = await put(API_ENDPOINTS.OFFICER.CITIZEN_UPDATE(citizenId), citizenData);
      
      console.log(`Cập nhật thành công công dân với ID ${citizenId}:`, response);
      return response;
    } catch (error) {
      console.error(`Lỗi khi cập nhật công dân với ID ${citizenId}:`, error);
      throw error; // Re-throw error to be handled by component
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
      const response = await get(API_ENDPOINTS.OFFICER.STATISTICS, params);
      return response;
    } catch (error) {
      console.error('Error fetching officer statistics:', error);
      throw error; // Re-throw error to be handled by component
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