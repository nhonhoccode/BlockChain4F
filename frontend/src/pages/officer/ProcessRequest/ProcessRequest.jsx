import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText, 
  CircularProgress, 
  Alert, 
  Divider,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip,
  Avatar,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemAvatar,
  Badge,
  Breadcrumbs,
  Tabs,
  Tab,
  LinearProgress,
  Link
} from '@mui/material';
import { 
  AssignmentTurnedIn as ApproveIcon,
  Close as RejectIcon,
  ArrowBack as BackIcon,
  Send as SendIcon,
  Delete as DeleteIcon,
  AttachFile as AttachmentIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  CalendarToday as CalendarIcon,
  Comment as CommentIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Description as DocumentIcon,
  Update as UpdateIcon,
  History as HistoryIcon,
  AccessTime as TimeIcon,
  ChevronRight as ChevronRightIcon,
  Home as HomeIcon,
  PostAdd as RequestIcon,
  Error as ErrorIcon,
  PriorityHigh as PriorityHighIcon,
  LocalPrintshop as PrintIcon,
  FileCopy as CopyIcon,
  Timeline as TimelineIcon,
  Notifications as NotificationsIcon,
  EventNote as NoteIcon,
  HourglassEmpty as PendingIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import officerService from '../../../services/api/officerService';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const ProcessRequest = () => {
  const { t } = useTranslation();
  const { requestId } = useParams();
  const navigate = useNavigate();
  
  // State variables
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    status: '',
    notes: '',
    rejection_reason: '',
    processing_time: '2', // Thời gian xử lý ước tính (ngày)
    notify_citizen: true, // Thông báo cho công dân
  });
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [openCompleteDialog, setOpenCompleteDialog] = useState(false);
  
  // Fetch request details
  const fetchRequestDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Fetching request details for ID: ${requestId}`);
      const response = await officerService.getRequestDetail(requestId);
      console.log('Request details from API:', response);
      
      // Xử lý dữ liệu trước khi cập nhật state
      if (response) {
        // Log dữ liệu quan trọng để debug
        console.log('Request type from API:', response.request_type);
        console.log('Requestor details from API:', response.requestor_details);
        console.log('Created date from API:', response.created_at);
        console.log('Submitted date from API:', response.submitted_date);
        
        // Đảm bảo các trường dữ liệu chính luôn có giá trị
        const processedResponse = {
          ...response,
          // Nếu không có title, sử dụng loại yêu cầu hoặc ID làm thay thế
          title: response.title || `Yêu cầu ${getRequestType(response.request_type) || response.id}`,
          // Đảm bảo request_type luôn có giá trị
          request_type: response.request_type || 'unknown',
          // Đảm bảo status luôn có giá trị
          status: response.status || 'submitted',
          // Đảm bảo created_at luôn có giá trị
          created_at: response.created_at || new Date().toISOString(),
          // Đảm bảo updated_at luôn có giá trị
          updated_at: response.updated_at || response.created_at || new Date().toISOString(),
          // Đảm bảo requestor_details luôn có giá trị
          requestor_details: response.requestor_details || {
            id: null,
            first_name: '',
            last_name: '',
            full_name: 'Chưa xác định',
            email: '',
            username: ''
          },
          // Xử lý thông tin người dùng nếu không có
          requestor: response.requestor || null
        };
        
        console.log('Processed response:', processedResponse);
        
        // Cập nhật state với dữ liệu đã xử lý
        setRequest(processedResponse);
        
        // Initialize form data
        setFormData({
          status: processedResponse.status || '',
          notes: processedResponse.officer_notes || '',
          rejection_reason: processedResponse.rejection_reason || '',
          processing_time: '2',
          notify_citizen: true
        });
      } else {
        // Nếu không có dữ liệu trả về, hiển thị lỗi
        setError('Không thể tải thông tin yêu cầu. Dữ liệu không hợp lệ.');
      }
    } catch (err) {
      console.error('Error fetching request details:', err);
      setError('Không thể tải thông tin yêu cầu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  // Load request details on component mount
  useEffect(() => {
    fetchRequestDetails();
  }, [requestId]);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Handle assign to self
  const handleAssignToSelf = async () => {
    try {
      setProcessing(true);
      setError(null);
      
      console.log(`Assigning request ${requestId} to self`);
      
      // Thêm console.log để xem chi tiết hơn về request
      const token = localStorage.getItem('token');
      console.log('Token available:', !!token);
      
      // Trực tiếp gọi API với axios thay vì qua service layer
      const response = await fetch(`http://localhost:8000/api/v1/officer/requests/${requestId}/assign/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({})
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Assign response:', data);
      
      // Refresh request data
      fetchRequestDetails();
      setSuccess('Yêu cầu đã được gán cho bạn xử lý thành công');
    } catch (err) {
      console.error('Error assigning request:', err);
      // Log chi tiết hơn về lỗi
      setError(`Không thể gán yêu cầu: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };
  
  // Handle complete request dialog
  const handleOpenCompleteDialog = () => {
    setOpenCompleteDialog(true);
  };
  
  const handleCloseCompleteDialog = () => {
    setOpenCompleteDialog(false);
  };
  
  // Handle complete request
  const handleCompleteRequest = async () => {
    try {
      setProcessing(true);
      setError(null);
      
      console.log(`Completing request ${requestId}`);
      console.log('Request data:', {
        status: 'completed',
        notes: formData.notes,
        notify_citizen: formData.notify_citizen
      });
      
      const response = await officerService.processRequest(requestId, {
        status: 'completed',
        notes: formData.notes,
        notify_citizen: formData.notify_citizen
      });
      console.log('Complete response:', response);
      
      // Close dialog and refresh request data
      handleCloseCompleteDialog();
      fetchRequestDetails();
      setSuccess('Yêu cầu đã được hoàn thành thành công');
    } catch (err) {
      console.error('Error completing request:', err);
      let errorMessage = 'Không thể hoàn thành yêu cầu. ';
      
      if (err.response) {
        errorMessage += `Lỗi ${err.response.status}: ${err.response.data?.detail || err.response.statusText}`;
      } else if (err.message) {
        errorMessage += err.message;
      } else {
        errorMessage += 'Vui lòng thử lại sau.';
      }
      
      setError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };
  
  // Handle reject request dialog
  const handleOpenRejectDialog = () => {
    setOpenRejectDialog(true);
  };
  
  const handleCloseRejectDialog = () => {
    setOpenRejectDialog(false);
  };
  
  // Handle reject request
  const handleRejectRequest = async () => {
    try {
      setProcessing(true);
      setError(null);
      
      if (!formData.rejection_reason) {
        setError('Vui lòng nhập lý do từ chối');
        setProcessing(false);
        return;
      }
      
      console.log(`Rejecting request ${requestId}`);
      console.log('Rejection data:', {
        reject_reason: formData.rejection_reason,
        notify_citizen: formData.notify_citizen
      });
      
      const response = await officerService.rejectRequest(requestId, {
        reject_reason: formData.rejection_reason,
        notify_citizen: formData.notify_citizen
      });
      console.log('Reject response:', response);
      
      // Close dialog and refresh request data
      handleCloseRejectDialog();
      fetchRequestDetails();
      setSuccess('Yêu cầu đã bị từ chối');
    } catch (err) {
      console.error('Error rejecting request:', err);
      let errorMessage = 'Không thể từ chối yêu cầu. ';
      
      if (err.response) {
        errorMessage += `Lỗi ${err.response.status}: ${err.response.data?.detail || err.response.statusText}`;
      } else if (err.message) {
        errorMessage += err.message;
      } else {
        errorMessage += 'Vui lòng thử lại sau.';
      }
      
      setError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy HH:mm', { locale: vi });
    } catch (e) {
      console.error('Date format error:', e);
      return dateString;
    }
  };
  
  // Format relative time
  const getRelativeTime = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
      
      if (diffInDays === 0) {
        return 'Hôm nay';
      } else if (diffInDays === 1) {
        return 'Hôm qua';
      } else if (diffInDays < 7) {
        return `${diffInDays} ngày trước`;
      } else {
        return formatDate(dateString);
      }
    } catch (e) {
      console.error('Relative time error:', e);
      return '';
    }
  };
  
  // Get status chip based on status string
  const getStatusChip = (status) => {
    switch (status) {
      case 'completed':
        return <Chip label={t('status.completed', 'Hoàn thành')} color="success" icon={<CheckCircleIcon />} />;
      case 'submitted':
        return <Chip label={t('status.submitted', 'Đã nộp')} color="warning" icon={<PendingIcon />} />;
      case 'in_review':
        return <Chip label={t('status.in_review', 'Đang xem xét')} color="info" icon={<TimelineIcon />} />;
      case 'processing':
        return <Chip label={t('status.processing', 'Đang xử lý')} color="primary" icon={<TimeIcon />} />;
      case 'rejected':
        return <Chip label={t('status.rejected', 'Từ chối')} color="error" icon={<CancelIcon />} />;
      default:
        return <Chip label={status || t('status.unknown', 'Không xác định')} color="default" />;
    }
  };
  
  // Get priority chip
  const getPriorityChip = (priority) => {
    switch (priority?.toLowerCase?.()) {
      case 'high':
      case 'cao':
        return <Chip label="Cao" color="error" size="small" icon={<PriorityHighIcon />} />;
      case 'medium':
      case 'trung bình':
        return <Chip label="Trung bình" color="warning" size="small" />;
      case 'low':
      case 'thấp':
        return <Chip label="Thấp" color="success" size="small" />;
      default:
        return <Chip label="Bình thường" color="default" size="small" />;
    }
  };
  
  // Get request type translated
  const getRequestType = (type) => {
    if (!type) return 'Không xác định';
    
    // Chuẩn hóa type thành chữ thường để dễ so sánh
    const normalizedType = type.toLowerCase();
    
    const requestTypes = {
      // Các loại giấy tờ cơ bản
      'birth_certificate': 'Giấy khai sinh',
      'death_certificate': 'Giấy chứng tử',
      'marriage_certificate': 'Giấy đăng ký kết hôn',
      'residence_certificate': 'Giấy xác nhận cư trú',
      'land_use_certificate': 'Giấy chứng nhận quyền sử dụng đất',
      'business_registration': 'Đăng ký kinh doanh',
      'construction_permit': 'Giấy phép xây dựng',
      
      // Các loại giấy tờ phổ biến khác
      'citizen_id': 'Căn cước công dân',
      'passport': 'Hộ chiếu',
      'driving_license': 'Giấy phép lái xe',
      'household_registration': 'Đăng ký hộ khẩu',
      'temporary_residence': 'Đăng ký tạm trú',
      'notarization': 'Công chứng, chứng thực',
      
      // Mã viết tắt
      'gcns': 'Giấy chứng nhận sở hữu',
      'gks': 'Giấy khai sinh',
      'gct': 'Giấy chứng tử',
      'gphd': 'Giấy phép hoạt động',
      'gpxd': 'Giấy phép xây dựng',
      'gdkkh': 'Giấy đăng ký kết hôn',
      'cccd': 'Căn cước công dân',
      'cmnd': 'Chứng minh nhân dân',
      'hc': 'Hộ chiếu',
      'gplx': 'Giấy phép lái xe',
      'bhyt': 'Bảo hiểm y tế',
      'msthue': 'Mã số thuế',
      
      // Giấy tờ tiếng Anh
      'id_card': 'Căn cước công dân',
      'birth_cert': 'Giấy khai sinh',
      'death_cert': 'Giấy chứng tử',
      'marriage_cert': 'Giấy đăng ký kết hôn',
      'land_cert': 'Giấy chứng nhận quyền sử dụng đất',
      'business_cert': 'Giấy chứng nhận đăng ký kinh doanh',
      'tax_id': 'Mã số thuế cá nhân',
      'health_insurance': 'Bảo hiểm y tế',
      
      // Mặc định
      'unknown': 'Không xác định'
    };
    
    // Kiểm tra nếu là object
    if (typeof type === 'object' && type !== null) {
      if (type.name) return type.name;
      if (type.display_name) return type.display_name;
      if (type.description) return type.description;
      if (type.code) return getRequestType(type.code);
    }
    
    // Tìm kiếm trong danh sách
    for (const [key, value] of Object.entries(requestTypes)) {
      if (normalizedType.includes(key)) {
        return value;
      }
    }
    
    // Trả về chuỗi type nếu không có giá trị khớp trong bảng ánh xạ
    return type || t('requestType.unknown', 'Không xác định');
  };
  
  // Get current step based on status
  const getCurrentStep = (status) => {
    switch (status) {
      case 'submitted':
        return 0;
      case 'in_review':
        return 1;
      case 'processing':
        return 2;
      case 'completed':
        return 3;
      case 'rejected':
        return -1;
      default:
        return 0;
    }
  };
  
  // Get request timeline
  const getRequestTimeline = () => {
    const timeline = [];
    
    if (request) {
      // Submitted step
      timeline.push({
        label: 'Nộp hồ sơ',
        date: request.created_at,
        description: `Công dân ${request.requestor?.first_name} ${request.requestor?.last_name} đã nộp hồ sơ`,
        icon: <RequestIcon />,
        color: 'success.main'
      });
      
      // Assigned step (if applicable)
      if (request.assigned_at) {
        timeline.push({
          label: 'Tiếp nhận hồ sơ',
          date: request.assigned_at,
          description: `Cán bộ ${request.assigned_officer?.first_name} ${request.assigned_officer?.last_name} đã tiếp nhận hồ sơ`,
          icon: <AssignmentIcon />,
          color: 'info.main'
        });
      }
      
      // Processing step (if applicable)
      if (request.status === 'processing' || request.status === 'completed' || request.status === 'rejected') {
        timeline.push({
          label: 'Đang xử lý',
          date: request.processing_started_at || request.updated_at,
          description: 'Hồ sơ đang được xử lý',
          icon: <TimeIcon />,
          color: 'primary.main'
        });
      }
      
      // Completed step (if applicable)
      if (request.status === 'completed') {
        timeline.push({
          label: 'Hoàn thành',
          date: request.completed_at || request.updated_at,
          description: 'Hồ sơ đã được xử lý hoàn thành',
          icon: <CheckCircleIcon />,
          color: 'success.main'
        });
      }
      
      // Rejected step (if applicable)
      if (request.status === 'rejected') {
        timeline.push({
          label: 'Từ chối',
          date: request.rejected_at || request.updated_at,
          description: `Lý do: ${request.rejection_reason || 'Không cung cấp'}`,
          icon: <CancelIcon />,
          color: 'error.main'
        });
      }
    }
    
    return timeline;
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: 'background.default' }}>
      {/* Test Alert to confirm changes */}
      <Alert severity="info" sx={{ mb: 2, fontWeight: 'bold' }}>
        Giao diện đã được cập nhật! Nếu bạn thấy thông báo này, thay đổi đã được áp dụng.
      </Alert>
      
      {/* Header with better styling */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          mb: 3, 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          alignItems: { xs: 'flex-start', sm: 'center' }, 
          justifyContent: 'space-between',
          backgroundColor: 'secondary.main',
          color: 'white',
          borderRadius: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            onClick={() => navigate(-1)} 
            sx={{ 
              mr: 1, 
              bgcolor: 'white',
              '&:hover': {
                bgcolor: 'grey.100'
              }
            }}
          >
            <BackIcon />
          </IconButton>
          <Typography variant="h5" color="white" fontWeight="bold">
            {t('officer.processRequest.title', 'Xử lý yêu cầu')}
          </Typography>
        </Box>
        
        {request && (
          <Box 
            sx={{ 
              display: 'flex', 
              mt: { xs: 2, sm: 0 },
              alignItems: 'center'
            }}
          >
            <Typography variant="body2" color="white" sx={{ mr: 1 }}>
              {t('common.status', 'Trạng thái')}:
            </Typography>
            {getStatusChip(request.status)}
          </Box>
        )}
      </Paper>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 1 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 1 }}>
          {success}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      ) : request ? (
        <>
          {/* Request Status Card */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AssignmentIcon sx={{ mr: 1, color: 'primary.main', fontSize: 32 }} />
                  <Typography variant="h5" component="h2">
                    {request.title || 'Yêu cầu hành chính'}
                  </Typography>
                </Box>
                <Typography variant="subtitle1" color="textSecondary" sx={{ mt: 1 }}>
                  {getRequestType(request.request_type) || 'Chưa xác định'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                {/* Progress Stepper with better styling */}
                <Stepper 
                  activeStep={getCurrentStep(request.status)} 
                  alternativeLabel
                  sx={{ 
                    mt: { xs: 3, md: 0 }, 
                    '& .MuiStepLabel-label': {
                      fontSize: '0.75rem'
                    }
                  }}
                >
                  <Step>
                    <StepLabel>{t('requestStatus.submitted', 'Đã nộp')}</StepLabel>
                  </Step>
                  <Step>
                    <StepLabel>{t('requestStatus.in_review', 'Đang xem xét')}</StepLabel>
                  </Step>
                  <Step>
                    <StepLabel>{t('requestStatus.processing', 'Đang xử lý')}</StepLabel>
                  </Step>
                  <Step>
                    <StepLabel>{t('requestStatus.completed', 'Hoàn thành')}</StepLabel>
                  </Step>
                </Stepper>
              </Grid>
            </Grid>
            
            {/* Rejection message if applicable */}
            {request.status === 'rejected' && (
              <Alert severity="error" sx={{ mt: 3, borderRadius: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {t('requestStatus.rejected', 'Yêu cầu đã bị từ chối')}
                </Typography>
                <Typography variant="body2">
                  {t('common.reason', 'Lý do')}: {request.rejection_reason || t('common.noReason', 'Không có lý do được cung cấp')}
                </Typography>
              </Alert>
            )}
          </Paper>
          
          <Grid container spacing={3}>
            {/* Request Details */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: 2 }}>
                <Typography variant="h6" fontWeight="medium" gutterBottom>
                  {t('officer.processRequest.requestDetails', 'Chi tiết yêu cầu')}
                </Typography>
                
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 2, 
                        borderRadius: 2,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        {t('common.requestId', 'Mã yêu cầu')}
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        mt: 1
                      }}>
                        <AssignmentIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body1" fontWeight="medium">
                          {request.id}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 2, 
                        borderRadius: 2,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        {t('common.requestType', 'Loại yêu cầu')}
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        mt: 1
                      }}>
                        <DocumentIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body1" fontWeight="medium">
                          {getRequestType(request.request_type)}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 2, 
                        borderRadius: 2,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        {t('common.submittedDate', 'Ngày nộp')}
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        mt: 1
                      }}>
                        <CalendarIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body1" fontWeight="medium">
                          {request.submitted_date ? formatDate(request.submitted_date) : 
                           (request.created_at ? formatDate(request.created_at) : 'Chưa xác định')}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 2, 
                        borderRadius: 2,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        {t('common.lastUpdated', 'Cập nhật lần cuối')}
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        mt: 1
                      }}>
                        <UpdateIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body1" fontWeight="medium">
                          {formatDate(request.updated_at)}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 2, 
                        borderRadius: 2,
                        mt: 1
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <CommentIcon color="primary" sx={{ mr: 1, mt: 0.5 }} />
                        <Box>
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            {t('common.description', 'Mô tả')}
                          </Typography>
                          <Typography variant="body1" sx={{ mt: 1 }}>
                            {request.notes || t('common.noDescription', 'Không có mô tả')}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                  
                  {request.attachments && request.attachments.length > 0 && (
                    <Grid item xs={12}>
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: 2, 
                          borderRadius: 2,
                          mt: 1
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                          <AttachmentIcon color="primary" sx={{ mr: 1, mt: 0.5 }} />
                          <Box>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                              {t('common.attachments', 'Tệp đính kèm')}
                            </Typography>
                            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {request.attachments.map((attachment, index) => (
                                <Chip
                                  key={index}
                                  icon={<AttachmentIcon />}
                                  label={attachment.name || `File ${index + 1}`}
                                  component="a"
                                  href={attachment.file}
                                  target="_blank"
                                  clickable
                                  color="primary"
                                  variant="outlined"
                                  sx={{ borderRadius: 1 }}
                                />
                              ))}
                            </Box>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              </Paper>
              
              {/* Processing Form */}
              {(request.status === 'submitted' || request.status === 'in_review' || request.status === 'processing') && (
                <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
                  <Typography variant="h6" fontWeight="medium" gutterBottom>
                    {t('officer.processRequest.processingForm', 'Xử lý yêu cầu')}
                  </Typography>
                  
                  <Box component="form" sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      label={t('common.notes', 'Ghi chú')}
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      multiline
                      rows={4}
                      sx={{ 
                        mb: 3,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                      placeholder={t('officer.processRequest.addNotes', 'Thêm ghi chú về xử lý yêu cầu...')}
                    />
                    
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 2
                    }}>
                      {request.status === 'submitted' && (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleAssignToSelf}
                          disabled={processing}
                          startIcon={<AssignmentIcon />}
                          sx={{ 
                            borderRadius: 2,
                            py: 1.5,
                            px: 3,
                            boxShadow: 2
                          }}
                        >
                          {processing ? (
                            <CircularProgress size={24} />
                          ) : (
                            t('officer.processRequest.assignToSelf', 'Nhận xử lý')
                          )}
                        </Button>
                      )}
                      
                      {(request.status === 'in_review' || request.status === 'processing') && (
                        <>
                          <Button
                            variant="contained"
                            color="success"
                            onClick={handleOpenCompleteDialog}
                            disabled={processing}
                            startIcon={<CheckCircleIcon />}
                            sx={{ 
                              borderRadius: 2,
                              py: 1.5,
                              px: 3,
                              boxShadow: 2
                            }}
                          >
                            {t('officer.processRequest.completeRequest', 'Hoàn thành yêu cầu')}
                          </Button>
                          
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={handleOpenRejectDialog}
                            disabled={processing}
                            startIcon={<CancelIcon />}
                            sx={{ 
                              borderRadius: 2,
                              py: 1.5,
                              px: 3
                            }}
                          >
                            {t('officer.processRequest.rejectRequest', 'Từ chối yêu cầu')}
                          </Button>
                        </>
                      )}
                    </Box>
                  </Box>
                </Paper>
              )}
            </Grid>
            
            {/* Citizen Information */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 2, height: '100%' }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  mb: 2
                }}>
                  <Typography variant="h6" fontWeight="medium">
                    {t('officer.processRequest.citizenInfo', 'Thông tin công dân')}
                  </Typography>
                  {request.requestor_details && request.requestor_details.is_verified && (
                    <Chip 
                      label={t('common.verified', 'Đã xác thực')} 
                      size="small" 
                      color="success" 
                      variant="outlined"
                    />
                  )}
                </Box>
                
                {request.requestor_details ? (
                  <>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 3,
                      p: 2,
                      bgcolor: 'grey.50',
                      borderRadius: 2
                    }}>
                      <Avatar 
                        src={request.requestor_details.profile?.profile_picture} 
                        sx={{ 
                          width: 60, 
                          height: 60, 
                          mr: 2,
                          bgcolor: 'primary.main'
                        }}
                      >
                        <PersonIcon fontSize="large" />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="medium">
                          {request.requestor_details.full_name || 
                           (request.requestor_details.first_name && request.requestor_details.last_name ? 
                            `${request.requestor_details.last_name} ${request.requestor_details.first_name}` : 
                            (request.requestor_details.username || request.requestor_details.email || 'Người dùng chưa cập nhật tên'))}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {request.requestor_details.email || t('common.noEmail', 'Không có email')}
                        </Typography>
                      </Box>
                    </Box>
                    
                    {request.requestor_details.profile ? (
                      <Box sx={{ mt: 2 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <CalendarIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                                <Typography variant="body2" fontWeight="medium">
                                  {t('common.contactInfo', 'Thông tin liên hệ')}
                                </Typography>
                              </Box>
                              <Typography variant="body2" sx={{ ml: 4 }}>
                                {request.requestor_details.profile.phone_number || t('common.notProvided', 'Chưa cung cấp')}
                              </Typography>
                            </Paper>
                          </Grid>
                          
                          <Grid item xs={12}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <AssignmentIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                                <Typography variant="body2" fontWeight="medium">
                                  {t('common.idNumber', 'Số CMND/CCCD')}
                                </Typography>
                              </Box>
                              <Typography variant="body2" sx={{ ml: 4 }}>
                                {request.requestor_details.profile.id_number || t('common.notProvided', 'Chưa cung cấp')}
                              </Typography>
                            </Paper>
                          </Grid>
                          
                          <Grid item xs={12}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                                <PersonIcon fontSize="small" sx={{ mr: 1, mt: 0.5, color: 'primary.main' }} />
                                <Box>
                                  <Typography variant="body2" fontWeight="medium">
                                    {t('common.address', 'Địa chỉ')}
                                  </Typography>
                                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                                    {request.requestor_details.profile.address ? 
                                      `${request.requestor_details.profile.address}${request.requestor_details.profile.ward ? `, ${request.requestor_details.profile.ward}` : ''}${request.requestor_details.profile.district ? `, ${request.requestor_details.profile.district}` : ''}${request.requestor_details.profile.province ? `, ${request.requestor_details.profile.province}` : ''}` : 
                                      t('common.notProvided', 'Chưa cung cấp')}
                                  </Typography>
                                </Box>
                              </Box>
                            </Paper>
                          </Grid>
                        </Grid>
                        
                        <Button
                          fullWidth
                          variant="contained"
                          color="primary"
                          sx={{ mt: 3 }}
                          onClick={() => request.requestor_details.id && navigate(`/officer/citizens/${request.requestor_details.id}`)}
                          startIcon={<PersonIcon />}
                          disabled={!request.requestor_details.id}
                        >
                          {t('officer.processRequest.viewCitizenProfile', 'Xem hồ sơ công dân')}
                        </Button>
                      </Box>
                    ) : (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        Người dùng chưa cập nhật thông tin cá nhân đầy đủ
                      </Alert>
                    )}
                  </>
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center', 
                    justifyContent: 'center',
                    py: 4
                  }}>
                    <Avatar 
                      sx={{ 
                        width: 80, 
                        height: 80, 
                        mb: 2,
                        bgcolor: 'grey.300'
                      }}
                    >
                      <PersonIcon fontSize="large" />
                    </Avatar>
                    <Typography variant="body1" align="center" color="textSecondary">
                      {t('common.noUserInfo', 'Không có thông tin người dùng')}
                    </Typography>
                    <Alert severity="warning" sx={{ mt: 2, width: '100%' }}>
                      Yêu cầu không liên kết với người dùng nào. Cần kiểm tra lại hệ thống.
                    </Alert>
                  </Box>
                )}
              </Paper>
              
              {/* Assigned Officer Card */}
              {(request.assigned_officer || request.assigned_to) && (
                <Paper sx={{ p: 3, mt: 3, borderRadius: 2, boxShadow: 2 }}>
                  <Typography variant="h6" fontWeight="medium" gutterBottom>
                    {t('officer.processRequest.assignedTo', 'Cán bộ xử lý')}
                  </Typography>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    p: 2,
                    bgcolor: 'grey.50',
                    borderRadius: 2
                  }}>
                    <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {request.assigned_officer ? 
                          `${request.assigned_officer.first_name} ${request.assigned_officer.last_name}` :
                          (request.assigned_to ? 
                            `${request.assigned_to.first_name} ${request.assigned_to.last_name}` : 
                            t('officer.processRequest.notAssigned', 'Chưa có cán bộ xử lý')
                          )
                        }
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {request.assigned_officer?.email || request.assigned_to?.email || ''}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              )}
            </Grid>
          </Grid>
          
          {/* Reject Dialog */}
          <Dialog
            open={openRejectDialog}
            onClose={handleCloseRejectDialog}
            aria-labelledby="reject-dialog-title"
            PaperProps={{
              sx: {
                borderRadius: 2,
                width: '100%',
                maxWidth: 500,
                p: 1
              }
            }}
          >
            <DialogTitle 
              id="reject-dialog-title"
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                backgroundColor: 'error.light',
                color: 'white',
                py: 2,
                px: 3,
                borderRadius: 1,
                mb: 2
              }}
            >
              <CancelIcon sx={{ mr: 1 }} />
              {t('officer.processRequest.rejectRequest', 'Từ chối yêu cầu')}
            </DialogTitle>
            <DialogContent>
              <DialogContentText sx={{ mb: 3 }}>
                {t('officer.processRequest.rejectConfirmation', 'Bạn có chắc chắn muốn từ chối yêu cầu này? Vui lòng cung cấp lý do:')}
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                name="rejection_reason"
                label={t('common.reason', 'Lý do')}
                fullWidth
                variant="outlined"
                value={formData.rejection_reason}
                onChange={handleInputChange}
                multiline
                rows={3}
                sx={{ 
                  mt: 1,
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
                error={!formData.rejection_reason}
                helperText={!formData.rejection_reason ? t('common.required', 'Bắt buộc') : ''}
                placeholder={t('officer.processRequest.rejectReasonPlaceholder', 'Nhập lý do từ chối yêu cầu này...')}
              />
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button 
                onClick={handleCloseRejectDialog}
                variant="outlined"
                sx={{ borderRadius: 2, px: 3 }}
              >
                {t('common.cancel', 'Hủy')}
              </Button>
              <Button 
                onClick={handleRejectRequest} 
                color="error" 
                variant="contained"
                disabled={!formData.rejection_reason || processing}
                startIcon={processing ? <CircularProgress size={18} /> : <CancelIcon />}
                sx={{ borderRadius: 2, px: 3 }}
              >
                {t('officer.processRequest.confirm', 'Xác nhận')}
              </Button>
            </DialogActions>
          </Dialog>
          
          {/* Complete Dialog */}
          <Dialog
            open={openCompleteDialog}
            onClose={handleCloseCompleteDialog}
            aria-labelledby="complete-dialog-title"
            PaperProps={{
              sx: {
                borderRadius: 2,
                width: '100%',
                maxWidth: 500,
                p: 1
              }
            }}
          >
            <DialogTitle 
              id="complete-dialog-title"
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                backgroundColor: 'success.light',
                color: 'white',
                py: 2,
                px: 3,
                borderRadius: 1,
                mb: 2
              }}
            >
              <CheckCircleIcon sx={{ mr: 1 }} />
              {t('officer.processRequest.completeRequest', 'Hoàn thành yêu cầu')}
            </DialogTitle>
            <DialogContent>
              <DialogContentText sx={{ mb: 3 }}>
                {t('officer.processRequest.completeConfirmation', 'Bạn có chắc chắn muốn hoàn thành yêu cầu này? Thao tác này không thể hoàn tác.')}
              </DialogContentText>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <FormHelperText sx={{ mb: 1, ml: 0 }}>
                  {t('officer.processRequest.notifyUser', 'Thông báo cho người dùng')}
                </FormHelperText>
                <Grid container alignItems="center">
                  <Grid item>
                    <Chip
                      label={formData.notify_citizen ? 'Có' : 'Không'}
                      color={formData.notify_citizen ? 'success' : 'default'}
                      onClick={() => setFormData(prev => ({ ...prev, notify_citizen: !prev.notify_citizen }))}
                      clickable
                      sx={{ borderRadius: 2 }}
                    />
                  </Grid>
                  <Grid item xs>
                    <Typography variant="body2" color="textSecondary" sx={{ ml: 2 }}>
                      {formData.notify_citizen 
                        ? t('officer.processRequest.willNotify', 'Người dùng sẽ nhận được thông báo qua email và ứng dụng.')
                        : t('officer.processRequest.wontNotify', 'Người dùng sẽ không nhận được thông báo.')}
                    </Typography>
                  </Grid>
                </Grid>
              </FormControl>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button 
                onClick={handleCloseCompleteDialog}
                variant="outlined"
                sx={{ borderRadius: 2, px: 3 }}
              >
                {t('common.cancel', 'Hủy')}
              </Button>
              <Button 
                onClick={handleCompleteRequest} 
                color="success" 
                variant="contained"
                disabled={processing}
                startIcon={processing ? <CircularProgress size={18} /> : <CheckCircleIcon />}
                sx={{ borderRadius: 2, px: 3 }}
              >
                {t('officer.processRequest.confirm', 'Xác nhận')}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      ) : null}
    </Box>
  );
};

export default ProcessRequest;
