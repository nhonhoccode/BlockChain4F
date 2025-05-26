import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardHeader,
  CardContent,
  Button,
  Avatar,
  Divider,
  Grid,
  Stack,
  Chip,
  CircularProgress,
  Alert,
  useTheme,
  Breadcrumbs,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tab,
  Tabs
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon,
  Home as HomeIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  EventNote as EventNoteIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';

/**
 * OfficerDetail Component - Displays detailed information about an officer
 */
const OfficerDetail = () => {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [officer, setOfficer] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  
  // Mock officer data - replace with API call in production
  useEffect(() => {
    const fetchOfficer = async () => {
      setLoading(true);
      
      try {
        // Simulate API call
        setTimeout(() => {
          setOfficer({
            id: id,
            name: 'Nguyễn Văn An',
            email: 'nguyenvanan@example.com',
            phone: '0987654321',
            position: 'Cán bộ địa chính',
            department: 'Phòng Địa chính',
            status: 'active',
            joinDate: '2021-05-10',
            lastActive: '2023-06-18T08:30:00Z',
            avatar: null,
            assignedRequests: 12,
            completedRequests: 10,
            address: '123 Đường A, Phường B, Quận C, TP. HCM',
            qualifications: ['Cử nhân Quản lý đất đai', 'Chứng chỉ GIS'],
            biography: 'Tốt nghiệp chuyên ngành Quản lý đất đai với nhiều năm kinh nghiệm làm việc tại phường X. Chuyên môn sâu về các vấn đề liên quan đến đất đai, quy hoạch và giấy tờ sở hữu.',
            activities: [
              { date: '2023-06-18T08:30:00Z', action: 'Phê duyệt giấy chứng nhận quyền sử dụng đất' },
              { date: '2023-06-17T10:45:00Z', action: 'Xử lý hồ sơ cấp phép xây dựng' },
              { date: '2023-06-16T14:20:00Z', action: 'Tiếp nhận hồ sơ đăng ký đất đai' }
            ]
          });
          setLoading(false);
        }, 800);
      } catch (err) {
        setError('Không thể tải thông tin cán bộ. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };
    
    fetchOfficer();
  }, [id]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };
  
  // Format date with time
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      default:
        return 'default';
    }
  };
  
  // Get status label
  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return 'Hoạt động';
      case 'inactive':
        return 'Không hoạt động';
      default:
        return status;
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <Box sx={{ pl: 0, pt: { xs: 2, md: 3 }, pr: { xs: 2, md: 3 }, pb: { xs: 2, md: 3 }, display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 120px)' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Box sx={{ pl: 0, pt: { xs: 2, md: 3 }, pr: { xs: 2, md: 3 }, pb: { xs: 2, md: 3 } }}>
        <Alert 
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => window.location.reload()}>
              Thử lại
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }
  
  return (
    <Box sx={{ pl: 0 }}>
      <Box sx={{ pt: { xs: 2, md: 3 }, pr: { xs: 2, md: 3 }, pb: { xs: 2, md: 3 } }}>
        {/* Breadcrumbs */}
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
          sx={{ mb: 3 }}
        >
          <Link 
            color="inherit" 
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate('/admin/chairman/officers');
            }}
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <PersonIcon sx={{ mr: 0.5 }} fontSize="small" />
            Quản lý cán bộ
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            Chi tiết cán bộ
          </Typography>
        </Breadcrumbs>
        
        {/* Page header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" color="primary.main">
            Thông tin cán bộ
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/admin/chairman/officers')}
          >
            Quay lại
          </Button>
        </Box>
        
        {/* Officer details */}
        <Grid container spacing={3}>
          {/* Profile sidebar */}
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 2, mb: 3 }}>
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Avatar
                  src={officer?.avatar}
                  alt={officer?.name}
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    mx: 'auto', 
                    mb: 2,
                    bgcolor: theme.palette.primary.main,
                    fontSize: '3rem'
                  }}
                >
                  {officer?.name.charAt(0)}
                </Avatar>
                <Typography variant="h5" fontWeight="medium">
                  {officer?.name}
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  {officer?.position}
                </Typography>
                <Chip 
                  label={getStatusLabel(officer?.status)} 
                  color={getStatusColor(officer?.status)} 
                  sx={{ mt: 1 }}
                />
              </Box>
              <Divider />
              <List>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon color="action" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Email" 
                    secondary={officer?.email} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PhoneIcon color="action" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Điện thoại" 
                    secondary={officer?.phone} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <WorkIcon color="action" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Phòng ban" 
                    secondary={officer?.department} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <EventNoteIcon color="action" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Ngày tham gia" 
                    secondary={formatDate(officer?.joinDate)} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <HomeIcon color="action" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Địa chỉ" 
                    secondary={officer?.address} 
                    secondaryTypographyProps={{ style: { wordBreak: 'break-word' } }}
                  />
                </ListItem>
              </List>
              <Divider />
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Button 
                  startIcon={<EditIcon />} 
                  variant="outlined"
                  color="primary"
                  onClick={() => console.log('Edit officer', id)}
                >
                  Chỉnh sửa
                </Button>
                <Button 
                  startIcon={officer?.status === 'active' ? <BlockIcon /> : <CheckCircleIcon />} 
                  variant="outlined"
                  color={officer?.status === 'active' ? 'error' : 'success'}
                  onClick={() => console.log('Toggle status', id)}
                >
                  {officer?.status === 'active' ? 'Vô hiệu hóa' : 'Kích hoạt'}
                </Button>
              </Box>
            </Card>
            
            {/* Statistics card */}
            <Card sx={{ borderRadius: 2 }}>
              <CardHeader title="Thống kê" />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="h4" color="primary.main" fontWeight="bold">
                        {officer?.assignedRequests}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Yêu cầu được giao
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="h4" color="success.main" fontWeight="bold">
                        {officer?.completedRequests}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Đã hoàn thành
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Hiệu suất hoàn thành
                  </Typography>
                  <Box 
                    sx={{ 
                      width: '100%', 
                      height: 8, 
                      bgcolor: 'background.default',
                      borderRadius: 5,
                      overflow: 'hidden',
                      mt: 1
                    }}
                  >
                    <Box 
                      sx={{ 
                        width: `${(officer?.completedRequests / officer?.assignedRequests) * 100}%`,
                        height: '100%',
                        bgcolor: 'success.main'
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      {Math.round((officer?.completedRequests / officer?.assignedRequests) * 100)}%
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Main content */}
          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: 2, mb: 3 }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                  <Tab label="Thông tin cá nhân" />
                  <Tab label="Hoạt động gần đây" />
                  <Tab label="Hồ sơ đã xử lý" />
                </Tabs>
              </Box>
              
              {/* Personal Info Tab */}
              <Box role="tabpanel" hidden={tabValue !== 0} sx={{ p: 3 }}>
                {tabValue === 0 && (
                  <>
                    <Typography variant="h6" gutterBottom>
                      Tiểu sử
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {officer?.biography}
                    </Typography>
                    
                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                      Trình độ chuyên môn
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      {officer?.qualifications.map((qualification, index) => (
                        <Chip 
                          key={index}
                          label={qualification}
                          sx={{ mr: 1, mb: 1 }}
                          icon={<SchoolIcon />}
                        />
                      ))}
                    </Box>
                  </>
                )}
              </Box>
              
              {/* Recent Activity Tab */}
              <Box role="tabpanel" hidden={tabValue !== 1} sx={{ p: 3 }}>
                {tabValue === 1 && (
                  <>
                    <Typography variant="h6" gutterBottom>
                      Hoạt động gần đây
                    </Typography>
                    <List>
                      {officer?.activities.map((activity, index) => (
                        <React.Fragment key={index}>
                          <ListItem alignItems="flex-start">
                            <ListItemIcon>
                              <AssignmentIcon />
                            </ListItemIcon>
                            <ListItemText
                              primary={activity.action}
                              secondary={formatDateTime(activity.date)}
                            />
                          </ListItem>
                          {index < officer.activities.length - 1 && <Divider component="li" />}
                        </React.Fragment>
                      ))}
                    </List>
                  </>
                )}
              </Box>
              
              {/* Processed Requests Tab */}
              <Box role="tabpanel" hidden={tabValue !== 2} sx={{ p: 3 }}>
                {tabValue === 2 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 5 }}>
                    <Typography color="text.secondary">
                      Danh sách hồ sơ đã xử lý sẽ hiển thị tại đây
                    </Typography>
                  </Box>
                )}
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default OfficerDetail; 