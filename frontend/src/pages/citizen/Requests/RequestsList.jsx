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
  TablePagination,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  Skeleton,
  useMediaQuery,
  useTheme,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Cancel as CancelIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import citizenService from '../../../services/api/citizenService';

const RequestsList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [currentTab, setCurrentTab] = useState('all');
  const [sortBy, setSortBy] = useState('requestDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [uniqueTypes, setUniqueTypes] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0
  });

  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    fetchRequests();
  }, [currentTab, sortBy, sortDirection, typeFilter]);

  // Debounced search effect
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchRequests();
    }, 500); // 500ms debounce
    
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const fetchRequests = async (refresh = false) => {
    try {
      if (!refresh) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);
      console.log('Fetching requests from API...');
      
      // Add support for sorting parameters
      const ordering = sortDirection === 'desc' ? `-${sortBy}` : sortBy;
      const status = currentTab !== 'all' ? currentTab : '';
      const search = searchTerm;
      
      const response = await citizenService.getRequests(1, 100, search, status, ordering, typeFilter);
      console.log('API response:', response);
      
      // Check if response has data in different formats
      let requestList = [];
      
      if (response.data && response.data.results) {
        // Standard paginated response
        console.log('Standard response format detected');
        requestList = response.data.results;
      } else if (Array.isArray(response.data)) {
        // Direct array response
        console.log('Array response format detected');
        requestList = response.data;
      } else if (response.results) {
        // Response without data wrapper
        console.log('Results directly in response detected');
        requestList = response.results;
      } else if (Array.isArray(response)) {
        // Direct array on response object
        console.log('Direct array response detected');
        requestList = response;
      } else {
        console.error('Unexpected response format:', response);
        setError('Định dạng dữ liệu không hợp lệ. Vui lòng liên hệ quản trị viên.');
        setRequests([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }
      
      console.log('Extracted request list:', requestList);
      setRequests(requestList);
      
      // Extract unique document types for filter dropdown
      const types = [...new Set(requestList.map(req => req.type).filter(Boolean))];
      setUniqueTypes(types);
      
      // Calculate stats
      const newStats = {
        total: requestList.length,
        pending: requestList.filter(req => req.status === 'pending').length,
        processing: requestList.filter(req => req.status === 'processing').length,
        completed: requestList.filter(req => req.status === 'completed').length,
        approved: requestList.filter(req => req.status === 'approved').length,
        rejected: requestList.filter(req => req.status === 'rejected').length,
        cancelled: requestList.filter(req => req.status === 'cancelled').length
      };
      console.log('Request stats:', newStats);
      setStats(newStats);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError('Không thể tải danh sách yêu cầu. Vui lòng thử lại sau.');
      
      // Check for common API errors
      if (err.response) {
        console.log('Response error status:', err.response.status);
        console.log('Response error data:', err.response.data);
        
        if (err.response.status === 401) {
          setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } else if (err.response.status === 403) {
          setError('Bạn không có quyền truy cập vào tài nguyên này.');
        } else if (err.response.status === 404) {
          setError('API endpoint không tồn tại. Vui lòng kiểm tra cấu hình.');
        } else if (err.response.status >= 500) {
          setError('Lỗi máy chủ. Vui lòng thử lại sau hoặc liên hệ quản trị viên.');
        }
      } else if (err.request) {
        console.log('Request error:', err.request);
        setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCancelRequest = async (requestId) => {
    try {
      await citizenService.cancelRequest(requestId);
      setCancelDialogOpen(false);
      setSelectedRequestId(null);
      fetchRequests();
    } catch (err) {
      setError('Không thể hủy yêu cầu. Vui lòng thử lại sau.');
      console.error('Error cancelling request:', err);
    }
  };

  const handleViewRequest = (requestId) => {
    navigate(`/citizen/requests/${requestId}`);
  };

  const handleNewRequest = () => {
    navigate('/citizen/requests/new');
  };

  const handleRefresh = () => {
    fetchRequests(true);
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    setStatusFilter(newValue);
    setPage(0);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'completed':
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Chờ xử lý';
      case 'processing':
        return 'Đang xử lý';
      case 'completed':
        return 'Đã hoàn thành';
      case 'approved':
        return 'Đã duyệt';
      case 'rejected':
        return 'Từ chối';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = searchTerm ? 
      (request.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       request.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       request.id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
       request.description?.toLowerCase().includes(searchTerm.toLowerCase())) : true;
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesType = typeFilter === 'all' || request.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });
  
  // Sort the filtered requests
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    let valueA, valueB;
    
    switch (sortBy) {
      case 'id':
        valueA = a.id;
        valueB = b.id;
        break;
      case 'title':
        valueA = a.title || '';
        valueB = b.title || '';
        break;
      case 'type':
        valueA = a.type || '';
        valueB = b.type || '';
        break;
      case 'status':
        valueA = a.status || '';
        valueB = b.status || '';
        break;
      case 'requestDate':
        valueA = new Date(a.created_at || 0).getTime();
        valueB = new Date(b.created_at || 0).getTime();
        break;
      case 'updatedAt':
        valueA = new Date(a.updated_at || 0).getTime();
        valueB = new Date(b.updated_at || 0).getTime();
        break;
      default:
        valueA = new Date(a.created_at || 0).getTime();
        valueB = new Date(b.created_at || 0).getTime();
    }
    
    if (valueA < valueB) {
      return sortDirection === 'asc' ? -1 : 1;
    }
    if (valueA > valueB) {
      return sortDirection === 'asc' ? 1 : -1;
    }
    return 0;
  });
  
  const paginatedRequests = sortedRequests.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const renderStatsCards = () => (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid item xs={6} sm={4} md={2}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h4" color="primary" fontWeight="bold">
              {loading ? <Skeleton width={30} /> : stats.total}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tổng số
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={6} sm={4} md={2}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h4" color="warning.main" fontWeight="bold">
              {loading ? <Skeleton width={30} /> : stats.pending}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Chờ xử lý
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={6} sm={4} md={2}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h4" color="info.main" fontWeight="bold">
              {loading ? <Skeleton width={30} /> : stats.processing}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Đang xử lý
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={6} sm={4} md={2}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h4" color="success.main" fontWeight="bold">
              {loading ? <Skeleton width={30} /> : stats.completed}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Đã hoàn thành
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={6} sm={4} md={2}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h4" color="error.main" fontWeight="bold">
              {loading ? <Skeleton width={30} /> : stats.rejected}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Từ chối
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={6} sm={4} md={2}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h4" color="text.secondary" fontWeight="bold">
              {loading ? <Skeleton width={30} /> : stats.cancelled}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Đã hủy
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderFilters = () => (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            placeholder="Tìm kiếm yêu cầu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={statusFilter}
              label="Trạng thái"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">Tất cả</MenuItem>
              <MenuItem value="pending">Chờ xử lý</MenuItem>
              <MenuItem value="processing">Đang xử lý</MenuItem>
              <MenuItem value="completed">Đã hoàn thành</MenuItem>
              <MenuItem value="approved">Đã duyệt</MenuItem>
              <MenuItem value="rejected">Từ chối</MenuItem>
              <MenuItem value="cancelled">Đã hủy</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Loại yêu cầu</InputLabel>
            <Select
              value={typeFilter}
              label="Loại yêu cầu"
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <MenuItem value="all">Tất cả loại</MenuItem>
              {uniqueTypes.map(type => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleNewRequest}
            fullWidth
          >
            Tạo mới
          </Button>
        </Grid>
      </Grid>
    </Box>
  );

  const renderMobileCards = () => (
    <Grid container spacing={2}>
      {paginatedRequests.map((request) => (
        <Grid item xs={12} key={request.id}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h6" sx={{ flex: 1, mr: 2 }}>
                  {request.title || `Yêu cầu #${request.id}`}
                </Typography>
                <Chip
                  label={getStatusText(request.status)}
                  color={getStatusColor(request.status)}
                  size="small"
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Loại: {request.type || 'N/A'}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Ngày tạo: {formatDate(request.created_at)}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Cập nhật: {formatDate(request.updated_at)}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<VisibilityIcon />}
                  onClick={() => handleViewRequest(request.id)}
                >
                  Xem
                </Button>
                {request.status === 'pending' && (
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={() => {
                      setSelectedRequestId(request.id);
                      setCancelDialogOpen(true);
                    }}
                  >
                    Hủy
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderDesktopTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Tiêu đề</TableCell>
            <TableCell>Loại</TableCell>
            <TableCell>Trạng thái</TableCell>
            <TableCell>Ngày tạo</TableCell>
            <TableCell>Cập nhật</TableCell>
            <TableCell align="center">Thao tác</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            Array.from(new Array(5)).map((_, index) => (
              <TableRow key={index}>
                {Array.from(new Array(7)).map((_, cellIndex) => (
                  <TableCell key={cellIndex}>
                    <Skeleton />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : paginatedRequests.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center">
                <Typography variant="body2" color="text.secondary">
                  Không có yêu cầu nào
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            paginatedRequests.map((request) => (
              <TableRow key={request.id} hover>
                <TableCell>#{request.id}</TableCell>
                <TableCell>{request.title || `Yêu cầu #${request.id}`}</TableCell>
                <TableCell>{request.type || 'N/A'}</TableCell>
                <TableCell>
                  <Chip
                    label={getStatusText(request.status)}
                    color={getStatusColor(request.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{formatDate(request.created_at)}</TableCell>
                <TableCell>{formatDate(request.updated_at)}</TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleViewRequest(request.id)}
                      title="Xem chi tiết"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    {request.status === 'pending' && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          setSelectedRequestId(request.id);
                          setCancelDialogOpen(true);
                        }}
                        title="Hủy yêu cầu"
                      >
                        <CancelIcon />
                      </IconButton>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Yêu cầu của tôi
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {renderStatsCards()}
      {renderFilters()}

      {isMobile ? renderMobileCards() : renderDesktopTable()}

      {filteredRequests.length > 0 && (
        <TablePagination
          component="div"
          count={filteredRequests.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Số dòng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} trong tổng số ${count}`
          }
        />
      )}

      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
      >
        <DialogTitle>Xác nhận hủy yêu cầu</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn hủy yêu cầu này? Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>
            Không
          </Button>
          <Button 
            onClick={() => handleCancelRequest(selectedRequestId)} 
            color="error"
            variant="contained"
          >
            Xác nhận hủy
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RequestsList;