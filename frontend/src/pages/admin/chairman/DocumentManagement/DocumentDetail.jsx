import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardHeader,
  CardContent,
  Button,
  Divider,
  Grid,
  Stack,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  useTheme,
  Breadcrumbs,
  Link,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Description as DescriptionIcon,
  VerifiedUser as VerifiedIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  CloudDownload as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  FolderOpen as FolderIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import chairmanService from '../../../../services/api/chairmanService';
import mockDocumentDetails from '../../../../services/mockData/documentDetails';

/**
 * DocumentDetail Component - Shows detailed view of an important document
 */
const DocumentDetail = () => {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Determine which URL pattern to use based on current location
  const isAdminPath = window.location.pathname.includes('/admin/chairman');
  const basePath = isAdminPath ? '/admin/chairman/important-documents' : '/chairman/important-documents';
  
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [document, setDocument] = useState(null);
  
  useEffect(() => {
    const fetchDocument = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Try to get data from API first
        try {
          const response = await chairmanService.getDocumentById(id);
          setDocument(response);
          setLoading(false);
        } catch (apiError) {
          console.log('API error, using mock data:', apiError);
          // If API fails, use mock data as fallback
          setTimeout(() => {
            const foundDoc = mockDocumentDetails[id];
            if (foundDoc) {
              setDocument(foundDoc);
            } else {
              setError('Không tìm thấy tài liệu với ID đã cung cấp.');
            }
            setLoading(false);
          }, 800);
        }
      } catch (err) {
        console.error('Error fetching document:', err);
        setError('Không thể tải thông tin tài liệu. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };
    
    fetchDocument();
  }, [id]);
  
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
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(dateObj);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };
  
  // Get category label
  const getCategoryLabel = (category) => {
    switch (category) {
      case 'land':
        return 'Đất đai';
      case 'civil':
        return 'Hộ tịch';
      case 'construction':
        return 'Xây dựng';
      case 'archive':
        return 'Văn thư';
      case 'service':
        return 'Dịch vụ công';
      default:
        return category;
    }
  };
  
  // Get category icon
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'land':
        return <FolderIcon />;
      case 'civil':
        return <PersonIcon />;
      case 'construction':
        return <DescriptionIcon />;
      case 'archive':
        return <AssignmentIcon />;
      case 'service':
        return <DescriptionIcon />;
      default:
        return <DescriptionIcon />;
    }
  };
  
  // Get file type color
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
  
  // Handle document download
  const handleDownload = () => {
    console.log('Downloading document:', document?.id);
    // Implement actual download logic here
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
            <Button color="inherit" size="small" onClick={() => navigate(basePath)}>
              Quay lại
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }
  
  // Render not found state
  if (!document) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Alert
          severity="warning"
          action={
            <Button color="inherit" size="small" onClick={() => navigate(basePath)}>
              Quay lại
            </Button>
          }
        >
          Không tìm thấy tài liệu với ID: {id}
        </Alert>
      </Box>
    );
  }
  
  return (
    <Box sx={{ pl: 0 }}>
      <Box sx={{ pt: { xs: 2, md: 3 }, pr: { xs: 2, md: 3 }, pb: { xs: 2, md: 3 } }}>
        {/* Breadcrumbs */}
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
          sx={{ mb: 3 }}
        >
          <Link 
            color="inherit" 
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate(basePath);
            }}
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <DescriptionIcon sx={{ mr: 0.5 }} fontSize="small" />
            Giấy tờ quan trọng
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            {document?.title}
          </Typography>
        </Breadcrumbs>
        
        {/* Page header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" color="primary.main">
            Chi tiết tài liệu
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(basePath)}
          >
            Quay lại
          </Button>
        </Box>
        
        {/* Document details */}
        <Grid container spacing={3}>
          {/* Left column - Main document content */}
          <Grid item xs={12} md={8}>
            <Card sx={{ mb: 3, borderRadius: 2 }}>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h5" fontWeight="medium">
                      {document?.title}
                    </Typography>
                    {document?.verified && (
                      <Tooltip title="Đã xác thực">
                        <VerifiedIcon 
                          fontSize="small" 
                          color="success" 
                          sx={{ ml: 1 }}
                        />
                      </Tooltip>
                    )}
                  </Box>
                }
                subheader={
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Chip 
                      icon={getCategoryIcon(document?.category)}
                      label={getCategoryLabel(document?.category)} 
                      size="small" 
                      color="primary" 
                      sx={{ mr: 1 }}
                    />
                    <Chip 
                      label={document?.fileType ? document?.fileType.toUpperCase() : 'UNKNOWN'} 
                      size="small"
                      sx={{ 
                        backgroundColor: getFileTypeColor(document?.fileType),
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  </Box>
                }
                action={
                  <Box sx={{ display: 'flex' }}>
                    <Tooltip title="Tải xuống">
                      <IconButton onClick={handleDownload}>
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="In">
                      <IconButton>
                        <PrintIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Chia sẻ">
                      <IconButton>
                        <ShareIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              />
              <Divider />
              <CardContent>
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                  Mô tả tài liệu:
                </Typography>
                <Typography variant="body2" paragraph>
                  {document?.description || 'Không có mô tả'}
                </Typography>
                
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                  Nội dung:
                </Typography>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    bgcolor: 'background.default', 
                    borderRadius: 2,
                    mb: 3,
                    maxHeight: '400px',
                    overflow: 'auto',
                    whiteSpace: 'pre-line'
                  }}
                >
                  <Typography variant="body2">
                    {document?.content || 'Không có nội dung'}
                  </Typography>
                </Paper>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Right column - Metadata */}
          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 3, borderRadius: 2 }}>
              <CardHeader
                title="Thông tin tài liệu"
                titleTypographyProps={{ variant: 'h6' }}
              />
              <Divider />
              <CardContent>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Phòng ban:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {document?.department || 'N/A'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Người tạo:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {document?.createdBy || 'N/A'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Ngày tạo:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {document?.createdAt ? formatDate(document.createdAt) : 'N/A'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Cập nhật:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {document?.updatedAt ? formatDate(document.updatedAt) : 'N/A'}
                    </Typography>
                  </Box>
                  
                  <Divider />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Loại file:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {document?.fileType ? document.fileType.toUpperCase() : 'N/A'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Kích thước:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {document?.fileSize || 'N/A'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Lượt tải:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {document?.downloads || 0}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Lượt xem:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {document?.views || 0}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
            
            <Button
              variant="contained"
              fullWidth
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
              sx={{ mb: 2 }}
            >
              Tải xuống tài liệu
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default DocumentDetail; 