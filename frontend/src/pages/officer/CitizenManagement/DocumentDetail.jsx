import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Paper,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  Home as HomeIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  Description as DocumentIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import DocumentViewer from '../../../components/common/DocumentViewer';
import officerService from '../../../services/api/officerService';

const DocumentDetail = () => {
  const { id: documentId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [document, setDocument] = useState(null);
  
  useEffect(() => {
    const fetchDocumentData = async () => {
      try {
        setLoading(true);
        console.log('Fetching document details for ID:', documentId);
        const data = await officerService.getDocumentDetail(documentId);
        console.log('Document data received:', data);
        setDocument(data);
      } catch (error) {
        console.error(`Error fetching document details for ID ${documentId}:`, error);
        setError(`Không thể tải thông tin giấy tờ. ${error.message || 'Vui lòng thử lại sau.'}`);
      } finally {
        setLoading(false);
      }
    };
    
    if (documentId) {
      fetchDocumentData();
    }
  }, [documentId]);
  
  const handleBack = () => {
    if (document?.owner?.id) {
      navigate(`/officer/citizens/${document.owner.id}`);
    } else {
      navigate('/officer/citizens');
    }
  };
  
  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs navigation */}
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
        {document?.owner?.id && (
          <Link
            underline="hover"
            sx={{ display: 'flex', alignItems: 'center' }}
            color="inherit"
            href={`/officer/citizens/${document.owner.id}`}
          >
            <PersonIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            {document.owner.name}
          </Link>
        )}
        <Typography
          sx={{ display: 'flex', alignItems: 'center' }}
          color="text.primary"
        >
          <DocumentIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          {loading ? t('common.loading', 'Đang tải...') : (document?.title || t('document.details', 'Chi tiết giấy tờ'))}
        </Typography>
      </Breadcrumbs>
      
      {/* Back button and title */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ChevronLeftIcon />}
          onClick={handleBack}
          sx={{ mr: 2 }}
        >
          {t('common.back', 'Quay lại')}
        </Button>
        <Typography variant="h4" component="h1">
          {t('document.details', 'Chi tiết giấy tờ')}
        </Typography>
      </Box>
      
      {/* Error display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Document viewer */}
      <DocumentViewer 
        document={document}
        loading={loading}
        error={error}
      />
    </Box>
  );
};

export default DocumentDetail; 