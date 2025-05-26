import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Divider, 
  Chip, 
  TextField,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Alert,
  Pagination
} from '@mui/material';
import { 
  Description as DocumentIcon, 
  Search as SearchIcon,
  FilterList as FilterIcon,
  VerifiedUser as VerifiedUserIcon,
  AccessTime as TimeIcon,
  ErrorOutline as ErrorIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

// Import DocumentCard component
import DocumentCard from './DocumentCard';

// Import service
import citizenService from '../../../services/api/citizenService';

// Import formatDocumentType và mockDocuments từ trang chi tiết
import { formatDocumentType, mockDocuments } from './DocumentDetailPage';

// Helper function to format document type
// const formatDocumentType = (type) => { ... };

// Document types
const documentTypes = [
  { id: '', name: 'Tất cả loại giấy tờ' },
  { id: 'BIRTH_CERTIFICATE', name: 'Giấy khai sinh' },
  { id: 'CMND', name: 'Chứng minh nhân dân' },
  { id: 'CCCD', name: 'Căn cước công dân' },
  { id: 'MARRIAGE_CERTIFICATE', name: 'Chứng nhận hôn nhân' },
  { id: 'DEATH_CERTIFICATE', name: 'Giấy chứng tử' }
];

// Status options
const statusOptions = [
  { id: '', name: 'Tất cả trạng thái' },
  { id: 'VALID', name: 'Hợp lệ' },
  { id: 'EXPIRED', name: 'Hết hạn' },
  { id: 'REVOKED', name: 'Đã thu hồi' }
];

const DocumentsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0
  });
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDocumentType, setFilterDocumentType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  // Handle navigation to document detail
  const handleViewDocument = (documentId) => {
    if (!documentId || documentId === '' || documentId === 'undefined' || documentId === 'null') {
      console.error('Invalid document ID:', documentId);
      alert('Không thể xem chi tiết giấy tờ này. ID giấy tờ không hợp lệ.');
      return;
    }
    
    console.log('Navigating to document detail:', documentId);
    navigate(`/citizen/documents/${documentId}`);
  };
  
  // Handle page change
  const handlePageChange = (event, value) => {
    fetchDocuments({
      page: value,
      search: searchTerm,
      documentType: filterDocumentType,
      status: filterStatus
    });
  };
  
  // Handle search
  const handleSearch = (event) => {
    event.preventDefault();
    fetchDocuments({
      page: 1, // Reset to first page on new search
      search: searchTerm,
      documentType: filterDocumentType,
      status: filterStatus
    });
  };
  
  // Handle filter changes
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    
    if (name === 'documentType') {
      setFilterDocumentType(value);
    } else if (name === 'status') {
      setFilterStatus(value);
    }
    
    fetchDocuments({
      page: 1, // Reset to first page on filter change
      search: searchTerm,
      documentType: name === 'documentType' ? value : filterDocumentType,
      status: name === 'status' ? value : filterStatus
    });
  };
  
  // Fetch documents
  const fetchDocuments = async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      let data;
      try {
        // Thử gọi API thực
        const response = await citizenService.getDocuments(
          params.page || pagination.page,
          {
            search: params.search || searchTerm,
            document_type: params.documentType !== undefined ? params.documentType : filterDocumentType,
            status: params.status !== undefined ? params.status : filterStatus
          },
          {
            field: 'created_at',
            direction: 'desc'
          }
        );
        console.log('Documents received from API:', response);
        
        // Nếu API trả về kết quả, sử dụng nó
        if (response && response.results) {
          data = response.results;
          setPagination({
            ...pagination,
            page: params.page || pagination.page,
            totalItems: response.count || 0,
            totalPages: Math.ceil((response.count || 0) / pagination.pageSize)
          });
        } else {
          throw new Error('API không trả về kết quả hợp lệ');
        }
      } catch (apiError) {
        console.warn('Error fetching from real API, falling back to mock data:', apiError);
        
        // Nếu API thất bại, sử dụng mock data
        data = Object.values(mockDocuments).map(doc => ({
          id: doc.documentId,
          type: doc.documentType,
          title: formatDocumentType(doc.documentType),
          issuedAt: doc.issuedAt,
          expiresAt: doc.expiresAt,
          status: doc.status,
          issuedBy: doc.issuedBy
        }));
        
        console.log('Using mock data instead:', data);
        
        // Lọc dữ liệu mẫu theo các tham số
        if (params.search || searchTerm) {
          const searchValue = (params.search || searchTerm).toLowerCase();
          data = data.filter(doc => 
            doc.id.toLowerCase().includes(searchValue) || 
            formatDocumentType(doc.type).toLowerCase().includes(searchValue)
          );
        }
        
        if ((params.documentType !== undefined ? params.documentType : filterDocumentType) !== '') {
          const docType = params.documentType !== undefined ? params.documentType : filterDocumentType;
          data = data.filter(doc => doc.type === docType);
        }
        
        if ((params.status !== undefined ? params.status : filterStatus) !== '') {
          const statusValue = params.status !== undefined ? params.status : filterStatus;
          data = data.filter(doc => doc.status === statusValue);
        }
        
        // Cập nhật phân trang cho dữ liệu mẫu
        const pageSize = pagination.pageSize;
        const page = params.page || pagination.page;
        const totalItems = data.length;
        const totalPages = Math.ceil(totalItems / pageSize);
        
        setPagination({
          ...pagination,
          page: page,
          totalItems: totalItems,
          totalPages: totalPages
        });
        
        // Phân trang dữ liệu mẫu
        const startIndex = (page - 1) * pageSize;
        data = data.slice(startIndex, startIndex + pageSize);
      }

      setDocuments(data);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setError('Không thể tải danh sách giấy tờ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  // Initial data load
  useEffect(() => {
    fetchDocuments();
    
    // Kiểm tra xem API có được gọi không
    console.log('DocumentsPage mounted - Fetching documents...');
    
    // Để test, có thể tạm thời gọi API khác để kiểm tra kết nối
    const testApiConnection = async () => {
      try {
        const response = await citizenService.getRequests(1, {}, {});
        console.log('Test API connection successful:', response);
      } catch (error) {
        console.error('Test API connection failed:', error);
      }
    };
    
    testApiConnection();
  }, []);
  
  // Get status icon and color
  const getStatusInfo = (status) => {
    // Chuẩn hóa status thành chữ hoa để dễ so sánh
    const normalizedStatus = String(status).toUpperCase();
    
    switch (normalizedStatus) {
      case 'VALID':
      case 'ACTIVE':
      case 'VERIFIED':
      case 'APPROVED':
        return { icon: <VerifiedUserIcon />, color: 'success', label: 'Hợp lệ' };
        
      case 'EXPIRED':
      case 'OUTDATED':
        return { icon: <TimeIcon />, color: 'error', label: 'Hết hạn' };
        
      case 'REVOKED':
      case 'CANCELED':
      case 'CANCELLED':
      case 'INVALID':
        return { icon: <ErrorIcon />, color: 'error', label: 'Đã thu hồi' };
        
      case 'PENDING':
      case 'PROCESSING':
        return { icon: <TimeIcon />, color: 'warning', label: 'Đang xử lý' };
        
      default:
        console.log('Unknown document status:', status);
        return { icon: <VerifiedUserIcon />, color: 'default', label: status || 'Không xác định' };
    }
  };
  
  // Handle download document
  const handleDownloadDocument = async (documentId) => {
    try {
      console.log('Download requested for document ID:', documentId);
      await citizenService.downloadDocument(documentId);
      console.log('Download document successful');
    } catch (err) {
      console.error('Error downloading document:', err);
      setError('Có lỗi xảy ra khi tải xuống giấy tờ. Vui lòng thử lại sau.');
    }
  };
  
  // Handle print document
  const handlePrintDocument = async (documentId) => {
    try {
      console.log('Print requested for document ID:', documentId);
      await citizenService.printDocument(documentId);
      console.log('Print document successful');
    } catch (err) {
      console.error('Error printing document:', err);
      setError('Có lỗi xảy ra khi in giấy tờ. Vui lòng thử lại sau.');
    }
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Giấy tờ của tôi
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Quản lý và xem tất cả giấy tờ hành chính đã được cấp cho bạn
      </Typography>
      
      {/* Search and Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <form onSubmit={handleSearch}>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                label="Tìm kiếm giấy tờ"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                placeholder="Tìm theo mã hoặc loại giấy tờ"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="document-type-label">Loại giấy tờ</InputLabel>
                <Select
                  labelId="document-type-label"
                  name="documentType"
                  value={filterDocumentType}
                  onChange={handleFilterChange}
                  label="Loại giấy tờ"
                  startAdornment={
                    <InputAdornment position="start">
                      <FilterIcon />
                    </InputAdornment>
                  }
                >
                  {documentTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="status-label">Trạng thái</InputLabel>
                <Select
                  labelId="status-label"
                  name="status"
                  value={filterStatus}
                  onChange={handleFilterChange}
                  label="Trạng thái"
                  startAdornment={
                    <InputAdornment position="start">
                      <FilterIcon />
                    </InputAdornment>
                  }
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={1}>
              <Button 
                fullWidth 
                variant="contained" 
                type="submit"
                disabled={loading}
              >
                Tìm
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
      
      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Loading indicator */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {/* No results */}
      {!loading && documents.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Không tìm thấy giấy tờ nào
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Hãy điều chỉnh bộ lọc hoặc từ khóa tìm kiếm
          </Typography>
        </Paper>
      )}
      
      {/* Documents list */}
      {!loading && documents.length > 0 && (
        <>
          <Grid container spacing={3}>
            {documents.map((document) => {
              const statusInfo = getStatusInfo(document.status || 'VALID');
              const documentType = document.type || document.documentType || {};
              const documentId = document.id || document.documentId || null;
              if (!documentId || documentId === '' || documentId === 'undefined' || documentId === 'null') {
                console.warn('Skipping document with invalid ID:', document);
                return null;
              }
              
              const issuedAt = document.issuedAt || document.created_at || new Date();
              const expiresAt = document.expiresAt;
              const verificationCode = document.verification_code || document.verificationCode || '';
              
              return (
                <Grid item xs={12} sm={6} md={4} key={document.id || document.documentId}>
                  <DocumentCard 
                    document={document} 
                    onDownload={handleDownloadDocument}
                    onPrint={handlePrintDocument}
                  />
                </Grid>
              );
            })}
          </Grid>
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={pagination.totalPages} 
                page={pagination.page} 
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default DocumentsPage;
