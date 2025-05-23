import React, { useState, useEffect } from 'react';import {   Box,   Typography,   Paper,   Grid,   Card,   CardContent,   CircularProgress,   List,   ListItem,   ListItemText,   Divider,   Chip,   Button,   Alert,  Skeleton,  ButtonGroup,  Stack,  IconButton,  Tooltip,  LinearProgress,  Badge,  Avatar} from '@mui/material';import { useNavigate } from 'react-router-dom';import { useAuth } from '../../../contexts/AuthContext';import officerService from '../../../services/api/officerService';import {  Assignment as AssignmentIcon,  Description as DescriptionIcon,  Pending as PendingIcon,  HourglassEmpty as ProcessingIcon,  CheckCircle as CheckIcon,  ErrorOutline as ErrorIcon,  Person as PersonIcon,  Note as NoteIcon,  Refresh as RefreshIcon,  Add as AddIcon,  ViewList as ViewListIcon,  Group as GroupIcon,  BarChart as ChartIcon,  Search as SearchIcon,  AccountCircle as ProfileIcon,  Notifications as NotificationsIcon,  ArrowForward as ArrowForwardIcon,  CalendarToday as CalendarIcon,  Speed as SpeedIcon,  Visibility as VisibilityIcon} from '@mui/icons-material';

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

  // Navigation functions
  const navigateTo = (path) => {
    navigate(path);
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
      
      {error && (
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={fetchDashboardData}>
              Thử lại
            </Button>
          }
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      )}
      
      {/* Action Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchDashboardData}
        >
          Làm mới dữ liệu
        </Button>
      </Box>
      
            {/* Quick Action Buttons */}      <Paper         sx={{           p: 3,           mb: 3,           borderRadius: '12px',          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',          background: 'linear-gradient(to right, #f5f7fa, #ffffff)'        }}      >        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>          <Typography variant="h6" fontWeight="bold" sx={{ color: 'text.primary' }}>            Thao tác nhanh          </Typography>          <Chip             label="Cán bộ xã"             color="primary"             size="small"             sx={{ fontWeight: 'medium', borderRadius: '16px' }}          />        </Box>                <Grid container spacing={2}>          <Grid item xs={12} sm={6} md={3}>            <Card               sx={{                 p: 2,                height: '100%',                cursor: 'pointer',                transition: 'all 0.3s',                borderRadius: '12px',                border: '1px solid',                borderColor: 'primary.main',                '&:hover': {                  transform: 'translateY(-5px)',                  boxShadow: '0 10px 20px rgba(0,0,0,0.1)',                  bgcolor: 'primary.main',                  color: 'primary.contrastText',                  '& .icon': {                    color: 'white',                    bgcolor: 'primary.dark'                  },                  '& .title': {                    color: 'white'                  },                  '& .description': {                    color: 'rgba(255,255,255,0.8)'                  }                }              }}              onClick={() => navigateTo('/officer/requests/pending')}            >              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>                <Avatar                   className="icon"                  sx={{                     bgcolor: 'primary.light',                     color: 'primary.main',                    mr: 1.5                  }}                >                  <AssignmentIcon />                </Avatar>                <Box>                  <Typography variant="subtitle1" fontWeight="bold" className="title">                    Xử lý yêu cầu                  </Typography>                  <Typography variant="body2" color="text.secondary" className="description">                    Xem và xử lý các yêu cầu đang chờ                  </Typography>                </Box>              </Box>            </Card>          </Grid>                    <Grid item xs={12} sm={6} md={3}>            <Card               sx={{                 p: 2,                height: '100%',                cursor: 'pointer',                transition: 'all 0.3s',                borderRadius: '12px',                border: '1px solid',                borderColor: 'info.main',                '&:hover': {                  transform: 'translateY(-5px)',                  boxShadow: '0 10px 20px rgba(0,0,0,0.1)',                  bgcolor: 'info.main',                  color: 'info.contrastText',                  '& .icon': {                    color: 'white',                    bgcolor: 'info.dark'                  },                  '& .title': {                    color: 'white'                  },                  '& .description': {                    color: 'rgba(255,255,255,0.8)'                  }                }              }}              onClick={() => navigateTo('/officer/citizens')}            >              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>                <Avatar                   className="icon"                  sx={{                     bgcolor: 'info.light',                     color: 'info.main',                    mr: 1.5                  }}                >                  <GroupIcon />                </Avatar>                <Box>                  <Typography variant="subtitle1" fontWeight="bold" className="title">                    Quản lý công dân                  </Typography>                  <Typography variant="body2" color="text.secondary" className="description">                    Xem và quản lý thông tin công dân                  </Typography>                </Box>              </Box>            </Card>          </Grid>                    <Grid item xs={12} sm={6} md={3}>            <Card               sx={{                 p: 2,                height: '100%',                cursor: 'pointer',                transition: 'all 0.3s',                borderRadius: '12px',                border: '1px solid',                borderColor: 'secondary.main',                '&:hover': {                  transform: 'translateY(-5px)',                  boxShadow: '0 10px 20px rgba(0,0,0,0.1)',                  bgcolor: 'secondary.main',                  color: 'secondary.contrastText',                  '& .icon': {                    color: 'white',                    bgcolor: 'secondary.dark'                  },                  '& .title': {                    color: 'white'                  },                  '& .description': {                    color: 'rgba(255,255,255,0.8)'                  }                }              }}              onClick={() => navigateTo('/officer/statistics')}            >              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>                <Avatar                   className="icon"                  sx={{                     bgcolor: 'secondary.light',                     color: 'secondary.main',                    mr: 1.5                  }}                >                  <ChartIcon />                </Avatar>                <Box>                  <Typography variant="subtitle1" fontWeight="bold" className="title">                    Thống kê                  </Typography>                  <Typography variant="body2" color="text.secondary" className="description">                    Xem báo cáo và thống kê                  </Typography>                </Box>              </Box>            </Card>          </Grid>                    <Grid item xs={12} sm={6} md={3}>            <Card               sx={{                 p: 2,                height: '100%',                cursor: 'pointer',                transition: 'all 0.3s',                borderRadius: '12px',                border: '1px solid',                borderColor: 'success.main',                '&:hover': {                  transform: 'translateY(-5px)',                  boxShadow: '0 10px 20px rgba(0,0,0,0.1)',                  bgcolor: 'success.main',                  color: 'success.contrastText',                  '& .icon': {                    color: 'white',                    bgcolor: 'success.dark'                  },                  '& .title': {                    color: 'white'                  },                  '& .description': {                    color: 'rgba(255,255,255,0.8)'                  }                }              }}              onClick={() => navigateTo('/officer/profile')}            >              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>                <Avatar                   className="icon"                  sx={{                     bgcolor: 'success.light',                     color: 'success.main',                    mr: 1.5                  }}                >                  <ProfileIcon />                </Avatar>                <Box>                  <Typography variant="subtitle1" fontWeight="bold" className="title">                    Hồ sơ cá nhân                  </Typography>                  <Typography variant="body2" color="text.secondary" className="description">                    Cập nhật thông tin cá nhân                  </Typography>                </Box>              </Box>            </Card>          </Grid>        </Grid>      </Paper>
      
            {/* Stats Cards */}      <Grid container spacing={3} sx={{ mb: 4 }}>        <Grid item xs={12} sm={6} md={3}>          <Card             sx={{               height: '100%',               bgcolor: 'primary.light',               color: 'primary.contrastText',              position: 'relative',              overflow: 'hidden',              transition: 'transform 0.3s',              '&:hover': {                transform: 'translateY(-5px)',                boxShadow: '0 8px 16px rgba(0,0,0,0.2)'              }            }}          >            <Box               sx={{                 position: 'absolute',                 top: 0,                 left: 0,                 width: '100%',                 height: '4px',                bgcolor: 'primary.dark'               }}             />            <CardContent sx={{ pt: 3 }}>              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>                <Box>                  <Typography variant="h4" component="div" fontWeight="bold">                    {dashboardData?.stats?.pending_requests || 0}                  </Typography>                  <Typography variant="body1" sx={{ mt: 1 }}>                    Yêu cầu chờ xử lý                  </Typography>                </Box>                <Avatar sx={{ bgcolor: 'primary.dark', p: 1 }}>                  <PendingIcon fontSize="medium" />                </Avatar>              </Box>                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>                <Button                   size="small"                   variant="contained"                   color="primary"                  endIcon={<ArrowForwardIcon />}                  onClick={() => navigateTo('/officer/requests/pending')}                  sx={{                     borderRadius: '20px',                    boxShadow: 'none',                    '&:hover': { boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }                  }}                >                  Xử lý ngay                </Button>              </Box>            </CardContent>          </Card>        </Grid>                <Grid item xs={12} sm={6} md={3}>          <Card             sx={{               height: '100%',               bgcolor: 'success.light',               color: 'success.contrastText',              position: 'relative',              overflow: 'hidden',              transition: 'transform 0.3s',              '&:hover': {                transform: 'translateY(-5px)',                boxShadow: '0 8px 16px rgba(0,0,0,0.2)'              }            }}          >            <Box               sx={{                 position: 'absolute',                 top: 0,                 left: 0,                 width: '100%',                 height: '4px',                bgcolor: 'success.dark'               }}             />            <CardContent sx={{ pt: 3 }}>              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>                <Box>                  <Typography variant="h4" component="div" fontWeight="bold">                    {dashboardData?.stats?.completed_requests || 0}                  </Typography>                  <Typography variant="body1" sx={{ mt: 1 }}>                    Yêu cầu đã xử lý                  </Typography>                </Box>                <Avatar sx={{ bgcolor: 'success.dark', p: 1 }}>                  <CheckIcon fontSize="medium" />                </Avatar>              </Box>                            <Box sx={{ mt: 2 }}>                <LinearProgress                   variant="determinate"                   value={dashboardData?.stats?.completion_rate || 0}                   color="success"                  sx={{ height: 6, borderRadius: 3 }}                />                <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>                  Tỷ lệ hoàn thành: {dashboardData?.stats?.completion_rate || 0}%                </Typography>              </Box>            </CardContent>          </Card>        </Grid>                <Grid item xs={12} sm={6} md={3}>          <Card             sx={{               height: '100%',               bgcolor: 'info.light',               color: 'info.contrastText',              position: 'relative',              overflow: 'hidden',              transition: 'transform 0.3s',              '&:hover': {                transform: 'translateY(-5px)',                boxShadow: '0 8px 16px rgba(0,0,0,0.2)'              }            }}          >            <Box               sx={{                 position: 'absolute',                 top: 0,                 left: 0,                 width: '100%',                 height: '4px',                bgcolor: 'info.dark'               }}             />            <CardContent sx={{ pt: 3 }}>              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>                <Box>                  <Typography variant="h4" component="div" fontWeight="bold">                    {dashboardData?.stats?.total_citizens || 0}                  </Typography>                  <Typography variant="body1" sx={{ mt: 1 }}>                    Tổng số công dân                  </Typography>                </Box>                <Avatar sx={{ bgcolor: 'info.dark', p: 1 }}>                  <GroupIcon fontSize="medium" />                </Avatar>              </Box>                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>                <Chip                   icon={<CalendarIcon fontSize="small" />}                   label={`${dashboardData?.stats?.new_citizens_this_month || 0} công dân mới tháng này`}                  size="small"                  color="info"                />              </Box>            </CardContent>          </Card>        </Grid>                <Grid item xs={12} sm={6} md={3}>          <Card             sx={{               height: '100%',               bgcolor: 'secondary.light',               color: 'secondary.contrastText',              position: 'relative',              overflow: 'hidden',              transition: 'transform 0.3s',              '&:hover': {                transform: 'translateY(-5px)',                boxShadow: '0 8px 16px rgba(0,0,0,0.2)'              }            }}          >            <Box               sx={{                 position: 'absolute',                 top: 0,                 left: 0,                 width: '100%',                 height: '4px',                bgcolor: 'secondary.dark'               }}             />            <CardContent sx={{ pt: 3 }}>              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>                <Box>                  <Typography variant="h4" component="div" fontWeight="bold">                    {dashboardData?.stats?.total_documents || 0}                  </Typography>                  <Typography variant="body1" sx={{ mt: 1 }}>                    Giấy tờ đã cấp                  </Typography>                </Box>                <Avatar sx={{ bgcolor: 'secondary.dark', p: 1 }}>                  <DescriptionIcon fontSize="medium" />                </Avatar>              </Box>                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>                <Badge                   badgeContent={dashboardData?.stats?.documents_this_week || 0}                   color="error"                   max={99}                  sx={{ '& .MuiBadge-badge': { fontSize: '0.7rem', height: '18px', minWidth: '18px' } }}                >                  <Chip                     icon={<SpeedIcon fontSize="small" />}                     label="Tuần này"                    size="small"                    color="secondary"                  />                </Badge>              </Box>            </CardContent>          </Card>        </Grid>      </Grid>
      
      {/* Lists */}
      <Grid container spacing={3}>
        {/* Pending Requests */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="medium">
                Yêu cầu chờ xử lý
              </Typography>
              <Button 
                variant="outlined" 
                size="small"
                startIcon={<ViewListIcon />}
                onClick={() => navigateTo('/officer/pending-requests')}
              >
                Xem tất cả
              </Button>
            </Box>
            
            {dashboardData?.pending_requests?.length > 0 ? (
              <List disablePadding>
                {dashboardData.pending_requests.map((request, index) => (
                  <React.Fragment key={request.id}>
                    <ListItem 
                      alignItems="flex-start" 
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                      onClick={() => handleViewRequest(request.id)}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1" fontWeight="medium">
                              {request.title}
                            </Typography>
                            {request.priority === 'high' && (
                              <Chip label="Ưu tiên" color="error" size="small" />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Người yêu cầu: {request.citizen?.name || 'Không xác định'}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                Ngày nộp: {formatDate(request.submittedDate)}
                              </Typography>
                              {getStatusChip(request.status)}
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < dashboardData.pending_requests.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ py: 2, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  Không có yêu cầu nào chờ xử lý
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Recent Citizens */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="medium">
                Công dân mới đăng ký
              </Typography>
              <Button 
                variant="outlined" 
                size="small"
                startIcon={<GroupIcon />}
                onClick={() => navigateTo('/officer/citizens')}
              >
                Quản lý công dân
              </Button>
            </Box>
            
            {dashboardData?.recent_citizens?.length > 0 ? (
              <List disablePadding>
                {dashboardData.recent_citizens.map((citizen, index) => (
                  <React.Fragment key={citizen.id}>
                    <ListItem 
                      alignItems="flex-start" 
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                      onClick={() => navigateTo(`/officer/citizens`)}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" fontWeight="medium">
                            {citizen.name}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Email: {citizen.email}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              SĐT: {citizen.phone}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                Yêu cầu gần nhất: {citizen.lastRequest ? formatDate(citizen.lastRequest) : 'Chưa có'}
                              </Typography>
                              <Chip 
                                label={`${citizen.totalRequests} yêu cầu`} 
                                size="small" 
                                color={citizen.totalRequests > 0 ? 'primary' : 'default'} 
                              />
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < dashboardData.recent_citizens.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ py: 2, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  Không có công dân mới đăng ký
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Completed Requests */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="medium">
                Yêu cầu đã xử lý gần đây
              </Typography>
              <Button 
                variant="outlined" 
                size="small"
                startIcon={<RefreshIcon />}
                onClick={fetchDashboardData}
              >
                Làm mới
              </Button>
            </Box>
            
            {dashboardData?.completed_requests?.length > 0 ? (
              <List disablePadding>
                <Grid container>
                  {dashboardData.completed_requests.map((request, index) => (
                    <Grid item xs={12} md={6} key={request.id}>
                      <ListItem 
                        alignItems="flex-start" 
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'action.hover' }
                        }}
                        onClick={() => handleViewRequest(request.id)}
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="subtitle1" fontWeight="medium">
                                {request.title}
                              </Typography>
                              {getStatusChip(request.status)}
                            </Box>
                          }
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                Người yêu cầu: {request.citizen?.name || 'Không xác định'}
                              </Typography>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                <Typography variant="caption" color="text.secondary">
                                  Hoàn thành: {formatDate(request.completedDate)}
                                </Typography>
                              </Box>
                              {request.rejectReason && (
                                <Typography variant="caption" color="error">
                                  Lý do từ chối: {request.rejectReason}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < dashboardData.completed_requests.length - 1 && <Divider />}
                    </Grid>
                  ))}
                </Grid>
              </List>
            ) : (
              <Box sx={{ py: 2, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  Không có yêu cầu nào đã xử lý
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