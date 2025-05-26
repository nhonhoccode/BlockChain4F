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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import officerService from '../../../services/api/officerService';

const CitizenManagement = () => {
  const navigate = useNavigate();
  const [citizens, setCitizens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    gender: 'all',
    district: 'all',
    is_active: 'all',
    id_card_status: 'all'
  });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, citizen: null });

  useEffect(() => {
    fetchCitizens();
  }, [filters]);

  const fetchCitizens = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching citizens with filters:', filters);
      
      const response = await officerService.getCitizens(filters);
      console.log('Citizens response:', response);
      
      // Handle different response formats
      let citizensData = [];
      if (Array.isArray(response)) {
        citizensData = response;
      } else if (response && Array.isArray(response.data)) {
        citizensData = response.data;
      } else if (response && Array.isArray(response.results)) {
        citizensData = response.results;
      } else {
        console.warn('Unexpected response format:', response);
        citizensData = [];
      }
      
      console.log('Setting citizens data:', citizensData);
      setCitizens(citizensData);
    } catch (err) {
      console.error('Error fetching citizens:', err);
      
      // For development, show mock data if API fails
      if (process.env.NODE_ENV === 'development') {
        console.log('Using mock data for development');
        const mockCitizens = [
          {
            id: 1,
            first_name: 'Nguyễn Văn',
            last_name: 'A',
            email: 'nguyenvana@example.com',
            phone_number: '0912345678',
            is_active: true,
            is_verified: true,
            profile: {
              id_card_number: '123456789012',
              address: '123 Đường ABC, Phường XYZ',
              gender: 'male'
            }
          },
          {
            id: 2,
            first_name: 'Trần Thị',
            last_name: 'B',
            email: 'tranthib@example.com',
            phone_number: '0923456789',
            is_active: true,
            is_verified: false,
            profile: {
              id_card_number: '',
              address: '456 Đường DEF, Phường UVW',
              gender: 'female'
            }
          }
        ];
        setCitizens(mockCitizens);
        setError('Đang sử dụng dữ liệu mẫu (API không khả dụng)');
      } else {
        setError('Không thể tải danh sách công dân: ' + (err.message || 'Unknown error'));
        setCitizens([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditCitizen = (citizenId) => {
    navigate(`/officer/citizens/${citizenId}/edit`);
  };

  const handleDeleteCitizen = async (citizen) => {
    try {
      await officerService.deleteCitizen(citizen.id);
      setDeleteDialog({ open: false, citizen: null });
      fetchCitizens();
    } catch (err) {
      setError('Không thể xóa công dân');
      console.error('Error deleting citizen:', err);
    }
  };

  const handleExportCitizens = async () => {
    try {
      const response = await officerService.exportCitizens(filters);
      // Handle file download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'danh_sach_cong_dan.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Không thể xuất danh sách công dân');
      console.error('Error exporting citizens:', err);
    }
  };

  const getStatusChip = (citizen) => {
    if (citizen.is_active) {
      return <Chip label="Hoạt động" color="success" size="small" />;
    }
    return <Chip label="Không hoạt động" color="error" size="small" />;
  };

  const getVerificationChip = (citizen) => {
    if (citizen.is_verified) {
      return <Chip label="Đã xác thực CCCD" color="primary" size="small" />;
    }
    return <Chip label="Chưa xác thực CCCD" color="warning" size="small" />;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Đang tải danh sách công dân...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Quản lý công dân
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Debug: Loading: {loading.toString()}, Citizens count: {citizens.length}, Error: {error || 'none'}
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
          <TextField
            label="Tìm kiếm"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            size="small"
            sx={{ minWidth: 200 }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Giới tính</InputLabel>
            <Select
              value={filters.gender}
              onChange={(e) => handleFilterChange('gender', e.target.value)}
              label="Giới tính"
            >
              <MenuItem value="all">Tất cả</MenuItem>
              <MenuItem value="male">Nam</MenuItem>
              <MenuItem value="female">Nữ</MenuItem>
              <MenuItem value="other">Khác</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Trạng thái CCCD</InputLabel>
            <Select
              value={filters.id_card_status}
              onChange={(e) => handleFilterChange('id_card_status', e.target.value)}
              label="Trạng thái CCCD"
            >
              <MenuItem value="all">Tất cả</MenuItem>
              <MenuItem value="verified">Đã xác thực</MenuItem>
              <MenuItem value="unverified">Chưa xác thực</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={filters.is_active}
              onChange={(e) => handleFilterChange('is_active', e.target.value)}
              label="Trạng thái"
            >
              <MenuItem value="all">Tất cả</MenuItem>
              <MenuItem value="true">Hoạt động</MenuItem>
              <MenuItem value="false">Không hoạt động</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchCitizens}
          >
            Tải lại
          </Button>

          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportCitizens}
          >
            Xuất CSV
          </Button>
        </Box>
      </Paper>

      {/* Citizens Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Họ tên</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Số điện thoại</TableCell>
              <TableCell>CCCD/CMND</TableCell>
              <TableCell>Địa chỉ</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Xác thực</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {citizens.map((citizen) => (
              <TableRow key={citizen.id}>
                <TableCell>
                  {`${citizen.first_name} ${citizen.last_name}`.trim()}
                </TableCell>
                <TableCell>{citizen.email}</TableCell>
                <TableCell>{citizen.phone_number || 'N/A'}</TableCell>
                <TableCell>
                  {citizen.profile?.id_card_number || 'N/A'}
                </TableCell>
                <TableCell>
                  {citizen.profile?.address || 'N/A'}
                </TableCell>
                <TableCell>{getStatusChip(citizen)}</TableCell>
                <TableCell>{getVerificationChip(citizen)}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleEditCitizen(citizen.id)}
                    title="Chỉnh sửa"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => setDeleteDialog({ open: true, citizen })}
                    title="Xóa"
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {citizens.length === 0 && !loading && (
        <Box textAlign="center" py={4}>
          <Typography variant="body1" color="text.secondary">
            Không tìm thấy công dân nào
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Hãy thử tải lại trang hoặc kiểm tra kết nối mạng
          </Typography>
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, citizen: null })}
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa công dân{' '}
            <strong>
              {deleteDialog.citizen &&
                `${deleteDialog.citizen.first_name} ${deleteDialog.citizen.last_name}`.trim()}
            </strong>
            ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, citizen: null })}>
            Hủy
          </Button>
          <Button
            onClick={() => handleDeleteCitizen(deleteDialog.citizen)}
            color="error"
            variant="contained"
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CitizenManagement; 