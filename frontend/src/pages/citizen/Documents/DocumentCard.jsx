import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  Box, 
  IconButton,
  CardActionArea,
  CardActions,
  Tooltip
} from '@mui/material';
import { 
  Visibility as VisibilityIcon,
  Description as DescriptionIcon,
  VerifiedUser as VerifiedUserIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { formatDocumentType } from './DocumentDetailPage';

// Helper function to get status information
const getStatusInfo = (status) => {
  if (!status) return { label: 'Không xác định', color: 'default' };
  
  const statusMap = {
    'VALID': { label: 'Hợp lệ', color: 'success' },
    'EXPIRED': { label: 'Hết hạn', color: 'error' },
    'REVOKED': { label: 'Đã thu hồi', color: 'error' },
    'PENDING': { label: 'Chờ xử lý', color: 'warning' },
    'PROCESSING': { label: 'Đang xử lý', color: 'info' },
    'REJECTED': { label: 'Bị từ chối', color: 'error' },
    'ACTIVE': { label: 'Hợp lệ', color: 'success' },
    'INACTIVE': { label: 'Không hoạt động', color: 'error' },
    'DRAFT': { label: 'Bản nháp', color: 'default' }
  };
  
  // Chuyển đổi status về chữ hoa để so sánh không phân biệt chữ hoa/thường
  const upperStatus = status.toUpperCase();
  return statusMap[upperStatus] || { label: status, color: 'default' };
};

const DocumentCard = ({ document, onDownload, onPrint }) => {
  const navigate = useNavigate();
  
  // Lấy thông tin từ document
  const documentId = document?.id || document?.documentId || '';
  const documentType = document?.type || document?.documentType || '';
  const status = document?.status || 'VALID';
  const issuedAt = document?.issuedAt || document?.issued_at || new Date();
  const expiresAt = document?.expiresAt || document?.expires_at || null;
  
  const statusInfo = getStatusInfo(status);
  const title = formatDocumentType(documentType) || 'Giấy tờ';
  
  // Handle card click
  const handleCardClick = () => {
    if (!documentId || documentId === 'undefined' || documentId === 'null') {
      console.error('Invalid document ID:', documentId);
      alert('ID giấy tờ không hợp lệ. Không thể xem chi tiết.');
      return;
    }
    
    console.log('Navigating to document detail with ID:', documentId);
    navigate(`/citizen/documents/${documentId}`, { state: { documentData: document } });
  };
  
  // Handle download click
  const handleDownloadClick = (e) => {
    e.stopPropagation();
    if (onDownload) onDownload(documentId);
  };
  
  // Handle print click
  const handlePrintClick = (e) => {
    e.stopPropagation();
    if (onPrint) onPrint(documentId);
  };
  
  return (
    <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea onClick={handleCardClick} sx={{ flexGrow: 1 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <DescriptionIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" component="div" noWrap title={title}>
                {title}
              </Typography>
            </Box>
            <Chip
              icon={<VerifiedUserIcon fontSize="small" />}
              label={statusInfo.label}
              color={statusInfo.color}
              size="small"
            />
          </Box>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Mã giấy tờ: {documentId}
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            Ngày cấp: {issuedAt ? format(new Date(issuedAt), 'dd/MM/yyyy', { locale: vi }) : 'Không xác định'}
          </Typography>
          
          {expiresAt && (
            <Typography variant="body2" color="text.secondary">
              Ngày hết hạn: {format(new Date(expiresAt), 'dd/MM/yyyy', { locale: vi })}
            </Typography>
          )}
          
          {document?.issuedBy && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Đơn vị cấp: {document.issuedBy}
            </Typography>
          )}
        </CardContent>
      </CardActionArea>
      
      <CardActions>
        <Tooltip title="Xem chi tiết">
          <IconButton size="small" color="primary" onClick={handleCardClick}>
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Tải xuống">
          <IconButton size="small" onClick={handleDownloadClick}>
            <DownloadIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="In">
          <IconButton size="small" onClick={handlePrintClick}>
            <PrintIcon />
          </IconButton>
        </Tooltip>
        <Box sx={{ flexGrow: 1 }} />
        <Tooltip title="Tùy chọn khác">
          <IconButton size="small">
            <MoreVertIcon />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
};

export default DocumentCard; 