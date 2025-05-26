import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent,
  CardHeader,
  Avatar,
  Chip,
  Button, 
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  LinearProgress,
  useTheme,
  alpha,
  CircularProgress,
  Skeleton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import chairmanService from '../../../../services/api/chairmanService';

import {
  SupervisorAccount as OfficerIcon,
  SupervisorAccount as SupervisorIcon,
  FileCopy as DocumentIcon,
  CheckCircle as ApprovalIcon,
  ErrorOutline as ErrorIcon,
  Person as PersonIcon,
  DonutLarge as StatsIcon,
  Refresh as RefreshIcon,
  ArrowForwardIos as ArrowIcon,
  Assignment as AssignmentIcon,
  NotificationsActive as NotificationIcon,
  InsertChart as ChartIcon,
  Timeline as TimelineIcon
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
  const theme = useTheme();
  
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
        return <Chip label="Đã phê duyệt" color="success" size="small" variant="outlined" />;
      case 'pending':
        return <Chip label="Chờ phê duyệt" color="warning" size="small" variant="outlined" />;
      case 'rejected':
        return <Chip label="Từ chối" color="error" size="small" variant="outlined" />;
      default:
        return <Chip label={status || 'Không xác định'} color="default" size="small" variant="outlined" />;
    }
  };

  // Loading states
  if (loading) {
    return <DashboardLoadingState />;
  }

  if (permissionError) {
    return <PermissionErrorState error={error} navigate={navigate} />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={fetchDashboardData} />;
  }

  // Create empty dashboard data if not available to prevent UI errors
  const safeData = dashboardData || {
    summary_stats: {
      total_officers: 0,
      pending_approvals: 0,
      total_citizens: 0,
      approved_documents: 0,
      pending_documents: 0,
      pending_requests: 0,
      completed_requests: 0
    },
    pending_approvals: [],
    recentActivity: [],
    officerPerformance: []
  };

  return (
    <Box sx={{ pl: 0 }}>
      <Box sx={{ pt: { xs: 2, md: 3 }, pr: { xs: 2, md: 3 }, pb: { xs: 2, md: 3 } }}>
        <WelcomeHeader currentUser={currentUser} />
        
        {/* Stats Overview */}
        <Grid container spacing={3} sx={{ mb: 4, mt: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Cán bộ chờ duyệt"
              value={safeData.summary_stats?.pending_approvals || 0}
              icon={<OfficerIcon />}
              color={theme.palette.warning.main}
              onClick={() => navigate('/admin/chairman/officer-approval')}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Tổng số cán bộ"
              value={safeData.summary_stats?.total_officers || 0}
              icon={<PersonIcon />}
              color={theme.palette.primary.main}
              onClick={() => navigate('/admin/chairman/officer-management')}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Giấy tờ chờ duyệt"
              value={safeData.summary_stats?.pending_documents || 0}
              icon={<DocumentIcon />}
              color={theme.palette.secondary.main}
              onClick={() => navigate('/admin/chairman/document-management')}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Công dân trong xã"
              value={safeData.summary_stats?.total_citizens || 0}
              icon={<ApprovalIcon />}
              color={theme.palette.success.main}
              onClick={() => navigate('/admin/chairman/reports')}
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Officer Approvals */}
          <Grid item xs={12} md={6} lg={6}>
            <PendingApprovalsCard 
              pendingApprovals={safeData.pending_approvals} 
              navigate={navigate}
              formatDate={formatDate}
              getStatusChip={getStatusChip}
              onRefresh={fetchDashboardData}
            />
          </Grid>
          
          {/* Recent Activity */}
          <Grid item xs={12} md={6} lg={6}>
            <RecentActivityCard 
              recentActivity={safeData.recentActivity || []}
              formatDate={formatDate}
              getStatusChip={getStatusChip}
            />
          </Grid>
          
          {/* Officer Performance */}
          <Grid item xs={12}>
            <OfficerPerformanceCard 
              officerPerformance={safeData.officerPerformance || safeData.officer_stats || []}
              navigate={navigate}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

/**
 * Welcome header with greeting and overview message
 */
const WelcomeHeader = ({ currentUser }) => {
  const theme = useTheme();
  
  return (
    <Box 
      sx={{ 
        p: { xs: 3, md: 4 },
        borderRadius: 2,
        mb: 3, 
        background: theme.palette.primary.main,
        color: 'white',
        boxShadow: '0 4px 20px rgba(0, 105, 170, 0.2)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '40%',
          height: '100%',
          background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.1))',
          clipPath: 'polygon(100% 0, 0% 100%, 100% 100%)',
          zIndex: 1
        }}
      />
      
      <Typography variant="h4" component="h1" fontWeight="bold" sx={{ mb: 1, position: 'relative', zIndex: 2 }}>
        Xin chào, {currentUser?.name || 'Admin User'}!
      </Typography>
      
      <Typography variant="body1" sx={{ maxWidth: '80%', position: 'relative', zIndex: 2 }}>
        Chào mừng đến với hệ thống quản lý phê duyệt cán bộ, quản lý giấy tờ quan trọng và xử lý yêu cầu
      </Typography>
    </Box>
  );
};

