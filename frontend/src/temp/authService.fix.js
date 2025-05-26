import { API_ENDPOINTS, get, post, put } from '../utils/api';
import { API_ENDPOINTS as REAL_API_ENDPOINTS } from '../utils/apiConfig';

// Sử dụng endpoints thực tế từ apiConfig
const AUTH_ENDPOINTS = REAL_API_ENDPOINTS.AUTH;

// Mock data for fallback when API is not available
const mockResponses = {
  login: (credentials) => {
    const role = credentials.role || 'citizen';
    return {
      success: true,
      user_id: 'USR' + Math.floor(1000000 + Math.random() * 9000000),
      first_name: role === 'citizen' ? 'Nguyễn' : (role === 'officer' ? 'Lê' : 'Admin'),
      last_name: role === 'citizen' ? 'Văn A' : (role === 'officer' ? 'Thị B' : '(Chủ tịch xã)'),
      email: credentials.email || 'user@example.com',
      role: role,
      token: 'mock-jwt-token-' + Math.random().toString(36).substring(2, 15)
    };
  },
  googleLogin: (googleData) => {
    const role = googleData.role || 'citizen';
    return {
      success: true,
      user_id: 'GSR' + Math.floor(1000000 + Math.random() * 9000000),
      first_name: role === 'citizen' ? 'Google' : (role === 'officer' ? 'Goog' : 'G-Admin'),
      last_name: role === 'citizen' ? 'User' : (role === 'officer' ? 'Officer' : 'Chairman'),
      email: 'google.user@gmail.com',
      role: role,
      token: 'mock-google-jwt-token-' + Math.random().toString(36).substring(2, 15)
    };
  },
  register: (userData) => {
    return {
      success: true,
      message: 'Đăng ký thành công (Mô phỏng)',
      user_id: 'USR' + Math.floor(1000000 + Math.random() * 9000000),
      first_name: userData.firstName || userData.first_name || 'Người',
      last_name: userData.lastName || userData.last_name || 'Dùng',
      email: userData.email || 'user@example.com',
      role: userData.role || 'citizen',
    };
  },
  registerOfficer: (officerData) => {
    return {
      success: true,
      message: 'Đăng ký cán bộ thành công, hồ sơ của bạn đang chờ chủ tịch xã phê duyệt. (Mô phỏng)',
      user_id: 'OFF' + Math.floor(1000000 + Math.random() * 9000000),
      first_name: officerData.firstName || officerData.first_name || 'Cán',
      last_name: officerData.lastName || officerData.last_name || 'Bộ',
      email: officerData.email || 'officer@example.com',
      role: 'officer_pending',
    };
  },
  verifyToken: () => {
    return {
      isValid: true,
      message: 'Token hợp lệ (Mô phỏng)'
    };
  },
  refreshToken: () => {
    return {
      token: 'mock-refreshed-jwt-token-' + Math.random().toString(36).substring(2, 15),
      message: 'Token đã được làm mới (Mô phỏng)'
    };
  },
  profile: () => {
    const user = JSON.parse(localStorage.getItem('authUser')) || {};
    return {
      user_id: user.id || 'USR123456789',
      first_name: user.name?.split(' ')[0] || 'Người',
      last_name: user.name?.split(' ').slice(1).join(' ') || 'Dùng',
      email: user.email || 'user@example.com',
      role: user.role || 'citizen',
      created_at: new Date().toISOString(),
      profile_image: null,
      phone_number: '0123456789',
      address: 'Số 10, Đường ABC, Phường XYZ, Quận 123, TP HCM'
    };
  },
  resetPassword: (email) => {
    return {
      success: true,
      message: 'Link đặt lại mật khẩu đã được gửi vào email của bạn. (Mô phỏng)'
    };
  },
  confirmResetPassword: (data) => {
    return {
      success: true,
      message: 'Mật khẩu đã được đặt lại thành công. (Mô phỏng)'
    };
  },
  changePassword: (data) => {
    return {
      success: true,
      message: 'Mật khẩu đã được thay đổi thành công. (Mô phỏng)'
    };
  },
  logout: () => {
    return {
      success: true,
      message: 'Đăng xuất thành công. (Mô phỏng)'
    };
  }
};

