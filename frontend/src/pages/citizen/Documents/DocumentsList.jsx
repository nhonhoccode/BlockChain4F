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
  useTheme
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
import { api } from '../../../utils/api';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

// Dữ liệu mẫu
const FALLBACK_DATA = [
  {
    id: 'DOC-2023-001',
    title: 'Giấy khai sinh',
    type: 'birth_certificate',
    issuedBy: 'UBND Quận Ba Đình',
    issuedDate: '2023-01-15T10:30:00Z',
    expiryDate: null,
    status: 'verified',
    blockchain: {
      isOnBlockchain: true,
      hash: '0x8f7d3c9a1b2e3f4d5e6f7a8b9c0d1e2f3a4b5c6d',
      timestamp: '2023-01-15T11:05:23Z'
    }
  },
  {
    id: 'DOC-2023-002',
    title: 'Giấy chứng nhận kết hôn',
    type: 'marriage_certificate',
    issuedBy: 'UBND Quận Hoàn Kiếm',
    issuedDate: '2023-02-14T09:15:00Z',
    expiryDate: null,
    status: 'verified',
    blockchain: {
      isOnBlockchain: true,
      hash: '0x7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d',
      timestamp: '2023-02-14T10:12:45Z'
    }
  },
  {
    id: 'DOC-2023-003',
    title: 'Căn cước công dân',
    type: 'identity_card',
    issuedBy: 'Cục Cảnh sát quản lý hành chính',
    issuedDate: '2023-03-20T14:25:00Z',
    expiryDate: '2033-03-20T14:25:00Z',
    status: 'verified',
    blockchain: {
      isOnBlockchain: true,
      hash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
      timestamp: '2023-03-20T15:30:12Z'
    }
  },
  {
    id: 'DOC-2023-004',
    title: 'Giấy phép lái xe',
    type: 'driving_license',
    issuedBy: 'Sở Giao thông Vận tải Hà Nội',
    issuedDate: '2023-04-05T11:10:00Z',
    expiryDate: '2033-04-05T11:10:00Z',
    status: 'verified',
    blockchain: {
      isOnBlockchain: true,
      hash: '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c',
      timestamp: '2023-04-05T12:05:33Z'
    }
  },
  {
    id: 'DOC-2023-005',
    title: 'Hộ chiếu',
    type: 'passport',
    issuedBy: 'Cục Quản lý Xuất nhập cảnh',
    issuedDate: '2023-05-12T09:45:00Z',
    expiryDate: '2033-05-12T09:45:00Z',
    status: 'verified',
    blockchain: {
      isOnBlockchain: true,
      hash: '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d',
      timestamp: '2023-05-12T10:30:15Z'
    }
  },
  {
    id: 'DOC-2023-006',
    title: 'Giấy chứng nhận quyền sử dụng đất',
    type: 'land_certificate',
    issuedBy: 'Sở Tài nguyên và Môi trường Hà Nội',
    issuedDate: '2023-06-18T13:20:00Z',
    expiryDate: null,
    status: 'pending_verification',
    blockchain: {
      isOnBlockchain: false,
      hash: null,
      timestamp: null
    }
  },
  {
    id: 'DOC-2023-007',
    title: 'Bằng tốt nghiệp Đại học',
    type: 'university_degree',
    issuedBy: 'Đại học Quốc gia Hà Nội',
    issuedDate: '2023-07-25T10:00:00Z',
    expiryDate: null,
    status: 'processing',
    blockchain: {
      isOnBlockchain: false,
      hash: null,
      timestamp: null
    }
  },
  {
    id: 'DOC-2023-008',
    title: 'Giấy khai tử',
    type: 'death_certificate',
    issuedBy: 'UBND Quận Tây Hồ',
    issuedDate: '2023-08-30T15:45:00Z',
    expiryDate: null,
    status: 'verified',
    blockchain: {
      isOnBlockchain: true,
      hash: '0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e',
      timestamp: '2023-08-30T16:20:45Z'
    }
  }
];

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
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await api.get('/api/v1/citizen/documents/');
        
        if (response.data && Array.isArray(response.data)) {
          setDocuments(response.data);
        } else {
          throw new Error('Invalid data format');
        }
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError('Không thể kết nối đến máy chủ. Đang hiển thị dữ liệu mẫu.');
        setDocuments(FALLBACK_DATA);
      } finally {
        setLoading(false);
      }
    };

    // Set timeout to use fallback data if API takes too long
    const timeoutId = setTimeout(() => {
      if (loading) {
        setDocuments(FALLBACK_DATA);
        setLoading(false);
        setError('Tải dữ liệu quá thời gian. Đang hiển thị dữ liệu mẫu.');
      }
    }, 3000);

    fetchDocuments();
    
    return () => clearTimeout(timeoutId);
  }, []);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'Không có';
    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy', { locale: vi });
    } catch (error) {
      return 'Không xác định';
    }
  };

  // Filter documents based on search and filters
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = searchTerm === '' || 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.issuedBy && doc.issuedBy.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || doc.type === filterType;
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

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
      {filteredDocuments.length === 0 ? (
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
          {filteredDocuments.map((document) => (
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
                  onClick={() => navigate(`/citizen/documents/${document.id}`)}
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
                    onClick={() => navigate(`/citizen/documents/${document.id}`)}
                  >
                    Xem
                  </Button>
                  <Button 
                    size="small" 
                    startIcon={<DownloadIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Download logic here
                    }}
                  >
                    Tải về
                  </Button>
                  <Button 
                    size="small" 
                    startIcon={<ShareIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Share logic here
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
    </Box>
  );
};

export default DocumentsList; 