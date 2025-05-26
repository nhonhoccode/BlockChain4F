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
import { procedureCategories } from '../../public/Procedures/procedureData';
import citizenService from '../../../services/api/citizenService';

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
  const [loadingProcedures, setLoadingProcedures] = useState(true);
  const [procedureTypes, setProcedureTypes] = useState([]);
  const [procedureError, setProcedureError] = useState(null);
  
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
  
  // Helper function to load local procedure data
  const loadLocalProcedureData = (showDataSource = true) => {
    // Import the procedure data directly from local file as fallback
    import('../../public/Procedures/procedureData').then(({ procedures }) => {
      // Format the procedure types from the local data
      const formattedProcedures = [];
      Object.keys(procedures).forEach(category => {
        procedures[category].forEach(procedure => {
          formattedProcedures.push({
            value: procedure.id,
            label: procedure.name,
            category,
            description: procedure.description,
            processingTime: procedure.processingTime,
            requiredDocuments: procedure.requiredDocuments || [],
            fee: procedure.fee,
            blockchainVerified: procedure.blockchainVerified || false,
            detailedDescription: procedure.detailedDescription
          });
        });
      });
      
      setProcedureTypes(formattedProcedures);
      console.log('Using local procedure types as fallback:', formattedProcedures);
      
      // Only show the info message if we want to explicitly inform user about data source
      if (showDataSource) {
        setProcedureError('Đang sử dụng dữ liệu cục bộ mẫu do API trả về dữ liệu trống hoặc không kết nối được. Chức năng vẫn hoạt động bình thường với dữ liệu mẫu.');
      } else {
        setProcedureError(null);
      }
    }).catch(err => {
      console.error('Failed to load local procedure data:', err);
      setProcedureError('Không thể tải danh sách thủ tục. Vui lòng thử lại sau hoặc liên hệ quản trị viên.');
    });
  };
  
  // Fetch procedure types from API
  useEffect(() => {
    const fetchProcedureTypes = async () => {
      try {
        setLoadingProcedures(true);
        setProcedureError(null);
        console.log('Đang lấy danh sách loại thủ tục từ API...');
        const data = await citizenService.getProcedureTypes();
        
        // Kiểm tra xem dữ liệu có tồn tại không
        if (!data) {
          console.warn('Không nhận được dữ liệu từ API');
          loadLocalProcedureData(true);
          return;
        }
        
        // Format the procedure types for the component
        const formattedProcedures = [];
        
        // Phương thức xử lý một đối tượng thủ tục và thêm vào danh sách đã định dạng
        const processProcedure = (procedure) => {
          if (procedure && procedure.id) {
            formattedProcedures.push({
              value: procedure.id,
              label: procedure.name || 'Unknown',
              category: procedure.category || 'other',
              description: procedure.description || '',
              processingTime: procedure.processing_time || procedure.processingTime || 'N/A',
              requiredDocuments: procedure.required_documents || procedure.requiredDocuments || [],
              fee: procedure.fee || 'Free',
              blockchainVerified: procedure.blockchain_verified || procedure.blockchainVerified || false,
              detailedDescription: procedure.detailed_description || procedure.detailedDescription || ''
            });
          }
        };
        
        // Xử lý trường hợp API trả về một mảng
        if (Array.isArray(data)) {
          console.log('Xử lý dữ liệu dạng mảng');
          data.forEach(processProcedure);
        } 
        // Xử lý trường hợp API trả về một đối tượng
        else if (data && typeof data === 'object') {
          // Trường hợp dữ liệu được phân trang (DRF pagination format)
          if (data.results && Array.isArray(data.results)) {
            console.log('Xử lý dữ liệu dạng phân trang (DRF)');
            
            // Kiểm tra xem mảng results có dữ liệu không
            if (data.results.length === 0) {
              console.warn('API trả về mảng results rỗng');
              // Sử dụng dữ liệu cục bộ khi API trả về mảng rỗng
              loadLocalProcedureData(true);
              return; // Thoát khỏi hàm vì đã xử lý bằng dữ liệu cục bộ
            }
            
            data.results.forEach(processProcedure);
          }
          // Trường hợp dữ liệu có cấu trúc phức tạp hơn
          else {
            console.log('Xử lý dữ liệu dạng đối tượng phức tạp');
            // Xem xét từng key trong đối tượng, nếu là mảng thì xử lý
            Object.entries(data).forEach(([key, value]) => {
              if (Array.isArray(value)) {
                console.log(`Xử lý mảng trong key: ${key}`);
                value.forEach(processProcedure);
              } else if (value && typeof value === 'object' && value.id) {
                // Trường hợp giá trị là một đối tượng thủ tục
                console.log(`Xử lý đối tượng trong key: ${key}`);
                processProcedure(value);
              }
            });
          }
        }
        
        if (formattedProcedures.length > 0) {
          setProcedureTypes(formattedProcedures);
          console.log('Lấy thành công danh sách thủ tục:', formattedProcedures);
        } else {
          console.warn('Không tìm thấy dữ liệu thủ tục trong phản hồi API:', data);
          // Sử dụng dữ liệu cục bộ khi không tìm thấy dữ liệu từ API
          loadLocalProcedureData(true);
        }
      } catch (error) {
        console.error('Lỗi khi lấy loại thủ tục:', error);
        
        // Sử dụng dữ liệu cục bộ khi không thể kết nối đến API
        setProcedureError('Không thể kết nối đến API. Đang sử dụng dữ liệu cục bộ tạm thời.');
        loadLocalProcedureData(true);
      } finally {
        setLoadingProcedures(false);
      }
    };

    fetchProcedureTypes();
  }, []);
  
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
      
      if (procedureTypes.length > 0) {
        const procedure = procedureTypes.find(p => p.value === procedureType);
        if (procedure) {
          setSelectedProcedure(procedure);
          setActiveStep(1); // Chuyển đến bước thông tin yêu cầu
        }
      }
    }
  }, [location.state, procedureTypes]);
  
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
      const procedure = procedureTypes.find(p => p.value === value);
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
        // Create the request data to send to the API
        const requestData = {
          title: formData.title,
          type: formData.type,
          description: formData.description,
          contact_phone: formData.contactPhone,
          contact_email: formData.contactEmail,
          additional_info: formData.additionalInfo,
          status: 'pending',
        };
        
        console.log('Submitting request data:', requestData);
        
        // Send the request to the API
        const response = await citizenService.createRequest(requestData);
        console.log('Request submitted successfully:', response);
        
        // If we have attachments, we would upload them here
        if (formData.attachments.length > 0) {
          console.info(`Xử lý ${formData.attachments.length} tệp đính kèm...`);
          
          // For each attachment, create a FormData object
          for (const attachment of formData.attachments) {
            const attachmentFormData = new FormData();
            attachmentFormData.append('file', attachment);
            attachmentFormData.append('name', attachment.name || 'Document');
            attachmentFormData.append('attachment_type', 'supporting_document');
            attachmentFormData.append('description', 'Uploaded from web application');
            
            // Use the request ID from the response to add attachments
            const attachmentResponse = await citizenService.addRequestAttachment(response.id, attachmentFormData);
            console.log('Attachment uploaded successfully:', attachmentResponse);
          }
        }
        
        setSubmitSuccess(true);
        
        // Redirect to requests list after 3 seconds
        setTimeout(() => {
          navigate('/citizen/requests');
        }, 3000);
      } catch (error) {
        console.error('Error submitting request:', error);
        let errorMessage = 'Đã xảy ra lỗi khi gửi yêu cầu';
        
        // Hiển thị thông báo lỗi chi tiết nếu có
        if (error.response && error.response.data) {
          if (typeof error.response.data === 'object') {
            // Trường hợp lỗi trả về là object với các trường lỗi
            const errorDetails = Object.entries(error.response.data)
              .map(([key, value]) => `${key}: ${value}`)
              .join(', ');
            errorMessage += `: ${errorDetails}`;
          } else if (typeof error.response.data === 'string') {
            // Trường hợp lỗi trả về là chuỗi
            errorMessage += `: ${error.response.data}`;
          }
        } else if (error.message) {
          errorMessage += `: ${error.message}`;
        }
        
        setSubmitError(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  // Function to retry API connection
  const handleRetryApiConnection = () => {
    setProcedureError(null);
    setLoadingProcedures(true);
    
    // Retry the API call
    citizenService.getProcedureTypes()
      .then(data => {
        // Kiểm tra xem dữ liệu có tồn tại không
        if (!data) {
          console.warn('Không nhận được dữ liệu từ API khi retry');
          setProcedureError('Kết nối API vẫn không khả dụng. Tiếp tục sử dụng dữ liệu cục bộ.');
          loadLocalProcedureData(true);
          return;
        }
        
        // Format the procedure types for the component
        const formattedProcedures = [];
        
        // Phương thức xử lý một đối tượng thủ tục và thêm vào danh sách đã định dạng
        const processProcedure = (procedure) => {
          if (procedure && procedure.id) {
            formattedProcedures.push({
              value: procedure.id,
              label: procedure.name || 'Unknown',
              category: procedure.category || 'other',
              description: procedure.description || '',
              processingTime: procedure.processing_time || procedure.processingTime || 'N/A',
              requiredDocuments: procedure.required_documents || procedure.requiredDocuments || [],
              fee: procedure.fee || 'Free',
              blockchainVerified: procedure.blockchain_verified || procedure.blockchainVerified || false,
              detailedDescription: procedure.detailed_description || procedure.detailedDescription || ''
            });
          }
        };
        
        // Xử lý trường hợp API trả về một mảng
        if (Array.isArray(data)) {
          console.log('Xử lý dữ liệu dạng mảng khi retry');
          data.forEach(processProcedure);
        } 
        // Xử lý trường hợp API trả về một đối tượng
        else if (data && typeof data === 'object') {
          // Trường hợp dữ liệu được phân trang (DRF pagination format)
          if (data.results && Array.isArray(data.results)) {
            console.log('Xử lý dữ liệu dạng phân trang (DRF) khi retry');
            
            // Kiểm tra xem mảng results có dữ liệu không
            if (data.results.length === 0) {
              console.warn('API trả về mảng results rỗng khi retry:', data);
              setProcedureError('API không trả về dữ liệu thủ tục. Tiếp tục sử dụng dữ liệu cục bộ.');
              // Tải dữ liệu cục bộ
              loadLocalProcedureData(true);
              return;
            }
            
            data.results.forEach(processProcedure);
          }
          // Trường hợp dữ liệu có cấu trúc phức tạp hơn
          else {
            console.log('Xử lý dữ liệu dạng đối tượng phức tạp khi retry');
            // Xem xét từng key trong đối tượng, nếu là mảng thì xử lý
            Object.entries(data).forEach(([key, value]) => {
              if (Array.isArray(value)) {
                console.log(`Xử lý mảng trong key: ${key} khi retry`);
                value.forEach(processProcedure);
              } else if (value && typeof value === 'object' && value.id) {
                // Trường hợp giá trị là một đối tượng thủ tục
                console.log(`Xử lý đối tượng trong key: ${key} khi retry`);
                processProcedure(value);
              }
            });
          }
        }
        
        if (formattedProcedures.length > 0) {
          setProcedureTypes(formattedProcedures);
          setProcedureError(null);
          console.log('Lấy thành công danh sách thủ tục khi retry:', formattedProcedures);
        } else {
          console.warn('Không tìm thấy dữ liệu thủ tục trong phản hồi API khi retry:', data);
          setProcedureError('API không trả về dữ liệu thủ tục. Tiếp tục sử dụng dữ liệu cục bộ.');
          // Tải dữ liệu cục bộ
          loadLocalProcedureData(true);
        }
      })
      .catch(error => {
        console.error('Retry failed:', error);
        setProcedureError('Kết nối API vẫn không khả dụng. Tiếp tục sử dụng dữ liệu cục bộ.');
        // Tải dữ liệu cục bộ
        loadLocalProcedureData(true);
      })
      .finally(() => {
        setLoadingProcedures(false);
      });
  };
  
  // Render step content
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Chọn loại thủ tục hành chính
            </Typography>
            
            {procedureError && (
              <Alert 
                severity="info" 
                sx={{ mb: 3 }}
                action={
                  <Button 
                    color="inherit" 
                    size="small"
                    onClick={handleRetryApiConnection}
                    disabled={loadingProcedures}
                  >
                    {loadingProcedures ? 'Đang thử lại...' : 'Thử lại kết nối'}
                  </Button>
                }
              >
                {procedureError}
              </Alert>
            )}
            
            {loadingProcedures ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <FormControl fullWidth error={!!errors.type}>
                <InputLabel id="request-type-label">Loại thủ tục</InputLabel>
                <Select
                  labelId="request-type-label"
                  id="request-type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  label="Loại thủ tục"
                >
                  {/* Group procedures by category */}
                  {(() => {
                    // Group procedures by category
                    const categorizedProcedures = {};
                    procedureTypes.forEach(procedure => {
                      if (!categorizedProcedures[procedure.category]) {
                        categorizedProcedures[procedure.category] = [];
                      }
                      categorizedProcedures[procedure.category].push(procedure);
                    });
                    
                    // Render grouped procedures
                    return Object.keys(categorizedProcedures).map(category => [
                      <ListSubheader key={`header-${category}`} sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>
                        {getCategoryName(category)}
                      </ListSubheader>,
                      ...categorizedProcedures[category].map(procedure => (
                        <MenuItem key={procedure.value} value={procedure.value}>
                          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                            <Typography variant="body2">{procedure.label}</Typography>
                            {procedure.blockchainVerified && (
                              <Chip
                                icon={<VerifiedIcon fontSize="small" />}
                                label="Blockchain"
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ ml: 1 }}
                              />
                            )}
                          </Box>
                        </MenuItem>
                      ))
                    ]).flat();
                  })()}
                </Select>
                {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
              </FormControl>
            )}
            
            {selectedProcedure && (
              <Card variant="outlined" sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {selectedProcedure.label}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {selectedProcedure.description}
                  </Typography>
                  
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                      <List dense>
                        <ListItem>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <TimeIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Thời gian xử lý" 
                            secondary={selectedProcedure.processingTime} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <MoneyIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Phí/Lệ phí" 
                            secondary={selectedProcedure.fee || 'Miễn phí'} 
                          />
                        </ListItem>
                      </List>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      {selectedProcedure.blockchainVerified && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <CheckCircleIcon color="success" fontSize="small" sx={{ mr: 1 }} />
                          <Typography variant="body2" color="success.main">
                            Được xác thực bằng Blockchain
                          </Typography>
                        </Box>
                      )}
                    </Grid>
                  </Grid>
                  
                  {selectedProcedure.requiredDocuments && selectedProcedure.requiredDocuments.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Giấy tờ cần thiết:
                      </Typography>
                      <List dense>
                        {selectedProcedure.requiredDocuments.map((doc, index) => (
                          <ListItem key={index}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <DocumentIcon color="primary" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={doc} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                  
                  {selectedProcedure.detailedDescription && (
                    <Accordion sx={{ mt: 2 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle2">
                          Thông tin chi tiết
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2">
                          {selectedProcedure.detailedDescription}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  )}
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
          onClick={() => navigate('/citizen/requests')}
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
                <Typography variant="body1" fontWeight="medium">
                  Yêu cầu đã được gửi thành công!
                </Typography>
                <Typography variant="body2">
                  Bạn sẽ được chuyển hướng đến trang danh sách yêu cầu sau 3 giây.
                </Typography>
              </Alert>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <>
              {submitError && (
                <Alert severity="info" sx={{ mb: 3 }}>
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