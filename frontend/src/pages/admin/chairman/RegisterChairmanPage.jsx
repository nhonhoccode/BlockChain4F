import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Badge as BadgeIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  AdminPanelSettings as AdminIcon,
  LockOpen as LockOpenIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import PrimaryButton from '../../../components/common/Buttons/PrimaryButton';
import SecondaryButton from '../../../components/common/Buttons/SecondaryButton';
import authService from '../../../services/api/authService';
import { ADMIN_DEFAULT_CREDENTIALS } from '../../../config/admin.config';
import styles from './RegisterChairmanPage.module.scss';

const RegisterChairmanPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'info'
  });
  
  // Form data
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    address: '',
    ward: '',
    district: '',
    province: '',
    position: 'Chủ tịch xã',
    department: 'UBND xã'
  });
  
  // Validation errors
  const [errors, setErrors] = useState({});
  
  // Danh sách tỉnh/thành
  const provinces = [
    'Hà Nội',
    'TP. Hồ Chí Minh',
    'Đà Nẵng',
    'Hải Phòng',
    'Cần Thơ',
    'An Giang',
    'Bà Rịa - Vũng Tàu',
    'Bắc Giang',
    'Bắc Kạn',
    'Bạc Liêu',
    'Bắc Ninh',
    'Bến Tre',
    'Bình Định',
    'Bình Dương',
    'Bình Phước',
    'Bình Thuận',
    'Cà Mau',
    'Cao Bằng',
    'Đắk Lắk',
    'Đắk Nông',
    'Điện Biên',
    'Đồng Nai',
    'Đồng Tháp',
    'Gia Lai',
    'Hà Giang',
    'Hà Nam',
    'Hà Tĩnh',
    'Hải Dương',
    'Hậu Giang',
    'Hòa Bình',
    'Hưng Yên',
    'Khánh Hòa',
    'Kiên Giang',
    'Kon Tum',
    'Lai Châu',
    'Lâm Đồng',
    'Lạng Sơn',
    'Lào Cai',
    'Long An',
    'Nam Định',
    'Nghệ An',
    'Ninh Bình',
    'Ninh Thuận',
    'Phú Thọ',
    'Phú Yên',
    'Quảng Bình',
    'Quảng Nam',
    'Quảng Ngãi',
    'Quảng Ninh',
    'Quảng Trị',
    'Sóc Trăng',
    'Sơn La',
    'Tây Ninh',
    'Thái Bình',
    'Thái Nguyên',
    'Thanh Hóa',
    'Thừa Thiên Huế',
    'Tiền Giang',
    'Trà Vinh',
    'Tuyên Quang',
    'Vĩnh Long',
    'Vĩnh Phúc',
    'Yên Bái'
  ];

  // Sử dụng thông tin mặc định cho admin
  const fillDefaultAdminData = () => {
    setFormData({
      ...ADMIN_DEFAULT_CREDENTIALS
    });
  };
  
  // Xử lý thay đổi trường form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Xóa lỗi
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  // Xử lý hiển thị/ẩn mật khẩu
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };
  
  // Xác thực form
  const validateForm = () => {
    const newErrors = {};
    
    // Validate email
    if (!formData.email) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    // Validate password
    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
    }
    
    // Validate name
    if (!formData.first_name) {
      newErrors.first_name = 'Vui lòng nhập tên';
    }
    
    if (!formData.last_name) {
      newErrors.last_name = 'Vui lòng nhập họ';
    }
    
    // Validate phone
    if (formData.phone_number && !/^\d{10,11}$/.test(formData.phone_number)) {
      newErrors.phone_number = 'Số điện thoại không hợp lệ';
    }
    
    // Validate address
    if (!formData.province) {
      newErrors.province = 'Vui lòng chọn tỉnh/thành';
    }
    
    if (!formData.district) {
      newErrors.district = 'Vui lòng nhập quận/huyện';
    }
    
    if (!formData.ward) {
      newErrors.ward = 'Vui lòng nhập xã/phường';
    }
    
    if (!formData.address) {
      newErrors.address = 'Vui lòng nhập địa chỉ';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Xử lý đăng ký tài khoản chủ tịch xã
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await authService.registerChairman(formData);
      
      setNotification({
        show: true,
        message: `Đăng ký tài khoản chủ tịch xã thành công! ID: ${response.data.user_id}`,
        type: 'success'
      });
      
      setSuccess(true);
      
      // Reset form
      setFormData({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        phone_number: '',
        address: '',
        ward: '',
        district: '',
        province: '',
        position: 'Chủ tịch xã',
        department: 'UBND xã'
      });
      
      // Redirect sau 3 giây
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 3000);
      
    } catch (error) {
      console.error('Lỗi khi đăng ký tài khoản chủ tịch xã:', error);
      setNotification({
        show: true,
        message: error.response?.data?.message || 'Đăng ký tài khoản chủ tịch xã thất bại. Vui lòng thử lại sau!',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Xử lý quay lại
  const handleBack = () => {
    navigate('/admin/dashboard');
  };

  // Hiển thị màn hình thành công
  if (success) {
    return (
      <Box className={styles.chairmanRegisterPage}>
        <Paper elevation={3} className={styles.formPaper}>
          <Box className={styles.successMessage}>
            <CheckCircleIcon className={styles.successIcon} />
            <Typography variant="h5" className={styles.successTitle}>
              Đăng ký tài khoản chủ tịch xã thành công!
            </Typography>
            <Typography variant="body1" gutterBottom>
              Thông tin tài khoản đã được lưu vào hệ thống.
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Bạn sẽ được chuyển hướng đến trang quản trị trong giây lát...
            </Typography>
            <PrimaryButton
              onClick={() => navigate('/admin/dashboard')}
              sx={{ mt: 3 }}
            >
              Quay lại trang quản trị
            </PrimaryButton>
          </Box>
        </Paper>
      </Box>
    );
  }
  
  return (
    <Box className={styles.chairmanRegisterPage}>
      <Paper elevation={3} className={styles.formPaper}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <AdminIcon className={styles.headerIcon} />
          <Typography variant="h5" component="h1">
            Đăng ký tài khoản chủ tịch xã
          </Typography>
        </Box>
        
        <Alert severity="info" className={styles.infoAlert}>
          <Typography className={styles.alertTitle}>Lưu ý quan trọng:</Typography>
          <Typography variant="body2">
            Chỉ quản trị viên (admin) mới có quyền tạo tài khoản chủ tịch xã. Tài khoản này sẽ có quyền phê duyệt cán bộ xã và quản lý các văn bản quan trọng.
          </Typography>
        </Alert>
        
        {notification.show && (
          <Alert severity={notification.type} sx={{ mb: 3 }}>
            {notification.message}
          </Alert>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <SecondaryButton onClick={fillDefaultAdminData}>
            Điền thông tin mặc định
          </SecondaryButton>
        </Box>
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} className={styles.formSection}>
              <Typography variant="h6" className={styles.sectionTitle}>
                Thông tin tài khoản
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Email"
                variant="outlined"
                fullWidth
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Mật khẩu"
                variant="outlined"
                fullWidth
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOpenIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleTogglePassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                required
              />
            </Grid>
            
            <Grid item xs={12} className={styles.formSection}>
              <Typography variant="h6" className={styles.sectionTitle}>
                Thông tin cá nhân
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Họ"
                variant="outlined"
                fullWidth
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
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Tên"
                variant="outlined"
                fullWidth
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
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Số điện thoại"
                variant="outlined"
                fullWidth
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                error={!!errors.phone_number}
                helperText={errors.phone_number}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Chức vụ"
                variant="outlined"
                fullWidth
                name="position"
                value={formData.position}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeIcon />
                    </InputAdornment>
                  ),
                }}
                disabled
              />
            </Grid>
            
            <Grid item xs={12} className={styles.formSection}>
              <Typography variant="h6" className={styles.sectionTitle}>
                Địa chỉ
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth error={!!errors.province}>
                <InputLabel>Tỉnh/Thành phố</InputLabel>
                <Select
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  label="Tỉnh/Thành phố"
                >
                  {provinces.map((province) => (
                    <MenuItem key={province} value={province}>
                      {province}
                    </MenuItem>
                  ))}
                </Select>
                {errors.province && (
                  <Typography variant="caption" color="error">
                    {errors.province}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                label="Quận/Huyện"
                variant="outlined"
                fullWidth
                name="district"
                value={formData.district}
                onChange={handleChange}
                error={!!errors.district}
                helperText={errors.district}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                label="Xã/Phường"
                variant="outlined"
                fullWidth
                name="ward"
                value={formData.ward}
                onChange={handleChange}
                error={!!errors.ward}
                helperText={errors.ward}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Địa chỉ chi tiết"
                variant="outlined"
                fullWidth
                name="address"
                value={formData.address}
                onChange={handleChange}
                error={!!errors.address}
                helperText={errors.address}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <HomeIcon />
                    </InputAdornment>
                  ),
                }}
                required
              />
            </Grid>
            
            <Grid item xs={12} className={styles.formButtons}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <SecondaryButton onClick={handleBack} disabled={loading}>
                  Quay lại
                </SecondaryButton>
                
                <PrimaryButton
                  type="submit"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <AdminIcon />}
                >
                  Đăng ký tài khoản chủ tịch xã
                </PrimaryButton>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default RegisterChairmanPage; 