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
  Chip,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  ArrowBack as BackIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Send as SendIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import officerService from '../../../services/api/officerService';

const ProcessRequest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingData, setProcessingData] = useState({
    status: '',
    notes: '',
    documents: [],
    rejectionReason: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  
  // Fetch request details
  const fetchRequestDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await officerService.getRequestDetail(id);
      setRequest(data);
      
      // Initialize processing data with current status
      if (data) {
        setProcessingData({
          status: data.status || 'pending',
          notes: data.officerNotes || '',
          documents: data.documents || [],
          rejectionReason: ''
        });
      }
    } catch (err) {
      console.error(`Error fetching request details for ID ${id}:`, err);
      setError('Không thể tải thông tin yêu cầu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  // Initial fetch
  useEffect(() => {
    if (id) {
      fetchRequestDetails();
    }
  }, [id]);
  
  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProcessingData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle assign to self
  const handleAssignToSelf = async () => {
    try {
      setSubmitting(true);
      await officerService.assignToSelf(id);
      fetchRequestDetails(); // Refresh data
    } catch (err) {
      console.error(`Error assigning request ID ${id} to self:`, err);
      setError('Không thể nhận xử lý yêu cầu này. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle process request
  const handleProcessRequest = async () => {
    try {
      setSubmitting(true);
      setError(null);
      
      await officerService.processRequest(id, {
        status: 'processing',
        notes: processingData.notes
      });
      
      fetchRequestDetails(); // Refresh data
    } catch (err) {
      console.error(`Error processing request ID ${id}:`, err);
      setError('Không thể xử lý yêu cầu này. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle approve request
  const handleApproveRequest = async () => {
    try {
      setSubmitting(true);
      setError(null);
      setOpenApproveDialog(false);
      
      await officerService.processRequest(id, {
        status: 'completed',
        notes: processingData.notes
      });
      
      fetchRequestDetails(); // Refresh data
    } catch (err) {
      console.error(`Error approving request ID ${id}:`, err);
      setError('Không thể phê duyệt yêu cầu này. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle reject request
  const handleRejectRequest = async () => {
    try {
      setSubmitting(true);
      setError(null);
      setOpenRejectDialog(false);
      
      if (!processingData.rejectionReason) {
        setError('Vui lòng nhập lý do từ chối.');
        setSubmitting(false);
        return;
      }
      
      await officerService.rejectRequest(id, {
        reason: processingData.rejectionReason
      });
      
      fetchRequestDetails(); // Refresh data
    } catch (err) {
      console.error(`Error rejecting request ID ${id}:`, err);
      setError('Không thể từ chối yêu cầu này. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
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
  
  // Get status chip
  const getStatusChip = (status) => {
    switch (status) {
      case 'pending':
        return <Chip label="Chờ xử lý" color="warning" size="small" />;
      case 'processing':
        return <Chip label="Đang xử lý" color="info" size="small" />;
      case 'completed':
        return <Chip label="Hoàn thành" color="success" size="small" />;
      case 'rejected':
        return <Chip label="Từ chối" color="error" size="small" />;
      default:
        return <Chip label={status || 'Không xác định'} color="default" size="small" />;
    }
  };
  
  // Get current step in the process
  const getCurrentStep = (status) => {
    switch (status) {
      case 'pending':
        return 0;
      case 'processing':
        return 1;
      case 'completed':
        return 2;
      case 'rejected':
        return 2;
      default:
        return 0;
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ py: 3, px: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error && !request) {
    return (
      <Box sx={{ py: 3, px: 2 }}>
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              startIcon={<RefreshIcon />} 
              onClick={fetchRequestDetails}
            >
              Thử lại
            </Button>
          }
        >
          {error}
        </Alert>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/officer/requests/pending')}
        >
          Quay lại danh sách
        </Button>
      </Box>
    );
  }
  
  return (
    <Box sx={{ py: 3, px: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Xử lý yêu cầu #{id}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<BackIcon />}
          onClick={() => navigate('/officer/requests/pending')}
        >
          Quay lại danh sách
        </Button>
      </Box>
      
      {/* Request Status Stepper */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={getCurrentStep(request?.status)} alternativeLabel>
          <Step>
            <StepLabel>Tiếp nhận yêu cầu</StepLabel>
          </Step>
          <Step>
            <StepLabel>Đang xử lý</StepLabel>
          </Step>
          <Step>
            <StepLabel>Hoàn thành</StepLabel>
          </Step>
        </Stepper>
      </Paper>
      
      <Grid container spacing={3}>
        {/* Request Information */}
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AssignmentIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" component="h2">
                Thông tin yêu cầu
              </Typography>
              {request?.status && (
                <Box sx={{ ml: 'auto' }}>
                  {getStatusChip(request.status)}
                </Box>
              )}
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <List>
              <ListItem>
                <ListItemIcon>
                  <DescriptionIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Loại yêu cầu" 
                  secondary={request?.type || 'Không xác định'} 
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <PersonIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Người yêu cầu" 
                  secondary={request?.citizen || 'Không xác định'} 
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <CalendarIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Ngày yêu cầu" 
                  secondary={formatDate(request?.date)} 
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <InfoIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Mô tả yêu cầu" 
                  secondary={request?.description || 'Không có mô tả'} 
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        
        {/* Document Preview */}
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Tài liệu đính kèm
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {request?.documents && request.documents.length > 0 ? (
              <List>
                {request.documents.map((doc, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <DescriptionIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={doc.name || `Tài liệu ${index + 1}`} 
                      secondary={doc.description || 'Không có mô tả'} 
                    />
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => window.open(doc.url, '_blank')}
                    >
                      Xem
                    </Button>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary">
                Không có tài liệu đính kèm
              </Typography>
            )}
          </Paper>
        </Grid>
        
        {/* Processing Form */}
        <Grid item xs={12}>
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Xử lý yêu cầu
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Ghi chú xử lý"
                  name="notes"
                  value={processingData.notes}
                  onChange={handleInputChange}
                  disabled={request?.status === 'completed' || request?.status === 'rejected'}
                />
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Box>
                {request?.status === 'pending' && (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AssignmentIcon />}
                    onClick={handleAssignToSelf}
                    disabled={submitting}
                  >
                    {submitting ? <CircularProgress size={24} /> : 'Nhận xử lý'}
                  </Button>
                )}
                
                {request?.status === 'processing' && (
                  <>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CheckIcon />}
                      onClick={() => setOpenApproveDialog(true)}
                      disabled={submitting}
                      sx={{ mr: 1 }}
                    >
                      Phê duyệt
                    </Button>
                    
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<CancelIcon />}
                      onClick={() => setOpenRejectDialog(true)}
                      disabled={submitting}
                    >
                      Từ chối
                    </Button>
                  </>
                )}
              </Box>
              
              {(request?.status === 'processing') && (
                <Button
                  variant="outlined"
                  startIcon={<SaveIcon />}
                  onClick={handleProcessRequest}
                  disabled={submitting}
                >
                  {submitting ? <CircularProgress size={24} /> : 'Lưu ghi chú'}
                </Button>
              )}
            </Box>
          </Paper>
        </Grid>
        
        {/* Request History */}
        <Grid item xs={12}>
          <Paper elevation={1} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <HistoryIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" component="h2">
                Lịch sử xử lý
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {request?.history && request.history.length > 0 ? (
              <List>
                {request.history.map((item, index) => (
                  <ListItem key={index} divider={index < request.history.length - 1}>
                    <ListItemText 
                      primary={item.action} 
                      secondary={
                        <>
                          <Typography variant="body2" component="span">
                            {formatDate(item.date)}
                          </Typography>
                          {item.notes && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              {item.notes}
                            </Typography>
                          )}
                        </>
                      } 
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary">
                Chưa có lịch sử xử lý
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Reject Dialog */}
      <Dialog
        open={openRejectDialog}
        onClose={() => setOpenRejectDialog(false)}
        aria-labelledby="reject-dialog-title"
      >
        <DialogTitle id="reject-dialog-title">
          Xác nhận từ chối yêu cầu
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Vui lòng nhập lý do từ chối yêu cầu này. Lý do sẽ được hiển thị cho người yêu cầu.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            name="rejectionReason"
            label="Lý do từ chối"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={processingData.rejectionReason}
            onChange={handleInputChange}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRejectDialog(false)} color="inherit">
            Hủy
          </Button>
          <Button 
            onClick={handleRejectRequest} 
            color="error" 
            variant="contained"
            disabled={!processingData.rejectionReason || submitting}
          >
            {submitting ? <CircularProgress size={24} /> : 'Xác nhận từ chối'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Approve Dialog */}
      <Dialog
        open={openApproveDialog}
        onClose={() => setOpenApproveDialog(false)}
        aria-labelledby="approve-dialog-title"
      >
        <DialogTitle id="approve-dialog-title">
          Xác nhận phê duyệt yêu cầu
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn phê duyệt yêu cầu này? Sau khi phê duyệt, trạng thái yêu cầu sẽ được chuyển thành "Hoàn thành".
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenApproveDialog(false)} color="inherit">
            Hủy
          </Button>
          <Button 
            onClick={handleApproveRequest} 
            color="success" 
            variant="contained"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} /> : 'Xác nhận phê duyệt'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProcessRequest; 