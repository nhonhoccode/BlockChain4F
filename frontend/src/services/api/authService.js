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
      // Kiểm tra xem có phải đăng nhập bằng token (Google) hay không
      if (credentials.token && !credentials.password) {
        console.log('Login with token (no password - Google auth)');
        
        // Sử dụng token trực tiếp mà không cần gửi password
        const payload = {
          token: credentials.token,
          role: credentials.role || 'citizen',
        };
        
        // Gọi API với token
        const response = await post(AUTH_ENDPOINTS.GOOGLE_AUTH, payload, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          withCredentials: true
        });
        
        console.log('Token login response:', response);
        
        if (response && (response.token || response.access)) {
          const token = response.token || response.access;
          localStorage.setItem('token', token);
          
          return {
            success: true,
            user: response.user || {
              id: response.user_id,
              email: response.email,
              first_name: response.first_name || '',
              last_name: response.last_name || '',
              role: response.role || credentials.role
            },
            token,
            role: response.role || credentials.role
          };
        }
        
        return response;
      }
      
      // Đăng nhập thông thường với username/password
      // Step 1: Standard authentication to get token
      const response = await post(AUTH_ENDPOINTS.LOGIN, {
        username: credentials.email,
        password: credentials.password,
        // Thêm các trường khác mà API có thể cần
        grant_type: 'password',
        client_id: 'frontend-client',
        // Debug log
        _frontend_version: '1.0.0',
        _auth_attempt_time: new Date().toISOString()
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        withCredentials: true
      });
      
      console.log('Login response:', response);
      
      // If successful, store the token
      if (response && (response.token || response.access)) {
        const token = response.token || response.access;
        localStorage.setItem('token', token);
        
        // Step 2: Get user profile with the token
        try {
          const userResponse = await get(AUTH_ENDPOINTS.USER_PROFILE, null, {
            headers: {
              'Authorization': `Token ${token}`
            }
          });
          
          if (userResponse) {
            // Store user data
            localStorage.setItem('authUser', JSON.stringify(userResponse));
            
            // Check if requested role matches user's role
            if (credentials.role && userResponse.role !== credentials.role) {
              return {
                success: false, 
                error: `Role mismatch. Your account has role: ${userResponse.role}`,
                user: userResponse,
                token
              };
            }
            
            // Return successful response with user data
            return {
              success: true,
              user: userResponse,
              token,
              role: userResponse.role
            };
          }
        } catch (userError) {
          console.error('Error fetching user profile:', userError);
          // Even if profile fetch fails, return token info
          return {
            success: true,
            token,
            error: 'Token obtained but user profile fetch failed'
          };
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
      console.log('Registering officer with data:', {
        ...officerData,
        password: '***HIDDEN***',
        password_confirm: '***HIDDEN***'
      });
      
      // Xử lý fullName thành first_name và last_name
      let first_name = '';
      let last_name = '';
      
      if (officerData.fullName) {
        const nameParts = officerData.fullName.trim().split(' ');
        if (nameParts.length > 1) {
          last_name = nameParts.pop(); // Lấy phần tử cuối cùng làm họ
          first_name = nameParts.join(' '); // Phần còn lại là tên
        } else {
          // Nếu chỉ có một từ, đặt làm first_name
          first_name = officerData.fullName;
        }
      }
      
      // Đầu tiên đăng ký tài khoản với role 'officer_pending'
      const userData = { 
        email: officerData.email,
        password: officerData.password,
        password_confirm: officerData.password,
        first_name: first_name,
        last_name: last_name,
        role: 'officer_pending', // Đảm bảo role là officer_pending
        gender: 'male', // Mặc định giới tính là nam nếu không có
        idNumber: officerData.idNumber // Thêm idNumber vào dữ liệu đăng ký
      };
      
      // Thêm các thông tin khác nếu có
      if (officerData.phoneNumber) {
        userData.phone_number = officerData.phoneNumber;
      }
      
      if (officerData.address) {
        userData.address = officerData.address;
      }
      
      // Xử lý ngày sinh nếu có
      if (officerData.dateOfBirth) {
        // Chuyển đổi định dạng ngày nếu cần
        userData.date_of_birth = officerData.dateOfBirth;
      }
      
      // Gọi API đăng ký tài khoản
      const registrationResponse = await post(AUTH_ENDPOINTS.REGISTER_OFFICER, userData);
      
      if (registrationResponse && registrationResponse.success) {
        console.log('Officer account registered successfully, creating approval request');
        
        // Chuẩn bị dữ liệu cho yêu cầu phê duyệt
        const officerRequestData = {
          position: officerData.position || 'Cán bộ xã',
          qualifications: officerData.qualifications || officerData.educationLevel || '',
          experience: officerData.experienceYears ? `${officerData.experienceYears} năm kinh nghiệm` : '',
          motivation: officerData.motivation || 'Đăng ký làm cán bộ xã',
          id_card_number: officerData.idNumber || '',
          id_card_issue_date: officerData.id_card_issue_date || null,
          id_card_issue_place: officerData.id_card_issue_place || '',
          additional_info: JSON.stringify({
            department: officerData.department || '',
            education_level: officerData.educationLevel || '',
            major: officerData.major || '',
            graduation_year: officerData.graduationYear || '',
            current_job: officerData.currentJob || ''
          })
        };
        
        try {
          // Đăng nhập để lấy token
          const loginResponse = await authService.login({
            email: officerData.email,
            password: officerData.password
          });
          
          if (loginResponse && loginResponse.token) {
            // Gửi yêu cầu phê duyệt cán bộ
            const approvalEndpoint = '/api/v1/officer-management/requests/';
            const approvalResponse = await post(approvalEndpoint, officerRequestData);
            
            return {
              success: true,
              message: 'Đăng ký thành công. Yêu cầu của bạn đang chờ phê duyệt từ chủ tịch xã.',
              registrationData: registrationResponse,
              approvalData: approvalResponse
            };
          }
        } catch (approvalError) {
          console.error('Error creating officer approval request:', approvalError);
          // Vẫn trả về thành công vì tài khoản đã được tạo
          return {
            success: true,
            partial: true,
            message: 'Tài khoản đã được tạo nhưng có lỗi khi gửi yêu cầu phê duyệt. Vui lòng liên hệ quản trị viên.',
            registrationData: registrationResponse,
            error: approvalError.message
          };
        }
      }
      
      return registrationResponse;
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
        token: googleData.token ? `${googleData.token.substring(0, 10)}...` : 'MISSING',
        role: googleData.role,
        isAuthCode: googleData.isAuthCode
      });
      
      // Validate input data
      if (!googleData.token) {
        throw new Error('Google token is required');
      }
      
      // Kiểm tra cache để tránh gửi nhiều lần cùng một token
      const cacheKey = `google_login_${googleData.token.substring(0, 20)}`;
      const cachedResponse = sessionStorage.getItem(cacheKey);
      
      if (cachedResponse) {
        try {
          console.log('🚀 Using cached Google login response');
          return JSON.parse(cachedResponse);
        } catch (error) {
          console.error('Error parsing cached response:', error);
          // Tiếp tục với request thật nếu không đọc được cache
        }
      }
      
      // Lưu lại role ban đầu được yêu cầu để sử dụng sau này
      const originalRequestedRole = googleData.role || 'citizen';
      
      // Format payload according to backend expectations
      // Trong mã nguồn backend, tham số cần thiết là token
      const payload = {
        token: googleData.token, // Phải sử dụng key là 'token' theo yêu cầu backend
        role: googleData.role || 'citizen',
        isAuthCode: true, // Đảm bảo backend biết đây là auth code
        redirect_uri: googleData.redirect_uri || window.location.origin + '/auth/google/callback'
      };
      
      console.log('🚀 Sending formatted payload to backend:', {
        ...payload,
        token: payload.token ? `${payload.token.substring(0, 10)}...` : 'MISSING'
      });
      
      try {
        // First attempt with requested role
        const response = await post(AUTH_ENDPOINTS.GOOGLE_AUTH, payload, {
          timeout: 60000, // Longer timeout for OAuth processing
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        console.log('🚀 Google login API response received:', response);
        
        // Chuẩn hóa response để đảm bảo có cấu trúc nhất quán
        const normalizedResponse = {
          ...response,
          token: response.token || response.access,
          user: response.user || {
            id: response.user_id || response.id,
            email: response.email,
            first_name: response.first_name || '',
            last_name: response.last_name || '',
            role: response.role || originalRequestedRole
          },
          role: response.role || originalRequestedRole
        };
        
        // Cache response
        sessionStorage.setItem(cacheKey, JSON.stringify(normalizedResponse));
        
        return normalizedResponse;
      } catch (error) {
        // Debug error response
        console.log('🔍 Google login error response:', error.response);
        
        // Extract role mismatch info from response data
        let actualRole = null;
        let errorMessage = '';
        
        // Check for role mismatch in various error formats
        if (error.response && error.response.data) {
          const data = error.response.data;
          console.log('🔍 Response data:', data);
          errorMessage = data.detail || data.message || data.error || JSON.stringify(data);
          
          // Try to extract actual role from response data
          if (data.actual_role) {
            // Direct field in response
            actualRole = data.actual_role;
          } else if (data.message && typeof data.message === 'string') {
            // Try to extract from error message
            const roleMismatchRegex = /Role mismatch for .+\. Requested: \w+, Actual: (\w+)/;
            const match = data.message.match(roleMismatchRegex);
            if (match && match[1]) {
              actualRole = match[1];
            }
          } else if (data.detail && typeof data.detail === 'string') {
            // Try to extract from detail message
            const roleMismatchRegex = /Role mismatch for .+\. Requested: \w+, Actual: (\w+)/;
            const match = data.detail.match(roleMismatchRegex);
            if (match && match[1]) {
              actualRole = match[1];
            }
          }
          
          // Thử lại với biểu thức chính quy khác nếu chưa tìm thấy
          if (!actualRole && errorMessage) {
            const anyRoleRegex = /Actual: (\w+)/i;
            const match = errorMessage.match(anyRoleRegex);
            if (match && match[1]) {
              actualRole = match[1].toLowerCase();
            }
          }
          
          // Check if we found the actual role
          if (actualRole) {
            console.log(`🔄 Role mismatch detected. Actual role: ${actualRole}`);
            
            // Create new payload with correct role
            const correctRolePayload = {
              ...payload,
              role: actualRole
            };
            
            console.log(`🔄 Retrying with correct role: ${actualRole}`);
            
            try {
              // Second attempt with correct role
              const retryResponse = await post(AUTH_ENDPOINTS.GOOGLE_AUTH, correctRolePayload, {
                timeout: 60000
              });
              
              console.log('🔄 Retry successful with correct role!', retryResponse);
              
              // Chuẩn hóa response
              const normalizedResponse = {
                ...retryResponse,
                token: retryResponse.token || retryResponse.access,
                user: retryResponse.user || {
                  id: retryResponse.user_id || retryResponse.id,
                  email: retryResponse.email,
                  first_name: retryResponse.first_name || '',
                  last_name: retryResponse.last_name || '',
                  role: actualRole
                },
                role: actualRole,
                originalRequestedRole: originalRequestedRole,
                actualRole: actualRole,
                roleMismatch: true
              };
              
              // Cache response
              sessionStorage.setItem(cacheKey, JSON.stringify(normalizedResponse));
              
              return normalizedResponse;
            } catch (retryError) {
              console.error('🔄 Retry failed:', retryError);
              throw new Error(`Không thể đăng nhập với vai trò ${actualRole}. Vui lòng thử lại hoặc liên hệ quản trị viên.`);
            }
          }
        }
        
        // If role mismatch not found, rethrow the original error
        throw error;
      }
    } catch (error) {
      console.error('⚠️ Google login error:', error);
      
      // Format a user-friendly error message
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.detail || 
                          error.message || 
                          'Đăng nhập Google thất bại. Vui lòng thử lại.';
      
      throw new Error(errorMessage);
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
      const response = await get(AUTH_ENDPOINTS.USER_PROFILE);
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