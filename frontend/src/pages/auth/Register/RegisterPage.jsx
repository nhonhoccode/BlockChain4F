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
  Select,
  MenuItem,
  InputLabel
} from '@mui/material';
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Check as CheckIcon,
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../../../utils/apiConfig';
import * as vietnamData from '../../../utils/vietnamData';

// Các bước đăng ký
const steps = ['Thông tin tài khoản', 'Thông tin cá nhân', 'Xác nhận'];

const RegisterPage = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // State for region selection
  const [selectedProvinceId, setSelectedProvinceId] = useState('');
  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const [selectedWardId, setSelectedWardId] = useState('');
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [availableWards, setAvailableWards] = useState([]);
  
  // State cho password
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    // Thông tin tài khoản
    email: '',
    password: '',
    password_confirm: '',
    role: 'citizen',
    
    // Thông tin cá nhân
    first_name: '',
    last_name: '',
    phone_number: '',
    
    // Thông tin địa chỉ
    address: '',
    ward: '',
    district: '',
    province: '',
    
    // Thông tin CMND/CCCD
    id_card_number: '',
    id_card_issue_date: '',
    id_card_issue_place: '',
    
    // Thông tin khác
    date_of_birth: '',
    gender: 'male',
    
    // Điều khoản
    agreeTerms: false
  });
  
  // Validation errors
  const [errors, setErrors] = useState({});
  
  // Xử lý thay đổi trường form
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    
    // Đảm bảo first_name và last_name không bị rỗng
    let newValue = type === 'checkbox' ? checked : value;
    
    // Log để debug
    console.log(`Field ${name} changed to: "${newValue}"`);
    
    // Xử lý đặc biệt cho trường hợp chọn tỉnh/thành phố
    if (name === 'province') {
      const provinceId = parseInt(value);
      setSelectedProvinceId(provinceId);
      
      // Reset district and ward when province changes
      setSelectedDistrictId('');
      setSelectedWardId('');
      
      // Update form data with province name
      const provinceName = vietnamData.provinces.find(p => p.id === provinceId)?.name || '';
      setFormData({
        ...formData,
        province: provinceName,
        district: '',
        ward: ''
      });
      
      // Update available districts
      const newDistricts = vietnamData.getDistrictsByProvinceId(provinceId);
      setAvailableDistricts(newDistricts);
      setAvailableWards([]);
      
      return;
    }
    
    // Xử lý đặc biệt cho trường hợp chọn quận/huyện
    if (name === 'district') {
      const districtId = parseInt(value);
      setSelectedDistrictId(districtId);
      
      // Reset ward when district changes
      setSelectedWardId('');
      
      // Update form data with district name
      const districtName = availableDistricts.find(d => d.id === districtId)?.name || '';
      setFormData({
        ...formData,
        district: districtName,
        ward: ''
      });
      
      // Update available wards
      const newWards = vietnamData.getWardsByDistrictId(selectedProvinceId, districtId);
      setAvailableWards(newWards);
      
      return;
    }
    
    // Xử lý đặc biệt cho trường hợp chọn phường/xã
    if (name === 'ward') {
      const wardId = parseInt(value);
      setSelectedWardId(wardId);
      
      // Update form data with ward name
      const wardName = availableWards.find(w => w.id === wardId)?.name || '';
      setFormData({
        ...formData,
        ward: wardName
      });
      
      return;
    }
    
    setFormData({
      ...formData,
      [name]: newValue
    });
    
    // Xóa lỗi khi người dùng sửa trường có lỗi
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
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
    
    // Validate Step 1: Thông tin tài khoản
    if (activeStep === 0) {
      if (!formData.email.trim()) {
        stepErrors.email = 'Vui lòng nhập email';
        isValid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        stepErrors.email = 'Email không hợp lệ';
        isValid = false;
      }
      
      if (!formData.password) {
        stepErrors.password = 'Vui lòng nhập mật khẩu';
        isValid = false;
      } else if (formData.password.length < 8) {
        stepErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
        isValid = false;
      }
      
      if (!formData.password_confirm) {
        stepErrors.password_confirm = 'Vui lòng xác nhận mật khẩu';
        isValid = false;
      } else if (formData.password_confirm !== formData.password) {
        stepErrors.password_confirm = 'Mật khẩu xác nhận không khớp';
        isValid = false;
      }
      
      if (!formData.role) {
        stepErrors.role = 'Vui lòng chọn vai trò';
        isValid = false;
      }
    }
    
    // Validate Step 2: Thông tin cá nhân
    else if (activeStep === 1) {
      console.log('Validating personal info:', formData);
      
      if (!formData.first_name || formData.first_name.trim() === '') {
        stepErrors.first_name = 'Vui lòng nhập tên';
        isValid = false;
        console.log('First name validation failed');
      } else {
        console.log('First name is valid:', formData.first_name);
      }
      
      if (!formData.last_name || formData.last_name.trim() === '') {
        stepErrors.last_name = 'Vui lòng nhập họ';
        isValid = false;
        console.log('Last name validation failed');
      } else {
        console.log('Last name is valid:', formData.last_name);
      }
      
      if (formData.phone_number && !/^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(formData.phone_number)) {
        stepErrors.phone_number = 'Số điện thoại không hợp lệ';
        isValid = false;
      }
      
      // Validate ID card number (CMND 9 digits or CCCD 12 digits)
      if (formData.id_card_number && !/^(\d{9}|\d{12})$/.test(formData.id_card_number)) {
        stepErrors.id_card_number = 'Số CMND/CCCD không hợp lệ (9 hoặc 12 số)';
        isValid = false;
      }
      
      // Validate date fields
      if (formData.date_of_birth) {
        const birthDate = new Date(formData.date_of_birth);
        const today = new Date();
        if (isNaN(birthDate.getTime())) {
          stepErrors.date_of_birth = 'Ngày sinh không hợp lệ';
          isValid = false;
        } else if (birthDate > today) {
          stepErrors.date_of_birth = 'Ngày sinh không thể là ngày trong tương lai';
          isValid = false;
        }
      }
      
      if (formData.id_card_issue_date) {
        const issueDate = new Date(formData.id_card_issue_date);
        const today = new Date();
        if (isNaN(issueDate.getTime())) {
          stepErrors.id_card_issue_date = 'Ngày cấp không hợp lệ';
          isValid = false;
        } else if (issueDate > today) {
          stepErrors.id_card_issue_date = 'Ngày cấp không thể là ngày trong tương lai';
          isValid = false;
        }
      }
    }
    
    // Validate Step 3: Xác nhận
    else if (activeStep === 2) {
      if (!formData.agreeTerms) {
        stepErrors.agreeTerms = 'Bạn phải đồng ý với điều khoản sử dụng';
        isValid = false;
      }
    }
    
    setErrors(stepErrors);
    return isValid;
  };
  
  // Xử lý đăng ký
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Kiểm tra các trường bắt buộc
      if (!formData.first_name || formData.first_name.trim() === '') {
        setError('Tên không được để trống');
        setLoading(false);
        return;
      }
      
      if (!formData.last_name || formData.last_name.trim() === '') {
        setError('Họ không được để trống');
        setLoading(false);
        return;
      }
      
      // Log dữ liệu form để kiểm tra
      console.log('Form data before submission:', formData);
      
      // Chuẩn bị dữ liệu đăng ký theo đúng yêu cầu của backend
      const registrationData = {
        username: formData.email, // Sử dụng email làm username
        email: formData.email,
        password: formData.password,
        password_confirm: formData.password_confirm,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone_number: formData.phone_number || '',
        role: formData.role,
        
        // Thông tin địa chỉ
        address: formData.address || '',
        ward: formData.ward || '',
        district: formData.district || '',
        province: formData.province || '',
        
        // Thông tin CMND/CCCD
        id_card_number: formData.id_card_number || '',
        id_card_issue_date: formData.id_card_issue_date || null,
        id_card_issue_place: formData.id_card_issue_place || '',
        
        // Thông tin khác
        date_of_birth: formData.date_of_birth || null,
        gender: formData.gender || 'male'
      };
      
      console.log('Sending registration data:', registrationData);
      console.log('Gender value being sent:', registrationData.gender);
      
      // Kiểm tra endpoint
      console.log('Registration endpoint:', `${API_BASE_URL}${API_ENDPOINTS.AUTH.REGISTER}`);
      
      // Gọi API đăng ký trực tiếp thay vì qua authService
      try {
        const response = await axios({
          method: 'post',
          url: `${API_BASE_URL}${API_ENDPOINTS.AUTH.REGISTER}`,
          data: registrationData,
          headers: { 
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Registration successful:', response.data);
        setSuccess(true);
        
        // Lưu token nếu có
        if (response.data && response.data.token) {
          localStorage.setItem('token', response.data.token);
          
          // Lưu thông tin người dùng
          const userData = {
            id: response.data.user_id,
            email: response.data.email || formData.email,
            name: `${formData.first_name} ${formData.last_name}`.trim(),
            role: response.data.role || formData.role
          };
          
          localStorage.setItem('authUser', JSON.stringify(userData));
        }
        
        // Chuyển hướng đến trang đăng nhập sau khi đăng ký thành công
        setTimeout(() => {
          navigate('/auth/login', { 
            state: { 
              message: 'Đăng ký thành công! Vui lòng đăng nhập.' 
            } 
          });
        }, 2000);
      } catch (err) {
        console.error('Direct API call error:', err);
        if (err.response) {
          console.error('Error response:', err.response.data);
          
          // Hiển thị lỗi từ API một cách rõ ràng
          if (typeof err.response.data === 'object') {
            const errorMessages = [];
            for (const [key, value] of Object.entries(err.response.data)) {
              if (Array.isArray(value)) {
                errorMessages.push(`${key}: ${value.join(', ')}`);
              } else {
                errorMessages.push(`${key}: ${value}`);
              }
            }
            setError(errorMessages.join('. '));
          } else {
            setError(JSON.stringify(err.response.data));
          }
        } else {
          setError(`Lỗi kết nối: ${err.message}`);
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };
  
  // Render nội dung cho từng bước
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
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
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mật khẩu"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                required
                InputProps={{
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
                fullWidth
                label="Xác nhận mật khẩu"
                name="password_confirm"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.password_confirm}
                onChange={handleChange}
                error={!!errors.password_confirm}
                helperText={errors.password_confirm}
                required
                InputProps={{
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
          </Grid>
        );
        
      case 1:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Họ"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                error={!!errors.last_name}
                helperText={errors.last_name}
                required
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
                required
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
                label="Số điện thoại"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                error={!!errors.phone_number}
                helperText={errors.phone_number || "Số điện thoại Việt Nam (VD: 0912345678)"}
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
                label="Ngày sinh"
                name="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={handleChange}
                error={!!errors.date_of_birth}
                helperText={errors.date_of_birth}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl component="fieldset" error={!!errors.gender}>
                <FormLabel component="legend">Giới tính</FormLabel>
                <RadioGroup
                  row
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <FormControlLabel
                    value="male"
                    control={<Radio />}
                    label="Nam"
                  />
                  <FormControlLabel
                    value="female"
                    control={<Radio />}
                    label="Nữ"
                  />
                  <FormControlLabel
                    value="other"
                    control={<Radio />}
                    label="Khác"
                  />
                </RadioGroup>
                {errors.gender && <FormHelperText>{errors.gender}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Thông tin địa chỉ
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Địa chỉ"
                name="address"
                value={formData.address}
                onChange={handleChange}
                error={!!errors.address}
                helperText={errors.address}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth error={!!errors.province}>
                <InputLabel id="province-label">Tỉnh/Thành phố</InputLabel>
                <Select
                  labelId="province-label"
                  id="province"
                  name="province"
                  value={selectedProvinceId}
                  label="Tỉnh/Thành phố"
                  onChange={(e) => handleChange({
                    target: {
                      name: 'province',
                      value: e.target.value
                    }
                  })}
                >
                  <MenuItem value="">
                    <em>Chọn Tỉnh/Thành phố</em>
                  </MenuItem>
                  {vietnamData.provinces.map((province) => (
                    <MenuItem key={province.id} value={province.id}>
                      {province.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.province && <FormHelperText>{errors.province}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth error={!!errors.district} disabled={!selectedProvinceId}>
                <InputLabel id="district-label">Quận/Huyện</InputLabel>
                <Select
                  labelId="district-label"
                  id="district"
                  name="district"
                  value={selectedDistrictId}
                  label="Quận/Huyện"
                  onChange={(e) => handleChange({
                    target: {
                      name: 'district',
                      value: e.target.value
                    }
                  })}
                >
                  <MenuItem value="">
                    <em>Chọn Quận/Huyện</em>
                  </MenuItem>
                  {availableDistricts.map((district) => (
                    <MenuItem key={district.id} value={district.id}>
                      {district.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.district && <FormHelperText>{errors.district}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth error={!!errors.ward} disabled={!selectedDistrictId}>
                <InputLabel id="ward-label">Phường/Xã</InputLabel>
                <Select
                  labelId="ward-label"
                  id="ward"
                  name="ward"
                  value={selectedWardId}
                  label="Phường/Xã"
                  onChange={(e) => handleChange({
                    target: {
                      name: 'ward',
                      value: e.target.value
                    }
                  })}
                >
                  <MenuItem value="">
                    <em>Chọn Phường/Xã</em>
                  </MenuItem>
                  {availableWards.map((ward) => (
                    <MenuItem key={ward.id} value={ward.id}>
                      {ward.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.ward && <FormHelperText>{errors.ward}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Thông tin CMND/CCCD
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Số CMND/CCCD"
                name="id_card_number"
                value={formData.id_card_number}
                onChange={handleChange}
                error={!!errors.id_card_number}
                helperText={errors.id_card_number}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Ngày cấp"
                name="id_card_issue_date"
                type="date"
                value={formData.id_card_issue_date}
                onChange={handleChange}
                error={!!errors.id_card_issue_date}
                helperText={errors.id_card_issue_date}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Nơi cấp"
                name="id_card_issue_place"
                value={formData.id_card_issue_place}
                onChange={handleChange}
                error={!!errors.id_card_issue_place}
                helperText={errors.id_card_issue_place}
              />
            </Grid>
          </Grid>
        );
        
      case 2:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Xác nhận thông tin
              </Typography>
              
              <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1, mb: 2 }}>
                <Typography variant="body1" gutterBottom>
                  <strong>Email:</strong> {formData.email}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Họ tên:</strong> {formData.last_name} {formData.first_name}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Số điện thoại:</strong> {formData.phone_number || 'Không cung cấp'}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Ngày sinh:</strong> {formData.date_of_birth || 'Không cung cấp'}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Giới tính:</strong> {formData.gender === 'male' ? 'Nam' : formData.gender === 'female' ? 'Nữ' : 'Khác'}
                </Typography>
                
                <Divider sx={{ my: 1 }} />
                
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Thông tin địa chỉ:</strong>
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Địa chỉ:</strong> {formData.address || 'Không cung cấp'}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Phường/Xã:</strong> {formData.ward || 'Không cung cấp'}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Quận/Huyện:</strong> {formData.district || 'Không cung cấp'}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Tỉnh/Thành phố:</strong> {formData.province || 'Không cung cấp'}
                </Typography>
                
                <Divider sx={{ my: 1 }} />
                
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Thông tin CMND/CCCD:</strong>
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Số CMND/CCCD:</strong> {formData.id_card_number || 'Không cung cấp'}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Ngày cấp:</strong> {formData.id_card_issue_date || 'Không cung cấp'}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Nơi cấp:</strong> {formData.id_card_issue_place || 'Không cung cấp'}
                </Typography>
                
                <Divider sx={{ my: 1 }} />
                
                <Typography variant="body1" gutterBottom>
                  <strong>Vai trò:</strong> {formData.role === 'citizen' ? 'Công dân' : 'Cán bộ'}
                </Typography>
              </Box>
              
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
