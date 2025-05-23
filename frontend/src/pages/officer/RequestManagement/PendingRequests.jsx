import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box,
  Typography,
  TextField,
  Grid,
  Paper,
  Avatar,
  InputAdornment,
  IconButton,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Tabs,
  Tab,
  Badge,
  LinearProgress,
  Tooltip
} from '@mui/material';
import { 
  Assignment as AssignmentIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Visibility as ViewIcon,
  ArrowForward as ArrowForwardIcon,
  HourglassEmpty as ProcessingIcon,
  Block as RejectedIcon,
  Schedule as SubmittedIcon,
  CheckCircle as CompletedIcon,
  Pending as PendingIcon,
  Person as PersonIcon,
  Event as EventIcon,
  Sort as SortIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  Flag as FlagIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import officerService from '../../../services/api/officerService';

/**
 * PendingRequests Component - The main component for displaying pending requests for officers
 */
const PendingRequests = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // State variables
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: 'pending',
    type: 'all',
    search: '',
    priority: 'all'
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTab, setCurrentTab] = useState(0);
  const [stats, setStats] = useState({
    totalRequests: 0,
    pending: 0,
    submitted: 0,
    processing: 0,
    completed: 0,
    rejected: 0
  });
  const [isFiltering, setIsFiltering] = useState(false);
  
  // Request statuses mapping to tabs
  const statusTabs = [
    { value: 'all', label: 'Tất cả' },
    { value: 'pending', label: 'Chờ xử lý' },
    { value: 'submitted', label: 'Đã nộp' },
    { value: 'processing', label: 'Đang xử lý' },
    { value: 'completed', label: 'Hoàn thành' }
  ];
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    setFilters(prev => ({
      ...prev,
      status: statusTabs[newValue].value
    }));
    setPage(0);
  };
  
  // Fetch pending requests
  const fetchPendingRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setIsFiltering(true);
      
      console.log('Fetching requests with filters:', filters);
      const response = await officerService.getPendingRequests(filters);
      console.log('Requests response:', response);
      
      if (Array.isArray(response)) {
        setRequests(response);
        
        // Calculate statistics based on the response
        const total = response.length;
        const pending = response.filter(req => req.status === 'pending').length;
        const submitted = response.filter(req => req.status === 'submitted').length;
        const processing = response.filter(req => req.status === 'processing').length;
        const completed = response.filter(req => req.status === 'completed').length;
        const rejected = response.filter(req => req.status === 'rejected').length;
        
        setStats({
          totalRequests: total,
          pending,
          submitted,
          processing,
          completed,
          rejected
        });
      } else if (response && response.results && Array.isArray(response.results)) {
        setRequests(response.results);
        
        // If the API returns stats, use those
        if (response.stats) {
          setStats(response.stats);
        } else {
          // Calculate stats manually
          const requestData = response.results;
          const total = requestData.length;
          const pending = requestData.filter(req => req.status === 'pending').length;
          const submitted = requestData.filter(req => req.status === 'submitted').length;
          const processing = requestData.filter(req => req.status === 'processing').length;
          const completed = requestData.filter(req => req.status === 'completed').length;
          const rejected = requestData.filter(req => req.status === 'rejected').length;
          
          setStats({
            totalRequests: total,
            pending,
            submitted,
            processing,
            completed,
            rejected
          });
        }
      } else {
        // Handle unexpected response format
        setRequests([]);
        console.error('Unexpected response format:', response);
        setError('Định dạng phản hồi không hợp lệ.');
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError('Không thể tải danh sách yêu cầu. Vui lòng thử lại sau.');
      setRequests([]);
    } finally {
      setLoading(false);
      setIsFiltering(false);
    }
  }, [filters]);
  
  // Load requests on component mount and when filters change
  useEffect(() => {
    fetchPendingRequests();
  }, [fetchPendingRequests]);
  
  // Handle search
  const handleSearch = () => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm
    }));
    setPage(0);
  };
  
  // Handle filter changes
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(0);
  };
  
  // Handle reset filters
  const handleResetFilters = () => {
    setFilters({
      status: 'all',
      type: 'all',
      search: '',
      priority: 'all'
    });
    setSearchTerm('');
    setCurrentTab(0);
    setPage(0);
  };
  
  // Handle refresh
  const handleRefresh = () => {
    fetchPendingRequests();
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
  
  // Handle view request details
  const handleViewRequest = (requestId) => {
    navigate(`/officer/process-request/${requestId}`);
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (e) {
      console.error('Date format error:', e);
      return dateString;
    }
  };
  
  // Get priority chip
  const getPriorityChip = (priority) => {
    switch (priority) {
      case 'high':
        return <Chip 
          label={t('priority.high', 'Cao')} 
          color="error" 
          size="small"
          icon={<FlagIcon />} 
        />;
      case 'medium':
        return <Chip 
          label={t('priority.medium', 'Trung bình')} 
          color="warning" 
          size="small"
          icon={<FlagIcon />} 
        />;
      case 'low':
        return <Chip 
          label={t('priority.low', 'Thấp')} 
          color="success" 
          size="small"
          icon={<FlagIcon />} 
        />;
      default:
        return null;
    }
  };
  
  // Get status chip based on status string
  const getStatusChip = (status) => {
    switch (status) {
      case 'completed':
        return <Chip 
          label={t('status.completed', 'Hoàn thành')} 
          color="success" 
          size="small"
          icon={<CompletedIcon />} 
        />;
      case 'submitted':
        return <Chip 
          label={t('status.submitted', 'Đã nộp')} 
          color="warning" 
          size="small"
          icon={<SubmittedIcon />} 
        />;
      case 'pending':
        return <Chip 
          label={t('status.pending', 'Chờ xử lý')} 
          color="warning" 
          size="small"
          icon={<PendingIcon />} 
        />;
      case 'in_review':
      case 'processing':
        return <Chip 
          label={t('status.processing', 'Đang xử lý')} 
          color="info" 
          size="small"
          icon={<ProcessingIcon />} 
        />;
      case 'rejected':
        return <Chip 
          label={t('status.rejected', 'Từ chối')} 
          color="error" 
          size="small"
          icon={<RejectedIcon />} 
        />;
      default:
        return <Chip 
          label={status || t('status.unknown', 'Không xác định')} 
          size="small"
          variant="outlined"
        />;
    }
  };
  
  // Get request type translated
  const getRequestType = (type) => {
    const requestTypes = {
      birth_certificate: t('requestType.birth_certificate', 'Giấy khai sinh'),
      death_certificate: t('requestType.death_certificate', 'Giấy chứng tử'),
      marriage_certificate: t('requestType.marriage_certificate', 'Giấy đăng ký kết hôn'),
      residence_certificate: t('requestType.residence_certificate', 'Giấy xác nhận cư trú'),
      land_use_certificate: t('requestType.land_use_certificate', 'Giấy chứng nhận quyền sử dụng đất'),
      business_registration: t('requestType.business_registration', 'Đăng ký kinh doanh'),
      construction_permit: t('requestType.construction_permit', 'Giấy phép xây dựng')
    };
    
    return requestTypes[type] || type || t('requestType.unknown', 'Không xác định');
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom fontWeight="medium">
        {t('officer.pendingRequests.title', 'Quản lý yêu cầu')}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" color="textSecondary">
                  {t('common.total', 'Tổng số')}
                </Typography>
                <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                  <AssignmentIcon />
                </Avatar>
              </Box>
              <Typography variant="h4" sx={{ mt: 1, fontWeight: 'medium' }}>
                {stats.totalRequests}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" color="textSecondary">
                  {t('status.pending', 'Chờ xử lý')}
                </Typography>
                <Avatar sx={{ bgcolor: 'warning.main', width: 40, height: 40 }}>
                  <PendingIcon />
                </Avatar>
              </Box>
              <Typography variant="h4" sx={{ mt: 1, fontWeight: 'medium', color: 'warning.main' }}>
                {stats.pending}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" color="textSecondary">
                  {t('status.processing', 'Đang xử lý')}
                </Typography>
                <Avatar sx={{ bgcolor: 'info.main', width: 40, height: 40 }}>
                  <ProcessingIcon />
                </Avatar>
              </Box>
              <Typography variant="h4" sx={{ mt: 1, fontWeight: 'medium', color: 'info.main' }}>
                {stats.processing}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4} md={3}>
            <TextField
              fullWidth
              label={t('common.search', 'Tìm kiếm')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleSearch} edge="end">
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={4} md={3}>
            <FormControl fullWidth>
              <InputLabel id="type-filter-label">
                {t('common.type', 'Loại yêu cầu')}
              </InputLabel>
              <Select
                labelId="type-filter-label"
                id="type-filter"
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                label={t('common.type', 'Loại yêu cầu')}
              >
                <MenuItem value="all">{t('common.all', 'Tất cả')}</MenuItem>
                <MenuItem value="birth_certificate">{t('requestType.birth_certificate', 'Giấy khai sinh')}</MenuItem>
                <MenuItem value="death_certificate">{t('requestType.death_certificate', 'Giấy chứng tử')}</MenuItem>
                <MenuItem value="marriage_certificate">{t('requestType.marriage_certificate', 'Giấy đăng ký kết hôn')}</MenuItem>
                <MenuItem value="residence_certificate">{t('requestType.residence_certificate', 'Giấy xác nhận cư trú')}</MenuItem>
                <MenuItem value="land_use_certificate">{t('requestType.land_use_certificate', 'Giấy chứng nhận quyền sử dụng đất')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={4} md={3}>
            <FormControl fullWidth>
              <InputLabel id="priority-filter-label">
                {t('common.priority', 'Độ ưu tiên')}
              </InputLabel>
              <Select
                labelId="priority-filter-label"
                id="priority-filter"
                name="priority"
                value={filters.priority}
                onChange={handleFilterChange}
                label={t('common.priority', 'Độ ưu tiên')}
              >
                <MenuItem value="all">{t('common.all', 'Tất cả')}</MenuItem>
                <MenuItem value="high">{t('priority.high', 'Cao')}</MenuItem>
                <MenuItem value="medium">{t('priority.medium', 'Trung bình')}</MenuItem>
                <MenuItem value="low">{t('priority.low', 'Thấp')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={12} md={3} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              sx={{ mr: 1 }}
            >
              {t('common.refresh', 'Làm mới')}
            </Button>
            
            <Button
              variant="contained"
              startIcon={<FilterIcon />}
              onClick={handleResetFilters}
            >
              {t('common.resetFilters', 'Đặt lại')}
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Status Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          {statusTabs.map((tab, index) => (
            <Tab 
              key={tab.value}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <span>{t(`status.${tab.value}`, tab.label)}</span>
                  {index === 0 && (
                    <Badge 
                      badgeContent={stats.totalRequests} 
                      color="primary" 
                      sx={{ ml: 1 }}
                    />
                  )}
                  {index === 1 && (
                    <Badge 
                      badgeContent={stats.pending} 
                      color="primary" 
                      sx={{ ml: 1 }}
                    />
                  )}
                  {index === 2 && (
                    <Badge 
                      badgeContent={stats.submitted} 
                      color="primary" 
                      sx={{ ml: 1 }}
                    />
                  )}
                  {index === 3 && (
                    <Badge 
                      badgeContent={stats.processing} 
                      color="primary" 
                      sx={{ ml: 1 }}
                    />
                  )}
                  {index === 4 && (
                    <Badge 
                      badgeContent={stats.completed} 
                      color="primary" 
                      sx={{ ml: 1 }}
                    />
                  )}
                </Box>
              }
            />
          ))}
        </Tabs>
      </Paper>
      
      {/* Requests Table */}
      <Paper>
        {isFiltering && <LinearProgress />}
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('common.id', 'Mã')}</TableCell>
                <TableCell>{t('common.type', 'Loại yêu cầu')}</TableCell>
                <TableCell>{t('common.title', 'Tiêu đề')}</TableCell>
                <TableCell>{t('common.requestor', 'Người yêu cầu')}</TableCell>
                <TableCell>{t('common.submittedDate', 'Ngày nộp')}</TableCell>
                <TableCell>{t('common.status', 'Trạng thái')}</TableCell>
                <TableCell align="right">{t('common.actions', 'Thao tác')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress size={40} sx={{ my: 3 }} />
                  </TableCell>
                </TableRow>
              ) : requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Box sx={{ py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <AssignmentIcon color="disabled" sx={{ fontSize: 60, mb: 2, opacity: 0.3 }} />
                      <Typography variant="h6" color="textSecondary">
                        {t('officer.pendingRequests.noRequests', 'Không có yêu cầu nào')}
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={handleResetFilters}
                        sx={{ mt: 2 }}
                      >
                        {t('common.resetFilters', 'Đặt lại bộ lọc')}
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                requests
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((request) => (
                    <TableRow 
                      key={request.id} 
                      hover
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' },
                        ...(request.priority === 'high' && {
                          borderLeft: '4px solid',
                          borderColor: 'error.main'
                        })
                      }}
                      onClick={() => handleViewRequest(request.id)}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AssignmentIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                          {request.id.substring(0, 8)}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {getRequestType(request.request_type)}
                        </Typography>
                        {request.priority && (
                          <Box sx={{ mt: 0.5 }}>
                            {getPriorityChip(request.priority)}
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {request.title}
                        </Typography>
                        {request.description && (
                          <Typography variant="caption" color="textSecondary" sx={{ 
                            display: 'block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: 200
                          }}>
                            {request.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ width: 30, height: 30, mr: 1 }}>
                            <PersonIcon fontSize="small" />
                          </Avatar>
                          {request.citizen_name || request.citizen_id || t('common.unknown', 'Không xác định')}
                        </Box>
                      </TableCell>
                      <TableCell>{formatDate(request.created_at)}</TableCell>
                      <TableCell>{getStatusChip(request.status)}</TableCell>
                      <TableCell align="right">
                        <Tooltip title={t('common.view', 'Xem chi tiết')}>
                          <IconButton 
                            color="primary"
                            sx={{ width: 28, height: 28, mr: 1 }}
                            onClick={() => handleViewRequest(request.id)}
                          >
                            <ArrowForwardIcon />
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
          component="div"
          count={requests.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage={t('common.rowsPerPage', 'Số hàng mỗi trang')}
        />
      </Paper>
    </Box>
  );
};

export default PendingRequests; 