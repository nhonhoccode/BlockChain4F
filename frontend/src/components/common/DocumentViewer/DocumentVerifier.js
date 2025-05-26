import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  Grid,
  TextField,
  Typography,
  Alert,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  VerifiedUser as VerifiedIcon,
  ErrorOutline as ErrorIcon,
  AccessTime as TimeIcon,
  Close as CloseIcon,
  History as HistoryIcon,
  QrCode as QrCodeIcon,
} from '@mui/icons-material';
import blockchainService from '../../../services/blockchain/blockchainService';
import DocumentHistoryDialog from './DocumentHistoryDialog';

const DocumentVerifier = () => {
  // State for form values
  const [documentId, setDocumentId] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [identificationNumber, setIdentificationNumber] = useState('');
  
  // State for verification results
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);
  
  // State for history dialog
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [documentHistory, setDocumentHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  // Function to handle form submission
  const handleVerify = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!documentId && !documentNumber) {
      setError('Vui lòng nhập ID hoặc số giấy tờ');
      setShowError(true);
      return;
    }
    
    setLoading(true);
    setError('');
    setShowError(false);
    
    try {
      // Call verification API
      const result = await blockchainService.verifyDocument(
        documentId,
        documentNumber,
        identificationNumber
      );
      
      setVerificationResult(result);
    } catch (err) {
      console.error('Verification error:', err);
      setError(err.response?.data?.error || 'Đã xảy ra lỗi khi xác thực giấy tờ');
      setShowError(true);
      setVerificationResult(null);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to load document history
  const handleViewHistory = async () => {
    setLoadingHistory(true);
    
    try {
      // Get document ID from verification result or form
      const docId = verificationResult?.document?.blockchain_id || documentId;
      
      if (!docId) {
        setError('Không có ID giấy tờ để xem lịch sử');
        setShowError(true);
        return;
      }
      
      // Call history API
      const history = await blockchainService.getDocumentHistory(docId);
      setDocumentHistory(history);
      setShowHistoryDialog(true);
    } catch (err) {
      console.error('History error:', err);
      setError(err.response?.data?.error || 'Đã xảy ra lỗi khi lấy lịch sử giấy tờ');
      setShowError(true);
    } finally {
      setLoadingHistory(false);
    }
  };
  
  // Function to generate QR code
  const handleGenerateQR = () => {
    if (!verificationResult?.document?.blockchain_id) {
      setError('Không có ID giấy tờ để tạo mã QR');
      setShowError(true);
      return;
    }
    
    // Generate QR code URL
    const qrCodeUrl = blockchainService.generateVerificationQRCode(
      verificationResult.document.blockchain_id,
      verificationResult.document.document_number
    );
    
    // Open QR code in new tab
    window.open(qrCodeUrl, '_blank');
  };
  
  // Function to reset form
  const handleReset = () => {
    setDocumentId('');
    setDocumentNumber('');
    setIdentificationNumber('');
    setVerificationResult(null);
    setError('');
    setShowError(false);
  };
  
  // Render verification status icon
  const renderStatusIcon = () => {
    if (!verificationResult) return null;
    
    if (verificationResult.verified) {
      return (
        <Box display="flex" alignItems="center" mb={2}>
          <VerifiedIcon color="success" fontSize="large" />
          <Typography variant="h6" color="success.main" ml={1}>
            Giấy tờ hợp lệ
          </Typography>
        </Box>
      );
    } else if (verificationResult.exists) {
      return (
        <Box display="flex" alignItems="center" mb={2}>
          <ErrorIcon color="error" fontSize="large" />
          <Typography variant="h6" color="error.main" ml={1}>
            Giấy tờ không hợp lệ
          </Typography>
        </Box>
      );
    } else {
      return (
        <Box display="flex" alignItems="center" mb={2}>
          <ErrorIcon color="error" fontSize="large" />
          <Typography variant="h6" color="error.main" ml={1}>
            Không tìm thấy giấy tờ
          </Typography>
        </Box>
      );
    }
  };
  
  return (
    <Card>
      <CardHeader 
        title="Xác thực giấy tờ trên Blockchain" 
        subheader="Nhập thông tin giấy tờ để xác thực tính hợp lệ"
      />
      <Divider />
      
      <CardContent>
        {/* Error Alert */}
        <Collapse in={showError}>
          <Alert 
            severity="error"
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => setShowError(false)}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        </Collapse>
        
        {/* Verification Form */}
        <form onSubmit={handleVerify}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ID Blockchain của giấy tờ"
                placeholder="Ví dụ: DOC-20220101-123456"
                value={documentId}
                onChange={(e) => setDocumentId(e.target.value)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Số giấy tờ"
                placeholder="Ví dụ: CMND-123456789"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Số CMND/CCCD (tùy chọn)"
                placeholder="Nhập số CMND/CCCD của người sở hữu giấy tờ"
                value={identificationNumber}
                onChange={(e) => setIdentificationNumber(e.target.value)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between">
                <Button 
                  type="button" 
                  variant="outlined" 
                  color="secondary"
                  onClick={handleReset}
                  disabled={loading}
                >
                  Làm mới
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  {loading ? 'Đang xác thực...' : 'Xác thực giấy tờ'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
        
        {/* Verification Result */}
        {verificationResult && (
          <Box mt={4}>
            <Divider sx={{ mb: 2 }} />
            
            {/* Status Icon */}
            {renderStatusIcon()}
            
            {/* Document Details */}
            <Typography variant="h6" gutterBottom>
              Thông tin giấy tờ
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">ID Blockchain:</Typography>
                <Typography variant="body2" gutterBottom>
                  {verificationResult.document?.blockchain_id || 'Không có'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Số giấy tờ:</Typography>
                <Typography variant="body2" gutterBottom>
                  {verificationResult.document?.document_number || 'Không có'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Tiêu đề:</Typography>
                <Typography variant="body2" gutterBottom>
                  {verificationResult.document?.title || 'Không có'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Loại giấy tờ:</Typography>
                <Typography variant="body2" gutterBottom>
                  {verificationResult.document?.document_type_display || verificationResult.document?.document_type || 'Không có'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Trạng thái:</Typography>
                <Typography variant="body2" gutterBottom>
                  {verificationResult.document?.status_display || verificationResult.document?.status || 'Không có'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Ngày cấp:</Typography>
                <Typography variant="body2" gutterBottom>
                  {verificationResult.document?.issue_date || 'Không có'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Có giá trị đến:</Typography>
                <Typography variant="body2" gutterBottom>
                  {verificationResult.document?.valid_until || 'Không giới hạn'}
                </Typography>
              </Grid>
            </Grid>
            
            {/* Blockchain Info */}
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Thông tin blockchain
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Transaction ID:</Typography>
                <Typography variant="body2" gutterBottom style={{ wordBreak: 'break-all' }}>
                  {verificationResult.blockchain_info?.tx_id || 'Không có'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Thời gian lưu:</Typography>
                <Typography variant="body2" gutterBottom>
                  {verificationResult.blockchain_info?.timestamp || 
                   verificationResult.blockchain_info?.verification_timestamp || 'Không có'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Trạng thái blockchain:</Typography>
                <Typography variant="body2" gutterBottom>
                  {verificationResult.blockchain_info?.status || 'Không có'}
                </Typography>
              </Grid>
            </Grid>
            
            {/* Verification Details */}
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Chi tiết xác thực
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box display="flex" alignItems="center">
                  <VerifiedIcon color={verificationResult.verified ? "success" : "error"} />
                  <Typography variant="body2" ml={1}>
                    Xác thực: {verificationResult.verified ? 'Thành công' : 'Thất bại'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box display="flex" alignItems="center">
                  <VerifiedIcon color={verificationResult.exists ? "success" : "error"} />
                  <Typography variant="body2" ml={1}>
                    Tồn tại: {verificationResult.exists ? 'Có' : 'Không'}
                  </Typography>
                </Box>
              </Grid>
              {verificationResult.dataIntegrity !== undefined && (
                <Grid item xs={12} md={4}>
                  <Box display="flex" alignItems="center">
                    <VerifiedIcon color={verificationResult.dataIntegrity ? "success" : "error"} />
                    <Typography variant="body2" ml={1}>
                      Toàn vẹn dữ liệu: {verificationResult.dataIntegrity ? 'Có' : 'Không'}
                    </Typography>
                  </Box>
                </Grid>
              )}
              {verificationResult.isActive !== undefined && (
                <Grid item xs={12} md={4}>
                  <Box display="flex" alignItems="center">
                    <VerifiedIcon color={verificationResult.isActive ? "success" : "error"} />
                    <Typography variant="body2" ml={1}>
                      Đang hiệu lực: {verificationResult.isActive ? 'Có' : 'Không'}
                    </Typography>
                  </Box>
                </Grid>
              )}
              {verificationResult.isExpired !== undefined && (
                <Grid item xs={12} md={4}>
                  <Box display="flex" alignItems="center">
                    <VerifiedIcon color={!verificationResult.isExpired ? "success" : "error"} />
                    <Typography variant="body2" ml={1}>
                      Đã hết hạn: {verificationResult.isExpired ? 'Có' : 'Không'}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
            
            {/* Action Buttons */}
            <Box display="flex" justifyContent="flex-end" mt={3}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<QrCodeIcon />}
                onClick={handleGenerateQR}
                sx={{ mr: 1 }}
                disabled={!verificationResult.document?.blockchain_id}
              >
                Tạo mã QR
              </Button>
              <Button
                variant="outlined"
                color="primary"
                startIcon={loadingHistory ? <CircularProgress size={20} /> : <HistoryIcon />}
                onClick={handleViewHistory}
                disabled={loadingHistory || !verificationResult.document?.blockchain_id}
              >
                Xem lịch sử
              </Button>
            </Box>
          </Box>
        )}
      </CardContent>
      
      {/* History Dialog */}
      <DocumentHistoryDialog
        open={showHistoryDialog}
        onClose={() => setShowHistoryDialog(false)}
        history={documentHistory}
        documentId={verificationResult?.document?.blockchain_id || documentId}
      />
    </Card>
  );
};

export default DocumentVerifier; 