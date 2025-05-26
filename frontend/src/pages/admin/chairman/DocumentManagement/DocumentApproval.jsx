import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardHeader,
  CardContent,
  Button,
  TextField,
  Divider,
  Grid,
  Stack,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  useTheme,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  VerifiedUser as VerifiedIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import chairmanService from '../../../../services/api/chairmanService';
import mockDocumentDetails from '../../../../services/mockData/documentDetails';

/**
 * DocumentApproval Component - Page for reviewing and approving important documents
 */
const DocumentApproval = () => {
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
  const [comments, setComments] = useState('');
  
  // Mock document data - replace with API call in production
  useEffect(() => {
    const fetchDocument = async () => {
      setLoading(true);
      
      try {
        // Try to fetch from API first
        try {
          const response = await chairmanService.getDocumentById(id);
          setDocument(response);
          setLoading(false);
        } catch (apiError) {
          console.log('API error, using mock data:', apiError);
          // If API fails, try to get from mockDocumentDetails
          setTimeout(() => {
            const foundDoc = mockDocumentDetails[id];
            if (foundDoc) {
              setDocument(foundDoc);
            } else {
              // Fallback to generic mock document
              setDocument({
                id: id,
                title: 'Nghị quyết số 15/NQ-CP về quản lý đất đai',
                category: 'land',
                department: 'Phòng Địa chính',
                createdBy: 'Nguyễn Văn A',
                createdAt: '2023-05-10T09:00:00Z',
                status: 'pending',
                fileType: 'pdf',
                fileSize: '1.2 MB',
                description: 'Nghị quyết về các vấn đề liên quan đến quản lý đất đai, cấp giấy chứng nhận quyền sử dụng đất và các thủ tục hành chính liên quan.',
                content: 'Nội dung chi tiết của nghị quyết sẽ được hiển thị ở đây. Đây là phần nội dung của văn bản, bao gồm các điều khoản và quy định chi tiết về quản lý đất đai.'
              });
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
  
  // Handle approval
  const handleApprove = () => {
    console.log('Document approved', { id, comments });
    navigate(basePath);
  };
  
  // Handle rejection
  const handleReject = () => {
    console.log('Document rejected', { id, comments });
    navigate(basePath);
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Render loading state
  if (loading) {
    return (
      <Box sx={{ pl: 0, pt: { xs: 2, md: 3 }, pr: { xs: 2, md: 3 }, pb: { xs: 2, md: 3 }, display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 120px)' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Box sx={{ pl: 0, pt: { xs: 2, md: 3 }, pr: { xs: 2, md: 3 }, pb: { xs: 2, md: 3 } }}>
        <Alert 
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => window.location.reload()}>
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
            Chi tiết tài liệu
          </Typography>
        </Breadcrumbs>
        
        {/* Page header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" color="primary.main">
            Phê duyệt tài liệu
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
          <Grid item xs={12} md={8}>
            <Card sx={{ mb: 3, borderRadius: 2 }}>
              <CardHeader
                title={
                  <Typography variant="h5" fontWeight="medium">
                    {document?.title}
                  </Typography>
                }
                subheader={
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Chip 
                      label={document?.category === 'land' ? 'Đất đai' : document?.category} 
                      size="small" 
                      color="primary" 
                      sx={{ mr: 1 }}
                    />
                    <Chip 
                      label={document?.status === 'pending' ? 'Chờ phê duyệt' : 'Đã phê duyệt'} 
                      size="small"
                      color={document?.status === 'pending' ? 'warning' : 'success'}
                    />
                  </Box>
                }
              />
              <Divider />
              <CardContent>
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                  Mô tả tài liệu:
                </Typography>
                <Typography variant="body2" paragraph>
                  {document?.description}
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
                    maxHeight: '300px',
                    overflow: 'auto'
                  }}
                >
                  <Typography variant="body2">
                    {document?.content}
                  </Typography>
                </Paper>
                
                <TextField
                  label="Ý kiến phê duyệt"
                  multiline
                  rows={4}
                  fullWidth
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Nhập ý kiến phê duyệt hoặc lý do từ chối (nếu có)..."
                  sx={{ mb: 2 }}
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={handleReject}
                  >
                    Từ chối
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<VerifiedIcon />}
                    onClick={handleApprove}
                  >
                    Phê duyệt
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 2, height: '100%' }}>
              <CardHeader title="Thông tin chi tiết" />
              <Divider />
              <CardContent>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Người tạo
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {document?.createdBy}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Ngày tạo
                    </Typography>
                    <Typography variant="body1">
                      {document?.createdAt ? formatDate(document.createdAt) : ''}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Phòng ban
                    </Typography>
                    <Typography variant="body1">
                      {document?.department}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Loại file
                    </Typography>
                    <Typography variant="body1" sx={{ textTransform: 'uppercase' }}>
                      {document?.fileType}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Kích thước
                    </Typography>
                    <Typography variant="body1">
                      {document?.fileSize}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default DocumentApproval; 