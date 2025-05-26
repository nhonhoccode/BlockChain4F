import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getRoleDisplayText } from '../utils/roleUtils';

interface RouteGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
}

/**
 * Route Guard component to protect routes based on authentication and role
 * @param {React.ReactNode} children - The children elements to render if authorized
 * @param {string} requiredRole - Optional role required to access this route
 */
const RouteGuard: React.FC<RouteGuardProps> = ({ children, requiredRole }) => {
  const auth = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    // Simulate loading state for auth check
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Show loading while checking
  if (isChecking) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Đang kiểm tra quyền truy cập...</div>
      </div>
    );
  }
  
  // If not authenticated, redirect to login
  if (!auth.isAuthenticated) {
    // Save the location the user was trying to access
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }
  
  // If role check is required and user doesn't have the required role
  if (requiredRole && auth.user?.role !== requiredRole) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        padding: '20px'
      }}>
        <h2>Không có quyền truy cập</h2>
        <p>
          Bạn đang đăng nhập với vai trò {getRoleDisplayText(auth.user?.role || '')}.
          Trang này yêu cầu vai trò {getRoleDisplayText(requiredRole)}.
        </p>
        <button 
          onClick={() => window.history.back()}
          style={{
            padding: '8px 16px',
            background: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '16px'
          }}
        >
          Quay lại
        </button>
      </div>
    );
  }
  
  // If all checks pass, render the protected component
  return <>{children}</>;
};

export default RouteGuard; 