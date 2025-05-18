import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Badge,
  CircularProgress,
  Snackbar,
  Alert,
  Divider
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import PrimaryButton from '../../../../components/common/Buttons/PrimaryButton';
import SecondaryButton from '../../../../components/common/Buttons/SecondaryButton';
import officerService from '../../../../services/api/officerService';
import BlockchainBadge from '../../../../components/common/BlockchainBadge';
import styles from './OfficerApproval.module.scss';

const PendingOfficerApprovalPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Lấy danh sách yêu cầu phê duyệt
  const fetchPendingApprovals = async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        search: searchQuery
      };
      
      const response = await officerService.getPendingOfficerApprovals(params);
      setPendingApprovals(response.results || []);
      setTotalCount(response.count || 0);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách yêu cầu phê duyệt:', error);
      showNotification('Lỗi khi lấy danh sách yêu cầu phê duyệt', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Hiển thị thông báo
  const showNotification = (message, severity = 'info') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };
  
  // Xử lý đóng thông báo
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };
  
  // Xử lý chuyển tab
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    
    if (newValue === 0) {
      navigate('/admin/chairman/officer-approval');
    } else if (newValue === 1) {
      navigate('/admin/chairman/officer-approval/approved');
    }
  };
  
  // Xử lý thay đổi trang
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // Xử lý thay đổi số hàng mỗi trang
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Xử lý xem chi tiết yêu cầu
  const handleViewApproval = (approvalId) => {
    navigate(`/admin/chairman/officer-approval/${approvalId}`);
  };
  
  // Mở dialog từ chối yêu cầu
  const handleOpenRejectDialog = (approval) => {
    setSelectedApproval(approval);
    setRejectReason('');
    setOpenRejectDialog(true);
  };
  
  // Đóng dialog từ chối yêu cầu
  const handleCloseRejectDialog = () => {
    setOpenRejectDialog(false);
    setSelectedApproval(null);
  };
  
  // Xử lý từ chối yêu cầu
  const handleRejectApproval = async () => {
    if (!selectedApproval || !rejectReason.trim()) {
      showNotification('Vui lòng nhập lý do từ chối yêu cầu', 'warning');
      return;
    }
    
    try {
      await officerService.rejectOfficer(selectedApproval.id, { reason: rejectReason });
      showNotification('Từ chối yêu cầu thành công', 'success');
      handleCloseRejectDialog();
      fetchPendingApprovals();
    } catch (error) {
      console.error('Lỗi khi từ chối yêu cầu:', error);
      showNotification('Lỗi khi từ chối yêu cầu', 'error');
    }
  };
  
  // Xử lý phê duyệt yêu cầu
  const handleApproveApproval = async (approvalId) => {
    try {
      await officerService.approveOfficer(approvalId, { comment: 'Đã phê duyệt bởi chủ tịch xã' });
      showNotification('Phê duyệt yêu cầu thành công', 'success');
      fetchPendingApprovals();
    } catch (error) {
      console.error('Lỗi khi phê duyệt yêu cầu:', error);
      showNotification('Lỗi khi phê duyệt yêu cầu', 'error');
    }
  };
  
  // Xử lý tìm kiếm
  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setPage(0);
      fetchPendingApprovals();
    }
  };
  
  // Xử lý làm mới danh sách
  const handleRefresh = () => {
    setSearchQuery('');
    setPage(0);
    fetchPendingApprovals();
  };
  
  // Load danh sách yêu cầu phê duyệt khi component mount
  useEffect(() => {
    fetchPendingApprovals();
  }, [page, rowsPerPage]);

  return (
    <Box className={styles.approvalPage}>
      <Box className={styles.header}>
        <Typography variant="h5" component="h1">
          Quản lý phê duyệt cán bộ xã
        </Typography>
        
        <Box>
          <IconButton onClick={handleRefresh} title="Làm mới">
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>
      
      <Paper className={styles.tabsContainer}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                Chờ phê duyệt
                {pendingApprovals.length > 0 && (
                  <Badge
                    color="warning"
                    badgeContent={pendingApprovals.length}
                    className={styles.pendingBadge}
                  />
                )}
              </Box>
            }
          />
          <Tab label="Đã phê duyệt" />
        </Tabs>
      </Paper>
      
      <Paper className={styles.filterContainer}>
        <Typography variant="subtitle1" className={styles.filterTitle}>
          Tìm kiếm yêu cầu
        </Typography>
        
        <Box className={styles.filterRow}>
          <TextField
            placeholder="Tìm theo tên, email hoặc số điện thoại..."
            variant="outlined"
            size="small"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleSearch}
            InputProps={{
              startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'action.active' }} />
            }}
          />
        </Box>
      </Paper>
      
      <TableContainer component={Paper} className={styles.tableContainer}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell className={styles.tableHeader}>ID</TableCell>
              <TableCell className={styles.tableHeader}>Họ tên</TableCell>
              <TableCell className={styles.tableHeader}>Email</TableCell>
              <TableCell className={styles.tableHeader}>Số điện thoại</TableCell>
              <TableCell className={styles.tableHeader}>Ngày đăng ký</TableCell>
              <TableCell className={styles.tableHeader}>Trạng thái</TableCell>
              <TableCell className={styles.tableHeader}>Blockchain</TableCell>
              <TableCell className={styles.tableHeader} align="right">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={30} />
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    Đang tải dữ liệu...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : pendingApprovals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <Box className={styles.noResults}>
                    <PersonIcon className={styles.noResultsIcon} />
                    <Typography variant="h6">
                      Không có yêu cầu phê duyệt nào
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Hiện tại không có yêu cầu đăng ký cán bộ xã nào đang chờ phê duyệt.
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              pendingApprovals.map((approval) => (
                <TableRow key={approval.id}>
                  <TableCell>{approval.id}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonIcon sx={{ mr: 1, color: 'action.active' }} />
                      {approval.user_details?.last_name} {approval.user_details?.first_name}
                    </Box>
                  </TableCell>
                  <TableCell>{approval.user_details?.email}</TableCell>
                  <TableCell>{approval.phone_number || 'Chưa cập nhật'}</TableCell>
                  <TableCell>{new Date(approval.created_at).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell>
                    <Chip 
                      label="Chờ phê duyệt" 
                      className={`${styles.statusBadge} ${styles.pending}`}
                    />
                  </TableCell>
                  <TableCell>
                    <BlockchainBadge verified={false} pending={true} />
                  </TableCell>
                  <TableCell align="right">
                    <Box className={styles.actionButtons}>
                      <IconButton
                        color="info"
                        onClick={() => handleViewApproval(approval.id)}
                        title="Xem chi tiết"
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton
                        color="success"
                        onClick={() => handleApproveApproval(approval.id)}
                        title="Phê duyệt"
                      >
                        <ApproveIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleOpenRejectDialog(approval)}
                        title="Từ chối"
                      >
                        <RejectIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
        labelRowsPerPage="Số hàng mỗi trang:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
      />
      
      {/* Dialog từ chối yêu cầu */}
      <Dialog
        open={openRejectDialog}
        onClose={handleCloseRejectDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Từ chối yêu cầu đăng ký cán bộ xã
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Vui lòng cung cấp lý do từ chối yêu cầu đăng ký cán bộ xã của
            {' '}
            <strong>
              {selectedApproval?.user_details?.last_name} {selectedApproval?.user_details?.first_name}
            </strong>
          </Typography>
          
          <TextField
            autoFocus
            margin="dense"
            label="Lý do từ chối"
            fullWidth
            multiline
            rows={4}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Nhập lý do từ chối yêu cầu đăng ký..."
            required
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <SecondaryButton onClick={handleCloseRejectDialog}>
            Hủy bỏ
          </SecondaryButton>
          <PrimaryButton 
            color="error" 
            onClick={handleRejectApproval}
            disabled={!rejectReason.trim()}
          >
            Từ chối yêu cầu
          </PrimaryButton>
        </DialogActions>
      </Dialog>
      
      {/* Hiển thị thông báo */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PendingOfficerApprovalPage; 