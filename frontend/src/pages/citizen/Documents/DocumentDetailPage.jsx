import React, { useState, useEffect } from 'react';
import { 
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Divider,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Description as DocumentIcon,
  History as HistoryIcon,
  Lock as LockIcon,
  Download as DownloadIcon,
  VerifiedUser as VerifiedUserIcon,
  ContentCopy as CopyIcon,
  QrCode as QrCodeIcon,
  Check as CheckIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import QRCode from 'qrcode.react';

// Mock service - would be replaced with real API
import { getDocumentDetails } from '../../../services/api/citizenService';

// Helper function to format document type
const formatDocumentType = (type) => {
  const typeMap = {
    'GIẤY_KHAI_SINH': 'Giấy khai sinh',
    'CHỨNG_MINH_NHÂN_DÂN': 'Chứng minh nhân dân',
    'SỔ_HỘ_KHẨU': 'Sổ hộ khẩu',
    'XÁC_NHẬN_THƯỜNG_TRÚ': 'Xác nhận thường trú',
    'CHỨNG_NHẬN_HÔN_NHÂN': 'Chứng nhận hôn nhân',
    'GIẤY_CHỨNG_TỬ': 'Giấy chứng tử'
  };
  
  return typeMap[type] || type;
};

// Mock document details
const mockDocumentDetails = {
  documentId: 'DOC001',
  documentType: 'GIẤY_KHAI_SINH',
  status: 'VALID',
  issuedAt: '2023-06-16T14:20:00Z',
  expiresAt: null,
  issuedBy: 'Ủy ban Nhân dân Xã ABC',
  officerId: 'OFF001',
  officerName: 'Nguyễn Văn B',
  verificationCode: 'ABC123',
  contentHash: '7a8b9c0d1e2f3g4h5i6j7k8l9m0n1o2p',
  transactionId: 'TX123456789',
  blockchainTimestamp: '2023-06-16T14:25:00Z',
  details: {
    fullName: 'Nguyễn Văn A',
    dateOfBirth: '2023-05-10',
    gender: 'Nam',
    placeOfBirth: 'Thành phố Hồ Chí Minh',
    fatherName: 'Nguyễn Văn C',
    motherName: 'Trần Thị D',
    permanentAddress: '123 Đường ABC, Phường XYZ, Quận 1, TP.HCM'
  },
  transactionHistory: [
    {
      action: 'CREATE',
      timestamp: '2023-06-16T14:20:00Z',
      userId: 'OFF001',
      userName: 'Nguyễn Văn B',
      role: 'officer'
    },
    {
      action: 'APPROVE',
      timestamp: '2023-06-16T14:22:00Z',
      userId: 'OFF001',
      userName: 'Nguyễn Văn B',
      role: 'officer'
    },
    {
      action: 'RECORD_ON_BLOCKCHAIN',
      timestamp: '2023-06-16T14:25:00Z',
      userId: 'SYSTEM',
      userName: 'Hệ thống',
      role: 'system'
    }
  ]
};

// Mock fetch document details
const mockFetchDocumentDetails = (documentId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockDocumentDetails);
    }, 1000);
  });
};

