import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Container, 
  Paper, 
  Box, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  Edit as EditIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon 
} from '@mui/icons-material';
import PrimaryButton from '../../../../components/common/Buttons/PrimaryButton';
import SecondaryButton from '../../../../components/common/Buttons/SecondaryButton';
import authService from '../../../../services/api/authService';
import officerService from '../../../../services/api/officerService';
import styles from './ChairmanOfficerManagementPage.module.scss';

const ChairmanOfficerManagementPage = () => {
  // State
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    address: '',
    position: '',
    department: ''
  });
  const [errors, setErrors] = useState({});
  const [filters, setFilters] = useState({
    search: '',
    department: '',
    status: ''
  });
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Lấy danh sách cán bộ khi component mount
  useEffect(() => {
    fetchOfficers();
  }, []);

  // Fetch danh sách cán bộ
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
    setFormData({
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      phone_number: '',
      address: '',
      position: '',
      department: ''
    });
    setErrors({});
    setOpenDialog(true);
  };

  // Mở dialog chỉnh sửa cán bộ
  const handleOpenEditDialog = (officer) => {
    setIsEditMode(true);
    setSelectedOfficer(officer);
    setFormData({
      email: officer.email,
      first_name: officer.first_name,
      last_name: officer.last_name,
      phone_number: officer.phone_number || '',
      address: officer.address || '',
      position: officer.position || '',
      department: officer.department || ''
    });
    setErrors({});
    setOpenDialog(true);
  };

  // Đóng dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Xử lý thay đổi form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Xóa lỗi khi người dùng sửa trường
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
      newErrors.email = 'Email không được để trống';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    if (!isEditMode && !formData.password) {
      newErrors.password = 'Mật khẩu không được để trống';
    } else if (!isEditMode && formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    if (!formData.first_name) {
      newErrors.first_name = 'Tên không được để trống';
    }
    
    if (!formData.last_name) {
      newErrors.last_name = 'Họ không được để trống';
    }
    
    if (!formData.position) {
      newErrors.position = 'Chức vụ không được để trống';
    }
    
    if (!formData.department) {
      newErrors.department = 'Phòng ban không được để trống';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Tạo cán bộ mới
  const createOfficer = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const officerData = {
        ...formData,
        role: 'officer'
      };
      
      await officerService.createOfficer(officerData);
      showNotification('Đã tạo cán bộ thành công!');
      handleCloseDialog();
      fetchOfficers();
    } catch (error) {
      console.error('Lỗi khi tạo cán bộ:', error);
      
      if (error.response && error.response.data) {
        const serverErrors = error.response.data;
        const formattedErrors = {};
        
        Object.keys(serverErrors).forEach(key => {
          formattedErrors[key] = Array.isArray(serverErrors[key]) 
            ? serverErrors[key][0] 
            : serverErrors[key];
        });
        
        setErrors(formattedErrors);
      } else {
        showNotification('Không thể tạo cán bộ. Vui lòng thử lại sau!', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật cán bộ
  const updateOfficer = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const officerData = { ...formData };
      // Không gửi mật khẩu nếu trống
      if (!officerData.password) {
        delete officerData.password;
      }
      
      await officerService.updateOfficer(selectedOfficer.id, officerData);
      showNotification('Đã cập nhật cán bộ thành công!');
      handleCloseDialog();
      fetchOfficers();
    } catch (error) {
      console.error('Lỗi khi cập nhật cán bộ:', error);
      
      if (error.response && error.response.data) {
        const serverErrors = error.response.data;
        const formattedErrors = {};
        
        Object.keys(serverErrors).forEach(key => {
          formattedErrors[key] = Array.isArray(serverErrors[key]) 
            ? serverErrors[key][0] 
            : serverErrors[key];
        });
        
        setErrors(formattedErrors);
      } else {
        showNotification('Không thể cập nhật cán bộ. Vui lòng thử lại sau!', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // Xóa cán bộ
  const deleteOfficer = async (officerId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa cán bộ này?')) return;
    
    setLoading(true);
    try {
      await officerService.deleteOfficer(officerId);
      showNotification('Đã xóa cán bộ thành công!');
      fetchOfficers();
    } catch (error) {
      console.error('Lỗi khi xóa cán bộ:', error);
      showNotification('Không thể xóa cán bộ. Vui lòng thử lại sau!', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditMode) {
      updateOfficer();
    } else {
      createOfficer();
    }
  };

  // Áp dụng bộ lọc
  const applyFilters = () => {
    fetchOfficers();
  };

  // Reset bộ lọc
  const resetFilters = () => {
    setFilters({
      search: '',
      department: '',
      status: ''
    });
    fetchOfficers();
  };

  return (
    <Container maxWidth="lg" className={styles.container}>
      <Box className={styles.header}>
        <Typography variant="h4" component="h1" gutterBottom>
          Quản lý cán bộ xã
        </Typography>
        <PrimaryButton 
          onClick={handleOpenAddDialog}
          startIcon={<AddIcon />}
        >
          Thêm cán bộ mới
        </PrimaryButton>
      </Box>

      {/* Bộ lọc */}
      <Paper className={styles.filterPaper}>
        <Box className={styles.filterHeader}>
          <Typography variant="h6">
            <FilterIcon className={styles.filterIcon} /> Bộ lọc
          </Typography>
          <Tooltip title="Làm mới">
            <IconButton onClick={resetFilters} size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              name="search"
              label="Tìm kiếm theo tên, email"
              variant="outlined"
              fullWidth
              size="small"
              value={filters.search}
              onChange={handleFilterChange}
              InputProps={{
                endAdornment: <SearchIcon color="action" />
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Phòng ban</InputLabel>
              <Select
                name="department"
                value={filters.department}
                onChange={handleFilterChange}
                label="Phòng ban"
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="Phòng tư pháp">Phòng tư pháp</MenuItem>
                <MenuItem value="Phòng nội vụ">Phòng nội vụ</MenuItem>
                <MenuItem value="Phòng văn hóa">Phòng văn hóa</MenuItem>
                <MenuItem value="Phòng tài chính">Phòng tài chính</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
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
                <MenuItem value="inactive">Không hoạt động</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button 
              variant="contained" 
              color="primary" 
              fullWidth 
              onClick={applyFilters}
              startIcon={<SearchIcon />}
            >
              Lọc
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Danh sách cán bộ */}
      <Paper className={styles.tablePaper}>
        <Box className={styles.tableContainer}>
          {loading ? (
            <Typography align="center" py={3}>Đang tải...</Typography>
          ) : officers.length === 0 ? (
            <Typography align="center" py={3}>Không có cán bộ nào</Typography>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Số điện thoại</th>
                  <th>Chức vụ</th>
                  <th>Phòng ban</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {officers.map((officer) => (
                  <tr key={officer.id}>
                    <td>{`${officer.last_name} ${officer.first_name}`}</td>
                    <td>{officer.email}</td>
                    <td>{officer.phone_number || '—'}</td>
                    <td>{officer.position}</td>
                    <td>{officer.department}</td>
                    <td>
                      <span className={`${styles.status} ${officer.is_active ? styles.active : styles.inactive}`}>
                        {officer.is_active ? 'Đang hoạt động' : 'Không hoạt động'}
                      </span>
                    </td>
                    <td>
                      <Box className={styles.actions}>
                        <Tooltip title="Chỉnh sửa">
                          <IconButton 
                            size="small" 
                            color="primary" 
                            onClick={() => handleOpenEditDialog(officer)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <IconButton 
                            size="small" 
                            color="error" 
                            onClick={() => deleteOfficer(officer.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Box>
      </Paper>

      {/* Dialog thêm/sửa cán bộ */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {isEditMode ? 'Chỉnh sửa thông tin cán bộ' : 'Thêm cán bộ mới'}
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="email"
                  label="Email"
                  value={formData.email}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!!errors.email}
                  helperText={errors.email}
                  disabled={isEditMode}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="password"
                  label={isEditMode ? "Mật khẩu mới (để trống nếu không đổi)" : "Mật khẩu"}
                  type="password"
                  value={formData.password || ''}
                  onChange={handleChange}
                  fullWidth
                  required={!isEditMode}
                  error={!!errors.password}
                  helperText={errors.password}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="last_name"
                  label="Họ"
                  value={formData.last_name}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!!errors.last_name}
                  helperText={errors.last_name}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="first_name"
                  label="Tên"
                  value={formData.first_name}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!!errors.first_name}
                  helperText={errors.first_name}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="phone_number"
                  label="Số điện thoại"
                  value={formData.phone_number}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.phone_number}
                  helperText={errors.phone_number}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.position}>
                  <InputLabel>Chức vụ</InputLabel>
                  <Select
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    label="Chức vụ"
                    required
                  >
                    <MenuItem value="Cán bộ tư pháp">Cán bộ tư pháp</MenuItem>
                    <MenuItem value="Cán bộ nội vụ">Cán bộ nội vụ</MenuItem>
                    <MenuItem value="Cán bộ hành chính">Cán bộ hành chính</MenuItem>
                    <MenuItem value="Cán bộ tài chính">Cán bộ tài chính</MenuItem>
                    <MenuItem value="Cán bộ văn hóa">Cán bộ văn hóa</MenuItem>
                  </Select>
                  {errors.position && (
                    <Typography variant="caption" color="error">
                      {errors.position}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.department}>
                  <InputLabel>Phòng ban</InputLabel>
                  <Select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    label="Phòng ban"
                    required
                  >
                    <MenuItem value="Phòng tư pháp">Phòng tư pháp</MenuItem>
                    <MenuItem value="Phòng nội vụ">Phòng nội vụ</MenuItem>
                    <MenuItem value="Phòng văn hóa">Phòng văn hóa</MenuItem>
                    <MenuItem value="Phòng tài chính">Phòng tài chính</MenuItem>
                  </Select>
                  {errors.department && (
                    <Typography variant="caption" color="error">
                      {errors.department}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="address"
                  label="Địa chỉ"
                  value={formData.address}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={2}
                  error={!!errors.address}
                  helperText={errors.address}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <SecondaryButton onClick={handleCloseDialog} disabled={loading}>
              Hủy
            </SecondaryButton>
            <PrimaryButton type="submit" disabled={loading}>
              {isEditMode ? 'Cập nhật' : 'Thêm cán bộ'}
            </PrimaryButton>
          </DialogActions>
        </form>
      </Dialog>

      {/* Thông báo */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={5000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ChairmanOfficerManagementPage; 