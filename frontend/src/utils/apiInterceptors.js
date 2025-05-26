/**
 * API Interceptors for handling different response statuses
 */

/**
 * Configure response interceptor for an axios instance
 * @param {Object} api - Axios instance
 * @param {Function} logResponse - Response logging function
 * @param {Function} logError - Error logging function
 */
export const configureResponseInterceptors = (api, logResponse, logError) => {
  api.interceptors.response.use(
    (response) => {
      // Log detailed response if enabled
      logResponse(response);
      return response;
    },
    (error) => {
      // Enhanced error logging
      logError(error, error.config?.url || 'UNKNOWN_ENDPOINT');
      
      // Handle Google OAuth errors gracefully
      if (error.response && error.response.status === 400 && 
          error.config && error.config.url && 
          error.config.url.includes('/google-auth')) {
        console.warn(`Google OAuth error on ${error.config.url}:`, error.response.data);
        // Don't intercept this error, just log it - let the UI component handle it
        return Promise.reject(error);
      }
      
      // Specific handling for token/verify 404 errors - don't treat as fatal
      if (error.response && error.response.status === 404 && 
          error.config && error.config.url && 
          error.config.url.includes('/token/verify')) {
        console.warn('Token verification endpoint not found (404). This is expected if the endpoint is not implemented yet.');
        return Promise.reject(error);
      }
      
      // Special handling for logout 401s - this can happen if token is already invalid
      if (error.response && error.response.status === 401 && 
          error.config && error.config.url && 
          error.config.url.includes('/logout')) {
        console.warn('401 on logout endpoint - this is expected if token is already invalid');
        // Return success for the client side since we're logging out anyway
        return Promise.resolve({ data: { success: true, message: 'Logged out successfully' }});
      }
      
      // Handle 403 Forbidden errors for dashboard stats - this can happen if role mismatch 
      // or insufficient permissions
      if (error.response && error.response.status === 403 && 
          error.config && error.config.url && 
          error.config.url.includes('/dashboard/stats')) {
        console.warn(`403 Forbidden on ${error.config.url} - This usually means role mismatch or insufficient permissions.`);
        console.warn('Error message from server:', error.response.data);
        
        // Return empty data structure based on the endpoint
        if (error.config.url.includes('/chairman/dashboard/stats')) {
          // Richer fallback data for chairman dashboard
          return Promise.resolve({ 
            data: { 
              stats: {
                pendingOfficerApprovals: 3,
                totalOfficers: 12,
                pendingDocuments: 7,
                totalDocuments: 45,
                recentApprovals: 5,
                activeOfficers: 10
              },
              pendingApprovals: [
                { id: 'mock-1', name: 'Nguyễn Văn A', position: 'Cán bộ hành chính', requestDate: '2025-05-15', status: 'pending' },
                { id: 'mock-2', name: 'Trần Thị B', position: 'Cán bộ hành chính', requestDate: '2025-05-16', status: 'pending' },
                { id: 'mock-3', name: 'Lê Minh C', position: 'Cán bộ hành chính', requestDate: '2025-05-17', status: 'pending' }
              ],
              recentActivity: [
                { id: 'act-1', action: 'Phê duyệt cán bộ', user: 'Nguyễn Văn X', time: '2025-05-18T10:30:00Z', status: 'approved' },
                { id: 'act-2', action: 'Từ chối cán bộ', user: 'Trần Văn Y', time: '2025-05-18T09:15:00Z', status: 'rejected' }
              ],
              recentApprovals: [
                { id: 'app-1', document: 'Giấy chứng nhận đất', citizen: 'Nguyễn Thị D', date: '2025-05-18T08:00:00Z' },
                { id: 'app-2', document: 'Giấy phép xây dựng', citizen: 'Trần Văn E', date: '2025-05-17T14:30:00Z' }
              ],
              officerPerformance: [
                { name: 'Nguyễn Văn X', completed: 25, pending: 5, processing: 3 },
                { name: 'Trần Văn Y', completed: 18, pending: 7, processing: 2 }
              ],
              message: 'Đang hiển thị dữ liệu mẫu. Bạn không có quyền truy cập trang này hoặc vai trò không phải là chủ tịch/admin.' 
            } 
          });
        } else if (error.config.url.includes('/officer/dashboard/stats')) {
          // Richer fallback data for officer dashboard
          return Promise.resolve({ 
            data: { 
              stats: {
                pendingRequests: 5,
                processingRequests: 3,
                completedRequests: 12,
                totalCitizens: 150,
                totalRequests: 20,
                documentsIssued: 15
              },
              pendingTasks: [
                { id: 'task-1', title: 'Xử lý đơn xin cấp giấy phép xây dựng', citizen: 'Nguyễn Văn G', date: '2025-05-16', priority: 'high' },
                { id: 'task-2', title: 'Xác nhận thông tin khai sinh', citizen: 'Trần Thị H', date: '2025-05-17', priority: 'medium' }
              ],
              pendingRequests: [
                { id: 'req-1', type: 'Giấy chứng nhận đất', citizen: 'Lê Văn I', date: '2025-05-15', status: 'pending' },
                { id: 'req-2', type: 'Giấy khai sinh', citizen: 'Phạm Thị K', date: '2025-05-16', status: 'pending' }
              ],
              recentActivity: [
                { id: 'act-1', action: 'Xử lý đơn', document: 'Giấy phép kinh doanh', time: '2025-05-18T11:20:00Z' },
                { id: 'act-2', action: 'Cấp giấy tờ', document: 'Giấy khai sinh', time: '2025-05-18T10:45:00Z' }
              ],
              recentRequests: [
                { id: 'req-3', type: 'Giấy phép kinh doanh', citizen: 'Trần Văn L', date: '2025-05-17', status: 'processing' },
                { id: 'req-4', type: 'Giấy đăng ký kết hôn', citizen: 'Nguyễn Thị M', date: '2025-05-17', status: 'processing' }
              ],
              completedRequests: [
                { id: 'req-5', type: 'Giấy chứng tử', citizen: 'Lê Văn N', date: '2025-05-12', completedDate: '2025-05-15' },
                { id: 'req-6', type: 'Hộ khẩu', citizen: 'Phạm Văn P', date: '2025-05-10', completedDate: '2025-05-14' }
              ],
              message: 'Đang hiển thị dữ liệu mẫu. Bạn không có quyền truy cập trang này hoặc vai trò không phải là cán bộ.'
            } 
          });
        } else if (error.config.url.includes('/citizen/dashboard/stats')) {
          // Richer fallback data for citizen dashboard
          return Promise.resolve({ 
            data: { 
              stats: {
                pendingRequests: 2,
                completedRequests: 8,
                rejectedRequests: 1,
                totalDocuments: 7,
                totalRequests: 11
              },
              recentRequests: [
                { id: 'req-c1', type: 'Giấy phép xây dựng', requestDate: '2025-05-15', status: 'pending' },
                { id: 'req-c2', type: 'Giấy chứng nhận quyền sử dụng đất', requestDate: '2025-05-14', status: 'completed' }
              ],
              recentDocuments: [
                { id: 'doc-c1', type: 'Giấy khai sinh', issueDate: '2025-05-10', expiryDate: null },
                { id: 'doc-c2', type: 'Chứng minh nhân dân', issueDate: '2025-04-15', expiryDate: '2035-04-15' }
              ],
              message: 'Đang hiển thị dữ liệu mẫu. Bạn không có quyền truy cập trang này hoặc vai trò không phải là công dân.' 
            } 
          });
        } else {
          // Generic response for other dashboard endpoints
          return Promise.resolve({ 
            data: { 
              stats: {
                totalItems: 0,
                pendingItems: 0,
                completedItems: 0
              }, 
              items: [],
              message: 'Đang hiển thị dữ liệu mẫu. Quyền truy cập bị từ chối hoặc vai trò không khớp.' 
            } 
          });
        }
      }
      
      // Xử lý lỗi đăng nhập (401)
      if (error.response && error.response.status === 401) {
        // Don't automatically redirect to login when token verification fails
        if (error.config && error.config.url && error.config.url.includes('/token/verify/')) {
          console.warn('⚠️ Token verification failed. Not redirecting to login automatically.');
          return Promise.reject(error);
        }
        
        // Chỉ clear localStorage nếu token không hợp lệ và có token trong localStorage
        if (localStorage.getItem('token')) {
          console.warn('⚠️ Authentication token invalid or expired. Logging out...');
          localStorage.removeItem('token');
          localStorage.removeItem('authUser');
          
          // Chuyển hướng đến trang đăng nhập - chỉ khi người dùng đã đăng nhập trước đó và không phải đang ở trang login
          if (!window.location.pathname.includes('/auth/login')) {
            console.log('Redirecting to login page due to 401 error');
            window.location.href = '/auth/login';
          }
        }
      }
      
      return Promise.reject(error);
    }
  );
}; 