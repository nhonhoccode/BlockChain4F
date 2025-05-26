import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  Chip,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress
} from '@mui/material';
import { 
  Search as SearchIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Assignment as DocumentIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Mock data - In a real app, this would come from an API
const MOCK_DOCUMENTS = [
  {
    id: 1,
    title: 'Giấy chứng nhận quyền sử dụng đất',
    documentNumber: 'LAND-2023-00154',
    issueDate: '2023-05-10',
    status: 'approved',
    category: 'land_certificate',
    blockchain: true
  },
  {
    id: 2,
    title: 'Giấy khai sinh',
    documentNumber: 'BC-2023-00932',
    issueDate: '2023-03-22',
    status: 'approved',
    category: 'birth_certificate',
    blockchain: true
  },
  {
    id: 3,
    title: 'Căn cước công dân',
    documentNumber: 'ID-2023-05673',
    issueDate: '2023-01-15',
    status: 'processing',
    category: 'id_card',
    blockchain: false
  },
  {
    id: 4,
    title: 'Đăng ký thường trú',
    documentNumber: 'RES-2023-01209',
    issueDate: '2023-04-05',
    status: 'approved',
    category: 'residence',
    blockchain: true
  },
  {
    id: 5,
    title: 'Giấy phép kinh doanh',
    documentNumber: 'BL-2023-00421',
    issueDate: '2023-06-18',
    status: 'pending',
    category: 'business_license',
    blockchain: false
  }
];

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

const DocumentList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    // In a real app, this would be an API call
    const fetchDocuments = async () => {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setDocuments(MOCK_DOCUMENTS);
      } catch (error) {
        console.error('Error fetching documents:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocuments();
  }, []);
  
  const filteredDocuments = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.documentNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleViewDocument = (id) => {
    navigate(`/citizen/documents/${id}`);
  };
  
  const handleDownloadDocument = (id) => {
    // In a real app, this would download the document
    console.log(`Downloading document ID: ${id}`);
    alert('Downloading document...');
  };
  
  return (
    <Box sx={{ py: 3, px: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Tài liệu của tôi
      </Typography>
      
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TextField
          placeholder="Tìm kiếm tài liệu..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
          sx={{ width: { xs: '100%', sm: '50%', md: '35%' } }}
        />
        
        <Box>
          <IconButton>
            <FilterIcon />
          </IconButton>
        </Box>
      </Box>
      
      <Paper elevation={1}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress />
            <Typography variant="body1" sx={{ ml: 2 }}>
              Đang tải tài liệu...
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Tiêu đề</TableCell>
                    <TableCell>Số tài liệu</TableCell>
                    <TableCell>Ngày cấp</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell>Loại</TableCell>
                    <TableCell>Blockchain</TableCell>
                    <TableCell align="right">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredDocuments
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((doc) => (
                      <TableRow key={doc.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <DocumentIcon sx={{ mr: 1, color: 'primary.main' }} />
                            {doc.title}
                          </Box>
                        </TableCell>
                        <TableCell>{doc.documentNumber}</TableCell>
                        <TableCell>{doc.issueDate}</TableCell>
                        <TableCell>
                          <Chip
                            label={STATUS_MAP[doc.status]?.label || doc.status}
                            color={STATUS_MAP[doc.status]?.color || 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {CATEGORY_MAP[doc.category] || doc.category}
                        </TableCell>
                        <TableCell>
                          {doc.blockchain ? (
                            <Chip 
                              label="Blockchain"
                              color="primary" 
                              variant="outlined"
                              size="small"
                            />
                          ) : (
                            <Typography variant="body2" color="textSecondary">
                              -
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            startIcon={<ViewIcon />}
                            size="small"
                            onClick={() => handleViewDocument(doc.id)}
                            sx={{ mr: 1 }}
                          >
                            Xem
                          </Button>
                          {doc.status === 'approved' && (
                            <Button
                              startIcon={<DownloadIcon />}
                              size="small"
                              onClick={() => handleDownloadDocument(doc.id)}
                            >
                              Tải xuống
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  
                  {filteredDocuments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                        <Typography variant="body1" color="textSecondary">
                          Không tìm thấy tài liệu nào
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredDocuments.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Số hàng mỗi trang:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
            />
          </>
        )}
      </Paper>
    </Box>
  );
};

export default DocumentList; 