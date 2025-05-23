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
  Avatar,
  LinearProgress,
  Tooltip,
  Badge
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
  Refresh as RefreshIcon,
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalanceWallet as WalletIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import citizenService from '../../../services/api/citizenService';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Custom styled components
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 40px -12px rgba(0,0,0,0.2)'
  }
}));

const MotionCard = motion(StyledCard);

const StyledChip = styled(Chip)(({ theme }) => ({
  borderRadius: 12,
  fontWeight: 600,
  fontSize: '0.75rem'
}));

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100
    }
  }
};

/**
 * Cải tiến CitizenDashboard Component với giao diện hiện đại
 */
const CitizenDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [permissionError, setPermissionError] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Dữ liệu biểu đồ mẫu
  const chartData = [
    { name: 'CMND', count: 1 },
    { name: 'GPLX', count: 1 },
    { name: 'Hộ khẩu', count: 2 },
    { name: 'Giấy khai sinh', count: 1 }
  ];
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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

  // Get status chip based on status string
  const getStatusChip = (status) => {
    switch (status) {
      case 'completed':
        return <StyledChip label="Hoàn thành" color="success" size="small" icon={<CheckIcon />} />;
      case 'pending':
        return <StyledChip label="Chờ xử lý" color="warning" size="small" icon={<PendingIcon />} />;
      case 'processing':
        return <StyledChip label="Đang xử lý" color="info" size="small" icon={<ProcessingIcon />} />;
      case 'rejected':
        return <StyledChip label="Từ chối" color="error" size="small" icon={<ErrorIcon />} />;
      default:
        return <StyledChip label={status || 'Không xác định'} color="default" size="small" />;
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

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} sx={{ mb: 3 }} />
        <Typography variant="h6" gutterBottom>
          Đang tải dữ liệu...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Vui lòng đợi trong giây lát
                </Typography>
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

  // Nếu không có lỗi và không đang tải, hiển thị dashboard
    return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Box sx={{ p: { xs: 1, sm: 2 } }}>
        {/* Header */}
        <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Grid item xs={12} md={8}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Xin chào, {currentUser?.name || 'Công dân'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Chào mừng bạn đến với Hệ thống Quản lý Hành chính dựa trên Blockchain
            </Typography>
          </Grid>
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <Button 
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate('/citizen/requests')}
              sx={{ borderRadius: 2, px: 3 }}
            >
              Tạo yêu cầu mới
            </Button>
          </Grid>
        </Grid>
        
        {/* Thông tin tổng quan */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <motion.div variants={cardVariants}>
              <StyledCard>
                <CardContent sx={{ position: 'relative', p: 3 }}>
                  <Box sx={{ position: 'absolute', top: 12, right: 12, background: '#f0f7ff', p: 1, borderRadius: '50%' }}>
                    <ReceiptIcon color="primary" />
      </Box>
                  <Typography color="textSecondary" gutterBottom>
                    Tổng số yêu cầu
      </Typography>
                  <Typography variant="h4" component="div" fontWeight="bold">
                    {dashboardData?.total_requests || '0'}
      </Typography>
      
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                    <TrendingUpIcon color="success" fontSize="small" />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                      +10% so với tháng trước
          </Typography>
        </Box>
                </CardContent>
              </StyledCard>
            </motion.div>
          </Grid>
      
        <Grid item xs={12} sm={6} md={3}>
            <motion.div variants={cardVariants}>
              <StyledCard>
                <CardContent sx={{ position: 'relative', p: 3 }}>
                  <Box sx={{ position: 'absolute', top: 12, right: 12, background: '#e9f9e7', p: 1, borderRadius: '50%' }}>
                    <CheckIcon color="success" />
                  </Box>
                  <Typography color="textSecondary" gutterBottom>
                    Yêu cầu hoàn thành
                  </Typography>
                  <Typography variant="h4" component="div" fontWeight="bold">
                    {dashboardData?.completed_requests || '0'}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                    <Box sx={{ width: '100%', mr: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={dashboardData?.completion_rate || 0} 
            sx={{ 
                          height: 8, 
                          borderRadius: 2,
                          backgroundColor: '#e9f9e7', 
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: '#2e7d32'
                          }
                        }}
                      />
              </Box>
                    <Typography variant="body2" color="text.secondary">
                      {dashboardData?.completion_rate || 0}%
              </Typography>
                  </Box>
            </CardContent>
              </StyledCard>
            </motion.div>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
            <motion.div variants={cardVariants}>
              <StyledCard>
                <CardContent sx={{ position: 'relative', p: 3 }}>
                  <Box sx={{ position: 'absolute', top: 12, right: 12, background: '#ffe9e2', p: 1, borderRadius: '50%' }}>
                    <PendingIcon color="warning" />
              </Box>
                  <Typography color="textSecondary" gutterBottom>
                    Yêu cầu đang xử lý
                  </Typography>
                  <Typography variant="h4" component="div" fontWeight="bold">
                    {dashboardData?.pending_requests || '0'}
              </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                    <Badge color="warning" variant="dot" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Cập nhật mới nhất: {formatDate(dashboardData?.latest_update)}
              </Typography>
                  </Box>
            </CardContent>
              </StyledCard>
            </motion.div>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
            <motion.div variants={cardVariants}>
              <StyledCard>
                <CardContent sx={{ position: 'relative', p: 3 }}>
                  <Box sx={{ position: 'absolute', top: 12, right: 12, background: '#e3f2fd', p: 1, borderRadius: '50%' }}>
                    <DescriptionIcon color="info" />
              </Box>
                  <Typography color="textSecondary" gutterBottom>
                    Giấy tờ đã cấp
                  </Typography>
                  <Typography variant="h4" component="div" fontWeight="bold">
                    {dashboardData?.total_documents || '0'}
              </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                    <WalletIcon color="info" fontSize="small" />
                    <Typography variant="body2" color="info.main" sx={{ ml: 0.5, fontWeight: 'medium' }}>
                      Đã xác minh trên Blockchain
              </Typography>
                  </Box>
            </CardContent>
              </StyledCard>
            </motion.div>
          </Grid>
        </Grid>
        
        {/* Nội dung chính */}
        <Grid container spacing={3}>
          {/* Biểu đồ & Tiến trình */}
          <Grid item xs={12} md={8}>
            <motion.div variants={cardVariants}>
              <Paper sx={{ p: 3, borderRadius: 3, mb: 3, overflow: 'hidden' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Thống kê giấy tờ
                  </Typography>
                  <IconButton size="small" onClick={fetchDashboardData}>
                    <RefreshIcon />
                  </IconButton>
                </Box>
                
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="count" name="Số lượng" fill="#8884d8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
              </Box>
              </Paper>
              
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Phân bố loại giấy tờ
              </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', justifyContent: 'space-around' }}>
                  <Box sx={{ width: 200, height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                          nameKey="name"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
      </Box>
      
                  <Box sx={{ mt: { xs: 2, sm: 0 } }}>
                    <List dense>
                      {chartData.map((item, index) => (
                        <ListItem key={item.name}>
                          <Box 
                            sx={{ 
                              width: 16, 
                              height: 16, 
                              backgroundColor: COLORS[index % COLORS.length],
                              borderRadius: '50%',
                              mr: 1
                            }} 
                          />
                          <ListItemText 
                            primary={`${item.name}: ${item.count}`}
                            primaryTypographyProps={{ fontWeight: 'medium' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </Box>
              </Paper>
            </motion.div>
          </Grid>
          
          {/* Yêu cầu gần đây và Hoạt động */}
          <Grid item xs={12} md={4}>
            <motion.div variants={cardVariants}>
              <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">
                Yêu cầu gần đây
              </Typography>
              <Button 
                    endIcon={<ArrowIcon />} 
                    onClick={() => navigate('/citizen/requests')}
                size="small" 
              >
                Xem tất cả
              </Button>
            </Box>
            
              <List>
                  {(dashboardData?.recent_requests || []).map((request, index) => (
                  <React.Fragment key={request.id || index}>
                    <ListItem
                        sx={{ px: 1, py: 1.5, borderRadius: 2, '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.03)' } }}
                      secondaryAction={
                        <IconButton 
                          edge="end" 
                            size="small"
                          onClick={() => navigate(`/citizen/requests/${request.id}`)}
                        >
                            <SearchIcon fontSize="small" />
                        </IconButton>
                      }
                    >
                        <Avatar 
                          sx={{ 
                            bgcolor: request.status === 'completed' ? 'success.light' : 
                                    request.status === 'pending' ? 'warning.light' : 'info.light',
                            mr: 2
                          }}
                        >
                          {request.request_type?.[0] || 'R'}
                        </Avatar>
                      <ListItemText 
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="body1" fontWeight="medium" sx={{ mr: 1 }}>
                                {request.request_type || 'Yêu cầu không xác định'}
                              </Typography>
                            {getStatusChip(request.status)}
                          </Box>
                        }
                          secondary={`Ngày tạo: ${formatDate(request.created_at)}`}
                        />
                      </ListItem>
                      {index < (dashboardData?.recent_requests || []).length - 1 && (
                        <Divider variant="inset" component="li" />
                      )}
                    </React.Fragment>
                  ))}
                  
                  {!dashboardData?.recent_requests || dashboardData.recent_requests.length === 0 && (
                    <ListItem>
                      <ListItemText
                        primary="Không có yêu cầu gần đây"
                        secondary="Bạn chưa có yêu cầu nào. Hãy tạo yêu cầu mới."
                        primaryTypographyProps={{ align: 'center' }}
                        secondaryTypographyProps={{ align: 'center' }}
                      />
                    </ListItem>
                  )}
              </List>
                
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/citizen/requests')}
                    sx={{ borderRadius: 2, px: 3 }}
                  >
                    Tạo yêu cầu mới
                  </Button>
              </Box>
          </Paper>
              
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Giấy tờ gần đây
                  </Typography>
              <Button 
                    endIcon={<ArrowIcon />}
                    onClick={() => navigate('/citizen/documents')}
                size="small" 
              >
                Xem tất cả
              </Button>
            </Box>
            
              <List>
                  {(dashboardData?.recent_documents || []).map((document, index) => (
                  <React.Fragment key={document.id || index}>
                    <ListItem
                        sx={{ px: 1, py: 1.5, borderRadius: 2, '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.03)' } }}
                      secondaryAction={
                        <IconButton 
                          edge="end" 
                            size="small"
                          onClick={() => navigate(`/citizen/documents/${document.id}`)}
                        >
                            <SearchIcon fontSize="small" />
                        </IconButton>
                      }
                    >
                        <Avatar 
                          sx={{ 
                            bgcolor: 'info.light',
                            mr: 2
                          }}
                        >
                          <DescriptionIcon fontSize="small" />
                        </Avatar>
                      <ListItemText 
                        primary={
                            <Typography variant="body1" fontWeight="medium">
                              {document.document_type || 'Giấy tờ không xác định'}
                            </Typography>
                          }
                          secondary={`Ngày cấp: ${formatDate(document.issue_date)}`}
                        />
                      </ListItem>
                      {index < (dashboardData?.recent_documents || []).length - 1 && (
                        <Divider variant="inset" component="li" />
                      )}
                    </React.Fragment>
                  ))}
                  
                  {!dashboardData?.recent_documents || dashboardData.recent_documents.length === 0 && (
                    <ListItem>
                      <ListItemText
                        primary="Không có giấy tờ gần đây"
                        secondary="Chưa có giấy tờ nào được cấp gần đây."
                        primaryTypographyProps={{ align: 'center' }}
                        secondaryTypographyProps={{ align: 'center' }}
                      />
                    </ListItem>
                  )}
              </List>
          </Paper>
            </motion.div>
          </Grid>
      </Grid>
    </Box>
    </motion.div>
  );
};

export default CitizenDashboard; 