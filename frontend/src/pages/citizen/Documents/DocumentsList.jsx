import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Button,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  Pagination
} from '@mui/material';
import {
  Description as DocumentIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  VerifiedUser as VerifiedIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import citizenService from '../../../services/api/citizenService';

// Định nghĩa các loại giấy tờ
const DOCUMENT_TYPES = {
  birth_certificate: { label: 'Giấy khai sinh', color: 'primary' },
  marriage_certificate: { label: 'Giấy chứng nhận kết hôn', color: 'secondary' },
  identity_card: { label: 'Căn cước công dân', color: 'info' },
  driving_license: { label: 'Giấy phép lái xe', color: 'success' },
  passport: { label: 'Hộ chiếu', color: 'warning' },
  land_certificate: { label: 'Giấy chứng nhận quyền sử dụng đất', color: 'primary' },
  university_degree: { label: 'Bằng đại học', color: 'info' },
  death_certificate: { label: 'Giấy khai tử', color: 'error' },
  business_license: { label: 'Giấy phép kinh doanh', color: 'success' },
  other: { label: 'Khác', color: 'default' }
};

// Định nghĩa các trạng thái giấy tờ
const DOCUMENT_STATUS = {
  verified: { label: 'Đã xác thực', color: 'success', icon: <VerifiedIcon /> },
  pending_verification: { label: 'Chờ xác thực', color: 'warning', icon: null },
  processing: { label: 'Đang xử lý', color: 'info', icon: null },
  expired: { label: 'Hết hạn', color: 'error', icon: null },
  revoked: { label: 'Đã thu hồi', color: 'error', icon: null }
};

const DocumentsList = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    processing: 0
  });

  // Load documents from API
  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters = {};
      if (filterType !== 'all') {
        filters.type = filterType;
      }
      if (filterStatus !== 'all') {
        filters.status = filterStatus;
      }
      if (searchTerm) {
        filters.search = searchTerm;
      }

      const response = await citizenService.getDocuments(page, filters);
        setDocuments(response.results || []);
      setTotalPages(Math.ceil((response.count || 0) / 10));
      
      // Update statistics
      const totalDocs = response.results || [];
      setStats({
        total: totalDocs.length,
        verified: totalDocs.filter(doc => doc.status === 'verified').length,
        pending: totalDocs.filter(doc => doc.status === 'pending_verification').length,
        processing: totalDocs.filter(doc => doc.status === 'processing').length
      });

    } catch (err) {
      console.error('Error loading documents:', err);
      setError('Không thể tải danh sách giấy tờ. Vui lòng thử lại sau.');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [page, searchTerm, filterType, filterStatus]);
  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'Không có';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return 'Không xác định';
    }
  };

  // Get unique document types from the data
  const uniqueTypes = [...new Set(documents.map(doc => doc.type))];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Tiêu đề trang */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Giấy tờ của tôi
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/citizen/requests/new')}
        >
          Yêu cầu giấy tờ mới
        </Button>
      </Box>

      {/* Hiển thị lỗi nếu có */}
      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Thống kê */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                {stats.total}
              </Typography>
              <Typography variant="body2">
                Tổng số giấy tờ
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                {stats.verified}
              </Typography>
              <Typography variant="body2">
                Đã xác thực
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                {stats.pending}
              </Typography>
              <Typography variant="body2">
                Chờ xác thực
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'info.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                {stats.processing}
              </Typography>
              <Typography variant="body2">
                Đang xử lý
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bộ lọc và tìm kiếm */}
      <Paper elevation={1} sx={{ p: 2, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm giấy tờ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="filter-type-label">Loại giấy tờ</InputLabel>
              <Select
                labelId="filter-type-label"
                value={filterType}
                label="Loại giấy tờ"
                onChange={(e) => setFilterType(e.target.value)}
                startAdornment={
                  <InputAdornment position="start">
                    <FilterIcon fontSize="small" />
                  </InputAdornment>
                }
              >
                <MenuItem value="all">Tất cả loại</MenuItem>
                {uniqueTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {DOCUMENT_TYPES[type]?.label || type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="filter-status-label">Trạng thái</InputLabel>
              <Select
                labelId="filter-status-label"
                value={filterStatus}
                label="Trạng thái"
                onChange={(e) => setFilterStatus(e.target.value)}
                startAdornment={
                  <InputAdornment position="start">
                    <FilterIcon fontSize="small" />
                  </InputAdornment>
                }
              >
                <MenuItem value="all">Tất cả trạng thái</MenuItem>
                {Object.keys(DOCUMENT_STATUS).map((status) => (
                  <MenuItem key={status} value={status}>
                    {DOCUMENT_STATUS[status].label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Danh sách giấy tờ */}
      {documents.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <DocumentIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Không tìm thấy giấy tờ nào
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Hãy thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {documents.map((document) => (
            <Grid item xs={12} sm={6} md={4} key={document.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  borderRadius: 2,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  }
                }}
              >
                <CardActionArea 
                  sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                  onClick={() => {
                    console.log('Document card clicked:', document);
                    
                    // Lấy ID từ document theo thứ tự ưu tiên
                    const documentId = document?.id;
                    
                    // Kiểm tra tính hợp lệ của ID một cách nghiêm ngặt
                    if (documentId && typeof documentId === 'string' && documentId.trim() !== '' && 
                        documentId !== 'undefined' && documentId !== 'null') {
                      
                      // Log chi tiết về URL và dữ liệu document
                      console.log('Document ID for navigation:', documentId);
                      console.log('Document data being passed:', document);
                      
                      // URL đích
                      const targetUrl = `/citizen/documents/${documentId}`;
                      console.log('Navigating to URL:', targetUrl);
                      
                      // Sử dụng state để truyền dữ liệu document sang trang chi tiết
                      navigate(targetUrl, { 
                        state: { documentData: document }
                      });
                      
                      console.log('Navigation completed');
                    } else {
                      // Xử lý ID không hợp lệ
                      console.error('Invalid document ID. Document object:', document);
                      console.error('document?.id value:', documentId);
                      console.error('typeof document?.id:', typeof documentId);
                      
                      alert('ID giấy tờ không hợp lệ. Vui lòng thử lại hoặc liên hệ quản trị viên.');
                    }
                  }}
                >
                  <Box 
                    sx={{ 
                      p: 2, 
                      bgcolor: theme.palette[DOCUMENT_TYPES[document.type]?.color || 'primary'].main,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <DocumentIcon />
                    <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                      {DOCUMENT_TYPES[document.type]?.label || document.type}
                    </Typography>
                  </Box>
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" gutterBottom component="div">
                      {document.title}
                    </Typography>
                    
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="caption" color="text.secondary" component="div">
                        Mã giấy tờ
                      </Typography>
                      <Typography variant="body2" component="div">
                        {document.id}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="caption" color="text.secondary" component="div">
                        Đơn vị cấp
                      </Typography>
                      <Typography variant="body2" component="div">
                        {document.issuedBy || 'Không có thông tin'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 2, mb: 1.5 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" component="div">
                          Ngày cấp
                        </Typography>
                        <Typography variant="body2" component="div">
                          {formatDate(document.issuedDate)}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="caption" color="text.secondary" component="div">
                          Ngày hết hạn
                        </Typography>
                        <Typography variant="body2" component="div">
                          {formatDate(document.expiryDate)}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip
                        icon={DOCUMENT_STATUS[document.status]?.icon}
                        label={DOCUMENT_STATUS[document.status]?.label || document.status}
                        color={DOCUMENT_STATUS[document.status]?.color || 'default'}
                        size="small"
                        variant="outlined"
                      />
                      
                      {document.blockchain?.isOnBlockchain && (
                        <Chip
                          label="Blockchain"
                          color="primary"
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </CardContent>
                </CardActionArea>
                
                <Divider />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-around', p: 1 }}>
                  <Button 
                    size="small" 
                    startIcon={<ViewIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Log chi tiết thông tin document
                      console.log('View button clicked for document:', document);
                      
                      // Lấy ID từ document theo thứ tự ưu tiên
                      const documentId = document?.id;
                      
                      // Kiểm tra tính hợp lệ của ID một cách nghiêm ngặt
                      if (documentId && typeof documentId === 'string' && documentId.trim() !== '' && 
                          documentId !== 'undefined' && documentId !== 'null') {
                        
                        // Log chi tiết về URL và dữ liệu document
                        console.log('Document ID for navigation:', documentId);
                        console.log('Document data being passed:', document);
                        
                        // URL đích
                        const targetUrl = `/citizen/documents/${documentId}`;
                        console.log('Navigating to URL:', targetUrl);
                        
                        // Sử dụng state để truyền dữ liệu document sang trang chi tiết
                        navigate(targetUrl, { 
                          state: { documentData: document }
                        });
                        
                        console.log('Navigation completed');
                      } else {
                        // Xử lý ID không hợp lệ
                        console.error('Invalid document ID. Document object:', document);
                        console.error('document?.id value:', documentId);
                        console.error('typeof document?.id:', typeof documentId);
                        
                        alert('ID giấy tờ không hợp lệ. Vui lòng thử lại hoặc liên hệ quản trị viên.');
                      }
                    }}
                  >
                    Xem
                  </Button>
                  <Button 
                    size="small" 
                    startIcon={<DownloadIcon />}
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        await citizenService.downloadDocument(document.id);
                      } catch (error) {
                        console.error('Error downloading document:', error);
                      }
                    }}
                  >
                    Tải về
                  </Button>
                  <Button 
                    size="small" 
                    startIcon={<ShareIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Share logic will be implemented when API is available
                      console.log('Share document:', document.id);
                    }}
                  >
                    Chia sẻ
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(event, newPage) => setPage(newPage)}
            color="primary"
            size="large"
          />
        </Box>
      )}
    </Box>
  );
};

export default DocumentsList;