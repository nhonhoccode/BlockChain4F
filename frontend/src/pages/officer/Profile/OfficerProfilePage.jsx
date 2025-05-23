import React, { useState, useEffect, useReducer, useRef, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  TextField, 
  Button, 
  Avatar, 
  CircularProgress, 
  Alert, 
  Divider,
  Card,
  CardContent,
  IconButton,
  Snackbar,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  LinearProgress
} from '@mui/material';
import { 
  Save as SaveIcon, 
  Edit as EditIcon, 
  PhotoCamera as PhotoCameraIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  Phone as PhoneIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  AccountBalance as AccountBalanceIcon,
  Badge as BadgeIcon,
  Crop as CropIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import officerService from '../../../services/api/officerService';
import { useTranslation } from 'react-i18next';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const OfficerProfilePage = () => {
  const { t } = useTranslation();
  
  // Tạo hàm forceUpdate để buộc component re-render
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  
  // State variables
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    address: '',
    ward: '',
    district: '',
    province: '',
    position: '',
    department: '',
    bio: '',
    date_of_birth: null,
    gender: 'male',
    id_card_number: '',
    id_card_issue_date: null,
    id_card_issue_place: ''
  });
  
  // New state variables for avatar update enhancement
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [crop, setCrop] = useState({ unit: '%', width: 100, aspect: 1 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);
  
  // Fetch profile data
  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('[fetchProfileData] Fetching profile data from API...');
      
      // Gọi API để lấy dữ liệu mới nhất
      const response = await officerService.getProfile();
      console.log('[fetchProfileData] Profile data received:', response);
      
      if (response) {
        // Cập nhật state với dữ liệu mới
        setProfile(response);
        
        // Cập nhật form data
        const newFormData = {
          first_name: response.user_details?.first_name || '',
          last_name: response.user_details?.last_name || '',
          email: response.user_details?.email || '',
          phone_number: response.phone_number || '',
          address: response.address || '',
          ward: response.ward || '',
          district: response.district || '',
          province: response.province || response.city || '',
          position: response.position || '',
          department: response.department || '',
          bio: response.bio || '',
          date_of_birth: response.date_of_birth || null,
          gender: response.gender || 'male',
          id_card_number: response.id_number || response.id_card_number || '',
          id_card_issue_date: response.id_issue_date || response.id_card_issue_date || null,
          id_card_issue_place: response.id_issue_place || response.id_card_issue_place || ''
        };
        
        console.log('[fetchProfileData] Setting form data:', newFormData);
        setFormData(newFormData);
        
        // Buộc component re-render
        forceUpdate();
      }
    } catch (err) {
      console.error('[fetchProfileData] Error:', err);
      setError('Không thể tải thông tin cá nhân. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Validate phone number
  const validatePhoneNumber = (phone) => {
    // Allow empty string or valid Vietnamese phone number
    if (!phone || phone.trim() === '') {
      return true;
    }
    // Vietnamese phone number format: 10 digits, starting with 0
    const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
    return phoneRegex.test(phone);
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      
      console.log('[handleSubmit] Form data to submit:', formData);
      
      // Validate phone number if provided
      if (formData.phone_number && !validatePhoneNumber(formData.phone_number)) {
        setError('Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam hợp lệ (10 chữ số, bắt đầu bằng số 0).');
        setSaving(false);
        return;
      }
      
      // Prepare data for API
      const updateData = {
        phone_number: formData.phone_number,
        address: formData.address,
        ward: formData.ward,
        district: formData.district,
        city: formData.province, // Backend expects city, not province
        position: formData.position,
        department: formData.department,
        bio: formData.bio,
        gender: formData.gender,
        date_of_birth: formData.date_of_birth,
        // Keep ID card information unchanged
        id_number: profile?.id_number || formData.id_card_number,
        id_issue_date: profile?.id_issue_date || formData.id_card_issue_date,
        id_issue_place: profile?.id_issue_place || formData.id_card_issue_place,
        user: {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email
        }
      };
      
      console.log('[handleSubmit] Data to send to API:', updateData);
      
      // Gọi API để cập nhật profile
      const response = await officerService.updateProfile(updateData);
      console.log('[handleSubmit] API response:', response);
      
      // Cập nhật state với dữ liệu mới
      setProfile(response);
      
      // Cập nhật form data với dữ liệu mới
      setFormData({
        ...formData,
        phone_number: response.phone_number || '',
        address: response.address || '',
        ward: response.ward || '',
        district: response.district || '',
        province: response.province || response.city || '',
        position: response.position || '',
        department: response.department || '',
        bio: response.bio || ''
      });
      
      // Hiển thị thông báo thành công
      setSuccess(true);
      setEditMode(false);
      
      // Buộc component re-render
      forceUpdate();
      
    } catch (err) {
      console.error('[handleSubmit] Error:', err);
      
      // Extract specific error message if available
      if (err.response && err.response.data) {
        if (err.response.data.email) {
          setError(`Email: ${err.response.data.email[0]}`);
        } else if (err.response.data.detail) {
          setError(err.response.data.detail);
        } else {
          setError('Không thể cập nhật thông tin cá nhân. Vui lòng thử lại sau.');
        }
      } else {
        setError('Không thể cập nhật thông tin cá nhân. Vui lòng thử lại sau.');
      }
    } finally {
      setSaving(false);
    }
  };
  
  // Function to validate image file
  const validateImageFile = (file) => {
    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return { valid: false, error: 'Kích thước ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 5MB.' };
    }
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return { valid: false, error: 'Định dạng ảnh không hợp lệ. Vui lòng chọn ảnh JPG, PNG hoặc GIF.' };
    }
    
    return { valid: true, error: '' };
  };
  
  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setUploadError(validation.error);
      setPreviewOpen(true);
      return;
    }
    
    setUploadError('');
    setSelectedFile(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
      setPreviewOpen(true);
    };
    reader.readAsDataURL(file);
  };
  
  // Handle image load in cropper
  const onImageLoad = (img) => {
    imgRef.current = img.target;
  };
  
  // Generate cropped image
  const generateCroppedImage = useCallback(async () => {
    if (!imgRef.current || !completedCrop || !previewCanvasRef.current) {
      return;
    }
    
    const image = imgRef.current;
    const canvas = previewCanvasRef.current;
    const crop = completedCrop;
    
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = crop.width;
    canvas.height = crop.height;
    
    const ctx = canvas.getContext('2d');
    
    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );
    
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Canvas is empty');
          return;
        }
        
        blob.name = selectedFile?.name || 'profile-picture.jpg';
        const croppedImageUrl = URL.createObjectURL(blob);
        setCroppedImageUrl(croppedImageUrl);
        resolve(blob);
      }, 'image/jpeg', 0.95);
    });
  }, [completedCrop, selectedFile]);
  
  // Apply crop when completed crop changes
  useEffect(() => {
    if (!completedCrop || !previewCanvasRef.current || !imgRef.current) {
      return;
    }
    
    generateCroppedImage();
  }, [completedCrop, generateCroppedImage]);
  
  // Handle upload of cropped image
  const handleUploadCroppedImage = async () => {
    if (!selectedFile) return;
    
    let progressInterval;
    
    try {
      setIsCropping(false);
      setSaving(true);
      setUploadProgress(0);
      setError(null);
      
      // Get the cropped image blob
      let imageBlob;
      if (isCropping && completedCrop && completedCrop.width && completedCrop.height) {
        imageBlob = await generateCroppedImage();
      } else {
        imageBlob = selectedFile;
      }
      
      // Create a proper file from the blob with correct filename and type
      const imageFile = new File(
        [imageBlob], 
        selectedFile.name || 'profile-picture.jpg',
        { type: 'image/jpeg' }
      );
      
      // Create form data for file upload
      const formData = new FormData();
      formData.append('profile_picture', imageFile);
      
      // Log the form data for debugging
      console.log('Form data entries:');
      for (const pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]} (type: ${typeof pair[1]})`);
      }
      
      // Simulated upload progress
      progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 10;
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 300);
      
      // Call API to upload profile picture
      const response = await officerService.updateProfilePicture(formData);
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      console.log('Profile picture update response:', response);
      
      // Update local state
      if (response && response.profile_picture) {
        // Create a new profile object with timestamp to force re-render
        setProfile(prev => ({
          ...prev,
          avatar: response.profile_picture,
          profile_picture: response.profile_picture,
          _lastUpdated: new Date().getTime()
        }));
      }
      
      setSuccess(true);
      setPreviewOpen(false);
      setSelectedFile(null);
      setPreviewUrl('');
      setCroppedImageUrl(null);
      
      // Force a re-fetch of profile data to ensure UI is updated
      setTimeout(() => {
        fetchProfileData();
      }, 500);
    } catch (err) {
      console.error('Error uploading profile picture:', err);
      
      // Extract specific error message if available
      if (err.response && err.response.data) {
        if (err.response.data.profile_picture) {
          setUploadError(`Lỗi: ${err.response.data.profile_picture[0]}`);
        } else if (err.response.data.detail) {
          setUploadError(`Lỗi: ${err.response.data.detail}`);
        } else if (err.response.data.error) {
          setUploadError(`Lỗi: ${err.response.data.error}`);
        } else {
          setUploadError('Không thể cập nhật ảnh đại diện. Vui lòng thử lại sau.');
        }
      } else if (err.message) {
        setUploadError(`Lỗi: ${err.message}`);
      } else {
        setUploadError('Không thể cập nhật ảnh đại diện. Vui lòng thử lại sau.');
      }
    } finally {
      setSaving(false);
      // Use try-catch to avoid errors if progressInterval is undefined
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    }
  };
  
  // Handle close preview dialog
  const handleClosePreview = () => {
    setPreviewOpen(false);
    setSelectedFile(null);
    setPreviewUrl('');
    setCroppedImageUrl(null);
    setUploadError('');
    setUploadProgress(0);
    setIsCropping(false);
  };
  
  // Toggle cropping mode
  const toggleCropping = () => {
    setIsCropping(!isCropping);
  };
  
  // Load profile data on component mount
  useEffect(() => {
    console.log('[useEffect] Component mounted');
    
    // Kiểm tra xem có dữ liệu trong localStorage không
    try {
      const savedProfile = localStorage.getItem('officerProfile');
      
      if (savedProfile) {
        console.log('[useEffect] Found profile in localStorage');
        // Nếu có dữ liệu trong localStorage, hiển thị ngay lập tức
        const parsedProfile = JSON.parse(savedProfile);
        setProfile(parsedProfile);
        
        // Cập nhật form data
        const cachedFormData = {
          first_name: parsedProfile.user_details?.first_name || '',
          last_name: parsedProfile.user_details?.last_name || '',
          email: parsedProfile.user_details?.email || '',
          phone_number: parsedProfile.phone_number || '',
          address: parsedProfile.address || '',
          ward: parsedProfile.ward || '',
          district: parsedProfile.district || '',
          province: parsedProfile.province || parsedProfile.city || '',
          position: parsedProfile.position || '',
          department: parsedProfile.department || '',
          bio: parsedProfile.bio || '',
          date_of_birth: parsedProfile.date_of_birth || null,
          gender: parsedProfile.gender || 'male',
          id_card_number: parsedProfile.id_number || parsedProfile.id_card_number || '',
          id_card_issue_date: parsedProfile.id_issue_date || parsedProfile.id_card_issue_date || null,
          id_card_issue_place: parsedProfile.id_issue_place || parsedProfile.id_card_issue_place || ''
        };
        setFormData(cachedFormData);
      } else {
        console.log('[useEffect] No profile in localStorage');
      }
    } catch (e) {
      console.error('[useEffect] Error loading profile from localStorage:', e);
    }
    
    // Sau đó gọi API để lấy dữ liệu mới nhất
    fetchProfileData();
    
    // Thiết lập interval để tự động refresh dữ liệu mỗi 30 giây
    const intervalId = setInterval(() => {
      console.log('[useEffect] Auto-refreshing profile data');
      fetchProfileData();
    }, 30000);
    
    // Cleanup function để clear interval khi component unmount
    return () => {
      console.log('[useEffect] Component unmounting, clearing interval');
      clearInterval(intervalId);
    };
  }, []);
  
  // Handle close success message
  const handleCloseSuccess = () => {
    setSuccess(false);
  };
  
  // Handle profile picture upload
  const handleProfilePictureUpload = (e) => {
    handleFileSelect(e);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      {/* Debug info - sẽ chỉ hiển thị trong console */}
      {console.log('Rendering profile with data:', profile)}
      {console.log('Form data:', formData)}
      
      <Typography variant="h4" gutterBottom>
        {t('officer.profile.title', 'Thông tin cá nhân')}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />} 
          onClick={() => {
            fetchProfileData();
            forceUpdate(); // Buộc component re-render khi làm mới dữ liệu
          }}
          disabled={loading}
        >
          {loading ? 'Đang tải...' : 'Làm mới dữ liệu'}
        </Button>
      </Box>
      
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSuccess} severity="success">
          {t('officer.profile.updateSuccess', 'Cập nhật thông tin thành công!')}
        </Alert>
      </Snackbar>
      
      <Grid container spacing={3}>
        {/* Profile Summary Card */}
        <Grid item xs={12} md={4}>
          <Card key={`profile-card-${profile?._timestamp || Math.random()}`}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pb: 3 }}>
              <Box sx={{ position: 'relative', mb: 3 }}>
                <Avatar 
                  src={profile?.avatar || profile?.profile_picture || ''}
                  sx={{ width: 120, height: 120, mb: 2 }}
                  imgProps={{
                    onError: (e) => {
                      console.error('Error loading avatar image:', e);
                      e.target.src = ''; // Clear src on error to show fallback
                    },
                    // Add timestamp to force refresh
                    key: `avatar-${profile?._lastUpdated || Math.random()}`
                  }}
                >
                  {!profile?.avatar && !profile?.profile_picture && <PersonIcon sx={{ fontSize: 60 }} />}
                </Avatar>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="profile-picture-upload"
                  type="file"
                  onChange={handleProfilePictureUpload}
                  disabled={saving}
                />
                <label htmlFor="profile-picture-upload">
                  <Tooltip title="Cập nhật ảnh đại diện">
                    <IconButton 
                      component="span"
                      sx={{ 
                        position: 'absolute', 
                        bottom: 0, 
                        right: 0, 
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'primary.dark',
                        }
                      }}
                      disabled={saving}
                    >
                      <PhotoCameraIcon />
                    </IconButton>
                  </Tooltip>
                </label>
              </Box>
              
              <Typography variant="h5" gutterBottom>
                {profile?.user_details?.first_name || ''} {profile?.user_details?.last_name || ''}
              </Typography>
              
              <Typography variant="body1" color="textSecondary" gutterBottom>
                {profile?.position || t('officer.profile.position', 'Cán bộ xã')}
              </Typography>
              
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {profile?.department || t('officer.profile.department', 'Phòng hành chính')}
              </Typography>
              
              <Divider sx={{ width: '100%', my: 2 }} />
              
              <Typography variant="body2" gutterBottom>
                <strong>{t('officer.profile.email', 'Email')}:</strong> <span>{profile?.user_details?.email || ''}</span>
              </Typography>
              
              <Typography variant="body2" gutterBottom>
                <strong>{t('officer.profile.phone', 'Số điện thoại')}:</strong> <span>{profile?.phone_number || t('common.notProvided', 'Chưa cung cấp')}</span>
              </Typography>
              
              <Typography variant="body2" gutterBottom>
                <strong>{t('officer.profile.address', 'Địa chỉ')}:</strong> <span>
                  {profile?.address ? 
                    `${profile.address}${profile.ward ? ', ' + profile.ward : ''}${profile.district ? ', ' + profile.district : ''}${profile.province || profile.city ? ', ' + (profile.province || profile.city) : ''}` 
                    : t('common.notProvided', 'Chưa cung cấp')}
                </span>
              </Typography>
              
              <Divider sx={{ width: '100%', my: 2 }} />
              
              <Typography variant="body2" gutterBottom>
                <strong>{t('officer.profile.idCard', 'Số CCCD/CMND')}:</strong> <span>{profile?.id_number || profile?.id_card_number || t('common.notProvided', 'Chưa cung cấp')}</span>
              </Typography>
              
              <Typography variant="body2" gutterBottom>
                <strong>{t('officer.profile.gender', 'Giới tính')}:</strong> <span>{profile?.gender === 'male' ? 'Nam' : profile?.gender === 'female' ? 'Nữ' : 'Khác'}</span>
              </Typography>
              
              <Typography variant="body2" gutterBottom>
                <strong>{t('officer.profile.dateOfBirth', 'Ngày sinh')}:</strong> <span>{profile?.date_of_birth || t('common.notProvided', 'Chưa cung cấp')}</span>
              </Typography>

              {/* Thêm phần hiển thị thông tin công việc */}
              <Divider sx={{ width: '100%', my: 2 }} />
              
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: 'primary.main' }}>
                {t('officer.profile.workInfo', 'Thông tin công việc')}
              </Typography>
              
              <Typography variant="body2" gutterBottom>
                <strong>{t('officer.profile.position', 'Chức vụ')}:</strong> <span>{profile?.position || t('common.notProvided', 'Chưa cung cấp')}</span>
              </Typography>
              
              <Typography variant="body2" gutterBottom>
                <strong>{t('officer.profile.department', 'Phòng ban')}:</strong> <span>{profile?.department || t('common.notProvided', 'Chưa cung cấp')}</span>
              </Typography>
              
              {/* Thêm phần hiển thị giới thiệu */}
              <Divider sx={{ width: '100%', my: 2 }} />
              
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: 'primary.main' }}>
                {t('common.bio', 'Giới thiệu')}
              </Typography>
              
              <Box sx={{ 
                backgroundColor: 'background.paper',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                p: 2,
                position: 'relative',
                width: '100%',
                '&:before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '4px',
                  height: '100%',
                  backgroundColor: 'primary.main',
                  borderTopLeftRadius: 8,
                  borderBottomLeftRadius: 8,
                }
              }}>
                <Typography variant="body2" sx={{ 
                  fontStyle: 'italic',
                  pl: 1,
                  lineHeight: 1.6
                }}>
                  {profile?.bio || t('common.notProvided', 'Chưa cung cấp thông tin giới thiệu')}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Profile Edit Form */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" gutterBottom sx={{ mb: 0 }}>
                {editMode ? t('officer.profile.editInfo', 'Chỉnh sửa thông tin') : t('officer.profile.personalInfo', 'Thông tin cá nhân')}
              </Typography>
              
              {!editMode && (
                <Button 
                  variant="outlined" 
                  startIcon={<EditIcon />}
                  onClick={() => setEditMode(true)}
                >
                  {t('common.edit', 'Chỉnh sửa')}
                </Button>
              )}
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            <form onSubmit={handleSubmit} key={`profile-form-${profile?._timestamp || Math.random()}`}>
              <Grid container spacing={2}>
                {/* Personal Information */}
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                    {t('officer.profile.personalInfo', 'Thông tin cá nhân')}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t('common.firstName', 'Tên')}
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    disabled={!editMode || saving}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t('common.lastName', 'Họ')}
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    disabled={!editMode || saving}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t('common.email', 'Email')}
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!editMode || saving}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t('common.phone', 'Số điện thoại')}
                    name="phone_number"
                    value={formData.phone_number || ''}
                    onChange={handleInputChange}
                    disabled={!editMode || saving}
                    required
                    error={!!(formData.phone_number && !validatePhoneNumber(formData.phone_number))}
                    helperText={
                      formData.phone_number && !validatePhoneNumber(formData.phone_number)
                        ? 'Số điện thoại không hợp lệ (10 chữ số, bắt đầu bằng số 0)'
                        : 'Nhập số điện thoại Việt Nam (VD: 0912345678)'
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">{t('common.gender', 'Giới tính')}</FormLabel>
                    <RadioGroup
                      row
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      disabled={!editMode || saving}
                    >
                      <FormControlLabel value="male" control={<Radio disabled={!editMode || saving} />} label={t('common.male', 'Nam')} />
                      <FormControlLabel value="female" control={<Radio disabled={!editMode || saving} />} label={t('common.female', 'Nữ')} />
                      <FormControlLabel value="other" control={<Radio disabled={!editMode || saving} />} label={t('common.other', 'Khác')} />
                    </RadioGroup>
                  </FormControl>
                </Grid>
                
                {/* CCCD Information */}
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                    {t('common.idCardInfo', 'Thông tin CCCD/CMND')}
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Thông tin CCCD/CMND không thể thay đổi. Liên hệ quản trị viên nếu cần cập nhật.
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label={t('common.idCardNumber', 'Số CCCD/CMND')}
                          name="id_card_number"
                          value={formData.id_card_number}
                          disabled={true}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <BadgeIcon />
                              </InputAdornment>
                            ),
                          }}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label={t('common.idCardIssueDate', 'Ngày cấp')}
                          name="id_card_issue_date"
                          value={formData.id_card_issue_date || ''}
                          disabled={true}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label={t('common.idCardIssuePlace', 'Nơi cấp')}
                          name="id_card_issue_place"
                          value={formData.id_card_issue_place || ''}
                          disabled={true}
                          size="small"
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
                
                {/* Work Information */}
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                    {t('officer.profile.workInfo', 'Thông tin công việc')}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t('officer.profile.position', 'Chức vụ')}
                    name="position"
                    value={formData.position || ''}
                    onChange={handleInputChange}
                    disabled={!editMode || saving}
                    placeholder="Nhập chức vụ của bạn"
                    helperText="Chức vụ sẽ hiển thị trong hồ sơ và các tài liệu"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AdminPanelSettingsIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t('officer.profile.department', 'Phòng ban')}
                    name="department"
                    value={formData.department || ''}
                    onChange={handleInputChange}
                    disabled={!editMode || saving}
                    placeholder="Nhập phòng ban của bạn"
                    helperText="Phòng ban sẽ hiển thị trong hồ sơ và các tài liệu"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccountBalanceIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                {/* Address Information */}
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                    {t('common.address', 'Địa chỉ')}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={t('common.streetAddress', 'Địa chỉ chi tiết')}
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={!editMode || saving}
                  />
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label={t('common.ward', 'Phường/Xã')}
                    name="ward"
                    value={formData.ward}
                    onChange={handleInputChange}
                    disabled={!editMode || saving}
                  />
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label={t('common.district', 'Quận/Huyện')}
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    disabled={!editMode || saving}
                  />
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label={t('common.province', 'Tỉnh/Thành phố')}
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    disabled={!editMode || saving}
                  />
                </Grid>
                
                {/* Bio */}
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                    {t('common.bio', 'Giới thiệu')}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={t('common.bio', 'Giới thiệu bản thân')}
                    name="bio"
                    value={formData.bio || ''}
                    onChange={handleInputChange}
                    disabled={!editMode || saving}
                    multiline
                    rows={4}
                    placeholder="Nhập thông tin giới thiệu về bản thân..."
                    helperText="Thông tin giới thiệu sẽ được hiển thị trong hồ sơ của bạn"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: 'primary.main',
                          borderWidth: 2,
                        },
                      },
                      '& .MuiInputBase-input': {
                        fontStyle: 'italic',
                      }
                    }}
                  />
                </Grid>
                
                {/* Form Actions */}
                {editMode && (
                  <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      variant="outlined" 
                      sx={{ mr: 2 }}
                      onClick={() => {
                        setEditMode(false);
                        fetchProfileData(); // Reset form data
                      }}
                      disabled={saving}
                    >
                      {t('common.cancel', 'Hủy')}
                    </Button>
                    
                    <Button 
                      type="submit" 
                      variant="contained" 
                      startIcon={<SaveIcon />}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <CircularProgress size={20} sx={{ mr: 1 }} />
                          {t('common.saving', 'Đang lưu...')}
                        </>
                      ) : t('common.save', 'Lưu')}
                    </Button>
                  </Grid>
                )}
              </Grid>
            </form>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Image Preview Dialog */}
      <Dialog 
        open={previewOpen} 
        onClose={handleClosePreview}
        maxWidth="md"
        PaperProps={{
          sx: {
            width: '100%',
            maxWidth: 600,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {isCropping ? 'Cắt ảnh đại diện' : 'Xem trước ảnh đại diện'}
          </Typography>
          <IconButton onClick={handleClosePreview} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers>
          {uploadError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {uploadError}
            </Alert>
          )}
          
          {previewUrl && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {isCropping ? (
                <>
                  <ReactCrop
                    src={previewUrl}
                    onImageLoaded={onImageLoad}
                    crop={crop}
                    onChange={c => setCrop(c)}
                    onComplete={c => setCompletedCrop(c)}
                    circularCrop
                    style={{ maxHeight: '400px' }}
                  />
                  <canvas
                    ref={previewCanvasRef}
                    style={{
                      display: 'none',
                      width: completedCrop?.width ?? 0,
                      height: completedCrop?.height ?? 0
                    }}
                  />
                </>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  width: '100%',
                  mb: 2
                }}>
                  <img 
                    src={croppedImageUrl || previewUrl} 
                    alt="Preview" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '350px',
                      borderRadius: croppedImageUrl ? '50%' : '0'
                    }} 
                  />
                </Box>
              )}
              
              <Box sx={{ width: '100%', mt: 2, display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  startIcon={isCropping ? <CloseIcon /> : <CropIcon />}
                  onClick={toggleCropping}
                  sx={{ mr: 1 }}
                >
                  {isCropping ? 'Hủy cắt' : 'Cắt ảnh'}
                </Button>
              </Box>
            </Box>
          )}
          
          {uploadProgress > 0 && uploadProgress < 100 && (
            <Box sx={{ width: '100%', mt: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Đang tải lên: {uploadProgress}%
              </Typography>
              <LinearProgress variant="determinate" value={uploadProgress} />
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClosePreview} disabled={saving}>
            Hủy
          </Button>
          <Button 
            variant="contained" 
            onClick={handleUploadCroppedImage}
            disabled={saving || !!uploadError}
            startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {saving ? 'Đang tải lên...' : 'Lưu ảnh đại diện'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OfficerProfilePage;
