import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  IconButton
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import PrimaryButton from '../../../../components/common/Buttons/PrimaryButton';
import SecondaryButton from '../../../../components/common/Buttons/SecondaryButton';
import { OfficerManagement } from './index';
import officerService from '../../../../services/api/officerService';
import styles from './ChairmanOfficerManagementPage.module.scss';

const OfficersPage = () => {
  const navigate = useNavigate();
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // State cho dialog tạo/chỉnh sửa cán bộ
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    position: '',
    department: '',
    address: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedOfficerId, setSelectedOfficerId] = useState(null);
  
  // State cho bộ lọc
  const [filters, setFilters] = useState({
    search: '',
    department: '',
    status: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Danh sách phòng ban
  const departments = [
    'Văn phòng UBND xã',
    'Tư pháp - Hộ tịch',
    'Văn hóa - Xã hội',
    'Địa chính - Xây dựng',
    'Tài chính - Kế toán',
    'Quốc phòng - An ninh',
    'Tổ chức - Nội vụ',
    'Y tế - Dân số'
  ];
  
  // Lấy danh sách cán bộ
  useEffect(() => {
    fetchOfficers();
  }, []);
  
  // Lấy danh sách cán bộ từ API
  const fetchOfficers = async () => {
    setLoading(true);
    try {
      const response = await officerService.getOfficers(filters);
      setOfficers(response.data);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách cán bộ:', error);
      showNotification('Không thể lấy danh sách cán bộ. Vui lòng thử lại sau!', 'error');
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
  
  // Mở dialog thêm cán bộ
  const handleOpenAddDialog = () => {
    setIsEditMode(false);
    setSelectedOfficerId(null);
    setFormData({
      email: '',
      first_name: '',
      last_name: '',
      phone_number: '',
      position: '',
      department: '',
      address: ''
    });
    setErrors({});
    setOpenDialog(true);
  };
  
  // Mở dialog chỉnh sửa cán bộ
  const handleOpenEditDialog = (officer) => {
    setIsEditMode(true);
    setSelectedOfficerId(officer.id);
    setFormData({
      email: officer.email,
      first_name: officer.first_name,
      last_name: officer.last_name,
      phone_number: officer.phone_number || '',
      position: officer.position || '',
      department: officer.department || '',
      address: officer.address || ''
    });
    setErrors({});
    setOpenDialog(true);
  };
  
  // Đóng dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setErrors({});
  };
  
  // Xử lý thay đổi trường form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Xóa lỗi
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  // Xử lý thay đổi bộ lọc
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };
  
  // Xác thực form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    if (!formData.first_name) {
      newErrors.first_name = 'Vui lòng nhập tên';
    }
    
    if (!formData.last_name) {
      newErrors.last_name = 'Vui lòng nhập họ';
    }
    
    if (formData.phone_number && !/^\d{10,11}$/.test(formData.phone_number)) {
      newErrors.phone_number = 'Số điện thoại không hợp lệ';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Áp dụng bộ lọc
  const applyFilters = () => {
    fetchOfficers();
  };
  
  // Xóa bộ lọc
  const clearFilters = () => {
    setFilters({
      search: '',
      department: '',
      status: ''
    });
    // Tự động fetch khi xóa filter
    setTimeout(fetchOfficers, 0);
  };
  
  // Xử lý tạo/chỉnh sửa cán bộ
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      if (isEditMode) {
        // Cập nhật cán bộ
        await officerService.updateOfficer(selectedOfficerId, formData);
        showNotification('Cập nhật thông tin cán bộ thành công!', 'success');
      } else {
        // Tạo cán bộ mới
        await officerService.createOfficer({
          ...formData,
          // Thêm các trường cần thiết khi tạo mới
          password: 'ChangeMe123!', // Mật khẩu mặc định, yêu cầu người dùng đổi sau
          role: 'officer',
          status: 'active'
        });
        showNotification('Tạo cán bộ mới thành công!', 'success');
      }
      
      // Đóng dialog và refresh danh sách
      handleCloseDialog();
      fetchOfficers();
    } catch (error) {
      console.error('Lỗi khi lưu thông tin cán bộ:', error);
      showNotification(error.response?.data?.message || 'Không thể lưu thông tin cán bộ. Vui lòng thử lại sau!', 'error');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Xử lý xóa cán bộ
  const handleDeleteOfficer = async (officerId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa cán bộ này không?')) {
      return;
    }
    
    try {
      await officerService.deleteOfficer(officerId);
      showNotification('Xóa cán bộ thành công!', 'success');
      fetchOfficers();
    } catch (error) {
      console.error('Lỗi khi xóa cán bộ:', error);
      showNotification('Không thể xóa cán bộ. Vui lòng thử lại sau!', 'error');
    }
  };
  
  // Xử lý xem chi tiết cán bộ
  const handleViewOfficer = (officer) => {
    navigate(`/admin/chairman/officers/${officer.id}`);
  };
  
  return (
    <Box className={styles.officersPage}>
      <Typography variant="h5" component="h1" sx={{ mb: 3 }}>
        Quản lý cán bộ xã
      </Typography>
      
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              placeholder="Tìm kiếm cán bộ..."
              variant="outlined"
              size="small"
              sx={{ width: 300, mr: 2 }}
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: filters.search ? (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setFilters({ ...filters, search: '' });
                      }}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  applyFilters();
                }
              }}
            />
            
            <SecondaryButton
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
              size="small"
            >
              Bộ lọc
            </SecondaryButton>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <SecondaryButton
              startIcon={<RefreshIcon />}
              onClick={fetchOfficers}
              size="small"
            >
              Làm mới
            </SecondaryButton>
            
            <PrimaryButton
              startIcon={<AddIcon />}
              onClick={handleOpenAddDialog}
              size="small"
            >
              Thêm cán bộ
            </PrimaryButton>
          </Box>
        </Box>
        
        {showFilters && (
          <Box sx={{ mb: 3, py: 2, borderTop: '1px solid #eee', borderBottom: '1px solid #eee' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={5}>
                <FormControl fullWidth size="small">
                  <InputLabel>Phòng ban</InputLabel>
                  <Select
                    name="department"
                    value={filters.department}
                    onChange={handleFilterChange}
                    label="Phòng ban"
                  >
                    <MenuItem value="">Tất cả</MenuItem>
                    {departments.map((dept) => (
                      <MenuItem key={dept} value={dept}>
                        {dept}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={5}>
                <FormControl fullWidth size="small">
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    label="Trạng thái"
                  >
                    <MenuItem value="">Tất cả</MenuItem>
                    <MenuItem value="active">Đang hoạt động</MenuItem>
                    <MenuItem value="pending">Chờ phê duyệt</MenuItem>
                    <MenuItem value="inactive">Ngưng hoạt động</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={2}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <PrimaryButton
                    onClick={applyFilters}
                    size="small"
                    fullWidth
                  >
                    Áp dụng
                  </PrimaryButton>
                  
                  <SecondaryButton
                    onClick={clearFilters}
                    size="small"
                    fullWidth
                  >
                    Xóa
                  </SecondaryButton>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
        
        <OfficerManagement
          officers={officers}
          loading={loading}
          onEdit={handleOpenEditDialog}
          onDelete={handleDeleteOfficer}
          onView={handleViewOfficer}
          onRefresh={fetchOfficers}
        />
      </Paper>
      
      {/* Dialog tạo/chỉnh sửa cán bộ */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {isEditMode ? 'Chỉnh sửa thông tin cán bộ' : 'Thêm cán bộ mới'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                variant="outlined"
                fullWidth
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                disabled={submitting}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Số điện thoại"
                variant="outlined"
                fullWidth
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                error={!!errors.phone_number}
                helperText={errors.phone_number}
                disabled={submitting}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Họ"
                variant="outlined"
                fullWidth
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                error={!!errors.last_name}
                helperText={errors.last_name}
                disabled={submitting}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Tên"
                variant="outlined"
                fullWidth
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                error={!!errors.first_name}
                helperText={errors.first_name}
                disabled={submitting}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={submitting}>
                <InputLabel>Phòng ban</InputLabel>
                <Select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  label="Phòng ban"
                >
                  <MenuItem value="">-- Chọn phòng ban --</MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Chức vụ"
                variant="outlined"
                fullWidth
                name="position"
                value={formData.position}
                onChange={handleChange}
                disabled={submitting}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Địa chỉ"
                variant="outlined"
                fullWidth
                name="address"
                value={formData.address}
                onChange={handleChange}
                disabled={submitting}
              />
            </Grid>
            
            {!isEditMode && (
              <Grid item xs={12}>
                <Alert severity="info">
                  Mật khẩu mặc định sẽ được tạo và gửi đến email của cán bộ. Yêu cầu cán bộ đổi mật khẩu khi đăng nhập lần đầu.
                </Alert>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <SecondaryButton onClick={handleCloseDialog} disabled={submitting}>
            Hủy
          </SecondaryButton>
          <PrimaryButton onClick={handleSubmit} disabled={submitting}>
            {isEditMode ? 'Cập nhật' : 'Tạo mới'}
          </PrimaryButton>
        </DialogActions>
      </Dialog>
      
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

export default OfficersPage;
