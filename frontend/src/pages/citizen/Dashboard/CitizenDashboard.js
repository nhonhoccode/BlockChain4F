import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Stack,
  IconButton,
  Alert,
  Skeleton
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Description as DescriptionIcon,
  NotificationsActive as NotificationIcon,
  Add as AddIcon,
  CheckCircle as CheckIcon,
  Pending as PendingIcon,
  HourglassEmpty as ProcessingIcon,
  FilePresent as DocumentIcon,
  InsertDriveFile as RequestIcon,
  ArrowForward as ArrowIcon,
  ErrorOutline as ErrorIcon,
  Receipt as ReceiptIcon,
  EmojiObjects as TipIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import citizenService from '../../../services/api/citizenService';

/**
 * Citizen Dashboard Component
 */
const CitizenDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [permissionError, setPermissionError] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      setPermissionError(false);
      
      console.log('Fetching citizen dashboard data...');
      const data = await citizenService.getDashboardData();
      console.log('Dashboard data received:', data);
      
      if (data && data.message && data.message.includes('không có quyền')) {
        setPermissionError(true);
        setError('Bạn không có quyền truy cập trang này. Vui lòng đăng nhập bằng tài khoản người dân.');
      } else {
        setDashboardData(data);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      
      if (err.response && err.response.status === 403) {
        setPermissionError(true);
        setError('Bạn không có quyền truy cập trang này. Vui lòng đăng nhập bằng tài khoản người dân.');
      } else {
        setError('Không thể tải dữ liệu bảng điều khiển. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Get status icon based on status string
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckIcon color="success" />;
      case 'pending':
        return <PendingIcon color="warning" />;
      case 'processing':
        return <ProcessingIcon color="info" />;
      default:
        return <PendingIcon color="default" />;
    }
  };

  // Get status chip based on status string
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
      default:
        return <Chip label={status || 'Không xác định'} color="default" size="small" />;
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

  // Skeleton loader for stats cards
  const StatsCardSkeleton = () => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Skeleton variant="rectangular" width="60%" height={36} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="40%" height={20} />
      </CardContent>
    </Card>
  );

  // Skeleton loader for lists
  const ListSkeleton = () => (
    <>
      {[1, 2, 3].map((item) => (
        <React.Fragment key={item}>
          <ListItem>
            <ListItemText
              primary={<Skeleton variant="text" width="70%" height={24} />}
              secondary={
                <Box sx={{ mt: 1 }}>
                  <Skeleton variant="text" width="40%" height={20} />
                  <Skeleton variant="text" width="60%" height={20} />
                </Box>
              }
            />
          </ListItem>
          <Divider />
        </React.Fragment>
      ))}
    </>
  );

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Bảng điều khiển công dân
        </Typography>
        
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'info.light', color: 'info.contrastText' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TipIcon color="inherit" />
            <Typography variant="body1" fontWeight="medium">
              Đang tải dữ liệu...
            </Typography>
          </Box>
        </Paper>
        
        {/* Stats Cards Skeletons */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item}>
              <StatsCardSkeleton />
            </Grid>
          ))}
        </Grid>
        
        {/* Lists Skeletons */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="medium">
                  Yêu cầu gần đây
                </Typography>
                <Skeleton variant="rectangular" width={100} height={36} />
              </Box>
              <ListSkeleton />
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="medium">
                  Giấy tờ đã cấp
                </Typography>
                <Skeleton variant="rectangular" width={100} height={36} />
              </Box>
              <ListSkeleton />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (permissionError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
        >
          <Typography variant="h6">Lỗi quyền truy cập</Typography>
          <Typography variant="body1">{error}</Typography>
        </Alert>
        
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate('/auth/login')}
          >
            Đăng nhập lại
          </Button>
          
          <Button 
            variant="outlined"
            onClick={() => navigate('/')}
          >
            Về trang chủ
          </Button>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              startIcon={<RefreshIcon />} 
              onClick={fetchDashboardData}
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

  // Create empty dashboard data if not available to prevent UI errors
  const safeData = dashboardData || {
    stats: {
      totalRequests: 0,
      pendingRequests: 0,
      completedRequests: 0,
      documentsIssued: 0
    },
    recentRequests: [],
    recentDocuments: []
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Bảng điều khiển công dân
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Chào mừng đến với hệ thống quản lý hành chính blockchain. Bạn có thể quản lý yêu cầu và giấy tờ của mình tại đây.
      </Typography>
      
      {/* Tips Card */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: 'info.light', color: 'info.contrastText' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TipIcon color="inherit" />
          <Typography variant="body1" fontWeight="medium">
            Mẹo: Bạn có thể tạo yêu cầu giấy tờ mới bằng cách nhấn vào nút "Tạo yêu cầu mới" bên dưới.
          </Typography>
        </Box>
      </Paper>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              height: '100%',
              bgcolor: 'primary.light',
              color: 'primary.contrastText',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <CardContent>
              <Box sx={{ position: 'absolute', right: -10, top: -10, opacity: 0.2 }}>
                <RequestIcon sx={{ fontSize: 80 }} />
              </Box>
              <Typography variant="h5" component="div" fontWeight="bold">
                {safeData.stats?.totalRequests || 0}
              </Typography>
              <Typography variant="body2">
                Tổng số yêu cầu
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              height: '100%',
              bgcolor: 'warning.light',
              color: 'warning.contrastText',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <CardContent>
              <Box sx={{ position: 'absolute', right: -10, top: -10, opacity: 0.2 }}>
                <PendingIcon sx={{ fontSize: 80 }} />
              </Box>
              <Typography variant="h5" component="div" fontWeight="bold">
                {safeData.stats?.pendingRequests || 0}
              </Typography>
              <Typography variant="body2">
                Yêu cầu chờ xử lý
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              height: '100%',
              bgcolor: 'success.light',
              color: 'success.contrastText',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <CardContent>
              <Box sx={{ position: 'absolute', right: -10, top: -10, opacity: 0.2 }}>
                <CheckIcon sx={{ fontSize: 80 }} />
              </Box>
              <Typography variant="h5" component="div" fontWeight="bold">
                {safeData.stats?.completedRequests || 0}
              </Typography>
              <Typography variant="body2">
                Yêu cầu đã hoàn thành
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              height: '100%',
              bgcolor: 'info.light',
              color: 'info.contrastText',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <CardContent>
              <Box sx={{ position: 'absolute', right: -10, top: -10, opacity: 0.2 }}>
                <DocumentIcon sx={{ fontSize: 80 }} />
              </Box>
              <Typography variant="h5" component="div" fontWeight="bold">
                {safeData.stats?.documentsIssued || 0}
              </Typography>
              <Typography variant="body2">
                Giấy tờ đã cấp
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Create New Request Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <Button 
          variant="contained" 
          size="large" 
          onClick={() => navigate('/citizen/requests/new')}
          startIcon={<RequestIcon />}
        >
          Tạo yêu cầu mới
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        {/* Recent Requests */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="medium">
                Yêu cầu gần đây
              </Typography>
              
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => navigate('/citizen/requests')}
              >
                Xem tất cả
              </Button>
            </Box>
            
            {safeData.recentRequests && safeData.recentRequests.length > 0 ? (
              <List>
                {safeData.recentRequests.slice(0, 5).map((request, index) => (
                  <React.Fragment key={request.id || index}>
                    <ListItem
                      secondaryAction={
                        <IconButton 
                          edge="end" 
                          aria-label="view" 
                          onClick={() => navigate(`/citizen/requests/${request.id}`)}
                        >
                          <ArrowIcon />
                        </IconButton>
                      }
                    >
                      <ListItemText 
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <RequestIcon fontSize="small" sx={{ mr: 1 }} />
                            <Typography variant="body1">
                              {request.type}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 0.5 }}>
                            <Typography variant="body2" color="text.secondary">
                              Ngày yêu cầu: {formatDate(request.requestDate)}
                            </Typography>
                            {request.completionDate && (
                              <Typography variant="body2" color="text.secondary">
                                Ngày hoàn thành: {formatDate(request.completionDate)}
                              </Typography>
                            )}
                            {getStatusChip(request.status)}
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < safeData.recentRequests.slice(0, 5).length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ py: 2, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  Bạn chưa có yêu cầu nào
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Recent Documents */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="medium">
                Giấy tờ đã cấp
              </Typography>
              
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => navigate('/citizen/documents')}
              >
                Xem tất cả
              </Button>
            </Box>
            
            {safeData.recentDocuments && safeData.recentDocuments.length > 0 ? (
              <List>
                {safeData.recentDocuments.slice(0, 5).map((document, index) => (
                  <React.Fragment key={document.id || index}>
                    <ListItem
                      secondaryAction={
                        <IconButton 
                          edge="end" 
                          aria-label="view" 
                          onClick={() => navigate(`/citizen/documents/${document.id}`)}
                        >
                          <ArrowIcon />
                        </IconButton>
                      }
                    >
                      <ListItemText 
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <ReceiptIcon fontSize="small" sx={{ mr: 1 }} />
                            <Typography variant="body1">
                              {document.type}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 0.5 }}>
                            <Typography variant="body2" color="text.secondary">
                              Ngày cấp: {formatDate(document.issueDate)}
                            </Typography>
                            {document.expiryDate && (
                              <Typography variant="body2" color="text.secondary">
                                Ngày hết hạn: {formatDate(document.expiryDate)}
                              </Typography>
                            )}
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              Mã xác thực: <Chip size="small" label={document.verificationCode} color="primary" />
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < safeData.recentDocuments.slice(0, 5).length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ py: 2, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  Bạn chưa có giấy tờ nào được cấp
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CitizenDashboard; 