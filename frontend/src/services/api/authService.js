import { get, post, put } from '../../utils/api';
import { API_ENDPOINTS as REAL_API_ENDPOINTS } from '../../utils/apiConfig';

// Use endpoints from apiConfig
const AUTH_ENDPOINTS = REAL_API_ENDPOINTS.AUTH;

// Auth service
const authService = {
  /**
   * Đăng nhập người dùng
   * @param {Object} credentials - Thông tin đăng nhập (email, password)
   * @returns {Promise<Object>} Thông tin đăng nhập và token
   */
  login: async (credentials) => {
    try {
      const response = await post(AUTH_ENDPOINTS.LOGIN, {
        username: credentials.email,
        password: credentials.password,
        role: credentials.role
      });
      
      // If successful, return the response
      if (response && (response.token || response.access)) {
        // Store token (handle both token and access formats)
        localStorage.setItem('token', response.token || response.access);
        
        // Extract user data if available
        if (response.user) {
          localStorage.setItem('authUser', JSON.stringify(response.user));
        }
      }
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  /**
   * Đăng ký tài khoản người dùng mới (công dân)
   * @param {Object} userData - Thông tin đăng ký
   * @returns {Promise<Object>} Kết quả đăng ký
   */
  register: async (userData) => {
    try {
      // Đảm bảo các trường bắt buộc luôn có giá trị
      const registrationData = {
        username: userData.username || userData.email,
        email: userData.email,
        password: userData.password,
        password_confirm: userData.password_confirm,
        first_name: userData.first_name ? userData.first_name.trim() : '',
        last_name: userData.last_name ? userData.last_name.trim() : '',
        phone_number: userData.phone_number || '',
        role: userData.role || 'citizen',
        
        // Thông tin địa chỉ
        address: userData.address || '',
        ward: userData.ward || '',
        district: userData.district || '',
        province: userData.province || '',
        
        // Thông tin CMND/CCCD
        id_card_number: userData.id_card_number || '',
        id_card_issue_date: userData.id_card_issue_date || null,
        id_card_issue_place: userData.id_card_issue_place || '',
        
        // Thông tin khác
        date_of_birth: userData.date_of_birth || null,
        gender: userData.gender || 'male'
      };
      
      console.log('Sending registration data to server:', {
        ...registrationData,
        password: '***HIDDEN***',
        password_confirm: '***HIDDEN***'
      });
      
      // Log raw request data để kiểm tra
      console.log('Raw registration data:', {
        ...userData,
        password: '***HIDDEN***',
        password_confirm: '***HIDDEN***'
      });
      
      // Kiểm tra endpoint
      console.log('Registration endpoint:', AUTH_ENDPOINTS.REGISTER);
      
      // Gửi dữ liệu đăng ký đến API
      const response = await post(AUTH_ENDPOINTS.REGISTER, registrationData);
      
      console.log('Registration response:', response);
      return response;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },
  
  /**
   * Đăng ký tài khoản cán bộ mới
   * @param {Object} officerData - Thông tin đăng ký cán bộ
   * @returns {Promise<Object>} Kết quả đăng ký
   */
  registerOfficer: async (officerData) => {
    try {
      // Call real API endpoint with officer role
      const data = { 
        ...officerData,
        role: 'officer_pending'
      };
      
      const response = await post(AUTH_ENDPOINTS.REGISTER_CHAIRMAN, data);
      return response;
    } catch (error) {
      console.error('Officer register error:', error);
      throw error;
    }
  },
  
  /**
   * Đăng xuất người dùng
   * @returns {Promise<Object>} Kết quả đăng xuất
   */
  logout: async () => {
    try {
      const response = await post(AUTH_ENDPOINTS.LOGOUT);
      // Always clean up local storage
      localStorage.removeItem('token');
      localStorage.removeItem('authUser');
      return response;
    } catch (error) {
      console.error('Logout error:', error);
      // Ensure local storage is cleaned up even if an error occurs
      localStorage.removeItem('token');
      localStorage.removeItem('authUser');
      throw error;
    }
  },
  
  /**
   * Kiểm tra token hiện tại có hợp lệ không
   * @returns {Promise<Object>} Kết quả kiểm tra
   */
  verifyToken: async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No token found');
      }
      
      try {
        const response = await post(AUTH_ENDPOINTS.VERIFY, { token });
        return response;
      } catch (error) {
        // Xử lý trường hợp endpoint không tồn tại (404)
        if (error.response && error.response.status === 404) {
          console.log('Token verification endpoint not found (404). This is expected if the endpoint is not implemented yet.');
          // Trả về kết quả giả định token hợp lệ nếu endpoint không tồn tại
          return { isValid: true, message: 'Token verification endpoint not available' };
        }
        throw error;
      }
    } catch (error) {
      console.error('Token verification error:', error);
      throw error;
    }
  },
  
  /**
   * Refresh token
   * @returns {Promise<Object>} Token mới
   */
  refreshToken: async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No token found for refresh');
      }
      
      const response = await post(AUTH_ENDPOINTS.REFRESH, { refresh: token });
      
      if (response && response.token) {
        localStorage.setItem('token', response.token);
      }
      
      return response;
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  },
  
  /**
   * Lấy thông tin người dùng hiện tại
   * @returns {Promise<Object>} Thông tin người dùng
   */
  getCurrentUser: async () => {
    try {
      const response = await get(AUTH_ENDPOINTS.PROFILE);
      
      // Cập nhật thông tin user trong localStorage
      if (response) {
        localStorage.setItem('authUser', JSON.stringify(response));
      }
      
      return response;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },
  
  /**
   * Yêu cầu đặt lại mật khẩu
   * @param {Object} data - Dữ liệu yêu cầu (email)
   * @returns {Promise<Object>} Kết quả yêu cầu
   */
  requestPasswordReset: async (data) => {
    try {
      const response = await post(AUTH_ENDPOINTS.RESET_PASSWORD, data);
      return response;
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  },
  
  /**
   * Xác nhận đặt lại mật khẩu
   * @param {Object} data - Dữ liệu xác nhận (token, password, confirmPassword)
   * @returns {Promise<Object>} Kết quả xác nhận
   */
  confirmPasswordReset: async (data) => {
    try {
      const response = await post(AUTH_ENDPOINTS.RESET_PASSWORD_CONFIRM, data);
      return response;
    } catch (error) {
      console.error('Password reset confirmation error:', error);
      throw error;
    }
  },
  
  /**
   * Đổi mật khẩu
   * @param {Object} data - Dữ liệu đổi mật khẩu (oldPassword, newPassword)
   * @returns {Promise<Object>} Kết quả đổi mật khẩu
   */
  changePassword: async (data) => {
    try {
      const response = await post(AUTH_ENDPOINTS.CHANGE_PASSWORD, data);
      return response;
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  },

  // Google OAuth login
  googleLogin: async (googleData) => {
    try {
      console.log('🚀 Calling Google login API with:', {
        token: googleData.token ? 'PRESENT (not shown for security)' : 'MISSING',
        role: googleData.role,
        isAuthCode: googleData.isAuthCode
      });
      
      // Validate input data
      if (!googleData.token) {
        throw new Error('Google token is required');
      }
      
      // Format payload according to backend expectations
      const payload = {
        token: googleData.token,
        role: googleData.role || 'citizen',
        isAuthCode: googleData.isAuthCode // Backend expects 'isAuthCode' not 'is_auth_code'
      };
      
      console.log('🚀 Sending formatted payload to backend:', {
        ...payload,
        token: payload.token ? 'PRESENT (not shown for security)' : 'MISSING'
      });
      
      // Call the real API endpoint with longer timeout
      const response = await post(AUTH_ENDPOINTS.GOOGLE_AUTH, payload, {
        timeout: 60000 // Longer timeout for OAuth processing
      });
      
      console.log('🚀 Google login API response received:', response.success ? 'Success' : 'Failed');
      return response;
    } catch (error) {
      console.error('⚠️ Google login error:', error);
      
      // Provide more helpful error message for common issues
      if (error.response) {
        // The request was made and the server responded with an error status
        const { status, data } = error.response;
        
        if (status === 400) {
          // Special handling for invalid credentials
          if (data && data.message && (
              data.message.includes('Invalid Credentials') ||
              data.message.includes('invalid_request') ||
              data.message.includes('Token không hợp lệ')
          )) {
            console.log('⚠️ Google token validation failed:', data.message);
            throw new Error('Google authentication failed: The authentication token is invalid or expired. Please try logging in again.');
          } 
          // Handle missing token
          else if (data && data.message && data.message.includes('Token không được cung cấp')) {
            throw new Error('Google token is missing in the request. Please try again.');
          } 
          // Generic error message based on server response
          else if (data && data.message) {
            throw new Error(`Google authentication failed: ${data.message}`);
          }
        } else if (status === 403) {
          throw new Error('Access denied. You may not have permission for this operation.');
        }
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('Unable to reach the authentication server. Please check your internet connection.');
      }
      
      // Default error
      throw error;
    }
  },

  // Google OAuth register
  googleRegister: async (googleData) => {
    try {
      console.log('Calling Google register API with:', {
        token: googleData.token ? 'PRESENT (not shown for security)' : 'MISSING',
        role: googleData.role,
        isAuthCode: googleData.isAuthCode,
        hasAdditionalData: !!googleData.additionalData
      });
      
      if (!googleData.token) {
        throw new Error('Google token is required');
      }
      
      // Format payload
      const payload = {
        token: googleData.token,
        role: googleData.role || 'citizen',
        isAuthCode: googleData.isAuthCode,
        additionalData: googleData.additionalData || {}
      };
      
      const response = await post(AUTH_ENDPOINTS.GOOGLE_REGISTER, payload, {
        timeout: 60000 // Longer timeout for OAuth processing
      });
      
      return response;
    } catch (error) {
      console.error('Google register error:', error);
      throw error;
    }
  },

  // Get user profile
  getUserProfile: async () => {
    try {
      const response = await get(AUTH_ENDPOINTS.PROFILE);
      return response;
    } catch (error) {
      console.error('Get user profile error:', error);
      throw error;
    }
  },

  // Update user profile
  updateUserProfile: async (profileData) => {
    try {
      const response = await put(AUTH_ENDPOINTS.PROFILE, profileData);
      return response;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }
};

export default authService; 