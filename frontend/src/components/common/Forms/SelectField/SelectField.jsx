import React from 'react';
import PropTypes from 'prop-types';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Chip,
  Box,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Tooltip,
  IconButton,
} from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';
import styles from './SelectField.module.scss';

/**
 * SelectField - Component select dropdown cho form
 */
const SelectField = ({
  name,
  label,
  value,
  onChange,
  onBlur,
  options = [],
  placeholder,
  disabled = false,
  required = false,
  error = false,
  helperText = '',
  fullWidth = true,
  tooltip,
  multiple = false,
  renderValue,
  size = 'medium',
  variant = 'outlined',
  displayEmpty = false,
  showCheckbox = false,
  className,
  ...rest
}) => {
  // Xử lý đặc biệt cho multiple select với chips
  const handleRenderValue = (selected) => {
    if (!selected || (Array.isArray(selected) && selected.length === 0)) {
      return <em>{placeholder || 'Chọn'}</em>;
    }

    // Nếu có custom renderValue thì dùng
    if (renderValue) {
      return renderValue(selected);
    }

    // Xử lý mặc định cho multiple
    if (multiple && Array.isArray(selected)) {
      return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {selected.map((value) => {
            const selectedOption = options.find((option) => option.value === value);
            return (
              <Chip
                key={value}
                label={selectedOption ? selectedOption.label : value}
                size="small"
              />
            );
          })}
        </Box>
      );
    }

    // Xử lý mặc định cho single select
    const selectedOption = options.find((option) => option.value === selected);
    return selectedOption ? selectedOption.label : selected;
  };

  // Tạo label ID
  const labelId = `${name}-label`;

  return (
    <FormControl
      fullWidth={fullWidth}
      error={error}
      required={required}
      disabled={disabled}
      size={size}
      variant={variant}
      className={`${styles.selectField} ${className || ''}`}
    >
      <InputLabel id={labelId}>{label}</InputLabel>

      <Select
        labelId={labelId}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        label={label}
        multiple={multiple}
        displayEmpty={displayEmpty}
        renderValue={handleRenderValue}
        input={<OutlinedInput label={label} />}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: 300,
            },
          },
        }}
        endAdornment={
          tooltip && (
            <Tooltip title={tooltip}>
              <IconButton
                size="small"
                sx={{ position: 'absolute', right: 30, pointerEvents: 'auto' }}
              >
                <InfoIcon fontSize="small" color="action" />
              </IconButton>
            </Tooltip>
          )
        }
        {...rest}
      >
        {placeholder && !multiple && (
          <MenuItem value="" disabled>
            <em>{placeholder}</em>
          </MenuItem>
        )}

        {options.map((option) => (
          <MenuItem key={option.value} value={option.value} disabled={option.disabled}>
            {showCheckbox && multiple && (
              <Checkbox checked={(value || []).indexOf(option.value) > -1} />
            )}
            <ListItemText primary={option.label} />
          </MenuItem>
        ))}
      </Select>

      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

SelectField.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.array,
  ]),
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
      disabled: PropTypes.bool,
    })
  ).isRequired,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  error: PropTypes.bool,
  helperText: PropTypes.string,
  fullWidth: PropTypes.bool,
  tooltip: PropTypes.string,
  multiple: PropTypes.bool,
  renderValue: PropTypes.func,
  size: PropTypes.oneOf(['small', 'medium']),
  variant: PropTypes.oneOf(['standard', 'filled', 'outlined']),
  displayEmpty: PropTypes.bool,
  showCheckbox: PropTypes.bool,
  className: PropTypes.string,
};

export default SelectField;
