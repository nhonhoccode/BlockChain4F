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
import { useAuth } from '../../../../contexts/AuthContext';
import chairmanService from '../../../../services/api/chairmanService';

import {
  SupervisorAccount as OfficerIcon,
  FileCopy as DocumentIcon,
  CheckCircle as ApprovalIcon,
  ErrorOutline as ErrorIcon,
  Person as PersonIcon,
  DonutLarge as StatsIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

/**
 * ChairmanDashboard Component - The main dashboard for chairman/admin users
 */
const ChairmanDashboard = () => {
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
      
      console.log('Fetching chairman dashboard data...');
      const data = await chairmanService.getDashboardData();
      console.log('Dashboard data received:', data);
      
      if (data && data.message && data.message.includes('không có quyền')) {
        setPermissionError(true);
        setError('Bạn không có quyền truy cập trang này. Vui lòng đăng nhập bằng tài khoản chủ tịch xã/admin.');
      } else {
        setDashboardData(data);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      
      if (err.response && err.response.status === 403) {
        setPermissionError(true);
        setError('Bạn không có quyền truy cập trang này. Vui lòng đăng nhập bằng tài khoản chủ tịch xã/admin.');
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

  // Get status chip based on status string
  const getStatusChip = (status) => {
    switch (status) {
      case 'approved':
        return <Chip label="Đã phê duyệt" color="success" size="small" />;
      case 'pending':
        return <Chip label="Chờ phê duyệt" color="warning" size="small" />;
      case 'rejected':
        return <Chip label="Từ chối" color="error" size="small" />;
      default:
        return <Chip label={status || 'Không xác định'} color="default" size="small" />;
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

  // Skeleton loader for officer performance cards
  const PerformanceCardSkeleton = () => (
    <Grid container spacing={2}>
      {[1, 2, 3].map((item) => (
        <Grid item xs={12} md={6} lg={4} key={item}>
          <Card sx={{ boxShadow: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Skeleton variant="circular" width={24} height={24} sx={{ mr: 1 }} />
                <Skeleton variant="text" width="60%" height={24} />
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Skeleton variant="text" width="40%" height={20} />
                <Skeleton variant="text" width="20%" height={20} />
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Skeleton variant="text" width="40%" height={20} />
                <Skeleton variant="text" width="20%" height={20} />
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Skeleton variant="text" width="40%" height={20} />
                <Skeleton variant="text" width="20%" height={20} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Bảng điều khiển chủ tịch xã
        </Typography>
        
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'info.light', color: 'info.contrastText' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <OfficerIcon color="inherit" />
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
                  Phê duyệt cán bộ
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
      pendingOfficerApprovals: 0,
      totalOfficers: 0,
      pendingDocuments: 0,
      activeOfficers: 0
    },
    pendingApprovals: [],
    recentActivity: [],
    officerPerformance: []
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Bảng điều khiển chủ tịch xã
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Chào mừng đến với hệ thống quản lý hành chính blockchain. Với vai trò chủ tịch xã, bạn có thể phê duyệt cán bộ và quản lý hệ thống.
      </Typography>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4, mt: 2 }}>
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
                <OfficerIcon sx={{ fontSize: 80 }} />
              </Box>
              <Typography variant="h5" component="div" fontWeight="bold">
                {safeData.stats?.pendingOfficerApprovals || 0}
              </Typography>
              <Typography variant="body2">
                Cán bộ chờ duyệt
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
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
                <OfficerIcon sx={{ fontSize: 80 }} />
              </Box>
              <Typography variant="h5" component="div" fontWeight="bold">
                {safeData.stats?.totalOfficers || 0}
              </Typography>
              <Typography variant="body2">
                Tổng số cán bộ
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              height: '100%',
              bgcolor: 'secondary.light',
              color: 'secondary.contrastText',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <CardContent>
              <Box sx={{ position: 'absolute', right: -10, top: -10, opacity: 0.2 }}>
                <DocumentIcon sx={{ fontSize: 80 }} />
              </Box>
              <Typography variant="h5" component="div" fontWeight="bold">
                {safeData.stats?.pendingDocuments || 0}
              </Typography>
              <Typography variant="body2">
                Giấy tờ chờ duyệt
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
                <ApprovalIcon sx={{ fontSize: 80 }} />
              </Box>
              <Typography variant="h5" component="div" fontWeight="bold">
                {safeData.stats?.activeOfficers || 0}
              </Typography>
              <Typography variant="body2">
                Cán bộ đang hoạt động
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Officer Approvals */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="medium">
                Phê duyệt cán bộ
              </Typography>
              
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => navigate('/admin/chairman/officer-approvals')}
              >
                Xem tất cả
              </Button>
            </Box>
            
            {safeData.pendingApprovals && safeData.pendingApprovals.length > 0 ? (
              <List>
                {safeData.pendingApprovals.slice(0, 5).map((approval, index) => (
                  <React.Fragment key={approval.id || index}>
                    <ListItem
                      secondaryAction={
                        <Button 
                          size="small" 
                          variant="contained" 
                          onClick={() => navigate(`/admin/chairman/officer-approvals/${approval.id}`)}
                        >
                          Duyệt
                        </Button>
                      }
                    >
                      <ListItemText 
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PersonIcon fontSize="small" color="primary" />
                            <Typography variant="body1">
                              {approval.name}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 0.5 }}>
                            <Typography variant="body2" color="text.secondary">
                              Chức vụ: {approval.position}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Ngày yêu cầu: {formatDate(approval.requestDate)}
                            </Typography>
                            {getStatusChip(approval.status)}
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < safeData.pendingApprovals.slice(0, 5).length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ py: 2, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  Không có cán bộ nào đang chờ phê duyệt
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
        
        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
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
                            {activity.action}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ mt: 0.5 }}>
                            <Typography variant="body2" color="text.secondary">
                              Người dùng: {activity.user}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Thời gian: {formatDate(activity.time)}
                            </Typography>
                            {getStatusChip(activity.status)}
                          </Box>
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
        
        {/* Officer Performance */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="medium">
                Hiệu suất cán bộ
              </Typography>
              
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => navigate('/admin/chairman/reports/performance')}
              >
                Xem chi tiết
              </Button>
            </Box>
            
            {safeData.officerPerformance && safeData.officerPerformance.length > 0 ? (
              <Grid container spacing={2}>
                {safeData.officerPerformance.map((officer, index) => (
                  <Grid item xs={12} md={6} lg={4} key={index}>
                    <Card sx={{ boxShadow: 1 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <PersonIcon color="primary" sx={{ mr: 1 }} />
                          <Typography variant="body1" fontWeight="medium">
                            {officer.name}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Hoàn thành
                          </Typography>
                          <Typography variant="body2" fontWeight="medium" color="success.main">
                            {officer.completed}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Đang xử lý
                          </Typography>
                          <Typography variant="body2" fontWeight="medium" color="info.main">
                            {officer.processing}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">
                            Chờ xử lý
                          </Typography>
                          <Typography variant="body2" fontWeight="medium" color="warning.main">
                            {officer.pending}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ py: 2, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  Chưa có dữ liệu hiệu suất cán bộ
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ChairmanDashboard; 