import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Avatar, 
  Typography, 
  Chip, 
  Tooltip, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  Button
} from '@mui/material';
import {
  AccountCircle as AccountCircleIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Assignment as AssignmentIcon,
  ExitToApp as LogoutIcon,
  Badge as OfficerIcon,
  PersonAdd as RegisterIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import authService from '../../../services/api/authService';

/**
 * AuthStatus Component
 * Displays the current authentication status with user info and quick actions
 */
const AuthStatus = () => {
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Get user data from localStorage
    const authUserStr = localStorage.getItem('authUser');
    if (authUserStr) {
      try {
        const userData = JSON.parse(authUserStr);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);
  
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = async () => {
    try {
      await authService.logout();
      // Navigate to login
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
    handleMenuClose();
  };
  
  const handleNavigate = (path) => {
    navigate(path);
    handleMenuClose();
  };
  
  // If no user, show login and register buttons
  if (!user) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button 
          variant="outlined" 
          size="small"
          color="primary"
          startIcon={<AccountCircleIcon />}
          onClick={() => navigate('/auth/login')}
          sx={{ 
            borderColor: '#2563eb',
            color: '#2563eb',
            fontWeight: 500,
            '&:hover': {
              backgroundColor: 'rgba(37, 99, 235, 0.04)',
              borderColor: '#1e40af'
            }
          }}
        >
          Đăng nhập
        </Button>
        
        <Button 
          variant="contained" 
          size="small"
          color="primary"
          startIcon={<RegisterIcon />}
          onClick={() => navigate('/auth/register')}
          sx={{ 
            backgroundColor: '#2563eb',
            fontWeight: 500,
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: '#1e40af',
              boxShadow: 'none'
            }
          }}
        >
          Đăng ký
        </Button>
      </Box>
    );
  }
  
  // Get avatar and role icon based on user role
  const getRoleIcon = (role) => {
    switch (role) {
      case 'citizen':
        return <PersonIcon fontSize="small" />;
      case 'officer':
        return <OfficerIcon fontSize="small" />;
      case 'chairman':
        return <AdminIcon fontSize="small" />;
      default:
        return <PersonIcon fontSize="small" />;
    }
  };
  
  const getRoleColor = (role) => {
    switch (role) {
      case 'citizen':
        return 'primary';
      case 'officer':
        return 'success';
      case 'chairman':
        return 'secondary';
      default:
        return 'default';
    }
  };
  
  const getRoleLabel = (role) => {
    switch (role) {
      case 'citizen':
        return 'Công dân';
      case 'officer':
        return 'Cán bộ';
      case 'chairman':
        return 'Chủ tịch xã';
      default:
        return 'Người dùng';
    }
  };
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Tooltip title={`Đã đăng nhập: ${user.name || user.email}`}>
        <Chip
          avatar={
            <Avatar 
              alt={user.name || user.email} 
              src={user.avatar}
              sx={{ bgcolor: `${getRoleColor(user.role)}.main` }}
            >
              {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
            </Avatar>
          }
          label={user.name || user.email}
          variant="outlined"
          clickable
          onClick={handleMenuOpen}
          sx={{ 
            borderColor: `${getRoleColor(user.role)}.main`,
            '&:hover': {
              backgroundColor: `${getRoleColor(user.role)}.50`
            }
          }}
        />
      </Tooltip>
      
      <Tooltip title={getRoleLabel(user.role)}>
        <Chip
          icon={getRoleIcon(user.role)}
          label={getRoleLabel(user.role)}
          size="small"
          color={getRoleColor(user.role)}
          sx={{ ml: 1 }}
        />
      </Tooltip>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            width: 200,
            overflow: 'visible',
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => handleNavigate(`/${user.role}/profile`)}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Hồ sơ cá nhân</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => handleNavigate(`/${user.role}`)}>
          <ListItemIcon>
            <AssignmentIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Bảng điều khiển</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Đăng xuất</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default AuthStatus; 