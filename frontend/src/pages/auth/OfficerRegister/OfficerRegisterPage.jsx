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
  MenuItem,
  FormHelperText
} from '@mui/material';
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  AlternateEmail as EmailIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
  Check as CheckIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { vi } from 'date-fns/locale';
import authService from '../../../services/api/authService';

// Danh sách phòng ban/vai trò
const departments = [
  'Tư pháp - Hộ tịch',
  'Địa chính - Xây dựng',
  'Văn hóa - Xã hội',
  'Tài chính - Kế toán',
  'Văn phòng UBND',
  'Tổ chức - Nội vụ',
  'Thanh tra - Pháp chế',
  'Y tế - Dân số'
];

// Danh sách chức vụ
const positions = [
  'Cán bộ chuyên trách',
  'Cán bộ kiêm nhiệm',
  'Công chức',
  'Viên chức',
  'Cộng tác viên'
];

// Danh sách trình độ học vấn
const educationLevels = [
  'Trung cấp',
  'Cao đẳng',
  'Đại học',
  'Thạc sĩ',
  'Tiến sĩ'
];

// Các bước đăng ký
const steps = [
  'Thông tin cá nhân',
  'Thông tin nghề nghiệp',
  'Tài liệu và Xác nhận'
];

const OfficerRegisterPage = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [requestId, setRequestId] = useState('');
  
  // Form data
  const [formData, setFormData] = useState({
    // Thông tin cá nhân
    fullName: '',
    dateOfBirth: null,
    idNumber: '',
    phoneNumber: '',
    email: '',
    address: '',
    
    // Thông tin nghề nghiệp
    educationLevel: '',
    major: '',
    graduationYear: '',
    currentJob: '',
    department: '',
    position: '',
    experienceYears: '',
    
    // Tài liệu và Xác nhận
    motivation: '',
    cvFile: null,
    idCardFile: null,
    degreeFile: null,
    agreeTerms: false,
    
    // Role
    role: 'officer_pending'
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
    
    // Xóa lỗi khi người dùng sửa
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
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
  
  // Xử lý file upload
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData({
        ...formData,
        [name]: files[0]
      });
      
      if (errors[name]) {
        setErrors({
          ...errors,
          [name]: null
        });
      }
    }
  };
  
  // Chuyển đến bước tiếp theo
  const handleNext = () => {
    if (validateCurrentStep()) {
      if (activeStep === steps.length - 1) {
        handleSubmit();
      } else {
        setActiveStep((prevStep) => prevStep + 1);
      }
    }
  };
  
  // Quay lại bước trước
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  // Validate bước hiện tại
  const validateCurrentStep = () => {
    const newErrors = {};
    
    switch (activeStep) {
      case 0: // Thông tin cá nhân
        if (!formData.fullName) {
          newErrors.fullName = 'Vui lòng nhập họ và tên';
        }
        
        if (!formData.dateOfBirth) {
          newErrors.dateOfBirth = 'Vui lòng chọn ngày sinh';
        }
        
        if (!formData.idNumber) {
          newErrors.idNumber = 'Vui lòng nhập số CMND/CCCD';
        } else if (!/^\d{9}$|^\d{12}$/.test(formData.idNumber)) {
          newErrors.idNumber = 'Số CMND/CCCD không hợp lệ (9 hoặc 12 số)';
        }
        
        if (!formData.phoneNumber) {
          newErrors.phoneNumber = 'Vui lòng nhập số điện thoại';
        } else if (!/^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(formData.phoneNumber)) {
          newErrors.phoneNumber = 'Số điện thoại không hợp lệ';
        }
        
        if (!formData.email) {
          newErrors.email = 'Vui lòng nhập địa chỉ email';
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(formData.email)) {
          newErrors.email = 'Địa chỉ email không hợp lệ';
        }
        
        if (!formData.address) {
          newErrors.address = 'Vui lòng nhập địa chỉ';
        }
        break;
        
      case 1: // Thông tin nghề nghiệp
        if (!formData.educationLevel) {
          newErrors.educationLevel = 'Vui lòng chọn trình độ học vấn';
        }
        
        if (!formData.major) {
          newErrors.major = 'Vui lòng nhập chuyên ngành';
        }
        
        if (!formData.currentJob) {
          newErrors.currentJob = 'Vui lòng nhập công việc hiện tại';
        }
        
        if (!formData.department) {
          newErrors.department = 'Vui lòng chọn phòng ban/vai trò mong muốn';
        }
        
        if (!formData.position) {
          newErrors.position = 'Vui lòng chọn chức vụ mong muốn';
        }
        break;
        
      case 2: // Tài liệu và Xác nhận
        if (!formData.motivation) {
          newErrors.motivation = 'Vui lòng nhập lý do muốn trở thành cán bộ xã';
        } else if (formData.motivation.length < 50) {
          newErrors.motivation = 'Vui lòng cung cấp thông tin chi tiết hơn (ít nhất 50 ký tự)';
        }
        
        if (!formData.cvFile) {
          newErrors.cvFile = 'Vui lòng tải lên CV/Sơ yếu lý lịch';
        }
        
        if (!formData.idCardFile) {
          newErrors.idCardFile = 'Vui lòng tải lên bản scan CMND/CCCD';
        }
        
        if (!formData.degreeFile) {
          newErrors.degreeFile = 'Vui lòng tải lên bản scan bằng cấp';
        }
        
        if (!formData.agreeTerms) {
          newErrors.agreeTerms = 'Bạn phải đồng ý với điều khoản sử dụng';
        }
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Submit form
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Đảm bảo role được thiết lập đúng
      const submitData = {
        ...formData,
        role: 'officer_pending'
      };
      
      console.log('Submitting officer registration with data:', {
        ...submitData,
        password: '***HIDDEN***' // Ẩn password trong log
      });
      
      const response = await authService.registerOfficer(submitData);
      
      if (response && response.success) {
        setSuccess(true);
        if (response.approvalData && response.approvalData.request_id) {
          setRequestId(response.approvalData.request_id);
        } else if (response.registrationData && response.registrationData.id) {
          setRequestId(`OFF-REQ-${response.registrationData.id}`);
        } else {
          setRequestId('Pending approval');
        }
        
        // Hiện thị thông báo thành công
        window.scrollTo(0, 0);
      } else {
        setError(response?.message || 'Có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || err.message || 'Có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  // Render nội dung bước hiện tại
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Thông tin cá nhân
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Họ và tên"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  error={Boolean(errors.fullName)}
                  helperText={errors.fullName}
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
                        required: true,
                        error: Boolean(errors.dateOfBirth),
                        helperText: errors.dateOfBirth
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Số CMND/CCCD"
                  name="idNumber"
                  value={formData.idNumber}
                  onChange={handleChange}
                  required
                  placeholder="9 hoặc 12 số"
                  error={Boolean(errors.idNumber)}
                  helperText={errors.idNumber}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Số điện thoại"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  placeholder="0xxxxxxxxx"
                  error={Boolean(errors.phoneNumber)}
                  helperText={errors.phoneNumber}
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
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  error={Boolean(errors.email)}
                  helperText={errors.email}
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
                  label="Địa chỉ"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  multiline
                  rows={2}
                  error={Boolean(errors.address)}
                  helperText={errors.address}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <HomeIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        );
      
      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Thông tin nghề nghiệp
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Trình độ học vấn"
                  name="educationLevel"
                  value={formData.educationLevel}
                  onChange={handleChange}
                  required
                  error={Boolean(errors.educationLevel)}
                  helperText={errors.educationLevel}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SchoolIcon />
                      </InputAdornment>
                    ),
                  }}
                >
                  {educationLevels.map((level) => (
                    <MenuItem key={level} value={level}>
                      {level}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Chuyên ngành"
                  name="major"
                  value={formData.major}
                  onChange={handleChange}
                  required
                  error={Boolean(errors.major)}
                  helperText={errors.major}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Năm tốt nghiệp"
                  name="graduationYear"
                  type="number"
                  value={formData.graduationYear}
                  onChange={handleChange}
                  placeholder="VD: 2020"
                  InputProps={{ inputProps: { min: 1980, max: new Date().getFullYear() } }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Công việc hiện tại"
                  name="currentJob"
                  value={formData.currentJob}
                  onChange={handleChange}
                  required
                  error={Boolean(errors.currentJob)}
                  helperText={errors.currentJob}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <WorkIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Phòng ban/Vai trò mong muốn"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                  error={Boolean(errors.department)}
                  helperText={errors.department}
                >
                  {departments.map((department) => (
                    <MenuItem key={department} value={department}>
                      {department}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Chức vụ mong muốn"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  required
                  error={Boolean(errors.position)}
                  helperText={errors.position}
                >
                  {positions.map((position) => (
                    <MenuItem key={position} value={position}>
                      {position}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Số năm kinh nghiệm"
                  name="experienceYears"
                  type="number"
                  value={formData.experienceYears}
                  onChange={handleChange}
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
            </Grid>
          </Box>
        );
      
      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Tài liệu và Xác nhận
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Lý do muốn trở thành cán bộ xã"
                  name="motivation"
                  value={formData.motivation}
                  onChange={handleChange}
                  required
                  multiline
                  rows={4}
                  error={Boolean(errors.motivation)}
                  helperText={errors.motivation || 'Mô tả lý do, động lực và mục tiêu của bạn (ít nhất 50 ký tự)'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DescriptionIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" gutterBottom>
                  CV/Sơ yếu lý lịch *
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  endIcon={formData.cvFile ? <CheckIcon color="success" /> : null}
                >
                  {formData.cvFile ? formData.cvFile.name : 'Chọn file'}
                  <input
                    type="file"
                    hidden
                    name="cvFile"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx"
                  />
                </Button>
                {errors.cvFile && (
                  <FormHelperText error>{errors.cvFile}</FormHelperText>
                )}
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Định dạng: PDF, DOC, DOCX
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" gutterBottom>
                  Bản scan CMND/CCCD *
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  endIcon={formData.idCardFile ? <CheckIcon color="success" /> : null}
                >
                  {formData.idCardFile ? formData.idCardFile.name : 'Chọn file'}
                  <input
                    type="file"
                    hidden
                    name="idCardFile"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </Button>
                {errors.idCardFile && (
                  <FormHelperText error>{errors.idCardFile}</FormHelperText>
                )}
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Định dạng: PDF, JPG, JPEG, PNG
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" gutterBottom>
                  Bản scan bằng cấp *
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  endIcon={formData.degreeFile ? <CheckIcon color="success" /> : null}
                >
                  {formData.degreeFile ? formData.degreeFile.name : 'Chọn file'}
                  <input
                    type="file"
                    hidden
                    name="degreeFile"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </Button>
                {errors.degreeFile && (
                  <FormHelperText error>{errors.degreeFile}</FormHelperText>
                )}
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Định dạng: PDF, JPG, JPEG, PNG
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <FormControl required error={Boolean(errors.agreeTerms)}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="agreeTerms"
                        checked={formData.agreeTerms}
                        onChange={handleChange}
                        color="primary"
                      />
                    }
                    label={
                      <span>
                        Tôi xác nhận rằng thông tin cung cấp là chính xác và đồng ý với{' '}
                        <Link component={RouterLink} to="/terms">
                          Điều khoản sử dụng
                        </Link>
                      </span>
                    }
                  />
                  {errors.agreeTerms && (
                    <FormHelperText>{errors.agreeTerms}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        );
      
      default:
        return 'Unknown step';
    }
  };
  
  // Cập nhật nội dung hiển thị khi đăng ký thành công
  const renderSuccessMessage = () => {
    return (
      <Box sx={{ textAlign: 'center', mt: 4, mb: 4 }}>
        <CheckIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
        
        <Typography variant="h5" gutterBottom sx={{ color: 'success.main', fontWeight: 'bold' }}>
          Đăng ký cán bộ thành công!
        </Typography>
        
        <Typography variant="body1" paragraph>
          Cảm ơn bạn đã đăng ký làm cán bộ xã. Yêu cầu của bạn đã được ghi nhận và đang chờ phê duyệt từ chủ tịch xã.
        </Typography>
        
        <Typography variant="body1" paragraph>
          Mã yêu cầu: <strong>{requestId}</strong>
        </Typography>
        
        <Typography variant="body1" paragraph>
          Vui lòng kiểm tra email của bạn để biết thêm thông tin. Chúng tôi sẽ thông báo cho bạn khi yêu cầu được phê duyệt.
        </Typography>
        
        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to="/auth/login"
            sx={{ mx: 1 }}
          >
            Đăng nhập
          </Button>
          
          <Button
            variant="outlined"
            color="primary"
            component={RouterLink}
            to="/"
            sx={{ mx: 1 }}
          >
            Về trang chủ
          </Button>
        </Box>
      </Box>
    );
  };
  
  // Hiển thị kết quả đăng ký thành công
  if (success) {
    return renderSuccessMessage();
  }
  
  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Đăng ký làm cán bộ xã
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Hoàn thành biểu mẫu dưới đây để đăng ký trở thành cán bộ xã trên hệ thống quản lý hành chính
          </Typography>
        </Box>
        
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {getStepContent(activeStep)}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            variant="outlined"
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<ChevronLeftIcon />}
          >
            Quay lại
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={loading}
            endIcon={activeStep === steps.length - 1 ? null : <ChevronRightIcon />}
          >
            {loading && <CircularProgress size={24} sx={{ mr: 1 }} />}
            {activeStep === steps.length - 1 ? 'Hoàn thành đăng ký' : 'Tiếp theo'}
          </Button>
        </Box>
      </Paper>
      
      <Box sx={{ textAlign: 'center', mt: 3 }}>
        <Typography variant="body2">
          Đã có tài khoản?{' '}
          <Link component={RouterLink} to="/auth/login">
            Đăng nhập ngay
          </Link>
        </Typography>
      </Box>
    </Container>
  );
};

export default OfficerRegisterPage;
