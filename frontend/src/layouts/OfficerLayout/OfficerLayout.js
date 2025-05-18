import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  AssignmentInd as AssignmentIcon,
  People as PeopleIcon,
  Poll as StatsIcon,
  Notifications as NotificationIcon,
  ExitToApp as LogoutIcon,
  Badge as OfficerIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 240;

/**
 * OfficerLayout Component - Layout for officer users
 */
const OfficerLayout = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { currentUser, logout } = useAuth();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = async () => {
    handleProfileMenuClose();
    await logout();
    navigate('/auth/login');
  };
  
  // Menu items for officer
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/officer/dashboard' },
    { text: 'Process Requests', icon: <AssignmentIcon />, path: '/officer/process-request' },
    { text: 'Citizen Management', icon: <PeopleIcon />, path: '/officer/citizen-management' },
    { text: 'Profile', icon: <PersonIcon />, path: '/officer/profile' },
    { text: 'Approval Status', icon: <OfficerIcon />, path: '/officer/approval-status' },
    { text: 'Statistics', icon: <StatsIcon />, path: '/officer/statistics' },
  ];
  
  const drawer = (
    <>
      <Toolbar sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'flex-start',
        padding: 2,
        bgcolor: 'success.dark'
      }}>
        <Typography variant="h6" noWrap component="div" color="white" fontWeight="bold">
          Officer Portal
        </Typography>
        <Typography variant="body2" color="white" sx={{ opacity: 0.8 }}>
          Blockchain Administrative System
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            onClick={() => {
              navigate(item.path);
              if (isMobile) setMobileOpen(false);
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </>
  );
  
  const profileMenu = (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleProfileMenuClose}
      keepMounted
    >
      <MenuItem onClick={() => {
        handleProfileMenuClose();
        navigate('/officer/profile');
      }}>
        <PersonIcon fontSize="small" sx={{ mr: 1 }} />
        My Profile
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleLogout}>
        <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
        Logout
      </MenuItem>
    </Menu>
  );
  
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'success.dark' // Green color to distinguish officer layout
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Officer Dashboard
          </Typography>
          <IconButton color="inherit">
            <NotificationIcon />
          </IconButton>
          <IconButton 
            edge="end" 
            color="inherit" 
            onClick={handleProfileMenuOpen}
          >
            <Avatar 
              alt={currentUser?.name || 'Officer'} 
              src="/static/images/avatar/citizen.png" 
              sx={{ width: 32, height: 32, bgcolor: 'success.light' }}
            >
              {currentUser?.name?.[0] || 'O'}
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>
      {profileMenu}
      
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better mobile performance
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          mt: '64px' // Height of AppBar
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default OfficerLayout; 