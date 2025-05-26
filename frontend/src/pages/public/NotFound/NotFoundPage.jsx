import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { Box, Container, Typography, Button, Paper, Alert, Link, CircularProgress } from '@mui/material';
import { Home as HomeIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import styles from './NotFoundPage.module.scss';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  
  useEffect(() => {
    // Check if this is a Google OAuth callback that mistakenly reached the 404 page
    const isGoogleCallback = location.search.includes('code=') && 
                            (location.search.includes('state=') || location.search.includes('scope='));
    
    if (isGoogleCallback && !redirectAttempted) {
      console.log('📣 Detected Google OAuth callback on 404 page, redirecting to the correct callback route');
      console.log('📣 Current path:', location.pathname);
      console.log('📣 Query string:', location.search);
      
      // Mark as attempted to prevent loops
      setRedirectAttempted(true);
      setRedirecting(true);
      
      // Redirect to the proper callback route with a timeout to avoid immediate re-render
      setTimeout(() => {
        // If we're already at the google callback path but hit the 404, check if we need to fix the URL format
        if (location.pathname.includes('/google/callback') || location.pathname.includes('/google-callback')) {
          // Try the other format instead
          const correctPath = location.pathname.includes('/google/') 
            ? '/auth/google-callback' 
            : '/auth/google/callback';
          
          console.log(`📣 Trying alternate callback format: ${correctPath}`);
          navigate(`${correctPath}${location.search}`, { replace: true });
        } else {
          // Default to the slash format
          navigate(`/auth/google/callback${location.search}`, { replace: true });
        }
      }, 100);
    }
  }, [location, navigate, redirectAttempted]);

  const goBack = () => {
    navigate(-1);
  };

  const handleManualRedirect = (e) => {
    e.preventDefault();
    setRedirecting(true);
    
    // Try both formats
    const googleCallbackUrl = `/auth/google/callback${location.search}`;
    console.log('📣 Manual redirect to:', googleCallbackUrl);
    
    navigate(googleCallbackUrl, { replace: true });
  };

  return (
    <Box className={styles.notFound}>
      <Container maxWidth="md">
        <Paper elevation={3} className={styles.notFound__paper}>
          <Typography variant="h4" component="h1" className={styles.notFound__title}>
            404 - Trang không tồn tại
          </Typography>
          
          <Typography variant="body1" className={styles.notFound__message}>
            Rất tiếc, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
          </Typography>
          
          {location.search.includes('code=') && (
            <Alert severity="info" sx={{ mt: 2, mb: 3, textAlign: 'left' }}>
              {redirecting ? (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CircularProgress size={20} />
                    <Typography>Đang chuyển hướng đến trang xác thực Google...</Typography>
                  </Box>
                </>
              ) : (
                <>
                  Đang phát hiện mã xác thực Google. Nếu bạn không được chuyển hướng tự động, 
                  vui lòng <Link 
                    component="button"
                    onClick={handleManualRedirect} 
                    sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    nhấp vào đây
                  </Link> để tiếp tục đăng nhập.
                </>
              )}
            </Alert>
          )}
          
          <Box className={styles.notFound__actions}>
            <Button 
              variant="outlined" 
              color="primary" 
              startIcon={<ArrowBackIcon />}
              onClick={goBack}
              className={styles.notFound__backButton}
            >
              Quay lại
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<HomeIcon />}
              component={RouterLink} 
              to="/" 
              className={styles.notFound__homeButton}
            >
              Về trang chủ
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default NotFoundPage; 