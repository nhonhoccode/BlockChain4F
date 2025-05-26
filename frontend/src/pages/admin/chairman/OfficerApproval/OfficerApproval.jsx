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
  Button,
  Chip,
  TextField,
  InputAdornment,
  Divider,
  IconButton,
  Tooltip,
  Card,
  CardHeader,
  CardContent,
  Grid,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
  useTheme
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
  Visibility as ViewIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import chairmanService from '../../../../services/api/chairmanService';

/**
 * OfficerApproval Component - Shows list of pending officer approvals
 */
const OfficerApproval = () => {
  const theme = useTheme();
  
  // State for officer approvals list
  const [approvals, setApprovals] = useState([]);
  const [filteredApprovals, setFilteredApprovals] = useState([]);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for approval/rejection dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState('');
  const [dialogReason, setDialogReason] = useState('');
  
  // State for notifications
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');
  
  // Mock data for testing - remove in production
  const mockApprovals = [
    {
      id: 'app1',
      name: 'Nguyễn Văn A',
      position: 'Cán bộ địa chính',
      email: 'nguyenvana@example.com',
      phone: '0987654321',
      requestDate: '2023-05-15T09:00:00Z',
      status: 'pending',
      experience: '3 năm kinh nghiệm tại phường X',
      education: 'Cử nhân Quản lý đất đai',
      documents: [
        { name: 'Đơn xin việc', url: '#' },
        { name: 'CV', url: '#' },
        { name: 'Bằng cấp', url: '#' }
      ]
    },
    {
      id: 'app2',
      name: 'Trần Thị B',
      position: 'Cán bộ tư pháp',
      email: 'tranthib@example.com',
      phone: '0912345678',
      requestDate: '2023-05-16T10:30:00Z',
      status: 'pending',
      experience: '5 năm kinh nghiệm tại quận Y',
      education: 'Cử nhân Luật',
      documents: [
        { name: 'Đơn xin việc', url: '#' },
        { name: 'CV', url: '#' },
        { name: 'Bằng cấp', url: '#' }
      ]
    },
    {
      id: 'app3',
      name: 'Lê Văn C',
      position: 'Cán bộ hộ tịch',
      email: 'levanc@example.com',
      phone: '0909123456',
      requestDate: '2023-05-17T08:45:00Z',
      status: 'pending',
      experience: '2 năm kinh nghiệm tại phường Z',
      education: 'Cử nhân Hành chính công',
      documents: [
        { name: 'Đơn xin việc', url: '#' },
        { name: 'CV', url: '#' },
        { name: 'Bằng cấp', url: '#' }
      ]
    }
  ];
  
  // Fetch officer approvals on component mount
  useEffect(() => {
    fetchApprovals();
  }, []);
  
  // Filter approvals when search term changes
  useEffect(() => {
    if (searchTerm) {
      const filtered = approvals.filter(
        approval => approval.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   approval.position.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredApprovals(filtered);
    } else {
      setFilteredApprovals(approvals);
    }
  }, [searchTerm, approvals]);
  
  // Function to fetch officer approvals
  const fetchApprovals = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In production, use actual API call
      // const response = await chairmanService.getOfficerApprovals();
      // setApprovals(response);
      
      // Using mock data for now
      setTimeout(() => {
        setApprovals(mockApprovals);
        setFilteredApprovals(mockApprovals);
        setLoading(false);
      }, 800);
    } catch (err) {
      console.error('Error fetching officer approvals:', err);
      setError('Không thể tải danh sách phê duyệt. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };
  
  // Format date for display
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
  
  // Open dialog for approval or rejection
  const handleOpenDialog = (approval, action) => {
    setSelectedApproval(approval);
    setDialogAction(action);
    setDialogReason('');
    setDialogOpen(true);
  };
  
  // Close dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };
  
  // Handle approval or rejection action
  const handleApprovalAction = async () => {
    try {
      if (dialogAction === 'approve') {
        // In production, use actual API call
        // await chairmanService.approveOfficer(selectedApproval.id, { reason: dialogReason });
        
        // Update local state for now
        const updatedApprovals = approvals.map(approval => 
          approval.id === selectedApproval.id ? { ...approval, status: 'approved' } : approval
        );
        setApprovals(updatedApprovals);
        
        setSnackbarMessage(`Đã phê duyệt ${selectedApproval.name} thành công`);
        setSnackbarSeverity('success');
      } else {
        // In production, use actual API call
        // await chairmanService.rejectOfficer(selectedApproval.id, { reason: dialogReason });
        
        // Update local state for now
        const updatedApprovals = approvals.map(approval => 
          approval.id === selectedApproval.id ? { ...approval, status: 'rejected' } : approval
        );
        setApprovals(updatedApprovals);
        
        setSnackbarMessage(`Đã từ chối ${selectedApproval.name}`);
        setSnackbarSeverity('info');
      }
      
      setSnackbarOpen(true);
      handleCloseDialog();
    } catch (err) {
      console.error(`Error ${dialogAction === 'approve' ? 'approving' : 'rejecting'} officer:`, err);
      setSnackbarMessage(`Lỗi: Không thể ${dialogAction === 'approve' ? 'phê duyệt' : 'từ chối'} cán bộ`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };
  
  // Get status chip based on status
  const getStatusChip = (status) => {
    switch (status) {
      case 'approved':
        return <Chip label="Đã phê duyệt" color="success" size="small" />;
      case 'pending':
        return <Chip label="Chờ phê duyệt" color="warning" size="small" />;
      case 'rejected':
        return <Chip label="Đã từ chối" color="error" size="small" />;
      default:
        return <Chip label={status} color="default" size="small" />;
    }
  };
  
  // Handle view officer details
  const handleViewDetails = (approval) => {
    setSelectedApproval(approval);
    // Navigate to detail page in real app
    console.log('View details for:', approval);
  };
  
  // Render loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 120px)' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={fetchApprovals}>
              Thử lại
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      {/* Page header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" color="primary.main">
          Phê duyệt cán bộ
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Xem xét và phê duyệt các đơn đăng ký của cán bộ xã
        </Typography>
      </Box>
      
      {/* Filter and search section */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2, boxShadow: theme.shadows[2] }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TextField
            placeholder="Tìm kiếm theo tên hoặc chức vụ..."
            variant="outlined"
            size="small"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mr: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <Tooltip title="Làm mới">
            <IconButton onClick={fetchApprovals}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Bộ lọc">
            <IconButton>
              <FilterIcon />
            </IconButton>
          </Tooltip>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            Hiển thị {filteredApprovals.length} trong tổng số {approvals.length} đơn đăng ký
          </Typography>
          <Chip label={`${approvals.filter(a => a.status === 'pending').length} chờ phê duyệt`} color="warning" size="small" />
        </Box>
      </Paper>
      
      {/* Officer approvals list */}
      {filteredApprovals.length > 0 ? (
        <Grid container spacing={3}>
          {filteredApprovals.map((approval) => (
            <Grid item xs={12} md={6} lg={4} key={approval.id}>
              <Card sx={{ 
                borderRadius: 2, 
                boxShadow: theme.shadows[2],
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[4],
                }
              }}>
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                      {approval.name.charAt(0)}
                    </Avatar>
                  }
                  title={approval.name}
                  subheader={approval.position}
                  action={
                    <Box>
                      {getStatusChip(approval.status)}
                    </Box>
                  }
                />
                <Divider />
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Email:</strong> {approval.email}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Điện thoại:</strong> {approval.phone}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Ngày đăng ký:</strong> {formatDate(approval.requestDate)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<ViewIcon />}
                      size="small"
                      onClick={() => handleViewDetails(approval)}
                    >
                      Xem chi tiết
                    </Button>
                    
                    {approval.status === 'pending' && (
                      <Box>
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<ApproveIcon />}
                          size="small"
                          sx={{ mr: 1 }}
                          onClick={() => handleOpenDialog(approval, 'approve')}
                        >
                          Phê duyệt
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<RejectIcon />}
                          size="small"
                          onClick={() => handleOpenDialog(approval, 'reject')}
                        >
                          Từ chối
                        </Button>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <PersonIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Không tìm thấy đơn đăng ký nào
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Không có đơn đăng ký cán bộ nào phù hợp với tìm kiếm của bạn
          </Typography>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />}
            onClick={() => {
              setSearchTerm('');
              fetchApprovals();
            }}
          >
            Làm mới danh sách
          </Button>
        </Paper>
      )}
      
      {/* Approval/Rejection Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogAction === 'approve' ? 'Phê duyệt cán bộ' : 'Từ chối đơn đăng ký'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {dialogAction === 'approve'
              ? `Bạn có chắc chắn muốn phê duyệt đơn đăng ký của ${selectedApproval?.name || ''}?`
              : `Bạn có chắc chắn muốn từ chối đơn đăng ký của ${selectedApproval?.name || ''}?`
            }
          </DialogContentText>
          
          <TextField
            label="Lý do (tùy chọn)"
            multiline
            rows={3}
            fullWidth
            value={dialogReason}
            onChange={(e) => setDialogReason(e.target.value)}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button 
            onClick={handleApprovalAction} 
            variant="contained" 
            color={dialogAction === 'approve' ? 'success' : 'error'}
          >
            {dialogAction === 'approve' ? 'Phê duyệt' : 'Từ chối'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={5000} 
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OfficerApproval; 