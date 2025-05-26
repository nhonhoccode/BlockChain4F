import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Card, 
  CardContent, 
  CardHeader,
  Avatar, 
  Button, 
  Chip, 
  Divider, 
  CircularProgress,
  Alert,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton
} from '@mui/material';
import { 
  Description as DocumentIcon, 
  Assignment as RequestIcon, 
  Notifications as NotificationIcon,
  CheckCircle as VerifiedIcon,
  Schedule as PendingIcon,
  Cancel as RejectedIcon,
  TrendingUp as TrendingUpIcon,
  Info as InfoIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import citizenService from '../../../services/api/citizenService';
import { CitizenDashboardStats } from '../../../types/citizen';
import { AppError, isNotImplementedError } from '../../../utils/errorHandler';
import { API_ENDPOINTS } from '../../../utils/api';
import '../../../components/citizen/Dashboard/CitizenDashboard.scss';

// Định nghĩa interface cho dữ liệu
interface UserData {
  id: string;
  name: string;
  email: string;
}

interface Activity {
  id: number;
  type: string;
  status: string;
  title: string;
  date: string;
  request_id?: number;
  document_id?: number;
}

interface DashboardData {
  user: UserData;
  stats: {
    totalRequests: number;
    pendingRequests: number;
    processingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
  };
  documents: Array<any>;
  recentActivity: Array<Activity>;
}

const CitizenDashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  
  // Định nghĩa hàm fetchDashboardData sử dụng useCallback để tránh re-renders không cần thiết
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Gọi API từ service
      const stats = await citizenService.getDashboardStats();
      
      if (stats) {
        console.log('Dashboard data received:', stats);
        
        // Chuyển đổi dữ liệu từ API sang định dạng cần thiết
        const formattedData: DashboardData = {
          user: currentUser || { id: '', name: '', email: '' },
          stats: {
            totalRequests: stats.totalRequests,
            pendingRequests: stats.pendingRequests,
            processingRequests: stats.processingRequests,
            approvedRequests: stats.approvedRequests,
            rejectedRequests: stats.rejectedRequests
          },
          documents: stats.documents || [],
          recentActivity: stats.recentActivity || []
        };
        
        setDashboardData(formattedData);
        setError(null);
      } else {
        throw new Error('Invalid data format');
      }
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      
      // Kiểm tra xem lỗi có phải do API chưa triển khai không
      if (err.response && isNotImplementedError(err)) {
        console.log('API not implemented yet, showing empty state');
        // Tạo dữ liệu rỗng để hiển thị UI khi API chưa sẵn sàng
        const emptyData: DashboardData = {
          user: currentUser || { id: '', name: '', email: '' },
          stats: {
            totalRequests: 0,
            pendingRequests: 0,
            processingRequests: 0,
            approvedRequests: 0,
            rejectedRequests: 0
          },
          documents: [],
          recentActivity: []
        };
        
        setDashboardData(emptyData);
        setError('API đang được phát triển. Vui lòng thử lại sau.');
      } else {
        // Xử lý các lỗi khác
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  }, [currentUser, dashboardData]);
  
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);
  
  // Helper function to format dates
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'HH:mm - dd/MM/yyyy', { locale: vi });
    } catch (error) {
      console.error('Invalid date format:', dateString);
      return 'Không xác định';
    }
  };

  // Hàm trả về icon dựa trên trạng thái
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <PendingIcon />;
      case 'completed':
        return <VerifiedIcon />;
      case 'rejected':
        return <RejectedIcon />;
      default:
        return <InfoIcon />;
    }
  };

  // Hàm trả về text dựa trên trạng thái
  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Đang chờ xử lý';
      case 'completed':
        return 'Đã hoàn thành';
      case 'rejected':
        return 'Đã từ chối';
      default:
        return 'Không xác định';
    }
  };

  // Hàm trả về icon dựa trên loại hoạt động
  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'document':
        return <DocumentIcon />;
      case 'request':
        return <RequestIcon />;
      case 'notification':
        return <NotificationIcon />;
      default:
        return <InfoIcon />;
    }
  };

  // Render loading spinner
  if (loading && !dashboardData) {
    return (
      <Box className="loading-container">
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Đang tải dữ liệu...
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="citizen-dashboard">
      {/* Error alert */}
      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Dashboard Layout */}
      <Grid container spacing={3}>
        {/* Left column - Main content */}
        <Grid item xs={12} md={8}>
          {/* Welcome card */}
          <Card className="welcome-card" sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={8}>
                  <Typography variant="h5" gutterBottom>
                    Xin chào, {dashboardData?.user?.name || 'Công dân'}
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    Chào mừng bạn đến với Hệ thống quản lý hành chính blockchain.
                    Bạn có thể theo dõi trạng thái các yêu cầu và giấy tờ tại đây.
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Avatar
                    src={currentUser?.photoURL || undefined}
                    sx={{ width: 80, height: 80 }}
                  >
                    {dashboardData?.user?.name?.charAt(0) || 'C'}
                  </Avatar>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Statistics cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <Card className="stat-card">
                <CardContent>
                  <Box className="stat-card__header">
                    <Avatar className="stat-card__icon" sx={{ bgcolor: 'primary.main' }}>
                      <DocumentIcon />
                    </Avatar>
                  </Box>
                  <Box className="stat-card__content">
                    <Typography variant="body2" className="stat-card__label">
                      Tổng số giấy tờ
                    </Typography>
                    <Typography variant="h4" className="stat-card__value">
                      {dashboardData?.stats?.totalRequests || 0}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card className="stat-card">
                <CardContent>
                  <Box className="stat-card__header">
                    <Avatar className="stat-card__icon" sx={{ bgcolor: 'warning.main' }}>
                      <PendingIcon />
                    </Avatar>
                  </Box>
                  <Box className="stat-card__content">
                    <Typography variant="body2" className="stat-card__label">
                      Yêu cầu đang chờ
                    </Typography>
                    <Typography variant="h4" className="stat-card__value">
                      {dashboardData?.stats?.pendingRequests || 0}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card className="stat-card">
                <CardContent>
                  <Box className="stat-card__header">
                    <Avatar className="stat-card__icon" sx={{ bgcolor: 'info.main' }}>
                      <NotificationIcon />
                    </Avatar>
                  </Box>
                  <Box className="stat-card__content">
                    <Typography variant="body2" className="stat-card__label">
                      Đang xử lý
                    </Typography>
                    <Typography variant="h4" className="stat-card__value">
                      {dashboardData?.stats?.processingRequests || 0}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Recent activity */}
          <Card sx={{ mb: { xs: 3, md: 0 } }}>
            <CardHeader 
              title="Hoạt động gần đây"
              action={
                <Button 
                  size="small" 
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/citizen/requests')}
                >
                  Xem tất cả
                </Button>
              }
            />
            <Divider />
            <CardContent>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell width={50}>#</TableCell>
                      <TableCell>Loại</TableCell>
                      <TableCell>Tiêu đề</TableCell>
                      <TableCell>Trạng thái</TableCell>
                      <TableCell>Ngày</TableCell>
                      <TableCell align="right">Hành động</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData?.recentActivity && dashboardData.recentActivity.length > 0 ? (
                      dashboardData.recentActivity.map((activity, index) => (
                        <TableRow key={activity.id} className="citizen-dashboard__activity-row">
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {getActivityIcon(activity.type)}
                              <Box component="span" sx={{ ml: 1 }}>
                                {activity.type === 'document' ? 'Giấy tờ' : 'Yêu cầu'}
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>{activity.title}</TableCell>
                          <TableCell>
                            <Chip
                              icon={getStatusIcon(activity.status)}
                              label={getStatusText(activity.status)}
                              color={
                                activity.status === 'completed' 
                                  ? 'success' 
                                  : activity.status === 'rejected' 
                                    ? 'error' 
                                    : 'warning'
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{formatDate(activity.date)}</TableCell>
                          <TableCell align="right">
                            <IconButton 
                              size="small"
                              onClick={() => {
                                // Navigate to detail page based on type
                                if (activity.type === 'document') {
                                  navigate(`/citizen/documents/${activity.document_id}`);
                                } else {
                                  navigate(`/citizen/requests/${activity.request_id}`);
                                }
                              }}
                            >
                              <ArrowForwardIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography variant="body2" color="textSecondary">
                            Không có hoạt động nào gần đây
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Right column - Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Profile card */}
          <Card className="profile-card" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Thông tin của bạn
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box className="profile-card__info">
                <Typography variant="body2" color="textSecondary">Email</Typography>
                <Typography variant="body1">{dashboardData?.user?.email || 'N/A'}</Typography>
              </Box>
              
              <Box className="profile-card__stats">
                <Box className="profile-card__stat-item">
                  <VerifiedIcon color="primary" />
                  <Box>
                    <Typography variant="body2">Giấy tờ đã xác thực</Typography>
                    <Typography variant="h6">{dashboardData?.stats?.approvedRequests || 0}</Typography>
                  </Box>
                </Box>
                
                <Box className="profile-card__stat-item">
                  <VerifiedIcon color="primary" />
                  <Box>
                    <Typography variant="body2">Yêu cầu đã hoàn thành</Typography>
                    <Typography variant="h6">{dashboardData?.stats?.approvedRequests || 0}</Typography>
                  </Box>
                </Box>
                
                <Box className="profile-card__stat-item">
                  <RejectedIcon color="error" />
                  <Box>
                    <Typography variant="body2">Yêu cầu bị từ chối</Typography>
                    <Typography variant="h6">{dashboardData?.stats?.rejectedRequests || 0}</Typography>
                  </Box>
                </Box>
              </Box>
              
              <Button 
                variant="outlined" 
                fullWidth 
                sx={{ mt: 2 }}
                onClick={() => navigate('/citizen/profile')}
              >
                Cập nhật thông tin
              </Button>
            </CardContent>
          </Card>
          
          {/* Quick actions */}
          <Card className="quick-actions">
            <CardHeader title="Thao tác nhanh" />
            <Divider />
            <CardContent>
              <Button
                variant="contained"
                fullWidth
                startIcon={<RequestIcon />}
                sx={{ mb: 2 }}
                onClick={() => navigate('/citizen/requests/new')}
              >
                Tạo yêu cầu mới
              </Button>
              
              <Button
                variant="outlined"
                fullWidth
                startIcon={<DocumentIcon />}
                sx={{ mb: 2 }}
                onClick={() => navigate('/citizen/documents')}
              >
                Xem giấy tờ của tôi
              </Button>
              
              <Button
                variant="outlined"
                fullWidth
                startIcon={<TrendingUpIcon />}
                onClick={() => navigate('/citizen/requests')}
              >
                Theo dõi yêu cầu
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CitizenDashboard; 
