import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Divider,
  Avatar,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Tooltip,
  Container
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Translate as TranslateIcon,
  Search as SearchIcon,
  AccountBalance as AccountBalanceIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Help as HelpIcon,
  AssignmentInd as DocumentIcon,
  Event as EventIcon,
  Home as HomeIcon,
  Ballot as BallotIcon,
  List as ListIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import styles from './Header.module.scss';
import authService from '../../../services/api/authService';

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

// Hiển thị tên đầy đủ của vai trò
const getRoleName = (role) => {
  switch (role) {
    case 'citizen':
      return 'Công dân';
    case 'officer':
      return 'Cán bộ xã';
    case 'chairman':
      return 'Chủ tịch xã';
    default:
      return '';
  }
};

const Header = ({ toggleSidebar, toggleTheme, isDarkMode }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Lấy thông tin user
  const userInfo = getUserInfo();
  const userRole = userInfo?.role || null;
  
  // State for menus
  const [accountMenuAnchor, setAccountMenuAnchor] = useState(null);
  const [notificationsMenuAnchor, setNotificationsMenuAnchor] = useState(null);
  const [servicesMenuAnchor, setServicesMenuAnchor] = useState(null);
  
  // Handlers
  const handleOpenAccountMenu = (event) => {
    setAccountMenuAnchor(event.currentTarget);
  };
  
  const handleCloseAccountMenu = () => {
    setAccountMenuAnchor(null);
  };
  
  const handleOpenNotificationsMenu = (event) => {
    setNotificationsMenuAnchor(event.currentTarget);
  };
  
  const handleCloseNotificationsMenu = () => {
    setNotificationsMenuAnchor(null);
  };
  
  const handleOpenServicesMenu = (event) => {
    setServicesMenuAnchor(event.currentTarget);
  };
  
  const handleCloseServicesMenu = () => {
    setServicesMenuAnchor(null);
  };
  
  const handleLogout = async () => {
    try {
      await authService.logout();
      // Force reload to update all components
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  // Mock notifications data
  const notifications = [
    {
      id: 1,
      title: 'Yêu cầu đã được phê duyệt',
      description: 'Yêu cầu cấp giấy khai sinh đã được phê duyệt',
      time: '5 phút trước',
      isRead: false
    },
    {
      id: 2,
      title: 'Cần bổ sung thông tin',
      description: 'Vui lòng bổ sung thông tin cho yêu cầu cấp CMND',
      time: '1 giờ trước',
      isRead: false
    },
    {
      id: 3,
      title: 'Nhắc nhở',
      description: 'CMND của bạn sắp hết hạn trong 30 ngày',
      time: '1 ngày trước',
      isRead: true
    }
  ];
  
  // Unread notifications count
  const unreadCount = notifications.filter(notification => !notification.isRead).length;
  
  // Get dashboard link based on role
  const getDashboardLink = () => {
    if (!userInfo) return '/';
    
    switch (userRole) {
      case 'citizen':
        return '/citizen';
      case 'officer':
        return '/officer';
      case 'chairman':
        return 'admin/chairman';
      default:
        return '/';
    }
  };
  
  return (
    <AppBar position="fixed" color="default" elevation={2} className={styles.headerRoot} sx={{
      backgroundColor: '#fff',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      zIndex: 1100
    }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters className={styles.toolbar} sx={{ 
          height: '76px', 
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Menu toggle for mobile */}
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleSidebar}
              className={styles.menuButton}
              sx={{ 
                mr: 3,
                color: '#1976d2',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.08)'
                }
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          {/* Logo */}
          <Box className={styles.logoContainer} component={RouterLink} to="/" sx={{ 
            display: 'flex', 
            alignItems: 'center',
            textDecoration: 'none',
            color: 'inherit',
            marginRight: '40px',
            '&:hover': {
              opacity: 0.9
            }
          }}>
            <Box className={styles.logoImageWrapper} sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: '44px',
              height: '44px',
              backgroundColor: '#1976d2',
              borderRadius: '8px',
              marginRight: '16px',
              color: '#fff'
            }}>
              <AccountBalanceIcon className={styles.logoIcon} sx={{ fontSize: '26px' }} />
            </Box>
            <Box className={styles.logoTextWrapper} sx={{ ml: 1 }}>
              <Typography variant="h6" className={styles.logoTitle} sx={{ 
                fontWeight: 700, 
                letterSpacing: '0.2px',
                fontSize: '1.25rem',
                color: '#1976d2',
                lineHeight: 1.3
              }}>
                Quản lý Hành chính
              </Typography>
              <Typography variant="caption" className={styles.logoSubtitle} sx={{ 
                display: 'block', 
                mt: 0.3, 
                letterSpacing: '0.1px',
                fontSize: '0.8rem',
                color: 'rgba(0, 0, 0, 0.6)',
                marginTop: '2px'
              }}>
                Nền tảng Blockchain
              </Typography>
            </Box>
          </Box>
          
          {/* Central navigation - only on desktop */}
          {!isMobile && (
            <Box className={styles.navigationContainer} sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: 3.5,
              mx: 6,
              '& > .MuiButton-root': {
                fontSize: '1rem',
                letterSpacing: '0.8px',
                fontWeight: 600,
                padding: '10px 20px',
                minWidth: '120px',
                margin: '0 8px',
                borderRadius: '4px',
                transition: 'all 0.3s ease'
              }
            }}>
              <Button
                component={RouterLink}
                to="/"
                color="inherit"
                className={styles.navButton}
                startIcon={<HomeIcon />}
                sx={{ 
                  fontSize: '1rem', 
                  letterSpacing: '0.8px',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                    color: '#1976d2',
                  }
                }}
              >
                Trang chủ
              </Button>
              
              <Button
                color="inherit"
                className={styles.navButton}
                onClick={handleOpenServicesMenu}
                endIcon={<KeyboardArrowDownIcon />}
                startIcon={<DocumentIcon />}
                sx={{ 
                  fontSize: '1rem',
                  letterSpacing: '0.8px',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                    color: '#1976d2',
                  }
                }}
              >
                Dịch vụ
              </Button>
              
              <Button
                component={RouterLink}
                to="/public/document-verify"
                color="inherit"
                className={styles.navButton}
                startIcon={<BallotIcon />}
                sx={{ 
                  fontSize: '1rem',
                  letterSpacing: '0.8px',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                    color: '#1976d2',
                  }
                }}
              >
                Xác thực giấy tờ
              </Button>
              
              <Button
                component={RouterLink}
                to="/public/contact"
                color="inherit"
                className={styles.navButton}
                startIcon={<HelpIcon />}
                sx={{ 
                  fontSize: '1rem',
                  letterSpacing: '0.8px',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                    color: '#1976d2',
                  }
                }}
              >
                Trợ giúp
              </Button>
            </Box>
          )}
          
          {/* Right side actions */}
          <Box className={styles.actionsContainer} sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            marginLeft: '20px'
          }}>
            {/* Theme toggle */}
            <Tooltip title={isDarkMode ? 'Chế độ sáng' : 'Chế độ tối'}>
              <IconButton 
                onClick={toggleTheme} 
                color="inherit"
                className={styles.actionIcon}
                sx={{ 
                  mx: 1, 
                  p: 1.5,
                  color: 'rgba(0, 0, 0, 0.6)',
                  borderRadius: '8px',
                  '&:hover': {
                    color: '#1976d2',
                    backgroundColor: 'rgba(25, 118, 210, 0.08)'
                  }
                }}
              >
                {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
            
            {/* Search */}
            {!isMobile && (
              <Tooltip title="Tìm kiếm">
                <IconButton 
                  color="inherit"
                  className={styles.actionIcon}
                  sx={{ 
                    mx: 1, 
                    p: 1.5,
                    color: 'rgba(0, 0, 0, 0.6)',
                    borderRadius: '8px',
                    '&:hover': {
                      color: '#1976d2',
                      backgroundColor: 'rgba(25, 118, 210, 0.08)'
                    }
                  }}
                >
                  <SearchIcon />
                </IconButton>
              </Tooltip>
            )}
            
            {/* Authenticated user actions */}
            {isAuthenticated() ? (
              <>
                {/* Notifications */}
                <Tooltip title="Thông báo">
                  <IconButton 
                    color="inherit"
                    onClick={handleOpenNotificationsMenu}
                    className={styles.notificationIcon}
                    sx={{ 
                      mx: 1, 
                      p: 1.5,
                      color: 'rgba(0, 0, 0, 0.6)',
                      borderRadius: '8px',
                      '&:hover': {
                        color: '#1976d2',
                        backgroundColor: 'rgba(25, 118, 210, 0.08)'
                      }
                    }}
                  >
                    {unreadCount > 0 ? (
                      <Badge badgeContent={unreadCount} color="error">
                        <NotificationsIcon />
                      </Badge>
                    ) : (
                      <NotificationsIcon />
                    )}
                  </IconButton>
                </Tooltip>
                
                {/* User menu */}
                <Box className={styles.userInfo} sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  ml: 2, 
                  pl: 1.5,
                  marginLeft: '16px'
                }}>
                  {!isMobile && (
                    <Box className={styles.userTextInfo} sx={{ 
                      mr: 2, 
                      textAlign: 'right',
                      marginRight: '16px' 
                    }}>
                      <Typography variant="subtitle2" className={styles.userName} sx={{ 
                        fontWeight: 600, 
                        letterSpacing: '0.2px',
                        fontSize: '0.9rem',
                        lineHeight: 1.3
                      }}>
                        {userInfo?.name || 'Người dùng'}
                      </Typography>
                      <Typography variant="caption" className={styles.userRole} sx={{ 
                        display: 'block', 
                        mt: 0.3, 
                        color: 'text.secondary',
                        fontSize: '0.8rem',
                        marginTop: '3px' 
                      }}>
                        {getRoleName(userRole)}
                      </Typography>
                    </Box>
                  )}
                  
                  <Tooltip title="Tài khoản">
                    <IconButton
                      onClick={handleOpenAccountMenu}
                      color="inherit"
                      className={styles.avatarButton}
                      sx={{ 
                        p: 0.5,
                        '&:hover': {
                          backgroundColor: 'rgba(25, 118, 210, 0.08)'
                        }
                      }}
                    >
                      <Avatar 
                        alt={userInfo?.name || 'User'} 
                        src="../../../../public/images/avatar/citizen.png"
                        className={styles.avatar}
                        sx={{ 
                          width: 38, 
                          height: 38,
                          backgroundColor: '#1976d2'
                        }}
                      />
                    </IconButton>
                  </Tooltip>
                </Box>
              </>
            ) : (
              <Box className={styles.authButtons} sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2
              }}>
                <Button
                  variant="outlined"
                  color="primary"
                  component={RouterLink}
                  to="/auth/register"
                  className={styles.registerButton}
                  sx={{ 
                    mr: 1.5, 
                    display: { xs: 'none', sm: 'inline-flex' },
                    px: 2.5,
                    py: 1,
                    fontWeight: 600,
                    letterSpacing: '0.3px',
                    borderColor: '#1976d2',
                    color: '#1976d2',
                    '&:hover': {
                      borderColor: '#0d47a1',
                      backgroundColor: 'rgba(25, 118, 210, 0.08)'
                    }
                  }}
                >
                  Đăng ký
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  component={RouterLink}
                  to="/auth/login"
                  className={styles.loginButton}
                  sx={{ 
                    px: 3,
                    py: 1,
                    fontWeight: 600,
                    letterSpacing: '0.3px',
                    backgroundColor: '#1976d2',
                    color: '#fff',
                    '&:hover': {
                      backgroundColor: '#0d47a1'
                    }
                  }}
                >
                  Đăng nhập
                </Button>
              </Box>
            )}
          </Box>
          
          {/* Menus */}
          {/* Services Menu */}
          <Menu
            anchorEl={servicesMenuAnchor}
            open={Boolean(servicesMenuAnchor)}
            onClose={handleCloseServicesMenu}
            className={styles.servicesMenu}
            PaperProps={{
              className: styles.menuPaper,
              sx: { 
                mt: 1.5, 
                p: 1,
                minWidth: '240px',
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '-6px',
                  right: '16px',
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#fff',
                  transform: 'rotate(45deg)',
                  borderTop: '1px solid rgba(0,0,0,0.12)',
                  borderLeft: '1px solid rgba(0,0,0,0.12)',
                }
              }
            }}
          >
            <MenuItem 
              component={RouterLink} 
              to="/citizen/requests/new" 
              onClick={handleCloseServicesMenu}
              className={styles.menuItem}
              sx={{ 
                borderRadius: 1, 
                my: 0.5, 
                px: 2,
                py: 1.2,
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.08)'
                }
              }}
            >
              <ListItemIcon>
                <DocumentIcon fontSize="small" className={styles.menuItemIcon} sx={{ 
                  color: 'rgba(0, 0, 0, 0.6)',
                  minWidth: '36px',
                  '&:hover': {
                    color: '#1976d2'
                  }
                }} />
              </ListItemIcon>
              <ListItemText 
                primary="Đăng ký giấy tờ hành chính" 
                primaryTypographyProps={{ sx: { letterSpacing: '0.3px', fontWeight: 500 } }}
              />
            </MenuItem>
            
            <MenuItem 
              component={RouterLink} 
              to="/citizen/requests" 
              onClick={handleCloseServicesMenu}
              className={styles.menuItem}
              sx={{ 
                borderRadius: 1, 
                my: 0.5, 
                px: 2,
                py: 1.2,
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.08)'
                }
              }}
            >
              <ListItemIcon>
                <ListIcon fontSize="small" className={styles.menuItemIcon} sx={{ 
                  color: 'rgba(0, 0, 0, 0.6)',
                  minWidth: '36px',
                  '&:hover': {
                    color: '#1976d2'
                  }
                }} />
              </ListItemIcon>
              <ListItemText 
                primary="Theo dõi hồ sơ đã nộp" 
                primaryTypographyProps={{ sx: { letterSpacing: '0.3px', fontWeight: 500 } }}
              />
            </MenuItem>
            
            <MenuItem 
              component={RouterLink} 
              to="/citizen/documents" 
              onClick={handleCloseServicesMenu}
              className={styles.menuItem}
              sx={{ 
                borderRadius: 1, 
                my: 0.5, 
                px: 2,
                py: 1.2,
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.08)'
                }
              }}
            >
              <ListItemIcon>
                <BallotIcon fontSize="small" className={styles.menuItemIcon} sx={{ 
                  color: 'rgba(0, 0, 0, 0.6)',
                  minWidth: '36px',
                  '&:hover': {
                    color: '#1976d2'
                  }
                }} />
              </ListItemIcon>
              <ListItemText 
                primary="Giấy tờ của tôi" 
                primaryTypographyProps={{ sx: { letterSpacing: '0.3px', fontWeight: 500 } }}
              />
            </MenuItem>
            
            <Divider sx={{ my: 1 }} />
            
            <MenuItem 
              component={RouterLink} 
              to="/procedures" 
              onClick={handleCloseServicesMenu}
              className={styles.menuItem}
              sx={{ 
                borderRadius: 1, 
                my: 0.5, 
                px: 2,
                py: 1.2,
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.08)'
                }
              }}
            >
              <ListItemIcon>
                <AssignmentIcon fontSize="small" className={styles.menuItemIcon} sx={{ 
                  color: 'rgba(0, 0, 0, 0.6)',
                  minWidth: '36px',
                  '&:hover': {
                    color: '#1976d2'
                  }
                }} />
              </ListItemIcon>
              <ListItemText 
                primary="Thủ tục hành chính" 
                primaryTypographyProps={{ sx: { letterSpacing: '0.3px', fontWeight: 500 } }}
              />
            </MenuItem>
            
            <MenuItem 
              component={RouterLink} 
              to="/officer/process-request" 
              onClick={handleCloseServicesMenu}
              className={styles.menuItem}
              sx={{ 
                borderRadius: 1, 
                my: 0.5, 
                px: 2,
                py: 1.2,
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.08)'
                }
              }}
            >
              <ListItemIcon>
                <EventIcon fontSize="small" className={styles.menuItemIcon} sx={{ 
                  color: 'rgba(0, 0, 0, 0.6)',
                  minWidth: '36px',
                  '&:hover': {
                    color: '#1976d2'
                  }
                }} />
              </ListItemIcon>
              <ListItemText 
                primary="Lịch hẹn thủ tục hành chính" 
                primaryTypographyProps={{ sx: { letterSpacing: '0.3px', fontWeight: 500 } }}
              />
            </MenuItem>
          </Menu>
          
          {/* Notifications Menu */}
          <Menu
            anchorEl={notificationsMenuAnchor}
            open={Boolean(notificationsMenuAnchor)}
            onClose={handleCloseNotificationsMenu}
            PaperProps={{
              className: styles.menuPaper,
              sx: { mt: 1.5 }
            }}
          >
            <Box className={styles.notificationHeader} sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Thông báo</Typography>
              {unreadCount > 0 && (
                <Button 
                  variant="text" 
                  size="small" 
                  color="primary"
                  className={styles.markAllReadButton}
                  sx={{ fontSize: '0.75rem', ml: 1 }}
                >
                  Đánh dấu đã đọc
                </Button>
              )}
            </Box>
            <Divider />
            
            {notifications.length === 0 ? (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="textSecondary">
                  Không có thông báo mới
                </Typography>
              </Box>
            ) : (
              notifications.map(notification => (
                <MenuItem 
                  key={notification.id}
                  onClick={handleCloseNotificationsMenu}
                  className={`${styles.notificationItem} ${notification.isRead ? styles.read : styles.unread}`}
                  sx={{ 
                    px: 2, 
                    py: 1.5,
                    borderLeft: notification.isRead ? 'none' : `3px solid ${theme.palette.info.main}`,
                    bgcolor: notification.isRead ? 'transparent' : 'rgba(33, 150, 243, 0.05)'
                  }}
                >
                  <Box className={styles.notificationContent} sx={{ width: '100%' }}>
                    <Typography variant="subtitle2" className={styles.notificationTitle} sx={{ fontWeight: notification.isRead ? 400 : 600 }}>
                      {notification.title}
                    </Typography>
                    <Typography variant="body2" className={styles.notificationDescription} sx={{ color: 'text.secondary', my: 0.5 }}>
                      {notification.description}
                    </Typography>
                    <Typography variant="caption" className={styles.notificationTime} sx={{ color: 'text.disabled', display: 'block', textAlign: 'right' }}>
                      {notification.time}
                    </Typography>
                  </Box>
                </MenuItem>
              ))
            )}
            
            <Divider />
            <MenuItem 
              onClick={handleCloseNotificationsMenu}
              component={RouterLink}
              to="/notifications"
              className={styles.viewAllNotifications}
              sx={{ textAlign: 'center', py: 1.5 }}
            >
              <Typography variant="body2" align="center" sx={{ width: '100%', color: 'primary.main', fontWeight: 500 }}>
                Xem tất cả thông báo
              </Typography>
            </MenuItem>
          </Menu>
          
          {/* Account Menu */}
          <Menu
            anchorEl={accountMenuAnchor}
            open={Boolean(accountMenuAnchor)}
            onClose={handleCloseAccountMenu}
            PaperProps={{
              className: styles.menuPaper,
              sx: { mt: 1.5 }
            }}
          >
            <Box className={styles.userInfoContainer} sx={{ p: 2 }}>
              <Typography className={styles.userName} sx={{ fontWeight: 600, fontSize: '1rem' }}>
                {userInfo?.name || 'Người dùng'}
              </Typography>
              <Typography variant="body2" color="textSecondary" className={styles.userRole} sx={{ mt: 0.5 }}>
                {getRoleName(userRole)}
              </Typography>
            </Box>
            
            <Divider />
            
            <MenuItem 
              onClick={() => {
                handleCloseAccountMenu();
                navigate(getDashboardLink());
              }}
              className={styles.menuItem}
              sx={{ px: 2, py: 1.5 }}
            >
              <ListItemIcon>
                <DashboardIcon fontSize="small" className={styles.menuItemIcon} />
              </ListItemIcon>
              <ListItemText primary="Bảng điều khiển" />
            </MenuItem>
            
            <MenuItem 
              onClick={() => {
                handleCloseAccountMenu();
                navigate(`/${userRole}/profile`);
              }}
              className={styles.menuItem}
              sx={{ px: 2, py: 1.5 }}
            >
              <ListItemIcon>
                <PersonIcon fontSize="small" className={styles.menuItemIcon} />
              </ListItemIcon>
              <ListItemText primary="Hồ sơ cá nhân" />
            </MenuItem>
            
            <MenuItem 
              onClick={handleCloseAccountMenu}
              className={styles.menuItem}
              sx={{ px: 2, py: 1.5 }}
            >
              <ListItemIcon>
                <SettingsIcon fontSize="small" className={styles.menuItemIcon} />
              </ListItemIcon>
              <ListItemText primary="Cài đặt" />
            </MenuItem>
            
            <Divider />
            
            <MenuItem 
              onClick={handleLogout}
              className={styles.menuItem}
              sx={{ px: 2, py: 1.5, color: 'error.main' }}
            >
              <ListItemIcon sx={{ color: 'error.main' }}>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Đăng xuất" />
            </MenuItem>
          </Menu>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
