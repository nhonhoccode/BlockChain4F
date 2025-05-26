import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import './styles.scss';

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
};

const FileUpload = ({
  name,
  label,
  onChange,
  onBlur,
  error,
  helperText,
  disabled = false,
  required = false,
  multiple = false,
  accept = '*',
  maxSize = 5242880, // 5MB default
  maxFiles = 5,
  allowedExtensions = [],
  fullWidth = false,
  className = '',
  showPreview = true,
  dropzoneText = 'Kéo thả tệp vào đây hoặc nhấp để chọn',
  previewType = 'list', // 'list' or 'grid'
  value = [],
  ...restProps
}) => {
  const [focused, setFocused] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);
  
  // Xử lý kéo thả
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };
  
  // Xử lý khi chọn file từ input
  const handleChange = (e) => {
    if (disabled) return;
    
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };
  
  // Xử lý files chung
  const handleFiles = (files) => {
    // Kiểm tra số lượng files tối đa
    if (multiple && files.length > maxFiles) {
      const errorEvent = {
        target: {
          name,
          error: `Chỉ được tải lên tối đa ${maxFiles} tệp.`
        }
      };
      onChange(errorEvent);
      return;
    }
    
    // Tạo danh sách files mới
    const newFiles = [];
    const errors = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const extension = getFileExtension(file.name);
      
      // Kiểm tra định dạng file
      if (allowedExtensions.length > 0 && !allowedExtensions.includes(extension)) {
        errors.push(`File ${file.name} không đúng định dạng. Các định dạng được hỗ trợ: ${allowedExtensions.join(', ')}.`);
        continue;
      }
      
      // Kiểm tra kích thước file
      if (file.size > maxSize) {
        errors.push(`File ${file.name} vượt quá kích thước cho phép (${formatFileSize(maxSize)}).`);
        continue;
      }
      
      // Thêm vào danh sách files
      newFiles.push(file);
    }
    
    // Cập nhật giá trị
    const result = multiple ? [...newFiles] : newFiles.length > 0 ? [newFiles[0]] : [];
    
    const event = {
      target: {
        name,
        value: result,
        error: errors.length > 0 ? errors.join('\n') : null
      }
    };
    
    onChange(event);
  };
  
  // Xử lý khi nhấn vào dropzone
  const handleClick = () => {
    if (disabled) return;
    inputRef.current.click();
  };
  
  // Xử lý khi xóa file
  const handleRemoveFile = (index, e) => {
    e.stopPropagation();
    
    if (disabled) return;
    
    const newValue = [...value];
    newValue.splice(index, 1);
    
    const event = {
      target: {
        name,
        value: newValue
      }
    };
    
    onChange(event);
  };
  
  // Tạo preview cho file
  const renderPreview = (file, index) => {
    const isImage = file.type.startsWith('image/');
    
    if (previewType === 'grid') {
      return (
        <div className="file-upload__preview-item file-upload__preview-item--grid" key={index}>
          <div className="file-upload__preview-content">
            {isImage ? (
              <img 
                src={URL.createObjectURL(file)} 
                alt={file.name}
                className="file-upload__preview-image" 
              />
            ) : (
              <div className="file-upload__preview-icon">
                <svg viewBox="0 0 24 24" width="40" height="40">
                  <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" fill="currentColor" />
                </svg>
              </div>
            )}
            
            <button 
              type="button"
              className="file-upload__remove-btn"
              onClick={(e) => handleRemoveFile(index, e)}
              aria-label="Xóa tệp"
            >
              &times;
            </button>
          </div>
          
          <div className="file-upload__preview-info">
            <div className="file-upload__filename">{file.name}</div>
            <div className="file-upload__filesize">{formatFileSize(file.size)}</div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="file-upload__preview-item" key={index}>
        <div className="file-upload__preview-icon">
          {isImage ? (
            <img 
              src={URL.createObjectURL(file)} 
              alt={file.name}
              className="file-upload__preview-thumbnail" 
            />
          ) : (
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" fill="currentColor" />
            </svg>
          )}
        </div>
        
        <div className="file-upload__preview-info">
          <div className="file-upload__filename">{file.name}</div>
          <div className="file-upload__filesize">{formatFileSize(file.size)}</div>
        </div>
        
        <button 
          type="button"
          className="file-upload__remove-btn"
          onClick={(e) => handleRemoveFile(index, e)}
          aria-label="Xóa tệp"
        >
          &times;
        </button>
      </div>
    );
  };
  
  // Xử lý khi focus/blur
  const handleFocus = () => {
    setFocused(true);
    if (restProps.onFocus) {
      restProps.onFocus();
    }
  };
  
  const handleBlur = (e) => {
    setFocused(false);
    if (onBlur) {
      onBlur(e);
    }
  };
  
  const renderHelperText = () => {
    if (error && helperText) {
      return <div className="file-upload__helper-text file-upload__helper-text--error">{helperText}</div>;
    } else if (helperText) {
      return <div className="file-upload__helper-text">{helperText}</div>;
    }
    return null;
  };
  
  const acceptString = Array.isArray(allowedExtensions) && allowedExtensions.length
    ? allowedExtensions.map(ext => `.${ext}`).join(',')
    : accept;
  
  const hasValue = value && value.length > 0;
  
  const fileUploadClasses = [
    'file-upload',
    focused ? 'file-upload--focused' : '',
    dragActive ? 'file-upload--drag-active' : '',
    hasValue ? 'file-upload--has-value' : '',
    error ? 'file-upload--error' : '',
    disabled ? 'file-upload--disabled' : '',
    fullWidth ? 'file-upload--full-width' : '',
    className
  ].filter(Boolean).join(' ');
  
  const labelClasses = [
    'file-upload__label',
    error ? 'file-upload__label--error' : '',
    disabled ? 'file-upload__label--disabled' : '',
    required ? 'file-upload__label--required' : ''
  ].filter(Boolean).join(' ');
  
  const previewClasses = [
    'file-upload__preview',
    `file-upload__preview--${previewType}`
  ].filter(Boolean).join(' ');
  
  return (
    <div className={fileUploadClasses}>
      {label && <label className={labelClasses}>{label}</label>}
      
      <div 
        className="file-upload__dropzone"
        onClick={handleClick}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          id={name}
          name={name}
          className="file-upload__input"
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          accept={acceptString}
          multiple={multiple}
          disabled={disabled}
          {...restProps}
        />
        
        <div className="file-upload__placeholder">
          <div className="file-upload__icon">
            <svg viewBox="0 0 24 24" width="40" height="40">
              <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z" fill="currentColor" />
            </svg>
          </div>
          <div className="file-upload__text">{dropzoneText}</div>
          
          <div className="file-upload__info">
            {maxFiles > 1 && (
              <div className="file-upload__max-files">
                Tối đa {maxFiles} tệp
              </div>
            )}
            <div className="file-upload__max-size">
              Tối đa {formatFileSize(maxSize)}
            </div>
            {allowedExtensions.length > 0 && (
              <div className="file-upload__allowed-types">
                Định dạng: {allowedExtensions.map(ext => `.${ext}`).join(', ')}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {showPreview && hasValue && (
        <div className={previewClasses}>
          {value.map((file, index) => renderPreview(file, index))}
        </div>
      )}
      
      {renderHelperText()}
    </div>
  );
};

FileUpload.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  error: PropTypes.bool,
  helperText: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  multiple: PropTypes.bool,
  accept: PropTypes.string,
  maxSize: PropTypes.number,
  maxFiles: PropTypes.number,
  allowedExtensions: PropTypes.arrayOf(PropTypes.string),
  fullWidth: PropTypes.bool,
  className: PropTypes.string,
  showPreview: PropTypes.bool,
  dropzoneText: PropTypes.string,
  previewType: PropTypes.oneOf(['list', 'grid']),
  value: PropTypes.array
};

export default FileUpload; 