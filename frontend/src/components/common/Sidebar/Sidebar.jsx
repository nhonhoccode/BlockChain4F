import React, { useState } from 'react';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Collapse,
  Paper,
  Avatar,
  IconButton,
  Button,
  Drawer,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Home as HomeIcon,
  Info as InfoIcon,
  ContactSupport as ContactIcon,
  VerifiedUser as VerifiedUserIcon,
  AccountBalance as AccountBalanceIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Description as DescriptionIcon,
  FeedbackOutlined as FeedbackIcon,
  SupervisedUserCircle as ManageAccountsIcon,
  BarChart as ChartIcon,
  ExpandLess,
  ExpandMore,
  Menu as MenuIcon,
  ChevronRight as ChevronRightIcon,
  Login as LoginIcon
} from '@mui/icons-material';
import styles from './Sidebar.module.scss';

// Kiểm tra xem user có đăng nhập hay không - Mock, cần thay bằng authentication state thực tế
const isAuthenticated = () => {
  const authUser = localStorage.getItem('authUser');
  return !!authUser;
};

// Lấy thông tin user - Mock, cần thay bằng auth state thực tế
const getUserInfo = () => {
  const authUser = localStorage.getItem('authUser');
  if (authUser) {
    return JSON.parse(authUser);
  }
  return null;
};

// Mock login function for testing
const mockLogin = (role) => {
  const userData = {
    id: '123456',
    email: `${role}@example.com`,
    name: role === 'citizen' ? 'Nguyễn Văn A' : (role === 'officer' ? 'Trần Văn B' : 'Lê Văn C'),
    role: role,
    token: 'mock-token-123'
  };
  
  localStorage.setItem('authUser', JSON.stringify(userData));
  localStorage.setItem('token', 'mock-token-123');
  window.location.reload();
};