// Component for displaying stats card
const StatCard = ({ title, value, icon, color, onClick }) => {
  const theme = useTheme();
  
  return (
    <Card 
      sx={{ 
        height: '100%',
        borderRadius: 2,
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: `0 10px 20px ${alpha(color, 0.15)}`
        },
        overflow: 'visible',
        position: 'relative'
      }}
      onClick={onClick}
    >
      <Box 
        sx={{ 
          position: 'absolute',
          top: -15,
          left: 20,
          width: 54,
          height: 54,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '12px',
          background: color,
          color: '#fff',
          boxShadow: `0 4px 20px ${alpha(color, 0.3)}`
        }}
      >
        {icon}
      </Box>
      <CardContent sx={{ pt: 4, pb: 2, pl: 2, pr: 2 }}>
        <Box sx={{ ml: 0, mt: 2 }}>
          <Typography variant="h3" component="div" fontWeight="bold" sx={{ mb: 0.5 }}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

// Component for displaying pending approvals
const PendingApprovalsCard = ({ pendingApprovals, navigate, formatDate, getStatusChip, onRefresh }) => {
  return (
    <Card sx={{ height: '100%', borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SupervisorIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" fontWeight="600">Phê duyệt cán bộ</Typography>
          </Box>
        }
        action={
          <Button 
            variant="outlined" 
            size="small" 
            endIcon={<ArrowIcon fontSize="small" />}
            onClick={() => navigate('/admin/chairman/officer-approval')}
          >
            Xem tất cả
          </Button>
        }
        sx={{ pb: 1 }}
      />
      <Divider />
      <CardContent sx={{ p: 0, pt: 1, "&:last-child": { pb: 0 } }}>
        {pendingApprovals && pendingApprovals.length > 0 ? (
          <List>
            {pendingApprovals.slice(0, 5).map((approval, index) => (
              <ListItem
                key={approval.id || index}
                sx={{ 
                  py: 1.5, 
                  transition: 'all 0.2s ease',
                  '&:hover': { bgcolor: alpha('#f5f5f5', 0.7) }
                }}
                secondaryAction={
                  <Button 
                    size="small" 
                    variant="contained" 
                    onClick={() => navigate(`/admin/chairman/officer-approvals/${approval.id}`)}
                    color="primary"
                    sx={{ borderRadius: '8px' }}
                  >
                    Duyệt
                  </Button>
                }
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.light' }}>
                    <PersonIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary={approval.name || approval.title}
                  secondary={
                    <Box sx={{ mt: 0.5 }}>
                      <Typography variant="body2" color="text.secondary" component="span">
                        Chức vụ: {approval.position || 'Không xác định'}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, gap: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(approval.requestDate || approval.requested_at)}
                        </Typography>
                        {getStatusChip(approval.status)}
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <AssignmentIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body1" color="text.secondary">
              Không có cán bộ nào đang chờ phê duyệt
            </Typography>
            <Button
              variant="text"
              onClick={onRefresh}
              startIcon={<RefreshIcon />}
              sx={{ mt: 1 }}
            >
              Làm mới
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Component for displaying recent activity
const RecentActivityCard = ({ recentActivity, formatDate, getStatusChip }) => {
  return (
    <Card sx={{ height: '100%', borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TimelineIcon sx={{ mr: 1, color: 'secondary.main' }} />
            <Typography variant="h6" fontWeight="600">Hoạt động gần đây</Typography>
          </Box>
        }
        sx={{ pb: 1 }}
      />
      <Divider />
      <CardContent sx={{ p: 0, pt: 1, "&:last-child": { pb: 0 } }}>
        {recentActivity && recentActivity.length > 0 ? (
          <List>
            {recentActivity.slice(0, 5).map((activity, index) => (
              <ListItem
                key={activity.id || index}
                sx={{ 
                  py: 1.5, 
                  transition: 'all 0.2s ease',
                  '&:hover': { bgcolor: alpha('#f5f5f5', 0.7) }
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'secondary.light' }}>
                    <NotificationIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary={activity.action}
                  secondary={
                    <Box sx={{ mt: 0.5 }}>
                      <Typography variant="body2" color="text.secondary" component="span">
                        Người dùng: {activity.user}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, gap: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(activity.time)}
                        </Typography>
                        {getStatusChip(activity.status)}
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <NotificationIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body1" color="text.secondary">
              Chưa có hoạt động nào gần đây
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Component for displaying officer performance
const OfficerPerformanceCard = ({ officerPerformance, navigate }) => {
  const theme = useTheme();
  
  return (
    <Card sx={{ borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ChartIcon sx={{ mr: 1, color: 'info.main' }} />
            <Typography variant="h6" fontWeight="600">Hiệu suất cán bộ</Typography>
          </Box>
        }
        action={
          <Button 
            variant="outlined" 
            size="small" 
            endIcon={<ArrowIcon fontSize="small" />}
            onClick={() => navigate('/admin/chairman/reports/performance')}
          >
            Xem chi tiết
          </Button>
        }
        sx={{ pb: 1 }}
      />
      <Divider />
      <CardContent>
        {officerPerformance && officerPerformance.length > 0 ? (
          <Grid container spacing={2}>
            {officerPerformance.map((officer, index) => {
              // Handle both data structures (officerPerformance and officer_stats)
              const completed = officer.completed || officer.completed_requests || 0;
              const processing = officer.processing || (officer.total_requests ? officer.total_requests - officer.completed_requests : 0) || 0;
              const pending = officer.pending || 0;
              const total = completed + processing + pending;
              const completedPercent = total > 0 ? (completed / total) * 100 : 0;
              const processingPercent = total > 0 ? (processing / total) * 100 : 0;
              
              return (
                <Grid item xs={12} md={6} lg={4} key={index}>
                  <Card sx={{ 
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)', 
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                    } 
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ bgcolor: theme.palette.primary.light, mr: 2 }}>
                          <PersonIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight="600">
                            {officer.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {officer.position || 'Cán bộ'}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ mb: 1.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            Hoàn thành
                          </Typography>
                          <Typography variant="body2" fontWeight="medium" color="success.main">
                            {completed}
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={completedPercent} 
                          color="success"
                          sx={{ height: 6, borderRadius: 3, mb: 1 }}
                        />
                      </Box>
                      
                      <Box sx={{ mb: 1.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            Đang xử lý
                          </Typography>
                          <Typography variant="body2" fontWeight="medium" color="info.main">
                            {processing}
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={processingPercent} 
                          color="info"
                          sx={{ height: 6, borderRadius: 3, mb: 1 }}
                        />
                      </Box>
                      
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            Chờ xử lý
                          </Typography>
                          <Typography variant="body2" fontWeight="medium" color="warning.main">
                            {pending}
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={100 - completedPercent - processingPercent} 
                          color="warning"
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <ChartIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body1" color="text.secondary">
              Chưa có dữ liệu hiệu suất cán bộ
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Loading state component
const DashboardLoadingState = () => {
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Skeleton variant="rectangular" width="60%" height={60} sx={{ mb: 3, borderRadius: 1 }} />
      
      <Skeleton variant="rectangular" width="100%" height={120} sx={{ mb: 3, borderRadius: 1 }} />
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[1, 2, 3, 4].map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item}>
            <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 1 }} />
          </Grid>
        ))}
      </Grid>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Skeleton variant="rectangular" height={350} sx={{ borderRadius: 1 }} />
        </Grid>
        <Grid item xs={12} md={6}>
          <Skeleton variant="rectangular" height={350} sx={{ borderRadius: 1 }} />
        </Grid>
        <Grid item xs={12}>
          <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 1 }} />
        </Grid>
      </Grid>
    </Box>
  );
};

// Permission error state component
const PermissionErrorState = ({ error, navigate }) => {
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
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
};

// Error state component
const ErrorState = ({ error, onRetry }) => {
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Alert 
        severity="error" 
        sx={{ mb: 2 }}
        action={
          <Button 
            color="inherit" 
            size="small" 
            startIcon={<RefreshIcon />} 
            onClick={onRetry}
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
};

export default ChairmanDashboard; 