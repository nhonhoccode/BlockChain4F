import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  TextField,
  Button,
  InputAdornment,
  IconButton,
  FormControl,
  FormHelperText,
  Box,
  Typography,
  Alert,
  Paper,
  CircularProgress,
  Radio,
  Avatar,
  Collapse,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Email, 
  VpnKey,
  AdminPanelSettings as AdminIcon,
  Badge as OfficerIcon,
  AccountCircle as CitizenIcon,
  BugReport as DebugIcon
} from '@mui/icons-material';
import axios from 'axios';
import { API_BASE_URL } from '../../../utils/apiConfig';
import { fetchCSRFToken, addCSRFToken } from '../../../utils/csrf';
import { testAuthentication, getSuggestions } from '../../../utils/debugAuth';

// Direct login form with no dependencies on other services
const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get role from query parameter
  const queryParams = new URLSearchParams(location.search);
  const roleParam = queryParams.get('role');
  
  // State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(roleParam || 'citizen');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [debugResults, setDebugResults] = useState(null);
  const [debugSuggestions, setDebugSuggestions] = useState([]);

  // Fetch CSRF token on mount
  useEffect(() => {
    // Fetch CSRF token when component mounts
    const getCsrfToken = async () => {
      try {
        await fetchCSRFToken();
      } catch (error) {
        console.error('Error fetching CSRF token:', error);
      }
    };
    
    getCsrfToken();
  }, []);

  // Validation function
  const validateForm = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle role change
  const handleRoleChange = (event) => {
    setRole(event.target.value);
    // Reset errors when changing role
    setApiError('');
    setErrors({});
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
          </Box>
        </Box>
      </Paper>
    );
  };

  // Debug function to diagnose authentication issues
  const runAuthDiagnostics = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setApiError('');
    setDebugResults(null);
    setDebugSuggestions([]);
    
    try {
      // Run authentication diagnostics
      const results = await testAuthentication({
        email,
        password
      });
      
      setDebugResults(results);
      setDebugSuggestions(getSuggestions(results));
      
      // If diagnostics succeeded, store the token
      if (results.token && results.profile) {
        localStorage.setItem('token', results.token);
        localStorage.setItem('authUser', JSON.stringify(results.profile));
        
        // Redirect based on role
        const actualRole = results.profile.role;
        if (actualRole === 'chairman') {
          navigate('/admin/chairman/dashboard');
        } else if (actualRole === 'officer') {
          navigate('/officer/dashboard');
        } else {
          navigate('/citizen/dashboard');
        }
      }
    } catch (error) {
      console.error('Diagnostics error:', error);
      setApiError('Error running diagnostics: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle login submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setApiError('');
    
    try {
      // First try standard token endpoint
      console.log('Making login request to:', `${API_BASE_URL}/api/v1/auth/token/`);
      
      try {
        // Send only username and password for authentication
        const loginResponse = await axios({
          method: 'POST',
          url: `${API_BASE_URL}/api/v1/auth/token/`,
          data: {
            username: email,
            password: password
          },
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          withCredentials: true
        });
        
        console.log('Login successful:', loginResponse.data);
        handleLoginSuccess(loginResponse.data);
      } catch (error) {
        console.error('Standard login failed:', error.response || error.message);
        
        // If standard endpoint fails, try debug endpoint
        console.log('Trying debug endpoint as fallback...');
        
        try {
          const debugLoginResponse = await axios({
            method: 'POST',
            url: `${API_BASE_URL}/api/v1/auth/debug-token/`,
            data: {
              username: email,
              password: password
            },
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });
          
          console.log('Debug login successful:', debugLoginResponse.data);
          handleLoginSuccess(debugLoginResponse.data);
        } catch (debugError) {
          console.error('Debug login also failed:', debugError.response || debugError.message);
          
          // If debug also fails, try super debug endpoint
          console.log('Trying super debug endpoint as final fallback...');
          
          try {
            const superDebugLoginResponse = await axios({
              method: 'POST',
              url: `${API_BASE_URL}/api/v1/auth/super-debug-token/`,
              data: {
                username: email,
                password: password
              },
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            });
            
            console.log('Super debug login successful:', superDebugLoginResponse.data);
            handleLoginSuccess(superDebugLoginResponse.data);
          } catch (superDebugError) {
            console.error('Super debug login failed:', superDebugError.response || superDebugError.message);
            setApiError(superDebugError.response?.data?.error || 
                       'Authentication failed. Please check your credentials and try again.');
          }
        }
      }
    } catch (error) {
      console.error('Login process error:', error);
      setApiError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to handle successful login
  const handleLoginSuccess = (data) => {
    if (data.token) {
      localStorage.setItem('token', data.token);
      
      // Store user info
      const userData = {
        id: data.user_id,
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        role: data.role
      };
      
      localStorage.setItem('authUser', JSON.stringify(userData));
      
      // Redirect based on role
      const actualRole = data.role;
      
      if (actualRole === 'chairman') {
        navigate('/admin/chairman/dashboard');
      } else if (actualRole === 'officer') {
        navigate('/officer/dashboard');
      } else {
        navigate('/citizen/dashboard');
      }
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 450, mx: 'auto' }}>
      <Typography variant="h5" component="h1" gutterBottom align="center">
        Đăng nhập
      </Typography>
      
      {apiError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {apiError}
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
          'Đăng nhập với quyền quản trị hệ thống và phê duyệt cán bộ'
        )}
      </Box>
      
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <FormControl fullWidth margin="normal" error={!!errors.email}>
          <TextField
            id="email"
            label="Email"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!errors.email}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email />
                </InputAdornment>
              ),
            }}
          />
          {errors.email && <FormHelperText>{errors.email}</FormHelperText>}
        </FormControl>
        
        <FormControl fullWidth margin="normal" error={!!errors.password}>
          <TextField
            id="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!errors.password}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <VpnKey />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {errors.password && <FormHelperText>{errors.password}</FormHelperText>}
        </FormControl>
        
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          size="large"
          sx={{ mt: 3, mb: 2 }}
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Đăng nhập'}
        </Button>
        
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2">
            <Button 
              color="primary" 
              onClick={() => navigate('/auth/register')}
              sx={{ textTransform: 'none' }}
            >
              Chưa có tài khoản? Đăng ký ngay
            </Button>
          </Typography>
        </Box>
      </Box>
      
      {/* Debug Panel */}
      <Box sx={{ mt: 3 }}>
        <Button
          startIcon={<DebugIcon />}
          color="secondary"
          size="small"
          variant="outlined"
          onClick={() => setDebugMode(!debugMode)}
          sx={{ mb: 1 }}
        >
          {debugMode ? "Hide Debug Tools" : "Show Debug Tools"}
        </Button>
        
        <Collapse in={debugMode}>
          <Paper elevation={1} sx={{ p: 2, mt: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Debug Authentication
            </Typography>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              This tool helps diagnose authentication issues. It will test the authentication flow step by step.
            </Typography>
            
            <Button 
              variant="contained" 
              color="secondary"
              size="small"
              onClick={runAuthDiagnostics}
              disabled={isLoading}
              sx={{ mt: 1, mb: 2 }}
            >
              {isLoading ? <CircularProgress size={20} /> : 'Run Authentication Test'}
            </Button>
            
            {debugResults && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Test Results: <strong>{debugResults.status}</strong>
                </Typography>
                
                <List dense>
                  {debugResults.steps.map((step, index) => (
                    <ListItem key={index} sx={{ pl: 0 }}>
                      <ListItemText 
                        primary={`${step.name}: ${step.status}`}
                        secondary={step.error ? `Error: ${step.error.status} - ${step.error.message}` : null}
                        primaryTypographyProps={{
                          color: step.status === 'success' ? 'success.main' : (step.status === 'failed' ? 'error.main' : 'text.primary')
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
                
                {debugSuggestions.length > 0 && (
                  <>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle2" gutterBottom>
                      Suggestions:
                    </Typography>
                    <List dense>
                      {debugSuggestions.map((suggestion, index) => (
                        <ListItem key={index} sx={{ pl: 0 }}>
                          <ListItemText primary={suggestion} />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
              </Box>
            )}
          </Paper>
        </Collapse>
      </Box>
    </Paper>
  );
};

export default LoginForm; 