import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Divider,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  HourglassEmpty as PendingIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';

// Giả lập dữ liệu
const mockApprovalData = {
  status: 'pending', // 'pending', 'approved', 'rejected'
  submittedDate: '2023-05-01T10:30:00Z',
  reviewedDate: null,
  approvedDate: null,
  rejectedDate: null,
  rejectReason: null,
  reviewedBy: null,
  comments: [],
  steps: [
    {
      label: 'Đăng ký yêu cầu làm cán bộ xã',
      description: 'Bạn đã gửi yêu cầu đăng ký làm cán bộ xã',
      completed: true,
      date: '2023-05-01T10:30:00Z'
    },
    {
      label: 'Xem xét hồ sơ',
      description: 'Hồ sơ của bạn đang được Chủ tịch xã xem xét',
      completed: false,
      date: null
    },
    {
      label: 'Phê duyệt',
      description: 'Yêu cầu của bạn được phê duyệt và kích hoạt trên blockchain',
      completed: false,
      date: null
    }
  ]
};

const ApprovalStatusPage = () => {
  const [loading, setLoading] = useState(true);
  const [approvalData, setApprovalData] = useState(null);
  const [activeStep, setActiveStep] = useState(0);

  // Giả lập tải dữ liệu
  useEffect(() => {
    const loadData = async () => {
      try {
        // Giả lập delay mạng
        await new Promise(resolve => setTimeout(resolve, 1000));
        setApprovalData(mockApprovalData);
        
        // Tính toán active step dựa trên dữ liệu
        const completedSteps = mockApprovalData.steps.filter(step => step.completed);
        setActiveStep(completedSteps.length);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getStatusChip = (status) => {
    switch (status) {
      case 'pending':
        return <Chip icon={<PendingIcon />} label="Đang chờ xét duyệt" color="warning" />;
      case 'approved':
        return <Chip icon={<ApprovedIcon />} label="Đã được phê duyệt" color="success" />;
      case 'rejected':
        return <Chip icon={<RejectedIcon />} label="Đã bị từ chối" color="error" />;
      default:
        return <Chip label="Không xác định" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa xác định';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const refreshData = () => {
    setLoading(true);
    // Giả lập tải lại dữ liệu
    setTimeout(() => {
      setApprovalData(mockApprovalData);
      setLoading(false);
    }, 1000);
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!approvalData) {
    return (
      <Container maxWidth="md">
        <Alert severity="error">
          Không thể tải thông tin trạng thái phê duyệt. Vui lòng thử lại sau.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Trạng thái Phê duyệt Cán bộ
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Theo dõi trạng thái phê duyệt yêu cầu đăng ký làm cán bộ xã của bạn
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Thông tin Yêu cầu
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box mb={2}>
                <Typography variant="subtitle2" color="textSecondary">
                  Trạng thái hiện tại
                </Typography>
                <Box mt={1}>
                  {getStatusChip(approvalData.status)}
                </Box>
              </Box>
              
              <Box mb={2}>
                <Typography variant="subtitle2" color="textSecondary">
                  Ngày gửi yêu cầu
                </Typography>
                <Typography variant="body2">
                  {formatDate(approvalData.submittedDate)}
                </Typography>
              </Box>
              
              {approvalData.reviewedDate && (
                <Box mb={2}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Ngày xem xét
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(approvalData.reviewedDate)}
                  </Typography>
                </Box>
              )}
              
              {approvalData.approvedDate && (
                <Box mb={2}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Ngày phê duyệt
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(approvalData.approvedDate)}
                  </Typography>
                </Box>
              )}
              
              {approvalData.rejectedDate && (
                <Box mb={2}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Ngày từ chối
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(approvalData.rejectedDate)}
                  </Typography>
                </Box>
              )}
              
              {approvalData.rejectReason && (
                <Box mb={2}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Lý do từ chối
                  </Typography>
                  <Typography variant="body2">
                    {approvalData.rejectReason}
                  </Typography>
                </Box>
              )}
              
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={refreshData}
                fullWidth
                sx={{ mt: 2 }}
              >
                Cập nhật trạng thái
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tiến trình Phê duyệt
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Stepper activeStep={activeStep} orientation="vertical">
              {approvalData.steps.map((step, index) => (
                <Step key={index}>
                  <StepLabel>
                    <Typography variant="subtitle1">{step.label}</Typography>
                  </StepLabel>
                  <StepContent>
                    <Typography variant="body2">{step.description}</Typography>
                    {step.date && (
                      <Typography variant="caption" color="textSecondary">
                        {formatDate(step.date)}
                      </Typography>
                    )}
                  </StepContent>
                </Step>
              ))}
            </Stepper>
            
            {approvalData.status === 'rejected' && (
              <Alert severity="warning" sx={{ mt: 3 }}>
                Yêu cầu của bạn đã bị từ chối. Vui lòng kiểm tra lại thông tin và nộp lại nếu cần thiết.
              </Alert>
            )}
            
            {approvalData.status === 'approved' && (
              <Alert severity="success" sx={{ mt: 3 }}>
                Chúc mừng! Yêu cầu của bạn đã được phê duyệt. Bạn giờ đây có thể truy cập vào các tính năng dành cho cán bộ xã.
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ApprovalStatusPage; 