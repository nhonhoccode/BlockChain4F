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
  useTheme,
  useMediaQuery,
  Badge,
  Chip,
  Tooltip,
  Button,
  Fade,
  Paper,
  CssBaseline
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Description as DocumentIcon,
  AssignmentInd as RequestIcon,
  Feedback as FeedbackIcon,
  Notifications as NotificationIcon,
  ExitToApp as LogoutIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Help as HelpIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { styled } from '@mui/material/styles';

// Drawer width
const drawerWidth = 260;

// Custom styled components
const StyledAppBar = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
  color: theme.palette.text.primary,
}));

const MenuItem2 = styled(ListItem)(({ theme, active }) => ({
  margin: '6px 12px',
  borderRadius: 12,
  padding: '8px 12px',
  transition: 'all 0.2s ease',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  '&::before': active && {
    content: '""',
    position: 'absolute',
    left: -12,
    top: '50%',
    transform: 'translateY(-50%)',
    width: 4,
    height: 20,
    backgroundColor: theme.palette.primary.main,
    borderRadius: 4,
  },
  backgroundColor: active ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
  '&:hover': {
    backgroundColor: 'rgba(25, 118, 210, 0.12)',
  },
}));

const MotionListItem = motion(MenuItem2);

const AnimatedBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    transform: 'scale(1) translate(40%, -40%)',
    transformOrigin: '100% 0%',
    padding: '0 4px',
    fontSize: '0.65rem',
    height: 16,
    minWidth: 16,
    fontWeight: 'bold',
    animation: 'pulse 2s infinite',
  },
  '@keyframes pulse': {
    '0%': { transform: 'scale(0.8) translate(40%, -40%)' },
    '50%': { transform: 'scale(1.1) translate(40%, -40%)' },
    '100%': { transform: 'scale(0.8) translate(40%, -40%)' },
  },
}));

/**
 * CitizenLayout Component - Layout hiện đại cho người dùng công dân
 */
