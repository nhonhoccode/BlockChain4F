import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Alert,
  Snackbar,
  Divider,
  FormControlLabel,
  Checkbox,
  FormHelperText,
  LinearProgress,
  Card,
  CardContent,
  Avatar
} from '@mui/material';
import { 
  Save as SaveIcon, 
  Cancel as CancelIcon, 
  Person as PersonIcon, 
  Home as HomeIcon,
  VerifiedUser as VerifiedUserIcon,
  ArrowBack as ArrowBackIcon 
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import viLocale from 'date-fns/locale/vi';
import { useTranslation } from 'react-i18next';
import officerService from '../../../services/api/officerService';

const CitizenEdit = () => {
  const { t } = useTranslation();
  const { citizenId } = useParams();
  const navigate = useNavigate();
  
  // State variables
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [citizen, setCitizen] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    gender: '',
    date_of_birth: null,
    address: '',
    ward: '',
    district: '',
    city: '',
    id_card_number: '',
    id_card_issue_date: null,
    id_card_issue_place: '',
    is_active: true,
    verify_id_card: false
  });
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  
  // Fetch citizen data on component mount
  useEffect(() => {
    const fetchCitizenData = async () => {
      try {
        setLoading(true);
        const data = await officerService.getCitizenDetail(citizenId);
        setCitizen(data);
        
        // Initialize form with citizen data
        const profile = data.profile || {};
        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          phone_number: data.phone_number || data.phone || '',
          gender: profile.gender || '',
          date_of_birth: profile.date_of_birth ? new Date(profile.date_of_birth) : null,
          address: profile.address || '',
          ward: profile.ward || '',
          district: profile.district || '',
          city: profile.city || '',
          id_card_number: profile.id_card_number || '',
          id_card_issue_date: profile.id_card_issue_date ? new Date(profile.id_card_issue_date) : null,
          id_card_issue_place: profile.id_card_issue_place || '',
          is_active: data.is_active !== undefined ? data.is_active : true,
          verify_id_card: data.is_verified || false
        });
      } catch (error) {
        console.error('Error fetching citizen data:', error);
        setSnackbar({
          open: true,
          message: 'Không thể tải thông tin công dân. Vui lòng thử lại sau.',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (citizenId) {
      fetchCitizenData();
    }
  }, [citizenId]);
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  // Handle checkbox changes
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  // Handle date changes
  const handleDateChange = (name) => (date) => {
    setFormData(prev => ({
      ...prev,
      [name]: date
    }));
    
    // Clear validation error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'Họ không được để trống';
    }
    
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Tên không được để trống';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    // Validate ID card number if provided
    if (formData.id_card_number && !/^\d{9,12}$/.test(formData.id_card_number)) {
      newErrors.id_card_number = 'Số CMND/CCCD phải từ 9-12 chữ số';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: 'Vui lòng kiểm tra lại thông tin đã nhập',
        severity: 'error'
      });
      return;
    }
    
    try {
      setSaving(true);
      
      // Prepare data for API
      const dataToSubmit = {
        ...formData,
        // Format dates for API
        date_of_birth: formData.date_of_birth ? formData.date_of_birth.toISOString().split('T')[0] : null,
        id_card_issue_date: formData.id_card_issue_date ? formData.id_card_issue_date.toISOString().split('T')[0] : null
      };
      
      // Call API to update citizen
      await officerService.updateCitizen(citizenId, dataToSubmit);
      
      setSnackbar({
        open: true,
        message: 'Cập nhật thông tin công dân thành công',
        severity: 'success'
      });
      
      // Navigate back after short delay
      setTimeout(() => {
        navigate('/officer/citizens');
      }, 1500);
      
    } catch (error) {
      console.error('Error updating citizen:', error);
      setSnackbar({
        open: true,
        message: 'Không thể cập nhật thông tin công dân: ' + (error.message || 'Vui lòng thử lại sau'),
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    navigate('/officer/citizens');
  };
  
  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };
  
  // Format citizen name for display
  const citizenName = citizen ? 
    `${citizen.last_name || ''} ${citizen.first_name || ''}`.trim() : 
    'Công dân';
  
  return (
    <Box sx={{ p: 3 }}>
      {/* Page title */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleCancel}
          sx={{ mr: 2 }}
        >
          {t('common.back', 'Quay lại')}
        </Button>
        <Typography variant="h4" component="h1">
          {t('officer.citizenEdit.title', 'Chỉnh sửa thông tin công dân')}
        </Typography>
      </Box>
      
      {loading ? (
        <Box sx={{ width: '100%' }}>
          <LinearProgress />
          <Typography sx={{ mt: 2 }}>
            {t('common.loading', 'Đang tải dữ liệu...')}
          </Typography>
        </Box>
      ) : (
        <>
          {citizen ? (
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Citizen basic info card */}
                <Grid item xs={12}>
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar 
                          src={citizen?.profile?.avatar} 
                          sx={{ width: 60, height: 60, mr: 2 }}
                        >
                          {`${citizen?.first_name?.charAt(0) || ''}${citizen?.last_name?.charAt(0) || ''}`}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {citizenName}
                          </Typography>
                          <Typography variant="body1" color="text.secondary">
                            ID: {citizenId}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Personal Information */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PersonIcon sx={{ mr: 1 }} /> {t('common.personalInfo', 'Thông tin cá nhân')}
                  </Typography>
                  <Paper sx={{ p: 3 }} elevation={1}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label={t('common.lastName', 'Họ')}
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleChange}
                          error={!!errors.first_name}
                          helperText={errors.first_name}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label={t('common.firstName', 'Tên')}
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleChange}
                          error={!!errors.last_name}
                          helperText={errors.last_name}
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
                          onChange={handleChange}
                          error={!!errors.email}
                          helperText={errors.email}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label={t('common.phoneNumber', 'Số điện thoại')}
                          name="phone_number"
                          value={formData.phone_number}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel id="gender-label">{t('common.gender', 'Giới tính')}</InputLabel>
                          <Select
                            labelId="gender-label"
                            name="gender"
                            value={formData.gender}
                            label={t('common.gender', 'Giới tính')}
                            onChange={handleChange}
                          >
                            <MenuItem value=""><em>{t('common.none', 'Không')}</em></MenuItem>
                            <MenuItem value="male">{t('common.male', 'Nam')}</MenuItem>
                            <MenuItem value="female">{t('common.female', 'Nữ')}</MenuItem>
                            <MenuItem value="other">{t('common.other', 'Khác')}</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={viLocale}>
                          <DatePicker
                            label={t('common.dateOfBirth', 'Ngày sinh')}
                            value={formData.date_of_birth}
                            onChange={handleDateChange('date_of_birth')}
                            renderInput={(params) => (
                              <TextField 
                                {...params} 
                                fullWidth 
                                error={!!errors.date_of_birth}
                                helperText={errors.date_of_birth}
                              />
                            )}
                          />
                        </LocalizationProvider>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
                
                {/* Address Information */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 2 }}>
                    <HomeIcon sx={{ mr: 1 }} /> {t('common.addressInfo', 'Thông tin địa chỉ')}
                  </Typography>
                  <Paper sx={{ p: 3 }} elevation={1}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label={t('common.address', 'Địa chỉ')}
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label={t('common.ward', 'Phường/Xã')}
                          name="ward"
                          value={formData.ward}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label={t('common.district', 'Quận/Huyện')}
                          name="district"
                          value={formData.district}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label={t('common.city', 'Tỉnh/Thành phố')}
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
                
                {/* ID Card Information */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 2 }}>
                    <VerifiedUserIcon sx={{ mr: 1 }} /> {t('common.idCardInfo', 'Thông tin CMND/CCCD')}
                  </Typography>
                  <Paper sx={{ p: 3 }} elevation={1}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label={t('common.idCardNumber', 'Số CMND/CCCD')}
                          name="id_card_number"
                          value={formData.id_card_number}
                          onChange={handleChange}
                          error={!!errors.id_card_number}
                          helperText={errors.id_card_number}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={viLocale}>
                          <DatePicker
                            label={t('common.idCardIssueDate', 'Ngày cấp')}
                            value={formData.id_card_issue_date}
                            onChange={handleDateChange('id_card_issue_date')}
                            renderInput={(params) => (
                              <TextField 
                                {...params} 
                                fullWidth 
                                error={!!errors.id_card_issue_date}
                                helperText={errors.id_card_issue_date}
                              />
                            )}
                          />
                        </LocalizationProvider>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label={t('common.idCardIssuePlace', 'Nơi cấp')}
                          name="id_card_issue_place"
                          value={formData.id_card_issue_place}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formData.verify_id_card}
                              onChange={handleCheckboxChange}
                              name="verify_id_card"
                              color="primary"
                            />
                          }
                          label={t('officer.citizenEdit.verifyIdCard', 'Xác thực thông tin CMND/CCCD')}
                        />
                        <FormHelperText>
                          {t('officer.citizenEdit.verifyIdCardHelp', 'Đánh dấu để xác nhận thông tin CMND/CCCD của công dân là hợp lệ')}
                        </FormHelperText>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
                
                {/* Account Status */}
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, mt: 2 }} elevation={1}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.is_active}
                          onChange={handleCheckboxChange}
                          name="is_active"
                          color="primary"
                        />
                      }
                      label={t('officer.citizenEdit.activeAccount', 'Tài khoản đang hoạt động')}
                    />
                    <FormHelperText>
                      {formData.is_active 
                        ? t('officer.citizenEdit.activeAccountHelp', 'Bỏ đánh dấu để vô hiệu hóa tài khoản công dân này')
                        : t('officer.citizenEdit.inactiveAccountHelp', 'Đánh dấu để kích hoạt lại tài khoản công dân này')}
                    </FormHelperText>
                  </Paper>
                </Grid>
                
                {/* Actions */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 3 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      {t('common.cancel', 'Hủy bỏ')}
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<SaveIcon />}
                      type="submit"
                      disabled={saving}
                    >
                      {saving 
                        ? t('common.saving', 'Đang lưu...') 
                        : t('common.saveChanges', 'Lưu thay đổi')}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Alert severity="error">
              {t('officer.citizenEdit.notFound', 'Không tìm thấy thông tin công dân. Vui lòng kiểm tra lại ID.')}
            </Alert>
          )}
        </>
      )}
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CitizenEdit; 