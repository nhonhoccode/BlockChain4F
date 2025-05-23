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
  Divider,
  TableSortLabel,
  Chip,
  FormControl,
  InputLabel,
  Select,
  LinearProgress,
  Avatar,
  Tabs,
  Tab,
  Badge,
  Card,
  CardContent
} from '@mui/material';
import { 
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
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
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
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
      
      // Thêm các bộ lọc nâng cao
      if (advancedFilters.gender !== 'all') {
        filters.gender = advancedFilters.gender;
      }
      
      if (advancedFilters.ageGroup !== 'all') {
        filters.age_group = advancedFilters.ageGroup;
      }
      
      if (advancedFilters.idCardStatus !== 'all') {
        filters.id_card_status = advancedFilters.idCardStatus;
      }
      
      if (advancedFilters.district !== 'all') {
        filters.district = advancedFilters.district;
      }
      
      console.log('Fetching citizens with filters:', filters);
      const response = await officerService.getCitizens(filters);
      console.log('Citizens response:', response);
      
      // Ensure citizens is always an array
      let citizensData = [];
      if (Array.isArray(response)) {
        citizensData = response;
      } else if (response && typeof response === 'object') {
        // If response is an object with a results property (common API pattern)
        if (Array.isArray(response.results)) {
          citizensData = response.results;
        } else if (response.data && Array.isArray(response.data)) {
          citizensData = response.data;
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
  }, [searchTerm, advancedFilters]);
  
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
  const formatAddress = (profile) => {
    if (!profile) return t('common.notProvided', 'Chưa cung cấp');
    
    const address = profile.address || '';
    const ward = profile.ward || '';
    const district = profile.district || '';
    const province = profile.province || profile.city || '';
    
    const parts = [address, ward, district, province].filter(part => part.trim() !== '');
    if (parts.length === 0) return t('common.notProvided', 'Chưa cung cấp');
    
    return parts.join(', ');
  };
  
  // Filter citizens based on status and other criteria
  const filterCitizens = (array) => {
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
  };
  
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
  
  // Handle filter change
  const handleFilterChange = (filterName, value) => {
    setAdvancedFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setPage(0); // Reset to first page when filtering
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
  
  // Handle view citizen details
  const handleViewCitizen = (citizen) => {
    setSelectedCitizen(citizen);
    setDetailsDialogOpen(true);
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
      // Call the API to delete the citizen
      await officerService.deleteCitizen(selectedCitizen.id);
      
      // Remove the deleted citizen from the local state
      setCitizens(citizens.filter(c => c.id !== selectedCitizen.id));
      
      setSnackbar({
        open: true,
        message: `Đã xóa công dân ${selectedCitizen.first_name} ${selectedCitizen.last_name}`,
        severity: 'success'
      });
    } catch (err) {
      console.error('Error deleting citizen:', err);
      setSnackbar({
        open: true,
        message: 'Không thể xóa công dân. Vui lòng thử lại sau.',
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

  // Handle view profile
  const handleViewProfile = (citizenId) => {
    handleMenuClose();
    navigate(`/citizen/profile?id=${citizenId}`);
  };

  // Handle view documents
  const handleViewDocuments = (citizenId) => {
    handleMenuClose();
    navigate(`/officer/citizens/${citizenId}/documents`);
  };

  // Handle close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
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
              >
                <MenuItem value="all">{t('common.all', 'Tất cả')}</MenuItem>
                <MenuItem value="male">{t('common.male', 'Nam')}</MenuItem>
                <MenuItem value="female">{t('common.female', 'Nữ')}</MenuItem>
                <MenuItem value="other">{t('common.other', 'Khác')}</MenuItem>
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
              >
                <MenuItem value="all">{t('common.all', 'Tất cả')}</MenuItem>
                <MenuItem value="verified">{t('common.verified', 'Đã xác thực')}</MenuItem>
                <MenuItem value="unverified">{t('common.unverified', 'Chưa xác thực')}</MenuItem>
                <MenuItem value="missing">{t('common.missing', 'Chưa cung cấp')}</MenuItem>
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
            >
              {t('common.export', 'Xuất danh sách')}
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PersonIcon />}
              onClick={() => navigate('/officer/citizens/add')}
            >
              {t('officer.citizenList.addCitizen', 'Thêm công dân')}
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
                            {citizen.profile?.gender ? t(`common.${citizen.profile?.gender}`, citizen.profile?.gender) : ''}
                            {citizen.profile?.date_of_birth ? ` • ${formatDate(citizen.profile?.date_of_birth)}` : ''}
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
                      <Tooltip title={t('common.view', 'Xem chi tiết')}>
                        <IconButton 
                          color="primary"
                          onClick={() => handleViewCitizen(citizen)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
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
      >
        <DialogTitle id="delete-dialog-title">
          {t('officer.citizenList.deleteConfirmation', 'Xác nhận xóa công dân')}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {t('officer.citizenList.deleteWarning', 'Bạn có chắc chắn muốn xóa công dân này không? Hành động này không thể hoàn tác.')}
          </Typography>
          {selectedCitizen && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="subtitle1">
                <strong>{`${selectedCitizen.first_name || ''} ${selectedCitizen.last_name || ''}`}</strong>
              </Typography>
              <Typography variant="body2">{selectedCitizen.email || ''}</Typography>
              {selectedCitizen.profile?.id_card_number && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <CreditCardIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                  {selectedCitizen.profile.id_card_number}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            {t('common.cancel', 'Hủy')}
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={loading}
          >
            {t('common.delete', 'Xóa')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Citizen Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        aria-labelledby="details-dialog-title"
        maxWidth="md"
        fullWidth
      >
        <DialogTitle id="details-dialog-title">
          {t('officer.citizenList.citizenDetails', 'Thông tin chi tiết công dân')}
        </DialogTitle>
        <DialogContent dividers>
          {selectedCitizen && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }} variant="outlined">
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon sx={{ mr: 1 }} /> {t('common.personalInfo', 'Thông tin cá nhân')}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1">
                      <strong>{t('common.fullName', 'Họ và tên')}</strong>
                    </Typography>
                    <Typography variant="body1">
                      {`${selectedCitizen.first_name || ''} ${selectedCitizen.last_name || ''}`}
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1">
                      <strong>{t('common.email', 'Email')}</strong>
                    </Typography>
                    <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                      <EmailIcon fontSize="small" sx={{ mr: 1 }} />
                      {selectedCitizen.email || t('common.notProvided', 'Chưa cung cấp')}
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1">
                      <strong>{t('common.phone', 'Số điện thoại')}</strong>
                    </Typography>
                    <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                      <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
                      {selectedCitizen.profile?.phone_number || t('common.notProvided', 'Chưa cung cấp')}
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1">
                      <strong>{t('common.gender', 'Giới tính')}</strong>
                    </Typography>
                    <Typography variant="body1">
                      {selectedCitizen.profile?.gender ? t(`common.${selectedCitizen.profile?.gender}`, selectedCitizen.profile?.gender) : t('common.notProvided', 'Chưa cung cấp')}
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1">
                      <strong>{t('common.dateOfBirth', 'Ngày sinh')}</strong>
                    </Typography>
                    <Typography variant="body1">
                      {selectedCitizen.profile?.date_of_birth ? formatDate(selectedCitizen.profile?.date_of_birth) : t('common.notProvided', 'Chưa cung cấp')}
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1">
                      <strong>{t('common.status', 'Trạng thái')}</strong>
                    </Typography>
                    <Chip 
                      label={selectedCitizen.is_active ? t('common.active', 'Hoạt động') : t('common.inactive', 'Không hoạt động')} 
                      color={selectedCitizen.is_active ? 'success' : 'default'}
                      size="small"
                    />
                    {selectedCitizen.is_verified && (
                      <Chip 
                        label={t('common.verified', 'Đã xác thực')} 
                        color="primary"
                        icon={<VerifiedIcon fontSize="small" />}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }} variant="outlined">
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationIcon sx={{ mr: 1 }} /> {t('common.address', 'Địa chỉ')}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1">
                      <strong>{t('common.fullAddress', 'Địa chỉ đầy đủ')}</strong>
                    </Typography>
                    <Typography variant="body1">
                      {formatAddress(selectedCitizen.profile)}
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1">
                      <strong>{t('common.ward', 'Phường/Xã')}</strong>
                    </Typography>
                    <Typography variant="body1">
                      {selectedCitizen.profile?.ward || t('common.notProvided', 'Chưa cung cấp')}
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1">
                      <strong>{t('common.district', 'Quận/Huyện')}</strong>
                    </Typography>
                    <Typography variant="body1">
                      {selectedCitizen.profile?.district || t('common.notProvided', 'Chưa cung cấp')}
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1">
                      <strong>{t('common.province', 'Tỉnh/Thành phố')}</strong>
                    </Typography>
                    <Typography variant="body1">
                      {selectedCitizen.profile?.province || selectedCitizen.profile?.city || t('common.notProvided', 'Chưa cung cấp')}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }} variant="outlined">
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <AssignmentIcon sx={{ mr: 1 }} /> {t('common.identityInfo', 'Thông tin giấy tờ')}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1">
                      <strong>{t('common.idCardNumber', 'Số CMND/CCCD')}</strong>
                    </Typography>
                    <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                      <CreditCardIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                      {selectedCitizen.profile?.id_card_number || t('common.notProvided', 'Chưa cung cấp')}
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1">
                      <strong>{t('common.idCardIssueDate', 'Ngày cấp')}</strong>
                    </Typography>
                    <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarTodayIcon fontSize="small" sx={{ mr: 1 }} />
                      {selectedCitizen.profile?.id_card_issue_date ? formatDate(selectedCitizen.profile?.id_card_issue_date) : t('common.notProvided', 'Chưa cung cấp')}
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1">
                      <strong>{t('common.idCardIssuePlace', 'Nơi cấp')}</strong>
                    </Typography>
                    <Typography variant="body1">
                      {selectedCitizen.profile?.id_card_issue_place || t('common.notProvided', 'Chưa cung cấp')}
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1">
                      <strong>{t('common.registrationDate', 'Ngày đăng ký')}</strong>
                    </Typography>
                    <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                      <EventIcon fontSize="small" sx={{ mr: 1, color: 'info.main' }} />
                      {formatDate(selectedCitizen.date_joined || selectedCitizen.created_at)}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDetailsDialogOpen(false)}
          >
            {t('common.close', 'Đóng')}
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => {
              setDetailsDialogOpen(false);
              selectedCitizen && handleViewProfile(selectedCitizen.id);
            }}
          >
            {t('officer.citizenList.viewFullProfile', 'Xem hồ sơ đầy đủ')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => menuCitizen && handleViewProfile(menuCitizen.id)}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t('officer.citizenList.viewProfile', 'Xem hồ sơ')} />
        </MenuItem>
        <MenuItem onClick={() => menuCitizen && handleViewDocuments(menuCitizen.id)}>
          <ListItemIcon>
            <AssignmentIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t('officer.citizenList.viewDocuments', 'Xem giấy tờ')} />
        </MenuItem>
        <Divider />
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