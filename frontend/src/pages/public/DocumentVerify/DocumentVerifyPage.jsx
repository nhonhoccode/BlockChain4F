import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  useTheme,
  useMediaQuery,
  MenuItem
} from '@mui/material';
import {
  Search as SearchIcon,
  VerifiedUser as VerifiedUserIcon,
  DocumentScanner as DocumentIcon,
  QrCode as QrCodeIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import styles from './DocumentVerifyPage.module.scss';

// Define document types
const documentTypes = [
  { value: 'birth_certificate', label: 'Giấy khai sinh' },
  { value: 'id_card', label: 'CMND/CCCD' },
  { value: 'household_registration', label: 'Sổ hộ khẩu' },
  { value: 'marriage_certificate', label: 'Giấy chứng nhận kết hôn' },
  { value: 'land_certificate', label: 'Giấy chứng nhận quyền sử dụng đất' }
];

// Mock API for document verification
const mockVerifyDocument = async (formData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate a valid document
      if (formData.documentId && formData.documentId.length > 5) {
        resolve({
          success: true,
          message: 'Xác thực thành công. Tài liệu hợp lệ.',
          document: {
            documentId: formData.documentId,
            documentType: formData.documentType,
            issuedTo: 'Nguyễn Văn A',
            citizenId: '012345678901',
            issuedDate: '2023-05-15',
            expiryDate: '2033-05-15',
            issuedBy: 'UBND Xã X, Huyện Y, Tỉnh Z',
            status: 'valid',
            blockchainTimestamp: new Date().toISOString(),
            blockchainTxId: '0x7f5e4d3c2b1a098765432109876543210abcdef12345'
          }
        });
      } else {
        resolve({
          success: false,
          message: 'Không tìm thấy tài liệu. Vui lòng kiểm tra lại mã tài liệu.',
          document: null
        });
      }
    }, 1500);
  });
};

const DocumentVerifyPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State for form and verification
  const [formData, setFormData] = useState({
    documentId: '',
    documentType: 'birth_certificate'
  });
  
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  
  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.documentId.trim()) {
      setError('Vui lòng nhập mã tài liệu cần xác thực');
      return;
    }
    
    // Reset states
    setLoading(true);
    setError(null);
    setVerified(false);
    setVerificationResult(null);
    
    try {
      const response = await mockVerifyDocument(formData);
      setVerificationResult(response);
      setVerified(true);
      setActiveStep(1);
    } catch (err) {
      console.error('Verification error:', err);
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi xác thực tài liệu');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle reset form
  const handleReset = () => {
    setFormData({
      documentId: '',
      documentType: 'birth_certificate'
    });
    setError(null);
    setVerified(false);
    setVerificationResult(null);
    setActiveStep(0);
  };
  
  // Steps for the verification process
  const steps = ['Nhập thông tin tài liệu', 'Kết quả xác thực'];
  
  return (
    <Box className={styles.documentVerify}>
      {/* Header Section */}
      <Box className={styles.documentVerify__header}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h1" gutterBottom className={styles.documentVerify__title}>
            Xác thực tài liệu hành chính
          </Typography>
          <Typography variant="body1" className={styles.documentVerify__subtitle}>
            Kiểm tra tính xác thực của các tài liệu hành chính được phát hành trên blockchain
          </Typography>
        </Container>
      </Box>
      
      <Container maxWidth="md" className={styles.documentVerify__container}>
        <Paper elevation={3} className={styles.documentVerify__paper}>
          {/* Stepper */}
          <Stepper 
            activeStep={activeStep} 
            className={styles.documentVerify__stepper}
            orientation={isMobile ? 'vertical' : 'horizontal'}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          <Divider sx={{ my: 3 }} />
          
          {/* Step 1: Input Form */}
          {activeStep === 0 && (
            <Box component="form" onSubmit={handleSubmit} className={styles.documentVerify__form}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Nhập thông tin tài liệu cần xác thực
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Mã tài liệu"
                    name="documentId"
                    value={formData.documentId}
                    onChange={handleChange}
                    variant="outlined"
                    placeholder="Nhập mã tài liệu (có thể tìm thấy trên giấy tờ)"
                    required
                    InputProps={{
                      endAdornment: <QrCodeIcon color="action" />,
                    }}
                    helperText="Mã tài liệu hoặc mã QR được in trên tài liệu"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    label="Loại tài liệu"
                    name="documentType"
                    value={formData.documentType}
                    onChange={handleChange}
                    variant="outlined"
                    required
                  >
                    {documentTypes.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                
                {error && (
                  <Grid item xs={12}>
                    <Alert severity="error">{error}</Alert>
                  </Grid>
                )}
                
                <Grid item xs={12} className={styles.documentVerify__formActions}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
                  >
                    {loading ? 'Đang xác thực...' : 'Xác thực tài liệu'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}
          
          {/* Step 2: Verification Result */}
          {activeStep === 1 && verificationResult && (
            <Box className={styles.documentVerify__result}>
              {verificationResult.success ? (
                <>
                  <Box className={styles.documentVerify__successHeader}>
                    <VerifiedUserIcon color="success" fontSize="large" />
                    <Typography variant="h5" color="success.main" gutterBottom>
                      Tài liệu hợp lệ
                    </Typography>
                  </Box>
                  
                  <Alert severity="success" sx={{ mb: 3 }}>
                    {verificationResult.message}
                  </Alert>
                  
                  <Typography variant="h6" gutterBottom>
                    Thông tin tài liệu
                  </Typography>
                  
                  <Card variant="outlined" className={styles.documentVerify__documentCard}>
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="textSecondary">
                            Loại tài liệu
                          </Typography>
                          <Typography variant="body1" gutterBottom>
                            {documentTypes.find(d => d.value === verificationResult.document?.documentType)?.label}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="textSecondary">
                            Mã tài liệu
                          </Typography>
                          <Typography variant="body1" gutterBottom>
                            {verificationResult.document?.documentId}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="textSecondary">
                            Họ tên
                          </Typography>
                          <Typography variant="body1" gutterBottom>
                            {verificationResult.document?.issuedTo}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="textSecondary">
                            CMND/CCCD
                          </Typography>
                          <Typography variant="body1" gutterBottom>
                            {verificationResult.document?.citizenId}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="textSecondary">
                            Ngày cấp
                          </Typography>
                          <Typography variant="body1" gutterBottom>
                            {verificationResult.document?.issuedDate}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="textSecondary">
                            Ngày hết hạn
                          </Typography>
                          <Typography variant="body1" gutterBottom>
                            {verificationResult.document?.expiryDate || 'Không thời hạn'}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="textSecondary">
                            Cơ quan cấp
                          </Typography>
                          <Typography variant="body1" gutterBottom>
                            {verificationResult.document?.issuedBy}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="textSecondary">
                            Trạng thái
                          </Typography>
                          <Typography 
                            variant="body1" 
                            color={
                              verificationResult.document?.status === 'valid' 
                                ? 'success.main' 
                                : 'error.main'
                            }
                            gutterBottom
                          >
                            {verificationResult.document?.status === 'valid' ? 'Còn hiệu lực' : 
                              verificationResult.document?.status === 'expired' ? 'Đã hết hạn' : 'Đã thu hồi'}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12}>
                          <Divider sx={{ my: 1 }} />
                          <Typography variant="subtitle2" color="textSecondary">
                            Thông tin xác thực blockchain
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="textSecondary">
                            Thời gian xác thực
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            {verificationResult.document?.blockchainTimestamp}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="textSecondary">
                            Mã giao dịch blockchain
                          </Typography>
                          <Typography variant="body2" gutterBottom className={styles.documentVerify__txId}>
                            {verificationResult.document?.blockchainTxId}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <>
                  <Box className={styles.documentVerify__errorHeader}>
                    <InfoIcon color="error" fontSize="large" />
                    <Typography variant="h5" color="error" gutterBottom>
                      Không tìm thấy tài liệu
                    </Typography>
                  </Box>
                  
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {verificationResult.message}
                  </Alert>
                  
                  <Typography variant="body1" paragraph>
                    Không thể tìm thấy tài liệu với mã đã cung cấp. Vui lòng kiểm tra lại mã tài liệu hoặc liên hệ với cơ quan cấp tài liệu để được hỗ trợ.
                  </Typography>
                </>
              )}
              
              <Box className={styles.documentVerify__resultActions}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleReset}
                  startIcon={<SearchIcon />}
                >
                  Xác thực tài liệu khác
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
        
        {/* Information Cards */}
        <Grid container spacing={3} className={styles.documentVerify__infoSection}>
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom className={styles.documentVerify__infoTitle}>
              Hướng dẫn xác thực tài liệu
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card className={styles.documentVerify__infoCard}>
              <CardContent>
                <DocumentIcon color="primary" fontSize="large" className={styles.documentVerify__infoIcon} />
                <Typography variant="h6" gutterBottom>
                  Tìm mã tài liệu
                </Typography>
                <Typography variant="body2">
                  Mã tài liệu thường được in ở góc trên bên phải hoặc dưới dạng mã QR ở góc dưới bên trái của tài liệu hành chính.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card className={styles.documentVerify__infoCard}>
              <CardContent>
                <SearchIcon color="primary" fontSize="large" className={styles.documentVerify__infoIcon} />
                <Typography variant="h6" gutterBottom>
                  Nhập thông tin
                </Typography>
                <Typography variant="body2">
                  Nhập chính xác mã tài liệu và chọn loại tài liệu tương ứng. Hệ thống sẽ kiểm tra tính xác thực dựa trên blockchain.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card className={styles.documentVerify__infoCard}>
              <CardContent>
                <VerifiedUserIcon color="primary" fontSize="large" className={styles.documentVerify__infoIcon} />
                <Typography variant="h6" gutterBottom>
                  Kiểm tra kết quả
                </Typography>
                <Typography variant="body2">
                  Xem kết quả xác thực và thông tin chi tiết về tài liệu. Kết quả xác thực được đảm bảo bởi công nghệ blockchain.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default DocumentVerifyPage; 