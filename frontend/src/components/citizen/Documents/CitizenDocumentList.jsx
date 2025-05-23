import React, { useState, useEffect } from 'react';
import { 
  Container, Paper, Typography, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, TablePagination, 
  Chip, IconButton, Box, TextField, MenuItem, 
  CircularProgress, Grid, Tooltip, Card, CardContent,
  CardActions, Button, Divider, Alert
} from '@mui/material';
import { 
  Visibility, FilterList, Search, 
  CheckCircle, Warning, Block, Download,
  VerifiedUser, HourglassEmpty, Refresh
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import citizenService from '../../../services/api/citizenService';

// Status chip component
const StatusChip = ({ status }) => {
  const getStatusProps = (status) => {
    switch(status) {
      case 'active':
        return { label: 'Hiệu lực', color: 'success', icon: <CheckCircle fontSize="small" /> };
      case 'draft':
        return { label: 'Bản nháp', color: 'info', icon: <HourglassEmpty fontSize="small" /> };
      case 'expired':
        return { label: 'Hết hạn', color: 'warning', icon: <Warning fontSize="small" /> };
      case 'revoked':
        return { label: 'Thu hồi', color: 'error', icon: <Block fontSize="small" /> };
      default:
        return { label: status, color: 'default', icon: null };
    }
  };
  
  const { label, color, icon } = getStatusProps(status);
  
  return (
    <Chip 
      label={label} 
      color={color} 
      size="small" 
      icon={icon}
    />
  );
};

// Blockchain verification chip
const BlockchainChip = ({ verified }) => {
  return verified ? (
    <Chip 
      label="Đã xác thực" 
      color="success" 
      size="small" 
      icon={<VerifiedUser fontSize="small" />}
    />
  ) : (
    <Chip 
      label="Chưa xác thực" 
      color="default" 
      size="small"
    />
  );
};

const CitizenDocumentList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({
    status: '',
    document_type: '',
    search: ''
  });
  const [sort, setSort] = useState({
    field: 'created_at',
    direction: 'desc'
  });
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [error, setError] = useState(null);
  
  // Document type options
  const documentTypes = [
    { value: 'birth_certificate', label: 'Giấy khai sinh' },
    { value: 'id_card', label: 'Chứng minh nhân dân' },
    { value: 'residence_certificate', label: 'Đăng ký thường trú' },
    { value: 'marriage_certificate', label: 'Giấy đăng ký kết hôn' },
    { value: 'temporary_residence', label: 'Xác nhận tạm trú' },
    { value: 'death_certificate', label: 'Giấy chứng tử' }
  ];
  
  // Fetch documents with current pagination, filters, and sort
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await citizenService.getDocuments(
        page + 1, // API uses 1-based pagination
        { 
          ...filters,
          page_size: rowsPerPage
        }, 
        sort
      );
      
      setDocuments(response.results || []);
      setTotalCount(response.count || 0);
    } catch (error) {
      console.error('Lỗi khi tải danh sách giấy tờ:', error);
      setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch documents on mount and when dependencies change
  useEffect(() => {
    fetchDocuments();
  }, [page, rowsPerPage, filters, sort]);
  
  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Handle filter changes
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(0); // Reset to first page when filters change
  };
  
  // Handle search input
  const handleSearchChange = (event) => {
    const { value } = event.target;
    setFilters(prev => ({
      ...prev,
      search: value
    }));
    setPage(0); // Reset to first page when search changes
  };
  
  // Handle view document details
  const handleViewDocument = (documentId) => {
    navigate(`/citizen/documents/${documentId}`);
  };
  
  // Handle download document
  const handleDownloadDocument = async (documentId) => {
    try {
      const blob = await citizenService.downloadDocument(documentId);
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `document-${documentId}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Lỗi khi tải xuống giấy tờ:', error);
      alert('Không thể tải xuống giấy tờ. Vui lòng thử lại sau.');
    }
  };
  
  // Handle retry loading data
  const handleRetry = () => {
    fetchDocuments();
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric'
    });
  };
  
  // Get document type label
  const getDocumentTypeLabel = (type) => {
    const docType = documentTypes.find(dt => dt.value === type);
    return docType ? docType.label : type;
  };
  
  // Toggle view mode
  const toggleViewMode = () => {
    setViewMode(prev => prev === 'table' ? 'grid' : 'table');
  };
  
  // Render table view
  const renderTableView = () => (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mã giấy tờ</TableCell>
              <TableCell>Loại giấy tờ</TableCell>
              <TableCell>Ngày cấp</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Blockchain</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress size={30} />
                </TableCell>
              </TableRow>
            ) : documents.length > 0 ? (
              documents.map((document) => (
                <TableRow key={document.document_id}>
                  <TableCell>{document.document_id}</TableCell>
                  <TableCell>{getDocumentTypeLabel(document.document_type)}</TableCell>
                  <TableCell>{formatDate(document.issue_date)}</TableCell>
                  <TableCell>
                    <StatusChip status={document.status} />
                  </TableCell>
                  <TableCell>
                    <BlockchainChip verified={document.blockchain_status} />
                  </TableCell>
                  <TableCell align="center">
                    <Box>
                      <Tooltip title="Xem chi tiết">
                        <IconButton 
                          color="primary"
                          onClick={() => handleViewDocument(document.document_id)}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      {document.file_url && (
                        <Tooltip title="Tải xuống">
                          <IconButton 
                            color="secondary"
                            onClick={() => handleDownloadDocument(document.document_id)}
                          >
                            <Download />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography>Không có giấy tờ nào</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Số hàng mỗi trang:"
        labelDisplayedRows={({ from, to, count }) => 
          `${from}-${to} của ${count !== -1 ? count : `hơn ${to}`}`
        }
      />
    </Paper>
  );
  
  // Render grid view
  const renderGridView = () => (
    <>
      <Grid container spacing={3}>
        {loading ? (
          <Grid item xs={12} sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress />
          </Grid>
        ) : documents.length > 0 ? (
          documents.map((document) => (
            <Grid item xs={12} sm={6} md={4} key={document.document_id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {document.title}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {document.document_id}
                  </Typography>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Grid container spacing={1} sx={{ mt: 1 }}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Loại giấy tờ
                      </Typography>
                      <Typography variant="body2">
                        {getDocumentTypeLabel(document.document_type)}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Ngày cấp
                      </Typography>
                      <Typography variant="body2">
                        {formatDate(document.issue_date)}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Trạng thái
                      </Typography>
                      <Box>
                        <StatusChip status={document.status} />
                      </Box>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Blockchain
                      </Typography>
                      <Box>
                        <BlockchainChip verified={document.blockchain_status} />
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
                
                <CardActions>
                  <Button 
                    size="small" 
                    startIcon={<Visibility />}
                    onClick={() => handleViewDocument(document.document_id)}
                  >
                    Xem chi tiết
                  </Button>
                  
                  {document.file_url && (
                    <Button 
                      size="small" 
                      startIcon={<Download />}
                      onClick={() => handleDownloadDocument(document.document_id)}
                    >
                      Tải xuống
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12} sx={{ textAlign: 'center', py: 4 }}>
            <Typography>Không có giấy tờ nào</Typography>
          </Grid>
        )}
      </Grid>
      
      {/* Pagination */}
      <Paper sx={{ mt: 2 }}>
        <TablePagination
          rowsPerPageOptions={[6, 12, 24]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số hàng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} của ${count !== -1 ? count : `hơn ${to}`}`
          }
        />
      </Paper>
    </>
  );
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Giấy tờ của tôi
      </Typography>
      
      {/* Filters and search */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              name="status"
              label="Trạng thái"
              value={filters.status}
              onChange={handleFilterChange}
              size="small"
              InputProps={{
                startAdornment: <FilterList color="action" sx={{ mr: 1 }} />
              }}
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="active">Hiệu lực</MenuItem>
              <MenuItem value="draft">Bản nháp</MenuItem>
              <MenuItem value="expired">Hết hạn</MenuItem>
              <MenuItem value="revoked">Thu hồi</MenuItem>
            </TextField>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              name="document_type"
              label="Loại giấy tờ"
              value={filters.document_type}
              onChange={handleFilterChange}
              size="small"
              InputProps={{
                startAdornment: <FilterList color="action" sx={{ mr: 1 }} />
              }}
            >
              <MenuItem value="">Tất cả</MenuItem>
              {documentTypes.map(type => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              name="search"
              label="Tìm kiếm"
              value={filters.search}
              onChange={handleSearchChange}
              placeholder="Tìm theo mã giấy tờ, tiêu đề..."
              size="small"
              InputProps={{
                startAdornment: <Search color="action" sx={{ mr: 1 }} />
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={2} sx={{ textAlign: 'right' }}>
            <Button
              variant="outlined"
              onClick={toggleViewMode}
            >
              {viewMode === 'table' ? 'Xem dạng lưới' : 'Xem dạng bảng'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Error display */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            <Button 
              color="inherit" 
              size="small"
              startIcon={<Refresh />}
              onClick={handleRetry}
            >
              Thử lại
            </Button>
          }
        >
          {error}
        </Alert>
      )}
      
      {/* Document list */}
      {viewMode === 'table' ? renderTableView() : renderGridView()}
    </Container>
  );
};

export default CitizenDocumentList; 