const DocumentDetailPage = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [document, setDocument] = useState(null);
  
  // Dialog states
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  
  // Copy state
  const [verificationCodeCopied, setVerificationCodeCopied] = useState(false);
  
  useEffect(() => {
    const fetchDocumentDetails = async () => {
      try {
        // In a real app, we would call the real API
        // const data = await getDocumentDetails(documentId);
        
        // Using mock data for now
        const data = await mockFetchDocumentDetails(documentId);
        
        setDocument(data);
      } catch (err) {
        console.error('Error fetching document details:', err);
        setError('Có lỗi xảy ra khi tải thông tin giấy tờ. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocumentDetails();
  }, [documentId]);
  
  // Handle copy verification code
  const handleCopyVerificationCode = () => {
    if (document && document.verificationCode) {
      navigator.clipboard.writeText(document.verificationCode);
      setVerificationCodeCopied(true);
      
      // Reset copy status after 2 seconds
      setTimeout(() => {
        setVerificationCodeCopied(false);
      }, 2000);
    }
  };
  
  // Handle open QR dialog
  const handleOpenQrDialog = () => {
    setQrDialogOpen(true);
  };
  
  // Handle close QR dialog
  const handleCloseQrDialog = () => {
    setQrDialogOpen(false);
  };
  
  // Handle open history dialog
  const handleOpenHistoryDialog = () => {
    setHistoryDialogOpen(true);
  };
  
  // Handle close history dialog
  const handleCloseHistoryDialog = () => {
    setHistoryDialogOpen(false);
  };
  
  // Handle document download
  const handleDownload = () => {
    // In a real app, this would trigger a document download
    alert('Đang tải xuống tài liệu. Trong ứng dụng thực tế, tính năng này sẽ tải xuống tệp PDF của giấy tờ.');
  };
  
  // Handle document print
  const handlePrint = () => {
    // In a real app, this would open a print dialog
    alert('Đang chuẩn bị in tài liệu. Trong ứng dụng thực tế, tính năng này sẽ mở hộp thoại in.');
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Đang tải thông tin giấy tờ...
        </Typography>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Box sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/citizen/documents')}
          >
            Quay lại danh sách giấy tờ
          </Button>
        </Box>
      </Container>
    );
  }
  
  if (!document) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="warning">
          Không tìm thấy thông tin giấy tờ với mã {documentId}
        </Alert>
        <Box sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/citizen/documents')}
          >
            Quay lại danh sách giấy tờ
          </Button>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/citizen/documents')}
        >
          Quay lại danh sách giấy tờ
        </Button>
      </Box>
      
      {/* Document Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item>
            <DocumentIcon color="primary" sx={{ fontSize: 40 }} />
          </Grid>
          <Grid item xs>
            <Typography variant="h4" component="h1">
              {formatDocumentType(document.documentType)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Chip 
                icon={<VerifiedUserIcon />} 
                label={document.status === 'VALID' ? 'Hợp lệ' : 'Hết hạn'} 
                color={document.status === 'VALID' ? 'success' : 'error'} 
                sx={{ mr: 1 }} 
              />
              <Typography variant="body2" color="text.secondary">
                Mã giấy tờ: {document.documentId}
              </Typography>
            </Box>
          </Grid>
          <Grid item>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<QrCodeIcon />}
                onClick={handleOpenQrDialog}
              >
                Mã QR
              </Button>
              <Button
                variant="outlined"
                startIcon={<HistoryIcon />}
                onClick={handleOpenHistoryDialog}
              >
                Lịch sử
              </Button>
              <Button
                variant="outlined"
                startIcon={<PrintIcon />}
                onClick={handlePrint}
              >
                In
              </Button>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
              >
                Tải xuống
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Document Content */}
      <Grid container spacing={3}>
        {/* Document Details */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Thông tin giấy tờ
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={2}>
              {Object.entries(document.details).map(([key, value]) => (
                <Grid item xs={12} sm={6} key={key}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {/* Format the key for display */}
                    {key === 'fullName' && 'Họ và tên'}
                    {key === 'dateOfBirth' && 'Ngày sinh'}
                    {key === 'gender' && 'Giới tính'}
                    {key === 'placeOfBirth' && 'Nơi sinh'}
                    {key === 'fatherName' && 'Họ tên cha'}
                    {key === 'motherName' && 'Họ tên mẹ'}
                    {key === 'permanentAddress' && 'Địa chỉ thường trú'}
                    {key === 'currentAddress' && 'Địa chỉ hiện tại'}
                    {key === 'idNumber' && 'Số CMND/CCCD'}
                    {key === 'nationality' && 'Quốc tịch'}
                    {key === 'religion' && 'Tôn giáo'}
                    {key === 'husbandName' && 'Họ tên chồng'}
                    {key === 'husbandDob' && 'Ngày sinh chồng'}
                    {key === 'husbandId' && 'Số CMND/CCCD chồng'}
                    {key === 'wifeName' && 'Họ tên vợ'}
                    {key === 'wifeDob' && 'Ngày sinh vợ'}
                    {key === 'wifeId' && 'Số CMND/CCCD vợ'}
                    {key === 'registrationPlace' && 'Nơi đăng ký'}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {key === 'dateOfBirth' || key === 'husbandDob' || key === 'wifeDob'
                      ? format(new Date(value), 'dd/MM/yyyy', { locale: vi })
                      : value}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
        
        {/* Document Metadata */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Thông tin xác thực
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Mã xác thực
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ mr: 1 }}>
                  {document.verificationCode}
                </Typography>
                <Tooltip title={verificationCodeCopied ? "Đã sao chép!" : "Sao chép mã"}>
                  <IconButton 
                    size="small" 
                    onClick={handleCopyVerificationCode}
                    color={verificationCodeCopied ? "success" : "default"}
                  >
                    {verificationCodeCopied ? <CheckIcon fontSize="small" /> : <CopyIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Ngày cấp
              </Typography>
              <Typography variant="body1">
                {format(new Date(document.issuedAt), 'dd/MM/yyyy', { locale: vi })}
              </Typography>
            </Box>
            
            {document.expiresAt && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Ngày hết hạn
                </Typography>
                <Typography variant="body1">
                  {format(new Date(document.expiresAt), 'dd/MM/yyyy', { locale: vi })}
                </Typography>
              </Box>
            )}
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Đơn vị cấp
              </Typography>
              <Typography variant="body1">
                {document.issuedBy}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Cán bộ thực hiện
              </Typography>
              <Typography variant="body1">
                {document.officerName}
              </Typography>
            </Box>
          </Paper>
          
          <Card variant="outlined" sx={{ p: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LockIcon color="primary" fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="subtitle1">
                  Thông tin Blockchain
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Giấy tờ này đã được đăng ký trên blockchain và không thể bị sửa đổi.
              </Typography>
              
              <Typography variant="caption" display="block">
                Mã giao dịch: {document.transactionId}
              </Typography>
              <Typography variant="caption" display="block">
                Thời gian: {format(new Date(document.blockchainTimestamp), 'dd/MM/yyyy HH:mm:ss', { locale: vi })}
              </Typography>
              <Typography variant="caption" display="block" sx={{ wordBreak: 'break-all' }}>
                Hash nội dung: {document.contentHash}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onClose={handleCloseQrDialog}>
        <DialogTitle>Mã QR xác thực giấy tờ</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', p: 2 }}>
            <QRCode 
              value={`https://example.com/verify?code=${document.verificationCode}&id=${document.documentId}`} 
              size={200}
              level="H"
              includeMargin={true}
            />
            <Typography variant="body1" sx={{ mt: 2 }}>
              Mã xác thực: {document.verificationCode}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Quét mã QR hoặc nhập mã xác thực tại trang web để xác minh tính xác thực của giấy tờ.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseQrDialog}>Đóng</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              // In a real app, this would download the QR code as an image
              alert('Tính năng tải xuống mã QR sẽ được thực hiện trong ứng dụng thực tế.');
              handleCloseQrDialog();
            }}
            startIcon={<SaveIcon />}
          >
            Lưu mã QR
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Transaction History Dialog */}
      <Dialog 
        open={historyDialogOpen} 
        onClose={handleCloseHistoryDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Lịch sử giao dịch</DialogTitle>
        <DialogContent>
          <List>
            {document.transactionHistory.map((transaction, index) => (
              <ListItem 
                key={index}
                divider={index < document.transactionHistory.length - 1}
                alignItems="flex-start"
              >
                <ListItemIcon sx={{ mt: 0 }}>
                  <Box 
                    sx={{ 
                      width: 10, 
                      height: 10, 
                      borderRadius: '50%', 
                      bgcolor: 'primary.main',
                      mt: 1.5
                    }} 
                  />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="subtitle1">
                      {transaction.action === 'CREATE' && 'Tạo giấy tờ'}
                      {transaction.action === 'APPROVE' && 'Phê duyệt giấy tờ'}
                      {transaction.action === 'RECORD_ON_BLOCKCHAIN' && 'Lưu trữ trên Blockchain'}
                      {transaction.action === 'VERIFY' && 'Xác thực giấy tờ'}
                      {transaction.action === 'REVOKE' && 'Thu hồi giấy tờ'}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" component="span" color="text.secondary">
                        {format(new Date(transaction.timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: vi })}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        Người thực hiện: {transaction.userName} ({transaction.role === 'officer' ? 'Cán bộ' : transaction.role === 'chairman' ? 'Chủ tịch' : 'Hệ thống'})
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHistoryDialog}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DocumentDetailPage;
