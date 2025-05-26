import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  LinearProgress,
  Button,
  FormHelperText,
  Tooltip,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  InsertDriveFile as FileIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import styles from './FileUpload.module.scss';

/**
 * FileUpload - Component upload file với drag and drop
 */
const FileUpload = ({
  label,
  value = [],
  name,
  onChange,
  setFieldValue,
  error = false,
  helperText = '',
  multiple = false,
  maxFiles = 5,
  maxSize = 5242880, // 5MB
  acceptedFiles = 'image/*, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  disabled = false,
  required = false,
  tooltip,
  className,
}) => {
  // State để lưu các file đã chọn
  const [files, setFiles] = useState([]);
  // State để theo dõi quá trình upload
  const [uploading, setUploading] = useState(false);
  
  // Chuyển đổi value thành files khi component mount hoặc value thay đổi
  useEffect(() => {
    if (value && Array.isArray(value)) {
      // Nếu value là url thì convert thành dạng file
      const convertedFiles = value.map(file => {
        if (typeof file === 'string') {
          // Lấy tên file từ url
          const fileName = file.split('/').pop();
          return {
            name: fileName,
            preview: file,
            isUploaded: true,
            url: file,
          };
        }
        return file;
      });
      
      setFiles(convertedFiles);
    } else if (value && !Array.isArray(value)) {
      // Nếu value không phải array
      if (typeof value === 'string') {
        const fileName = value.split('/').pop();
        setFiles([{
          name: fileName,
          preview: value,
          isUploaded: true,
          url: value,
        }]);
      } else {
        setFiles([value]);
      }
    } else {
      setFiles([]);
    }
  }, [value]);

  // Xử lý khi file được chọn
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Xử lý các file được chấp nhận
    const newFiles = acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file),
      isUploaded: false
    }));
    
    // Lấy danh sách file mới
    let updatedFiles;
    
    if (multiple) {
      // Giới hạn số lượng file
      const availableSlots = Math.max(0, maxFiles - files.length);
      const filesToAdd = newFiles.slice(0, availableSlots);
      updatedFiles = [...files, ...filesToAdd];
    } else {
      // Nếu không phải multiple thì chỉ lấy file mới nhất
      updatedFiles = [newFiles[0]];
    }
    
    // Cập nhật state và thông báo thay đổi
    setFiles(updatedFiles);
    
    // Thông báo thay đổi
    if (setFieldValue) {
      setFieldValue(name, updatedFiles);
    } else if (onChange) {
      const event = {
        target: {
          name,
          value: updatedFiles,
        },
      };
      onChange(event);
    }
    
    // Demo upload effect
    if (newFiles.length > 0) {
      simulateUpload();
    }
  }, [files, multiple, maxFiles, setFieldValue, name, onChange]);

  // Xóa file
  const removeFile = (index) => {
    const updatedFiles = [...files];
    
    // Xóa bỏ object URL để tránh memory leak
    if (updatedFiles[index].preview && !updatedFiles[index].isUploaded) {
      URL.revokeObjectURL(updatedFiles[index].preview);
    }
    
    // Xóa file khỏi danh sách
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
    
    // Thông báo thay đổi
    if (setFieldValue) {
      setFieldValue(name, updatedFiles);
    } else if (onChange) {
      const event = {
        target: {
          name,
          value: updatedFiles,
        },
      };
      onChange(event);
    }
  };

  // Giả lập quá trình upload
  const simulateUpload = () => {
    setUploading(true);
    
    // Giả lập upload trong 1.5s
    setTimeout(() => {
      setUploading(false);
      
      // Đánh dấu các file đã upload
      setFiles(prev => prev.map(file => ({
        ...file,
        isUploaded: true
      })));
    }, 1500);
  };
  
  // Config cho dropzone
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: acceptedFiles ? acceptedFiles.split(',').reduce((acc, item) => {
      acc[item.trim()] = [];
      return acc;
    }, {}) : undefined,
    maxSize,
    disabled: disabled || uploading || (multiple && files.length >= maxFiles),
    multiple
  });

  // Hiển thị icon phù hợp với loại file
  const getFileIcon = (file) => {
    if (!file.type && file.preview) {
      // Xử lý cho file đã upload trước đó
      if (file.preview.match(/\.(jpeg|jpg|png|gif|webp)$/i)) {
        return <ImageIcon color="primary" />;
      } else if (file.preview.match(/\.(pdf)$/i)) {
        return <PdfIcon color="error" />;
      }
      return <FileIcon color="action" />;
    }
    
    if (file.type.startsWith('image/')) {
      return <ImageIcon color="primary" />;
    } else if (file.type === 'application/pdf') {
      return <PdfIcon color="error" />;
    }
    return <FileIcon color="action" />;
  };

  // Format kích thước file
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box className={`${styles.fileUpload} ${className || ''}`}>
      <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body1" component="label">
            {label}
            {required && <span className={styles.requiredStar}>*</span>}
          </Typography>
          
          {tooltip && (
            <Tooltip title={tooltip} placement="top">
              <IconButton size="small" sx={{ ml: 0.5 }}>
                <InfoIcon fontSize="small" color="action" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        
        {multiple && (
          <Typography variant="body2" color="textSecondary">
            {files.length}/{maxFiles} files
          </Typography>
        )}
      </Box>

      <Paper
        {...getRootProps()}
        elevation={0}
        className={`${styles.dropzone} ${
          isDragActive ? styles.active : ''
        } ${isDragReject || error ? styles.error : ''} ${
          disabled ? styles.disabled : ''
        }`}
      >
        <input {...getInputProps()} />
        
        <Box sx={{ textAlign: 'center', p: 2 }}>
          <UploadIcon fontSize="large" color="action" />
          <Typography variant="body1" sx={{ mt: 1 }}>
            {isDragActive
              ? 'Thả file để tải lên'
              : 'Kéo và thả file vào đây, hoặc click để chọn file'}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
            {multiple
              ? `Tối đa ${maxFiles} file, mỗi file không quá ${formatFileSize(maxSize)}`
              : `Kích thước tối đa ${formatFileSize(maxSize)}`}
          </Typography>
        </Box>
      </Paper>

      {uploading && <LinearProgress sx={{ mt: 1, borderRadius: 1 }} />}

      {helperText && (
        <FormHelperText error={error}>{helperText}</FormHelperText>
      )}

      {files.length > 0 && (
        <List className={styles.fileList}>
          {files.map((file, index) => (
            <ListItem
              key={index}
              className={styles.fileItem}
              component={Paper}
              variant="outlined"
            >
              <ListItemIcon>{getFileIcon(file)}</ListItemIcon>
              
              <ListItemText
                primary={file.name}
                secondary={file.size ? formatFileSize(file.size) : 'Đã tải lên'}
              />
              
              {file.preview && file.type?.startsWith('image/') && (
                <Box
                  component="img"
                  src={file.preview}
                  alt={file.name}
                  className={styles.imagePreview}
                />
              )}
              
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => removeFile(index)}
                  disabled={disabled}
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}
      
      {multiple && files.length > 0 && (
        <Box sx={{ mt: 1, textAlign: 'right' }}>
          <Button
            size="small"
            onClick={() => {
              setFiles([]);
              if (setFieldValue) {
                setFieldValue(name, []);
              } else if (onChange) {
                const event = {
                  target: {
                    name,
                    value: [],
                  },
                };
                onChange(event);
              }
            }}
            disabled={disabled}
          >
            Xóa tất cả
          </Button>
        </Box>
      )}
    </Box>
  );
};

FileUpload.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.array, PropTypes.object, PropTypes.string]),
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  setFieldValue: PropTypes.func,
  error: PropTypes.bool,
  helperText: PropTypes.string,
  multiple: PropTypes.bool,
  maxFiles: PropTypes.number,
  maxSize: PropTypes.number,
  acceptedFiles: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  tooltip: PropTypes.string,
  className: PropTypes.string,
};

export default FileUpload;
