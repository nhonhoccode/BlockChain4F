import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  Stepper,
  Step,
  StepLabel,
  InputAdornment,
  IconButton,
  Link,
  CircularProgress
} from '@mui/material';
import {
  Email as EmailIcon,
  VpnKey as KeyIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  CheckCircle as CheckCircleIcon,
  ArrowBack as ArrowBackIcon,
  LockReset as LockResetIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaUndo, FaCheckCircle } from 'react-icons/fa';
import AuthLayout from '../../../layouts/AuthLayout';

// CSS Module
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: '450px',
    margin: '0 auto',
    padding: '2rem',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '1.5rem',
    color: '#333',
    textAlign: 'center',
  },
  subTitle: {
    fontSize: '14px',
    marginBottom: '1.5rem',
    color: '#666',
    textAlign: 'center',
  },
  form: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '1rem',
    width: '100%',
  },
  label: {
    marginBottom: '0.5rem',
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
  },
  inputContainer: {
    position: 'relative',
    width: '100%',
  },
  input: {
    width: '100%',
    padding: '10px 10px 10px 40px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '16px',
    outline: 'none',
    transition: '0.2s ease-in-out',
  },
  icon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#6b7280',
    fontSize: '18px',
  },
  button: {
    width: '100%',
    padding: '12px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: '#4f46e5',
    color: 'white',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: '0.2s ease-in-out',
    fontSize: '16px',
    marginTop: '1rem',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed',
  },
  link: {
    color: '#4f46e5',
    textDecoration: 'none',
    fontWeight: '500',
    fontSize: '14px',
    marginTop: '1rem',
  },
  error: {
    color: '#ef4444',
    fontSize: '14px',
    marginBottom: '1rem',
    textAlign: 'center',
  },
  success: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },
  successIcon: {
    color: '#10b981',
    fontSize: '60px',
    marginBottom: '1rem',
  },
  successTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '1rem',
    textAlign: 'center',
  },
  successText: {
    fontSize: '16px',
    color: '#6b7280',
    marginBottom: '2rem',
    textAlign: 'center',
  },
  steps: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '2rem',
    width: '100%',
  },
  step: {
    flex: 1,
    textAlign: 'center',
    position: 'relative',
  },
  stepNumber: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    backgroundColor: '#e5e7eb',
    color: '#6b7280',
    fontWeight: 'bold',
    margin: '0 auto 8px',
  },
  activeStepNumber: {
    backgroundColor: '#4f46e5',
    color: 'white',
  },
  stepLabel: {
    fontSize: '12px',
    color: '#6b7280',
  },
  activeStepLabel: {
    color: '#4f46e5',
    fontWeight: '500',
  },
  stepConnector: {
    position: 'absolute',
    top: '15px',
    right: '-50%',
    width: '100%',
    height: '2px',
    backgroundColor: '#e5e7eb',
    zIndex: '-1',
  },
  activeStepConnector: {
    backgroundColor: '#4f46e5',
  },
  verificationCode: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: '1rem',
  },
  digitInput: {
    width: '40px',
    height: '40px',
    textAlign: 'center',
    fontSize: '18px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    marginRight: '8px',
  },
};

// Mock API để yêu cầu reset mật khẩu
const mockRequestReset = (email) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Demo: cho phép reset với bất kỳ email nào
      resolve({
        success: true,
        message: 'Yêu cầu đặt lại mật khẩu đã được gửi thành công'
      });
    }, 1500);
  });
};

// Mock API để xác thực mã OTP
const mockVerifyOTP = (email, otp) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Demo: chấp nhận mã OTP là 123456
      if (otp === '123456') {
        resolve({
          success: true,
          message: 'Mã xác thực hợp lệ'
        });
      } else {
        reject(new Error('Mã xác thực không hợp lệ'));
      }
    }, 1000);
  });
};

// Mock API để cập nhật mật khẩu mới
const mockUpdatePassword = (email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Mật khẩu đã được cập nhật thành công'
      });
    }, 1500);
  });
};

