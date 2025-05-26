import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * Kiểm tra xem user có đăng nhập hay không
 * @returns {boolean} Trạng thái đăng nhập
 */
const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const authUser = localStorage.getItem('authUser');
  console.log('[AuthGuard] Token check:', token ? 'Token exists' : 'No token');
  console.log('[AuthGuard] Auth user check:', authUser ? 'User exists' : 'No user data');
  return !!(token && authUser);
};

/**
 * Lấy thông tin user từ localStorage
 * @returns {Object|null} Thông tin người dùng hoặc null
 */
const getUserInfo = () => {
  const authUser = localStorage.getItem('authUser');
  if (!authUser) return null;
  
  try {
    const user = JSON.parse(authUser);
    console.log('[AuthGuard] User info:', { id: user.id, email: user.email, role: user.role });
    return user;
  } catch (error) {
    console.error('[AuthGuard] Error parsing user data:', error);
    return null;
  }
};

/**
 * HOC để bảo vệ route cần xác thực
 * @param {React.ComponentType} Component - Component cần bảo vệ
 * @param {string} requiredRole - Vai trò cần thiết để truy cập route
 * @returns {React.FC} Component đã được bảo vệ
 */
const withAuthGuard = (Component, requiredRole = '') => {
  const GuardedComponent = (props) => {
    const location = useLocation();
    console.log(`[AuthGuard] Checking access for: ${location.pathname}, required role: ${requiredRole || 'any'}`);
    
    // Check if this is a redirect from another auth guard to prevent loops
    const isFromAuthGuard = location.state && location.state.fromAuthGuard;
    const visitCount = (location.state && location.state.visitCount) || 0;
    
    // If we've been redirected too many times, let the user through to prevent infinite loops
    if (isFromAuthGuard && visitCount > 2) {
      console.warn('[AuthGuard] Breaking redirect loop after multiple attempts');
      return <Component {...props} />;
    }
    
    // 1. Kiểm tra đăng nhập
    if (!isAuthenticated()) {
      console.log('[AuthGuard] Not authenticated, redirecting to login');
      return <Navigate to="/auth/login" state={{ from: location.pathname }} replace />;
    }
    
    // 2. Kiểm tra quyền truy cập nếu cần
    if (requiredRole) {
      const user = getUserInfo();
      const userRole = user?.role || '';
      
      console.log(`[AuthGuard] Role check: required=${requiredRole}, actual=${userRole}`);
      
      // Nếu không có vai trò hoặc vai trò không khớp
      if (!userRole || userRole !== requiredRole) {
        // Trường hợp đặc biệt: Chairman có thể truy cập mọi trang
        if (userRole === 'chairman') {
          console.log('[AuthGuard] Chairman has access to all routes');
          return <Component {...props} />;
        }
        
        // Trường hợp đặc biệt: Route citizen và người dùng không có vai trò
        if (requiredRole === 'citizen' && !userRole) {
          console.log('[AuthGuard] No role specified, defaulting to citizen');
          // Cập nhật thông tin người dùng với vai trò citizen
          if (user) {
            const updatedUser = { ...user, role: 'citizen' };
            localStorage.setItem('authUser', JSON.stringify(updatedUser));
            console.log('[AuthGuard] Updated user role to citizen');
            return <Component {...props} />;
          }
        }
        
        // Prevent infinite redirects
        if (isFromAuthGuard && visitCount > 0) {
          console.log('[AuthGuard] Breaking potential redirect loop after one attempt');
          return <Component {...props} />;
        }
        
        // Chuyển hướng người dùng đến dashboard tương ứng với vai trò của họ
        let redirectPath;
        switch (userRole) {
          case 'officer':
            redirectPath = '/officer/dashboard';
            break;
          case 'chairman':
            redirectPath = '/chairman/dashboard';
            break;
          default:
            redirectPath = '/citizen/dashboard';
        }
        
        // Only redirect if we're not already at the target path
        if (location.pathname !== redirectPath) {
          console.log(`[AuthGuard] Role mismatch, redirecting to: ${redirectPath}`);
          // Include visit count to track potential loops
          return <Navigate to={redirectPath} state={{ fromAuthGuard: true, visitCount: visitCount + 1 }} replace />;
        }
      }
    }
    
    // Người dùng đã đăng nhập và có quyền phù hợp
    console.log('[AuthGuard] Access granted');
    return <Component {...props} />;
  };

  return GuardedComponent;
};

export default withAuthGuard; 