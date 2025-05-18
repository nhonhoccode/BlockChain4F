import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Card,
  CardHeader,
  CardContent
} from '@mui/material';
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  Home as HomeIcon,
  CalendarToday as CalendarIcon,
  Description as DocumentIcon,
  ArrowBack as BackIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  AttachFile as AttachmentIcon
} from '@mui/icons-material';

import PrimaryButton from '../../../../components/common/Buttons/PrimaryButton';
import SecondaryButton from '../../../../components/common/Buttons/SecondaryButton';
import BlockchainBadge from '../../../../components/common/BlockchainBadge';
import officerService from '../../../../services/api/officerService';
import styles from './OfficerApproval.module.scss';

const OfficerApprovalDetailPage = () => {
  const { approvalId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [approvalDetail, setApprovalDetail] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Lấy chi tiết yêu cầu phê duyệt
  const fetchApprovalDetail = async () => {
    setLoading(true);
    try {
      const response = await officerService.getApprovalDetail(approvalId);
      setApprovalDetail(response);
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết yêu cầu phê duyệt:', error);
      showNotification('Lỗi khi lấy chi tiết yêu cầu phê duyệt', 'error');
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
  
  // Mở dialog phê duyệt
  const handleOpenApproveDialog = () => {
    setCommentText('');
    setOpenApproveDialog(true);
  };
  
  // Đóng dialog phê duyệt
  const handleCloseApproveDialog = () => {
    setOpenApproveDialog(false);
  };
  
  // Mở dialog từ chối
  const handleOpenRejectDialog = () => {
    setRejectReason('');
    setOpenRejectDialog(true);
  };
  
  // Đóng dialog từ chối
  const handleCloseRejectDialog = () => {
    setOpenRejectDialog(false);
  };
  
  // Xử lý phê duyệt yêu cầu
  const handleApproveRequest = async () => {
    setSubmitLoading(true);
    try {
      const data = {
        comment: commentText || 'Đã phê duyệt bởi chủ tịch xã',
        approved_departments: ['UBND Xã']
      };
      
      await officerService.approveOfficer(approvalId, data);
      
      showNotification('Phê duyệt yêu cầu thành công', 'success');
      handleCloseApproveDialog();
      
      // Cập nhật lại chi tiết để hiển thị trạng thái mới
      fetchApprovalDetail();
      
      // Chuyển hướng về trang danh sách cán bộ đã phê duyệt sau 2 giây
      setTimeout(() => {
        navigate('/admin/chairman/officer-approval/approved');
      }, 2000);
      
    } catch (error) {
      console.error('Lỗi khi phê duyệt yêu cầu:', error);
      showNotification('Lỗi khi phê duyệt yêu cầu', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };
  
  // Xử lý từ chối yêu cầu
  const handleRejectRequest = async () => {
    if (!rejectReason.trim()) {
      showNotification('Vui lòng nhập lý do từ chối', 'warning');
      return;
    }
    
    setSubmitLoading(true);
    try {
      await officerService.rejectOfficer(approvalId, { reason: rejectReason });
      
      showNotification('Từ chối yêu cầu thành công', 'success');
      handleCloseRejectDialog();
      
      // Cập nhật lại chi tiết để hiển thị trạng thái mới
      fetchApprovalDetail();
      
      // Chuyển hướng về trang danh sách yêu cầu phê duyệt sau 2 giây
      setTimeout(() => {
        navigate('/admin/chairman/officer-approval');
      }, 2000);
      
    } catch (error) {
      console.error('Lỗi khi từ chối yêu cầu:', error);
      showNotification('Lỗi khi từ chối yêu cầu', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };
  
  // Xử lý quay lại trang danh sách
  const handleBack = () => {
    navigate('/admin/chairman/officer-approval');
  };
  
  // Load dữ liệu khi component mount
  useEffect(() => {
    if (approvalId) {
      fetchApprovalDetail();
    }
  }, [approvalId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Đang tải thông tin...
        </Typography>
      </Box>
    );
  }

  if (!approvalDetail) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          <Typography variant="h6">
            Không tìm thấy thông tin yêu cầu phê duyệt
          </Typography>
          <Typography variant="body1">
            Yêu cầu phê duyệt với ID {approvalId} không tồn tại hoặc đã bị xóa.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<BackIcon />} 
            sx={{ mt: 2 }}
            onClick={handleBack}
          >
            Quay lại danh sách
          </Button>
        </Alert>
      </Box>
    );
  }

  const {
    user_details,
    phone_number,
    created_at,
    position,
    department,
    address,
    ward,
    district,
    province,
    is_approved,
    id_number,
    bio
  } = approvalDetail;

  return (
    <Box className={styles.approvalPage}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<BackIcon />}
          onClick={handleBack}
        >
          Quay lại danh sách
        </Button>
        
        <Box>
          <Typography variant="h5" component="h1">
            Chi tiết yêu cầu đăng ký cán bộ xã
          </Typography>
        </Box>
        
        <Box>
          <BlockchainBadge verified={is_approved} pending={!is_approved} />
        </Box>
      </Box>
      
      <Paper elevation={1} className={styles.infoContainer}>
        <Typography variant="body1">
          <strong>Trạng thái:</strong>{' '}
          {is_approved ? (
            <Chip 
              label="Đã phê duyệt" 
              color="success" 
              variant="filled" 
              size="small"
              icon={<ApproveIcon />} 
            />
          ) : (
            <Chip 
              label="Chờ phê duyệt" 
              color="warning" 
              variant="filled" 
              size="small" 
            />
          )}
        </Typography>
        <Typography variant="body1">
          <strong>Ngày đăng ký:</strong> {new Date(created_at).toLocaleString('vi-VN')}
        </Typography>
      </Paper>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card className={styles.approvalDetailCard}>
            <CardHeader
              className={styles.cardHeader}
              title="Thông tin cá nhân"
              avatar={<PersonIcon />}
            />
            <CardContent className={styles.cardContent}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <Avatar
                  src={approvalDetail.avatar || ''}
                  alt={`${user_details?.last_name} ${user_details?.first_name}`}
                  className={styles.userAvatar}
                >
                  {user_details?.first_name?.charAt(0) || 'U'}
                </Avatar>
              </Box>
              
              <Box className={styles.userInfo}>
                <Typography variant="h6" className={styles.userName}>
                  {user_details?.last_name} {user_details?.first_name}
                </Typography>
                
                <Typography variant="body1" className={styles.userPosition}>
                  <BadgeIcon sx={{ fontSize: 20, verticalAlign: 'middle', mr: 1 }} />
                  {position || 'Chưa cập nhật'}
                </Typography>
                
                <Typography variant="body2">
                  <EmailIcon sx={{ fontSize: 18, verticalAlign: 'middle', mr: 1 }} />
                  {user_details?.email || 'Chưa cập nhật'}
                </Typography>
                
                <Typography variant="body2">
                  <PhoneIcon sx={{ fontSize: 18, verticalAlign: 'middle', mr: 1 }} />
                  {phone_number || 'Chưa cập nhật'}
                </Typography>
                
                {id_number && (
                  <Typography variant="body2">
                    <BadgeIcon sx={{ fontSize: 18, verticalAlign: 'middle', mr: 1 }} />
                    CMND/CCCD: {id_number}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Card className={styles.approvalDetailCard}>
            <CardHeader
              className={styles.cardHeader}
              title="Thông tin chức vụ"
              avatar={<BadgeIcon />}
            />
            <CardContent className={styles.cardContent}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1" gutterBottom>
                    <strong>Chức vụ:</strong> {position || 'Chưa cập nhật'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1" gutterBottom>
                    <strong>Phòng ban:</strong> {department || 'Chưa cập nhật'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body1" gutterBottom>
                    <strong>Mô tả công việc:</strong>
                  </Typography>
                  <Typography variant="body2">
                    {bio || 'Người dùng chưa cung cấp mô tả công việc.'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          
          <Card className={styles.approvalDetailCard}>
            <CardHeader
              className={styles.cardHeader}
              title="Địa chỉ"
              avatar={<HomeIcon />}
            />
            <CardContent className={styles.cardContent}>
              <Typography variant="body1" gutterBottom>
                <strong>Địa chỉ đầy đủ:</strong>
              </Typography>
              <Typography variant="body2" paragraph>
                {address && `${address}, `}
                {ward && `${ward}, `}
                {district && `${district}, `}
                {province || 'Chưa cập nhật'}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <strong>Tỉnh/Thành phố:</strong> {province || 'Chưa cập nhật'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <strong>Quận/Huyện:</strong> {district || 'Chưa cập nhật'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <strong>Phường/Xã:</strong> {ward || 'Chưa cập nhật'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <strong>Địa chỉ chi tiết:</strong> {address || 'Chưa cập nhật'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          
          <Card className={styles.approvalDetailCard}>
            <CardHeader
              className={styles.cardHeader}
              title="Tài liệu đính kèm"
              avatar={<AttachmentIcon />}
            />
            <CardContent className={styles.cardContent}>
              {approvalDetail.attachments && approvalDetail.attachments.length > 0 ? (
                <List>
                  {approvalDetail.attachments.map((attachment, index) => (
                    <ListItem key={index} className={styles.fileAttachment}>
                      <DocumentIcon className={styles.fileIcon} />
                      <ListItemText 
                        primary={attachment.name} 
                        secondary={`Tải lên ngày: ${new Date(attachment.upload_date).toLocaleDateString('vi-VN')}`} 
                        className={styles.fileName}
                      />
                      <Button 
                        variant="outlined" 
                        size="small"
                        href={attachment.file_url}
                        target="_blank"
                      >
                        Xem
                      </Button>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" color="textSecondary">
                  Không có tài liệu đính kèm.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {!is_approved && (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
          <SecondaryButton
            startIcon={<RejectIcon />}
            onClick={handleOpenRejectDialog}
            color="error"
            size="large"
          >
            Từ chối yêu cầu
          </SecondaryButton>
          
          <PrimaryButton
            startIcon={<ApproveIcon />}
            onClick={handleOpenApproveDialog}
            color="success"
            size="large"
          >
            Phê duyệt yêu cầu
          </PrimaryButton>
        </Box>
      )}
      
      {/* Dialog phê duyệt */}
      <Dialog
        open={openApproveDialog}
        onClose={handleCloseApproveDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Phê duyệt yêu cầu đăng ký cán bộ xã
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" gutterBottom>
            Bạn sắp phê duyệt yêu cầu đăng ký cán bộ xã của{' '}
            <strong>
              {user_details?.last_name} {user_details?.first_name}
            </strong>
          </Typography>
          
          <Typography variant="body2" gutterBottom sx={{ mt: 2 }}>
            Người dùng này sẽ có các quyền sau:
          </Typography>
          
          <List dense>
            <ListItem>
              <ListItemText primary="Xử lý các yêu cầu giấy tờ hành chính từ người dân" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Quản lý thông tin công dân" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Tạo và phát hành các giấy tờ hành chính" />
            </ListItem>
          </List>
          
          <Typography variant="body2" color="warning.main" sx={{ mt: 2 }}>
            Lưu ý: Hành động này không thể hoàn tác sau khi đã xác nhận.
          </Typography>
          
          <TextField
            autoFocus
            margin="dense"
            label="Ghi chú (không bắt buộc)"
            fullWidth
            multiline
            rows={3}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Nhập ghi chú về việc phê duyệt này (nếu cần)..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <SecondaryButton onClick={handleCloseApproveDialog}>
            Hủy bỏ
          </SecondaryButton>
          <PrimaryButton 
            color="success" 
            onClick={handleApproveRequest}
            disabled={submitLoading}
            startIcon={submitLoading ? <CircularProgress size={20} /> : <ApproveIcon />}
          >
            {submitLoading ? 'Đang xử lý...' : 'Xác nhận phê duyệt'}
          </PrimaryButton>
        </DialogActions>
      </Dialog>
      
      {/* Dialog từ chối */}
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
          <Typography variant="body2" gutterBottom>
            Bạn sắp từ chối yêu cầu đăng ký cán bộ xã của{' '}
            <strong>
              {user_details?.last_name} {user_details?.first_name}
            </strong>
          </Typography>
          
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            Lưu ý: Vui lòng cung cấp lý do từ chối để người dùng có thể hiểu và cải thiện khi đăng ký lại.
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
            error={!rejectReason.trim()}
            helperText={!rejectReason.trim() ? "Lý do từ chối là bắt buộc" : ""}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <SecondaryButton onClick={handleCloseRejectDialog}>
            Hủy bỏ
          </SecondaryButton>
          <PrimaryButton 
            color="error" 
            onClick={handleRejectRequest}
            disabled={submitLoading || !rejectReason.trim()}
            startIcon={submitLoading ? <CircularProgress size={20} /> : <RejectIcon />}
          >
            {submitLoading ? 'Đang xử lý...' : 'Xác nhận từ chối'}
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

export default OfficerApprovalDetailPage;
