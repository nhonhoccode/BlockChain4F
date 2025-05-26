import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Button,
  Divider,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tab,
  Tabs
} from '@mui/material';
import {
  Group as GroupIcon,
  Assignment as RequestIcon,
  CheckCircle as CheckCircleIcon,
  PendingActions as PendingIcon,
  AccessTime as TimeIcon,
  ArrowForward as ArrowForwardIcon,
  Info as InfoIcon,
  DoNotDisturb as RejectedIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { api, handleApiError, API_ENDPOINTS } from '../../../utils/api';
import { isNotImplementedError } from '../../../utils/errorHandler';
import { useAuth } from '../../../contexts/AuthContext';
import '../../../components/officer/Dashboard/OfficerDashboard.scss';

// TypeScript interfaces
interface Stats {
  total_requests: number;
  pending_requests: number;
  completed_requests: number;
  total_citizens: number;
}

interface Citizen {
  id: number;
  name: string;
  email: string;
  phone: string;
  total_requests: number;
  last_request_date?: string | null;
  avatar?: string | null;
}

interface RequestItem {
  id: number;
  title: string;
  status: string;
  submittedDate: string;
  completedDate?: string;
  deadline?: string;
  priority: string;
  citizen: {
    id: number;
    name: string;
    phone?: string;
  };
  rejectReason?: string | null;
}

interface DashboardData {
  stats: Stats;
  pending_requests: RequestItem[];
  completed_requests: RequestItem[];
  recent_citizens: Citizen[];
  _isMockData?: boolean;
}

interface StatusInfo {
  color: 'success' | 'warning' | 'info' | 'error' | 'default';
  label: string;
  icon: React.ReactElement;
}

const OfficerDashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Thêm debug log
      console.log('Fetching dashboard stats for officer:', currentUser?.email);
      
      // Gọi API để lấy dữ liệu dashboard
      const response = await api.get(API_ENDPOINTS.OFFICER.DASHBOARD);
      
      if (response.data) {
        console.log('Officer dashboard data received:', response.data);
        
        // Kiểm tra xem đây có phải là dữ liệu mẫu không
        if (response.data._isMockData) {
          console.log('This is mock data provided by API interceptor');
          setDashboardData(response.data);
          
          // Hiển thị thông báo khi dùng dữ liệu mẫu
          let errorMessage = 'Đang hiển thị dữ liệu mẫu do lỗi từ backend.';
          
          if (response.data._errorDetails) {
            errorMessage = `${response.data._errorDetails}. ${errorMessage}`;
          }
          
          if (response.data._mockInfo) {
            console.info(response.data._mockInfo);
          }
          
          setError(errorMessage);
        } else {
          // Dữ liệu thật từ API
          setDashboardData(response.data);
          setError(null);
        }
      } else {
        throw new Error('Invalid data format');
      }
    } catch (err: any) {
      console.error('Error in officer dashboard stats:', err?.message || err);
      
      // Kiểm tra xem có mockData từ service không
      if (err.mockData) {
        console.log('Using mock data from service:', err.mockData);
        setDashboardData(err.mockData);
        
        // Tạo thông báo lỗi dựa trên metadata của mock data
        let errorMessage = 'Máy chủ đang gặp sự cố. Đang hiển thị dữ liệu tạm thời.';
        
        if (err.mockData._errorDetails) {
          errorMessage = `${err.mockData._errorDetails} Đang hiển thị dữ liệu mẫu để bạn có thể tiếp tục làm việc.`;
        } else if (err.mockData._errorMessage) {
          errorMessage = `Lỗi API: ${err.mockData._errorMessage}. Đang hiển thị dữ liệu mẫu.`;
        }
        
        if (err.mockData._fixSuggestion) {
          errorMessage += ` ${err.mockData._fixSuggestion}`;
        }
        
        setError(errorMessage);
        
        return; // Dừng xử lý lỗi vì đã có dữ liệu mockup
      }
      
      // Xử lý trường hợp không có mock data từ service
      handleApiError(err, {
        defaultMessage: 'Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.',
        callback: (errorMsg) => {
          console.error('Dashboard error handled:', errorMsg);
          
          // Tạo dữ liệu mẫu an toàn khi API gặp lỗi
          const safeEmptyData: DashboardData = {
            stats: {
              total_requests: 0,
              pending_requests: 0,
              completed_requests: 0,
              total_citizens: 0
            },
            pending_requests: [],
            completed_requests: [],
            recent_citizens: []
          };
          
          setDashboardData(safeEmptyData);
          setError(errorMsg);
        }
      });
    } finally {
      setLoading(false);
    }
  }, [currentUser?.email]);

  useEffect(() => {
    fetchDashboardData();
    
    // Thiết lập interval để tự động làm mới dữ liệu mỗi 5 phút
    const refreshInterval = setInterval(() => {
      fetchDashboardData();
    }, 5 * 60 * 1000);
    
    // Cleanup interval khi component unmount
    return () => clearInterval(refreshInterval);
  }, [fetchDashboardData]);

  // Format date helper
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Không xác định';
    try {
      const date = parseISO(dateString);
      return format(date, 'dd/MM/yyyy HH:mm', { locale: vi });
    } catch (error) {
      console.error('Date format error:', error);
      return 'Không xác định';
    }
  };

  // Get status chip color and icon
  const getStatusInfo = (status: string): StatusInfo => {
    switch (status) {
      case 'completed':
      case 'approved':
        return { 
          color: 'success', 
          label: 'Hoàn thành', 
          icon: <CheckCircleIcon fontSize="small" /> 
        };
      case 'pending':
      case 'submitted':
        return { 
          color: 'warning', 
          label: 'Đang chờ', 
          icon: <PendingIcon fontSize="small" /> 
        };
      case 'processing':
      case 'in_review':
        return { 
          color: 'info', 
          label: 'Đang xử lý', 
          icon: <TimeIcon fontSize="small" /> 
        };
      case 'rejected':
        return { 
          color: 'error', 
          label: 'Từ chối', 
          icon: <RejectedIcon fontSize="small" /> 
        };
      default:
        return { 
          color: 'default', 
          label: status || 'Không xác định', 
          icon: <InfoIcon fontSize="small" /> 
        };
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleViewCitizen = (citizenId: number) => {
    navigate(`/officer/citizen-management/${citizenId}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !dashboardData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => window.location.reload()}
        >
          Tải lại trang
        </Button>
      </Box>
    );
  }

  // If no data, show empty state
  if (!dashboardData) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '80vh',
        textAlign: 'center'
      }}>
        <InfoIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h5" color="text.primary" gutterBottom>
          Không có dữ liệu
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mb: 3 }}>
          Hiện tại không có dữ liệu thống kê. Vui lòng thử lại sau hoặc liên hệ với quản trị viên để được hỗ trợ.
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => fetchDashboardData()}
        >
          Tải lại dữ liệu
        </Button>
      </Box>
    );
  }

  const { stats = {} as Stats, pending_requests = [], completed_requests = [], recent_citizens = [] } = dashboardData;

  return (
    <Box className="officer-dashboard">
      <Box className="officer-dashboard__container">
        {error && (
          <Alert 
            severity={dashboardData && dashboardData._isMockData ? "info" : "warning"}
            sx={{ mb: 3 }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={() => fetchDashboardData()}
              >
                Tải lại
              </Button>
            }
          >
            {error}
            {dashboardData && dashboardData._isMockData && (
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Lưu ý: Bạn đang xem dữ liệu mẫu. Một số chức năng có thể không hoạt động đầy đủ.
              </Typography>
            )}
          </Alert>
        )}
        
        {/* Overview Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card className="officer-dashboard__stats-card">
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <Avatar className="stats-icon" sx={{ bgcolor: theme.palette.primary.main }}>
                    <RequestIcon />
                  </Avatar>
                  <Typography variant="h6" color="text.secondary">
                    Tổng yêu cầu
                  </Typography>
                </Box>
                <Typography variant="h4" component="div" className="stats-value">
                  {stats.total_requests || 0}
                </Typography>
                <Button 
                  color="primary" 
                  size="small" 
                  sx={{ mt: 1 }}
                  onClick={() => navigate('/officer/requests')}
                >
                  Xem chi tiết
                </Button>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card className="officer-dashboard__stats-card">
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <Avatar className="stats-icon" sx={{ bgcolor: theme.palette.warning.main }}>
                    <PendingIcon />
                  </Avatar>
                  <Typography variant="h6" color="text.secondary">
                    Yêu cầu đang xử lý
                  </Typography>
                </Box>
                <Typography variant="h4" component="div" className="stats-value">
                  {stats.pending_requests || 0}
                </Typography>
                <Button 
                  color="warning" 
                  size="small" 
                  sx={{ mt: 1 }}
                  onClick={() => navigate('/officer/requests?status=pending')}
                >
                  Xem chi tiết
                </Button>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card className="officer-dashboard__stats-card">
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <Avatar className="stats-icon" sx={{ bgcolor: theme.palette.success.main }}>
                    <CheckCircleIcon />
                  </Avatar>
                  <Typography variant="h6" color="text.secondary">
                    Yêu cầu đã hoàn thành
                  </Typography>
                </Box>
                <Typography variant="h4" component="div" className="stats-value">
                  {stats.completed_requests || 0}
                </Typography>
                <Button 
                  color="success" 
                  size="small" 
                  sx={{ mt: 1 }}
                  onClick={() => navigate('/officer/requests?status=completed')}
                >
                  Xem chi tiết
                </Button>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card className="officer-dashboard__stats-card">
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <Avatar className="stats-icon" sx={{ bgcolor: theme.palette.info.main }}>
                    <GroupIcon />
                  </Avatar>
                  <Typography variant="h6" color="text.secondary">
                    Tổng số công dân
                  </Typography>
                </Box>
                <Typography variant="h4" component="div" className="stats-value">
                  {stats.total_citizens || 0}
                </Typography>
                <Button 
                  color="info" 
                  size="small" 
                  sx={{ mt: 1 }}
                  onClick={() => navigate('/officer/citizen-management')}
                >
                  Xem chi tiết
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Requests and Citizens Tabs */}
        <Card className="officer-dashboard__tabs-container">
          <Box className="tabs-header">
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab label="Yêu cầu đang chờ xử lý" />
              <Tab label="Yêu cầu đã hoàn thành" />
              <Tab label="Công dân gần đây" />
            </Tabs>
          </Box>
          
          {/* Pending Requests Tab */}
          {activeTab === 0 && (
            <Box className="tab-content">
              {pending_requests.length > 0 ? (
                <TableContainer className="table-container">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Mã</TableCell>
                        <TableCell>Tiêu đề</TableCell>
                        <TableCell>Trạng thái</TableCell>
                        <TableCell>Công dân</TableCell>
                        <TableCell>Ngày nộp</TableCell>
                        <TableCell align="right">Thao tác</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pending_requests.map((request) => {
                        const statusInfo = getStatusInfo(request.status);
                        
                        return (
                          <TableRow key={request.id} hover>
                            <TableCell>{request.id}</TableCell>
                            <TableCell>{request.title}</TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                icon={statusInfo.icon}
                                label={statusInfo.label}
                                color={statusInfo.color}
                                className="status-chip"
                              />
                            </TableCell>
                            <TableCell>{request.citizen.name}</TableCell>
                            <TableCell>{formatDate(request.submittedDate)}</TableCell>
                            <TableCell align="right">
                              <Button
                                size="small"
                                color="primary"
                                onClick={() => navigate(`/officer/process-request/${request.id}`)}
                              >
                                Xử lý
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box className="empty-tab">
                  <Typography variant="body1" color="text.secondary">
                    Không có yêu cầu nào đang chờ xử lý.
                  </Typography>
                </Box>
              )}
              <Box className="tab-footer">
                <Button 
                  variant="text" 
                  color="primary"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/officer/requests')}
                >
                  Xem tất cả yêu cầu
                </Button>
              </Box>
            </Box>
          )}
          
          {/* Completed Requests Tab */}
          {activeTab === 1 && (
            <Box className="tab-content">
              {completed_requests.length > 0 ? (
                <TableContainer className="table-container">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Mã</TableCell>
                        <TableCell>Tiêu đề</TableCell>
                        <TableCell>Trạng thái</TableCell>
                        <TableCell>Công dân</TableCell>
                        <TableCell>Ngày hoàn thành</TableCell>
                        <TableCell align="right">Thao tác</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {completed_requests.map((request) => {
                        const statusInfo = getStatusInfo(request.status);
                        
                        return (
                          <TableRow key={request.id} hover>
                            <TableCell>{request.id}</TableCell>
                            <TableCell>{request.title}</TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                icon={statusInfo.icon}
                                label={statusInfo.label}
                                color={statusInfo.color}
                                className="status-chip"
                              />
                            </TableCell>
                            <TableCell>{request.citizen.name}</TableCell>
                            <TableCell>{formatDate(request.completedDate)}</TableCell>
                            <TableCell align="right">
                              <Button
                                size="small"
                                color="primary"
                                onClick={() => navigate(`/officer/requests/${request.id}`)}
                              >
                                Xem chi tiết
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box className="empty-tab">
                  <Typography variant="body1" color="text.secondary">
                    Không có yêu cầu nào đã hoàn thành.
                  </Typography>
                </Box>
              )}
              <Box className="tab-footer">
                <Button 
                  variant="text" 
                  color="primary"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/officer/requests?status=completed')}
                >
                  Xem tất cả yêu cầu đã hoàn thành
                </Button>
              </Box>
            </Box>
          )}
          
          {/* Recent Citizens Tab */}
          {activeTab === 2 && (
            <Box className="tab-content">
              {recent_citizens.length > 0 ? (
                <TableContainer className="table-container">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Họ và tên</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Điện thoại</TableCell>
                        <TableCell>Số yêu cầu</TableCell>
                        <TableCell align="right">Thao tác</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recent_citizens.map((citizen) => (
                        <TableRow key={citizen.id} hover>
                          <TableCell>{citizen.name}</TableCell>
                          <TableCell>{citizen.email}</TableCell>
                          <TableCell>{citizen.phone || 'Không có'}</TableCell>
                          <TableCell>{citizen.total_requests}</TableCell>
                          <TableCell align="right">
                            <Button
                              size="small"
                              color="primary"
                              onClick={() => handleViewCitizen(citizen.id)}
                            >
                              Xem hồ sơ
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box className="empty-tab">
                  <Typography variant="body1" color="text.secondary">
                    Không có công dân nào gần đây.
                  </Typography>
                </Box>
              )}
              <Box className="tab-footer">
                <Button 
                  variant="text" 
                  color="primary"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/officer/citizen-management')}
                >
                  Xem tất cả công dân
                </Button>
              </Box>
            </Box>
          )}
        </Card>
      </Box>
    </Box>
  );
};

export default OfficerDashboard; 
