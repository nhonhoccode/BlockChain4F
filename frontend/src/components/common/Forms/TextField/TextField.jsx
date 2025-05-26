import React from 'react';
import PropTypes from 'prop-types';
import { 
  TextField as MuiTextField, 
  InputAdornment, 
  IconButton,
  Tooltip
} from '@mui/material';
import { Visibility, VisibilityOff, Info as InfoIcon } from '@mui/icons-material';
import styles from './TextField.module.scss';

/**
 * TextField - Component input text với các tính năng mở rộng
 */
const TextField = ({
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  name,
  placeholder,
  disabled = false,
  required = false,
  error = false,
  helperText = '',
  fullWidth = true,
  tooltip,
  startAdornment,
  endAdornment,
  size = 'medium',
  multiline = false,
  rows,
  maxRows,
  autoFocus = false,
  inputProps,
  InputProps,
  variant = 'outlined',
  className,
  ...rest
}) => {
  // State cho hiển thị mật khẩu
  const [showPassword, setShowPassword] = React.useState(false);

  // Xử lý hiện/ẩn mật khẩu
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Xử lý keydown cho password toggle
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  // Xác định loại input thực tế
  const actualType = type === 'password' && showPassword ? 'text' : type;

  // Xử lý adornments
  const buildStartAdornment = startAdornment ? (
    <InputAdornment position="start">{startAdornment}</InputAdornment>
  ) : null;

  const buildEndAdornment = () => {
    // Password toggle
    if (type === 'password') {
      return (
        <InputAdornment position="end">
          <IconButton
            aria-label="hiển thị mật khẩu"
            onClick={handleClickShowPassword}
            onMouseDown={handleMouseDownPassword}
            edge="end"
            size="small"
          >
            {showPassword ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        </InputAdornment>
      );
    }

    // Tooltip
    if (tooltip) {
      return (
        <InputAdornment position="end">
          <Tooltip title={tooltip}>
            <IconButton edge="end" size="small">
              <InfoIcon fontSize="small" color="action" />
            </IconButton>
          </Tooltip>
        </InputAdornment>
      );
    }

    // Custom end adornment
    if (endAdornment) {
      return <InputAdornment position="end">{endAdornment}</InputAdornment>;
    }

    return null;
  };

  // Kết hợp InputProps
  const combinedInputProps = {
    ...InputProps,
    startAdornment: buildStartAdornment || InputProps?.startAdornment,
    endAdornment: buildEndAdornment() || InputProps?.endAdornment,
  };

  return (
    <MuiTextField
      name={name}
      label={label}
      type={actualType}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      error={error}
      helperText={helperText}
      fullWidth={fullWidth}
      size={size}
      multiline={multiline}
      rows={rows}
      maxRows={maxRows}
      autoFocus={autoFocus}
      variant={variant}
      InputProps={combinedInputProps}
      inputProps={inputProps}
      className={`${styles.textField} ${className || ''}`}
      {...rest}
    />
  );
};

TextField.propTypes = {
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  error: PropTypes.bool,
  helperText: PropTypes.string,
  fullWidth: PropTypes.bool,
  tooltip: PropTypes.string,
  startAdornment: PropTypes.node,
  endAdornment: PropTypes.node,
  size: PropTypes.oneOf(['small', 'medium']),
  multiline: PropTypes.bool,
  rows: PropTypes.number,
  maxRows: PropTypes.number,
  autoFocus: PropTypes.bool,
  inputProps: PropTypes.object,
  InputProps: PropTypes.object,
  variant: PropTypes.oneOf(['standard', 'filled', 'outlined']),
  className: PropTypes.string,
};

export default TextField;
