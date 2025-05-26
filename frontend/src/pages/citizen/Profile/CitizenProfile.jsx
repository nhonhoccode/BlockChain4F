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
  VerifiedUser as VerifiedIcon,
  Security as SecurityIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import citizenService from '../../../services/api/citizenService';
import officerService from '../../../services/api/officerService';

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
  
  // Get citizenId from URL query parameters
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const citizenId = queryParams.get('id');
  const isViewingOtherCitizen = !!citizenId;
  
  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🔍 Fetching profile data from API...');
        
        let response;
          if (isViewingOtherCitizen) {
          // If viewing another citizen's profile as an officer
          console.log(`Fetching citizen profile with ID: ${citizenId}`);
          response = await officerService.getCitizenDetail(citizenId);
        } else {
          // If viewing own profile as a citizen
          response = await citizenService.getProfile();
        }
        
        console.log('✅ Profile data received:', response);
        
        if (response) {
          // Handle different response formats
          const data = response.data || response;
          
          setProfileData(data);
          setFormData({
            firstName: data.first_name || data.firstName || '',
            lastName: data.last_name || data.lastName || '',
            email: data.email || (data.user_details ? data.user_details.email : '') || '',
            phone: data.phone_number || data.phone || '',
            address: data.address || ''
          });
        } else {
          throw new Error('Invalid data format');
        }
      } catch (err) {
        console.error('❌ Error fetching profile data:', err);
        if (err.response?.status === 401) {
          setError('Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } else if (err.response?.status === 404) {
          setError('Không tìm thấy thông tin cá nhân. API endpoint không tồn tại.');
        } else {
          setError(`Không thể tải thông tin cá nhân: ${err.message || 'Lỗi không xác định'}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [citizenId, isViewingOtherCitizen]);

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
      const response = await citizenService.updateProfile(formData);
      
      if (response) {
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
        firstName: profileData.firstName || profileData.first_name || '',
        lastName: profileData.lastName || profileData.last_name || '',
        email: profileData.email || (profileData.user_details ? profileData.user_details.email : '') || '',
        phone: profileData.phone || profileData.phone_number || '',
        address: profileData.address || ''
      });
    } finally {
      setSaving(false);
    }
  };

  // Cancel edit mode
  const handleCancel = () => {
    if (profileData) {
      setFormData({
        firstName: profileData.firstName || profileData.first_name || '',
        lastName: profileData.lastName || profileData.last_name || '',
        email: profileData.email || (profileData.user_details ? profileData.user_details.email : '') || '',
        phone: profileData.phone || profileData.phone_number || '',
        address: profileData.address || ''
      });
    }
    setEditMode(false);
  };
  
  // Handle back button
  const handleBack = () => {
    navigate(-1);
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'Không xác định';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Không xác định';
      }
      return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    } catch (error) {
      console.error('Date formatting error:', error);
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

  // Verificar se profileData existe antes de renderizar o componente
  if (!profileData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Không thể tải thông tin cá nhân. Vui lòng thử lại sau.
        </Alert>
      </Box>
    );
  }

  // Get name from different possible formats
  const firstName = profileData.firstName || profileData.first_name || '';
  const lastName = profileData.lastName || profileData.last_name || '';
  const fullName = `${firstName} ${lastName}`;
  
  // Get other fields from different possible formats
  const email = profileData.email || (profileData.user_details ? profileData.user_details.email : '') || '';
  const phone = profileData.phone || profileData.phone_number || '';
  const address = profileData.address || '';
  const gender = profileData.gender || '';
  const dateOfBirth = profileData.dateOfBirth || profileData.date_of_birth || '';
  const idCardNumber = profileData.identityNumber || profileData.id_card_number || '';
  const idCardIssueDate = profileData.id_card_issue_date || '';
  const idCardIssuePlace = profileData.id_card_issue_place || '';
  const createdAt = profileData.createdAt || profileData.created_at || '';
  const updatedAt = profileData.updatedAt || profileData.updated_at || '';
  const isVerified = profileData.isVerified || false;
  const ward = profileData.ward || '';
  const district = profileData.district || '';
  const province = profileData.province || profileData.city || '';

  return (
    <Box sx={{ p: 3 }}>
      {/* Tiêu đề trang */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isViewingOtherCitizen && (
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
              sx={{ mr: 2 }}
            >
              Quay lại
            </Button>
          )}
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            {isViewingOtherCitizen ? `Hồ sơ: ${fullName}` : 'Thông tin cá nhân'}
          </Typography>
        </Box>
        {!editMode && profileData && !isViewingOtherCitizen && (
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
            {firstName ? firstName.charAt(0) : 'C'}
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {fullName}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Chip
                icon={<VerifiedIcon />}
                label={isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                color={isVerified ? 'success' : 'warning'}
                size="small"
                sx={{ mr: 1, color: 'white', borderColor: 'white' }}
                variant="outlined"
              />
              <Typography variant="body2">
                ID: {profileData.id || 'N/A'}
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
                        <Typography variant="body1">{fullName}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Ngày sinh</Typography>
                        <Typography variant="body1">{formatDate(dateOfBirth)}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Giới tính</Typography>
                        <Typography variant="body1">{gender || 'Không xác định'}</Typography>
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
                          <Typography variant="body1">{email || 'Chưa cập nhật'}</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PhoneIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">Số điện thoại</Typography>
                          <Typography variant="body1">{phone || 'Chưa cập nhật'}</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <HomeIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">Địa chỉ</Typography>
                          <Typography variant="body1">
                            {address ? `${address}, ${ward}, ${district}, ${province}` : 'Chưa cập nhật'}
                          </Typography>
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
                        <Typography variant="body1">{idCardNumber || 'Chưa cập nhật'}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Ngày cấp</Typography>
                        <Typography variant="body1">{formatDate(idCardIssueDate)}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Nơi cấp</Typography>
                        <Typography variant="body1">{idCardIssuePlace || 'Chưa cập nhật'}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Trạng thái xác thực</Typography>
                        <Chip
                          icon={<VerifiedIcon />}
                          label={isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                          color={isVerified ? 'success' : 'warning'}
                          size="small"
                        />
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Ngày tạo tài khoản</Typography>
                        <Typography variant="body1">{formatDate(createdAt)}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Cập nhật lần cuối</Typography>
                        <Typography variant="body1">{formatDate(updatedAt)}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </Box>
      </Paper>

      {/* Nút thay đổi mật khẩu - chỉ hiển thị khi xem hồ sơ cá nhân */}
      {!isViewingOtherCitizen && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<SecurityIcon />}
          >
            Thay đổi mật khẩu
          </Button>
        </Box>
      )}
    </Box>
  );
};

// Temporary component for the missing ContactIcon
const ContactIcon = () => <EmailIcon />;

export default CitizenProfile; 