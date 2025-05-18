import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Checkbox,
  InputAdornment,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Divider,
  Link,
  CircularProgress,
  FormHelperText,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  useTheme
} from '@mui/material';
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  AlternateEmail as EmailIcon,
  Badge as BadgeIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Check as CheckIcon,
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
  Google as GoogleIcon,
  Facebook as FacebookIcon,
  Security as SecurityIcon,
  AccountCircle as AccountCircleIcon,
  AccountBalance as AccountBalanceIcon,
  AdminPanelSettings as AdminPanelSettingsIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { vi } from 'date-fns/locale';
import styles from './RegisterPage.module.scss';
import { useGoogleLogin } from '@react-oauth/google';
import authService from '../../../services/api/authService';

// Các bước đăng ký
const steps = [
  'Thông tin cá nhân',
  'Địa chỉ & Liên hệ',
  'Tài khoản & Vai trò'
];

// Danh sách tỉnh/thành phố
const provinces = [
  'Hà Nội', 'TP Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
  'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu',
  'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước',
  'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông',
  'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang',
  'Hà Nam', 'Hà Tĩnh', 'Hải Dương', 'Hậu Giang', 'Hòa Bình',
  'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu',
  'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định',
  'Nghệ An', 'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên',
  'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị',
  'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên',
  'Thanh Hóa', 'Thừa Thiên Huế', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang',
  'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái'
];

const RegisterPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [userId, setUserId] = useState('');
  const [registerMethod, setRegisterMethod] = useState('form'); // 'form' or 'google'
  
  // State cho password
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    // Thông tin cá nhân
    first_name: '',
    last_name: '',
    dateOfBirth: null,
    gender: 'male',
    idNumber: '',
    idIssueDate: null,
    idIssuePlace: '',
    nationality: 'Việt Nam',
    
    // Địa chỉ & Liên hệ
    address: '',
    city: '',
    district: '',
    ward: '',
    phone_number: '',
    email: '',
    
    // Tài khoản
    password: '',
    confirmPassword: '',
    role: 'citizen', // Mặc định là người dân
    
    // Điều khoản
    agreeTerms: false
  });
  
  // Validation errors
  const [errors, setErrors] = useState({});
  
  // Xử lý thay đổi trường form
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Xóa lỗi khi người dùng sửa trường có lỗi
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  // Xử lý thay đổi ngày sinh
  const handleDateOfBirthChange = (date) => {
    setFormData({
      ...formData,
      dateOfBirth: date
    });
    
    if (errors.dateOfBirth) {
      setErrors({
        ...errors,
        dateOfBirth: null
      });
    }
  };
  
  // Xử lý thay đổi ngày cấp CMND
  const handleIdIssueDateChange = (date) => {
    setFormData({
      ...formData,
      idIssueDate: date
    });
    
    if (errors.idIssueDate) {
      setErrors({
        ...errors,
        idIssueDate: null
      });
    }
  };
  
  // Hiển thị/ẩn mật khẩu
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };
  
  // Hiển thị/ẩn xác nhận mật khẩu
  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  // Chuyển đến bước tiếp theo
  const handleNext = () => {
    if (validateCurrentStep()) {
      if (activeStep === steps.length - 1) {
        handleSubmit();
      } else {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
      }
    }
  };
  
  // Quay lại bước trước
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Validate current step
  const validateCurrentStep = () => {
    let stepErrors = {};
    let isValid = true;
    
    // Validate Step 1: Thông tin cá nhân
    if (activeStep === 0) {
      if (!formData.first_name.trim()) {
        stepErrors.first_name = 'Vui lòng nhập tên';
        isValid = false;
      }
      
      if (!formData.last_name.trim()) {
        stepErrors.last_name = 'Vui lòng nhập họ';
        isValid = false;
      }
      
      if (!formData.dateOfBirth) {
        stepErrors.dateOfBirth = 'Vui lòng chọn ngày sinh';
        isValid = false;
      }
      
      if (!formData.idNumber.trim()) {
        stepErrors.idNumber = 'Vui lòng nhập số CMND/CCCD';
        isValid = false;
      } else if (!/^\d{9}$|^\d{12}$/.test(formData.idNumber)) {
        stepErrors.idNumber = 'Số CMND/CCCD không hợp lệ (9 hoặc 12 số)';
        isValid = false;
      }
      
      if (!formData.idIssueDate) {
        stepErrors.idIssueDate = 'Vui lòng chọn ngày cấp';
        isValid = false;
      }
      
      if (!formData.idIssuePlace.trim()) {
        stepErrors.idIssuePlace = 'Vui lòng nhập nơi cấp';
        isValid = false;
      }
    }
    
    // Validate Step 2: Địa chỉ & Liên hệ
    else if (activeStep === 1) {
      if (!formData.address.trim()) {
        stepErrors.address = 'Vui lòng nhập địa chỉ';
        isValid = false;
      }
      
      if (!formData.city.trim()) {
        stepErrors.city = 'Vui lòng chọn tỉnh/thành phố';
        isValid = false;
      }
      
      if (!formData.district.trim()) {
        stepErrors.district = 'Vui lòng nhập quận/huyện';
        isValid = false;
      }
      
      if (!formData.ward.trim()) {
        stepErrors.ward = 'Vui lòng nhập phường/xã';
        isValid = false;
      }
      
      if (!formData.phone_number.trim()) {
        stepErrors.phone_number = 'Vui lòng nhập số điện thoại';
        isValid = false;
      } else if (!/^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(formData.phone_number)) {
        stepErrors.phone_number = 'Số điện thoại không hợp lệ';
        isValid = false;
      }
      
      if (!formData.email.trim()) {
        stepErrors.email = 'Vui lòng nhập email';
        isValid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        stepErrors.email = 'Email không hợp lệ';
        isValid = false;
      }
    }
    
    // Validate Step 3: Tài khoản
    else if (activeStep === 2) {
      if (!formData.password) {
        stepErrors.password = 'Vui lòng nhập mật khẩu';
        isValid = false;
      } else if (formData.password.length < 8) {
        stepErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
        isValid = false;
      } else if (!/[A-Z]/.test(formData.password)) {
        stepErrors.password = 'Mật khẩu phải có ít nhất 1 chữ hoa';
        isValid = false;
      } else if (!/[0-9]/.test(formData.password)) {
        stepErrors.password = 'Mật khẩu phải có ít nhất 1 chữ số';
        isValid = false;
      } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
        stepErrors.password = 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt';
        isValid = false;
      }
      
      if (!formData.confirmPassword) {
        stepErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
        isValid = false;
      } else if (formData.confirmPassword !== formData.password) {
        stepErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        isValid = false;
      }
      
      if (!formData.role) {
        stepErrors.role = 'Vui lòng chọn vai trò';
        isValid = false;
      }
      
      if (!formData.agreeTerms) {
        stepErrors.agreeTerms = 'Bạn phải đồng ý với điều khoản sử dụng';
        isValid = false;
      }
    }
    
    setErrors(stepErrors);
    return isValid;
  };
  
  // Handle Google Registration
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setRegisterMethod('google');
      setLoading(true);
      
      try {
        // Check if we have auth code or access token
        if (tokenResponse.code) {
          console.log('Google OAuth auth code success:', tokenResponse);
          sessionStorage.setItem('googleToken', tokenResponse.code);
          sessionStorage.setItem('isAuthCode', 'true');
        } else if (tokenResponse.access_token) {
          console.log('Google OAuth access token success:', tokenResponse);
          sessionStorage.setItem('googleToken', tokenResponse.access_token);
          sessionStorage.setItem('isAuthCode', 'false');
          
          // Attempt to get user info from Google
          try {
            const userInfoResponse = await fetch(
              `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokenResponse.access_token}`
            );
            
            if (!userInfoResponse.ok) {
              throw new Error(`Failed to fetch user info: ${userInfoResponse.status}`);
            }
            
            const userInfo = await userInfoResponse.json();
            console.log('Google user info:', userInfo);
            
            // Update form with basic info from Google
            setFormData({
              ...formData,
              first_name: userInfo.given_name || '',
              last_name: userInfo.family_name || '',
              email: userInfo.email || '',
              // Keep the selected role, but default to citizen if chairman was selected
              role: formData.role === 'chairman' ? 'citizen' : formData.role,
            });
          } catch (error) {
            console.error('Error fetching user info from Google:', error);
          }
        } else {
          console.error('No token received from Google');
          setError('Không thể lấy token từ Google. Vui lòng thử lại.');
        }
        
        // Skip to the role selection step
        setActiveStep(2);
        setLoading(false);
        
      } catch (err) {
        console.error('Google registration error:', err);
        setError('Đăng ký bằng Google thất bại: ' + (err.message || 'Lỗi không xác định'));
        setLoading(false);
      }
    },
    onError: (errorResponse) => {
      console.error('Google registration error:', errorResponse);
      setError('Đăng ký bằng Google thất bại: ' + (errorResponse.error || 'Lỗi không xác định'));
    },
    // Use auth-code flow to be consistent with login page
    flow: 'auth-code',
    scope: 'email profile openid',
    // Use popup instead of redirect to preserve form data
    ux_mode: 'popup',
    // Additional configuration for compatibility
    select_account: true,
    prompt: 'consent',
    redirect_uri: window.location.origin + '/auth/google/callback'
  });
  
  const handleGoogleRegister = () => {
    googleLogin();
  };

  // Xử lý đăng ký
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (registerMethod === 'google') {
        // Sử dụng Google OAuth để đăng ký
        const token = sessionStorage.getItem('googleToken');
        if (!token) {
          throw new Error('Không tìm thấy token Google. Vui lòng thử lại.');
        }
        
        const isAuthCode = sessionStorage.getItem('isAuthCode') === 'true';
        
        response = await authService.googleRegister({
          token: token,
          role: formData.role,
          isAuthCode: isAuthCode,
          additionalData: {
            phone_number: formData.phone_number,
            address: formData.address,
            ward: formData.ward,
            district: formData.district,
            province: formData.city,
            gender: formData.gender,
            id_number: formData.idNumber,
            id_issue_date: formData.idIssueDate,
            id_issue_place: formData.idIssuePlace
          }
        });
      } else {
        // Đăng ký thông thường
        const firstName = formData.first_name ? formData.first_name.trim() : '';
        const lastName = formData.last_name ? formData.last_name.trim() : '';
        if (!firstName || !lastName) {
          setError('Bạn phải nhập đầy đủ họ và tên.');
          setLoading(false);
          return;
        }
        const userData = {
          username: formData.email,
          email: formData.email,
          password: formData.password,
          password_confirm: formData.confirmPassword,
          first_name: firstName,
          last_name: lastName,
          role: formData.role,
          phone_number: formData.phone_number,
          address: formData.address,
          ward: formData.ward,
          district: formData.district,
          province: formData.city
        };
        console.log('Payload gửi lên backend:', userData);
        response = await authService.register(userData);
      }
      
      console.log('Registration response:', response);
      
      if (!response.success) {
        throw new Error(response.message || 'Đăng ký thất bại. Vui lòng thử lại.');
      }
      
      setSuccess(true);
      setUserId(response.user_id || response.userId);
      
      // Store the token in localStorage
      if (response.token) {
        const userData = {
          id: response.user_id || response.userId,
          email: formData.email,
          name: `${formData.first_name} ${formData.last_name}`,
          role: formData.role,
          token: response.token
        };
        
        console.log('Saving user data to localStorage:', userData);
        localStorage.setItem('token', response.token);
        localStorage.setItem('authUser', JSON.stringify(userData));
        
        // Chuyển hướng người dùng đến trang dashboard tương ứng
        setTimeout(() => {
          let redirectTo;
          if (formData.role === 'citizen') {
            redirectTo = '/citizen';
          } else if (formData.role === 'officer') {
            redirectTo = '/officer';
          } else if (formData.role === 'chairman') {
            redirectTo = '/admin/chairman';
          } else {
            redirectTo = '/';
          }
          
          console.log(`Redirecting to ${redirectTo} based on role: ${formData.role}`);
          navigate(redirectTo, { replace: true });
        }, 1500);
      }
      
      // Clean up the session storage
      sessionStorage.removeItem('googleToken');
      sessionStorage.removeItem('isAuthCode');
    } catch (err) {
      setError(err.message);
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };
  
  // Helper to show error message
  const showError = (message) => {
    setError(message);
    window.scrollTo(0, 0);
  };
  
  // Render nội dung cho từng bước
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2} className={styles.form}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Họ"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                error={!!errors.last_name}
                helperText={errors.last_name}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tên"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                error={!!errors.first_name}
                helperText={errors.first_name}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
                <DatePicker
                  label="Ngày sinh"
                  value={formData.dateOfBirth}
                  onChange={handleDateOfBirthChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.dateOfBirth,
                      helperText: errors.dateOfBirth
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Giới tính</FormLabel>
                <RadioGroup
                  row
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <FormControlLabel value="male" control={<Radio />} label="Nam" />
                  <FormControlLabel value="female" control={<Radio />} label="Nữ" />
                  <FormControlLabel value="other" control={<Radio />} label="Khác" />
                </RadioGroup>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>Thông tin CMND/CCCD</Divider>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Số CMND/CCCD"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleChange}
                error={!!errors.idNumber}
                helperText={errors.idNumber}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
                <DatePicker
                  label="Ngày cấp"
                  value={formData.idIssueDate}
                  onChange={handleIdIssueDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.idIssueDate,
                      helperText: errors.idIssueDate
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nơi cấp"
                name="idIssuePlace"
                value={formData.idIssuePlace}
                onChange={handleChange}
                error={!!errors.idIssuePlace}
                helperText={errors.idIssuePlace}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountBalanceIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        );
        
      case 1:
        return (
          <Grid container spacing={2} className={styles.form}>
            {/* Address Information */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>Địa chỉ</Typography>
              <TextField
                fullWidth
                name="address"
                label="Số nhà, tên đường"
                value={formData.address}
                onChange={handleChange}
                error={!!errors.address}
                helperText={errors.address}
                disabled={loading}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <HomeIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth required error={!!errors.city}>
                <InputLabel>Tỉnh/Thành phố</InputLabel>
                <Select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  label="Tỉnh/Thành phố"
                  error={!!errors.city}
                  disabled={loading}
                  required
                >
                  {provinces.map((province) => (
                    <MenuItem key={province} value={province}>
                      {province}
                    </MenuItem>
                  ))}
                </Select>
                {errors.city && <FormHelperText error>{errors.city}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                name="district"
                label="Quận/Huyện"
                value={formData.district}
                onChange={handleChange}
                error={!!errors.district}
                helperText={errors.district}
                disabled={loading}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                name="ward"
                label="Phường/Xã"
                value={formData.ward}
                onChange={handleChange}
                error={!!errors.ward}
                helperText={errors.ward}
                disabled={loading}
                required
              />
            </Grid>
            
            {/* Contact Information */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>Thông tin liên hệ</Divider>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="phone_number"
                label="Số điện thoại"
                value={formData.phone_number}
                onChange={handleChange}
                error={!!errors.phone_number}
                helperText={errors.phone_number}
                disabled={loading}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                disabled={loading || registerMethod === 'google'}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        );
        
      case 2:
        return (
          <Grid container spacing={2} className={styles.form}>
            {registerMethod === 'form' && (
              <>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>Thông tin đăng nhập</Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    name="password"
                    label="Mật khẩu"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    error={!!errors.password}
                    helperText={errors.password}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SecurityIcon />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleTogglePassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    name="confirmPassword"
                    label="Xác nhận mật khẩu"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SecurityIcon />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle confirm password visibility"
                            onClick={handleToggleConfirmPassword}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
              </>
            )}
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>Chọn vai trò</Divider>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl component="fieldset" error={!!errors.role}>
                <FormLabel component="legend">Vai trò của bạn</FormLabel>
                <RadioGroup
                  row
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <FormControlLabel
                    value="citizen"
                    control={<Radio />}
                    label="Công dân"
                  />
                  <FormControlLabel
                    value="officer"
                    control={<Radio />}
                    label="Cán bộ"
                  />
                </RadioGroup>
                {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    color="primary"
                  />
                }
                label="Tôi đồng ý với các điều khoản sử dụng và chính sách bảo mật"
              />
              {errors.agreeTerms && (
                <FormHelperText error>{errors.agreeTerms}</FormHelperText>
              )}
            </Grid>
          </Grid>
        );
        
      default:
        return 'Unknown step';
    }
  };

  // Success message component
  const SuccessMessage = () => (
    <Box sx={{ textAlign: 'center', mt: 4 }}>
      <CheckIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
      <Typography variant="h5" gutterBottom color="success.main">
        Đăng ký thành công!
      </Typography>
      <Typography variant="body1" paragraph>
        Xin chào, {formData.first_name} {formData.last_name}! Tài khoản của bạn đã được tạo thành công.
      </Typography>
      <Typography variant="body2" gutterBottom>
        {userId && (
          <>Mã người dùng của bạn: <strong>{userId}</strong></>
        )}
      </Typography>
      <Box sx={{ mt: 3 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/auth/login')}
          startIcon={<ChevronRightIcon />}
        >
          Đăng nhập ngay
        </Button>
      </Box>
    </Box>
  );

  // Render the form
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        {success ? (
          <SuccessMessage />
        ) : (
          <>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Typography variant="h4" component="h1" gutterBottom color="primary" fontWeight="bold">
                Đăng ký tài khoản
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Điền thông tin để tạo tài khoản mới
              </Typography>
            </Box>
            
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            
            {/* Nội dung form theo từng bước */}
            <Box sx={{ mt: 2 }}>
              {getStepContent(activeStep)}
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  disabled={activeStep === 0 || loading}
                  onClick={handleBack}
                  startIcon={<ChevronLeftIcon />}
                  sx={{ mr: 1 }}
                >
                  Quay lại
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                  endIcon={activeStep === steps.length - 1 ? <CheckIcon /> : <ChevronRightIcon />}
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : activeStep === steps.length - 1 ? (
                    'Đăng ký'
                  ) : (
                    'Tiếp theo'
                  )}
                </Button>
              </Box>
            </Box>
            
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body2">
                Đã có tài khoản?{' '}
                <Link component={RouterLink} to="/auth/login" color="primary" fontWeight="bold">
                  Đăng nhập
                </Link>
              </Typography>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default RegisterPage;
