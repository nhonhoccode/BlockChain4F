import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Avatar,
  Button,
  Card,
  CardContent,
  Chip,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  Person as PersonIcon,
  Home as HomeIcon,
  VerifiedUser as VerifiedIcon,
  CreditCard as IdCardIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Edit as EditIcon,
  Description as DocumentIcon,
  Assignment as RequestIcon,
  ArrowBack as ArrowBackIcon,
  DownloadForOffline as DownloadIcon,
  Visibility as ViewIcon,
  CloudDownload,
  VerifiedUser,
  Visibility
} from '@mui/icons-material';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import officerService from '../../../services/api/officerService';
import { useTranslation } from 'react-i18next';

// TabPanel component for tabs
const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const CitizenDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { t } = useTranslation();
  
  // State variables
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [citizen, setCitizen] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    
    // Load data for the selected tab if not already loaded
    if (newValue === 1 && documents.length === 0) {
      fetchCitizenDocuments();
    } else if (newValue === 2 && requests.length === 0) {
      fetchCitizenRequests();
    }
  };
  
  // Fetch citizen data
  const fetchCitizenData = async () => {
    try {
      setLoading(true);
      const data = await officerService.getCitizenDetail(id);
      setCitizen(data);
    } catch (error) {
      console.error(`Error fetching citizen detail for ID ${id}:`, error);
      setError(`Không thể tải thông tin công dân. ${error.message || 'Vui lòng thử lại sau.'}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch citizen documents
  const fetchCitizenDocuments = async () => {
    try {
      setLoadingDocuments(true);
      const data = await officerService.getCitizenDocuments(id);
      setDocuments(data);
    } catch (error) {
      console.error(`Error fetching documents for citizen ID ${id}:`, error);
      // Don't set top-level error, just show an error in the tab
    } finally {
      setLoadingDocuments(false);
    }
  };
  
  // Fetch citizen requests
  const fetchCitizenRequests = async () => {
    try {
      setLoadingRequests(true);
      const data = await officerService.getCitizenRequests(id);
      setRequests(data);
    } catch (error) {
      console.error(`Error fetching requests for citizen ID ${id}:`, error);
      // Don't set top-level error, just show an error in the tab
    } finally {
      setLoadingRequests(false);
    }
  };
  
  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'Không xác định';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Không xác định';
      }
      return format(date, 'dd/MM/yyyy', { locale: vi });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Không xác định';
    }
  };
  
  // Handle edit button click
  const handleEdit = () => {
    navigate(`/officer/citizens/${id}/edit`);
  };
  
  // Handle view document button click
  const handleViewDocument = (documentId) => {
    console.log('Navigating to document detail page:', documentId);
    // Navigate to the document detail page
    navigate(`/officer/documents/${documentId}`);
  };
  
  // Handle view request button click
  const handleViewRequest = (requestId) => {
    // Navigate to request detail page or open in modal
    navigate(`/officer/process-request/${requestId}`);
  };
  
  // Handle back button click
  const handleBack = () => {
    navigate('/officer/citizens');
  };
  
  // Handle export documents
  const handleExportDocuments = () => {
    if (!documents || documents.length === 0) {
      return;
    }
    
    try {
      // Create CSV content
      const headers = [
        'STT',
        'Tiêu đề',
        'Loại giấy tờ',
        'Số giấy tờ',
        'Ngày cấp',
        'Ngày hết hạn',
        'Trạng thái',
        'Người tạo',
        'Ngày tạo'
      ];
      
      let csvContent = headers.join(',') + '\n';
      
      documents.forEach((doc, index) => {
        const status = doc.status === 'issued' ? 'Đã cấp' : 'Đang xử lý';
        const issuedDate = doc.issued_date ? formatDate(doc.issued_date) : '';
        const expiryDate = doc.expiry_date ? formatDate(doc.expiry_date) : '';
        const createdAt = doc.created_at ? formatDate(doc.created_at) : '';
        
        const row = [
          index + 1,
          `"${doc.title.replace(/"/g, '""')}"`,
          `"${(doc.document_type_name || doc.document_type).replace(/"/g, '""')}"`,
          `"${(doc.document_number || '').replace(/"/g, '""')}"`,
          issuedDate,
          expiryDate,
          status,
          `"${(doc.created_by || '').replace(/"/g, '""')}"`,
          createdAt
        ];
        
        csvContent += row.join(',') + '\n';
      });
      
      // Create a blob and download
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      
      link.setAttribute("href", url);
      link.setAttribute("download", `giay_to_${citizen.last_name}_${citizen.first_name}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error exporting documents:', error);
      setError('Không thể xuất danh sách giấy tờ.');
    }
  };
  
  // Load citizen data on mount
  useEffect(() => {
    fetchCitizenData();
  }, [id]);
  
  // Render functions for different sections
  const renderPersonalInfo = () => {
    const profile = citizen.profile || {};
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <PersonIcon sx={{ mr: 1 }} /> {t('common.personalInfo', 'Thông tin cá nhân')}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('common.fullName', 'Họ và tên')}
              </Typography>
              <Typography variant="body1">
                {`${citizen.first_name || ''} ${citizen.last_name || ''}`}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('common.email', 'Email')}
              </Typography>
              <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                <EmailIcon fontSize="small" sx={{ mr: 0.5 }} />
                {citizen.email || t('common.notProvided', 'Chưa cung cấp')}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('common.phoneNumber', 'Số điện thoại')}
              </Typography>
              <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                <PhoneIcon fontSize="small" sx={{ mr: 0.5 }} />
                {citizen.phone_number || profile.phone_number || t('common.notProvided', 'Chưa cung cấp')}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('common.gender', 'Giới tính')}
              </Typography>
              <Typography variant="body1">
                {profile.gender === 'male' ? 'Nam' : 
                 profile.gender === 'female' ? 'Nữ' : 
                 profile.gender === 'other' ? 'Khác' : 
                 t('common.notProvided', 'Chưa cung cấp')}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('common.dateOfBirth', 'Ngày sinh')}
              </Typography>
              <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarIcon fontSize="small" sx={{ mr: 0.5 }} />
                {formatDate(profile.date_of_birth)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('common.accountStatus', 'Trạng thái tài khoản')}
              </Typography>
              <Chip 
                label={citizen.is_active ? t('common.active', 'Đang hoạt động') : t('common.inactive', 'Không hoạt động')}
                color={citizen.is_active ? 'success' : 'error'}
                size="small"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };
  
  const renderAddressInfo = () => {
    const profile = citizen.profile || {};
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <HomeIcon sx={{ mr: 1 }} /> {t('common.addressInfo', 'Thông tin địa chỉ')}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('common.address', 'Địa chỉ')}
              </Typography>
              <Typography variant="body1">
                {profile.address || t('common.notProvided', 'Chưa cung cấp')}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('common.ward', 'Phường/Xã')}
              </Typography>
              <Typography variant="body1">
                {profile.ward || t('common.notProvided', 'Chưa cung cấp')}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('common.district', 'Quận/Huyện')}
              </Typography>
              <Typography variant="body1">
                {profile.district || t('common.notProvided', 'Chưa cung cấp')}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('common.city', 'Tỉnh/Thành phố')}
              </Typography>
              <Typography variant="body1">
                {profile.city || t('common.notProvided', 'Chưa cung cấp')}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };
  
  const renderIdCardInfo = () => {
    const profile = citizen.profile || {};
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <IdCardIcon sx={{ mr: 1 }} /> {t('common.idCardInfo', 'Thông tin CMND/CCCD')}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('common.idCardNumber', 'Số CMND/CCCD')}
              </Typography>
              <Typography variant="body1">
                {profile.id_card_number || t('common.notProvided', 'Chưa cung cấp')}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('common.verificationStatus', 'Trạng thái xác thực')}
              </Typography>
              <Chip 
                icon={citizen.is_verified ? <VerifiedIcon /> : null}
                label={citizen.is_verified ? t('common.verified', 'Đã xác thực') : t('common.unverified', 'Chưa xác thực')}
                color={citizen.is_verified ? 'success' : 'warning'}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('common.idCardIssueDate', 'Ngày cấp')}
              </Typography>
              <Typography variant="body1">
                {formatDate(profile.id_card_issue_date)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('common.idCardIssuePlace', 'Nơi cấp')}
              </Typography>
              <Typography variant="body1">
                {profile.id_card_issue_place || t('common.notProvided', 'Chưa cung cấp')}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };
  
  const renderDocumentsTab = () => {
    if (loadingDocuments) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (documents.length === 0) {
      return (
        <Alert severity="info">
          {t('officer.citizenDetail.noDocuments', 'Công dân này chưa có giấy tờ nào.')}
        </Alert>
      );
    }
    
    return (
      <>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(`/officer/citizens/${id}/documents`)}
          >
            {t('common.viewAllDocuments', 'Xem tất cả giấy tờ')}
          </Button>
          
          <Button
            variant="outlined"
            color="primary"
            startIcon={<CloudDownload />}
            onClick={() => handleExportDocuments()}
          >
            {t('common.exportDocuments', 'Xuất danh sách giấy tờ')}
          </Button>
        </Box>
        
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>{t('common.documentTitle', 'Tiêu đề')}</TableCell>
                <TableCell>{t('common.documentType', 'Loại giấy tờ')}</TableCell>
                <TableCell>{t('common.documentNumber', 'Số giấy tờ')}</TableCell>
                <TableCell>{t('common.issuedDate', 'Ngày cấp')}</TableCell>
                <TableCell>{t('common.status', 'Trạng thái')}</TableCell>
                <TableCell align="right">{t('common.actions', 'Thao tác')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.map((document) => (
                <TableRow 
                  key={document.id}
                  sx={{ 
                    '&:hover': { 
                      backgroundColor: 'action.hover',
                      cursor: 'pointer'
                    }
                  }}
                  onClick={() => navigate(`/officer/documents/${document.id}`)}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <DocumentIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {document.title}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{document.document_type_name || document.document_type}</TableCell>
                  <TableCell>{document.document_number || '—'}</TableCell>
                  <TableCell>{formatDate(document.issued_date)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={document.status === 'issued' ? t('document.issued', 'Đã cấp') : t('document.pending', 'Đang xử lý')}
                      color={document.status === 'issued' ? 'success' : 'warning'}
                      size="small"
                      icon={document.status === 'issued' ? <VerifiedUser fontSize="small" /> : null}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Tooltip title={t('common.view', 'Xem')}>
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/officer/documents/${document.id}`);
                          }}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      
                      {document.file && (
                        <Tooltip title={t('common.download', 'Tải xuống')}>
                          <IconButton 
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(document.file, '_blank');
                            }}
                          >
                            <DownloadIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </>
    );
  };
  
  const renderRequestsTab = () => {
    if (loadingRequests) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (requests.length === 0) {
      return (
        <Alert severity="info">
          {t('officer.citizenDetail.noRequests', 'Công dân này chưa có yêu cầu nào.')}
        </Alert>
      );
    }
    
    return (
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>{t('common.requestTitle', 'Tiêu đề')}</TableCell>
              <TableCell>{t('common.requestType', 'Loại yêu cầu')}</TableCell>
              <TableCell>{t('common.submittedDate', 'Ngày nộp')}</TableCell>
              <TableCell>{t('common.status', 'Trạng thái')}</TableCell>
              <TableCell align="right">{t('common.actions', 'Thao tác')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.title}</TableCell>
                <TableCell>{request.request_type_name || request.request_type}</TableCell>
                <TableCell>{formatDate(request.created_at)}</TableCell>
                <TableCell>
                  <Chip 
                    label={request.status}
                    color={
                      request.status === 'completed' ? 'success' :
                      request.status === 'rejected' ? 'error' :
                      request.status === 'processing' ? 'primary' :
                      'warning'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title={t('common.view', 'Xem')}>
                    <IconButton onClick={() => handleViewRequest(request.id)}>
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ py: 3, px: 2 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
          onClick={handleBack}
        >
          {t('common.back', 'Quay lại')}
        </Button>
      </Box>
    );
  }
  
  if (!citizen) {
    return (
      <Box sx={{ py: 3, px: 2 }}>
        <Alert severity="warning">
          {t('officer.citizenDetail.notFound', 'Không tìm thấy thông tin công dân.')}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
          onClick={handleBack}
        >
          {t('common.back', 'Quay lại')}
        </Button>
      </Box>
    );
  }
  
  return (
    <Box sx={{ py: 3, px: 2 }}>
      {/* Header with back button, title and actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            sx={{ mr: 2 }}
            onClick={handleBack}
          >
            {t('common.back', 'Quay lại')}
          </Button>
          <Typography variant="h4" component="h1">
            {t('officer.citizenDetail.title', 'Chi tiết công dân')}
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<EditIcon />}
          onClick={handleEdit}
        >
          {t('common.edit', 'Chỉnh sửa')}
        </Button>
      </Box>
      
      {/* Basic citizen info card */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            sx={{ width: 80, height: 80, mr: 2 }}
            src={citizen.profile?.avatar}
          >
            {`${citizen.first_name?.charAt(0) || ''}${citizen.last_name?.charAt(0) || ''}`}
          </Avatar>
          <Box>
            <Typography variant="h5">
              {`${citizen.first_name || ''} ${citizen.last_name || ''}`}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('common.userId', 'ID người dùng')}: {citizen.id}
            </Typography>
            <Box sx={{ display: 'flex', mt: 1 }}>
              <Chip 
                label={citizen.is_verified ? t('common.verified', 'Đã xác thực') : t('common.unverified', 'Chưa xác thực')}
                color={citizen.is_verified ? 'success' : 'warning'}
                size="small"
                sx={{ mr: 1 }}
              />
              <Chip 
                label={citizen.is_active ? t('common.active', 'Đang hoạt động') : t('common.inactive', 'Không hoạt động')}
                color={citizen.is_active ? 'success' : 'error'}
                size="small"
              />
            </Box>
          </Box>
        </Box>
      </Paper>
      
      {/* Tabs for different sections */}
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            aria-label="citizen details tabs"
          >
            <Tab 
              icon={<PersonIcon />}
              label={t('common.profile', 'Hồ sơ')}
              id="tab-0"
              aria-controls="tabpanel-0"
            />
            <Tab 
              icon={<DocumentIcon />}
              label={t('common.documents', 'Giấy tờ')}
              id="tab-1"
              aria-controls="tabpanel-1"
            />
            <Tab 
              icon={<RequestIcon />}
              label={t('common.requests', 'Yêu cầu')}
              id="tab-2"
              aria-controls="tabpanel-2"
            />
          </Tabs>
        </Box>
        
        {/* Profile tab */}
        <TabPanel value={tabValue} index={0}>
          {renderPersonalInfo()}
          {renderAddressInfo()}
          {renderIdCardInfo()}
        </TabPanel>
        
        {/* Documents tab */}
        <TabPanel value={tabValue} index={1}>
          {renderDocumentsTab()}
        </TabPanel>
        
        {/* Requests tab */}
        <TabPanel value={tabValue} index={2}>
          {renderRequestsTab()}
        </TabPanel>
      </Box>
    </Box>
  );
};

export default CitizenDetail; 