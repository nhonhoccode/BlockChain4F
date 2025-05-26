import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import officerService from '../../../services/api/officerService';

const CitizenEdit = () => {
  const { citizenId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [citizen, setCitizen] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    is_active: true,
    is_verified: false,
    profile: {
      gender: '',
      date_of_birth: '',
      address: '',
      ward: '',
      district: '',
      city: '',
      id_card_number: '',
      id_card_issue_date: '',
      id_card_issue_place: ''
    }
  });

  useEffect(() => {
    fetchCitizen();
  }, [citizenId]);

  const fetchCitizen = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching citizen detail for ID:', citizenId);
      
      const response = await officerService.getCitizenDetail(citizenId);
      console.log('Citizen detail response:', response);
      
      // Handle different response formats
      let citizenData = null;
      if (response && typeof response === 'object') {
        if (response.data) {
          citizenData = response.data;
        } else {
          citizenData = response;
        }
      }
      
      if (citizenData) {
        setCitizen(citizenData);
      } else {
        setError('Không tìm thấy thông tin công dân');
      }
    } catch (err) {
      setError('Không thể tải thông tin công dân: ' + (err.message || 'Unknown error'));
      console.error('Error fetching citizen:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.startsWith('profile.')) {
      const profileField = field.replace('profile.', '');
      setCitizen(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          [profileField]: value
        }
      }));
    } else {
      setCitizen(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      await officerService.updateCitizen(citizenId, citizen);
      setSuccess('Cập nhật thông tin công dân thành công');
      
      // Navigate back after a short delay
      setTimeout(() => {
        navigate('/officer/citizens');
      }, 2000);
    } catch (err) {
      setError('Không thể cập nhật thông tin công dân');
      console.error('Error updating citizen:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/officer/citizens');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Chỉnh sửa thông tin công dân
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Debug: Loading: {loading.toString()}, Citizen ID: {citizenId}, Has citizen data: {!!citizen}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Thông tin cơ bản
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Họ"
              value={citizen?.last_name || ''}
              onChange={(e) => handleInputChange('last_name', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Tên"
              value={citizen?.first_name || ''}
              onChange={(e) => handleInputChange('first_name', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={citizen?.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Số điện thoại"
              value={citizen?.phone_number || ''}
              onChange={(e) => handleInputChange('phone_number', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Giới tính</InputLabel>
              <Select
                value={citizen.profile?.gender || ''}
                onChange={(e) => handleInputChange('profile.gender', e.target.value)}
                label="Giới tính"
              >
                <MenuItem value="male">Nam</MenuItem>
                <MenuItem value="female">Nữ</MenuItem>
                <MenuItem value="other">Khác</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Ngày sinh"
              type="date"
              value={citizen.profile?.date_of_birth || ''}
              onChange={(e) => handleInputChange('profile.date_of_birth', e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>

          {/* Address Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Thông tin địa chỉ
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Địa chỉ"
              value={citizen.profile?.address || ''}
              onChange={(e) => handleInputChange('profile.address', e.target.value)}
              multiline
              rows={2}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Phường/Xã"
              value={citizen.profile?.ward || ''}
              onChange={(e) => handleInputChange('profile.ward', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Quận/Huyện"
              value={citizen.profile?.district || ''}
              onChange={(e) => handleInputChange('profile.district', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Tỉnh/Thành phố"
              value={citizen.profile?.city || ''}
              onChange={(e) => handleInputChange('profile.city', e.target.value)}
            />
          </Grid>

          {/* ID Card Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Thông tin CCCD/CMND
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Số CCCD/CMND"
              value={citizen.profile?.id_card_number || ''}
              onChange={(e) => handleInputChange('profile.id_card_number', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Ngày cấp"
              type="date"
              value={citizen.profile?.id_card_issue_date || ''}
              onChange={(e) => handleInputChange('profile.id_card_issue_date', e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Nơi cấp"
              value={citizen.profile?.id_card_issue_place || ''}
              onChange={(e) => handleInputChange('profile.id_card_issue_place', e.target.value)}
            />
          </Grid>

          {/* Account Status */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Trạng thái tài khoản
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={citizen?.is_active || false}
                  onChange={(e) => handleInputChange('is_active', e.target.checked)}
                />
              }
              label="Tài khoản hoạt động"
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={citizen?.is_verified || false}
                  onChange={(e) => handleInputChange('is_verified', e.target.checked)}
                />
              }
              label="Xác thực CCCD/CMND"
            />
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? <CircularProgress size={20} /> : 'Lưu thay đổi'}
              </Button>
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={saving}
              >
                Hủy
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default CitizenEdit; 