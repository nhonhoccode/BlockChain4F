import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  TextField, 
  Button, 
  CircularProgress, 
  Alert, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  InputAdornment,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  TableSortLabel,
  Chip,
  FormControl,
  InputLabel,
  Select,
  LinearProgress,
  Avatar,
  Tabs,
  Tab,
  Card,
  CardContent
} from '@mui/material';
import { 
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Assignment as AssignmentIcon,
  FilterList as FilterListIcon,
  CreditCard as CreditCardIcon,
  CalendarToday as CalendarTodayIcon,
  Download as DownloadIcon,
  AccessTime as AccessTimeIcon,
  Event as EventIcon,
  People as PeopleIcon,
  VerifiedUser as VerifiedIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import officerService from '../../../services/api/officerService';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const CitizenList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // State variables
  const [citizens, setCitizens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCitizen, setSelectedCitizen] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuCitizen, setMenuCitizen] = useState(null);
  const [orderBy, setOrderBy] = useState('last_name');
  const [order, setOrder] = useState('asc');
  const [filterStatus, setFilterStatus] = useState('all');
  const [totalCitizens, setTotalCitizens] = useState(0);
  const [isFiltering, setIsFiltering] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [advancedFilters, setAdvancedFilters] = useState({
    ageGroup: 'all',
    gender: 'all',
    idCardStatus: 'all',
    district: 'all'
  });
  const [districts, setDistricts] = useState([]);
  const [statsData, setStatsData] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    recent: 0
  });
  
  // Tab handling
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    
    switch (newValue) {
      case 0: // Tất cả
        setFilterStatus('all');
        break;
      case 1: // Đang hoạt động
        setFilterStatus('active');
        break;
      case 2: // Không hoạt động
        setFilterStatus('inactive');
        break;
      case 3: // Mới đăng ký
        setFilterStatus('recent');
        break;
      default:
        setFilterStatus('all');
    }
    
    // Gọi API để lấy dữ liệu mới với trạng thái mới
    setTimeout(() => {
      fetchCitizens();
    }, 100);
  };
  
  // Fetch citizens
  const fetchCitizens = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setIsFiltering(true);
      
      const filters = {};
      if (searchTerm) {
        filters.search = searchTerm;
      }
      
      // Thêm các bộ lọc nâng cao - đảm bảo các tên trường khớp với API backend
      if (advancedFilters.gender !== 'all') {
        console.log('Lọc theo giới tính:', advancedFilters.gender);
        filters.gender = advancedFilters.gender; // Giá trị cần là: 'male', 'female', hoặc 'other'
      }
      
      if (advancedFilters.ageGroup !== 'all') {
        filters.age_group = advancedFilters.ageGroup;
      }
      
      // XỬ LÝ BỘ LỌC TRẠNG THÁI CCCD - ĐƠN GIẢN HÓA
      if (advancedFilters.idCardStatus !== 'all') {
        // Gửi tham số rõ ràng với tên field API đúng là id_card_status
        filters.id_card_status = advancedFilters.idCardStatus;
        console.log('Lọc theo trạng thái CCCD:', advancedFilters.idCardStatus);
      }
      
      if (advancedFilters.district !== 'all') {
        filters.district = advancedFilters.district;
      }
      
      // Thêm lọc theo trạng thái tab
      if (filterStatus !== 'all') {
        if (filterStatus === 'active') {
          filters.is_active = true;
        } else if (filterStatus === 'inactive') {
          filters.is_active = false;
        } else if (filterStatus === 'recent') {
          // Tính thời gian 30 ngày trước
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          filters.created_after = thirtyDaysAgo.toISOString().split('T')[0];
        }
      }
      
      console.log('Fetching citizens with filters:', filters);
      const response = await officerService.getCitizens(filters);
      console.log('Citizens response:', response);
      
      // Ensure citizens is always an array
      let citizensData = [];
      if (Array.isArray(response)) {
        citizensData = response;
        console.log('Response is array with length:', citizensData.length);
      } else if (response && typeof response === 'object') {
        // If response is an object with a results property (common API pattern)
        if (Array.isArray(response.results)) {
          citizensData = response.results;
          console.log('Using response.results with length:', citizensData.length);
        } else if (response.data && Array.isArray(response.data)) {
          citizensData = response.data;
          console.log('Using response.data with length:', citizensData.length);
        } else {
          // If we can't find an array in the response, set an empty array
          console.error('Citizens data is not in expected format:', response);
          citizensData = [];
          setError('Dữ liệu không đúng định dạng. Vui lòng liên hệ quản trị viên.');
        }
      } else {
        // If response is not an array or object, set an empty array
        console.error('Invalid citizens data format:', response);
        citizensData = [];
        setError('Dữ liệu không đúng định dạng. Vui lòng liên hệ quản trị viên.');
      }
      
      // Tính toán các thống kê
      const now = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      
      const total = citizensData.length;
      const active = citizensData.filter(c => c.is_active === true).length;
      const inactive = citizensData.filter(c => c.is_active === false).length;
      const recent = citizensData.filter(c => {
        const createdDate = new Date(c.date_joined || c.created_at);
        return createdDate >= oneMonthAgo;
      }).length;
      
      setStatsData({
        total,
        active,
        inactive,
        recent
      });
      
      // Trích xuất danh sách quận/huyện duy nhất
      const uniqueDistricts = [...new Set(citizensData
        .filter(c => c.profile?.district)
        .map(c => c.profile.district))];
      setDistricts(uniqueDistricts);
      
      // Lưu dữ liệu công dân
      setCitizens(citizensData);
      setTotalCitizens(total);
      
    } catch (err) {
      console.error('Error fetching citizens:', err);
      setError('Không thể tải danh sách công dân. Vui lòng thử lại sau.');
      setCitizens([]); // Ensure citizens is an empty array on error
    } finally {
      setLoading(false);
      setIsFiltering(false);
    }
  }, [searchTerm, advancedFilters, filterStatus]);
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return t('common.notProvided', 'Chưa cung cấp');
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: vi });
    } catch (e) {
      return dateString;
    }
  };
  
  // Format address
  const formatAddress = useCallback((profile) => {
    if (!profile) return t('common.notProvided', 'Chưa cung cấp');
    
    const address = profile.address || '';
    const ward = profile.ward || '';
    const district = profile.district || '';
    const province = profile.province || profile.city || '';
    
    const parts = [address, ward, district, province].filter(part => part.trim() !== '');
    if (parts.length === 0) return t('common.notProvided', 'Chưa cung cấp');
    
    return parts.join(', ');
  }, [t]);
  
  // Filter citizens based on status and other criteria
  const filterCitizens = useCallback((array) => {
    if (!array || !Array.isArray(array)) return [];
    
    // Trước tiên lọc theo tab (trạng thái)
    let filtered = array;
    
    if (filterStatus === 'active') {
      filtered = filtered.filter(citizen => citizen.is_active === true);
    } else if (filterStatus === 'inactive') {
      filtered = filtered.filter(citizen => citizen.is_active === false);
    } else if (filterStatus === 'recent') {
      // Những công dân đăng ký trong 30 ngày gần đây
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      
      filtered = filtered.filter(citizen => {
        const createdDate = new Date(citizen.date_joined || citizen.created_at);
        return createdDate >= oneMonthAgo;
      });
    }
    
    // Lọc theo giới tính nếu đã chọn
    if (advancedFilters.gender !== 'all') {
      filtered = filtered.filter(citizen => {
        // Kiểm tra nếu profile và gender tồn tại
        if (citizen.profile && citizen.profile.gender) {
          return citizen.profile.gender === advancedFilters.gender;
        }
        return false;
      });
      
      console.log(`Filtered by gender ${advancedFilters.gender}, remaining: ${filtered.length}`);
    }
    
    // Lọc theo trạng thái CCCD nếu đã chọn
    if (advancedFilters.idCardStatus !== 'all') {
      filtered = filtered.filter(citizen => {
        // verified - có CCCD và đã xác thực
        if (advancedFilters.idCardStatus === 'verified') {
          return citizen.profile && 
                 citizen.profile.id_card_number && 
                 citizen.is_verified;
        }
        // unverified - có CCCD nhưng chưa xác thực hoặc không có CCCD
        else if (advancedFilters.idCardStatus === 'unverified') {
          return (citizen.profile && !citizen.profile.id_card_number) || 
                 (citizen.profile && citizen.profile.id_card_number && !citizen.is_verified);
        }
        return true;
      });
    }
    
    // Lọc theo quận/huyện nếu đã chọn
    if (advancedFilters.district !== 'all') {
      filtered = filtered.filter(citizen => 
        citizen.profile && 
        citizen.profile.district === advancedFilters.district
      );
    }
    
    // Tìm kiếm theo search term nếu có (client-side search để backup)
    if (searchTerm && searchTerm.trim() !== '') {
      const term = searchTerm.trim().toLowerCase();
      filtered = filtered.filter(citizen => {
        // Các trường cần tìm kiếm
        const fullName = `${citizen.first_name || ''} ${citizen.last_name || ''}`.toLowerCase();
        const email = (citizen.email || '').toLowerCase();
        const phone = (citizen.profile?.phone_number || '').toLowerCase();
        const idCard = (citizen.profile?.id_card_number || '').toLowerCase();
        const address = formatAddress(citizen.profile).toLowerCase();
        
        // Kiểm tra xem term có xuất hiện trong bất kỳ trường nào không
        return fullName.includes(term) || 
               email.includes(term) || 
               phone.includes(term) || 
               idCard.includes(term) ||
               address.includes(term);
      });
    }
    
    return filtered;
  }, [filterStatus, advancedFilters, searchTerm, formatAddress]);
  
  // Load citizens on component mount and when filters change
  useEffect(() => {
    fetchCitizens();
  }, [fetchCitizens]);
  
  // Hiển thị kết quả tìm kiếm
  useEffect(() => {
    // Khi citizens thay đổi và đang có tìm kiếm
    if (!loading && searchTerm.trim() !== '') {
      const filtered = filterCitizens(citizens);
      
      // Hiển thị thông báo kết quả
      if (filtered.length === 0) {
        setSnackbar({
          open: true,
          message: `Không tìm thấy kết quả cho "${searchTerm}"`,
          severity: 'warning'
        });
      } else {
        setSnackbar({
          open: true,
          message: `Tìm thấy ${filtered.length} kết quả cho "${searchTerm}"`,
          severity: 'success'
        });
      }
    }
  }, [citizens, loading, searchTerm, filterCitizens]);
  
  // Handle search
  const handleSearch = (e) => {
    if (e && e.type === 'keypress' && e.key !== 'Enter') {
      return;
    }
    
    setPage(0); // Reset to first page when searching
    
    // Hiển thị thông báo khi tìm kiếm
    if (searchTerm.trim() !== '') {
      console.log(`Tìm kiếm công dân với từ khóa: "${searchTerm}"`);
      setIsFiltering(true);
      // Reuse snackbar cho thông báo
      setSnackbar({
        open: true,
        message: `Đang tìm kiếm: "${searchTerm}"`,
        severity: 'info'
      });
    }
    
    fetchCitizens();
  };
  
  // Handle search term change
  const handleSearchTermChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle refresh
  const handleRefresh = () => {
    setSearchTerm('');
    setAdvancedFilters({
      ageGroup: 'all',
      gender: 'all',
      idCardStatus: 'all',
      district: 'all'
    });
    setCurrentTab(0);
    setFilterStatus('all');
    setPage(0);
    setOrderBy('last_name');
    setOrder('asc');
    fetchCitizens();
  };
  
  // Handle export citizens to CSV
  const handleExportCitizens = async () => {
    try {
      setLoading(true);
      
      // Hiển thị thông báo bắt đầu xuất
      setSnackbar({
        open: true,
        message: 'Đang chuẩn bị xuất danh sách công dân...',
        severity: 'info'
      });
      
      // Chuẩn bị bộ lọc hiện tại
      const currentFilters = {
        gender: advancedFilters.gender,
        idCardStatus: advancedFilters.idCardStatus,
        district: advancedFilters.district,
        filterStatus: filterStatus,
        search: searchTerm
      };
      
      // Gọi API để xuất danh sách
      await officerService.exportCitizens(currentFilters);
      
      // Hiển thị thông báo thành công
      setSnackbar({
        open: true,
        message: 'Xuất danh sách công dân thành công!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Lỗi khi xuất danh sách công dân:', error);
      
      // Hiển thị thông báo lỗi
      setSnackbar({
        open: true,
        message: `Không thể xuất danh sách công dân: ${error.message || 'Lỗi không xác định'}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle filter change
  const handleFilterChange = (filterName, value) => {
    console.log(`Changing filter ${filterName} to ${value}`);
    
    setAdvancedFilters(prev => {
      const newFilters = {
        ...prev,
        [filterName]: value
      };
      console.log('New filters:', newFilters);
      return newFilters;
    });
    
    setPage(0); // Reset to first page when filtering
    
    // Hiển thị thông báo cho người dùng
    let filterLabel = '';
    if (filterName === 'gender') {
      filterLabel = t('common.gender', 'Giới tính');
      if (value === 'male') value = t('common.male', 'Nam');
      else if (value === 'female') value = t('common.female', 'Nữ');
      else if (value === 'other') value = t('common.other', 'Khác');
    } else if (filterName === 'idCardStatus') {
      filterLabel = t('common.idCardStatus', 'Trạng thái CCCD');
      if (value === 'verified') value = t('common.verified', 'Đã xác thực');
      else if (value === 'unverified') value = t('common.unverified', 'Chưa xác thực');
    } else if (filterName === 'district') {
      filterLabel = t('common.district', 'Quận/Huyện');
    }
    
    if (value !== 'all') {
      setSnackbar({
        open: true,
        message: `Đang lọc ${filterLabel}: "${value}"`,
        severity: 'info'
      });
    } else {
      setSnackbar({
        open: true,
        message: `Đã bỏ lọc ${filterLabel}`,
        severity: 'info'
      });
    }
    
    // Gọi API để lấy dữ liệu mới với bộ lọc mới
    setTimeout(() => {
      console.log('Fetching with updated filters...');
      fetchCitizens();
    }, 100);
  };
  
  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Handle edit citizen
  const handleEditCitizen = (citizenId) => {
    navigate(`/officer/citizens/${citizenId}/edit`);
  };
  
  // Handle delete citizen
  const handleDeleteClick = (citizen) => {
    setSelectedCitizen(citizen);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      // Hiển thị một thông báo xác nhận trước khi xóa
      setSnackbar({
        open: true,
        message: `Đang tiến hành xóa công dân ${selectedCitizen.first_name} ${selectedCitizen.last_name}...`,
        severity: 'info'
      });
      
      // Call the API to delete the citizen
      await officerService.deleteCitizen(selectedCitizen.id);
      
      // Remove the deleted citizen from the local state
      setCitizens(citizens.filter(c => c.id !== selectedCitizen.id));
      
      // Cập nhật thống kê sau khi xóa thành công
      setStatsData(prev => ({
        ...prev,
        total: prev.total - 1,
        active: selectedCitizen.is_active ? prev.active - 1 : prev.active,
        inactive: !selectedCitizen.is_active ? prev.inactive - 1 : prev.inactive
      }));
      
      setSnackbar({
        open: true,
        message: `Đã xóa công dân ${selectedCitizen.first_name} ${selectedCitizen.last_name} thành công`,
        severity: 'success'
      });
    } catch (err) {
      console.error('Error deleting citizen:', err);
      setSnackbar({
        open: true,
        message: 'Không thể xóa công dân. Lỗi: ' + (err.message || 'Vui lòng thử lại sau.'),
        severity: 'error'
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedCitizen(null);
      setLoading(false);
    }
  };

  // Handle menu open
  const handleMenuOpen = (event, citizen) => {
    setAnchorEl(event.currentTarget);
    setMenuCitizen(citizen);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuCitizen(null);
  };
  
  // Sort function for citizens data
  const sortCitizens = (array) => {
    if (!array || !Array.isArray(array)) return [];
    
    return [...array].sort((a, b) => {
      let aValue, bValue;
      
      // Handle nested properties like profile.phone_number
      if (orderBy.includes('.')) {
        const parts = orderBy.split('.');
        aValue = parts.reduce((obj, key) => (obj && obj[key] !== undefined ? obj[key] : ''), a);
        bValue = parts.reduce((obj, key) => (obj && obj[key] !== undefined ? obj[key] : ''), b);
      } else {
        aValue = a[orderBy] !== undefined ? a[orderBy] : '';
        bValue = b[orderBy] !== undefined ? b[orderBy] : '';
      }
      
      // Handle string comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        if (order === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      }
      
      // Handle number comparison
      if (order === 'asc') {
        return (aValue < bValue ? -1 : 1);
      } else {
        return (bValue < aValue ? -1 : 1);
      }
    });
  };
  
  // Ensure citizens is an array, apply filtering, sorting, and get the current page data
  const filteredCitizens = filterCitizens(citizens);
  const sortedCitizens = sortCitizens(filteredCitizens);
  const currentPageCitizens = Array.isArray(sortedCitizens) 
    ? sortedCitizens.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : [];
  
  // Handle sorting
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  
  // Handle close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t('officer.citizenList.title', 'Quản lý công dân')}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Cards thống kê */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  {t('common.totalCitizens', 'Tổng số công dân')}
                </Typography>
                <Typography variant="h4">
                  {statsData.total}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                <PeopleIcon />
              </Avatar>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  {t('common.activeCitizens', 'Đang hoạt động')}
                </Typography>
                <Typography variant="h4" color="success.main">
                  {statsData.active}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                <PersonIcon />
              </Avatar>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  {t('common.inactiveCitizens', 'Không hoạt động')}
                </Typography>
                <Typography variant="h4" color="text.secondary">
                  {statsData.inactive}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'text.disabled', width: 56, height: 56 }}>
                <PersonIcon />
              </Avatar>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  {t('common.recentCitizens', 'Mới đăng ký (30 ngày)')}
                </Typography>
                <Typography variant="h4" color="info.main">
                  {statsData.recent}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'info.main', width: 56, height: 56 }}>
                <AccessTimeIcon />
              </Avatar>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Search Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label={t('common.search', 'Tìm kiếm')}
              value={searchTerm}
              onChange={handleSearchTermChange}
              onKeyPress={handleSearch}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleSearch} edge="end">
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              placeholder={t('officer.citizenList.searchPlaceholder', 'Tìm theo CCCD, tên, email, SĐT...')}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="district-filter-label">{t('common.district', 'Quận/Huyện')}</InputLabel>
              <Select
                labelId="district-filter-label"
                id="district-filter"
                value={advancedFilters.district}
                label={t('common.district', 'Quận/Huyện')}
                onChange={(e) => handleFilterChange('district', e.target.value)}
                MenuProps={{ 
                  style: { zIndex: 9999 },
                  anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'left',
                  },
                  transformOrigin: {
                    vertical: 'top',
                    horizontal: 'left',
                  },
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                    }
                  }
                }}
              >
                <MenuItem value="all">{t('common.all', 'Tất cả')}</MenuItem>
                {districts.map((district) => (
                  <MenuItem key={district} value={district}>{district}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="gender-filter-label">{t('common.gender', 'Giới tính')}</InputLabel>
              <Select
                labelId="gender-filter-label"
                id="gender-filter"
                value={advancedFilters.gender}
                label={t('common.gender', 'Giới tính')}
                onChange={(e) => handleFilterChange('gender', e.target.value)}
                MenuProps={{ 
                  style: { zIndex: 9999 },
                  anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'left',
                  },
                  transformOrigin: {
                    vertical: 'top',
                    horizontal: 'left',
                  },
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                    }
                  }
                }}
              >
                <MenuItem value="all">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} fontSize="small" />
                    {t('common.all', 'Tất cả')}
                  </Box>
                </MenuItem>
                <MenuItem value="male">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon sx={{ mr: 1, color: 'primary.main' }} fontSize="small" />
                    {t('common.male', 'Nam')}
                  </Box>
                </MenuItem>
                <MenuItem value="female">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon sx={{ mr: 1, color: 'secondary.main' }} fontSize="small" />
                    {t('common.female', 'Nữ')}
                  </Box>
                </MenuItem>
                <MenuItem value="other">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon sx={{ mr: 1, color: 'info.main' }} fontSize="small" />
                    {t('common.other', 'Khác')}
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="id-card-status-filter-label">{t('common.idCardStatus', 'Trạng thái CCCD')}</InputLabel>
              <Select
                labelId="id-card-status-filter-label"
                id="id-card-status-filter"
                value={advancedFilters.idCardStatus}
                label={t('common.idCardStatus', 'Trạng thái CCCD')}
                onChange={(e) => handleFilterChange('idCardStatus', e.target.value)}
                MenuProps={{ 
                  style: { zIndex: 9999 },
                  anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'left',
                  },
                  transformOrigin: {
                    vertical: 'top',
                    horizontal: 'left',
                  },
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                    }
                  }
                }}
              >
                <MenuItem value="all">{t('common.all', 'Tất cả')}</MenuItem>
                <MenuItem value="verified">{t('common.verified', 'Đã xác thực')}</MenuItem>
                <MenuItem value="unverified">{t('common.unverified', 'Chưa xác thực')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={12} md={12} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              sx={{ mr: 1 }}
            >
              {t('common.refresh', 'Làm mới')}
            </Button>
            <Button
              variant="outlined" 
              color="primary"
              startIcon={<DownloadIcon />}
              sx={{ mr: 1 }}
              onClick={handleExportCitizens}
              disabled={loading}
            >
              {loading ? 'Đang xuất...' : t('common.export', 'Xuất danh sách')}
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={currentTab} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PeopleIcon sx={{ mr: 1 }} />
                <span>{t('common.all', 'Tất cả')}</span>
                <Chip 
                  label={statsData.total} 
                  size="small" 
                  sx={{ ml: 1, height: 20 }} 
                />
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonIcon sx={{ mr: 1, color: 'success.main' }} />
                <span>{t('common.active', 'Đang hoạt động')}</span>
                <Chip 
                  label={statsData.active} 
                  size="small" 
                  color="success" 
                  sx={{ ml: 1, height: 20 }} 
                />
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonIcon sx={{ mr: 1, color: 'text.disabled' }} />
                <span>{t('common.inactive', 'Không hoạt động')}</span>
                <Chip 
                  label={statsData.inactive} 
                  size="small" 
                  sx={{ ml: 1, height: 20 }} 
                />
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccessTimeIcon sx={{ mr: 1, color: 'info.main' }} />
                <span>{t('common.recent', 'Mới đăng ký')}</span>
                <Chip 
                  label={statsData.recent} 
                  size="small" 
                  color="info" 
                  sx={{ ml: 1, height: 20 }} 
                />
              </Box>
            } 
          />
        </Tabs>
      </Paper>
      
      {/* Citizens Table */}
      <Paper>
        {isFiltering && <LinearProgress />}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'last_name'}
                    direction={orderBy === 'last_name' ? order : 'asc'}
                    onClick={() => handleRequestSort('last_name')}
                  >
                    {t('common.name', 'Họ tên')}
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'profile.gender'}
                    direction={orderBy === 'profile.gender' ? order : 'asc'}
                    onClick={() => handleRequestSort('profile.gender')}
                  >
                    {t('common.gender', 'Giới tính')}
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'profile.id_card_number'}
                    direction={orderBy === 'profile.id_card_number' ? order : 'asc'}
                    onClick={() => handleRequestSort('profile.id_card_number')}
                  >
                    {t('common.idCard', 'CCCD/CMND')}
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'email'}
                    direction={orderBy === 'email' ? order : 'asc'}
                    onClick={() => handleRequestSort('email')}
                  >
                    {t('common.contactInfo', 'Thông tin liên hệ')}
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'created_at'}
                    direction={orderBy === 'created_at' ? order : 'asc'}
                    onClick={() => handleRequestSort('created_at')}
                  >
                    {t('common.registrationInfo', 'Thông tin đăng ký')}
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">{t('common.actions', 'Thao tác')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress size={40} sx={{ my: 3 }} />
                  </TableCell>
                </TableRow>
              ) : currentPageCitizens.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body1" sx={{ py: 3 }}>
                      {t('officer.citizenList.noCitizens', 'Không có công dân nào')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                currentPageCitizens.map((citizen) => (
                  <TableRow key={citizen.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          src={citizen.profile?.avatar || citizen.profile?.profile_picture} 
                          sx={{ width: 40, height: 40, mr: 1 }}
                        >
                          {`${citizen.first_name?.charAt(0) || ''}${citizen.last_name?.charAt(0) || ''}`}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {`${citizen.first_name || ''} ${citizen.last_name || ''}`}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {citizen.profile?.date_of_birth ? `${formatDate(citizen.profile?.date_of_birth)}` : ''}
                          </Typography>
                          {citizen.is_active !== undefined && (
                            <Chip 
                              size="small" 
                              label={citizen.is_active ? t('common.active', 'Hoạt động') : t('common.inactive', 'Không hoạt động')} 
                              color={citizen.is_active ? 'success' : 'default'}
                              sx={{ mt: 0.5, height: 20 }}
                            />
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {citizen.profile?.gender ? (
                        <Chip
                          size="small"
                          label={t(`common.${citizen.profile?.gender}`, citizen.profile?.gender)}
                          color={citizen.profile?.gender === 'male' ? 'primary' : 
                                 citizen.profile?.gender === 'female' ? 'secondary' : 'default'}
                          icon={<PersonIcon />}
                        />
                      ) : t('common.notProvided', 'Chưa cung cấp')}
                    </TableCell>
                    <TableCell>
                      {citizen.profile?.id_card_number ? (
                        <Box>
                          <Typography variant="body2">
                            <CreditCardIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle', color: 'primary.main' }} />
                            {citizen.profile.id_card_number}
                          </Typography>
                          {citizen.profile?.id_card_issue_date && (
                            <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                              <CalendarTodayIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                              {formatDate(citizen.profile.id_card_issue_date)}
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          {t('common.notProvided', 'Chưa cung cấp')}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box>
                        {citizen.email && (
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                            <EmailIcon fontSize="small" sx={{ mr: 0.5, color: 'info.main' }} />
                            {citizen.email}
                          </Typography>
                        )}
                        {citizen.profile?.phone_number && (
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            <PhoneIcon fontSize="small" sx={{ mr: 0.5, color: 'success.main' }} />
                            {citizen.profile.phone_number}
                          </Typography>
                        )}
                        <Typography 
                          variant="body2" 
                          color="textSecondary" 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'flex-start', 
                            mt: 0.5, 
                            maxWidth: 220,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <LocationIcon fontSize="small" sx={{ mr: 0.5, mt: 0.25 }} />
                          {formatAddress(citizen.profile)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                          <EventIcon fontSize="small" sx={{ mr: 0.5, color: 'primary.main' }} />
                          {formatDate(citizen.date_joined || citizen.created_at)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                          {citizen.is_verified ? (
                            <Chip 
                              size="small" 
                              label={t('common.verified', 'Đã xác thực')} 
                              color="success"
                              icon={<VerifiedIcon />}
                              sx={{ height: 20 }}
                            />
                          ) : (
                            <Chip 
                              size="small" 
                              label={t('common.unverified', 'Chưa xác thực')} 
                              variant="outlined"
                              sx={{ height: 20 }}
                            />
                          )}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title={t('common.edit', 'Chỉnh sửa')}>
                        <IconButton 
                          color="secondary"
                          onClick={() => handleEditCitizen(citizen.id)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('common.more', 'Thêm')}>
                        <IconButton
                          onClick={(e) => handleMenuOpen(e, citizen)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCitizens}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage={t('common.rowsPerPage', 'Số hàng mỗi trang')}
        />
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="delete-dialog-title" sx={{ bgcolor: 'error.main', color: 'white' }}>
          {t('officer.citizenList.deleteConfirmation', 'Xác nhận xóa công dân')}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            {t('officer.citizenList.deleteWarning', 'Bạn có chắc chắn muốn xóa công dân này không? Hành động này không thể hoàn tác.')}
          </Alert>
          
          {selectedCitizen && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid #ddd' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar 
                    src={selectedCitizen.profile?.avatar} 
                    sx={{ width: 60, height: 60, mr: 2 }}
                  >
                    {`${selectedCitizen.first_name?.charAt(0) || ''}${selectedCitizen.last_name?.charAt(0) || ''}`}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      <strong>{`${selectedCitizen.first_name || ''} ${selectedCitizen.last_name || ''}`}</strong>
                    </Typography>
                    <Typography variant="body1">{selectedCitizen.email || ''}</Typography>
                    {selectedCitizen.profile?.phone_number && (
                      <Typography variant="body2">
                        <PhoneIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                        {selectedCitizen.profile.phone_number}
                      </Typography>
                    )}
                  </Box>
                </Grid>
                
                {selectedCitizen.profile?.id_card_number && (
                  <Grid item xs={12}>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      <CreditCardIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                      <strong>CCCD/CMND:</strong> {selectedCitizen.profile.id_card_number}
                    </Typography>
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <Typography variant="body2" color="error.main" sx={{ mt: 1, fontWeight: 'bold' }}>
                    Lưu ý: Việc xóa công dân sẽ xóa tất cả dữ liệu liên quan đến công dân này, bao gồm hồ sơ, yêu cầu và giấy tờ.
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
          >
            {t('common.cancel', 'Hủy')}
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={loading}
            startIcon={<DeleteIcon />}
          >
            {loading ? 'Đang xóa...' : t('common.delete', 'Xóa')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => menuCitizen && handleEditCitizen(menuCitizen.id)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t('common.edit', 'Chỉnh sửa')} />
        </MenuItem>
        <MenuItem onClick={() => {
          handleMenuClose();
          menuCitizen && handleDeleteClick(menuCitizen);
        }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary={t('common.delete', 'Xóa')} sx={{ color: 'error.main' }} />
        </MenuItem>
      </Menu>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CitizenList; 