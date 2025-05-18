import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Paper, Grid, Button, Chip, 
  CircularProgress, Divider, Alert, Stack, IconButton, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  CheckCircle as CheckIcon,
  Pending as PendingIcon,
  HourglassEmpty as ProcessingIcon,
  ErrorOutline as ErrorIcon,
  AssignmentTurnedIn as CompleteIcon,
  Cancel as CancelIcon,
  Assignment as RequestIcon,
  Person as PersonIcon,
  Event as DateIcon,
  Note as NoteIcon,
  Timeline as TimelineIcon,
  Refresh as RefreshIcon,
  Print as PrintIcon
} from '@mui/icons-material';

import citizenService from '../../../services/api/citizenService';

const RequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState(null);
  
  const fetchRequestDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Fetching details for request ${id}...`);
      const data = await citizenService.getRequestDetail(id);
      console.log('Request details received:', data);
      
      setRequest(data);
    } catch (err) {
      console.error('Error fetching request details:', err);
      setError('Không thể tải thông tin yêu cầu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (id) {
      fetchRequestDetails();
    }
  }, [id]);
  
  const handleCancelRequest = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy yêu cầu này không?')) {
      return;
    }
    
    try {
      setCancelling(true);
      setCancelError(null);
      
      await citizenService.cancelRequest(id);
      
      // Reload the request details to reflect the cancelled status
      fetchRequestDetails();
    } catch (err) {
      console.error('Error cancelling request:', err);
      setCancelError('Không thể hủy yêu cầu. Vui lòng thử lại sau.');
    } finally {
      setCancelling(false);
    }
  };
  
  const getStatusChip = (status) => {
    switch (status) {
      case 'completed':
        return <Chip label="Hoàn thành" color="success" size="small" icon={<CheckIcon />} />;
      case 'pending':
        return <Chip label="Chờ xử lý" color="warning" size="small" icon={<PendingIcon />} />;
      case 'processing':
        return <Chip label="Đang xử lý" color="info" size="small" icon={<ProcessingIcon />} />;
      case 'rejected':
        return <Chip label="Từ chối" color="error" size="small" icon={<ErrorIcon />} />;
      case 'cancelled':
        return <Chip label="Đã hủy" color="default" size="small" icon={<CancelIcon />} />;
      default:
        return <Chip label={status || 'Không xác định'} color="default" size="small" />;
    }
  };
  
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
  
  const canCancel = (status) => {
    return status === 'pending'; // Only allow cancelling if the request is pending
  };
  
  if (loading) {
    return (
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Đang tải thông tin yêu cầu...
        </Typography>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Button 
          startIcon={<BackIcon />} 
          onClick={() => navigate('/citizen/requests')}
          sx={{ mb: 2 }}
        >
          Quay lại danh sách
        </Button>
        
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
          <Typography variant="h6">Đã xảy ra lỗi</Typography>
          <Typography variant="body1">{error}</Typography>
        </Alert>
      </Box>
    );
  }
  
  if (!request) {
    return (
      <Box sx={{ p: 3 }}>
        <Button 
          startIcon={<BackIcon />} 
          onClick={() => navigate('/citizen/requests')}
          sx={{ mb: 2 }}
        >
          Quay lại danh sách
        </Button>
        
        <Alert severity="warning">
          <Typography variant="h6">Không tìm thấy yêu cầu</Typography>
          <Typography variant="body1">Không tìm thấy thông tin yêu cầu với ID: {id}</Typography>
        </Alert>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button 
          startIcon={<BackIcon />} 
          onClick={() => navigate('/citizen/requests')}
        >
          Quay lại danh sách
        </Button>
        
        <Box>
          {request.status === 'completed' && (
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              sx={{ mr: 1 }}
              onClick={() => {/* Functionality to print document */}}
            >
              In
            </Button>
          )}
          
          {canCancel(request.status) && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<CancelIcon />}
              onClick={handleCancelRequest}
              disabled={cancelling}
            >
              {cancelling ? 'Đang hủy...' : 'Hủy yêu cầu'}
            </Button>
          )}
        </Box>
      </Box>
      
      {cancelError && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          onClose={() => setCancelError(null)}
        >
          {cancelError}
        </Alert>
      )}
      
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Chi tiết yêu cầu
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <RequestIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">
            {request.type}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          {getStatusChip(request.status)}
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Mã yêu cầu
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {request.id}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Ngày tạo yêu cầu
                </Typography>
                <Typography variant="body1">
                  {formatDate(request.requestDate)}
                </Typography>
              </Box>
              
              {request.processingDate && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Ngày bắt đầu xử lý
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(request.processingDate)}
                  </Typography>
                </Box>
              )}
              
              {request.completionDate && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Ngày hoàn thành
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(request.completionDate)}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Ghi chú
                </Typography>
                <Typography variant="body1">
                  {request.notes || 'Không có ghi chú'}
                </Typography>
              </Box>
              
              {request.officer && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Cán bộ xử lý
                  </Typography>
                  <Typography variant="body1">
                    {request.officer}
                  </Typography>
                </Box>
              )}
              
              {request.rejectionReason && (
                <Box>
                  <Typography variant="body2" color="text.secondary" color="error.main">
                    Lý do từ chối
                  </Typography>
                  <Typography variant="body1" color="error.main">
                    {request.rejectionReason}
                  </Typography>
                </Box>
              )}
              
              {request.documentId && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Mã giấy tờ đã cấp
                  </Typography>
                  <Typography variant="body1">
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => navigate(`/citizen/documents/${request.documentId}`)}
                    >
                      {request.documentId}
                    </Button>
                  </Typography>
                </Box>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Request data */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Thông tin yêu cầu
        </Typography>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Trường thông tin</TableCell>
                <TableCell>Giá trị</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {request.data && Object.entries(request.data).map(([key, value]) => (
                <TableRow key={key}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {key}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {typeof value === 'object' ? JSON.stringify(value) : value.toString()}
                  </TableCell>
                </TableRow>
              ))}
              
              {(!request.data || Object.keys(request.data).length === 0) && (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    <Typography variant="body2" color="text.secondary">
                      Không có dữ liệu chi tiết
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      {/* Timeline / History */}
      {request.timeline && request.timeline.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TimelineIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">
              Lịch sử yêu cầu
            </Typography>
          </Box>
          
          <Box sx={{ pl: 2 }}>
            {request.timeline.map((event, index) => (
              <Box key={index} sx={{ 
                position: 'relative', 
                pb: index === request.timeline.length - 1 ? 0 : 4,
                borderLeft: '2px solid',
                borderColor: 'divider',
                pl: 3
              }}>
                <Box sx={{ 
                  position: 'absolute',
                  left: -8, 
                  width: 16, 
                  height: 16, 
                  bgcolor: event.type === 'completed' ? 'success.main' : 
                          event.type === 'rejected' ? 'error.main' : 
                          event.type === 'processing' ? 'info.main' : 'warning.main',
                  borderRadius: '50%'
                }} />
                
                <Typography variant="body1" fontWeight="medium">
                  {event.title}
                </Typography>
                
                <Typography variant="body2" color="text.secondary">
                  {formatDate(event.time)}
                </Typography>
                
                {event.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {event.description}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default RequestDetail; 