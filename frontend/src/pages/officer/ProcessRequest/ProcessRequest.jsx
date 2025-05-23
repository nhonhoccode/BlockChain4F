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
  CardActions,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip
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
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import officerService from '../../../services/api/officerService';

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
  const [formData, setFormData] = useState({
    status: '',
    notes: '',
    rejection_reason: ''
  });
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  
  // Fetch request details
  const fetchRequestDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Fetching request details for ID: ${requestId}`);
      const response = await officerService.getRequestDetail(requestId);
      console.log('Request details:', response);
      
      setRequest(response);
      
      // Initialize form data
      setFormData({
        status: response.status || '',
        notes: response.officer_notes || '',
        rejection_reason: response.rejection_reason || ''
      });
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
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle assign to self
  const handleAssignToSelf = async () => {
    try {
      setProcessing(true);
      setError(null);
      
      console.log(`Assigning request ${requestId} to self`);
      const response = await officerService.assignToSelf(requestId);
      console.log('Assign response:', response);
      
      // Refresh request data
      fetchRequestDetails();
      setSuccess('Yêu cầu đã được gán cho bạn xử lý');
    } catch (err) {
      console.error('Error assigning request:', err);
      setError('Không thể gán yêu cầu. Vui lòng thử lại sau.');
    } finally {
      setProcessing(false);
    }
  };
  
  // Handle complete request
  const handleCompleteRequest = async () => {
    try {
      setProcessing(true);
      setError(null);
      
      console.log(`Completing request ${requestId}`);
      const response = await officerService.processRequest(requestId, {
        status: 'completed',
        notes: formData.notes
      });
      console.log('Complete response:', response);
      
      // Refresh request data
      fetchRequestDetails();
      setSuccess('Yêu cầu đã được hoàn thành');
    } catch (err) {
      console.error('Error completing request:', err);
      setError('Không thể hoàn thành yêu cầu. Vui lòng thử lại sau.');
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
      const response = await officerService.rejectRequest(requestId, {
        reason: formData.rejection_reason
      });
      console.log('Reject response:', response);
      
      // Close dialog and refresh request data
      handleCloseRejectDialog();
      fetchRequestDetails();
      setSuccess('Yêu cầu đã bị từ chối');
    } catch (err) {
      console.error('Error rejecting request:', err);
      setError('Không thể từ chối yêu cầu. Vui lòng thử lại sau.');
    } finally {
      setProcessing(false);
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (e) {
      console.error('Date format error:', e);
      return dateString;
    }
  };
  
  // Get status chip based on status string
  const getStatusChip = (status) => {
    switch (status) {
      case 'completed':
        return <Chip label={t('status.completed', 'Hoàn thành')} color="success" icon={<CheckCircleIcon />} />;
      case 'submitted':
        return <Chip label={t('status.submitted', 'Đã nộp')} color="warning" />;
      case 'in_review':
        return <Chip label={t('status.in_review', 'Đang xem xét')} color="info" />;
      case 'processing':
        return <Chip label={t('status.processing', 'Đang xử lý')} color="primary" />;
      case 'rejected':
        return <Chip label={t('status.rejected', 'Từ chối')} color="error" icon={<CancelIcon />} />;
      default:
        return <Chip label={status || t('status.unknown', 'Không xác định')} color="default" />;
    }
  };
  
  // Get request type translated
  const getRequestType = (type) => {
    const requestTypes = {
      birth_certificate: t('requestType.birth_certificate', 'Giấy khai sinh'),
      death_certificate: t('requestType.death_certificate', 'Giấy chứng tử'),
      marriage_certificate: t('requestType.marriage_certificate', 'Giấy đăng ký kết hôn'),
      residence_certificate: t('requestType.residence_certificate', 'Giấy xác nhận cư trú'),
      land_use_certificate: t('requestType.land_use_certificate', 'Giấy chứng nhận quyền sử dụng đất'),
      business_registration: t('requestType.business_registration', 'Đăng ký kinh doanh'),
      construction_permit: t('requestType.construction_permit', 'Giấy phép xây dựng')
    };
    
    return requestTypes[type] || type || t('requestType.unknown', 'Không xác định');
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
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <BackIcon />
        </IconButton>
        <Typography variant="h4">
          {t('officer.processRequest.title', 'Xử lý yêu cầu')}
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      
      {request && (
        <>
          {/* Request Status */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AssignmentIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h5" component="h2">
                    {request.title}
                  </Typography>
                </Box>
                <Typography variant="subtitle1" color="textSecondary" sx={{ mt: 1 }}>
                  {getRequestType(request.request_type)}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                  <Typography variant="body2" color="textSecondary">
                    {t('common.status', 'Trạng thái')}:
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    {getStatusChip(request.status)}
                  </Box>
                </Box>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 2 }} />
            
            {/* Progress Stepper */}
            <Stepper activeStep={getCurrentStep(request.status)} sx={{ mt: 3 }}>
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
            
            {/* Rejection message if applicable */}
            {request.status === 'rejected' && (
              <Alert severity="error" sx={{ mt: 3 }}>
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
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {t('officer.processRequest.requestDetails', 'Chi tiết yêu cầu')}
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">
                      {t('common.requestId', 'Mã yêu cầu')}:
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {request.id}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">
                      {t('common.requestType', 'Loại yêu cầu')}:
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {getRequestType(request.request_type)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">
                      {t('common.submittedDate', 'Ngày nộp')}:
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {formatDate(request.created_at)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">
                      {t('common.lastUpdated', 'Cập nhật lần cuối')}:
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {formatDate(request.updated_at)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      {t('common.description', 'Mô tả')}:
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      {request.notes || t('common.noDescription', 'Không có mô tả')}
                    </Typography>
                  </Grid>
                  
                  {request.attachments && request.attachments.length > 0 && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                        {t('common.attachments', 'Tệp đính kèm')}:
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        {request.attachments.map((attachment, index) => (
                          <Chip
                            key={index}
                            icon={<AttachmentIcon />}
                            label={attachment.name || `File ${index + 1}`}
                            component="a"
                            href={attachment.file}
                            target="_blank"
                            clickable
                            sx={{ mr: 1, mb: 1 }}
                          />
                        ))}
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Paper>
              
              {/* Processing Form */}
              {(request.status === 'submitted' || request.status === 'in_review' || request.status === 'processing') && (
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
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
                      sx={{ mb: 3 }}
                    />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      {request.status === 'submitted' && (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleAssignToSelf}
                          disabled={processing}
                          startIcon={<AssignmentIcon />}
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
                            onClick={handleCompleteRequest}
                            disabled={processing}
                            startIcon={<ApproveIcon />}
                          >
                            {processing ? (
                              <CircularProgress size={24} />
                            ) : (
                              t('officer.processRequest.completeRequest', 'Hoàn thành')
                            )}
                          </Button>
                          
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={handleOpenRejectDialog}
                            disabled={processing}
                            startIcon={<RejectIcon />}
                          >
                            {t('officer.processRequest.rejectRequest', 'Từ chối')}
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
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {t('officer.processRequest.citizenInfo', 'Thông tin công dân')}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1">
                      {request.requestor ? `${request.requestor.first_name} ${request.requestor.last_name}` : t('common.unknown', 'Không xác định')}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {request.requestor?.email || t('common.noEmail', 'Không có email')}
                    </Typography>
                  </Box>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                {request.requestor?.profile && (
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      {t('common.phone', 'Số điện thoại')}:
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {request.requestor.profile.phone_number || t('common.notProvided', 'Chưa cung cấp')}
                    </Typography>
                    
                    <Typography variant="body2" color="textSecondary">
                      {t('common.idNumber', 'Số CMND/CCCD')}:
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {request.requestor.profile.id_number || t('common.notProvided', 'Chưa cung cấp')}
                    </Typography>
                    
                    <Typography variant="body2" color="textSecondary">
                      {t('common.address', 'Địa chỉ')}:
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {request.requestor.profile.address ? 
                        `${request.requestor.profile.address}, ${request.requestor.profile.ward}, ${request.requestor.profile.district}, ${request.requestor.profile.province}` : 
                        t('common.notProvided', 'Chưa cung cấp')}
                    </Typography>
                  </Box>
                )}
                
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{ mt: 2 }}
                  onClick={() => request.requestor && navigate(`/officer/citizens/${request.requestor.id}`)}
                  disabled={!request.requestor}
                >
                  {t('officer.processRequest.viewCitizenProfile', 'Xem hồ sơ công dân')}
                </Button>
              </Paper>
              
              {/* Assigned Officer */}
              <Paper sx={{ p: 3, mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {t('officer.processRequest.assignedTo', 'Cán bộ xử lý')}
                </Typography>
                
                {request.assigned_to ? (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1">
                        {`${request.assigned_to.first_name} ${request.assigned_to.last_name}`}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {request.assigned_to.email}
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Typography variant="body1">
                    {t('officer.processRequest.notAssigned', 'Chưa có cán bộ xử lý')}
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
          
          {/* Reject Dialog */}
          <Dialog
            open={openRejectDialog}
            onClose={handleCloseRejectDialog}
            aria-labelledby="reject-dialog-title"
          >
            <DialogTitle id="reject-dialog-title">
              {t('officer.processRequest.rejectRequest', 'Từ chối yêu cầu')}
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
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
                sx={{ mt: 2 }}
                error={!formData.rejection_reason}
                helperText={!formData.rejection_reason ? t('common.required', 'Bắt buộc') : ''}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseRejectDialog}>
                {t('common.cancel', 'Hủy')}
              </Button>
              <Button 
                onClick={handleRejectRequest} 
                color="error" 
                variant="contained"
                disabled={!formData.rejection_reason || processing}
              >
                {processing ? (
                  <CircularProgress size={24} />
                ) : (
                  t('officer.processRequest.confirm', 'Xác nhận')
                )}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
};

export default ProcessRequest;
