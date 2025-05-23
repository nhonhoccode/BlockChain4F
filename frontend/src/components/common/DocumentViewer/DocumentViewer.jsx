// DocumentViewer component
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  Divider,
  Card,
  CardContent,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  Alert,
  useTheme
} from '@mui/material';
import {
  Description as DocumentIcon,
  TaskAlt as VerifiedIcon,
  Error as UnverifiedIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  CloudDownload as DownloadIcon,
  AttachFile as AttachmentIcon,
  Visibility as ViewIcon,
  Lock as SecurityIcon,
  VerifiedUser as BlockchainVerifiedIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

const DocumentViewer = ({ document, loading, error }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [previewError, setPreviewError] = useState(null);
  
  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return t('common.notAvailable', 'Không có');
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return t('common.notAvailable', 'Không có');
      }
      return format(date, 'dd/MM/yyyy', { locale: vi });
    } catch (error) {
      console.error('Date formatting error:', error);
      return t('common.notAvailable', 'Không có');
    }
  };
  
  // Handle document download
  const handleDownload = (url, filename) => {
    if (!url) {
      setPreviewError(t('document.errors.noFileToDownload', 'Không có file để tải xuống'));
      return;
    }
    
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download error:', error);
      setPreviewError(t('document.errors.downloadFailed', 'Tải xuống thất bại'));
    }
  };
  
  // Handle document preview
  const handlePreview = (url) => {
    if (!url) {
      setPreviewError(t('document.errors.noFileToPreview', 'Không có file để xem trước'));
      return;
    }
    
    try {
      window.open(url, '_blank');
    } catch (error) {
      console.error('Preview error:', error);
      setPreviewError(t('document.errors.previewFailed', 'Xem trước thất bại'));
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }
  
  if (!document) {
    return (
      <Alert severity="info" sx={{ my: 2 }}>
        {t('document.noDocumentSelected', 'Không có giấy tờ nào được chọn')}
      </Alert>
    );
  }
  
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      {/* Document header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, md: 0 } }}>
          <DocumentIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
          <Box>
            <Typography variant="h5" component="h1">
              {document.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {document.document_type_name || document.document_type}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Chip
            icon={document.status === 'issued' ? <VerifiedIcon /> : <UnverifiedIcon />}
            label={document.status === 'issued' ? t('document.issued', 'Đã cấp') : t('document.pending', 'Đang xử lý')}
            color={document.status === 'issued' ? 'success' : 'warning'}
            sx={{ mr: 1 }}
          />
          {document.blockchain_verified && (
            <Tooltip title={t('document.blockchainVerified', 'Đã xác thực trên blockchain')}>
              <Chip
                icon={<BlockchainVerifiedIcon />}
                label={t('document.verified', 'Đã xác thực')}
                color="info"
              />
            </Tooltip>
          )}
        </Box>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      {/* Error message for preview/download */}
      {previewError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setPreviewError(null)}>
          {previewError}
        </Alert>
      )}
      
      {/* Document details */}
      <Grid container spacing={3}>
        {/* Left column - Document info */}
        <Grid item xs={12} md={7}>
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {t('document.details', 'Thông tin chi tiết')}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('document.documentNumber', 'Số giấy tờ')}
                  </Typography>
                  <Typography variant="body1">
                    {document.document_number || t('common.notAvailable', 'Không có')}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('document.issuedDate', 'Ngày cấp')}
                  </Typography>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarIcon fontSize="small" sx={{ mr: 0.5 }} />
                    {formatDate(document.issued_date)}
                  </Typography>
                </Grid>
                
                {document.expiry_date && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {t('document.expiryDate', 'Ngày hết hạn')}
                    </Typography>
                    <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarIcon fontSize="small" sx={{ mr: 0.5 }} />
                      {formatDate(document.expiry_date)}
                    </Typography>
                  </Grid>
                )}
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('document.createdBy', 'Người tạo')}
                  </Typography>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon fontSize="small" sx={{ mr: 0.5 }} />
                    {document.created_by || t('common.notAvailable', 'Không có')}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('document.createdAt', 'Ngày tạo')}
                  </Typography>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                    <TimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                    {formatDate(document.created_at)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('document.updatedAt', 'Cập nhật lần cuối')}
                  </Typography>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                    <TimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                    {formatDate(document.updated_at)}
                  </Typography>
                </Grid>
                
                {document.owner && document.owner.name && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {t('document.owner', 'Chủ sở hữu')}
                    </Typography>
                    <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonIcon fontSize="small" sx={{ mr: 0.5 }} />
                      {document.owner.name}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
          
          {/* Document content */}
          {document.description && (
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {t('document.description', 'Mô tả')}
                </Typography>
                <Typography variant="body1" component="div">
                  {document.description}
                </Typography>
              </CardContent>
            </Card>
          )}
          
          {document.content && (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {t('document.content', 'Nội dung')}
                </Typography>
                <Typography variant="body1" component="div">
                  {document.content}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
        
        {/* Right column - Files and blockchain info */}
        <Grid item xs={12} md={5}>
          {/* Document file */}
          {document.file && (
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {t('document.mainFile', 'Tệp tin chính')}
                </Typography>
                
                <Box 
                  sx={{ 
                    border: '1px dashed',
                    borderColor: 'divider',
                    borderRadius: 1,
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <DocumentIcon sx={{ fontSize: 60, color: 'primary.main', mb: 1 }} />
                  <Typography variant="body1" align="center" sx={{ mb: 2 }}>
                    {document.file.split('/').pop() || t('document.mainDocument', 'Tài liệu chính')}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={<ViewIcon />}
                      onClick={() => handlePreview(document.file)}
                    >
                      {t('common.view', 'Xem')}
                    </Button>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownload(document.file, document.file.split('/').pop())}
                    >
                      {t('common.download', 'Tải xuống')}
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}
          
          {/* Attachments */}
          {document.attachments && document.attachments.length > 0 && (
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {t('document.attachments', 'Tệp đính kèm')}
                </Typography>
                
                <List>
                  {Array.isArray(document.attachments) ? (
                    document.attachments.map((attachment, index) => (
                      <ListItem 
                        key={index}
                        sx={{ 
                          borderBottom: index < document.attachments.length - 1 ? '1px solid' : 'none',
                          borderColor: 'divider'
                        }}
                      >
                        <ListItemIcon>
                          <AttachmentIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary={
                            typeof attachment === 'string' 
                              ? attachment.split('/').pop() 
                              : (attachment.name || `Tệp đính kèm ${index + 1}`)
                          }
                          secondary={
                            attachment.description || 
                            (attachment.created_at ? `Ngày tạo: ${formatDate(attachment.created_at)}` : '')
                          }
                        />
                        <ListItemSecondaryAction>
                          <Tooltip title={t('common.view', 'Xem')}>
                            <IconButton 
                              edge="end" 
                              onClick={() => handlePreview(typeof attachment === 'string' ? attachment : attachment.file)}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t('common.download', 'Tải xuống')}>
                            <IconButton 
                              edge="end"
                              onClick={() => handleDownload(
                                typeof attachment === 'string' ? attachment : attachment.file,
                                typeof attachment === 'string' 
                                  ? attachment.split('/').pop() 
                                  : (attachment.name || `attachment-${index}`)
                              )}
                            >
                              <DownloadIcon />
                            </IconButton>
                          </Tooltip>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))
                  ) : (
                    <ListItem>
                      <ListItemText primary={t('document.errors.invalidAttachments', 'Định dạng tệp đính kèm không hợp lệ')} />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          )}
          
          {/* Blockchain info */}
          {(document.blockchain_hash || document.blockchain_timestamp) && (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <SecurityIcon sx={{ mr: 1 }} />
                  {t('document.blockchainVerification', 'Xác thực Blockchain')}
                </Typography>
                
                <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
                  {document.blockchain_verified && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <BlockchainVerifiedIcon color="success" sx={{ mr: 1 }} />
                      <Typography variant="body1" color="success.main">
                        {t('document.documentVerified', 'Giấy tờ đã được xác thực trên blockchain')}
                      </Typography>
                    </Box>
                  )}
                  
                  {document.blockchain_hash && (
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1, wordBreak: 'break-all' }}>
                      <strong>{t('document.blockchainHash', 'Hash')}: </strong>
                      {document.blockchain_hash}
                    </Typography>
                  )}
                  
                  {document.blockchain_timestamp && (
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                      <HistoryIcon fontSize="small" sx={{ mr: 0.5 }} />
                      <strong>{t('document.timestamp', 'Thời gian xác thực')}: </strong>
                      {formatDate(document.blockchain_timestamp)}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
};

export default DocumentViewer;
