import React from 'react';
import { Outlet, Link as RouterLink } from 'react-router-dom';
import { Box, Container, Typography, Link } from '@mui/material';
import { AccountBalance as AccountBalanceIcon } from '@mui/icons-material';
import styles from './AuthLayout.module.scss';
import BlockchainBadge from '../../components/common/BlockchainBadge/BlockchainBadge';
import AuthStatus from '../../components/common/AuthStatus';

/**
 * Authentication layout component for login, register, etc.
 * @returns {React.ReactNode} The auth layout with a centered paper container
 */
const AuthLayout = () => {
  return (
    <Box className={styles.authLayoutRoot}>
      {/* Header */}
      <Container maxWidth="lg" className={styles.headerContainer}>
        <Box 
          component={RouterLink} 
          to="/"
          className={styles.logoContainer}
        >
          <AccountBalanceIcon sx={{ fontSize: 32 }} />
          <Typography variant="h5" component="h1" className={styles.logoText}>
            Hệ thống Quản lý Hành chính Xã
          </Typography>
        </Box>
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
          <AuthStatus />
          <BlockchainBadge sx={{ ml: 2 }} />
        </Box>
      </Container>
      
      {/* Main content */}
      <Container 
        component="main" 
        maxWidth="lg" 
        className={styles.mainContainer}
      >
        <Outlet />
      </Container>
      
      {/* Footer */}
      <Box component="footer" className={styles.footer}>
        <Container maxWidth="lg" className={styles.footerContainer}>
          <Box className={styles.footerContent}>
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} Hệ thống Quản lý Hành chính dựa trên Blockchain
            </Typography>
            <nav className={styles.footerLinks}>
              <Link component={RouterLink} to="/" className={styles.footerLink}>
                Trang chủ
              </Link>
              <Link component={RouterLink} to="/document-verify" className={styles.footerLink}>
                Xác thực giấy tờ
              </Link>
              <Link component={RouterLink} to="/about" className={styles.footerLink}>
                Giới thiệu
              </Link>
              <Link component={RouterLink} to="/contact" className={styles.footerLink}>
                Liên hệ
              </Link>
            </nav>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default AuthLayout;
