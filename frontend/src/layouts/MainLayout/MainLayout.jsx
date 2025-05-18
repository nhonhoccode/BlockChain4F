import React, { useState, useRef } from 'react';
import { Outlet, Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import {  AppBar,  Box,  Button,  Container,  Divider,  Drawer,  Grid,  IconButton,  Link,  List,  ListItem,  ListItemButton,  ListItemIcon,  ListItemText,  Toolbar,  Typography,  useMediaQuery,  useTheme,  CssBaseline} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Home as HomeIcon,
  VerifiedUser as VerifiedUserIcon,
  Info as InfoIcon,
  Mail as MailIcon,
  Login as LoginIcon,
  PersonAdd as RegisterIcon,
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';
import styles from './MainLayout.module.scss';
import BlockchainBadge from '../../components/common/BlockchainBadge/BlockchainBadge';
import AuthStatus from '../../components/common/AuthStatus';

// Define navigation items
const navItems = [
  { text: 'Trang chủ', path: '/', icon: <HomeIcon sx={{ fontSize: '20px' }} /> },
  { text: 'Xác thực giấy tờ', path: '/document-verify', icon: <VerifiedUserIcon sx={{ fontSize: '20px' }} /> },
  { text: 'Giới thiệu', path: '/about', icon: <InfoIcon sx={{ fontSize: '20px' }} /> },
  { text: 'Liên hệ', path: '/contact', icon: <MailIcon sx={{ fontSize: '20px' }} /> },
];

// Define service items for dropdown
const serviceItems = [
  { text: 'Giấy khai sinh', path: '/auth/login' },
  { text: 'Chứng minh nhân dân', path: '/auth/login' },
  { text: 'Xác nhận thường trú', path: '/auth/login' },
  { text: 'Chứng nhận hôn nhân', path: '/auth/login' },
  { text: 'Giấy chứng tử', path: '/auth/login' },
];

/**
 * MainLayout - Layout chính cho các trang công khai
 * Bao gồm Header, Content và Footer
 */
const MainLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();
  
  // State for mobile sidebar
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Handle drawer toggle
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  // Check if path is active
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  // Mobile drawer content
  const drawerContent = (
    <Box className={styles.drawer} role="presentation" sx={{ p: 2 }}>
      <Box className={styles.drawerHeader} sx={{ 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AccountBalanceIcon sx={{ 
            color: '#2563eb', 
            mr: 1.5, 
            fontSize: '24px' 
          }} />
          <Typography variant="h6" sx={{ 
            fontWeight: 600, 
            color: '#2563eb',
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
          }}>
            Menu
          </Typography>
        </Box>
        <IconButton 
          color="inherit" 
          onClick={handleDrawerToggle} 
          edge="end"
          sx={{
            color: 'rgba(0, 0, 0, 0.6)',
            '&:hover': {
              color: '#2563eb',
              backgroundColor: 'rgba(37, 99, 235, 0.08)'
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider sx={{ mb: 2 }} />
      <List sx={{ py: 1 }}>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              component={RouterLink}
              to={item.path}
              selected={isActive(item.path)}
              onClick={handleDrawerToggle}
              sx={{
                borderRadius: '8px',
                py: 1.2,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(37, 99, 235, 0.1)',
                  color: '#2563eb',
                  '&:hover': {
                    backgroundColor: 'rgba(37, 99, 235, 0.15)',
                  },
                  '& .MuiListItemIcon-root': {
                    color: '#2563eb'
                  }
                },
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              <ListItemIcon sx={{ 
                minWidth: '42px',
                color: isActive(item.path) ? '#2563eb' : 'rgba(0, 0, 0, 0.6)'
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ 
                  sx: { 
                    fontWeight: isActive(item.path) ? 600 : 500,
                    fontSize: '0.95rem',
                    letterSpacing: '0.2px',
                    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                  } 
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
        <Divider sx={{ my: 2 }} />
        <ListItem disablePadding sx={{ mb: 1 }}>
          <ListItemButton
            component={RouterLink}
            to="/auth/login"
            onClick={handleDrawerToggle}
            sx={{
              borderRadius: '8px',
              py: 1.2,
              '&:hover': {
                backgroundColor: 'rgba(37, 99, 235, 0.08)'
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: '42px', color: '#2563eb' }}>
              <LoginIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Đăng nhập" 
              primaryTypographyProps={{ 
                sx: { 
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  letterSpacing: '0.2px',
                  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                } 
              }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding sx={{ mb: 1 }}>
          <ListItemButton
            component={RouterLink}
            to="/auth/register"
            onClick={handleDrawerToggle}
            sx={{
              borderRadius: '8px',
              py: 1.2,
              '&:hover': {
                backgroundColor: 'rgba(37, 99, 235, 0.08)'
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: '42px', color: '#2563eb' }}>
              <RegisterIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Đăng ký" 
              primaryTypographyProps={{ 
                sx: { 
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  letterSpacing: '0.2px',
                  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                } 
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <CssBaseline />
      <Box className={styles.container}>
        {/* Header */}
        <AppBar 
          position="fixed" 
          className={styles.appBar}
          elevation={0}
          sx={{ 
            backgroundColor: 'white',
            borderBottom: '1px solid rgba(0, 0, 0, 0.08)'
          }}
        >
          <Container maxWidth="lg">
            <Toolbar className={styles.toolbar} disableGutters>
              {/* Logo */}
              <Box 
                component={RouterLink} 
                to="/" 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  textDecoration: 'none', 
                  color: 'inherit',
                  mr: 4
                }}
              >
                <AccountBalanceIcon 
                  sx={{ 
                    display: { xs: 'none', sm: 'flex' }, 
                    mr: 1, 
                    color: '#2563eb' 
                  }} 
                />
                <Typography
                  variant="h6"
                  noWrap
                  sx={{
                    display: { xs: 'none', sm: 'flex' },
                    fontWeight: 700,
                    letterSpacing: '.1rem',
                    color: '#2563eb',
                    textDecoration: 'none',
                  }}
                >
                  BlockAdmin
                </Typography>
              </Box>

              {/* Mobile menu button */}
              <Box sx={{ display: { xs: 'flex', md: 'none' }, flexGrow: 1 }}>
                <IconButton
                  size="large"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{ color: '#2563eb' }}
                >
                  <MenuIcon />
                </IconButton>
              </Box>

              {/* Mobile logo center */}
              <Box 
                component={RouterLink} 
                to="/" 
                sx={{ 
                  display: { xs: 'flex', md: 'none' }, 
                  alignItems: 'center',
                  textDecoration: 'none', 
                  color: 'inherit',
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)'
                }}
              >
                <AccountBalanceIcon 
                  sx={{ 
                    mr: 1, 
                    color: '#2563eb' 
                  }} 
                />
                <Typography
                  variant="h6"
                  noWrap
                  sx={{
                    fontWeight: 700,
                    letterSpacing: '.1rem',
                    color: '#2563eb',
                    textDecoration: 'none',
                  }}
                >
                  BlockAdmin
                </Typography>
              </Box>

              {/* Desktop navigation */}
              <Box 
                sx={{ 
                  flexGrow: 1, 
                  display: { xs: 'none', md: 'flex' }, 
                  justifyContent: 'center' 
                }}
              >
                {navItems.map((item) => (
                  <Button
                    key={item.text}
                    component={RouterLink}
                    to={item.path}
                    startIcon={item.icon}
                    sx={{
                      mx: 1,
                      color: isActive(item.path) ? '#2563eb' : 'rgba(0, 0, 0, 0.7)',
                      fontWeight: isActive(item.path) ? 600 : 500,
                      fontSize: '0.95rem',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      '&:hover': {
                        backgroundColor: 'rgba(37, 99, 235, 0.08)',
                        color: '#2563eb'
                      }
                    }}
                  >
                    {item.text}
                  </Button>
                ))}
              </Box>

              {/* Auth Buttons */}
              <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                <Button 
                  component={RouterLink} 
                  to="/auth/login"
                  variant="text" 
                  startIcon={<LoginIcon />}
                  sx={{ 
                    color: 'rgba(0, 0, 0, 0.7)',
                    fontWeight: 500,
                    mr: 1,
                    '&:hover': {
                      backgroundColor: 'rgba(37, 99, 235, 0.08)',
                      color: '#2563eb'
                    }
                  }}
                >
                  Đăng nhập
                </Button>
                <Button 
                  component={RouterLink} 
                  to="/auth/register"
                  variant="contained" 
                  startIcon={<RegisterIcon />}
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

              {/* Add this to the header section */}
              <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                <AuthStatus />
                <BlockchainBadge sx={{ ml: 2 }} />
                {/* Add other header icons or buttons here */}
              </Box>
            </Toolbar>
          </Container>
        </AppBar>

        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: '80%',
              maxWidth: '300px'
            },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Main content */}
        <Box component="main" className={styles.content}>
          <Toolbar /> {/* Spacer for fixed AppBar */}
          <Outlet />
        </Box>

        {/* Footer */}
        <Box component="footer" className={styles.footer}>
          <Container maxWidth="lg">
            <Box sx={{ py: 6, borderTop: '1px solid rgba(0, 0, 0, 0.1)' }}>
              <Grid container spacing={4}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AccountBalanceIcon sx={{ color: '#2563eb', mr: 1 }} />
                    <Typography variant="h6" fontWeight={700} color="#2563eb">
                      BlockAdmin
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Hệ thống quản lý hành chính dựa trên công nghệ blockchain, đảm bảo tính minh bạch và bảo mật cho mọi giấy tờ hành chính.
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Dịch vụ
                  </Typography>
                  <List dense disablePadding>
                    {serviceItems.map((item) => (
                      <ListItem key={item.text} disablePadding>
                        <ListItemButton
                          component={RouterLink}
                          to={item.path}
                          sx={{ py: 0.5, px: 0 }}
                        >
                          <ListItemText 
                            primary={item.text} 
                            primaryTypographyProps={{ 
                              variant: 'body2',
                              sx: { color: 'rgba(0, 0, 0, 0.6)' }
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Liên kết
                  </Typography>
                  <List dense disablePadding>
                    {navItems.map((item) => (
                      <ListItem key={item.text} disablePadding>
                        <ListItemButton
                          component={RouterLink}
                          to={item.path}
                          sx={{ py: 0.5, px: 0 }}
                        >
                          <ListItemText 
                            primary={item.text} 
                            primaryTypographyProps={{ 
                              variant: 'body2',
                              sx: { color: 'rgba(0, 0, 0, 0.6)' }
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Liên hệ
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Số 1 Đường Nguyễn Thái Học, Phường Điện Biên, Quận Ba Đình, Hà Nội
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Email: support@blockchain-admin.gov.vn
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Hotline: (+84) 28 1234 5678
                  </Typography>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 6, pt: 3, borderTop: '1px solid rgba(0, 0, 0, 0.1)', textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  © {new Date().getFullYear()} BlockAdmin. Bản quyền thuộc về Sinh Viên Việt Nam.
                </Typography>
              </Box>
            </Box>
          </Container>
        </Box>
      </Box>
    </>
  );
};

export default MainLayout; 