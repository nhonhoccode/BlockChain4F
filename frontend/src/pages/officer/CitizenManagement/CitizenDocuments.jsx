import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  Home as HomeIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  Description as DocumentIcon,
  CloudDownload as CloudDownloadIcon,
  Visibility as VisibilityIcon,
  VerifiedUser as VerifiedUserIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import officerService from '../../../services/api/officerService';

const CitizenDocuments = () => {
  const { id: citizenId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [citizen, setCitizen] = useState(null);
  const [documents, setDocuments] = useState([]);
  
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
  
  // Handle back button click
  const handleBack = () => {
    navigate(`/officer/citizens/${citizenId}`);
  };
  
  // Handle view document button click
  const handleViewDocument = (documentId) => {
    navigate(`/officer/documents/${documentId}`);
  };
  
  // Handle export documents as CSV
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
      link.setAttribute("download", `giay_to_${citizen?.last_name || 'cong_dan'}_${citizen?.first_name || ''}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error exporting documents:', error);
      setError('Không thể xuất danh sách giấy tờ.');
    }
  };
  
  // Fetch citizen and documents data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch citizen details
        const citizenData = await officerService.getCitizenDetail(citizenId);
        setCitizen(citizenData);
        
        // Fetch citizen documents
        const documentsData = await officerService.getCitizenDocuments(citizenId);
        setDocuments(documentsData);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Không thể tải thông tin. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    if (citizenId) {
      fetchData();
    }
  }, [citizenId]);
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button
          variant="outlined"
          startIcon={<ChevronLeftIcon />}
          onClick={() => navigate('/officer/citizens')}
        >
          {t('common.backToList', 'Quay lại danh sách')}
        </Button>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link
          underline="hover"
          sx={{ display: 'flex', alignItems: 'center' }}
          color="inherit"
          href="/officer/dashboard"
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          {t('common.dashboard', 'Trang chủ')}
        </Link>
        <Link
          underline="hover"
          sx={{ display: 'flex', alignItems: 'center' }}
          color="inherit"
          href="/officer/citizens"
        >
          <PeopleIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          {t('common.citizens', 'Công dân')}
        </Link>
        <Link
          underline="hover"
          sx={{ display: 'flex', alignItems: 'center' }}
          color="inherit"
          href={`/officer/citizens/${citizenId}`}
        >
          <PersonIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          {citizen ? `${citizen.first_name} ${citizen.last_name}` : 'Chi tiết công dân'}
        </Link>
        <Typography
          sx={{ display: 'flex', alignItems: 'center' }}
          color="text.primary"
        >
          <DocumentIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          {t('common.documents', 'Giấy tờ')}
        </Typography>
      </Breadcrumbs>
      
      {/* Header with title and actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<ChevronLeftIcon />}
            onClick={handleBack}
            sx={{ mr: 2 }}
          >
            {t('common.back', 'Quay lại')}
          </Button>
          <Typography variant="h4" component="h1">
            {t('officer.citizenDocuments.title', 'Giấy tờ của công dân')}
          </Typography>
        </Box>
        
        <Button
          variant="outlined"
          color="primary"
          startIcon={<CloudDownloadIcon />}
          onClick={handleExportDocuments}
          disabled={documents.length === 0}
        >
          {t('common.export', 'Xuất danh sách')}
        </Button>
      </Box>
      
      {/* Citizen info card */}
      {citizen && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {t('common.citizenInfo', 'Thông tin công dân')}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                {t('common.fullName', 'Họ và tên')}
              </Typography>
              <Typography variant="body1">
                {`${citizen.first_name || ''} ${citizen.last_name || ''}`}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                {t('common.idCardNumber', 'Số CMND/CCCD')}
              </Typography>
              <Typography variant="body1">
                {citizen.profile?.id_card_number || t('common.notProvided', 'Chưa cung cấp')}
              </Typography>
            </Box>
            
            <Box sx={{ ml: 'auto' }}>
              <Chip 
                icon={citizen.is_verified ? <VerifiedUserIcon /> : null}
                label={citizen.is_verified ? t('common.verified', 'Đã xác thực') : t('common.unverified', 'Chưa xác thực')}
                color={citizen.is_verified ? 'success' : 'warning'}
                size="small"
              />
            </Box>
          </Box>
        </Paper>
      )}
      
      {/* Documents table */}
      {documents.length === 0 ? (
        <Alert severity="info">
          {t('officer.citizenDetail.noDocuments', 'Công dân này chưa có giấy tờ nào.')}
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
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
                      icon={document.status === 'issued' ? <VerifiedUserIcon fontSize="small" /> : null}
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
                          <VisibilityIcon />
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
                            <CloudDownloadIcon />
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
      )}
    </Box>
  );
};

export default CitizenDocuments; 