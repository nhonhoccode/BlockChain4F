import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Chip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Divider,
  Tabs,
  Tab,
  Snackbar,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardActionArea,
  CardActions,
  Grid,
  Stack,
  useTheme,
  Badge,
  CardMedia
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  ThumbUp as ApproveIcon,
  ThumbDown as RejectIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  Description as DescriptionIcon,
  PriorityHigh as PriorityHighIcon,
  FiberManualRecord as StatusIcon,
  Check as CheckIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  VerifiedUser as BlockchainIcon,
  Article as ArticleIcon,
  Home as HomeIcon,
  AccountBalance as AccountBalanceIcon,
  People as PeopleIcon,
  Build as BuildIcon,
  Email as EmailIcon,
  Public as PublicIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import chairmanService from '../../../../services/api/chairmanService';

/**
 * ImportantDocuments Component
 * Hiển thị và quản lý danh sách tài liệu quan trọng cần phê duyệt bởi chủ tịch xã
 */
const ImportantDocuments = () => {
  const theme = useTheme();
  
  // State for documents
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [tabValue, setTabValue] = useState(0);
  
  // State for menu and dialogs
  const [anchorEl, setAnchorEl] = useState(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  
  // State for snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');
  
  // Define category tabs
  const categories = [
    { id: 0, label: 'Tất cả', icon: <DescriptionIcon />, value: '' },
    { id: 1, label: 'Đất đai', icon: <HomeIcon />, value: 'đất đai' },
    { id: 2, label: 'Hộ tịch', icon: <PeopleIcon />, value: 'hộ tịch' },
    { id: 3, label: 'Xây dựng', icon: <BuildIcon />, value: 'xây dựng' },
    { id: 4, label: 'Văn thư', icon: <EmailIcon />, value: 'văn thư' },
    { id: 5, label: 'Dịch vụ công', icon: <PublicIcon />, value: 'dịch vụ công' }
  ];
  
  // Fetch documents data on component mount and when filters change
  useEffect(() => {
    fetchDocuments();
  }, [statusFilter, tabValue]);
  
  // Filter documents when search term changes
  useEffect(() => {
    if (documents.length > 0) {
      let filtered = documents;
      
      // Filter by search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(
          doc => doc.title.toLowerCase().includes(term) || 
                 doc.document_number.toLowerCase().includes(term) ||
                 doc.document_type.toLowerCase().includes(term) ||
                 doc.submitted_by.toLowerCase().includes(term)
        );
      }
      
      // Filter by category tab
      if (tabValue > 0) {
        const categoryValue = categories[tabValue].value;
        filtered = filtered.filter(doc => 
          doc.category && doc.category.toLowerCase().includes(categoryValue)
        );
      }
      
      setFilteredDocuments(filtered);
    }
  }, [searchTerm, documents, tabValue]);
  
  // Function to fetch documents
  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Prepare filters
      const filters = {
        status: statusFilter
      };
      
      console.log('Fetching important documents with filters:', filters);
      
      // Call API
      const response = await chairmanService.getImportantDocuments(filters);
      
      // Process response
      if (response && response.results) {
        setDocuments(response.results);
        setFilteredDocuments(response.results);
      } else if (Array.isArray(response)) {
        setDocuments(response);
        setFilteredDocuments(response);
      } else {
        setError('Định dạng dữ liệu không hợp lệ');
      }
    } catch (err) {
      console.error('Error fetching important documents:', err);
      setError('Không thể tải danh sách tài liệu. Vui lòng thử lại sau.');
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
  
  // Get document icon based on document type
  const getDocumentIcon = (type, category) => {
    // Match by document type
    if (type) {
      const typeLC = type.toLowerCase();
      if (typeLC.includes('quyết định') || typeLC.includes('nghị quyết')) 
        return <ArticleIcon color="primary" />;
      if (typeLC.includes('giấy chứng nhận') || typeLC.includes('giấy phép')) 
        return <AccountBalanceIcon color="primary" />;
    }
    
    // Fallback to category
    if (category) {
      const categoryLC = category.toLowerCase();
      if (categoryLC.includes('đất đai')) return <HomeIcon color="primary" />;
      if (categoryLC.includes('xây dựng')) return <BuildIcon color="primary" />;
      if (categoryLC.includes('hộ tịch')) return <PeopleIcon color="primary" />;
      if (categoryLC.includes('văn thư')) return <EmailIcon color="primary" />;
    }
    
    // Default icon
    return <DescriptionIcon color="primary" />;
  };
  
  // Get file type color based on extension
  const getFileTypeColor = (fileName) => {
    if (!fileName) return theme.palette.grey[500];
    
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf':
        return '#F40F02';
      case 'doc':
      case 'docx':
        return '#2A5699';
      case 'xls':
      case 'xlsx':
        return '#1D6F42';
      case 'ppt':
      case 'pptx':
        return '#D24726';
      default:
        return theme.palette.grey[500];
    }
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle menu open
  const handleMenuOpen = (event, document) => {
    setAnchorEl(event.currentTarget);
    setSelectedDocument(document);
  };
  
  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Handle approve button click
  const handleApproveButtonClick = (document) => {
    setSelectedDocument(document);
    setApprovalNotes('');
    setApproveDialogOpen(true);
  };
  
  // Handle reject button click
  const handleRejectButtonClick = (document) => {
    setSelectedDocument(document);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };
  
  // Handle approve document
  const handleApproveDocument = async () => {
    if (!selectedDocument) return;
    
    setLoading(true);
    setApproveDialogOpen(false);
    
    try {
      const response = await chairmanService.approveDocument(
        selectedDocument.id, 
        { notes: approvalNotes }
      );
      
      if (response && response.message) {
        setSnackbarMessage(`Đã phê duyệt tài liệu "${selectedDocument.title}"`);
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        
        // Refresh document list
        fetchDocuments();
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
      setLoading(false);
    }
  };
  
  // Handle reject document
  const handleRejectDocument = async () => {
    if (!selectedDocument) return;
    
    setLoading(true);
    setRejectDialogOpen(false);
    
    try {
      const response = await chairmanService.rejectDocument(
        selectedDocument.id, 
        { 
          reason: rejectionReason,
          notes: 'Tài liệu không đáp ứng yêu cầu' 
        }
      );
      
      if (response && response.message) {
        setSnackbarMessage(`Đã từ chối tài liệu "${selectedDocument.title}"`);
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        
        // Refresh document list
        fetchDocuments();
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
      setLoading(false);
    }
  };
  
  // Render loading state
  if (loading && documents.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 120px)' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Render error state
  if (error && documents.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={fetchDocuments}>
              Thử lại
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      {/* Page header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" color="primary.main">
          Quản lý tài liệu quan trọng
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Xem xét và phê duyệt các tài liệu quan trọng
        </Typography>
      </Box>
      
      {/* Search bar */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2, boxShadow: theme.shadows[2] }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              placeholder="Tìm kiếm tài liệu..."
              variant="outlined"
              size="small"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={8}>
            <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 1 }}>
              <Tooltip title="Làm mới">
                <IconButton onClick={fetchDocuments} color="primary">
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Bộ lọc nâng cao">
                <IconButton color="primary">
                  <FilterIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Category tabs */}
      <Paper sx={{ mb: 3, borderRadius: 2, boxShadow: theme.shadows[2], overflow: 'hidden' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            bgcolor: 'background.paper',
            '& .MuiTab-root': {
              minHeight: 64,
              textTransform: 'none',
              fontSize: '0.9rem',
              fontWeight: 'medium'
            }
          }}
        >
          {categories.map((category) => (
            <Tab 
              key={category.id} 
              label={category.label} 
              icon={category.icon} 
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Paper>
      
      {/* Documents grid */}
      {filteredDocuments.length > 0 ? (
        <Grid container spacing={3}>
          {filteredDocuments.map((document) => {
            const priorityInfo = getPriorityInfo(document.priority);
            const statusInfo = getStatusInfo(document.status);
            const documentIcon = getDocumentIcon(document.document_type, document.category);
            
            return (
              <Grid item xs={12} sm={6} md={4} key={document.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    borderRadius: 2,
                    boxShadow: theme.shadows[2],
                    position: 'relative',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[4],
                    }
                  }}
                >
                  {/* Priority badge */}
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      top: 12, 
                      right: 12, 
                      zIndex: 1 
                    }}
                  >
                    <Chip
                      size="small"
                      label={priorityInfo.label}
                      color={priorityInfo.color}
                      variant="outlined"
                    />
                  </Box>
                  
                  {/* Card header with document type icon */}
                  <CardMedia
                    sx={{
                      height: 80,
                      bgcolor: 'primary.light',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {document.document_type === 'PDF' ? (
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: '#F40F02',
                          color: 'white',
                          borderRadius: 1,
                          fontSize: '1.2rem',
                          fontWeight: 'bold'
                        }}
                      >
                        PDF
                      </Box>
                    ) : document.document_type === 'DOCX' ? (
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: '#2A5699',
                          color: 'white',
                          borderRadius: 1,
                          fontSize: '1rem',
                          fontWeight: 'bold'
                        }}
                      >
                        DOCX
                      </Box>
                    ) : (
                      <Box sx={{ transform: 'scale(2.0)' }}>
                        {documentIcon}
                      </Box>
                    )}
                  </CardMedia>
                  
                  <CardContent sx={{ flexGrow: 1, pt: 2 }}>
                    <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                      <Chip 
                        size="small"
                        label={statusInfo.label}
                        color={statusInfo.color}
                      />
                      
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(document.submitted_date)}
                      </Typography>
                    </Box>
                    
                    <Typography 
                      variant="subtitle1" 
                      component="h3" 
                      fontWeight="medium"
                      sx={{ 
                        mb: 1,
                        height: 48,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}
                    >
                      {document.title}
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        mb: 1,
                        height: 60,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical'
                      }}
                    >
                      {document.description || 'Không có mô tả'}
                    </Typography>
                    
                    <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                        <ArticleIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                        {document.document_number}
                      </Typography>
                    </Stack>
                    
                    {document.attachments > 0 && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Badge badgeContent={document.attachments} color="primary" sx={{ mr: 1 }}>
                          <AttachmentIcon fontSize="small" color="action" />
                        </Badge>
                        <Typography variant="caption" color="text.secondary">
                          {document.attachments} tệp đính kèm
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                  
                  <Divider />
                  
                  <CardActions sx={{ justifyContent: 'space-between', p: 1.5 }}>
                    <Button
                      component={Link}
                      to={`/admin/chairman/important-documents/${document.id}`}
                      size="small"
                      color="primary"
                      startIcon={<ViewIcon />}
                    >
                      Xem chi tiết
                    </Button>
                    
                    {document.status === 'pending' && (
                      <Box>
                        <IconButton 
                          size="small" 
                          color="success"
                          onClick={() => handleApproveButtonClick(document)}
                        >
                          <ApproveIcon fontSize="small" />
                        </IconButton>
                        
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleRejectButtonClick(document)}
                        >
                          <RejectIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2, boxShadow: theme.shadows[2] }}>
          <DescriptionIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Không tìm thấy tài liệu nào
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Không có tài liệu nào phù hợp với các bộ lọc hiện tại
          </Typography>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />}
            onClick={() => {
              setSearchTerm('');
              setTabValue(0);
              fetchDocuments();
            }}
          >
            Làm mới bộ lọc
          </Button>
        </Paper>
      )}
      
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
            Bạn đang phê duyệt tài liệu "{selectedDocument?.title}". 
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
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Phê duyệt'}
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
            Bạn đang từ chối tài liệu "{selectedDocument?.title}". 
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
            disabled={loading || !rejectionReason}
          >
            {loading ? <CircularProgress size={24} /> : 'Từ chối'}
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

export default ImportantDocuments;
