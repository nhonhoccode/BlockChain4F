import React, { useState } from 'react';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  Alert,
  Link,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Radio,
  FormHelperText,
  Avatar
} from '@mui/material';
import { 
  Visibility as VisibilityIcon, 
  VisibilityOff as VisibilityOffIcon,
  Login as LoginIcon,
  Lock as LockIcon,
  Google as GoogleIcon,
  Email as EmailIcon,
  AdminPanelSettings as AdminIcon,
  Badge as OfficerIcon,
  AccountCircle as CitizenIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import authService from '../../../services/api/authService';

const LoginPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();
  
  // Lấy từ query parameter để xác định vai trò mặc định
  const queryParams = new URLSearchParams(location.search);
  const roleParam = queryParams.get('role');
  
  // State
  const [loginType, setLoginType] = useState('email'); // 'email' or 'google'
  const [role, setRole] = useState(roleParam || 'citizen');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  
  // Handle role change
  const handleRoleChange = (event) => {
    setRole(event.target.value);
    // Reset form and errors when changing role
    setEmail('');
    setPassword('');
    setError(null);
    setValidationErrors({});
  };
  
  // Toggle password visibility
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };
  
  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!email.trim()) {
      errors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Email không hợp lệ';
    }
    
    if (!password) {
      errors.password = 'Vui lòng nhập mật khẩu';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    // Validate form only for email login
    if (loginType === 'email' && !validateForm()) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Gọi API đăng nhập thực tế từ module authService.ts
      const response = await authService.login({
        email,
        password,
        role // Truyền role được chọn vào API
      });
      
      console.log('Login response:', response);
      
      // Check if the response contains a token (indicating successful login)
      // Django REST token authentication doesn't return a 'success' field
      if (!response.token) {
        throw new Error(response.message || 'Đăng nhập thất bại');
      }
      
      // Lấy vai trò từ phản hồi API
      const userRole = Array.isArray(response.roles) ? response.roles[0] : response.role || role;
      
      // Đảm bảo có token và thông tin người dùng trước khi lưu
      if (!response.token) {
        throw new Error('Không nhận được token xác thực từ máy chủ');
      }
      
      // Lưu thông tin đăng nhập vào localStorage
      localStorage.setItem('token', response.token);
      const userData = {
        id: response.user?.id || response.user_id,
        name: `${response.user?.first_name || response.first_name || ''} ${response.user?.last_name || response.last_name || ''}`.trim(),
        email: response.user?.email || email,
        role: userRole,
        token: response.token
      };

      console.log('Saving user data to localStorage:', userData);
      localStorage.setItem('authUser', JSON.stringify(userData));
      
      setSuccess(true);
      
      // Chuyển hướng dựa vào vai trò
      let redirectTo;
      
      if (userRole === 'citizen') {
        redirectTo = '/citizen';
      } else if (userRole === 'officer') {
        redirectTo = '/officer';
      } else if (userRole === 'chairman' || userRole === 'admin') {
        redirectTo = '/admin/chairman';
      } else {
        redirectTo = '/';
      }
      
      // Log thông tin chuyển hướng
      console.log(`Redirecting to ${redirectTo} based on role: ${userRole}`);
      console.log('Token has been saved:', localStorage.getItem('token'));
      console.log('AuthUser has been saved:', localStorage.getItem('authUser'));
      
      // Đặt timeout để người dùng có thể thấy thông báo thành công
      setTimeout(() => {
        console.log('Executing navigation to:', redirectTo);
        
        // Sử dụng window.location.href trực tiếp để đảm bảo chuyển hướng hoạt động
        window.location.href = redirectTo;
      }, 1000);
    } catch (err) {
      console.error('Login error:', err);
      
      // Xử lý lỗi vai trò không khớp từ backend
      if (err.response && err.response.data && err.response.data.actual_role) {
        const actualRole = err.response.data.actual_role;
        setError(`Tài khoản này có vai trò là ${actualRole}. Vui lòng chọn đúng vai trò để đăng nhập.`);
        
        // Automatically switch to the correct role
        setRole(actualRole);
        
        // Suggest immediate re-login with the correct role
        setTimeout(() => {
          if (role !== actualRole) {
            setError(`Đã chuyển sang vai trò ${actualRole}. Vui lòng nhấn "Đăng nhập" lại.`);
          }
        }, 500);
      } else if (err.message && err.message.includes('Vai trò không khớp')) {
        // Trường hợp backend trả về lỗi "Vai trò không khớp"
        const actualRoleMatch = err.message.match(/vai trò: (\w+)/i);
        if (actualRoleMatch && actualRoleMatch[1]) {
          const actualRole = actualRoleMatch[1];
          setError(`Tài khoản này có vai trò là ${actualRole}. Vui lòng chọn đúng vai trò để đăng nhập.`);
          setRole(actualRole);
        } else {
          setError(err.message);
        }
      } else {
        setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập và thử lại.');
      }
      
      setLoading(false);
    }
  };

  // Handle Google login button click
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: (codeResponse) => {
      console.log('Google login success!', codeResponse);
      
      // Correct the URL path to match our route definition
      const googleAuthUrl = `/auth/google/callback?code=${codeResponse.code}&state=${role}`;
      
      // Redirect to the Google callback handler page
      window.location.href = googleAuthUrl;
    },
    onError: (error) => {
      console.error('Google login error:', error);
      setError('Đăng nhập Google thất bại. Vui lòng thử lại.');
      setLoading(false);
    },
    flow: 'auth-code',
    ux_mode: 'redirect',
    state: role, // Pass the role in the state parameter
    redirect_uri: 'http://localhost:3000/auth/google/callback' // Match exactly what's in Google Console
  });
  
  // Handler for Google login button
  const initiateGoogleLogin = () => {
    // Kiểm tra nếu là vai trò chairman (không cho phép đăng nhập bằng Google)
    if (role === 'chairman') {
      setError('Tài khoản Admin (Chủ tịch xã) không thể đăng nhập bằng Google. Vui lòng sử dụng đăng nhập thường.');
      return;
    }
    
    setLoading(true);
    
    // Thực hiện đăng nhập Google
    handleGoogleLogin();
  };
  
  // Custom role selection card
  const renderRoleCard = (roleValue, icon, title, description, isDisabled = false) => {
    const isSelected = role === roleValue;
    
    // Determine color based on role
    let roleColor;
    switch (roleValue) {
      case 'citizen':
        roleColor = '#1976d2'; // Primary blue
        break;
      case 'officer':
        roleColor = '#388e3c'; // Green
        break;
      case 'chairman':
        roleColor = '#7b1fa2'; // Purple
        break;
      default:
        roleColor = '#757575'; // Grey
    }
    
    return (
      <Paper
        elevation={isSelected ? 3 : 1}
        onClick={() => !isDisabled && setRole(roleValue)}
        sx={{
          p: 2,
          mb: 2,
          border: isSelected ? 2 : 1,
          borderColor: isSelected ? roleColor : 'grey.300',
          borderRadius: 2,
          transition: 'all 0.3s ease',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: isDisabled ? 'grey.100' : (isSelected ? `${roleColor}10` : 'background.paper'),
          opacity: isDisabled ? 0.7 : 1,
          '&:hover': {
            borderColor: isDisabled ? 'grey.300' : roleColor,
            backgroundColor: isDisabled ? 'grey.100' : (isSelected ? `${roleColor}20` : `${roleColor}05`),
            transform: isDisabled ? 'none' : 'translateY(-2px)',
            boxShadow: isDisabled ? 'none' : '0 4px 8px rgba(0,0,0,0.1)'
          }
        }}
      >
        <Radio
          checked={isSelected}
          value={roleValue}
          name="role-radio"
          onChange={handleRoleChange}
          sx={{ mr: 1, color: roleColor }}
          disabled={isDisabled}
        />
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', flexGrow: 1 }}>
          <Avatar 
            sx={{ 
              bgcolor: isSelected ? roleColor : 'grey.300',
              color: isSelected ? 'white' : 'text.primary',
              mr: 2
            }}
          >
            {icon}
          </Avatar>
          <Box>
            <Typography 
              variant="subtitle1" 
              fontWeight="bold" 
              sx={{ color: isSelected ? roleColor : 'text.primary' }}
            >
              {title}
            </Typography>
            {description && (
              <Typography variant="body2" color={isSelected ? 'text.primary' : 'text.secondary'} sx={{ mt: 0.5 }}>
                {description}
              </Typography>
            )}
            {isDisabled && (
              <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                Không thể đăng nhập bằng Google với vai trò này
              </Typography>
            )}
          </Box>
        </Box>
      </Paper>
    );
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 3, textAlign: 'center' }}>
        <Typography variant="h5" component="h1" color="primary" fontWeight="bold" gutterBottom>
          Hệ thống Quản lý Hành chính Blockchain
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Nền tảng kỹ thuật số hiện đại giúp quản lý hành chính minh bạch và bảo mật
        </Typography>
      </Box>
      
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          borderRadius: 2,
          width: '100%',
          maxWidth: 500
        }}
      >
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography 
            variant="h5" 
            component="h1" 
            fontWeight="bold" 
            gutterBottom
            color="primary"
          >
            Đăng nhập
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Đăng nhập để truy cập các dịch vụ hành chính
          </Typography>
        </Box>
        
        {error && (
          <Alert 
            severity={error.includes('Đã chuyển sang vai trò') ? 'info' : 'error'} 
            sx={{ mb: 3 }}
            action={
              error.includes('Đã chuyển sang vai trò') ? (
                <Button 
                  color="primary" 
                  size="small" 
                  variant="outlined"
                  onClick={handleLogin}
                >
                  Thử lại
                </Button>
              ) : null
            }
          >
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert 
            icon={<LoginIcon fontSize="inherit" />}
            severity="success" 
            sx={{ mb: 3 }}
          >
            Đăng nhập thành công! Đang chuyển hướng...
          </Alert>
        )}
        
        {/* Role selection */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom fontWeight="medium" color="text.primary" sx={{ mb: 1 }}>
            Chọn vai trò của bạn
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Mỗi tài khoản chỉ có một vai trò cố định. Nếu bạn đã đăng ký với một vai trò, hãy tiếp tục sử dụng vai trò đó để đăng nhập.
          </Typography>
          
          {renderRoleCard(
            'citizen', 
            <CitizenIcon />, 
            'Người dân',
            'Đăng nhập với tư cách công dân để yêu cầu và theo dõi giấy tờ hành chính'
          )}
          
          {renderRoleCard(
            'officer', 
            <OfficerIcon />, 
            'Cán bộ xã',
            'Đăng nhập với tư cách cán bộ xã để xử lý yêu cầu hành chính từ người dân'
          )}
          
          {renderRoleCard(
            'chairman', 
            <AdminIcon />, 
            'Admin (Chủ tịch xã)',
            'Đăng nhập với quyền quản trị hệ thống và phê duyệt cán bộ',
            loginType === 'google' // Disable if using Google login
          )}
        </Box>
        
        {/* Google login button */}
        <Button
          fullWidth
          variant="outlined"
          color="primary"
          size="large"
          onClick={initiateGoogleLogin}
          disabled={loading || role === 'chairman'}
          startIcon={<GoogleIcon />}
          sx={{ 
            mb: 3, 
            py: 1.5,
            borderWidth: 2,
            borderColor: theme.palette.grey[300],
            color: role === 'chairman' ? theme.palette.grey[400] : (theme.palette.mode === 'dark' ? 'primary.light' : 'primary.main'),
            fontWeight: 'medium',
            opacity: role === 'chairman' ? 0.7 : 1,
            '&:hover': {
              borderWidth: 2,
              borderColor: role === 'chairman' ? theme.palette.grey[300] : theme.palette.primary.main,
              bgcolor: role === 'chairman' ? 'transparent' : 'rgba(63, 81, 181, 0.08)'
            }
          }}
        >
          Đăng nhập với Google
        </Button>
        
        {role === 'chairman' && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              Tài khoản Chủ tịch xã không thể đăng nhập bằng Google. Vui lòng sử dụng đăng nhập thường.
            </Typography>
          </Alert>
        )}
        
        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>
            HOẶC
          </Typography>
        </Divider>
        
        {/* Login form */}
        <Box component="form" onSubmit={handleLogin} sx={{ mt: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            margin="normal"
            required
            id="email"
            label="Email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!validationErrors.email}
            helperText={validationErrors.email}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="primary" />
                </InputAdornment>
              ),
            }}
          />
          
          <FormControl fullWidth variant="outlined" margin="normal">
            <InputLabel htmlFor="password" required>Mật khẩu</InputLabel>
            <OutlinedInput
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!validationErrors.password}
              required
              startAdornment={
                <InputAdornment position="start">
                  <LockIcon color="primary" />
                </InputAdornment>
              }
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleTogglePassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              }
              label="Mật khẩu"
            />
            {validationErrors.password && (
              <FormHelperText error>{validationErrors.password}</FormHelperText>
            )}
          </FormControl>
          
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', my: 2 }}>
            <FormControlLabel
              control={
                <Checkbox 
                  checked={rememberMe} 
                  onChange={(e) => setRememberMe(e.target.checked)}
                  color="primary"
                  size="small"
                />
              }
              label={
                <Typography variant="body2">Lưu thông tin đăng nhập</Typography>
              }
            />
            
            <Link component={RouterLink} to="/auth/reset-password" variant="body2" color="primary">
              Quên mật khẩu?
            </Link>
          </Box>
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
            sx={{ 
              mt: 2, 
              mb: 3, 
              py: 1.5,
              fontWeight: 'medium',
              boxShadow: 3,
              '&:hover': {
                boxShadow: 5
              }
            }}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>
          
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2">
              Chưa có tài khoản? {' '}
              <Link 
                component={RouterLink} 
                to="/auth/register" 
                color="primary" 
                fontWeight="bold"
                sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Đăng ký ngay
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;
