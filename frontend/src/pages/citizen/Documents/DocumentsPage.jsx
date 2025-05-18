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
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

// Mock service - would be replaced with actual API
import { getCitizenDocuments } from '../../../services/api/citizenService';

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

// Document types
const documentTypes = [
  { id: '', name: 'Tất cả loại giấy tờ' },
  { id: 'GIẤY_KHAI_SINH', name: 'Giấy khai sinh' },
  { id: 'CHỨNG_MINH_NHÂN_DÂN', name: 'Chứng minh nhân dân' },
  { id: 'SỔ_HỘ_KHẨU', name: 'Sổ hộ khẩu' },
  { id: 'XÁC_NHẬN_THƯỜNG_TRÚ', name: 'Xác nhận thường trú' },
  { id: 'CHỨNG_NHẬN_HÔN_NHÂN', name: 'Chứng nhận hôn nhân' },
  { id: 'GIẤY_CHỨNG_TỬ', name: 'Giấy chứng tử' }
];

// Status options
const statusOptions = [
  { id: '', name: 'Tất cả trạng thái' },
  { id: 'VALID', name: 'Hợp lệ' },
  { id: 'EXPIRED', name: 'Hết hạn' },
  { id: 'REVOKED', name: 'Đã thu hồi' }
];

// Mock data for documents
const mockDocuments = [
  {
    documentId: 'DOC001',
    documentType: 'GIẤY_KHAI_SINH',
    status: 'VALID',
    issuedAt: '2023-06-16T14:20:00Z',
    expiresAt: null,
    verificationCode: 'ABC123'
  },
  {
    documentId: 'DOC002',
    documentType: 'CHỨNG_MINH_NHÂN_DÂN',
    status: 'VALID',
    issuedAt: '2022-05-10T09:15:00Z',
    expiresAt: '2032-05-10T09:15:00Z',
    verificationCode: 'DEF456'
  },
  {
    documentId: 'DOC003',
    documentType: 'SỔ_HỘ_KHẨU',
    status: 'VALID',
    issuedAt: '2021-11-23T10:40:00Z',
    expiresAt: null,
    verificationCode: 'GHI789'
  },
  {
    documentId: 'DOC004',
    documentType: 'XÁC_NHẬN_THƯỜNG_TRÚ',
    status: 'EXPIRED',
    issuedAt: '2020-03-15T11:30:00Z',
    expiresAt: '2022-03-15T11:30:00Z',
    verificationCode: 'JKL012'
  },
  {
    documentId: 'DOC005',
    documentType: 'CHỨNG_NHẬN_HÔN_NHÂN',
    status: 'VALID',
    issuedAt: '2022-12-05T13:45:00Z',
    expiresAt: null,
    verificationCode: 'MNO345'
  },
  {
    documentId: 'DOC006',
    documentType: 'CHỨNG_MINH_NHÂN_DÂN',
    status: 'REVOKED',
    issuedAt: '2010-07-20T09:00:00Z',
    expiresAt: '2020-07-20T09:00:00Z',
    verificationCode: 'PQR678',
    revokedAt: '2018-10-15T14:30:00Z',
    revokedReason: 'Thay thế bằng CCCD mới'
  }
];

// Mock fetch documents
const mockFetchDocuments = (params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Filter based on params
      let filteredDocs = [...mockDocuments];
      
      if (params.search) {
        const searchTerm = params.search.toLowerCase();
        filteredDocs = filteredDocs.filter(doc => 
          doc.documentId.toLowerCase().includes(searchTerm) || 
          formatDocumentType(doc.documentType).toLowerCase().includes(searchTerm)
        );
      }
      
      if (params.documentType) {
        filteredDocs = filteredDocs.filter(doc => doc.documentType === params.documentType);
      }
      
      if (params.status) {
        filteredDocs = filteredDocs.filter(doc => doc.status === params.status);
      }
      
      // Sort by issued date (newest first)
      filteredDocs.sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt));
      
      // Paginate
      const page = params.page || 1;
      const pageSize = params.pageSize || 10;
      const totalItems = filteredDocs.length;
      const totalPages = Math.ceil(totalItems / pageSize);
      const startIndex = (page - 1) * pageSize;
      const paginatedDocs = filteredDocs.slice(startIndex, startIndex + pageSize);
      
      resolve({
        documents: paginatedDocs,
        pagination: {
          page,
          pageSize,
          totalItems,
          totalPages
        }
      });
    }, 800);
  });
};

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
      // In a real app, we would call the real API
      // const data = await getCitizenDocuments(params);
      
      // Using mock data for now
      const data = await mockFetchDocuments({
        page: params.page || pagination.page,
        pageSize: pagination.pageSize,
        search: params.search || searchTerm,
        documentType: params.documentType !== undefined ? params.documentType : filterDocumentType,
        status: params.status !== undefined ? params.status : filterStatus
      });
      
      setDocuments(data.documents);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Có lỗi xảy ra khi tải danh sách giấy tờ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  // Initial fetch
  useEffect(() => {
    fetchDocuments();
  }, []);
  
  // Get status icon and color
  const getStatusInfo = (status) => {
    switch (status) {
      case 'VALID':
        return { icon: <VerifiedUserIcon />, color: 'success', label: 'Hợp lệ' };
      case 'EXPIRED':
        return { icon: <TimeIcon />, color: 'error', label: 'Hết hạn' };
      case 'REVOKED':
        return { icon: <ErrorIcon />, color: 'error', label: 'Đã thu hồi' };
      default:
        return { icon: <VerifiedUserIcon />, color: 'default', label: status };
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
              const statusInfo = getStatusInfo(document.status);
              
              return (
                <Grid item xs={12} md={6} key={document.documentId}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      height: '100%',
                      transition: 'all 0.2s',
                      '&:hover': { 
                        boxShadow: 3,
                        cursor: 'pointer'
                      }
                    }}
                    onClick={() => handleViewDocument(document.documentId)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <DocumentIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                          <Box>
                            <Typography variant="h6" component="div">
                              {formatDocumentType(document.documentType)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Mã: {document.documentId}
                            </Typography>
                          </Box>
                        </Box>
                        <Chip 
                          icon={statusInfo.icon}
                          label={statusInfo.label} 
                          color={statusInfo.color} 
                          size="small"
                        />
                      </Box>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Ngày cấp
                          </Typography>
                          <Typography variant="body1">
                            {format(new Date(document.issuedAt), 'dd/MM/yyyy', { locale: vi })}
                          </Typography>
                        </Grid>
                        
                        {document.expiresAt && (
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Ngày hết hạn
                            </Typography>
                            <Typography variant="body1">
                              {format(new Date(document.expiresAt), 'dd/MM/yyyy', { locale: vi })}
                            </Typography>
                          </Grid>
                        )}
                        
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">
                            Mã xác thực
                          </Typography>
                          <Typography variant="body1">
                            {document.verificationCode}
                          </Typography>
                        </Grid>
                      </Grid>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button
                          size="small"
                          startIcon={<ViewIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDocument(document.documentId);
                          }}
                        >
                          Xem chi tiết
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
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
