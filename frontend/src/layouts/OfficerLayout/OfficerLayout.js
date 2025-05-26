import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
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
  Tooltip,
  useMediaQuery,
  useTheme,
  CssBaseline
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  BarChart as BarChartIcon,
  Person as PersonIcon,
  People as PeopleIcon,
  ExitToApp as LogoutIcon,
  AccountCircle as AccountCircleIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import styles from './OfficerLayout.module.scss';

const drawerWidth = 240;

/**
 * OfficerLayout Component - Layout for officer users
 */
const OfficerLayout = () => {
  const { t } = useTranslation();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State for drawer and menu
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  
  // Reset mobile drawer state when screen size changes
  useEffect(() => {
    if (!isMobile) {
      setMobileOpen(false);
    }
  }, [isMobile]);
  
  const handleDrawerToggle = () => {
    console.log('Toggle drawer from', mobileOpen, 'to', !mobileOpen);
    setMobileOpen(prevState => !prevState);
  };
  
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };
  
  const menuItems = [
    {
      text: t('officer.menu.dashboard', 'Bảng điều khiển'),
      icon: <DashboardIcon />,
      path: '/officer'
    },
    {
      text: t('officer.menu.pendingRequests', 'Yêu cầu chờ xử lý'),
      icon: <AssignmentIcon />,
      path: '/officer/requests/pending'
    },
    {
      text: t('officer.menu.citizenManagement', 'Quản lý công dân'),
      icon: <PeopleIcon />,
      path: '/officer/citizens'
    },
    {
      text: t('officer.menu.profile', 'Thông tin cá nhân'),
      icon: <PersonIcon />,
      path: '/officer/profile'
    },
    {
      text: t('officer.menu.statistics', 'Thống kê'),
      icon: <BarChartIcon />,
      path: '/officer/statistics'
    }
  ];
  
  const isActive = (path) => {
    // Check if the current path starts with the menu item path
    // This helps with nested routes
    return location.pathname === path || 
           (path !== '/officer' && location.pathname.startsWith(path));
  };
  
  // Get user display name
  const getUserDisplayName = () => {
    // Try to get fresh data from localStorage first
    try {
      const authUserString = localStorage.getItem('authUser');
      if (authUserString) {
        const authUser = JSON.parse(authUserString);
        if (authUser.first_name || authUser.last_name) {
          return `${authUser.first_name || ''} ${authUser.last_name || ''}`.trim();
        }
      }
    } catch (e) {
      console.error('Error parsing authUser from localStorage:', e);
    }
    
    // Fall back to context data
    if (currentUser) {
      if (currentUser.first_name || currentUser.last_name) {
        return `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim();
      }
      return currentUser.email || 'Cán bộ';
    }
    
    return 'Cán bộ';
  };
  
  // Drawer content
  const drawer = (
    <>
      <Toolbar />
      <Box className={styles.userInfo}>
        <Avatar
          src={currentUser?.photoURL}
          alt={getUserDisplayName()}
          className={styles.avatar}
        >
          {!currentUser?.photoURL && <AccountCircleIcon sx={{ fontSize: 40 }} />}
        </Avatar>
        
        <Typography variant="subtitle1" className={styles.userName}>
          {getUserDisplayName()}
        </Typography>
        
        <Typography variant="body2" className={styles.userRole}>
          {t('officer.role', 'Cán bộ xã')}
        </Typography>
      </Box>
      
      <Divider />
      
      {/* Menu Items */}
      <List sx={{ padding: '8px 0' }}>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => handleNavigate(item.path)}
            className={`${styles.menuItem} ${isActive(item.path) ? styles.selected : ''}`}
          >
            <ListItemIcon className={styles.menuItemIcon}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      
      <Box sx={{ flexGrow: 1 }} />
      
      <Divider />
      
      {/* Footer */}
      <Box className={styles.footer}>
        <ListItem button onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary={t('common.logout', 'Đăng xuất')} />
        </ListItem>
      </Box>
    </>
  );
  
  return (
    <Box className={styles.layout}>
      <CssBaseline />
      {/* App Bar */}
      <AppBar 
        position="fixed" 
        className={styles.appBar}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Hamburger menu button - only visible on mobile */}
            <IconButton
              color="inherit"
              aria-label="toggle drawer"
              edge="start"
              onClick={handleDrawerToggle}
              className={styles.menuButton}
              sx={{ display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            
            <Typography variant="h6" noWrap component="div" className={styles.title}>
              {t('officer.title', 'Hệ thống quản lý hành chính')}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title={t('common.notifications', 'Thông báo')}>
              <IconButton color="inherit" size="medium">
                <NotificationsIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title={t('common.settings', 'Cài đặt')}>
              <IconButton color="inherit" size="medium">
                <SettingsIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title={t('common.profile', 'Thông tin cá nhân')}>
              <IconButton
                edge="end"
                color="inherit"
                aria-label="account of current user"
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                size="medium"
              >
                <Avatar
                  src={currentUser?.photoURL}
                  alt={getUserDisplayName()}
                  sx={{ width: 32, height: 32, border: '2px solid rgba(255, 255, 255, 0.8)' }}
                >
                  {!currentUser?.photoURL && <AccountCircleIcon />}
                </Avatar>
              </IconButton>
            </Tooltip>
            
            <Menu
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => {
                handleMenuClose();
                navigate('/officer/profile');
              }}>
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={t('common.profile', 'Thông tin cá nhân')} />
              </MenuItem>
              
              <Divider />
              
              <MenuItem onClick={() => {
                handleMenuClose();
                handleLogout();
              }}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={t('common.logout', 'Đăng xuất')} />
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Navigation */}
      <nav className={`${styles.drawer} ${mobileOpen ? styles.drawerOpen : ''}`}>
        {/* Mobile Drawer - Only visible on mobile devices */}
        <Drawer
          container={window.document.body}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
          }}
          classes={{
            paper: styles.drawerPaper
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop Drawer - Always visible on desktop */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
          }}
          classes={{
            paper: styles.drawerPaper
          }}
          open
        >
          {drawer}
        </Drawer>
      </nav>
      
      {/* Main Content */}
      <Box
        component="main"
        className={styles.content}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          pt: { xs: 10, md: 11 },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default OfficerLayout; 