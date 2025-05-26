import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Chip,
  Button,
  Divider,
  IconButton,
  CircularProgress,
  Card,
  CardContent,
  Alert,
  Tooltip
} from '@mui/material';
import { 
  ArrowBack as BackIcon,
  Download as DownloadIcon,
  Verified as VerifiedIcon,
  Print as PrintIcon,
  History as HistoryIcon,
  QrCode as QrCodeIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';

// Mock document data - In a real app, this would come from an API
const MOCK_DOCUMENT = {
  id: 1,
  title: 'Giấy chứng nhận quyền sử dụng đất',
  documentNumber: 'LAND-2023-00154',
  issueDate: '2023-05-10',
  expiryDate: '2033-05-10',
  status: 'approved',
  category: 'land_certificate',
  blockchain: true,
  blockchainId: '0x7a2d2d3e4f5g6h7i8j9k0l1m2n3o4p5q6r7s8t9u0v',
  issuedBy: 'Sở Tài nguyên và Môi trường TP. Hồ Chí Minh',
  owner: 'Nguyễn Văn A',
  ownerIdNumber: '079123456789',
  propertyAddress: '123 Đường ABC, Phường XYZ, Quận 1, TP. Hồ Chí Minh',
  propertyArea: '120m²',
  propertyType: 'Đất ở',
  transactionHistory: [
    { 
      date: '2023-05-10T08:30:00Z', 
      action: 'ISSUED', 
      by: 'Nguyễn Văn X', 
      role: 'Cán bộ Sở TN&MT', 
      notes: 'Cấp mới giấy chứng nhận' 
    },
    { 
      date: '2023-05-09T14:15:00Z', 
      action: 'VERIFIED', 
      by: 'Trần Thị Y', 
      role: 'Trưởng phòng TN&MT', 
      notes: 'Đã xác minh thông tin' 
    },
    { 
      date: '2023-05-08T10:45:00Z', 
      action: 'PROCESSED', 
      by: 'Lê Văn Z', 
      role: 'Cán bộ địa chính', 
      notes: 'Đã xử lý hồ sơ' 
    }
  ],
  attachments: [
    { name: 'land_certificate_1.pdf', type: 'application/pdf', size: 2500000 },
    { name: 'land_map.jpg', type: 'image/jpeg', size: 1800000 },
    { name: 'application_form.pdf', type: 'application/pdf', size: 850000 }
  ]
};

// Status mapping for UI display
const STATUS_MAP = {
  approved: { label: 'Đã phê duyệt', color: 'success' },
  pending: { label: 'Đang chờ', color: 'warning' },
  rejected: { label: 'Từ chối', color: 'error' },
  processing: { label: 'Đang xử lý', color: 'info' }
};

// Category mapping for UI display
const CATEGORY_MAP = {
  birth_certificate: 'Giấy khai sinh',
  residence: 'Đăng ký thường trú',
  business_license: 'Giấy phép kinh doanh',
  id_card: 'CCCD',
  marriage_certificate: 'Giấy đăng ký kết hôn',
  land_certificate: 'Giấy chứng nhận quyền sử dụng đất'
};

const DocumentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [document, setDocument] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  
  useEffect(() => {
    // In a real app, this would be an API call
    const fetchDocumentDetail = async () => {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In a real app, we would fetch the specific document by ID
        setDocument(MOCK_DOCUMENT);
      } catch (error) {
        console.error('Error fetching document:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocumentDetail();
  }, [id]);
  
  const handleDownload = () => {
    // In a real app, this would download the document
    console.log(`Downloading document ID: ${id}`);
    alert('Downloading document...');
  };
  
  const handlePrint = () => {
    // In a real app, this would open the print dialog
    window.print();
  };
  
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Đang tải thông tin tài liệu...
        </Typography>
      </Box>
    );
  }
  
  if (!document) {
    return (
      <Box sx={{ py: 3, px: 2 }}>
        <IconButton onClick={() => navigate('/citizen/documents')} sx={{ mb: 2 }}>
          <BackIcon />
        </IconButton>
        
        <Alert severity="error">
          Không tìm thấy tài liệu với ID: {id}
        </Alert>
      </Box>
    );
  }
  
  return (
    <Box sx={{ py: 3, px: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/citizen/documents')} sx={{ mr: 2 }}>
          <BackIcon />
        </IconButton>
        
        <Typography variant="h4" component="h1">
          Chi tiết tài liệu
        </Typography>
      </Box>
      
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h5" gutterBottom>
              {document.title}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="textSecondary" sx={{ mr: 1 }}>
                Số tài liệu: {document.documentNumber}
              </Typography>
              
              <Chip
                label={STATUS_MAP[document.status]?.label || document.status}
                color={STATUS_MAP[document.status]?.color || 'default'}
                size="small"
                sx={{ ml: 1 }}
              />
            </Box>
            
            <Typography variant="body2" color="textSecondary">
              Loại: {CATEGORY_MAP[document.category] || document.category}
            </Typography>
          </Box>
          
          <Box>
            {document.blockchain && (
              <Tooltip title="Tài liệu này đã được xác thực trên blockchain">
                <Chip
                  icon={<VerifiedIcon />}
                  label="Đã xác thực trên Blockchain"
                  color="primary"
                  sx={{ mb: 1 }}
                />
              </Tooltip>
            )}
            
            <Box sx={{ display: 'flex', mt: 1 }}>
              <Button
                variant="outlined"
                startIcon={<PrintIcon />}
                onClick={handlePrint}
                sx={{ mr: 1 }}
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
          </Box>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Thông tin tài liệu
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Ngày cấp
                  </Typography>
                  <Typography variant="body1">
                    {document.issueDate}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Ngày hết hạn
                  </Typography>
                  <Typography variant="body1">
                    {document.expiryDate || 'Không có thời hạn'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">
                    Cơ quan cấp
                  </Typography>
                  <Typography variant="body1">
                    {document.issuedBy}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Chủ sở hữu
                  </Typography>
                  <Typography variant="body1">
                    {document.owner}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Số CCCD
                  </Typography>
                  <Typography variant="body1">
                    {document.ownerIdNumber}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
            
            {document.category === 'land_certificate' && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Thông tin bất động sản
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      Địa chỉ
                    </Typography>
                    <Typography variant="body1">
                      {document.propertyAddress}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">
                      Diện tích
                    </Typography>
                    <Typography variant="body1">
                      {document.propertyArea}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">
                      Loại đất
                    </Typography>
                    <Typography variant="body1">
                      {document.propertyType}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Tài liệu đính kèm
              </Typography>
              
              <Button
                startIcon={<QrCodeIcon />}
                variant="outlined"
                size="small"
              >
                Mã QR xác thực
              </Button>
            </Box>
            
            {document.attachments.map((attachment, index) => (
              <Card 
                key={index} 
                variant="outlined" 
                sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1 }}
              >
                <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                  <Typography variant="body1">
                    {attachment.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {formatBytes(attachment.size)}
                  </Typography>
                </CardContent>
                
                <Button 
                  startIcon={<DownloadIcon />}
                  size="small"
                  sx={{ mr: 1 }}
                >
                  Tải xuống
                </Button>
              </Card>
            ))}
            
            {document.blockchain && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Thông tin Blockchain
                </Typography>
                
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  ID trên Blockchain
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    wordBreak: 'break-all', 
                    p: 1, 
                    bgcolor: 'grey.100', 
                    borderRadius: 1,
                    fontFamily: 'monospace'
                  }}
                >
                  {document.blockchainId}
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Lịch sử giao dịch
            </Typography>
            
            <Button
              startIcon={<HistoryIcon />}
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? 'Ẩn lịch sử' : 'Xem lịch sử'}
            </Button>
          </Box>
          
          {showHistory && document.transactionHistory && (
            <Box>
              {document.transactionHistory.map((transaction, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    p: 2, 
                    mb: 2, 
                    border: '1px solid', 
                    borderColor: 'divider', 
                    borderRadius: 1,
                    position: 'relative'
                  }}
                >
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      left: 15, 
                      top: 0, 
                      height: '100%', 
                      borderLeft: '2px dashed', 
                      borderColor: 'primary.main',
                      display: index < document.transactionHistory.length - 1 ? 'block' : 'none'
                    }} 
                  />
                  
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Box 
                      sx={{ 
                        width: 10, 
                        height: 10, 
                        borderRadius: '50%', 
                        bgcolor: 'primary.main', 
                        mr: 2,
                        mt: 1
                      }} 
                    />
                    
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" fontWeight="bold">
                        {transaction.action === 'ISSUED' ? 'Cấp tài liệu' : 
                          transaction.action === 'VERIFIED' ? 'Xác minh tài liệu' : 
                          transaction.action === 'PROCESSED' ? 'Xử lý hồ sơ' : 
                          transaction.action}
                      </Typography>
                      
                      <Typography variant="body2" color="textSecondary">
                        {formatDate(transaction.date)}
                      </Typography>
                      
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2">
                          <strong>{transaction.by}</strong> ({transaction.role})
                        </Typography>
                        
                        <Typography variant="body2">
                          {transaction.notes}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default DocumentDetail; 