// Các bước đặt lại mật khẩu
const steps = [
  'Nhập email',
  'Xác thực mã OTP',
  'Đặt mật khẩu mới'
];

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Form data
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Toggle password visibility
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };
  
  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  // Xử lý bước 1: Gửi email đặt lại mật khẩu
  const handleRequestReset = async () => {
    // Validate email
    if (!email) {
      setError('Vui lòng nhập địa chỉ email');
      return;
    }
    
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email)) {
      setError('Địa chỉ email không hợp lệ');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await mockRequestReset(email);
      setActiveStep(1);
    } catch (err) {
      console.error('Request reset error:', err);
      setError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  // Xử lý bước 2: Xác thực mã OTP
  const handleVerifyOTP = async () => {
    // Validate OTP
    if (!otp) {
      setError('Vui lòng nhập mã xác thực');
      return;
    }
    
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setError('Mã xác thực phải có 6 chữ số');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await mockVerifyOTP(email, otp);
      setActiveStep(2);
    } catch (err) {
      console.error('OTP verification error:', err);
      setError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  // Xử lý bước 3: Cập nhật mật khẩu mới
  const handleUpdatePassword = async () => {
    // Validate mật khẩu mới
    if (!newPassword) {
      setError('Vui lòng nhập mật khẩu mới');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }
    
    if (!confirmPassword) {
      setError('Vui lòng xác nhận mật khẩu');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await mockUpdatePassword(email, newPassword);
      setSuccess(true);
    } catch (err) {
      console.error('Password update error:', err);
      setError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  // Xử lý nút Tiếp theo
  const handleNext = () => {
    switch (activeStep) {
      case 0:
        handleRequestReset();
        break;
      case 1:
        handleVerifyOTP();
        break;
      case 2:
        handleUpdatePassword();
        break;
      default:
        break;
    }
  };
  
  // Xử lý nút Quay lại
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError(null);
  };
  
  // Render nội dung bước hiện tại
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={styles.form}>
            <TextField
              fullWidth
              label="Địa chỉ email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="caption">
                Để thử nghiệm, bạn có thể sử dụng bất kỳ địa chỉ email nào.
                Mã OTP thử nghiệm là: <b>123456</b>
              </Typography>
            </Alert>
          </Box>
        );
      
      case 1:
        return (
          <Box sx={styles.form}>
            <TextField
              fullWidth
              label="Mã xác thực (OTP)"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              margin="normal"
              placeholder="6 chữ số"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <KeyIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="text"
              color="primary"
              onClick={() => handleRequestReset()}
              disabled={loading}
              sx={{ mt: 1 }}
            >
              Gửi lại mã
            </Button>
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="caption">
                Để thử nghiệm, hãy sử dụng mã OTP: <b>123456</b>
              </Typography>
            </Alert>
          </Box>
        );
      
      case 2:
        return (
          <Box sx={styles.form}>
            <TextField
              fullWidth
              label="Mật khẩu mới"
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockResetIcon />
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
            />
            <TextField
              fullWidth
              label="Xác nhận mật khẩu mới"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockResetIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleToggleConfirmPassword}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        );
      
      default:
        return null;
    }
  };
  
  // Hiển thị kết quả thành công
  if (success) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Đặt lại mật khẩu thành công!
          </Typography>
          <Typography variant="body1" paragraph>
            Mật khẩu của bạn đã được cập nhật thành công. Bây giờ bạn có thể đăng nhập bằng mật khẩu mới.
          </Typography>
          
          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              component={RouterLink}
              to="/auth/login"
              sx={{ minWidth: 200 }}
            >
              Đăng nhập ngay
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Đặt lại mật khẩu
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Làm theo các bước để đặt lại mật khẩu tài khoản của bạn
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
            startIcon={<ArrowBackIcon />}
          >
            Quay lại
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} sx={{ mr: 1 }} /> : null}
            {activeStep === steps.length - 1 ? 'Hoàn thành' : 'Tiếp tục'}
          </Button>
        </Box>
      </Paper>
      
      <Box sx={{ textAlign: 'center', mt: 3 }}>
        <Typography variant="body2">
          Đã nhớ mật khẩu?{' '}
          <Link component={RouterLink} to="/auth/login">
            Đăng nhập ngay
          </Link>
        </Typography>
      </Box>
    </Container>
  );
};

export default ResetPasswordPage;
