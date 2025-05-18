import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, Chip, CircularProgress, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  TablePagination, Alert, TextField, InputAdornment, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, FilterList as FilterIcon, 
  Add as AddIcon, Visibility as ViewIcon,
  CheckCircle as CheckIcon, Pending as PendingIcon, 
  HourglassEmpty as ProcessingIcon, ErrorOutline as ErrorIcon,
  Refresh as RefreshIcon } from '@mui/icons-material';

import citizenService from '../../../services/api/citizenService';

const RequestList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalRequests, setTotalRequests] = useState(0);
  const navigate = useNavigate();

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await citizenService.getRequests({
        page: page + 1, // API uses 1-based pagination
        limit: rowsPerPage,
        search: searchTerm
      });
      
      setRequests(response.results || []);
      setTotalRequests(response.count || 0);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError('Không thể tải danh sách yêu cầu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [page, rowsPerPage]);

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

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Danh sách yêu cầu
      </Typography>
      
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
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.length > 0 ? (
                  requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>{request.id}</TableCell>
                      <TableCell>{request.type}</TableCell>
                      <TableCell>{formatDate(request.requestDate)}</TableCell>
                      <TableCell>{getStatusChip(request.status)}</TableCell>
                      <TableCell align="right">
                        <IconButton 
                          color="primary" 
                          size="small"
                          onClick={() => navigate(`/citizen/requests/${request.id}`)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Box sx={{ py: 3 }}>
                        <Typography variant="body1" color="text.secondary">
                          Không có yêu cầu nào
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