import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  CardMedia,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Divider,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  useTheme
} from '@mui/material';
import {
  Search as SearchIcon,
  CloudUpload as UploadIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Description as DescriptionIcon,
  Assignment as AssignmentIcon,
  AttachFile as AttachFileIcon,
  VerifiedUser as VerifiedUserIcon,
  Business as BusinessIcon,
  Home as HomeIcon,
  ThumbUp as ApproveIcon,
  ThumbDown as RejectIcon,
  Visibility as ViewIcon,
  Check as CheckIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  Email as EmailIcon,
  Public as PublicIcon,
  Article as ArticleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import chairmanService from '../../../../services/api/chairmanService';

/**
 * DocumentManagement Component - Displays important documents for Chairman
 */
const DocumentManagement = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // State for documents
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  
  // State for dialogs
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  
  // State for snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');
  
  // Mock data for documents
  const mockDocuments = [
    {
      id: 'doc1',
      title: 'Nghị quyết số 15/NQ-CP về quản lý đất đai',
      category: 'land',
      department: 'Phòng Địa chính',
      createdBy: 'Nguyễn Văn A',
      createdAt: '2023-05-10T09:00:00Z',
      updatedAt: '2023-05-10T09:00:00Z',
      status: 'active',
      verified: true,
      importance: 'high',
      fileType: 'pdf',
      fileSize: '1.2 MB',
      downloads: 45,
      views: 120,
      thumbnail: '/static/images/documents/land.jpg',
      description: 'Nghị quyết về các vấn đề liên quan đến quản lý đất đai, cấp giấy chứng nhận quyền sử dụng đất và các thủ tục hành chính liên quan.'
    },
    {
      id: 'doc2',
      title: 'Quy trình xử lý hồ sơ hộ tịch',
      category: 'civil',
      department: 'Phòng Tư pháp',
      createdBy: 'Trần Thị B',
      createdAt: '2023-04-15T10:30:00Z',
      updatedAt: '2023-05-05T14:30:00Z',
      status: 'active',
      verified: true,
      importance: 'medium',
      fileType: 'docx',
      fileSize: '850 KB',
      downloads: 32,
      views: 87,
      thumbnail: '/static/images/documents/civil.jpg',
      description: 'Tài liệu hướng dẫn quy trình xử lý các hồ sơ hộ tịch bao gồm đăng ký khai sinh, khai tử, kết hôn và các vấn đề liên quan.'
    },
    {
      id: 'doc3',
      title: 'Hướng dẫn thực hiện công tác văn thư lưu trữ',
      category: 'archive',
      department: 'Phòng Văn thư',
      createdBy: 'Lê Văn C',
      createdAt: '2023-03-20T08:45:00Z',
      updatedAt: '2023-03-20T08:45:00Z',
      status: 'active',
      verified: true,
      importance: 'medium',
      fileType: 'pdf',
      fileSize: '1.5 MB',
      downloads: 28,
      views: 65,
      thumbnail: '/static/images/documents/archive.jpg',
      description: 'Tài liệu hướng dẫn thực hiện công tác văn thư lưu trữ, quy trình tiếp nhận, xử lý, lưu trữ và quản lý văn bản, tài liệu.'
    },
    {
      id: 'doc4',
      title: 'Quy định về cấp phép xây dựng',
      category: 'construction',
      department: 'Phòng Địa chính',
      createdBy: 'Phạm Thị D',
      createdAt: '2023-05-02T11:15:00Z',
      updatedAt: '2023-05-02T11:15:00Z',
      status: 'active',
      verified: true,
      importance: 'high',
      fileType: 'pdf',
      fileSize: '2.1 MB',
      downloads: 53,
      views: 142,
      thumbnail: '/static/images/documents/construction.jpg',
      description: 'Quy định về việc cấp phép xây dựng, thủ tục, yêu cầu và các quy định pháp lý liên quan đến hoạt động xây dựng trên địa bàn.'
    },
    {
      id: 'doc5',
      title: 'Hướng dẫn thực hiện dịch vụ công trực tuyến',
      category: 'service',
      department: 'Phòng Công nghệ thông tin',
      createdBy: 'Hoàng Văn E',
      createdAt: '2023-04-25T09:30:00Z',
      updatedAt: '2023-05-12T15:45:00Z',
      status: 'active',
      verified: true,
      importance: 'medium',
      fileType: 'pptx',
      fileSize: '3.2 MB',
      downloads: 41,
      views: 98,
      thumbnail: '/static/images/documents/service.jpg',
      description: 'Tài liệu hướng dẫn thực hiện các dịch vụ công trực tuyến, quy trình tiếp nhận, xử lý hồ sơ trực tuyến và hướng dẫn người dân sử dụng.'
    }
  ];
  
  // Category definitions
  const categories = [
    { id: 0, value: 'all', label: 'Tất cả', icon: <DescriptionIcon /> },
    { id: 1, value: 'land', label: 'Đất đai', icon: <HomeIcon /> },
    { id: 2, value: 'civil', label: 'Hộ tịch', icon: <PeopleIcon /> },
    { id: 3, value: 'construction', label: 'Xây dựng', icon: <BusinessIcon /> },
    { id: 4, value: 'archive', label: 'Văn thư', icon: <EmailIcon /> },
    { id: 5, value: 'service', label: 'Dịch vụ công', icon: <PublicIcon /> }
  ];
  
  // Fetch documents on component mount
  useEffect(() => {
    fetchDocuments();
  }, []);
  
  // Filter documents when search term or tab changes
  useEffect(() => {
    if (documents.length > 0) {
      let filtered = documents;
      
      // Filter by category (tab value)
      if (tabValue > 0) {
        const categoryValue = categories[tabValue].value;
        filtered = filtered.filter(doc => doc.category === categoryValue);
      }
      
      // Filter by search term
      if (searchTerm) {
        filtered = filtered.filter(
          doc => doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 doc.department.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setFilteredDocuments(filtered);
    }
  }, [searchTerm, tabValue, documents]);
  
  // Function to fetch documents
  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to get data from API first
      try {
        const response = await chairmanService.getImportantDocuments();
        setDocuments(response.results || response);
        setFilteredDocuments(response.results || response);
        setLoading(false);
      } catch (apiError) {
        console.log('API error, using mock data:', apiError);
        // If API fails, use mock data as fallback
        setTimeout(() => {
          setDocuments(mockDocuments);
          setFilteredDocuments(mockDocuments);
          setLoading(false);
        }, 800);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Không thể tải danh sách tài liệu. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    try {
      const dateObj = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        return 'Invalid date';
      }
      
      return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(dateObj);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Get importance color
  const getImportanceColor = (importance) => {
    if (!importance) return theme.palette.text.secondary;
    
    switch (importance) {
      case 'high':
        return theme.palette.error.main;
      case 'medium':
        return theme.palette.warning.main;
      case 'low':
        return theme.palette.info.main;
      default:
        return theme.palette.text.secondary;
    }
  };
  
  // Get file type icon color
  const getFileTypeColor = (fileType) => {
    if (!fileType) return theme.palette.grey[600];
    
    switch (fileType) {
      case 'pdf':
        return '#f40f02';
      case 'docx':
        return '#2b5797';
      case 'xlsx':
        return '#1e7145';
      case 'pptx':
        return '#d24726';
      default:
        return theme.palette.grey[600];
    }
  };
  
  // Handle document view
  const handleViewDocument = (document) => {
    console.log('View document:', document);
    navigate(`/chairman/important-documents/${document.id}`);
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
      
      if (response && response.success) {
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
    
    if (!rejectionReason) {
      setSnackbarMessage('Vui lòng nhập lý do từ chối');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
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
      
      if (response && response.success) {
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
  if (loading) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 }, display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 120px)' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
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
    <Box sx={{ pl: 0 }}>
      <Box sx={{ pt: { xs: 2, md: 3 }, pr: { xs: 2, md: 3 }, pb: { xs: 2, md: 3 } }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" color="primary.main">
          Quản lý giấy tờ quan trọng
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Quản lý và phê duyệt các giấy tờ, tài liệu quan trọng của hệ thống
        </Typography>
        
        {/* Action bar */}
        <Paper sx={{ p: 2, mb: 3, borderRadius: 2, boxShadow: theme.shadows[2] }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                placeholder="Tìm kiếm theo tiêu đề, nội dung, phòng ban..."
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
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 1 }}>
                <Button 
                  variant="contained" 
                  startIcon={<UploadIcon />}
                  onClick={() => {
                    console.log('Upload new document');
                  }}
                >
                  Tải lên tài liệu
                </Button>
                
                <Tooltip title="Làm mới">
                  <IconButton onClick={fetchDocuments}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Bộ lọc">
                  <IconButton>
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
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            sx={{ 
              '& .MuiTab-root': {
                minHeight: 64,
                textTransform: 'none',
                fontSize: '0.9rem',
                fontWeight: 'medium'
              }
            }}
          >
            {categories.map((category, index) => (
              <Tab 
                key={category.value}
                label={category.label} 
                icon={category.icon} 
                iconPosition="start"
                id={`tab-${index}`}
              />
            ))}
          </Tabs>
        </Paper>
        
        {/* Documents grid */}
        {filteredDocuments.length > 0 ? (
          <Grid container spacing={3}>
            {filteredDocuments.map((document) => (
              <Grid item xs={12} sm={6} md={4} key={document.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    borderRadius: 2,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[4],
                    },
                    position: 'relative'
                  }}
                >
                  <CardActionArea onClick={() => handleViewDocument(document)}>
                    <CardMedia
                      component="img"
                      height="140"
                      image={document.thumbnail || `/static/images/documents/${document.category}.jpg`}
                      alt={document.title}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Chip 
                          label={document.fileType ? document.fileType.toUpperCase() : 'UNKNOWN'} 
                          size="small" 
                          sx={{ 
                            backgroundColor: getFileTypeColor(document.fileType),
                            color: 'white',
                            fontWeight: 'bold'
                          }} 
                        />
                        {document.verified && (
                          <Tooltip title="Đã xác thực">
                            <VerifiedUserIcon fontSize="small" color="success" />
                          </Tooltip>
                        )}
                      </Box>
                      
                      <Typography variant="h6" component="h2" gutterBottom noWrap>
                        {document.title}
                      </Typography>
                      
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          mb: 2,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          height: '4.5em'
                        }}
                      >
                        {document.description || 'Không có mô tả'}
                      </Typography>
                      
                      <Divider sx={{ my: 1.5 }} />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          {document.department || 'Không xác định'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {document.createdAt ? formatDate(document.createdAt) : 'N/A'}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {document.fileSize || 'N/A'}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: getImportanceColor(document.importance),
                            fontWeight: 'medium'
                          }}
                        >
                          {document.importance === 'high' ? 'Quan trọng' : 
                           document.importance === 'medium' ? 'Thường' : 
                           document.importance === 'low' ? 'Thấp' : 'Không xác định'}
                        </Typography>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                  
                  {/* Action buttons for pending documents */}
                  {document.status === 'pending' && (
                    <Box 
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        display: 'flex',
                        gap: 0.5,
                        zIndex: 1
                      }}
                    >
                      <IconButton 
                        size="small" 
                        sx={{ 
                          bgcolor: 'success.main', 
                          color: 'white',
                          '&:hover': { bgcolor: 'success.dark' }
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApproveButtonClick(document);
                        }}
                      >
                        <ApproveIcon fontSize="small" />
                      </IconButton>
                      
                      <IconButton 
                        size="small" 
                        sx={{ 
                          bgcolor: 'error.main', 
                          color: 'white',
                          '&:hover': { bgcolor: 'error.dark' }
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRejectButtonClick(document);
                        }}
                      >
                        <RejectIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
            <DescriptionIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Không tìm thấy tài liệu nào
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Không có tài liệu nào phù hợp với tìm kiếm của bạn
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
              Làm mới danh sách
            </Button>
          </Paper>
        )}
      </Box>
      
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

export default DocumentManagement; 