const Sidebar = ({ open, onClose, variant = 'permanent' }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  
  // State cho các menu có submenu
  const [openSubMenus, setOpenSubMenus] = useState({});
  
  // Toggle submenu
  const handleToggleSubMenu = (key) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  // Kiểm tra route active
  const isActive = (path) => location.pathname === path;
  
  // Lấy thông tin user
  const userInfo = getUserInfo();
  const userRole = userInfo?.role || null;
  
  // Menu cho người dùng chưa đăng nhập
  const publicMenuItems = [
    {
      label: 'Trang chủ',
      path: '/',
      icon: <HomeIcon />
    },
    {
      label: 'Giới thiệu',
      path: '/about',
      icon: <InfoIcon />
    },
    {
      label: 'Liên hệ',
      path: '/contact',
      icon: <ContactIcon />
    },
    {
      label: 'Xác thực giấy tờ',
      path: '/document-verify',
      icon: <VerifiedUserIcon />
    }
  ];
  
  // Menu cho công dân
  const citizenMenuItems = [
    {
      label: 'Bảng điều khiển',
      path: '/citizen',
      icon: <DashboardIcon />
    },
    {
      label: 'Hồ sơ cá nhân',
      path: '/citizen/profile',
      icon: <PersonIcon />
    },
    {
      label: 'Yêu cầu giấy tờ',
      path: '/citizen/requests',
      icon: <AssignmentIcon />,
      subItems: [
        {
          label: 'Danh sách yêu cầu',
          path: '/citizen/requests'
        },
        {
          label: 'Tạo yêu cầu mới',
          path: '/citizen/requests/new'
        }
      ]
    },
    {
      label: 'Giấy tờ của tôi',
      path: '/citizen/documents',
      icon: <DescriptionIcon />
    },
    {
      label: 'Góp ý, phản hồi',
      path: '/citizen/feedback',
      icon: <FeedbackIcon />
    }
  ];
  
  // Menu cho cán bộ xã
  const officerMenuItems = [
    {
      label: 'Bảng điều khiển',
      path: '/officer',
      icon: <DashboardIcon />
    },
    {
      label: 'Xử lý yêu cầu',
      path: '/officer/requests/pending',
      icon: <AssignmentIcon />,
      subItems: [
        {
          label: 'Yêu cầu đang chờ',
          path: '/officer/requests/pending'
        }
      ]
    },
    {
      label: 'Quản lý công dân',
      path: '/officer/citizens',
      icon: <ManageAccountsIcon />,
      subItems: [
        {
          label: 'Danh sách công dân',
          path: '/officer/citizens'
        }
      ]
    },
    {
      label: 'Thông tin cá nhân',
      path: '/officer/profile',
      icon: <PersonIcon />
    },
    {
      label: 'Thống kê',
      path: '/officer/statistics',
      icon: <ChartIcon />
    }
  ];
  
  // Menu cho chủ tịch xã
  const chairmanMenuItems = [
    {
      label: 'Bảng điều khiển',
      path: '/admin/chairman',
      icon: <DashboardIcon />
    },
    {
      label: 'Phê duyệt cán bộ',
      path: '/admin/chairman/officer-approvals',
      icon: <VerifiedUserIcon />,
      subItems: [
        {
          label: 'Danh sách phê duyệt',
          path: '/admin/chairman/officer-approvals'
        }
      ]
    },
    {
      label: 'Quản lý cán bộ',
      path: '/admin/chairman/officers',
      icon: <ManageAccountsIcon />,
      subItems: [
        {
          label: 'Danh sách cán bộ',
          path: '/admin/chairman/officers'
        }
      ]
    },
    {
      label: 'Giấy tờ quan trọng',
      path: '/admin/chairman/important-documents',
      icon: <DescriptionIcon />
    },
    {
      label: 'Báo cáo',
      path: '/admin/chairman/reports',
      icon: <ChartIcon />
    }
  ];
  
  // Render menu dựa vào role
  const getMenuItems = () => {
    if (!isAuthenticated()) {
      return publicMenuItems;
    }
    
    switch (userRole) {
      case 'citizen':
        return citizenMenuItems;
      case 'officer':
        return officerMenuItems;
      case 'chairman':
        return chairmanMenuItems;
      default:
        return publicMenuItems;
    }
  };
  
  // Render menu item
  const renderMenuItem = (item, index) => {
    const isActiveItem = isActive(item.path);
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isSubMenuOpen = openSubMenus[item.path] || false;
    
    return (
      <React.Fragment key={index}>
        <ListItem disablePadding>
          {hasSubItems ? (
            // Menu item with submenu
            <ListItemButton
              onClick={() => handleToggleSubMenu(item.path)}
              className={`${styles.menuItem} ${isSubMenuOpen ? styles.active : ''}`}
            >
              <ListItemIcon className={styles.menuItemIcon}>{item.icon}</ListItemIcon>
              <ListItemText 
                primary={item.label} 
                className={styles.menuItemText}
              />
              {isSubMenuOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          ) : (
            // Regular menu item
            <ListItemButton
              component={RouterLink}
              to={item.path}
              selected={isActiveItem}
              className={`${styles.menuItem} ${isActiveItem ? styles.active : ''}`}
            >
              <ListItemIcon className={styles.menuItemIcon}>{item.icon}</ListItemIcon>
              <ListItemText 
                primary={item.label}
                className={styles.menuItemText}
              />
            </ListItemButton>
          )}
        </ListItem>
        
        {/* Render submenu */}
        {hasSubItems && (
          <Collapse in={isSubMenuOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding className={styles.subMenu}>
              {item.subItems.map((subItem, subIndex) => {
                const isSubItemActive = isActive(subItem.path);
                
                return (
                  <ListItemButton
                    key={subIndex}
                    component={RouterLink}
                    to={subItem.path}
                    selected={isSubItemActive}
                    className={`${styles.subMenuItem} ${isSubItemActive ? styles.active : ''}`}
                  >
                    <ListItemIcon className={styles.subMenuItemIcon}>
                      <ChevronRightIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={subItem.label}
                      className={styles.subMenuItemText}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };
  
  // Main content
  const sidebarContent = (
    <Box className={styles.sidebarContainer}>
      {/* Header/Logo */}
      <Box className={styles.header}>
        <AccountBalanceIcon fontSize="large" color="primary" className={styles.logoIcon} />
        <Typography variant="h6" fontWeight="bold" color="primary" className={styles.logoText}>
          Quản lý Xã
        </Typography>
        {isMobile && (
          <IconButton onClick={onClose} className={styles.closeButton}>
            <ChevronRightIcon />
          </IconButton>
        )}
      </Box>
      
      <Divider />
      
      {/* User Info */}
      {isAuthenticated() && userInfo && (
        <Box className={styles.userInfoContainer}>
          <Box className={styles.userInfo}>
            <Avatar
              alt={userInfo.name}
              src="/images/avatars/default_avatar.jpg"
              className={styles.userAvatar}
            />
            <Box>
              <Typography variant="subtitle1" className={styles.userName}>
                {userInfo.name}
              </Typography>
              <Typography variant="body2" className={styles.userRole}>
                {userRole === 'citizen' && 'Công dân'}
                {userRole === 'officer' && 'Cán bộ xã'}
                {userRole === 'chairman' && 'Chủ tịch xã'}
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ my: 2 }} />
        </Box>
      )}
      
      {/* Menu Items */}
      <List component="nav" className={styles.menuContainer}>
        {getMenuItems().map(renderMenuItem)}
      </List>
      
      {/* Auth Actions */}
      <Box className={styles.footerContainer}>
        <Divider sx={{ mb: 2 }} />
        {!isAuthenticated() ? (
          <>
            <Button
              variant="contained"
              component={RouterLink}
              to="/auth/login"
              fullWidth
              startIcon={<LoginIcon />}
              className={styles.authButton}
              sx={{ mb: 1 }}
            >
              Đăng nhập
            </Button>
            
            {/* Quick role login buttons for testing */}
            <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', my: 1 }}>
              Đăng nhập nhanh (testing):
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => mockLogin('citizen')}
                sx={{ mr: 1 }}
              >
                Công dân
              </Button>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => mockLogin('officer')}
                sx={{ mr: 1 }}
              >
                Cán bộ
              </Button>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => mockLogin('chairman')}
              >
                Chủ tịch
              </Button>
            </Box>
          </>
        ) : (
          <>
            <Button
              variant="outlined"
              fullWidth
              color="error"
              onClick={() => {
                localStorage.removeItem('authUser');
                localStorage.removeItem('token');
                window.location.href = '/';
              }}
              className={styles.authButton}
              sx={{ mb: 1 }}
            >
              Đăng xuất
            </Button>
            
            {/* Role switching for testing */}
            <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', my: 1 }}>
              Chuyển vai trò (testing):
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => mockLogin('citizen')}
                sx={{ mr: 1 }}
              >
                Công dân
              </Button>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => mockLogin('officer')}
                sx={{ mr: 1 }}
              >
                Cán bộ
              </Button>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => mockLogin('chairman')}
              >
                Chủ tịch
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
  
  // Render Sidebar based on variant
  return variant === 'permanent' ? (
    // Permanent sidebar for desktop
    <Box
      component="nav"
      sx={{
        width: { md: '280px' },
        flexShrink: 0,
        display: { xs: 'none', md: 'block' }
      }}
    >
      <Paper
        elevation={1}
        sx={{
          height: '100%',
          borderRadius: 0
        }}
      >
        {sidebarContent}
      </Paper>
    </Box>
  ) : (
    // Temporary/Drawer sidebar for mobile
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        display: { xs: 'block', md: 'none' },
        '& .MuiDrawer-paper': { width: 280, boxSizing: 'border-box' }
      }}
    >
      {sidebarContent}
    </Drawer>
  );
};

export default Sidebar;
