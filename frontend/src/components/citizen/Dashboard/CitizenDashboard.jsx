import React, { useState, useEffect } from 'react';
import { 
  Container, Grid, Typography, Paper, Box, 
  CircularProgress, Card, CardContent, Divider, 
  List, ListItem, ListItemText, ListItemIcon, Chip,
  Alert, Button
} from '@mui/material';
import { 
  Description, Assignment, CheckCircle, 
  HourglassEmpty, Cancel, Notifications, VerifiedUser,
  Refresh
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import citizenService from '../../../services/api/citizenService';

const StatCard = ({ title, value, icon, color }) => {
  const theme = useTheme();
  
  return (
    <Card sx={{ height: '100%', bgcolor: theme.palette.background.paper }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Box 
              sx={{ 
                bgcolor: `${color}.light`, 
                borderRadius: '50%', 
                p: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {icon}
            </Box>
          </Grid>
          <Grid item xs>
            <Typography variant="subtitle2" color="textSecondary">
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

const ActivityItem = ({ activity }) => {
  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'success';
      case 'processing': return 'info';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      case 'active': return 'success';
      case 'draft': return 'info';
      case 'revoked': return 'error';
      case 'expired': return 'warning';
      default: return 'default';
    }
  };
  
  const getStatusIcon = (type, status) => {
    if (type === 'request') {
      switch(status) {
        case 'completed': return <CheckCircle color="success" />;
        case 'processing': return <HourglassEmpty color="info" />;
        case 'pending': return <HourglassEmpty color="warning" />;
        case 'rejected': return <Cancel color="error" />;
        default: return <Assignment />;
      }
    } else {
      return <Description />;
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <ListItem divider>
      <ListItemIcon>
        {getStatusIcon(activity.type, activity.status)}
      </ListItemIcon>
      <ListItemText 
        primary={
          <Typography variant="subtitle2">
            {activity.title}
            <Chip 
              size="small" 
              label={activity.status} 
              color={getStatusColor(activity.status)} 
              sx={{ ml: 1 }}
            />
          </Typography>
        }
        secondary={
          <>
            <Typography variant="caption" display="block">
              {activity.type === 'request' ? 'Mã yêu cầu: ' : 'Mã giấy tờ: '}
              {activity.type === 'request' ? activity.request_id : activity.document_id}
            </Typography>
            <Typography variant="caption" display="block">
              {formatDate(activity.date)}
            </Typography>
          </>
        }
      />
    </ListItem>
  );
};

// Component biểu đồ phân bố loại giấy tờ
const DocumentDistributionChart = ({ data }) => {
  const theme = useTheme();
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
    '#8884d8',
    '#82ca9d',
    '#ffc658',
    '#ff8042'
  ];

  // Kiểm tra nếu không có dữ liệu
  if (!data || data.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={300}>
        <Typography color="textSecondary">Không có dữ liệu</Typography>
      </Box>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="count"
          nameKey="name"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value} giấy tờ`, 'Số lượng']} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

// Component biểu đồ thống kê trạng thái giấy tờ
const DocumentStatusChart = ({ data }) => {
  const theme = useTheme();
  const COLORS = {
    'draft': theme.palette.info.light,
    'active': theme.palette.success.main,
    'revoked': theme.palette.error.main,
    'expired': theme.palette.warning.dark
  };

  // Kiểm tra nếu không có dữ liệu
  if (!data || data.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={300}>
        <Typography color="textSecondary">Không có dữ liệu</Typography>
      </Box>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="count"
          nameKey="name"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[entry.status] || theme.palette.grey[500]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value} giấy tờ`, 'Số lượng']} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

const CitizenDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);
  
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await citizenService.getDashboardStats();
      setDashboardData(data);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu bảng điều khiển:', err);
      setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const handleRetry = () => {
    fetchDashboardData();
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="80vh">
        <Alert 
          severity="error" 
          sx={{ mb: 2, maxWidth: 600 }}
        >
          {error}
        </Alert>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Refresh />}
          onClick={handleRetry}
        >
          Thử lại
        </Button>
      </Box>
    );
  }
  
  const { stats, recent_activity, user, document_distribution, document_stats } = dashboardData || { 
    stats: {}, 
    recent_activity: [],
    user: {},
    document_distribution: [],
    document_stats: []
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Xin chào, {user?.name || 'Công dân'}
      </Typography>
      
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        Bảng điều khiển công dân
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Giấy tờ đã cấp" 
            value={stats?.total_documents || 0} 
            icon={<Description color="primary" />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Yêu cầu đang chờ" 
            value={stats?.pending_requests || 0} 
            icon={<HourglassEmpty color="warning" />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Đã hoàn thành" 
            value={stats?.completed_requests || 0} 
            icon={<CheckCircle color="success" />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Đã xác thực blockchain" 
            value={stats?.verified_documents || 0} 
            icon={<VerifiedUser color="info" />}
            color="info"
          />
        </Grid>
        
        {/* Phân bố loại giấy tờ */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Phân bố loại giấy tờ
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <DocumentDistributionChart data={document_distribution || []} />
          </Paper>
        </Grid>
        
        {/* Thống kê giấy tờ */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Thống kê giấy tờ
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <DocumentStatusChart data={document_stats || []} />
          </Paper>
        </Grid>
        
        {/* Recent Activity */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h6" component="h2">
                Hoạt động gần đây
              </Typography>
              {stats?.notifications > 0 && (
                <Chip 
                  icon={<Notifications />} 
                  label={`${stats.notifications} thông báo mới`} 
                  color="primary" 
                  size="small"
                />
              )}
            </Box>
            <Divider />
            <List>
              {recent_activity && recent_activity.length > 0 ? (
                recent_activity.map((activity, index) => (
                  <ActivityItem key={`${activity.type}-${activity.id}`} activity={activity} />
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="Không có hoạt động gần đây" />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
        
        {/* User Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Thông tin cá nhân
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="subtitle2" color="textSecondary">
                  Họ và tên:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography>{user?.name || 'Chưa cập nhật'}</Typography>
              </Grid>
              
              <Grid item xs={4}>
                <Typography variant="subtitle2" color="textSecondary">
                  Email:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography>{user?.email || 'Chưa cập nhật'}</Typography>
              </Grid>
              
              <Grid item xs={4}>
                <Typography variant="subtitle2" color="textSecondary">
                  Số điện thoại:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography>{user?.phone || 'Chưa cập nhật'}</Typography>
              </Grid>
              
              <Grid item xs={4}>
                <Typography variant="subtitle2" color="textSecondary">
                  Địa chỉ:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography>{user?.address || 'Chưa cập nhật'}</Typography>
              </Grid>
              
              <Grid item xs={4}>
                <Typography variant="subtitle2" color="textSecondary">
                  Đăng nhập gần đây:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography>
                  {user?.last_login ? new Date(user.last_login).toLocaleString('vi-VN') : 'Chưa có thông tin'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Request Status */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Trạng thái yêu cầu
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box display="flex" alignItems="center" mb={1}>
                  <HourglassEmpty color="warning" sx={{ mr: 1 }} />
                  <Typography variant="body2">Đang chờ:</Typography>
                </Box>
                <Typography variant="h6">{stats?.pending_requests || 0}</Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Box display="flex" alignItems="center" mb={1}>
                  <HourglassEmpty color="info" sx={{ mr: 1 }} />
                  <Typography variant="body2">Đang xử lý:</Typography>
                </Box>
                <Typography variant="h6">{stats?.processing_requests || 0}</Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Box display="flex" alignItems="center" mb={1}>
                  <CheckCircle color="success" sx={{ mr: 1 }} />
                  <Typography variant="body2">Hoàn thành:</Typography>
                </Box>
                <Typography variant="h6">{stats?.completed_requests || 0}</Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Box display="flex" alignItems="center" mb={1}>
                  <Cancel color="error" sx={{ mr: 1 }} />
                  <Typography variant="body2">Từ chối:</Typography>
                </Box>
                <Typography variant="h6">{stats?.rejected_requests || 0}</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CitizenDashboard; 