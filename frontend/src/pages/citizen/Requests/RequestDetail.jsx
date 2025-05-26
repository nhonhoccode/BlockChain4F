import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Paper, Grid, Button, Chip, 
  CircularProgress, Divider, Alert, Stack, IconButton, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Card, CardContent, CardHeader, Avatar, Tooltip, Badge, 
  List, ListItem, ListItemIcon, ListItemText, Stepper, Step, StepLabel,
  Tab, Tabs, Accordion, AccordionSummary, AccordionDetails, Link
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
  Print as PrintIcon,
  Description as DocumentIcon,
  AttachFile as AttachmentIcon,
  Info as InfoIcon,
  StarRate as PriorityIcon,
  CalendarToday as DueDateIcon,
  ExpandMore as ExpandMoreIcon,
  Download as DownloadIcon,
  VerifiedUser as VerifiedIcon,
  Security as SecurityIcon
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
  const [activeTab, setActiveTab] = useState(0);
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const [documentTypeDetails, setDocumentTypeDetails] = useState(null);
  
  const fetchRequestDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Fetching details for request ${id}...`);
      const data = await citizenService.getRequestDetails(id);
      console.log('Request details received:', data);
      
      setRequest(data);
      
      // Extract and set document type details if available
      if (data.document_type_details) {
        setDocumentTypeDetails(data.document_type_details);
      }
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
  
  // Handle tab changes
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Format priority display
  const getPriorityChip = (priority) => {
    const priorityMap = {
      'low': { color: 'success', label: 'Thấp' },
      'normal': { color: 'info', label: 'Thông thường' },
      'high': { color: 'warning', label: 'Cao' },
      'urgent': { color: 'error', label: 'Khẩn cấp' },
    };
    
    const priorityInfo = priorityMap[priority] || { color: 'default', label: priority || 'Bình thường' };
    
    return (
      <Chip 
        label={priorityInfo.label} 
        color={priorityInfo.color} 
        size="small" 
        icon={<PriorityIcon />} 
      />
    );
  };
  
  // Download attachment
  const handleDownloadAttachment = (attachment) => {
    // Implementation for downloading attachment
    const downloadUrl = attachment.file_url || attachment.file;
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    }
  };
  
  // Preview attachment
  const handlePreviewAttachment = (attachment) => {
    setAttachmentPreview(attachment);
  };
  
  // Close preview
  const handleClosePreview = () => {
    setAttachmentPreview(null);
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
      {/* Header section with actions */}
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
      
      {/* Request title and status card */}
      <Card 
        elevation={3} 
        sx={{ 
          mb: 3, 
          borderRadius: 2,
          background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
          color: 'white'
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Avatar sx={{ bgcolor: 'white', color: 'primary.main', width: 56, height: 56 }}>
                <RequestIcon fontSize="large" />
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {request.title || request.type}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Chip 
                  label={request.reference_number} 
                  color="default" 
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
                {getStatusChip(request.status)}
                {request.priority && getPriorityChip(request.priority)}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {/* Tabs for different sections */}
      <Box sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Thông tin chung" icon={<InfoIcon />} iconPosition="start" />
          <Tab 
            label={
              <Badge 
                badgeContent={request.attachments?.length || 0} 
                color="primary"
                showZero={false}
              >
                Tài liệu đính kèm
              </Badge>
            } 
            icon={<AttachmentIcon />} 
            iconPosition="start" 
          />
          <Tab label="Trạng thái xử lý" icon={<TimelineIcon />} iconPosition="start" />
          <Tab label="Thông tin thủ tục" icon={<DocumentIcon />} iconPosition="start" />
        </Tabs>
      </Box>
      
      {/* Tab Content */}
      {activeTab === 0 && (
        // General Information Tab
        <Grid container spacing={3}>
          {/* Left column */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, mb: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom fontWeight="medium" color="primary">
                Thông tin cơ bản
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Stack spacing={3}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Mã yêu cầu</Typography>
                  <Typography variant="body1">{request.id}</Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Số tham chiếu</Typography>
                  <Typography variant="body1">{request.reference_number}</Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Loại thủ tục</Typography>
                  <Typography variant="body1">{request.type}</Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Độ ưu tiên</Typography>
                  <Box>{getPriorityChip(request.priority)}</Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Mô tả</Typography>
                  <Typography variant="body1">{request.description || 'Không có mô tả'}</Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
          
          {/* Right column */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, mb: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom fontWeight="medium" color="primary">
                Thông tin xử lý
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Stack spacing={3}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Ngày tạo yêu cầu</Typography>
                  <Typography variant="body1">{formatDate(request.requestDate)}</Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Ngày cập nhật</Typography>
                  <Typography variant="body1">{formatDate(request.updatedAt)}</Typography>
                </Box>
                
                {request.submitted_date && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Ngày nộp</Typography>
                    <Typography variant="body1">{formatDate(request.submitted_date)}</Typography>
                  </Box>
                )}
                
                {request.due_date && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Ngày đến hạn</Typography>
                    <Typography variant="body1" color={new Date(request.due_date) < new Date() ? 'error.main' : 'inherit'}>
                      {formatDate(request.due_date)}
                    </Typography>
                  </Box>
                )}
                
                {request.completed_date && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Ngày hoàn thành</Typography>
                    <Typography variant="body1">{formatDate(request.completed_date)}</Typography>
                  </Box>
                )}
                
                {request.assignedTo && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Cán bộ xử lý</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: 'primary.main' }}>
                        {request.assignedTo.first_name?.charAt(0) || 'O'}
                      </Avatar>
                      <Typography>
                        {`${request.assignedTo.first_name || ''} ${request.assignedTo.last_name || ''}`}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Stack>
            </Paper>
          </Grid>
          
          {/* Additional information */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="medium" color="primary">
                Thông tin bổ sung
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={3}>
                {request.comments && (
                  <Grid item xs={12} md={6}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Ghi chú</Typography>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{request.comments}</Typography>
                    </Box>
                  </Grid>
                )}
                
                {request.rejection_reason && (
                  <Grid item xs={12} md={6}>
                    <Box>
                      <Typography variant="subtitle2" color="error">Lý do từ chối</Typography>
                      <Typography variant="body1" color="error.main" sx={{ whiteSpace: 'pre-wrap' }}>
                        {request.rejection_reason}
                      </Typography>
                    </Box>
                  </Grid>
                )}
                
                {request.additional_info_request && (
                  <Grid item xs={12} md={6}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Yêu cầu bổ sung thông tin</Typography>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {request.additional_info_request}
                      </Typography>
                    </Box>
                  </Grid>
                )}
                
                {request.additional_info_response && (
                  <Grid item xs={12} md={6}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Phản hồi bổ sung</Typography>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {request.additional_info_response}
                      </Typography>
                    </Box>
                  </Grid>
                )}
                
                {(!request.comments && !request.rejection_reason && 
                  !request.additional_info_request && !request.additional_info_response) && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" align="center">
                      Không có thông tin bổ sung
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}
      
      {activeTab === 1 && (
        // Attachments Tab
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight="medium" color="primary">
            Tài liệu đính kèm
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          {request.attachments && request.attachments.length > 0 ? (
            <Grid container spacing={2}>
              {request.attachments.map((attachment, index) => (
                <Grid item xs={12} sm={6} md={4} key={attachment.id || index}>
                  <Card 
                    elevation={2} 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6
                      }
                    }}
                  >
                    <CardHeader
                      avatar={
                        <Avatar sx={{ bgcolor: attachment.is_image ? 'success.main' : attachment.is_pdf ? 'error.main' : 'info.main' }}>
                          <AttachmentIcon />
                        </Avatar>
                      }
                      title={
                        <Tooltip title={attachment.name || 'Tài liệu đính kèm'}>
                          <Typography noWrap>{attachment.name || 'Tài liệu đính kèm'}</Typography>
                        </Tooltip>
                      }
                      subheader={`Tải lên: ${formatDate(attachment.created_at)}`}
                      titleTypographyProps={{ variant: 'subtitle1', noWrap: true }}
                      subheaderTypographyProps={{ variant: 'caption' }}
                    />
                    <CardContent sx={{ pt: 0, flexGrow: 1 }}>
                      {attachment.description && (
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {attachment.description}
                        </Typography>
                      )}
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" display="block">
                          Loại: {attachment.attachment_type_display || attachment.attachment_type || 'Không xác định'}
                        </Typography>
                        {attachment.file_size && (
                          <Typography variant="caption" display="block">
                            Kích thước: {(attachment.file_size / 1024).toFixed(2)} KB
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                    <Divider />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1 }}>
                      <Button 
                        size="small" 
                        startIcon={<DownloadIcon />}
                        onClick={() => handleDownloadAttachment(attachment)}
                      >
                        Tải xuống
                      </Button>
                      {(attachment.is_image || attachment.is_pdf) && (
                        <Button 
                          size="small" 
                          color="primary"
                          onClick={() => handlePreviewAttachment(attachment)}
                        >
                          Xem trước
                        </Button>
                      )}
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <AttachmentIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Không có tài liệu đính kèm
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Yêu cầu này chưa có tài liệu nào được đính kèm
              </Typography>
            </Box>
          )}
        </Paper>
      )}
      
      {activeTab === 2 && (
        // Tracking Status Tab
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight="medium" color="primary">
            Tiến trình xử lý
          </Typography>
          <Divider sx={{ mb: 4 }} />
          
          {request.trackingEvents && request.trackingEvents.length > 0 ? (
            <Box sx={{ position: 'relative', ml: 2 }}>
              {request.trackingEvents.map((event, index) => (
                <Box key={index} sx={{ 
                  position: 'relative', 
                  pb: 4,
                  pl: 4,
                  borderLeft: '2px solid',
                  borderColor: 'divider',
                  '&:last-child': {
                    pb: 0,
                    borderLeft: 'none'
                  }
                }}>
                  <Box sx={{ 
                    position: 'absolute',
                    left: -10, 
                    top: 0,
                    width: 20, 
                    height: 20, 
                    bgcolor: 
                      event.status === 'completed' ? 'success.main' : 
                      event.status === 'rejected' ? 'error.main' : 
                      event.status === 'processing' ? 'info.main' : 
                      event.status === 'created' ? 'warning.main' : 'grey.400',
                    borderRadius: '50%',
                    border: '3px solid white',
                    boxShadow: 1,
                    zIndex: 1
                  }} />
                  
                  <Paper 
                    elevation={2} 
                    sx={{ 
                      p: 2, 
                      borderRadius: 2,
                      backgroundColor: 
                        event.status === 'completed' ? 'success.50' : 
                        event.status === 'rejected' ? 'error.50' : 
                        event.status === 'processing' ? 'info.50' : 
                        'background.paper'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, flexWrap: 'wrap' }}>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {event.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(event.timestamp)}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary">
                      Người thực hiện: {event.actor}
                    </Typography>
                  </Paper>
                </Box>
              ))}
            </Box>
          ) : (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <TimelineIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Không có thông tin theo dõi
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Yêu cầu này chưa có thông tin theo dõi quá trình xử lý
              </Typography>
            </Box>
          )}
        </Paper>
      )}
      
      {activeTab === 3 && (
        // Document Type Information Tab
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight="medium" color="primary">
            Thông tin thủ tục hành chính
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          {documentTypeDetails ? (
            <Box>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Tên thủ tục</Typography>
                  <Typography variant="body1">{documentTypeDetails.name}</Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Mã thủ tục</Typography>
                  <Typography variant="body1">{documentTypeDetails.code}</Typography>
                </Grid>
                
                {documentTypeDetails.department && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Đơn vị thực hiện</Typography>
                    <Typography variant="body1">{documentTypeDetails.department}</Typography>
                  </Grid>
                )}
                
                {documentTypeDetails.processing_time && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Thời gian xử lý</Typography>
                    <Typography variant="body1">{documentTypeDetails.processing_time}</Typography>
                  </Grid>
                )}
                
                {documentTypeDetails.fee && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Phí/Lệ phí</Typography>
                    <Typography variant="body1">{documentTypeDetails.fee}</Typography>
                  </Grid>
                )}
              </Grid>
              
              {documentTypeDetails.description && (
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1" fontWeight="medium">Mô tả thủ tục</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {documentTypeDetails.description}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              )}
              
              {documentTypeDetails.required_documents && (
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1" fontWeight="medium">Giấy tờ cần thiết</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List dense>
                      {Array.isArray(documentTypeDetails.required_documents) ? 
                        documentTypeDetails.required_documents.map((doc, index) => (
                          <ListItem key={index}>
                            <ListItemIcon><DocumentIcon color="primary" /></ListItemIcon>
                            <ListItemText primary={doc} />
                          </ListItem>
                        )) : 
                        <Typography variant="body2">{documentTypeDetails.required_documents}</Typography>
                      }
                    </List>
                  </AccordionDetails>
                </Accordion>
              )}
              
              {documentTypeDetails.process_steps && (
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1" fontWeight="medium">Quy trình thực hiện</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {Array.isArray(documentTypeDetails.process_steps) ? (
                      <Stepper orientation="vertical" activeStep={-1}>
                        {documentTypeDetails.process_steps.map((step, index) => (
                          <Step key={index} completed={false}>
                            <StepLabel>{step}</StepLabel>
                          </Step>
                        ))}
                      </Stepper>
                    ) : (
                      <Typography variant="body2">{documentTypeDetails.process_steps}</Typography>
                    )}
                  </AccordionDetails>
                </Accordion>
              )}
              
              {documentTypeDetails.legal_basis && (
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1" fontWeight="medium">Căn cứ pháp lý</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {documentTypeDetails.legal_basis}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              )}
            </Box>
          ) : (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <DocumentIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Không có thông tin thủ tục
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Thông tin chi tiết về thủ tục hành chính này chưa được cung cấp
              </Typography>
            </Box>
          )}
        </Paper>
      )}
      
      {/* Attachment Preview Dialog - could be implemented with a modal or dialog component */}
      {attachmentPreview && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ position: 'relative', width: '90%', height: '90%', bgcolor: 'white', borderRadius: 1, overflow: 'hidden' }}>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6">{attachmentPreview.name}</Typography>
              <IconButton onClick={handleClosePreview}>
                <CancelIcon />
              </IconButton>
            </Box>
            <Box sx={{ height: 'calc(100% - 64px)', overflow: 'auto', p: 2 }}>
              {attachmentPreview.is_image ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', height: '100%' }}>
                  <img 
                    src={attachmentPreview.file_url || attachmentPreview.file} 
                    alt={attachmentPreview.name} 
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                  />
                </Box>
              ) : attachmentPreview.is_pdf ? (
                <iframe 
                  src={`${attachmentPreview.file_url || attachmentPreview.file}#view=FitH`}
                  title={attachmentPreview.name}
                  width="100%"
                  height="100%"
                  style={{ border: 'none' }}
                />
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <DocumentIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6">Không thể xem trước tệp này</Typography>
                  <Button 
                    variant="contained" 
                    startIcon={<DownloadIcon />} 
                    sx={{ mt: 2 }}
                    onClick={() => handleDownloadAttachment(attachmentPreview)}
                  >
                    Tải xuống để xem
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      )}
      
      {/* Keep the Request data section as is */}
      {request.data && Object.keys(request.data).length > 0 && (
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
                {Object.entries(request.data).map(([key, value]) => (
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
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
};

export default RequestDetail; 