import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Avatar,
  Button,
  TextField,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs
} from '@mui/material';
import Chip from '../../../components/common/Chip';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Badge as BadgeIcon,
  Key as KeyIcon,
  Verified as VerifiedIcon,
  Lock as LockIcon,
  Upload as UploadIcon,
  PhotoCamera as CameraIcon
} from '@mui/icons-material';
import { TabContext, TabPanel } from '@mui/lab';

// Mock officer data
const MOCK_OFFICER_DATA = {
  id: '12345',
  fullName: 'Nguyễn Văn A',
  position: 'Cán bộ Địa chính',
  department: 'Phòng Tài nguyên và Môi trường',
  email: 'nguyenvana@gov.vn',
  phone: '0901234567',
  address: '123 Đường Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
  avatar: null, // In a real app, this would be an URL to the image
  dateOfBirth: '1985-06-15',
  gender: 'male',
  identityNumber: '079123456789',
  dateOfIssue: '2020-03-10',
  placeOfIssue: 'Cục Cảnh sát quản lý hành chính về trật tự xã hội',
  blockchain: {
    verified: true,
    publicKey: '0x7a2d2d3e4f5g6h7i8j9k0l1m2n3o4p5q6r7s8t9u',
    lastVerified: '2023-04-15T10:30:00Z'
  },
  statistics: {
    totalRequests: 157,
    approvedRequests: 134,
    rejectedRequests: 15,
    pendingRequests: 8,
    averageHandlingTime: '2.3 days'
  }
};

const OfficerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [tabValue, setTabValue] = useState('1');
  
  useEffect(() => {
    // In a real app, this would be an API call
    const fetchOfficerProfile = async () => {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProfile(MOCK_OFFICER_DATA);
        setEditedProfile(MOCK_OFFICER_DATA);
      } catch (error) {
        console.error('Error fetching officer profile:', error);
        setError('Không thể tải thông tin cán bộ. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOfficerProfile();
  }, []);
  
  const handleEdit = () => {
    setEditing(true);
    setEditedProfile(profile);
  };
  
  const handleCancel = () => {
    setEditing(false);
    setEditedProfile(profile);
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSave = async () => {
    setSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, you would send the updated data to the API
      console.log('Saving profile:', editedProfile);
      
      // Update the profile
      setProfile(editedProfile);
      setEditing(false);
      setSuccess(true);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Đã xảy ra lỗi khi lưu thông tin. Vui lòng thử lại sau.');
    } finally {
      setSaving(false);
    }
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const validatePassword = () => {
    const errors = {};
    
    if (!passwords.current) {
      errors.current = 'Vui lòng nhập mật khẩu hiện tại';
    }
    
    if (!passwords.new) {
      errors.new = 'Vui lòng nhập mật khẩu mới';
    } else if (passwords.new.length < 8) {
      errors.new = 'Mật khẩu phải có ít nhất 8 ký tự';
    }
    
    if (!passwords.confirm) {
      errors.confirm = 'Vui lòng xác nhận mật khẩu mới';
    } else if (passwords.new !== passwords.confirm) {
      errors.confirm = 'Mật khẩu xác nhận không khớp';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmitPasswordChange = async () => {
    if (!validatePassword()) {
      return;
    }
    
    setSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, you would send the password data to the API
      console.log('Changing password:', passwords);
      
      setChangePasswordOpen(false);
      setPasswords({
        current: '',
        new: '',
        confirm: ''
      });
      setSuccess(true);
    } catch (err) {
      console.error('Error changing password:', err);
      setError('Đã xảy ra lỗi khi đổi mật khẩu. Vui lòng thử lại sau.');
    } finally {
      setSaving(false);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Đang tải thông tin cán bộ...
        </Typography>
      </Box>
    );
  }
  
  if (!profile) {
    return (
      <Box sx={{ py: 3, px: 2 }}>
        <Alert severity="error">
          Không thể tải thông tin cán bộ. Vui lòng thử lại sau.
        </Alert>
      </Box>
    );
  }
  
  return (
    <Box sx={{ py: 3, px: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Hồ sơ cán bộ
      </Typography>
      
      <Box sx={{ width: '100%', typography: 'body1' }}>
        <TabContext value={tabValue}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="profile tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Thông tin cá nhân" value="1" icon={<PersonIcon />} iconPosition="start" />
              <Tab label="Xác thực Blockchain" value="2" icon={<VerifiedIcon />} iconPosition="start" />
              <Tab label="Thống kê hoạt động" value="3" icon={<BadgeIcon />} iconPosition="start" />
            </Tabs>
          </Box>
          
          <TabPanel value="1">
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar
                    src={profile.avatar}
                    alt={profile.fullName}
                    sx={{ width: 100, height: 100, mr: 3 }}
                  >
                    {profile.fullName?.charAt(0)}
                  </Avatar>
                  
                  <Box>
                    <Typography variant="h5" gutterBottom>
                      {profile.fullName}
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary">
                      {profile.position}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {profile.department}
                    </Typography>
                  </Box>
                </Box>
                
                <Box>
                  {editing ? (
                    <Box sx={{ display: 'flex' }}>
                      <Button
                        variant="outlined"
                        startIcon={<CancelIcon />}
                        onClick={handleCancel}
                        sx={{ mr: 1 }}
                        disabled={saving}
                      >
                        Hủy
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                        onClick={handleSave}
                        disabled={saving}
                      >
                        {saving ? 'Đang lưu...' : 'Lưu'}
                      </Button>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex' }}>
                      <Button
                        variant="outlined"
                        startIcon={<KeyIcon />}
                        onClick={() => setChangePasswordOpen(true)}
                        sx={{ mr: 1 }}
                      >
                        Đổi mật khẩu
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<EditIcon />}
                        onClick={handleEdit}
                      >
                        Chỉnh sửa
                      </Button>
                    </Box>
                  )}
                </Box>
              </Box>
              
              {editing && (
                <Box sx={{ mb: 3 }}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CameraIcon />}
                    size="small"
                  >
                    Thay đổi ảnh đại diện
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                    />
                  </Button>
                </Box>
              )}
              
              <Divider sx={{ my: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Thông tin cá nhân
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      {editing ? (
                        <TextField
                          fullWidth
                          label="Họ và tên"
                          name="fullName"
                          value={editedProfile.fullName || ''}
                          onChange={handleChange}
                          margin="normal"
                        />
                      ) : (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="textSecondary">
                            Họ và tên
                          </Typography>
                          <Typography variant="body1">
                            {profile.fullName}
                          </Typography>
                        </Box>
                      )}
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      {editing ? (
                        <TextField
                          fullWidth
                          label="Ngày sinh"
                          name="dateOfBirth"
                          type="date"
                          value={editedProfile.dateOfBirth || ''}
                          onChange={handleChange}
                          margin="normal"
                          InputLabelProps={{ shrink: true }}
                        />
                      ) : (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="textSecondary">
                            Ngày sinh
                          </Typography>
                          <Typography variant="body1">
                            {formatDate(profile.dateOfBirth)}
                          </Typography>
                        </Box>
                      )}
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      {editing ? (
                        <TextField
                          fullWidth
                          label="Giới tính"
                          name="gender"
                          select
                          SelectProps={{ native: true }}
                          value={editedProfile.gender || ''}
                          onChange={handleChange}
                          margin="normal"
                        >
                          <option value="male">Nam</option>
                          <option value="female">Nữ</option>
                          <option value="other">Khác</option>
                        </TextField>
                      ) : (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="textSecondary">
                            Giới tính
                          </Typography>
                          <Typography variant="body1">
                            {profile.gender === 'male' ? 'Nam' : 
                              profile.gender === 'female' ? 'Nữ' : 'Khác'}
                          </Typography>
                        </Box>
                      )}
                    </Grid>
                    
                    <Grid item xs={12}>
                      {editing ? (
                        <TextField
                          fullWidth
                          label="Số CCCD"
                          name="identityNumber"
                          value={editedProfile.identityNumber || ''}
                          onChange={handleChange}
                          margin="normal"
                        />
                      ) : (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="textSecondary">
                            Số CCCD
                          </Typography>
                          <Typography variant="body1">
                            {profile.identityNumber}
                          </Typography>
                        </Box>
                      )}
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      {editing ? (
                        <TextField
                          fullWidth
                          label="Ngày cấp"
                          name="dateOfIssue"
                          type="date"
                          value={editedProfile.dateOfIssue || ''}
                          onChange={handleChange}
                          margin="normal"
                          InputLabelProps={{ shrink: true }}
                        />
                      ) : (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="textSecondary">
                            Ngày cấp
                          </Typography>
                          <Typography variant="body1">
                            {formatDate(profile.dateOfIssue)}
                          </Typography>
                        </Box>
                      )}
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      {editing ? (
                        <TextField
                          fullWidth
                          label="Nơi cấp"
                          name="placeOfIssue"
                          value={editedProfile.placeOfIssue || ''}
                          onChange={handleChange}
                          margin="normal"
                        />
                      ) : (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="textSecondary">
                            Nơi cấp
                          </Typography>
                          <Typography variant="body1">
                            {profile.placeOfIssue}
                          </Typography>
                        </Box>
                      )}
                    </Grid>
                  </Grid>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Thông tin liên hệ và công việc
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      {editing ? (
                        <TextField
                          fullWidth
                          label="Địa chỉ email"
                          name="email"
                          type="email"
                          value={editedProfile.email || ''}
                          onChange={handleChange}
                          margin="normal"
                        />
                      ) : (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="textSecondary">
                            Địa chỉ email
                          </Typography>
                          <Typography variant="body1">
                            {profile.email}
                          </Typography>
                        </Box>
                      )}
                    </Grid>
                    
                    <Grid item xs={12}>
                      {editing ? (
                        <TextField
                          fullWidth
                          label="Số điện thoại"
                          name="phone"
                          value={editedProfile.phone || ''}
                          onChange={handleChange}
                          margin="normal"
                        />
                      ) : (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="textSecondary">
                            Số điện thoại
                          </Typography>
                          <Typography variant="body1">
                            {profile.phone}
                          </Typography>
                        </Box>
                      )}
                    </Grid>
                    
                    <Grid item xs={12}>
                      {editing ? (
                        <TextField
                          fullWidth
                          label="Địa chỉ"
                          name="address"
                          value={editedProfile.address || ''}
                          onChange={handleChange}
                          margin="normal"
                          multiline
                          rows={2}
                        />
                      ) : (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="textSecondary">
                            Địa chỉ
                          </Typography>
                          <Typography variant="body1">
                            {profile.address}
                          </Typography>
                        </Box>
                      )}
                    </Grid>
                    
                    <Grid item xs={12}>
                      {editing ? (
                        <TextField
                          fullWidth
                          label="Chức vụ"
                          name="position"
                          value={editedProfile.position || ''}
                          onChange={handleChange}
                          margin="normal"
                        />
                      ) : (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="textSecondary">
                            Chức vụ
                          </Typography>
                          <Typography variant="body1">
                            {profile.position}
                          </Typography>
                        </Box>
                      )}
                    </Grid>
                    
                    <Grid item xs={12}>
                      {editing ? (
                        <TextField
                          fullWidth
                          label="Phòng ban"
                          name="department"
                          value={editedProfile.department || ''}
                          onChange={handleChange}
                          margin="normal"
                        />
                      ) : (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="textSecondary">
                            Phòng ban
                          </Typography>
                          <Typography variant="body1">
                            {profile.department}
                          </Typography>
                        </Box>
                      )}
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Paper>
          </TabPanel>
          
          <TabPanel value="2">
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  Thông tin xác thực Blockchain
                </Typography>
                
                {profile.blockchain?.verified && (
                  <Chip
                    icon={<VerifiedIcon />}
                    label="Đã xác thực"
                    color="success"
                    variant="outlined"
                  />
                )}
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Khóa công khai (Public Key)
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    wordBreak: 'break-all', 
                    p: 1, 
                    bgcolor: 'grey.100', 
                    borderRadius: 1,
                    fontFamily: 'monospace'
                  }}
                >
                  {profile.blockchain?.publicKey || 'Chưa có khóa công khai'}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Thời gian xác thực gần nhất
                </Typography>
                <Typography variant="body1">
                  {profile.blockchain?.lastVerified ? formatDate(profile.blockchain.lastVerified) : 'Chưa xác thực'}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<UploadIcon />}
                  disabled={!!profile.blockchain?.verified}
                >
                  {profile.blockchain?.verified ? 'Đã xác thực trên Blockchain' : 'Xác thực trên Blockchain'}
                </Button>
              </Box>
            </Paper>
          </TabPanel>
          
          <TabPanel value="3">
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Thống kê hoạt động
              </Typography>
              
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h3" color="primary" align="center">
                        {profile.statistics?.totalRequests || 0}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" align="center">
                        Tổng số yêu cầu đã xử lý
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h3" color="success.main" align="center">
                        {profile.statistics?.approvedRequests || 0}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" align="center">
                        Yêu cầu đã phê duyệt
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h3" color="error.main" align="center">
                        {profile.statistics?.rejectedRequests || 0}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" align="center">
                        Yêu cầu đã từ chối
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h3" color="warning.main" align="center">
                        {profile.statistics?.pendingRequests || 0}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" align="center">
                        Yêu cầu đang chờ xử lý
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ mt: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Thời gian xử lý trung bình
                      </Typography>
                      <Typography variant="h5" color="primary">
                        {profile.statistics?.averageHandlingTime || 'N/A'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          </TabPanel>
        </TabContext>
      </Box>
      
      {/* Change Password Dialog */}
      <Dialog open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LockIcon sx={{ mr: 1 }} />
            Đổi mật khẩu
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Mật khẩu hiện tại"
            type="password"
            name="current"
            value={passwords.current}
            onChange={handlePasswordChange}
            error={!!passwordErrors.current}
            helperText={passwordErrors.current}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Mật khẩu mới"
            type="password"
            name="new"
            value={passwords.new}
            onChange={handlePasswordChange}
            error={!!passwordErrors.new}
            helperText={passwordErrors.new}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Xác nhận mật khẩu mới"
            type="password"
            name="confirm"
            value={passwords.confirm}
            onChange={handlePasswordChange}
            error={!!passwordErrors.confirm}
            helperText={passwordErrors.confirm}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChangePasswordOpen(false)}>
            Hủy
          </Button>
          <Button 
            onClick={handleSubmitPasswordChange} 
            variant="contained" 
            color="primary"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {saving ? 'Đang lưu...' : 'Đổi mật khẩu'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbars for success and error messages */}
      <Snackbar 
        open={success} 
        autoHideDuration={6000} 
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Thao tác thành công!
        </Alert>
      </Snackbar>
      
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OfficerProfile; 