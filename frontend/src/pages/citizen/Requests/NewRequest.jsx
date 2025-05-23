import React, { useState, useEffect } from 'react';
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
  IconButton,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ListSubheader
} from '@mui/material';
import { 
  Assignment as RequestIcon,
  Description as DocumentIcon,
  CloudUpload as UploadIcon,
  ArrowBack as BackIcon,
  Send as SendIcon,
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
  AccessTime as TimeIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as CheckCircleIcon,
  Verified as VerifiedIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './NewRequest.module.scss';
import { procedures } from '../../public/Procedures/procedureData';

// Lấy tất cả các loại thủ tục từ procedureData.js
const getAllProcedureTypes = () => {
  const allProcedures = [];
  Object.keys(procedures).forEach(category => {
    procedures[category].forEach(procedure => {
      allProcedures.push({
        value: procedure.id,
        label: procedure.name,
        category,
        description: procedure.description,
        processingTime: procedure.processingTime,
        requiredDocuments: procedure.requiredDocuments,
        fee: procedure.fee,
        blockchainVerified: procedure.blockchainVerified,
        detailedDescription: procedure.detailedDescription
      });
    });
  });
  return allProcedures;
};

const REQUEST_TYPES = getAllProcedureTypes();

// Nhóm thủ tục theo danh mục
const getCategoryName = (category) => {
  switch (category) {
    case 'civil': return 'Hộ tịch - Dân sự';
    case 'residence': return 'Cư trú';
    case 'identity': return 'CCCD - CMND';
    case 'land': return 'Đất đai - Nhà ở';
    case 'business': return 'Kinh doanh';
    case 'education': return 'Giáo dục';
    case 'transportation': return 'Giao thông';
    case 'health': return 'Y tế - Bảo hiểm';
    default: return 'Thủ tục khác';
  }
};

// Step labels
const STEPS = ['Chọn loại thủ tục', 'Thông tin yêu cầu', 'Tài liệu đính kèm', 'Xác nhận'];

const NewRequest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [selectedProcedure, setSelectedProcedure] = useState(null);
  
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
  
  // Kiểm tra xem có thủ tục được chọn từ trang trước không
  useEffect(() => {
    if (location.state?.procedureType) {
      const procedureType = location.state.procedureType;
      const procedureName = location.state.procedureName;
      
      setFormData(prev => ({
        ...prev,
        type: procedureType,
        title: `Yêu cầu ${procedureName}`
      }));
      
      const procedure = REQUEST_TYPES.find(p => p.value === procedureType);
      if (procedure) {
        setSelectedProcedure(procedure);
        setActiveStep(1); // Chuyển đến bước thông tin yêu cầu
      }
    }
  }, [location.state]);
  
  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 0) {
      if (!formData.type) newErrors.type = 'Vui lòng chọn loại thủ tục';
    } else if (step === 1) {
      if (!formData.title.trim()) newErrors.title = 'Vui lòng nhập tiêu đề yêu cầu';
      if (!formData.description.trim()) newErrors.description = 'Vui lòng nhập mô tả yêu cầu';
    } else if (step === 2) {
      const requiredDocs = selectedProcedure?.requiredDocuments || [];
      if (formData.attachments.length === 0 && requiredDocs.length > 0) {
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
    
    // Nếu đang chọn loại thủ tục
    if (name === 'type') {
      const procedure = REQUEST_TYPES.find(p => p.value === value);
      setSelectedProcedure(procedure);
      
      // Cập nhật tiêu đề mặc định
      if (procedure) {
        setFormData(prev => ({
          ...prev,
          title: `Yêu cầu ${procedure.label}`
        }));
      }
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
            <Typography variant="h6" gutterBottom>
              Chọn loại thủ tục hành chính bạn muốn yêu cầu
            </Typography>
            
            <FormControl 
              fullWidth 
              margin="normal" 
              error={!!errors.type}
              required
            >
              <InputLabel>Loại thủ tục</InputLabel>
              <Select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                label="Loại thủ tục"
              >
                {Object.keys(procedures).map((category) => [
                  <ListSubheader key={`header-${category}`} sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>
                    {getCategoryName(category)}
                  </ListSubheader>,
                  ...procedures[category].map((procedure) => (
                    <MenuItem key={procedure.id} value={procedure.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                        <Typography variant="body2">{procedure.name}</Typography>
                        {procedure.blockchainVerified && (
                          <Chip
                            icon={<VerifiedIcon sx={{ fontSize: '0.8rem' }} />}
                            label="Blockchain"
                            size="small"
                            color="primary"
                            sx={{ fontSize: '0.7rem', ml: 1 }}
                          />
                        )}
                      </Box>
                    </MenuItem>
                  ))
                ]).flat()}
              </Select>
              {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
            </FormControl>
            
            {selectedProcedure && (
              <Card variant="outlined" sx={{ mt: 3, mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {selectedProcedure.label}
                    {selectedProcedure.blockchainVerified && (
                      <Chip
                        icon={<VerifiedIcon />}
                        label="Xác thực Blockchain"
                        size="small"
                        color="primary"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {selectedProcedure.description}
                  </Typography>
                  
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TimeIcon color="action" sx={{ mr: 1 }} />
                        <Typography variant="body2">
                          <strong>Thời gian xử lý:</strong> {selectedProcedure.processingTime}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <MoneyIcon color="action" sx={{ mr: 1 }} />
                        <Typography variant="body2">
                          <strong>Phí:</strong> {selectedProcedure.fee}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  
                  <Accordion sx={{ mt: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>Giấy tờ cần thiết</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <List dense>
                        {selectedProcedure.requiredDocuments.map((doc, index) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              <DocumentIcon color="primary" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={doc} />
                          </ListItem>
                        ))}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                  
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>Thông tin chi tiết</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" paragraph>
                        {selectedProcedure.detailedDescription}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                </CardContent>
              </Card>
            )}
          </Box>
        );
      case 1:
        return (
          <Box className={styles.stepContent}>
            <Typography variant="h6" gutterBottom>
              Thông tin yêu cầu
            </Typography>
            
            {selectedProcedure && (
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>Thủ tục đã chọn:</strong> {selectedProcedure.label}
                </Typography>
              </Alert>
            )}
            
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
            
            {selectedProcedure && (
              <Box sx={{ mt: 3 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Thông tin thủ tục
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <TimeIcon color="action" sx={{ mr: 1, fontSize: '1rem' }} />
                      <Typography variant="body2">
                        <strong>Thời gian xử lý:</strong> {selectedProcedure.processingTime}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <MoneyIcon color="action" sx={{ mr: 1, fontSize: '1rem' }} />
                      <Typography variant="body2">
                        <strong>Phí:</strong> {selectedProcedure.fee}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>
        );
      case 2:
        return (
          <Box className={styles.stepContent}>
            <Typography variant="subtitle1" gutterBottom>
              Đính kèm tài liệu liên quan
            </Typography>
            
            {selectedProcedure && selectedProcedure.requiredDocuments.length > 0 && (
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Giấy tờ cần thiết cho thủ tục này:
                </Typography>
                <List dense disablePadding>
                  {selectedProcedure.requiredDocuments.map((doc, index) => (
                    <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        <DocumentIcon fontSize="small" color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={doc} primaryTypographyProps={{ variant: 'body2' }} />
                    </ListItem>
                  ))}
                </List>
              </Alert>
            )}
            
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
      case 3:
        return (
          <Box className={styles.stepContent}>
            <Typography variant="subtitle1" gutterBottom>
              Xác nhận thông tin
            </Typography>
            
            <Paper variant="outlined" className={styles.summaryContainer}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Chip 
                      label={selectedProcedure?.label || formData.type} 
                      color="primary" 
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    {selectedProcedure?.blockchainVerified && (
                      <Chip
                        icon={<VerifiedIcon sx={{ fontSize: '0.8rem' }} />}
                        label="Xác thực Blockchain"
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">
                    Tiêu đề yêu cầu
                  </Typography>
                  <Typography variant="body1" gutterBottom fontWeight="medium">
                    {formData.title}
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
                
                {selectedProcedure && (
                  <>
                    <Grid item xs={12}>
                      <Divider />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>
                        Thông tin thủ tục
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <TimeIcon color="action" sx={{ mr: 1, fontSize: '1rem' }} />
                            <Typography variant="body2">
                              <strong>Thời gian xử lý:</strong> {selectedProcedure.processingTime}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <MoneyIcon color="action" sx={{ mr: 1, fontSize: '1rem' }} />
                            <Typography variant="body2">
                              <strong>Phí:</strong> {selectedProcedure.fee}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Grid>
                  </>
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
        <Typography variant={isMobile ? "h5" : "h4"} component="h1">
          Tạo yêu cầu mới
        </Typography>
      </Box>
      
      <Paper elevation={1} className={styles.formContainer}>
        <Stepper 
          activeStep={activeStep} 
          className={styles.stepper}
          alternativeLabel={!isMobile}
          orientation={isMobile ? "vertical" : "horizontal"}
        >
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Box className={styles.formContent}>
          {submitSuccess ? (
            <Box className={styles.successContainer}>
              <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
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