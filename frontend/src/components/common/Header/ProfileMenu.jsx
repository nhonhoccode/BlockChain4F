import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProfileMenu = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    handleMenuClose();
    try {
      console.log('Logging out...');
      const result = await logout();
      console.log('Logout result:', result);
      
      // Đảm bảo xóa token khỏi cả localStorage và sessionStorage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('authUser');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('refreshToken');
      
      // Chuyển hướng về trang login
      navigate('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Vẫn đảm bảo xóa token
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('authUser');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('refreshToken');
      
      // Chuyển hướng về trang login
      navigate('/auth/login');
    }
  };

  return (
    <div>
      {/* Render your menu content here */}
    </div>
  );
};

export default ProfileMenu; 