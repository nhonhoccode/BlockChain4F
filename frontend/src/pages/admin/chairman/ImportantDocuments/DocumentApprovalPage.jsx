import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Chip,
  Avatar,
  Stack,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  Description as DocumentIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Category as CategoryIcon,
  PriorityHigh as PriorityIcon,
  ThumbUp as ApproveIcon,
  ThumbDown as RejectIcon,
  Check as CheckIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Assignment as AttachmentIcon,
  History as HistoryIcon,
  ArrowBack as BackIcon,
  VerifiedUser as BlockchainIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import chairmanService from '../../../../services/api/chairmanService';
import parse from 'html-react-parser';

/**
 * DocumentApprovalPage Component
 * Hiển thị chi tiết tài liệu cần phê duyệt và các hành động có thể thực hiện
 */
const DocumentApprovalPage = () => {
  const theme = useTheme();
  const { documentId } = useParams();
  const navigate = useNavigate();
  
  // State for document
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for approval/rejection
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // State for snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');
  
  // Fetch document data on component mount
  useEffect(() => {
    fetchDocumentDetails();
  }, [documentId]);
  
  // Function to fetch document details
  const fetchDocumentDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await chairmanService.getImportantDocumentDetails(documentId);
      setDocument(response);
    } catch (err) {
      console.error('Error fetching document details:', err);
      setError('Không thể tải thông tin tài liệu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };
  
  // Format date with time
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Get priority color and label
  const getPriorityInfo = (priority) => {
    switch (priority) {
      case 'high':
        return { color: 'error', label: 'Cao' };
      case 'medium':
        return { color: 'warning', label: 'Trung bình' };
      case 'low':
        return { color: 'info', label: 'Thấp' };
      default:
        return { color: 'default', label: priority };
    }
  };
  
  // Get status color and label
  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return { color: 'warning', label: 'Chờ phê duyệt' };
      case 'approved':
        return { color: 'success', label: 'Đã phê duyệt' };
      case 'rejected':
        return { color: 'error', label: 'Đã từ chối' };
      default:
        return { color: 'default', label: status };
    }
  };
  
  // Handle approve document
  const handleApproveDocument = async () => {
    setSubmitting(true);
    setApproveDialogOpen(false);
    
    try {
      const response = await chairmanService.approveDocument(
        documentId, 
        { notes: approvalNotes }
      );
      
      if (response && response.success) {
        setSnackbarMessage('Đã phê duyệt tài liệu thành công');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        
        // Refresh document details
        fetchDocumentDetails();
      } else {
        setSnackbarMessage('Có lỗi xảy ra khi phê duyệt tài liệu');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error approving document:', error);
      setSnackbarMessage('Không thể phê duyệt tài liệu. Vui lòng thử lại sau.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle reject document
  const handleRejectDocument = async () => {
    if (!rejectionReason) return;
    
    setSubmitting(true);
    setRejectDialogOpen(false);
    
    try {
      const response = await chairmanService.rejectDocument(
        documentId, 
        { 
          reason: rejectionReason,
          notes: 'Tài liệu không đáp ứng yêu cầu' 
        }
      );
      
      if (response && response.success) {
        setSnackbarMessage('Đã từ chối tài liệu');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        
        // Refresh document details
        fetchDocumentDetails();
      } else {
        setSnackbarMessage('Có lỗi xảy ra khi từ chối tài liệu');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error rejecting document:', error);
      setSnackbarMessage('Không thể từ chối tài liệu. Vui lòng thử lại sau.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle go back
  const handleGoBack = () => {
    navigate('/admin/chairman/important-documents');
  };
  
  // Render loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 120px)' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={fetchDocumentDetails}>
              Thử lại
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }
  
  // If document doesn't exist
  if (!document) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="warning"
          action={
            <Button color="inherit" size="small" onClick={handleGoBack}>
              Quay lại
            </Button>
          }
        >
          Không tìm thấy tài liệu với ID: {documentId}
        </Alert>
      </Box>
    );
  }
  
  const priorityInfo = getPriorityInfo(document.priority);
  const statusInfo = getStatusInfo(document.status);
  
  return (
    <Box sx={{ p: 3 }}>
      {/* Page header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <IconButton
          onClick={handleGoBack}
          sx={{ mr: 2 }}
          color="primary"
        >
          <BackIcon />
        </IconButton>
        
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" color="primary.main">
            Chi tiết tài liệu
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Xem và phê duyệt tài liệu quan trọng
          </Typography>
        </Box>
      </Box>
      
      {/* Document actions */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2, boxShadow: theme.shadows[2] }}>
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'center' }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DocumentIcon sx={{ mr: 2, color: 'primary.main', fontSize: 28 }} />
            <Box>
              <Typography variant="h6" fontWeight="medium">{document.title}</Typography>
              <Typography variant="caption" color="text.secondary">
                {document.document_number} • {document.document_type}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {document.status === 'pending' && (
              <>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<ApproveIcon />}
                  onClick={() => setApproveDialogOpen(true)}
                  disabled={submitting}
                >
                  Phê duyệt
                </Button>
                
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<RejectIcon />}
                  onClick={() => setRejectDialogOpen(true)}
                  disabled={submitting}
                >
                  Từ chối
                </Button>
              </>
            )}
            
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              disabled={submitting}
            >
              Tải xuống
            </Button>
          </Box>
        </Stack>
      </Paper>
      
      {/* Document details */}
      <Grid container spacing={3}>
        {/* Left column - Document metadata */}
        <Grid item xs={12} md={4} lg={3}>
          <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[2], height: '100%' }}>
            <CardHeader 
              title="Thông tin tài liệu"
              titleTypographyProps={{ variant: 'subtitle1', fontWeight: 'medium' }}
              sx={{ bgcolor: 'primary.light', color: 'primary.main' }}
            />
            <Divider />
            <CardContent>
              <List disablePadding>
                <ListItem sx={{ px: 0, py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Người gửi"
                    secondary={typeof document.submitted_by === 'object' 
                      ? `${document.submitted_by.name} (${document.submitted_by.position})`
                      : document.submitted_by
                    }
                    primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                    secondaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
                
                <ListItem sx={{ px: 0, py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CalendarIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Ngày gửi"
                    secondary={formatDateTime(document.submitted_date)}
                    primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                    secondaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
                
                <ListItem sx={{ px: 0, py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CategoryIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Danh mục"
                    secondary={document.category}
                    primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                    secondaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
                
                <ListItem sx={{ px: 0, py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <PriorityIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Mức độ ưu tiên"
                    secondary={
                      <Chip 
                        size="small"
                        label={priorityInfo.label}
                        color={priorityInfo.color}
                        variant="outlined"
                      />
                    }
                    primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                  />
                </ListItem>
                
                <Divider sx={{ my: 1 }} />
                
                <ListItem sx={{ px: 0, py: 1 }}>
                  <ListItemText 
                    primary="Trạng thái"
                    secondary={
                      <Chip 
                        size="small"
                        label={statusInfo.label}
                        color={statusInfo.color}
                      />
                    }
                    primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                  />
                </ListItem>
                
                <ListItem sx={{ px: 0, py: 1 }}>
                  <ListItemText 
                    primary="Đã xác thực blockchain"
                    secondary={
                      <Chip 
                        size="small"
                        icon={<BlockchainIcon />}
                        label={document.blockchain_status ? 'Đã xác thực' : 'Chưa xác thực'}
                        color={document.blockchain_status ? 'success' : 'default'}
                        variant={document.blockchain_status ? 'filled' : 'outlined'}
                      />
                    }
                    primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Right column - Document content and attachments */}
        <Grid item xs={12} md={8} lg={9}>
          {/* Document content */}
          <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[2], mb: 3 }}>
            <CardHeader 
              title="Nội dung tài liệu"
              titleTypographyProps={{ variant: 'subtitle1', fontWeight: 'medium' }}
              sx={{ bgcolor: 'primary.light', color: 'primary.main' }}
            />
            <Divider />
            <CardContent>
              <Box sx={{ 
                p: 2, 
                bgcolor: 'background.paper', 
                border: '1px solid', 
                borderColor: 'divider',
                borderRadius: 1,
                '& p': { mt: 0, mb: 2 }
              }}>
                {document.content ? parse(document.content) : (
                  <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                    Không có nội dung để hiển thị
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
          
          {/* Document attachments */}
          <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[2], mb: 3 }}>
            <CardHeader 
              title="Tài liệu đính kèm"
              titleTypographyProps={{ variant: 'subtitle1', fontWeight: 'medium' }}
              sx={{ bgcolor: 'primary.light', color: 'primary.main' }}
              action={
                document.attachments && document.attachments.length > 0 ? (
                  <Tooltip title="Tải tất cả">
                    <IconButton size="small">
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                ) : null
              }
            />
            <Divider />
            <CardContent>
              {document.attachments && document.attachments.length > 0 ? (
                <List disablePadding>
                  {document.attachments.map((attachment, index) => (
                    <ListItem 
                      key={index}
                      divider={index < document.attachments.length - 1}
                      secondaryAction={
                        <IconButton edge="end" size="small">
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      }
                    >
                      <ListItemIcon>
                        <AttachmentIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary={attachment.name}
                        secondary={`${attachment.type.toUpperCase()} • ${attachment.size}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary" align="center" sx={{ py: 2 }}>
                  Không có tài liệu đính kèm
                </Typography>
              )}
            </CardContent>
          </Card>
          
          {/* Document history */}
          <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[2] }}>
            <CardHeader 
              title="Lịch sử tài liệu"
              titleTypographyProps={{ variant: 'subtitle1', fontWeight: 'medium' }}
              sx={{ bgcolor: 'primary.light', color: 'primary.main' }}
              avatar={<HistoryIcon />}
            />
            <Divider />
            <CardContent>
              {document.history && document.history.length > 0 ? (
                <List disablePadding>
                  {document.history.map((item, index) => (
                    <ListItem 
                      key={index}
                      divider={index < document.history.length - 1}
                    >
                      <ListItemText 
                        primary={item.action}
                        secondary={`${item.user} • ${formatDateTime(item.timestamp)}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary" align="center" sx={{ py: 2 }}>
                  Không có lịch sử tài liệu
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Approve document dialog */}
      <Dialog
        open={approveDialogOpen}
        onClose={() => setApproveDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Phê duyệt tài liệu</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Bạn đang phê duyệt tài liệu "{document.title}". 
            Tài liệu được phê duyệt sẽ được công nhận chính thức và có thể được xác thực trên blockchain.
          </DialogContentText>
          
          <TextField
            autoFocus
            label="Ghi chú (tùy chọn)"
            fullWidth
            multiline
            rows={3}
            value={approvalNotes}
            onChange={(e) => setApprovalNotes(e.target.value)}
            placeholder="Nhập ghi chú hoặc lý do phê duyệt..."
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialogOpen(false)}>
            Hủy
          </Button>
          <Button 
            variant="contained" 
            color="success" 
            startIcon={<CheckIcon />}
            onClick={handleApproveDocument}
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} /> : 'Phê duyệt'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Reject document dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Từ chối tài liệu</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Bạn đang từ chối tài liệu "{document.title}". 
            Vui lòng cung cấp lý do từ chối để người gửi có thể hiểu và điều chỉnh.
          </DialogContentText>
          
          <TextField
            autoFocus
            label="Lý do từ chối"
            required
            fullWidth
            multiline
            rows={3}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Nhập lý do từ chối tài liệu này..."
            variant="outlined"
            error={!rejectionReason && rejectDialogOpen}
            helperText={!rejectionReason && rejectDialogOpen ? 'Vui lòng cung cấp lý do từ chối' : ''}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>
            Hủy
          </Button>
          <Button 
            variant="contained" 
            color="error" 
            startIcon={<DeleteIcon />}
            onClick={handleRejectDocument}
            disabled={submitting || !rejectionReason}
          >
            {submitting ? <CircularProgress size={24} /> : 'Từ chối'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DocumentApprovalPage;
