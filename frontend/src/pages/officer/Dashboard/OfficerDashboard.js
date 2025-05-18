import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  CircularProgress, 
  List, 
  ListItem, 
  ListItemText, 
  Divider, 
  Chip, 
  Button, 
  Alert,
  Skeleton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import officerService from '../../../services/api/officerService';

import {
  Assignment as AssignmentIcon,
  Description as DescriptionIcon,
  Pending as PendingIcon,
  HourglassEmpty as ProcessingIcon,
  CheckCircle as CheckIcon,
  ErrorOutline as ErrorIcon,
  Person as PersonIcon,
  Note as NoteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

/**
 * OfficerDashboard Component - The main dashboard for officer users
 */
const OfficerDashboard = () => {
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
      
      console.log('Fetching officer dashboard data...');
      const data = await officerService.getDashboardData();
      console.log('Dashboard data received:', data);
      
      if (data && data.message && data.message.includes('không có quyền')) {
        setPermissionError(true);
        setError('Bạn không có quyền truy cập trang này. Vui lòng đăng nhập bằng tài khoản có vai trò cán bộ xã.');
      } else {
        setDashboardData(data);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      
      if (err.response && err.response.status === 403) {
        setPermissionError(true);
        setError('Bạn không có quyền truy cập trang này. Vui lòng đăng nhập bằng tài khoản có vai trò cán bộ xã.');
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

  const handleViewRequest = (requestId) => {
    navigate(`/officer/process-request/${requestId}`);
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
          Bảng điều khiển cán bộ
        </Typography>
        
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'info.light', color: 'info.contrastText' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ProcessingIcon color="inherit" />
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
                  Yêu cầu chờ xử lý
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
                  Hoạt động gần đây
                </Typography>
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
          icon={<ErrorIcon />}
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
      processingRequests: 0,
      completedRequests: 0
    },
    pendingRequests: [],
    recentActivity: [],
    completedRequests: []
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Bảng điều khiển cán bộ
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Chào mừng đến với hệ thống quản lý hành chính blockchain. Với vai trò cán bộ, bạn có thể xử lý yêu cầu của công dân và quản lý giấy tờ.
      </Typography>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4, mt: 2 }}>
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
                <AssignmentIcon sx={{ fontSize: 80 }} />
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
                Chờ xử lý
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
                <ProcessingIcon sx={{ fontSize: 80 }} />
              </Box>
              <Typography variant="h5" component="div" fontWeight="bold">
                {safeData.stats?.processingRequests || 0}
              </Typography>
              <Typography variant="body2">
                Đang xử lý
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
                Đã hoàn thành
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Pending Requests */}
        <Grid item xs={12} md={6} lg={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="medium">
                Yêu cầu chờ xử lý
              </Typography>
              
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => navigate('/officer/requests/pending')}
              >
                Xem tất cả
              </Button>
            </Box>
            
            {safeData.pendingRequests && safeData.pendingRequests.length > 0 ? (
              <List>
                {safeData.pendingRequests.slice(0, 5).map((request, index) => (
                  <React.Fragment key={request.id || index}>
                    <ListItem 
                      secondaryAction={
                        <Button 
                          size="small" 
                          variant="contained" 
                          onClick={() => handleViewRequest(request.id)}
                        >
                          Xử lý
                        </Button>
                      }
                    >
                      <ListItemText 
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <NoteIcon fontSize="small" color="primary" />
                            <Typography variant="body1">
                              {request.type}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 0.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <PersonIcon fontSize="small" color="action" />
                              <Typography variant="body2" color="text.secondary">
                                {request.citizen || 'Không có thông tin'}
                              </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              Ngày yêu cầu: {formatDate(request.date)}
                            </Typography>
                            {getStatusChip(request.status)}
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < safeData.pendingRequests.slice(0, 5).length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ py: 2, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  Không có yêu cầu nào đang chờ xử lý
                </Typography>
                <Button
                  variant="text"
                  onClick={fetchDashboardData}
                  startIcon={<RefreshIcon />}
                  sx={{ mt: 1 }}
                >
                  Làm mới
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Recent Activities */}
        <Grid item xs={12} md={6} lg={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight="medium" gutterBottom>
              Hoạt động gần đây
            </Typography>
            
            {safeData.recentActivity && safeData.recentActivity.length > 0 ? (
              <List>
                {safeData.recentActivity.slice(0, 5).map((activity, index) => (
                  <React.Fragment key={activity.id || index}>
                    <ListItem>
                      <ListItemText 
                        primary={
                          <Typography variant="body1">
                            {activity.action} - {activity.document}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(activity.time)}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {index < safeData.recentActivity.slice(0, 5).length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ py: 2, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  Chưa có hoạt động nào gần đây
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Recently Processed Requests */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="medium">
                Yêu cầu đã xử lý gần đây
              </Typography>
              
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => navigate('/officer/requests/completed')}
              >
                Xem tất cả
              </Button>
            </Box>
            
            {safeData.completedRequests && safeData.completedRequests.length > 0 ? (
              <List>
                {safeData.completedRequests.slice(0, 5).map((request, index) => (
                  <React.Fragment key={request.id || index}>
                    <ListItem>
                      <ListItemText 
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <NoteIcon fontSize="small" color="primary" />
                            <Typography variant="body1">
                              {request.type}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 0.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <PersonIcon fontSize="small" color="action" />
                              <Typography variant="body2" color="text.secondary">
                                {request.citizen || 'Không có thông tin'}
                              </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              Ngày yêu cầu: {formatDate(request.date)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Ngày hoàn thành: {formatDate(request.completedDate)}
                            </Typography>
                            {getStatusChip('completed')}
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < safeData.completedRequests.slice(0, 5).length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ py: 2, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  Chưa có yêu cầu nào đã được xử lý gần đây
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OfficerDashboard; 