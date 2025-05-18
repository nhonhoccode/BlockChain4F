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
  Alert,
  Snackbar,
  Card,
  CardContent,
  Chip,
  useTheme
} from '@mui/material';
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  VerifiedUser as VerifiedUserIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import { api } from '../../../utils/api';

// Dữ liệu mẫu
const FALLBACK_DATA = {
  id: 'citizen-123',
  firstName: 'Nguyễn',
  lastName: 'Văn A',
  email: 'nguyenvana@example.com',
  phone: '0912345678',
  address: 'Số 123, Đường Lê Lợi, Quận Hoàn Kiếm, Hà Nội',
  identityNumber: '001099012345',
  dateOfBirth: '1990-01-15',
  gender: 'Nam',
  nationality: 'Việt Nam',
  isVerified: true,
  createdAt: '2022-05-10T08:30:00Z',
  updatedAt: '2023-01-20T15:45:00Z'
};

const CitizenProfile = () => {
  const theme = useTheme();
  const { currentUser, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: ''
  });

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await api.get('/api/v1/citizen/profile/');
        
        if (response.data) {
          setProfileData(response.data);
          setFormData({
            firstName: response.data.firstName || '',
            lastName: response.data.lastName || '',
            email: response.data.email || '',
            phone: response.data.phone || '',
            address: response.data.address || ''
          });
        } else {
          throw new Error('Invalid data format');
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Không thể kết nối đến máy chủ. Đang hiển thị dữ liệu mẫu.');
        
        // Use fallback data
        setProfileData(FALLBACK_DATA);
        setFormData({
          firstName: FALLBACK_DATA.firstName || '',
          lastName: FALLBACK_DATA.lastName || '',
          email: FALLBACK_DATA.email || '',
          phone: FALLBACK_DATA.phone || '',
          address: FALLBACK_DATA.address || ''
        });
      } finally {
        setLoading(false);
      }
    };

    // Set timeout to use fallback data if API takes too long
    const timeoutId = setTimeout(() => {
      if (loading) {
        setProfileData(FALLBACK_DATA);
        setFormData({
          firstName: FALLBACK_DATA.firstName || '',
          lastName: FALLBACK_DATA.lastName || '',
          email: FALLBACK_DATA.email || '',
          phone: FALLBACK_DATA.phone || '',
          address: FALLBACK_DATA.address || ''
        });
        setLoading(false);
        setError('Tải dữ liệu quá thời gian. Đang hiển thị dữ liệu mẫu.');
      }
    }, 3000);

    fetchProfileData();
    
    return () => clearTimeout(timeoutId);
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    try {
      const response = await api.put('/api/v1/citizen/profile/', formData);
      
      if (response.data) {
        setProfileData({
          ...profileData,
          ...formData,
          updatedAt: new Date().toISOString()
        });
        setSuccess('Thông tin cá nhân đã được cập nhật thành công.');
        setEditMode(false);
        
        // Update auth context if available
        if (updateUserProfile) {
          updateUserProfile({
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email
          });
        }
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Không thể cập nhật thông tin. Vui lòng thử lại sau.');
      
      // Revert form data to current profile data
      setFormData({
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        address: profileData.address || ''
      });
    } finally {
      setSaving(false);
    }
  };

  // Cancel edit mode
  const handleCancel = () => {
    setFormData({
      firstName: profileData.firstName || '',
      lastName: profileData.lastName || '',
      email: profileData.email || '',
      phone: profileData.phone || '',
      address: profileData.address || ''
    });
    setEditMode(false);
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'Không xác định';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    } catch (error) {
      return 'Không xác định';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Tiêu đề trang */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Thông tin cá nhân
        </Typography>
        {!editMode && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
            onClick={() => setEditMode(true)}
          >
            Chỉnh sửa
          </Button>
        )}
      </Box>

      {/* Hiển thị lỗi và thông báo thành công */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>

      {/* Thông tin cá nhân */}
      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden', mb: 4 }}>
        <Box sx={{ 
          p: 3, 
          bgcolor: theme.palette.primary.main, 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: 'white',
              color: theme.palette.primary.main
            }}
          >
            {profileData.firstName?.charAt(0) || 'C'}
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {`${profileData.firstName || ''} ${profileData.lastName || ''}`}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Chip
                icon={<VerifiedUserIcon />}
                label={profileData.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                color={profileData.isVerified ? 'success' : 'warning'}
                size="small"
                sx={{ mr: 1, color: 'white', borderColor: 'white' }}
                variant="outlined"
              />
              <Typography variant="body2">
                ID: {profileData.id}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ p: 3 }}>
          {editMode ? (
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Họ"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    variant="outlined"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Tên"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    variant="outlined"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    variant="outlined"
                    type="email"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Số điện thoại"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Địa chỉ"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    variant="outlined"
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      Hủy
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      startIcon={<SaveIcon />}
                      disabled={saving}
                    >
                      {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                      <PersonIcon sx={{ mr: 1 }} /> Thông tin cơ bản
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Họ và tên</Typography>
                        <Typography variant="body1">{`${profileData.firstName || ''} ${profileData.lastName || ''}`}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Ngày sinh</Typography>
                        <Typography variant="body1">{formatDate(profileData.dateOfBirth)}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Giới tính</Typography>
                        <Typography variant="body1">{profileData.gender || 'Không xác định'}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Quốc tịch</Typography>
                        <Typography variant="body1">{profileData.nationality || 'Không xác định'}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                      <ContactIcon sx={{ mr: 1 }} /> Thông tin liên hệ
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <EmailIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">Email</Typography>
                          <Typography variant="body1">{profileData.email || 'Chưa cập nhật'}</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PhoneIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">Số điện thoại</Typography>
                          <Typography variant="body1">{profileData.phone || 'Chưa cập nhật'}</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <HomeIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">Địa chỉ</Typography>
                          <Typography variant="body1">{profileData.address || 'Chưa cập nhật'}</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                      <SecurityIcon sx={{ mr: 1 }} /> Thông tin pháp lý
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Số CMND/CCCD</Typography>
                        <Typography variant="body1">{profileData.identityNumber || 'Chưa cập nhật'}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Trạng thái xác thực</Typography>
                        <Chip
                          icon={<VerifiedUserIcon />}
                          label={profileData.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                          color={profileData.isVerified ? 'success' : 'warning'}
                          size="small"
                        />
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Ngày tạo tài khoản</Typography>
                        <Typography variant="body1">{formatDate(profileData.createdAt)}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Cập nhật lần cuối</Typography>
                        <Typography variant="body1">{formatDate(profileData.updatedAt)}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </Box>
      </Paper>

      {/* Nút thay đổi mật khẩu */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<SecurityIcon />}
        >
          Thay đổi mật khẩu
        </Button>
      </Box>
    </Box>
  );
};

// Temporary component for the missing ContactIcon
const ContactIcon = () => <EmailIcon />;

export default CitizenProfile; 