const CitizenLayout = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { currentUser, logout } = useAuth();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState(3); // Demo notifications
  
  // Simulate fetching user status 
  const [userStatus, setUserStatus] = useState({ 
    pendingRequests: 2,
    newDocuments: 1
  });
  
  useEffect(() => {
    // You can add API calls to fetch real-time notifications here
  }, []);
  
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
  
  // Menu items for citizen - enhanced with badges and current route highlighting
  const menuItems = [
    { 
      text: 'Tổng quan', 
      icon: <DashboardIcon fontSize="small" />, 
      path: '/citizen',
      badge: userStatus.pendingRequests + userStatus.newDocuments
    },
    { 
      text: 'Hồ sơ cá nhân', 
      icon: <PersonIcon fontSize="small" />, 
      path: '/citizen/profile' 
    },
    { 
      text: 'Giấy tờ của tôi', 
      icon: <DocumentIcon fontSize="small" />, 
      path: '/citizen/documents',
      badge: userStatus.newDocuments
    },
    { 
      text: 'Yêu cầu', 
      icon: <RequestIcon fontSize="small" />, 
      path: '/citizen/requests',
      badge: userStatus.pendingRequests
    },
    { 
      text: 'Góp ý', 
      icon: <FeedbackIcon fontSize="small" />, 
      path: '/citizen/feedback' 
    },
    {
      text: 'Hỗ trợ',
      icon: <HelpIcon fontSize="small" />,
      path: '/citizen/support'
    }
  ];
  
  const drawer = (
    <>
      <Toolbar /> {/* This creates space for the AppBar */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        padding: 3,
        pt: 2
      }}>
        <Avatar 
          alt={currentUser?.name || 'Công dân'} 
          src="/static/images/avatar/citizen.png" 
          sx={{ width: 80, height: 80, mb: 2, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
        >
          {currentUser?.name?.[0] || 'C'}
        </Avatar>
        <Typography variant="h6" noWrap sx={{ fontWeight: 600 }}>
          {currentUser?.name || 'VO NHON'}
        </Typography>
        <Chip 
          label="Công dân" 
          color="primary" 
          size="small" 
          sx={{ mt: 1, fontSize: '0.7rem', borderRadius: '12px' }}
        />
      </Box>
      <Divider sx={{ mx: 2 }} />
      <List sx={{ mt: 1, px: 1 }}>
        {menuItems.map((item) => (
          <MotionListItem 
            button 
            key={item.text} 
            active={location.pathname === item.path || (item.path === '/citizen' && location.pathname.startsWith('/citizen') && !menuItems.some(mi => mi.path !== '/citizen' && location.pathname === mi.path))}
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              navigate(item.path);
              if (isMobile) setMobileOpen(false);
            }}
          >
            <ListItemIcon 
              sx={{ 
                minWidth: 36, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: location.pathname === item.path || 
                      (item.path === '/citizen' && location.pathname.startsWith('/citizen') && 
                       !menuItems.some(mi => mi.path !== '/citizen' && location.pathname === mi.path)) 
                      ? 'primary.main' : 'text.secondary'
              }}
            >
              {item.badge ? (
                <AnimatedBadge badgeContent={item.badge} color="error">
                  {item.icon}
                </AnimatedBadge>
              ) : (
                item.icon
              )}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              primaryTypographyProps={{ 
                fontWeight: (location.pathname === item.path || 
                (item.path === '/citizen' && location.pathname.startsWith('/citizen') && 
                 !menuItems.some(mi => mi.path !== '/citizen' && location.pathname === mi.path))) ? 600 : 400,
                fontSize: '0.9rem'
              }}
              sx={{ m: 0 }}
            />
          </MotionListItem>
        ))}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Box sx={{ p: 2 }}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            backgroundColor: 'primary.light', 
            color: 'primary.contrastText',
            borderRadius: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1
          }}
        >
          <HelpIcon color="inherit" fontSize="small" />
          <Typography variant="body2" align="center" sx={{ fontWeight: 500 }}>
            Cần hỗ trợ với hệ thống?
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            size="small"
            onClick={() => navigate('/citizen/support')}
            sx={{ borderRadius: 4, textTransform: 'none', mt: 1 }}
          >
            Trợ giúp
          </Button>
        </Paper>
      </Box>
    </>
  );
  
  const profileMenu = (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleProfileMenuClose}
      keepMounted
      TransitionComponent={Fade}
      PaperProps={{
        elevation: 3,
        sx: { 
          minWidth: 200,
          borderRadius: 2,
          mt: 1,
          p: 1
        }
      }}
    >
      <MenuItem onClick={() => {
        handleProfileMenuClose();
        navigate('/citizen/profile');
      }} sx={{ borderRadius: 1 }}>
        <PersonIcon fontSize="small" sx={{ mr: 1.5 }} />
        Hồ sơ cá nhân
      </MenuItem>
      
      <MenuItem onClick={() => {
        handleProfileMenuClose();
        navigate('/citizen/settings');
      }} sx={{ borderRadius: 1 }}>
        <SettingsIcon fontSize="small" sx={{ mr: 1.5 }} />
        Cài đặt
      </MenuItem>
      
      <MenuItem onClick={() => {
        handleProfileMenuClose();
        navigate('/citizen/security');
      }} sx={{ borderRadius: 1 }}>
        <SecurityIcon fontSize="small" sx={{ mr: 1.5 }} />
        Bảo mật
      </MenuItem>
      
      <Divider sx={{ my: 1 }} />
      
      <MenuItem onClick={handleLogout} sx={{ borderRadius: 1 }}>
        <LogoutIcon fontSize="small" sx={{ mr: 1.5 }} />
        Đăng xuất
      </MenuItem>
    </Menu>
  );
  
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <StyledAppBar position="fixed">
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
          <Typography variant="h6" noWrap component="div" color="primary" fontWeight="bold" sx={{ flexGrow: 1 }}>
            Blockchain Administrative
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Thông báo">
              <IconButton color="inherit" onClick={() => navigate('/citizen/notifications')}>
                <AnimatedBadge badgeContent={notifications} color="error">
                  <NotificationIcon />
                </AnimatedBadge>
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Tài khoản">
              <IconButton 
                edge="end" 
                onClick={handleProfileMenuOpen}
                sx={{ 
                  ml: 1,
                  border: `2px solid ${theme.palette.primary.main}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                  }
                }}
              >
                <Avatar 
                  alt={currentUser?.name || 'User'} 
                  src="/static/images/avatar/citizen.png" 
                  sx={{ width: 32, height: 32 }}
                >
                  {currentUser?.name?.[0] || 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </StyledAppBar>
      {profileMenu}
      
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth, 
            background: 'linear-gradient(180deg, #f0f7ff 0%, #ffffff 100%)',
          },
        }}
      >
        {drawer}
      </Drawer>
      
      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': { 
            width: drawerWidth, 
            boxSizing: 'border-box',
            background: 'linear-gradient(180deg, #f0f7ff 0%, #ffffff 100%)',
            boxShadow: '2px 0px 10px rgba(0, 0, 0, 0.05)',
            borderRight: 'none',
          },
        }}
        open
      >
        {drawer}
      </Drawer>
      
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          bgcolor: '#f8fafc',
          minHeight: '100vh',
        }}
      >
        <Toolbar /> {/* This creates space below the app bar */}
        <Outlet />
      </Box>
    </Box>
  );
};

export default CitizenLayout; 