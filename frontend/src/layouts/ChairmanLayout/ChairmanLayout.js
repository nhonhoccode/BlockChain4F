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
  useMediaQuery,
  Badge,
  alpha,
  Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  SupervisorAccount as SupervisorIcon,
  Description as DocumentIcon,
  AssessmentOutlined as ReportIcon,
  Notifications as NotificationIcon,
  ExitToApp as LogoutIcon,
  AdminPanelSettings as AdminIcon,
  Settings as SettingsIcon,
  HelpOutline as HelpIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 260;

/**
 * ChairmanLayout Component - Layout for chairman (admin) users
 */
const ChairmanLayout = () => {
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
  
  // Menu items for chairman
  const menuItems = [
    { text: 'Bảng điều khiển', icon: <DashboardIcon />, path: '/admin/chairman', exact: true },
    { text: 'Phê duyệt cán bộ', icon: <SupervisorIcon />, path: '/admin/chairman/officer-approvals', badge: 3 },
    { text: 'Quản lý cán bộ', icon: <AdminIcon />, path: '/admin/chairman/officers' },
    { text: 'Giấy tờ quan trọng', icon: <DocumentIcon />, path: '/admin/chairman/important-documents' },
    { text: 'Báo cáo thống kê', icon: <ReportIcon />, path: '/admin/chairman/reports' }
  ];
  
  const drawer = (
    <>
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          padding: 3,
          background: theme.palette.mode === 'light' 
            ? `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
            : `linear-gradient(45deg, ${theme.palette.primary.dark} 0%, #1a2035 100%)`,
          color: 'white'
        }}
      >
        <Avatar 
          src="/static/images/avatar/chairman.png" 
          alt="Admin Logo"
          sx={{ 
            width: 60, 
            height: 60, 
            mb: 1,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            background: 'white',
            p: 1
          }}
        >
          <AdminIcon fontSize="large" color="primary" />
        </Avatar>
        <Typography variant="h6" noWrap component="div" fontWeight="bold">
          Admin Dashboard
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.8, mt: 0.5 }}>
          Blockchain Administrative System
        </Typography>
      </Box>
      <Divider />
      
      <Box sx={{ px: 2, py: 2 }}>
        <List sx={{ px: 1 }}>
          {menuItems.map((item) => {
            // Use exact matching for the dashboard to avoid multiple active items
            const isActive = item.exact 
              ? window.location.pathname === item.path
              : window.location.pathname.startsWith(item.path);
            
            return (
              <ListItem 
                button 
                key={item.text} 
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{ 
                  mb: 0.5,
                  borderRadius: 2,
                  bgcolor: isActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                  color: isActive ? theme.palette.primary.main : 'inherit',
                  '&:hover': {
                    bgcolor: isActive 
                      ? alpha(theme.palette.primary.main, 0.15)
                      : alpha(theme.palette.primary.main, 0.05)
                  }
                }}
              >
                <ListItemIcon sx={{ 
                  color: isActive ? theme.palette.primary.main : 'inherit',
                  minWidth: 40
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontSize: 14,
                    fontWeight: isActive ? 600 : 400
                  }} 
                />
                {item.badge && (
                  <Box 
                    sx={{
                      backgroundColor: 'error.main', 
                      color: 'white', 
                      width: 22, 
                      height: 22, 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {item.badge}
                  </Box>
                )}
              </ListItem>
            );
          })}
        </List>
      </Box>
      
      <Divider />
      
      <Box sx={{ p: 2, mt: 'auto' }}>
        <Typography variant="caption" color="text.secondary" sx={{ pl: 2 }}>
          © 2025 Blockchain Admin
        </Typography>
      </Box>
    </>
  );
  
  const profileMenu = (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleProfileMenuClose}
      keepMounted
      PaperProps={{
        sx: { 
          mt: 1.5, 
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          minWidth: 180
        }
      }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant="subtitle2" fontWeight="bold">
          {currentUser?.name || 'Admin User'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {currentUser?.email || 'admin@example.com'}
        </Typography>
      </Box>
      <Divider sx={{ my: 1 }} />
      <MenuItem onClick={() => {
        handleProfileMenuClose();
        navigate('/admin/chairman/profile');
      }}>
        <PersonIcon fontSize="small" sx={{ mr: 1.5 }} />
        Hồ sơ của tôi
      </MenuItem>
      <MenuItem onClick={() => {
        handleProfileMenuClose();
        navigate('/admin/chairman/settings');
      }}>
        <SettingsIcon fontSize="small" sx={{ mr: 1.5 }} />
        Cài đặt
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleLogout}>
        <LogoutIcon fontSize="small" sx={{ mr: 1.5 }} />
        Đăng xuất
      </MenuItem>
    </Menu>
  );
  
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: theme.palette.background.default }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          bgcolor: theme.palette.background.paper,
          color: theme.palette.text.primary
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
          
          <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: alpha(theme.palette.divider, 0.08), px: 1, py: 0.5, borderRadius: 2, width: { xs: '100%', md: '320px' } }}>
            <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <input
              placeholder="Tìm kiếm..."
              style={{ 
                border: 'none', 
                outline: 'none', 
                width: '100%', 
                background: 'transparent',
                color: theme.palette.text.primary,
                fontSize: '0.875rem'
              }}
            />
          </Box>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Box sx={{ display: 'flex' }}>
            <Tooltip title="Trợ giúp">
              <IconButton color="inherit">
                <HelpIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Thông báo">
              <IconButton color="inherit">
                <Badge badgeContent={4} color="error">
                  <NotificationIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Cài đặt">
              <IconButton color="inherit">
                <SettingsIcon />
              </IconButton>
            </Tooltip>
            
            <IconButton 
              edge="end" 
              color="inherit" 
              onClick={handleProfileMenuOpen}
              sx={{ ml: 0.5 }}
            >
              <Avatar 
                alt={currentUser?.name || 'Admin'} 
                src="/static/images/avatar/admin.png" 
                sx={{ width: 36, height: 36, bgcolor: theme.palette.primary.main }}
              >
                {currentUser?.name?.[0] || 'A'}
              </Avatar>
            </IconButton>
          </Box>
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
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              boxShadow: '0 2px 20px rgba(0,0,0,0.05)',
              border: 'none'
            },
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
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          minHeight: '100vh',
          pt: '64px', // Height of AppBar
          pb: 4, // Add bottom padding for better spacing
          px: 0 // Remove default horizontal padding to let child components handle it
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default ChairmanLayout; 