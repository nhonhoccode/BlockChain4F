import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role?: string;
  token: string;
}

interface AuthGuardOptions {
  requiredRole?: 'citizen' | 'officer' | 'chairman';
}

// Kiểm tra xem user có đăng nhập hay không
const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  const authUser = localStorage.getItem('authUser');
  console.log('isAuthenticated check:', { 
    hasToken: !!token, 
    hasAuthUser: !!authUser,
    tokenValue: token ? `${token.substring(0, 10)}...` : 'none'
  });
  return !!(token && authUser);
};

// Lấy thông tin user từ localStorage
const getUserInfo = (): AuthUser | null => {
  const authUser = localStorage.getItem('authUser');
  if (authUser) {
    try {
      const userInfo = JSON.parse(authUser) as AuthUser;
      console.log('User info from localStorage:', userInfo);
      return userInfo;
    } catch (error) {
      console.error('Error parsing user info from localStorage:', error);
      return null;
    }
  }
  return null;
};

/**
 * HOC để bảo vệ route cần xác thực
 * @param Component - Component cần bảo vệ
 * @param options - Tùy chọn
 * @returns Component đã được bảo vệ
 */
export const withAuthGuard = <P extends object>(
  Component: React.ComponentType<P>, 
  options: AuthGuardOptions = {}
): React.FC<P> => {
  return (props: P) => {
    const location = useLocation();
    console.log(`AuthGuard check for path: ${location.pathname}`, options);
    
    // Kiểm tra đăng nhập
    if (!isAuthenticated()) {
      console.log('User is not authenticated, redirecting to login page');
      return <Navigate to="/auth/login" state={{ from: location }} replace />;
    }
    
    // Kiểm tra vai trò nếu có yêu cầu
    if (options.requiredRole) {
      const userInfo = getUserInfo();
      const userRole = userInfo?.role || 'citizen'; // Mặc định citizen nếu không có vai trò
      
      console.log(`Checking role: required=${options.requiredRole}, user=${userRole}`);
      
      // Cho phép chủ tịch xã truy cập tất cả các trang
      if (userRole === 'chairman') {
        console.log('Chairman role detected, allowing access to all protected routes');
        return <Component {...props} />;
      }
      
      // Kiểm tra xem vai trò có khớp không
      if (userRole !== options.requiredRole) {
        console.log(`Role mismatch: ${userRole} ≠ ${options.requiredRole}, redirecting to appropriate dashboard`);
        
        // Chuyển hướng tới dashboard tương ứng với vai trò
        const redirectPath = userRole === 'officer' 
          ? '/officer/dashboard'
          : (userRole === 'chairman' ? '/chairman/dashboard' : '/citizen/dashboard');
        
        return <Navigate to={redirectPath} replace />;
      }
    }
    
    console.log('AuthGuard check passed, rendering component');
    // Người dùng đã đăng nhập và có vai trò phù hợp, hiển thị component
    return <Component {...props} />;
  };
};

export default withAuthGuard; 