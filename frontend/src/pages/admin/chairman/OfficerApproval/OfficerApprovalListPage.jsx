import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { 
  CheckCircle as ApproveIcon, 
  Cancel as RejectIcon, 
  Visibility as ViewIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

// Giả lập dữ liệu
const mockOfficerRequests = [
  {
    id: 'REQ001',
    name: 'Nguyễn Văn A',
    position: 'Cán bộ tư pháp',
    requestDate: '2023-05-01T08:30:00Z',
    status: 'pending',
    email: 'nguyenvana@mail.com',
    phone: '0912345678'
  },
  {
    id: 'REQ002',
    name: 'Trần Thị B',
    position: 'Cán bộ địa chính',
    requestDate: '2023-05-02T10:15:00Z',
    status: 'pending',
    email: 'tranthib@mail.com',
    phone: '0923456789'
  },
  {
    id: 'REQ003',
    name: 'Lê Văn C',
    position: 'Cán bộ văn hóa xã hội',
    requestDate: '2023-05-03T09:45:00Z',
    status: 'pending',
    email: 'levanc@mail.com',
    phone: '0934567890'
  },
  {
    id: 'REQ004',
    name: 'Phạm Thị D',
    position: 'Cán bộ tài chính kế toán',
    requestDate: '2023-05-04T14:20:00Z',
    status: 'pending',
    email: 'phamthid@mail.com',
    phone: '0945678901'
  },
  {
    id: 'REQ005',
    name: 'Hoàng Văn E',
    position: 'Cán bộ quản lý đất đai',
    requestDate: '2023-05-05T11:10:00Z',
    status: 'pending',
    email: 'hoangvane@mail.com',
    phone: '0956789012'
  }
];

const OfficerApprovalListPage = () => {
  const [loading, setLoading] = useState(true);
  const [officerRequests, setOfficerRequests] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Giả lập việc tải dữ liệu
  useEffect(() => {
    const loadData = async () => {
      try {
        // Giả lập delay mạng
        await new Promise(resolve => setTimeout(resolve, 1000));
        setOfficerRequests(mockOfficerRequests);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        setSnackbar({
          open: true,
          message: 'Không thể tải danh sách yêu cầu. Vui lòng thử lại sau.',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Xử lý phê duyệt cán bộ
  const handleApprove = (id) => {
    setOfficerRequests(prev => 
      prev.map(request => 
        request.id === id ? { ...request, status: 'approved' } : request
      )
    );
    setSnackbar({
      open: true,
      message: 'Đã phê duyệt cán bộ thành công!',
      severity: 'success'
    });
  };

  // Xử lý từ chối cán bộ
  const handleReject = (id) => {
    setOfficerRequests(prev => 
      prev.map(request => 
        request.id === id ? { ...request, status: 'rejected' } : request
      )
    );
    setSnackbar({
      open: true,
      message: 'Đã từ chối yêu cầu!',
      severity: 'warning'
    });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Container maxWidth="lg">
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Phê duyệt Cán bộ Xã
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Quản lý và phê duyệt các yêu cầu đăng ký làm cán bộ xã
        </Typography>
      </Box>

      <Paper sx={{ mb: 4, p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Danh sách chờ phê duyệt</Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<RefreshIcon />}
            onClick={() => {
              setLoading(true);
              // Giả lập tải lại dữ liệu
              setTimeout(() => {
                setOfficerRequests(mockOfficerRequests);
                setLoading(false);
              }, 1000);
            }}
          >
            Làm mới
          </Button>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        ) : officerRequests.length === 0 ? (
          <Alert severity="info">Không có yêu cầu phê duyệt nào</Alert>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Mã yêu cầu</TableCell>
                    <TableCell>Họ tên</TableCell>
                    <TableCell>Vị trí</TableCell>
                    <TableCell>Ngày yêu cầu</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell align="center">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {officerRequests
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>{request.id}</TableCell>
                        <TableCell>{request.name}</TableCell>
                        <TableCell>{request.position}</TableCell>
                        <TableCell>{formatDate(request.requestDate)}</TableCell>
                        <TableCell>
                          {request.status === 'pending' && (
                            <Chip label="Chờ phê duyệt" color="warning" size="small" />
                          )}
                          {request.status === 'approved' && (
                            <Chip label="Đã phê duyệt" color="success" size="small" />
                          )}
                          {request.status === 'rejected' && (
                            <Chip label="Đã từ chối" color="error" size="small" />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            component={RouterLink}
                            to={`/chairman/officer-approval/${request.id}`}
                            color="primary"
                            size="small"
                            title="Xem chi tiết"
                          >
                            <ViewIcon />
                          </IconButton>
                          {request.status === 'pending' && (
                            <>
                              <IconButton
                                color="success"
                                size="small"
                                onClick={() => handleApprove(request.id)}
                                title="Phê duyệt"
                              >
                                <ApproveIcon />
                              </IconButton>
                              <IconButton
                                color="error"
                                size="small"
                                onClick={() => handleReject(request.id)}
                                title="Từ chối"
                              >
                                <RejectIcon />
                              </IconButton>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={officerRequests.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
              labelRowsPerPage="Số hàng mỗi trang:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
            />
          </>
        )}
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default OfficerApprovalListPage; 