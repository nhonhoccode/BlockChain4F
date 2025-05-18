import React, { useState } from 'react';
import {
  Box, 
  Typography, 
  Paper, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Button,
  Grid,
  FormHelperText,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Alert,
  CircularProgress,
  IconButton
} from '@mui/material';
import Chip from '../../../components/common/Chip';
import { 
  Assignment as RequestIcon,
  Description as DocumentIcon,
  CloudUpload as UploadIcon,
  ArrowBack as BackIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import styles from './NewRequest.module.scss';

// Request types
const REQUEST_TYPES = [
  { value: 'birth_certificate', label: 'Giấy khai sinh' },
  { value: 'residence', label: 'Đăng ký thường trú' },
  { value: 'business_license', label: 'Giấy phép kinh doanh' },
  { value: 'id_card', label: 'CCCD' },
  { value: 'marriage_certificate', label: 'Giấy đăng ký kết hôn' },
  { value: 'land_certificate', label: 'Giấy chứng nhận quyền sử dụng đất' }
];

// Step labels
const STEPS = ['Thông tin yêu cầu', 'Tài liệu đính kèm', 'Xác nhận'];

const NewRequest = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    description: '',
    attachments: [],
    contactPhone: '',
    contactEmail: '',
    additionalInfo: ''
  });
  
  // Form validation
  const [errors, setErrors] = useState({});
  
  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 0) {
      if (!formData.title.trim()) newErrors.title = 'Vui lòng nhập tiêu đề yêu cầu';
      if (!formData.type) newErrors.type = 'Vui lòng chọn loại yêu cầu';
      if (!formData.description.trim()) newErrors.description = 'Vui lòng nhập mô tả yêu cầu';
    } else if (step === 1) {
      if (formData.attachments.length === 0) {
        newErrors.attachments = 'Vui lòng đính kèm ít nhất một tài liệu';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
  };
  
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // In a real app, you would upload these files to a server
    // For now, we'll just store the file objects
    setFormData({
      ...formData,
      attachments: [...formData.attachments, ...files]
    });
    
    // Clear error
    if (errors.attachments) {
      setErrors({
        ...errors,
        attachments: undefined
      });
    }
  };
  
  const removeFile = (index) => {
    const newAttachments = [...formData.attachments];
    newAttachments.splice(index, 1);
    setFormData({
      ...formData,
      attachments: newAttachments
    });
  };
  
  const handleSubmit = async () => {
    if (validateStep(activeStep)) {
      setIsSubmitting(true);
      setSubmitError(null);
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // In a real app, you would send the form data to your API
        console.log('Submitting form data:', formData);
        
        setSubmitSuccess(true);
        
        // Redirect to requests list after 2 seconds
        setTimeout(() => {
          navigate('/citizen/requests/list');
        }, 2000);
      } catch (error) {
        console.error('Error submitting request:', error);
        setSubmitError('Đã xảy ra lỗi khi gửi yêu cầu. Vui lòng thử lại sau.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  // Render step content
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box className={styles.stepContent}>
            <TextField
              fullWidth
              label="Tiêu đề yêu cầu"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              error={!!errors.title}
              helperText={errors.title}
              required
              margin="normal"
            />
            
            <FormControl 
              fullWidth 
              margin="normal" 
              error={!!errors.type}
              required
            >
              <InputLabel>Loại yêu cầu</InputLabel>
              <Select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                label="Loại yêu cầu"
              >
                {REQUEST_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
            </FormControl>
            
            <TextField
              fullWidth
              label="Mô tả yêu cầu"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              error={!!errors.description}
              helperText={errors.description}
              required
              margin="normal"
              multiline
              rows={4}
              placeholder="Mô tả chi tiết về yêu cầu của bạn..."
            />
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Số điện thoại liên hệ"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email liên hệ"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  margin="normal"
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 1:
        return (
          <Box className={styles.stepContent}>
            <Typography variant="subtitle1" gutterBottom>
              Đính kèm tài liệu liên quan
            </Typography>
            
            <Typography variant="body2" color="textSecondary" paragraph>
              Vui lòng đính kèm các tài liệu cần thiết cho yêu cầu của bạn (CMND/CCCD, giấy tờ liên quan, v.v.)
            </Typography>
            
            <Box className={styles.uploadArea}>
              <input
                type="file"
                id="file-upload"
                multiple
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="file-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<UploadIcon />}
                  className={styles.uploadButton}
                >
                  Chọn tệp
                </Button>
              </label>
              
              {errors.attachments && (
                <FormHelperText error>{errors.attachments}</FormHelperText>
              )}
            </Box>
            
            {formData.attachments.length > 0 && (
              <Paper variant="outlined" className={styles.fileList}>
                <Typography variant="subtitle2" gutterBottom>
                  Tệp đã chọn ({formData.attachments.length})
                </Typography>
                
                {formData.attachments.map((file, index) => (
                  <Box key={index} className={styles.fileItem}>
                    <DocumentIcon className={styles.fileIcon} />
                    <Box className={styles.fileInfo}>
                      <Typography variant="body2" noWrap>
                        {file.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {(file.size / 1024).toFixed(2)} KB
                      </Typography>
                    </Box>
                    <IconButton 
                      size="small" 
                      onClick={() => removeFile(index)}
                      className={styles.removeButton}
                    >
                      &times;
                    </IconButton>
                  </Box>
                ))}
              </Paper>
            )}
            
            <TextField
              fullWidth
              label="Thông tin bổ sung"
              name="additionalInfo"
              value={formData.additionalInfo}
              onChange={handleInputChange}
              margin="normal"
              multiline
              rows={3}
              placeholder="Thông tin thêm về tài liệu đính kèm (nếu có)..."
            />
          </Box>
        );
      case 2:
        return (
          <Box className={styles.stepContent}>
            <Typography variant="subtitle1" gutterBottom>
              Xác nhận thông tin
            </Typography>
            
            <Paper variant="outlined" className={styles.summaryContainer}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Tiêu đề yêu cầu
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formData.title}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Loại yêu cầu
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {REQUEST_TYPES.find(type => type.value === formData.type)?.label || formData.type}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">
                    Mô tả yêu cầu
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {formData.description}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Số điện thoại liên hệ
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formData.contactPhone || '(Không cung cấp)'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Email liên hệ
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formData.contactEmail || '(Không cung cấp)'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">
                    Tài liệu đính kèm
                  </Typography>
                  {formData.attachments.length > 0 ? (
                    <Box className={styles.attachmentList}>
                      {formData.attachments.map((file, index) => (
                        <Chip
                          key={index}
                          icon={<DocumentIcon />}
                          label={file.name}
                          variant="outlined"
                          size="small"
                          className={styles.attachmentChip}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body1">
                      (Không có tài liệu đính kèm)
                    </Typography>
                  )}
                </Grid>
                
                {formData.additionalInfo && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      Thông tin bổ sung
                    </Typography>
                    <Typography variant="body1">
                      {formData.additionalInfo}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>
            
            <Box className={styles.disclaimerBox}>
              <Typography variant="body2" color="textSecondary">
                Bằng cách gửi yêu cầu này, bạn xác nhận rằng thông tin được cung cấp là chính xác và đầy đủ. 
                Mọi thông tin sai lệch có thể dẫn đến việc từ chối yêu cầu.
              </Typography>
            </Box>
          </Box>
        );
      default:
        return null;
    }
  };
  
  return (
    <Box className={styles.newRequestContainer}>
      <Box className={styles.pageHeader}>
        <IconButton 
          onClick={() => navigate('/citizen/requests/list')}
          className={styles.backButton}
        >
          <BackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Tạo yêu cầu mới
        </Typography>
      </Box>
      
      <Paper elevation={1} className={styles.formContainer}>
        <Stepper activeStep={activeStep} className={styles.stepper}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Box className={styles.formContent}>
          {submitSuccess ? (
            <Box className={styles.successContainer}>
              <Alert severity="success" sx={{ mb: 2 }}>
                Yêu cầu đã được gửi thành công! Bạn sẽ được chuyển hướng đến trang danh sách yêu cầu.
              </Alert>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <>
              {submitError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {submitError}
                </Alert>
              )}
              
              {getStepContent(activeStep)}
              
              <Box className={styles.actionButtons}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  className={styles.backButton}
                >
                  Quay lại
                </Button>
                
                {activeStep === STEPS.length - 1 ? (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    className={styles.submitButton}
                    startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNext}
                    className={styles.nextButton}
                  >
                    Tiếp theo
                  </Button>
                )}
              </Box>
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default NewRequest; 