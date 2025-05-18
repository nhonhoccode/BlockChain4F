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
  TableSortLabel,
  Button,
  IconButton,
  TextField,
  Chip,
  Badge,
  CircularProgress,
  Tooltip,
  Snackbar,
  Alert,
  Divider,
  Avatar
} from '@mui/material';
import {
  Person as PersonIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import PrimaryButton from '../../../../components/common/Buttons/PrimaryButton';
import SecondaryButton from '../../../../components/common/Buttons/SecondaryButton';
import officerService from '../../../../services/api/officerService';
import BlockchainBadge from '../../../../components/common/BlockchainBadge';
import styles from './OfficerApproval.module.scss';

const ApprovedOfficersPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(1);
  const [approvedOfficers, setApprovedOfficers] = useState([]);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderBy, setOrderBy] = useState('approved_at');
  const [order, setOrder] = useState('desc');
  
  // Lấy danh sách cán bộ đã phê duyệt
  const fetchApprovedOfficers = async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        search: searchQuery,
        order_by: orderBy,
        order: order
      };
      
      const response = await officerService.getApprovedOfficers(params);
      setApprovedOfficers(response.results || []);
      setTotalCount(response.count || 0);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách cán bộ đã phê duyệt:', error);
      showNotification('Lỗi khi lấy danh sách cán bộ đã phê duyệt', 'error');
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
  
  // Xử lý xem chi tiết cán bộ
  const handleViewOfficer = (officerId) => {
    navigate(`/admin/chairman/officer-approval/${officerId}`);
  };
  
  // Xử lý gán nhiệm vụ cho cán bộ
  const handleAssignTasks = (officerId) => {
    navigate(`/admin/chairman/officer-management/assign-tasks/${officerId}`);
  };
  
  // Xử lý tìm kiếm
  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setPage(0);
      fetchApprovedOfficers();
    }
  };
  
  // Xử lý làm mới danh sách
  const handleRefresh = () => {
    setSearchQuery('');
    setPage(0);
    fetchApprovedOfficers();
  };
  
  // Xử lý sắp xếp
  const handleSort = (field) => {
    const isAsc = orderBy === field && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(field);
    setPage(0);
    // Fetch data with new sort parameters
    setTimeout(() => {
      fetchApprovedOfficers();
    }, 100);
  };
  
  // Render icon sắp xếp
  const renderSortIcon = (field) => {
    if (orderBy !== field) {
      return <FilterIcon fontSize="small" sx={{ opacity: 0.5 }} />;
    }
    return order === 'asc' ? (
      <ArrowUpIcon fontSize="small" sx={{ ml: 0.5 }} />
    ) : (
      <ArrowDownIcon fontSize="small" sx={{ ml: 0.5 }} />
    );
  };
  
  // Load danh sách cán bộ đã phê duyệt khi component mount hoặc tham số thay đổi
  useEffect(() => {
    fetchApprovedOfficers();
  }, [page, rowsPerPage]);

  return (
    <Box className={styles.approvalPage}>
      <Box className={styles.header}>
        <Typography variant="h5" component="h1">
          Quản lý cán bộ xã
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
          <Tab label="Chờ phê duyệt" />
          <Tab label="Đã phê duyệt" />
        </Tabs>
      </Paper>
      
      <Paper className={styles.filterContainer}>
        <Typography variant="subtitle1" className={styles.filterTitle}>
          Tìm kiếm cán bộ xã
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
              <TableCell 
                className={styles.tableHeader}
                onClick={() => handleSort('last_name')}
                sx={{ cursor: 'pointer' }}
              >
                <TableSortLabel
                  active={orderBy === 'last_name'}
                  direction={orderBy === 'last_name' ? order : 'asc'}
                >
                  Họ tên
                  {renderSortIcon('last_name')}
                </TableSortLabel>
              </TableCell>
              <TableCell className={styles.tableHeader}>Email</TableCell>
              <TableCell className={styles.tableHeader}>Số điện thoại</TableCell>
              <TableCell 
                className={styles.tableHeader}
                onClick={() => handleSort('position')}
                sx={{ cursor: 'pointer' }}
              >
                <TableSortLabel
                  active={orderBy === 'position'}
                  direction={orderBy === 'position' ? order : 'asc'}
                >
                  Chức vụ
                  {renderSortIcon('position')}
                </TableSortLabel>
              </TableCell>
              <TableCell 
                className={styles.tableHeader}
                onClick={() => handleSort('approved_at')}
                sx={{ cursor: 'pointer' }}
              >
                <TableSortLabel
                  active={orderBy === 'approved_at'}
                  direction={orderBy === 'approved_at' ? order : 'asc'}
                >
                  Ngày phê duyệt
                  {renderSortIcon('approved_at')}
                </TableSortLabel>
              </TableCell>
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
            ) : approvedOfficers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <Box className={styles.noResults}>
                    <PersonIcon className={styles.noResultsIcon} />
                    <Typography variant="h6">
                      Không có cán bộ xã nào
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Chưa có cán bộ xã nào được phê duyệt trong hệ thống.
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              approvedOfficers.map((officer) => (
                <TableRow key={officer.id}>
                  <TableCell>{officer.id}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        src={officer.avatar || undefined}
                        alt={`${officer.user_details?.last_name} ${officer.user_details?.first_name}`}
                        sx={{ width: 32, height: 32, mr: 1 }}
                      >
                        {officer.user_details?.first_name?.charAt(0) || 'U'}
                      </Avatar>
                      {officer.user_details?.last_name} {officer.user_details?.first_name}
                    </Box>
                  </TableCell>
                  <TableCell>{officer.user_details?.email}</TableCell>
                  <TableCell>{officer.phone_number || 'Chưa cập nhật'}</TableCell>
                  <TableCell>{officer.position || 'Cán bộ xã'}</TableCell>
                  <TableCell>{new Date(officer.approved_at).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell>
                    <BlockchainBadge verified={true} />
                  </TableCell>
                  <TableCell align="right">
                    <Box className={styles.actionButtons}>
                      <Tooltip title="Xem chi tiết">
                        <IconButton
                          color="info"
                          onClick={() => handleViewOfficer(officer.id)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Gán nhiệm vụ">
                        <IconButton
                          color="primary"
                          onClick={() => handleAssignTasks(officer.id)}
                        >
                          <AssignmentIcon />
                        </IconButton>
                      </Tooltip>
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

export default ApprovedOfficersPage;