// Utility function to log mock data warnings
const logMockDataWarning = (endpoint) => {
  console.warn(`🔶 MOCK DATA: Using mock data for endpoint ${endpoint}. Backend API server is not responding.`);
  console.warn('🔶 To connect to the real backend, ensure your API server is running at the appropriate URL');
};

// Authentication service with mock data fallback
const authService = {
  // Login function - attempt real API, fall back to mock if unavailable
  login: async (credentials) => {
    try {
      // Try to call real API endpoint with correct format expected by Django REST auth
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
          
          return response;
        }
        
        return response;
      } catch (error) {
        console.error('Login API error:', error);
        // If API is not available (404 or server error), use mock data
        if (error.response && (error.response.status === 404 || error.response.status >= 500)) {
          logMockDataWarning('login');
          const mockResponse = mockResponses.login(credentials);
          
          // Store mock token and user for session persistence
          localStorage.setItem('token', mockResponse.token);
          localStorage.setItem('authUser', JSON.stringify({
            id: mockResponse.user_id,
            name: `${mockResponse.first_name} ${mockResponse.last_name}`,
            email: mockResponse.email,
            role: mockResponse.role
          }));
          
          return mockResponse;
        }
        throw error;
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Google login with mock data fallback
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
        isAuthCode: googleData.isAuthCode
      };
      
      // Call the real API endpoint
      try {
        const response = await post(AUTH_ENDPOINTS.GOOGLE_AUTH, payload, {
          timeout: 60000 // Longer timeout for OAuth processing
        });
        return response;
      } catch (error) {
        console.error('Google login API error:', error);
        // Fall back to mock data for Google login
        if (error.response && (error.response.status === 404 || error.response.status >= 500)) {
          logMockDataWarning('google-auth');
          const mockResponse = mockResponses.googleLogin(googleData);
          
          // Store mock token and user data
          localStorage.setItem('token', mockResponse.token);
          localStorage.setItem('authUser', JSON.stringify({
            id: mockResponse.user_id,
            name: `${mockResponse.first_name} ${mockResponse.last_name}`,
            email: mockResponse.email,
            role: mockResponse.role
          }));
          
          return mockResponse;
        }
        throw error;
      }
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  },

  // Register function with mock data fallback
  register: async (userData) => {
    try {
      // Call real API endpoint
      try {
        const response = await post(AUTH_ENDPOINTS.REGISTER, userData);
        return response;
      } catch (error) {
        // If API is not available, return mock success
        if (error.response && (error.response.status === 404 || error.response.status >= 500)) {
          logMockDataWarning('register');
          return mockResponses.register(userData);
        }
        throw error;
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Register officer function with mock data fallback
  registerOfficer: async (officerData) => {
    try {
      // Call real API endpoint with officer role
      const data = { 
        ...officerData,
        role: 'officer_pending'
      };
      
      try {
        // Use the specific endpoint for officer registration
        const response = await post(AUTH_ENDPOINTS.REGISTER_CHAIRMAN, data);
        return response;
      } catch (error) {
        // If API is not available, return mock success
        if (error.response && (error.response.status === 404 || error.response.status >= 500)) {
          logMockDataWarning('register-officer');
          return mockResponses.registerOfficer(officerData);
        }
        throw error;
      }
    } catch (error) {
      console.error('Officer registration error:', error);
      throw error;
    }
  },

  // Verify token with mock data fallback
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
        // Use mock data for token verification if API is unavailable
        if (error.response && (error.response.status === 404 || error.response.status >= 500)) {
          logMockDataWarning('verify-token');
          return mockResponses.verifyToken();
        }
        throw error;
      }
    } catch (error) {
      console.error('Token verification error:', error);
      throw error;
    }
  },
  
  // Refresh token with mock data fallback
  refreshToken: async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No token found for refresh');
      }
      
      try {
        const response = await post(AUTH_ENDPOINTS.REFRESH, { refresh: token });
        
        if (response && response.token) {
          localStorage.setItem('token', response.token);
        }
        
        return response;
      } catch (error) {
        // Use mock data for token refresh if API is unavailable
        if (error.response && (error.response.status === 404 || error.response.status >= 500)) {
          logMockDataWarning('refresh-token');
          const mockResponse = mockResponses.refreshToken();
          localStorage.setItem('token', mockResponse.token);
          return mockResponse;
        }
        throw error;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  },
  
  // Get current user profile with mock data fallback
  getCurrentUser: async () => {
    try {
      try {
        const response = await get(AUTH_ENDPOINTS.PROFILE);
        
        // Update stored user data if successful
        if (response) {
          localStorage.setItem('authUser', JSON.stringify(response));
        }
        
        return response;
      } catch (error) {
        // Use mock data for profile if API is unavailable
        if (error.response && (error.response.status === 404 || error.response.status >= 500)) {
          logMockDataWarning('profile');
          return mockResponses.profile();
        }
        throw error;
      }
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },
  
  // Request password reset with mock data fallback
  requestPasswordReset: async (data) => {
    try {
      try {
        const response = await post(AUTH_ENDPOINTS.RESET_PASSWORD, data);
        return response;
      } catch (error) {
        // Use mock data for password reset if API is unavailable
        if (error.response && (error.response.status === 404 || error.response.status >= 500)) {
          logMockDataWarning('reset-password');
          return mockResponses.resetPassword(data.email);
        }
        throw error;
      }
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  },
  
  // Confirm password reset with mock data fallback
  confirmPasswordReset: async (data) => {
    try {
      try {
        const response = await post(AUTH_ENDPOINTS.RESET_PASSWORD_CONFIRM, data);
        return response;
      } catch (error) {
        // Use mock data for password reset confirmation if API is unavailable
        if (error.response && (error.response.status === 404 || error.response.status >= 500)) {
          logMockDataWarning('reset-password-confirm');
          return mockResponses.confirmResetPassword(data);
        }
        throw error;
      }
    } catch (error) {
      console.error('Password reset confirmation error:', error);
      throw error;
    }
  },
  
  // Change password with mock data fallback
  changePassword: async (data) => {
    try {
      try {
        const response = await post(AUTH_ENDPOINTS.CHANGE_PASSWORD, data);
        return response;
      } catch (error) {
        // Use mock data for password change if API is unavailable
        if (error.response && (error.response.status === 404 || error.response.status >= 500)) {
          logMockDataWarning('change-password');
          return mockResponses.changePassword(data);
        }
        throw error;
      }
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  },
  
  // Logout with mock data fallback
  logout: async () => {
    try {
      try {
        // Call API logout
        const response = await post(AUTH_ENDPOINTS.LOGOUT);
        // Always clean up local storage
        localStorage.removeItem('token');
        localStorage.removeItem('authUser');
        return response;
      } catch (error) {
        // Use mock data for logout if API is unavailable
        if (error.response && (error.response.status === 404 || error.response.status >= 500)) {
          logMockDataWarning('logout');
          // Always clean up local storage
          localStorage.removeItem('token');
          localStorage.removeItem('authUser');
          return mockResponses.logout();
        }
        
        // Even if there's an error, we still want to clean up local storage
        localStorage.removeItem('token');
        localStorage.removeItem('authUser');
        throw error;
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Ensure local storage is cleaned up even if an error occurs
      localStorage.removeItem('token');
      localStorage.removeItem('authUser');
      throw error;
    }
  },

  // Get user profile with mock data fallback
  getUserProfile: async () => {
    try {
      try {
        const response = await get(AUTH_ENDPOINTS.PROFILE);
        return response;
      } catch (error) {
        // Use mock data for profile if API is unavailable
        if (error.response && (error.response.status === 404 || error.response.status >= 500)) {
          logMockDataWarning('user-profile');
          return mockResponses.profile();
        }
        throw error;
      }
    } catch (error) {
      console.error('Get user profile error:', error);
      throw error;
    }
  },

  // Update user profile with mock data fallback
  updateUserProfile: async (profileData) => {
    try {
      try {
        const response = await put(AUTH_ENDPOINTS.PROFILE, profileData);
        return response;
      } catch (error) {
        // Use mock data for profile update if API is unavailable
        if (error.response && (error.response.status === 404 || error.response.status >= 500)) {
          logMockDataWarning('update-profile');
          
          // Update local stored user data with new profile data
          const currentUser = JSON.parse(localStorage.getItem('authUser') || '{}');
          const updatedUser = { ...currentUser, ...profileData };
          localStorage.setItem('authUser', JSON.stringify(updatedUser));
          
          return {
            success: true,
            message: 'Thông tin đã được cập nhật thành công. (Mô phỏng)',
            ...mockResponses.profile(),
            ...profileData
          };
        }
        throw error;
      }
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }
};

export default authService; 