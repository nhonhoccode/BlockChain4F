import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Chip,
  Avatar,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Divider,
  Tabs,
  Tab,
  Snackbar,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Stack,
  useTheme
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  EventNote as EventNoteIcon,
  Public as PublicIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import PropTypes from 'prop-types';
import chairmanService from '../../../../services/api/chairmanService';

/**
 * OfficerManagement Component
 */
const OfficerManagement = ({ onEdit, onDelete, onView, onRefresh }) => {
  const theme = useTheme();
  
  // State for officers
  const [officers, setOfficers] = useState([]);
  const [filteredOfficers, setFilteredOfficers] = useState([]);
  const [selectedOfficer, setSelectedOfficer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0); // 0: All, 1: Active, 2: Inactive
  
  // State for menu and dialogs
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmBlockDialogOpen, setConfirmBlockDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');
  
  // Mock data for officers
  const mockOfficers = [
    {
      id: 'off1',
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
      qualifications: ['Cử nhân Quản lý đất đai', 'Chứng chỉ GIS']
    },
    {
      id: 'off2',
      name: 'Trần Thị Bình',
      email: 'tranthib@example.com',
      phone: '0912345678',
      position: 'Cán bộ tư pháp',
      department: 'Phòng Tư pháp',
      status: 'active',
      joinDate: '2022-03-15',
      lastActive: '2023-06-17T14:45:00Z',
      avatar: null,
      assignedRequests: 8,
      completedRequests: 7,
      address: '456 Đường X, Phường Y, Quận Z, TP. HCM',
      qualifications: ['Cử nhân Luật', 'Chứng chỉ Công chứng']
    },
    {
      id: 'off3',
      name: 'Lê Văn Cường',
      email: 'levancuong@example.com',
      phone: '0909123456',
      position: 'Cán bộ hộ tịch',
      department: 'Phòng Hộ tịch',
      status: 'inactive',
      joinDate: '2020-08-22',
      lastActive: '2023-01-10T10:15:00Z',
      avatar: null,
      assignedRequests: 20,
      completedRequests: 18,
      address: '789 Đường D, Phường E, Quận F, TP. HCM',
      qualifications: ['Cử nhân Hành chính công']
    },
    {
      id: 'off4',
      name: 'Phạm Thị Dung',
      email: 'phamthidung@example.com',
      phone: '0978123456',
      position: 'Cán bộ văn thư',
      department: 'Phòng Văn thư',
      status: 'active',
      joinDate: '2021-11-05',
      lastActive: '2023-06-18T09:20:00Z',
      avatar: null,
      assignedRequests: 15,
      completedRequests: 15,
      address: '101 Đường G, Phường H, Quận I, TP. HCM',
      qualifications: ['Cử nhân Hành chính', 'Chứng chỉ Lưu trữ']
    },
    {
      id: 'off5',
      name: 'Hoàng Văn Em',
      email: 'hoangvanem@example.com',
      phone: '0918765432',
      position: 'Cán bộ địa chính',
      department: 'Phòng Địa chính',
      status: 'active',
      joinDate: '2022-01-15',
      lastActive: '2023-06-17T16:30:00Z',
      avatar: null,
      assignedRequests: 9,
      completedRequests: 8,
      address: '222 Đường J, Phường K, Quận L, TP. HCM',
      qualifications: ['Cử nhân Quản lý đất đai']
    }
  ];
  
  // Fetch officers data on component mount
  useEffect(() => {
    fetchOfficers();
  }, []);
  
  // Filter officers when search term or tab changes
  useEffect(() => {
    if (officers.length > 0) {
      let filtered = officers;
      
      // Filter by tab value
      if (tabValue === 1) {
        filtered = filtered.filter(officer => officer.status === 'active');
      } else if (tabValue === 2) {
        filtered = filtered.filter(officer => officer.status === 'inactive');
      }
      
      // Filter by search term
      if (searchTerm) {
        filtered = filtered.filter(
          officer => officer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    officer.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    officer.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setFilteredOfficers(filtered);
    }
  }, [searchTerm, tabValue, officers]);
  
  // Function to fetch officers
  const fetchOfficers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Chuẩn bị tham số lọc
      const filters = {};
      
      // Thêm tham số search nếu có
      if (searchTerm) {
        filters.search = searchTerm;
      }
      
      // Thêm tham số status nếu tab không phải "All"
      if (tabValue === 1) {
        filters.status = 'active';
      } else if (tabValue === 2) {
        filters.status = 'inactive';
      }
      
      console.log('Fetching officers with filters:', filters);
      
      // Gọi API từ chairmanService
      const response = await chairmanService.getOfficers(filters);
      
      // Xử lý kết quả
      if (response && response.results) {
        // Nếu response có cấu trúc phân trang
        setOfficers(response.results);
        setFilteredOfficers(response.results);
      } else if (Array.isArray(response)) {
        // Nếu response là một array
        setOfficers(response);
        setFilteredOfficers(response);
      } else {
        // Fallback to mock data if response is invalid
        console.warn('Invalid response format, using mock data');
        setOfficers(mockOfficers);
        setFilteredOfficers(mockOfficers);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching officers:', err);
      setError('Không thể tải danh sách cán bộ. Vui lòng thử lại sau.');
      setLoading(false);
      
      // Fallback to mock data in case of error
      setOfficers(mockOfficers);
      setFilteredOfficers(mockOfficers);
    }
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
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle menu open
  const handleMenuOpen = (event, officer) => {
    setAnchorEl(event.currentTarget);
    setSelectedOfficer(officer);
  };
  
  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Handle edit officer
  const handleEditOfficer = () => {
    handleMenuClose();
    if (onEdit && selectedOfficer) {
      onEdit(selectedOfficer);
    }
  };
  
  // Handle view officer details
  const handleViewOfficer = () => {
    handleMenuClose();
    if (onView && selectedOfficer) {
      onView(selectedOfficer);
    }
  };
  
  // Open delete confirmation dialog
  const handleOpenDeleteDialog = () => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  };
  
  // Close delete confirmation dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };
  
  // Handle delete officer
  const handleDeleteOfficer = async () => {
    if (!selectedOfficer) return;
    
    setLoading(true);
    setDeleteDialogOpen(false);
    
    try {
      // Gọi API để xóa cán bộ
      const response = await chairmanService.removeOfficer(selectedOfficer.id);
      
      if (response && response.success) {
        // Hiển thị thông báo thành công
        setSnackbarMessage('Đã xóa cán bộ thành công');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        
        // Cập nhật danh sách cán bộ
        fetchOfficers();
      } else {
        // Hiển thị thông báo lỗi
        setSnackbarMessage(response?.error || 'Không thể xóa cán bộ. Vui lòng thử lại sau.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error deleting officer:', error);
      setSnackbarMessage('Không thể xóa cán bộ. Vui lòng thử lại sau.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle block/unblock officer
  const handleBlockOfficer = async () => {
    if (!selectedOfficer) return;
    
    setLoading(true);
    setConfirmBlockDialogOpen(false);
    
    try {
      const isCurrentlyActive = selectedOfficer.status === 'active';
      const action = isCurrentlyActive ? 'block' : 'unblock';
      
      // Gọi API để khóa/mở khóa cán bộ
      const response = await (isCurrentlyActive 
        ? chairmanService.blockOfficer(selectedOfficer.id, { reason: 'Khóa bởi chủ tịch xã' })
        : chairmanService.unblockOfficer(selectedOfficer.id)
      );
      
      if (response && response.success) {
        // Hiển thị thông báo thành công
        setSnackbarMessage(isCurrentlyActive 
          ? `Đã khóa tài khoản cán bộ ${selectedOfficer.name}`
          : `Đã mở khóa tài khoản cán bộ ${selectedOfficer.name}`
        );
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        
        // Cập nhật danh sách cán bộ
        fetchOfficers();
      } else {
        // Hiển thị thông báo lỗi
        setSnackbarMessage(response?.error || `Không thể ${action === 'block' ? 'khóa' : 'mở khóa'} tài khoản. Vui lòng thử lại sau.`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error blocking/unblocking officer:', error);
      setSnackbarMessage('Không thể thực hiện hành động. Vui lòng thử lại sau.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
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
  
  // Get first character of name for avatar
  const getNameInitial = (name) => {
    return name.charAt(0).toUpperCase();
  };
  
  // Render loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 120px)' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={fetchOfficers}>
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
    <Box sx={{ p: 3 }}>
      {/* Page header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" color="primary.main">
          Quản lý cán bộ
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Quản lý danh sách và thông tin cán bộ trong hệ thống
        </Typography>
      </Box>
      
      {/* Action bar */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2, boxShadow: theme.shadows[2] }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              placeholder="Tìm kiếm theo tên, chức vụ, email..."
              variant="outlined"
              size="small"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 1 }}>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={() => {
                  // Navigate to add officer page
                  console.log('Add new officer');
                }}
              >
                Thêm cán bộ
              </Button>
              
              <Tooltip title="Làm mới">
                <IconButton onClick={fetchOfficers}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Bộ lọc">
                <IconButton>
                  <FilterIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="standard"
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: theme.typography.fontWeightMedium,
              fontSize: '0.9rem',
              mx: 1
            }
          }}
        >
          <Tab label={`Tất cả (${officers.length})`} id="tab-0" />
          <Tab 
            label={`Đang hoạt động (${officers.filter(o => o.status === 'active').length})`} 
            id="tab-1" 
          />
          <Tab 
            label={`Không hoạt động (${officers.filter(o => o.status === 'inactive').length})`} 
            id="tab-2" 
          />
        </Tabs>
      </Box>
      
      {/* Officers grid */}
      {filteredOfficers.length > 0 ? (
        <Grid container spacing={3}>
          {filteredOfficers.map((officer) => (
            <Grid item xs={12} md={6} lg={4} key={officer.id}>
              <Card sx={{ 
                borderRadius: 2, 
                boxShadow: theme.shadows[2],
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[4],
                }
              }}>
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                      {getNameInitial(officer.name)}
                    </Avatar>
                  }
                  action={
                    <IconButton onClick={(e) => handleMenuOpen(e, officer)}>
                      <MoreVertIcon />
                    </IconButton>
                  }
                  title={
                    <Typography variant="subtitle1" fontWeight="medium">
                      {officer.name}
                    </Typography>
                  }
                  subheader={
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <BadgeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {officer.position}
                      </Typography>
                    </Box>
                  }
                />
                <Divider />
                <CardContent>
                  <Stack spacing={1.5}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">{officer.email}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">{officer.phone}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PublicIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">{officer.department}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <EventNoteIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">Ngày tham gia: {formatDate(officer.joinDate)}</Typography>
                    </Box>
                  </Stack>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip 
                      label={getStatusLabel(officer.status)}
                      color={getStatusColor(officer.status)}
                      size="small"
                    />
                    
                    <Box>
                      <Tooltip title="Xem chi tiết">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => {
                            setSelectedOfficer(officer);
                            handleViewOfficer();
                          }}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Chỉnh sửa">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => {
                            setSelectedOfficer(officer);
                            handleEditOfficer();
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <PersonIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Không tìm thấy cán bộ nào
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Không có cán bộ nào phù hợp với tìm kiếm của bạn
          </Typography>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />}
            onClick={() => {
              setSearchTerm('');
              setTabValue(0);
              fetchOfficers();
            }}
          >
            Làm mới danh sách
          </Button>
        </Paper>
      )}
      
      {/* Officer menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { minWidth: 180 }
        }}
      >
        <MenuItem onClick={handleViewOfficer}>
          <ViewIcon fontSize="small" sx={{ mr: 1.5 }} />
          Xem chi tiết
        </MenuItem>
        <MenuItem onClick={handleEditOfficer}>
          <EditIcon fontSize="small" sx={{ mr: 1.5 }} />
          Chỉnh sửa
        </MenuItem>
        <MenuItem onClick={handleBlockOfficer}>
          {selectedOfficer?.status === 'active' ? (
            <>
              <BlockIcon fontSize="small" sx={{ mr: 1.5 }} />
              Vô hiệu hóa
            </>
          ) : (
            <>
              <CheckCircleIcon fontSize="small" sx={{ mr: 1.5 }} />
              Kích hoạt
            </>
          )}
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleOpenDeleteDialog} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1.5 }} />
          Xóa cán bộ
        </MenuItem>
      </Menu>
      
      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Xác nhận xóa cán bộ</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa cán bộ {selectedOfficer?.name || ''}? 
            Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Hủy</Button>
          <Button onClick={handleDeleteOfficer} color="error" variant="contained">
            Xóa cán bộ
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Block/Unblock confirmation dialog */}
      <Dialog
        open={confirmBlockDialogOpen}
        onClose={() => setConfirmBlockDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedOfficer?.status === 'active' 
            ? 'Xác nhận vô hiệu hóa tài khoản' 
            : 'Xác nhận kích hoạt tài khoản'
          }
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedOfficer?.status === 'active'
              ? `Bạn có chắc chắn muốn vô hiệu hóa tài khoản của cán bộ ${selectedOfficer?.name || ''}? 
                Cán bộ này sẽ không thể đăng nhập vào hệ thống.`
              : `Bạn có chắc chắn muốn kích hoạt tài khoản của cán bộ ${selectedOfficer?.name || ''}? 
                Cán bộ này sẽ có thể đăng nhập và sử dụng hệ thống.`
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmBlockDialogOpen(false)}>Hủy</Button>
          <Button 
            onClick={handleBlockOfficer} 
            color={selectedOfficer?.status === 'active' ? 'error' : 'success'} 
            variant="contained"
          >
            {selectedOfficer?.status === 'active' ? 'Vô hiệu hóa' : 'Kích hoạt'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

OfficerManagement.propTypes = {
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onView: PropTypes.func,
  onRefresh: PropTypes.func
};

export default OfficerManagement; 