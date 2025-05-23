import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Tooltip,
} from '@mui/material';
import {
  Person as PersonIcon,
  Dashboard as DashboardIcon,
  ExitToApp as LogoutIcon,
  Settings as SettingsIcon,
  VerifiedUser as VerifiedUserIcon,
  Tune as TuneIcon,
} from '@mui/icons-material';
import { logout, selectUser, selectUserRoles } from '../../../store/slices/authSlice';

const UserMenu = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const roles = useSelector(selectUserRoles);
  
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  const isChairman = roles.includes('chairman');
  const isOfficer = roles.includes('officer');
  const isCitizen = roles.includes('citizen');
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = () => {
    handleClose();
    dispatch(logout())
      .unwrap()
      .then(() => {
        navigate('/auth/login');
      })
      .catch((error) => {
        console.error('Logout failed:', error);
      });
  };
  
  const getProfileLink = () => {
    if (isChairman) return '/admin/chairman/profile';
    if (isOfficer) return '/officer/profile';
    if (isCitizen) return '/citizen/profile';
    return '/';
  };
  
  const getDashboardLink = () => {
    if (isChairman) return '/admin/chairman';
    if (isOfficer) return '/officer';
    if (isCitizen) return '/citizen';
    return '/';
  };
  
  const getUserInitials = () => {
    if (!user) return '?';
    
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase();
    } else if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    
    return '?';
  };

  return (
    <>
      <Tooltip title="Tài khoản">
        <IconButton
          onClick={handleClick}
          size="small"
          sx={{ ml: 1 }}
          aria-controls={open ? 'user-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
          <Avatar sx={{ width: 35, height: 35, bgcolor: 'secondary.main' }}>
            {getUserInitials()}
          </Avatar>
        </IconButton>
      </Tooltip>
      
      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: 200,
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
            mt: 1.5,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle1" noWrap>
            {user ? `${user.firstName} ${user.lastName}` : 'Người dùng'}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {user?.email}
          </Typography>
        </Box>
        
        <Divider />
        
        <MenuItem onClick={() => navigate(getDashboardLink())}>
          <ListItemIcon>
            <DashboardIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Bảng điều khiển</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => navigate(getProfileLink())}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Hồ sơ cá nhân</ListItemText>
        </MenuItem>
        
        {isOfficer && (
          <MenuItem onClick={() => navigate('/officer/approval-status')}>
            <ListItemIcon>
              <VerifiedUserIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Trạng thái phê duyệt</ListItemText>
          </MenuItem>
        )}
        
        <MenuItem onClick={() => navigate('/auth/change-password')}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Đổi mật khẩu</ListItemText>
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Đăng xuất</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default UserMenu;
