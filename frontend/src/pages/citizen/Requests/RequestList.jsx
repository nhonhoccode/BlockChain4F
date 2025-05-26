import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Button, Chip, CircularProgress, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  TablePagination, Alert, TextField, InputAdornment, IconButton,
  Grid, Card, CardContent, Stack, Badge, Tabs, Tab, Menu, MenuItem
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  Search as SearchIcon,
  Add as AddIcon, Visibility as ViewIcon,
  CheckCircle as CheckIcon, Pending as PendingIcon, 
  HourglassEmpty as ProcessingIcon, ErrorOutline as ErrorIcon,
  Refresh as RefreshIcon, Sort as SortIcon, 
  ArrowUpward as ArrowUpwardIcon, ArrowDownward as ArrowDownwardIcon, 
  CalendarMonth as CalendarIcon, Description as DescriptionIcon
} from '@mui/icons-material';

import citizenService from '../../../services/api/citizenService';

const RequestList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalRequests, setTotalRequests] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [tabValue, setTabValue] = useState(0);
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [sortField, setSortField] = useState('requestDate');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Thống kê trạng thái
  const [stats, setStats] = useState({
    all: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    rejected: 0
  });
  
  const navigate = useNavigate();

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // API call with proper parameters
      const response = await citizenService.getRequests({
        page: page + 1, // API uses 1-based pagination
        limit: rowsPerPage,
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        sort: sortField,
        order: sortOrder
      });
      
      if (response) {
        setRequests(response.results || []);
        setTotalRequests(response.count || 0);
        
        // Update stats if available in response
        if (response.stats) {
          setStats(response.stats);
        }
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError('Không thể tải danh sách yêu cầu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [page, rowsPerPage, statusFilter, sortField, sortOrder]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = () => {
    setPage(0);
    fetchRequests();
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };
  
  const handleStatusFilterChange = (event, newValue) => {
    setTabValue(newValue);
    
    const statusMap = {
      0: 'all',
      1: 'pending',
      2: 'processing',
      3: 'completed',
      4: 'rejected'
    };
    
    setStatusFilter(statusMap[newValue]);
    setPage(0);
  };
  
  const handleSortClick = (event) => {
    setSortAnchorEl(event.currentTarget);
  };
  
  const handleSortClose = () => {
    setSortAnchorEl(null);
  };
  
  const handleSortSelect = (field) => {
    if (sortField === field) {
      // Toggle order if same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to desc
      setSortField(field);
      setSortOrder('desc');
    }
    
    handleSortClose();
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'completed':
        return <Chip label="Hoàn thành" color="success" size="small" icon={<CheckIcon />} />;
      case 'pending':
        return <Chip label="Chờ xử lý" color="warning" size="small" icon={<PendingIcon />} />;
      case 'processing':
        return <Chip label="Đang xử lý" color="info" size="small" icon={<ProcessingIcon />} />;
      case 'rejected':
        return <Chip label="Từ chối" color="error" size="small" icon={<ErrorIcon />} />;
      default:
        return <Chip label={status || 'Không xác định'} color="default" size="small" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(date);
    } catch (e) {
      console.error('Date format error:', e);
      return dateString;
    }
  };
  
  const getStatusCount = (status) => {
    return stats[status] || 0;
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Quản lý yêu cầu hành chính
      </Typography>
      
      {/* Các thẻ trạng thái */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card variant="outlined">
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle2" color="text.secondary">
                  Tất cả
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {getStatusCount('all')}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card variant="outlined" sx={{ borderColor: 'warning.light' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle2" color="warning.main">
                  Chờ xử lý
                </Typography>
                <Badge color="warning" badgeContent={getStatusCount('pending')} showZero>
                  <PendingIcon color="warning" />
                </Badge>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card variant="outlined" sx={{ borderColor: 'info.light' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle2" color="info.main">
                  Đang xử lý
                </Typography>
                <Badge color="info" badgeContent={getStatusCount('processing')} showZero>
                  <ProcessingIcon color="info" />
                </Badge>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card variant="outlined" sx={{ borderColor: 'success.light' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle2" color="success.main">
                  Hoàn thành
                </Typography>
                <Badge color="success" badgeContent={getStatusCount('completed')} showZero>
                  <CheckIcon color="success" />
                </Badge>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card variant="outlined" sx={{ borderColor: 'error.light' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle2" color="error.main">
                  Từ chối
                </Typography>
                <Badge color="error" badgeContent={getStatusCount('rejected')} showZero>
                  <ErrorIcon color="error" />
                </Badge>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              placeholder="Tìm kiếm yêu cầu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              size="small"
              sx={{ mr: 1, width: 250 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <Button 
              variant="contained" 
              size="small" 
              onClick={handleSearch}
            >
              Tìm kiếm
            </Button>
            
            <Button
              size="small"
              sx={{ ml: 1 }}
              startIcon={<SortIcon />}
              onClick={handleSortClick}
              endIcon={sortOrder === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />}
            >
              {sortField === 'requestDate' ? 'Theo ngày' : 'Theo loại'}
            </Button>
            <Menu
              anchorEl={sortAnchorEl}
              open={Boolean(sortAnchorEl)}
              onClose={handleSortClose}
            >
              <MenuItem
                onClick={() => handleSortSelect('requestDate')}
                selected={sortField === 'requestDate'}
              >
                <CalendarIcon fontSize="small" sx={{ mr: 1 }} />
                Theo ngày yêu cầu
              </MenuItem>
              <MenuItem
                onClick={() => handleSortSelect('type')}
                selected={sortField === 'type'}
              >
                <DescriptionIcon fontSize="small" sx={{ mr: 1 }} />
                Theo loại giấy tờ
              </MenuItem>
            </Menu>
          </Box>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/citizen/requests/new')}
          >
            Tạo yêu cầu mới
          </Button>
        </Box>
        
        <Tabs 
          value={tabValue} 
          onChange={handleStatusFilterChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label={`Tất cả (${getStatusCount('all')})`} />
          <Tab label={`Chờ xử lý (${getStatusCount('pending')})`} />
          <Tab label={`Đang xử lý (${getStatusCount('processing')})`} />
          <Tab label={`Hoàn thành (${getStatusCount('completed')})`} />
          <Tab label={`Từ chối (${getStatusCount('rejected')})`} />
        </Tabs>
      </Paper>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              startIcon={<RefreshIcon />} 
              onClick={fetchRequests}
            >
              Thử lại
            </Button>
          }
        >
          {error}
        </Alert>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Mã yêu cầu</TableCell>
                  <TableCell>Loại yêu cầu</TableCell>
                  <TableCell>Ngày yêu cầu</TableCell>
                  <TableCell>Mô tả</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Cập nhật mới nhất</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.length > 0 ? (
                  requests.map((request) => (
                    <TableRow 
                      key={request.id}
                      hover
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.04)'
                        }
                      }}
                      onClick={() => navigate(`/citizen/requests/${request.id}`)}
                    >
                      <TableCell><Typography variant="body2" fontWeight="medium">{request.id}</Typography></TableCell>
                      <TableCell>{request.type}</TableCell>
                      <TableCell>{formatDate(request.requestDate)}</TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            maxWidth: 200, 
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {request.description}
                        </Typography>
                      </TableCell>
                      <TableCell>{getStatusChip(request.status)}</TableCell>
                      <TableCell>{formatDate(request.updatedAt)}</TableCell>
                      <TableCell align="right">
                        <IconButton 
                          color="primary" 
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/citizen/requests/${request.id}`);
                          }}
                        >
                          <ViewIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Box sx={{ py: 3 }}>
                        <Typography variant="body1" color="text.secondary">
                          Không có yêu cầu nào
                          {statusFilter !== 'all' && ` với trạng thái "${statusFilter}"`}
                          {searchTerm && ` phù hợp với từ khóa "${searchTerm}"`}
                        </Typography>
                        <Button
                          variant="text"
                          startIcon={<AddIcon />}
                          onClick={() => navigate('/citizen/requests/new')}
                          sx={{ mt: 1 }}
                        >
                          Tạo yêu cầu mới
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            component="div"
            count={totalRequests}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Số hàng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
          />
        </>
      )}
    </Box>
  );
};

export default RequestList; 