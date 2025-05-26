import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider,
  useTheme,
  Container,
  IconButton,
  Tab,
  Tabs,
  Paper
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  Description as DocumentIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Notifications as NotificationIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
  BarChart as BarChartIcon,
  ViewList as ViewListIcon
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import citizenService from '../../../services/api/citizenService';
import { formatDate } from '../../../utils/dateUtils';
import DashboardCharts from '../../../components/citizen/Dashboard/DashboardCharts';

const CitizenDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('stats'); // 'stats' or 'charts'

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Call API service
      const data = await citizenService.getDashboardStats();
      console.log('Citizen dashboard data:', data);
      
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching citizen dashboard data:', err);
      setError('Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  // Handle view mode change
  const handleViewModeChange = (event, newValue) => {
    setViewMode(newValue);
  };

  // Effect to fetch data on mount
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Loading state
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px' 
      }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 2 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Thử lại
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  // Get status color for request status
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'processing':
      case 'in_review':
        return 'info';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  // Get status label
  const getStatusLabel = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'Hoàn thành';
      case 'approved':
        return 'Đã duyệt';
      case 'pending':
        return 'Chờ xử lý';
      case 'processing':
        return 'Đang xử lý';
      case 'in_review':
        return 'Đang xem xét';
      case 'rejected':
        return 'Từ chối';
      default:
        return status || 'Không xác định';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
            Dashboard Công dân
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Chào mừng {currentUser?.first_name || currentUser?.email}! Quản lý hồ sơ và yêu cầu của bạn.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tabs
            value={viewMode}
            onChange={handleViewModeChange}
            sx={{ mr: 2 }}
          >
            <Tab 
              value="stats" 
              label="Thống kê" 
              icon={<ViewListIcon />} 
              iconPosition="start"
            />
            <Tab 
              value="charts" 
              label="Biểu đồ" 
              icon={<BarChartIcon />} 
              iconPosition="start"
            />
          </Tabs>
          <IconButton 
            onClick={handleRefresh} 
            disabled={refreshing}
            sx={{ 
              backgroundColor: theme.palette.primary.main + '10',
              '&:hover': { backgroundColor: theme.palette.primary.main + '20' }
            }}
          >
            <RefreshIcon sx={{ 
              animation: refreshing ? 'spin 1s linear infinite' : 'none',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' }
              }
            }} />
          </IconButton>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid item xs={12} md={3}>
          <Card sx={{ 
            height: '100%', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AssignmentIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Tổng yêu cầu</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                {dashboardData?.totalRequests || 0}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                Tất cả yêu cầu đã tạo
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ScheduleIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Chờ xử lý</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                {dashboardData?.pendingRequests || 0}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                Yêu cầu đang chờ
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircleIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Hoàn thành</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                {dashboardData?.completedRequests || 0}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                Yêu cầu đã hoàn thành
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <DocumentIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Giấy tờ</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                {dashboardData?.totalDocuments || 0}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                Giấy tờ đã cấp
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {viewMode === 'charts' ? (
          // Charts View
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <DashboardCharts dashboardData={dashboardData} />
            </Paper>
          </Grid>
        ) : (
          // Default Stats View
          <>
            {/* Quick Actions */}
            <Grid item xs={12} md={8}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <DashboardIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                    Thao tác nhanh
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/citizen/requests/new')}
                        sx={{ 
                          py: 2,
                          background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                          boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
                        }}
                      >
                        Tạo yêu cầu mới
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<AssignmentIcon />}
                        onClick={() => navigate('/citizen/requests')}
                        sx={{ py: 2 }}
                      >
                        Xem yêu cầu
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<DocumentIcon />}
                        onClick={() => navigate('/citizen/documents')}
                        sx={{ py: 2 }}
                      >
                        Giấy tờ của tôi
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<PersonIcon />}
                        onClick={() => navigate('/citizen/profile')}
                        sx={{ py: 2 }}
                      >
                        Cập nhật hồ sơ
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Recent Activity */}
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <NotificationIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                    Hoạt động gần đây
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  {dashboardData?.recentActivity?.length > 0 ? (
                    <List dense>
                      {dashboardData.recentActivity.map((activity) => (
                        <ListItem key={activity.id} sx={{ px: 0 }}>
                          <ListItemIcon>
                            <Avatar sx={{ 
                              width: 32, 
                              height: 32, 
                              bgcolor: theme.palette.primary.main 
                            }}>
                              {activity.type === 'request' ? <AssignmentIcon /> : <DocumentIcon />}
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={activity.title}
                            secondary={
                              <>
                                {activity.description && <span>{activity.description} • </span>}
                                {formatDate(activity.date)}
                              </>
                            }
                            primaryTypographyProps={{ variant: 'body2' }}
                            secondaryTypographyProps={{ variant: 'caption' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                      Chưa có hoạt động nào
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Recent Requests */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <AssignmentIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                    Yêu cầu gần đây
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  {dashboardData?.recentRequests?.length > 0 ? (
                    <List>
                      {dashboardData.recentRequests.map((request) => (
                        <ListItem 
                          key={request.id}
                          button
                          onClick={() => navigate(`/citizen/requests/${request.id}`)}
                          sx={{ 
                            border: '1px solid',
                            borderColor: theme.palette.divider,
                            borderRadius: 1,
                            mb: 1,
                            '&:hover': {
                              backgroundColor: theme.palette.action.hover
                            }
                          }}
                        >
                          <ListItemText
                            primary={request.title || `Yêu cầu #${request.id}`}
                            secondary={
                              <>
                                <Typography variant="caption" component="span">
                                  {request.type && `${request.type} • `}
                                </Typography>
                                <Typography variant="caption" component="span">
                                  Tạo ngày: {formatDate(request.created_at || new Date())}
                                </Typography>
                                {request.assigned_to && (
                                  <Typography variant="caption" component="span">
                                    {` • Cán bộ xử lý: ${request.assigned_to}`}
                                  </Typography>
                                )}
                                {!request.assigned_to && request.status === 'pending' && (
                                  <Typography variant="caption" component="span" sx={{ color: 'warning.main' }}>
                                    {' • Đang chờ phân công cán bộ'}
                                  </Typography>
                                )}
                              </>
                            }
                          />
                          <Chip
                            label={getStatusLabel(request.status)}
                            color={getStatusColor(request.status)}
                            size="small"
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                      Bạn chưa có yêu cầu nào
                    </Typography>
                  )}
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/citizen/requests')}
                      startIcon={<AssignmentIcon />}
                    >
                      Xem tất cả yêu cầu
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
      </Grid>
    </Container>
  );
};

export default CitizenDashboard;
