import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert, Button, Paper, Container, Divider } from '@mui/material';
import authService from '../../../services/api/authService';

/**
 * Trang callback cho OAuth Google
 * - Nhận code từ Google OAuth
 * - Gửi code đến backend để xác thực
 * - Chuyển hướng người dùng đến trang dashboard tương ứng
 */
const GoogleCallback = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [debugInfo, setDebugInfo] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        // Lấy code từ query parameters
        const query = new URLSearchParams(location.search);
        const code = query.get('code');
        const state = query.get('state'); // role được gửi qua state parameter
        
        // Thu thập thông tin debug
        setDebugInfo({
          currentPath: location.pathname,
          searchParams: location.search,
          hasCode: !!code,
          hasState: !!state,
          timestamp: new Date().toISOString()
        });
        
        console.log('👉 GoogleCallback: Current path:', location.pathname);
        console.log('👉 GoogleCallback: Query params:', location.search);
        
        // Kiểm tra nếu không có code
        if (!code) {
          throw new Error('Không nhận được mã xác thực từ Google. Vui lòng thử lại.');
        }
        
        // Gửi code đến backend để xác thực
        console.log('👉 Processing Google callback with code and state:', { 
          code: code ? `${code.substring(0, 10)}...` : 'missing', 
          state 
        });
        
        // Call googleLogin with the auth code
        const response = await authService.googleLogin({
          token: code,
          role: state || 'citizen',
          isAuthCode: true  // Explicitly set to true for auth code flow
        });
        
        // Check if response contains a token (required for successful login)
        if (!response || !response.token) {
          throw new Error(response?.message || 'Không nhận được token xác thực từ máy chủ.');
        }
        
        // Lấy vai trò từ phản hồi API
        const userRole = response.role || response.user?.role || state || 'citizen';
        
        // Lưu thông tin người dùng và token vào localStorage
        localStorage.setItem('token', response.token);
        
        // Build user data object from response
        const userData = {
          id: response.user_id || response.user?.id,
          name: `${response.first_name || response.user?.first_name || ''} ${response.last_name || response.user?.last_name || ''}`.trim(),
          email: response.email || response.user?.email || '',
          role: userRole,
          token: response.token
        };
        
        console.log('Saving user data to localStorage:', userData);
        localStorage.setItem('authUser', JSON.stringify(userData));
        
        setSuccess(true);
        setLoading(false);
        
        // Xác định trang chuyển hướng theo vai trò
        let redirectTo;
        if (userRole === 'citizen') {
          redirectTo = '/citizen';
        } else if (userRole === 'officer') {
          redirectTo = '/officer';
        } else if (userRole === 'chairman') {
          redirectTo = '/admin/chairman';
        } else {
          redirectTo = '/';
        }
        
        // Log thông tin chuyển hướng
        console.log(`Redirecting to ${redirectTo} based on role: ${userRole}`);
        console.log('Token has been saved:', localStorage.getItem('token') ? 'YES' : 'NO');
        console.log('AuthUser has been saved:', localStorage.getItem('authUser') ? 'YES' : 'NO');
        
        // Chuyển hướng sau khi đăng nhập thành công
        setTimeout(() => {
          console.log('Executing navigation to:', redirectTo);
          
          // Use window.location.href for clean redirect that forces page refresh
          window.location.href = redirectTo;
        }, 1000);
      } catch (error) {
        console.error('Google callback error:', error);
        setError(error.message || 'Đăng nhập bằng Google thất bại. Vui lòng thử lại.');
        setLoading(false);
      }
    };

    // Thực hiện xử lý callback
    handleGoogleCallback();
  }, [location, navigate, retryCount]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setRetryCount(prev => prev + 1);
  };

  const handleGoToLogin = () => {
    navigate('/auth/login', { replace: true });
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, width: '100%', textAlign: 'center' }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Đăng nhập bằng Google
        </Typography>
        
        {loading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
            <CircularProgress size={60} />
            <Typography variant="body1" sx={{ mt: 2 }}>
              Đang xử lý đăng nhập...
            </Typography>
          </Box>
        )}
        
        {error && (
          <Box sx={{ my: 3 }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
              <Button variant="outlined" onClick={handleRetry}>
                Thử lại
              </Button>
              <Button variant="contained" onClick={handleGoToLogin}>
                Quay lại đăng nhập
              </Button>
            </Box>
          </Box>
        )}
        
        {success && (
          <Box sx={{ my: 3 }}>
            <Alert severity="success" sx={{ mb: 2 }}>
              Đăng nhập thành công! Đang chuyển hướng...
            </Alert>
            <CircularProgress size={30} sx={{ mt: 2 }} />
          </Box>
        )}
        
        {debugInfo && error && (
          <>
            <Divider sx={{ my: 3 }} />
            <Box sx={{ mt: 3, textAlign: 'left' }}>
              <Typography variant="subtitle2" gutterBottom>
                Thông tin gỡ lỗi (Debug):
              </Typography>
              <Typography variant="body2" component="pre" sx={{ 
                p: 2, 
                bgcolor: 'grey.100', 
                borderRadius: 1,
                fontSize: '0.75rem',
                overflowX: 'auto'
              }}>
                {JSON.stringify(debugInfo, null, 2)}
              </Typography>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default GoogleCallback; 