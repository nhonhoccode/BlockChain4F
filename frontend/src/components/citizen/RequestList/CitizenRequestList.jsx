import React, { useState, useEffect } from 'react';
import { 
  Container, Paper, Typography, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, TablePagination, 
  Chip, IconButton, Box, TextField, MenuItem, 
  CircularProgress, Button, Grid, Tooltip,
  Alert
} from '@mui/material';
import { 
  Visibility, FilterList, Search, 
  CheckCircle, HourglassEmpty, Cancel,
  Refresh
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import citizenService from '../../../services/api/citizenService';

// Status chip component
const StatusChip = ({ status }) => {
  const getStatusProps = (status) => {
    switch(status) {
      case 'completed':
        return { label: 'Hoàn thành', color: 'success', icon: <CheckCircle fontSize="small" /> };
      case 'processing':
        return { label: 'Đang xử lý', color: 'info', icon: <HourglassEmpty fontSize="small" /> };
      case 'pending':
        return { label: 'Chờ duyệt', color: 'warning', icon: <HourglassEmpty fontSize="small" /> };
      case 'rejected':
        return { label: 'Từ chối', color: 'error', icon: <Cancel fontSize="small" /> };
      default:
        return { label: status, color: 'default', icon: null };
    }
  };
  
  const { label, color, icon } = getStatusProps(status);
  
  return (
    <Chip 
      label={label} 
      color={color} 
      size="small" 
      icon={icon}
    />
  );
};

const CitizenRequestList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });
  const [sort, setSort] = useState({
    field: 'created_at',
    direction: 'desc'
  });
  const [error, setError] = useState(null);
  
  // Fetch requests with current pagination, filters, and sort
  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await citizenService.getRequests(
        page + 1, // API uses 1-based pagination
        { 
          ...filters,
          page_size: rowsPerPage
        }, 
        sort
      );
      
      setRequests(response.results || []);
      setTotalCount(response.count || 0);
    } catch (error) {
      console.error('Lỗi khi tải danh sách yêu cầu:', error);
      setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch requests on mount and when dependencies change
  useEffect(() => {
    fetchRequests();
  }, [page, rowsPerPage, filters, sort]);
  
  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Handle filter changes
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(0); // Reset to first page when filters change
  };
  
  // Handle search input
  const handleSearchChange = (event) => {
    const { value } = event.target;
    setFilters(prev => ({
      ...prev,
      search: value
    }));
    setPage(0); // Reset to first page when search changes
  };
  
  // Handle view request details
  const handleViewRequest = (requestId) => {
    navigate(`/citizen/requests/${requestId}`);
  };
  
  // Handle creating a new request
  const handleCreateRequest = () => {
    navigate('/citizen/requests/new');
  };
  
  // Handle retry loading data
  const handleRetry = () => {
    fetchRequests();
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Danh sách yêu cầu
      </Typography>
      
      {/* Filters and search */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              name="status"
              label="Trạng thái"
              value={filters.status}
              onChange={handleFilterChange}
              size="small"
              InputProps={{
                startAdornment: <FilterList color="action" sx={{ mr: 1 }} />
              }}
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="pending">Chờ duyệt</MenuItem>
              <MenuItem value="processing">Đang xử lý</MenuItem>
              <MenuItem value="completed">Hoàn thành</MenuItem>
              <MenuItem value="rejected">Từ chối</MenuItem>
            </TextField>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              name="search"
              label="Tìm kiếm"
              value={filters.search}
              onChange={handleSearchChange}
              placeholder="Tìm theo mã yêu cầu, loại yêu cầu..."
              size="small"
              InputProps={{
                startAdornment: <Search color="action" sx={{ mr: 1 }} />
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={3} sx={{ textAlign: 'right' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreateRequest}
            >
              Tạo yêu cầu mới
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Error display */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            <Button 
              color="inherit" 
              size="small"
              startIcon={<Refresh />}
              onClick={handleRetry}
            >
              Thử lại
            </Button>
          }
        >
          {error}
        </Alert>
      )}
      
      {/* Requests table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Mã yêu cầu</TableCell>
                <TableCell>Loại yêu cầu</TableCell>
                <TableCell>Ngày tạo</TableCell>
                <TableCell>Cán bộ xử lý</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress size={30} />
                  </TableCell>
                </TableRow>
              ) : requests.length > 0 ? (
                requests.map((request) => (
                  <TableRow key={request.request_id}>
                    <TableCell>{request.request_id}</TableCell>
                    <TableCell>{request.request_type}</TableCell>
                    <TableCell>{formatDate(request.created_at)}</TableCell>
                    <TableCell>
                      {request.assigned_to ? 
                        `${request.assigned_to.first_name} ${request.assigned_to.last_name}` : 
                        'Chưa phân công'
                      }
                    </TableCell>
                    <TableCell>
                      <StatusChip status={request.status} />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Xem chi tiết">
                        <IconButton 
                          color="primary"
                          onClick={() => handleViewRequest(request.request_id)}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography>Không có yêu cầu nào</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số hàng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} của ${count !== -1 ? count : `hơn ${to}`}`
          }
        />
      </Paper>
    </Container>
  );
};

export default CitizenRequestList; 