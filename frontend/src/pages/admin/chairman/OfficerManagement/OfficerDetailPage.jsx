import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Paper,
  Grid,
  Divider,
  Avatar,
  Button,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Person as PersonIcon,
  Work as WorkIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Badge as BadgeIcon,
  Assignment as AssignmentIcon,
  Event as EventIcon,
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import PrimaryButton from '../../../../components/common/Buttons/PrimaryButton';
import SecondaryButton from '../../../../components/common/Buttons/SecondaryButton';
import IconButton from '../../../../components/common/Buttons/IconButton';
import officerService from '../../../../services/api/officerService';
import styles from './ChairmanOfficerManagementPage.module.scss';

// TabPanel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`officer-tabpanel-${index}`}
      aria-labelledby={`officer-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const OfficerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [officer, setOfficer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [activities, setActivities] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Lấy thông tin cán bộ theo ID
  useEffect(() => {
    fetchOfficerDetails();
  }, [id]);

  const fetchOfficerDetails = async () => {
    setLoading(true);
    try {
      const response = await officerService.getOfficerById(id);
      setOfficer(response.data);
      
      // Lấy lịch sử hoạt động của cán bộ
      const activitiesResponse = await officerService.getOfficerActivities(id);
      setActivities(activitiesResponse.data);
      
      // Lấy danh sách công việc được giao
      const assignmentsResponse = await officerService.getOfficerAssignments(id);
      setAssignments(assignmentsResponse.data);
    } catch (error) {
      console.error('Lỗi khi lấy thông tin cán bộ:', error);
      showNotification('Không thể lấy thông tin cán bộ. Vui lòng thử lại sau!', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Hiển thị thông báo
  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  // Đóng thông báo
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  // Xử lý thay đổi tab
  const handleChangeTab = (event, newValue) => {
    setTabValue(newValue);
  };

  // Xử lý quay lại trang danh sách
  const handleBack = () => {
    navigate('/admin/chairman/officers');
  };

  // Xử lý chỉnh sửa thông tin
  const handleEdit = () => {
    navigate(`/admin/chairman/officers/edit/${id}`);
  };

  // Xử lý phân công nhiệm vụ
  const handleAssignTask = () => {
    navigate(`/admin/chairman/officers/assign-tasks/${id}`);
  };

  // Hiển thị trạng thái cán bộ
  const renderStatus = (status) => {
    let color = 'default';
    let label = 'Không xác định';

    switch (status) {
      case 'active':
        color = 'success';
        label = 'Đang hoạt động';
        break;
      case 'pending':
        color = 'warning';
        label = 'Chờ phê duyệt';
        break;
      case 'inactive':
        color = 'error';
        label = 'Ngưng hoạt động';
        break;
      default:
        break;
    }

    return (
      <Chip label={label} color={color} size="small" />
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!officer) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">
          Không tìm thấy thông tin cán bộ
        </Typography>
        <SecondaryButton
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          size="small"
          sx={{ mt: 2 }}
        >
          Quay lại
        </SecondaryButton>
      </Box>
    );
  }

  return (
    <Box className={styles.officerDetailPage}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={handleBack} color="primary">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" component="h1" sx={{ ml: 1 }}>
          Thông tin chi tiết cán bộ
        </Typography>
      </Box>

      <Paper elevation={2} sx={{ mb: 3, p: 3, borderRadius: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar
              src={officer.avatar_url}
              alt={`${officer.last_name} ${officer.first_name}`}
              sx={{ width: 120, height: 120, mb: 2 }}
            />
            <Typography variant="h6">
              {officer.last_name} {officer.first_name}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
              {officer.position}
            </Typography>
            {renderStatus(officer.status)}
            
            <Box sx={{ mt: 3, width: '100%' }}>
              <PrimaryButton
                startIcon={<EditIcon />}
                onClick={handleEdit}
                fullWidth
                size="medium"
              >
                Chỉnh sửa thông tin
              </PrimaryButton>
              <SecondaryButton
                startIcon={<AssignmentIcon />}
                onClick={handleAssignTask}
                fullWidth
                size="medium"
                sx={{ mt: 1 }}
              >
                Phân công nhiệm vụ
              </SecondaryButton>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={9}>
            <Tabs value={tabValue} onChange={handleChangeTab} aria-label="officer tabs">
              <Tab label="Thông tin cá nhân" id="officer-tab-0" />
              <Tab label="Công việc" id="officer-tab-1" />
              <Tab label="Lịch sử hoạt động" id="officer-tab-2" />
            </Tabs>
            
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <EmailIcon />
                      </ListItemIcon>
                      <ListItemText primary="Email" secondary={officer.email} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <PhoneIcon />
                      </ListItemIcon>
                      <ListItemText primary="Số điện thoại" secondary={officer.phone_number || 'Chưa cập nhật'} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <LocationIcon />
                      </ListItemIcon>
                      <ListItemText primary="Địa chỉ" secondary={officer.address || 'Chưa cập nhật'} />
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <BadgeIcon />
                      </ListItemIcon>
                      <ListItemText primary="Chức vụ" secondary={officer.position || 'Chưa cập nhật'} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <WorkIcon />
                      </ListItemIcon>
                      <ListItemText primary="Phòng ban" secondary={officer.department || 'Chưa cập nhật'} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <EventIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Ngày tham gia" 
                        secondary={new Date(officer.date_joined).toLocaleDateString('vi-VN')} 
                      />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              {assignments.length > 0 ? (
                <List>
                  {assignments.map((assignment) => (
                    <ListItem key={assignment.id}>
                      <ListItemIcon>
                        <AssignmentIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary={assignment.title} 
                        secondary={`Hạn xử lý: ${new Date(assignment.due_date).toLocaleDateString('vi-VN')}`} 
                      />
                      <Chip 
                        label={assignment.status === 'completed' ? 'Hoàn thành' : 'Đang xử lý'} 
                        color={assignment.status === 'completed' ? 'success' : 'warning'} 
                        size="small" 
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" color="textSecondary">
                  Không có công việc nào được giao
                </Typography>
              )}
            </TabPanel>
            
            <TabPanel value={tabValue} index={2}>
              {activities.length > 0 ? (
                <List>
                  {activities.map((activity) => (
                    <ListItem key={activity.id}>
                      <ListItemIcon>
                        <EventIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary={activity.description} 
                        secondary={new Date(activity.timestamp).toLocaleString('vi-VN')} 
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" color="textSecondary">
                  Chưa có hoạt động nào
                </Typography>
              )}
            </TabPanel>
          </Grid>
        </Grid>
      </Paper>
      
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OfficerDetailPage;
