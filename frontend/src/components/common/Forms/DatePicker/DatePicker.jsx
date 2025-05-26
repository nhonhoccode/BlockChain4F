import React from 'react';
import PropTypes from 'prop-types';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker as MuiDatePicker } from '@mui/x-date-pickers';
import { TextField, Tooltip, IconButton, InputAdornment } from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';
import viLocale from 'date-fns/locale/vi';
import styles from './DatePicker.module.scss';

/**
 * DatePicker - Component chọn ngày tháng
 */
const DatePicker = ({
  label,
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
  minDate,
  maxDate,
  size = 'medium',
  variant = 'outlined',
  disableFuture = false,
  disablePast = false,
  inputFormat = 'dd/MM/yyyy',
  setFieldValue,
  views = ['day', 'month', 'year'],
  showYearPicker = false,
  showMonthPicker = false,
  className,
  ...rest
}) => {
  // Handle date change
  const handleDateChange = (date) => {
    if (setFieldValue) {
      setFieldValue(name, date);
    } else if (onChange) {
      // Simulate a synthetic event
      const event = {
        target: {
          name,
          value: date,
        },
      };
      onChange(event);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={viLocale}>
      <MuiDatePicker
        label={label}
        value={value}
        inputFormat={inputFormat}
        onChange={handleDateChange}
        minDate={minDate}
        maxDate={maxDate}
        disableFuture={disableFuture}
        disablePast={disablePast}
        views={showYearPicker ? ['year'] : showMonthPicker ? ['year', 'month'] : views}
        className={`${styles.datePicker} ${className || ''}`}
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth={fullWidth}
            name={name}
            error={error}
            helperText={helperText}
            required={required}
            disabled={disabled}
            placeholder={placeholder}
            size={size}
            variant={variant}
            onBlur={onBlur}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {tooltip && (
                    <InputAdornment position="end">
                      <Tooltip title={tooltip}>
                        <IconButton edge="end" size="small">
                          <InfoIcon fontSize="small" color="action" />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  )}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        {...rest}
      />
    </LocalizationProvider>
  );
};

DatePicker.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  error: PropTypes.bool,
  helperText: PropTypes.string,
  fullWidth: PropTypes.bool,
  tooltip: PropTypes.string,
  minDate: PropTypes.instanceOf(Date),
  maxDate: PropTypes.instanceOf(Date),
  size: PropTypes.oneOf(['small', 'medium']),
  variant: PropTypes.oneOf(['standard', 'filled', 'outlined']),
  disableFuture: PropTypes.bool,
  disablePast: PropTypes.bool,
  inputFormat: PropTypes.string,
  setFieldValue: PropTypes.func,
  views: PropTypes.arrayOf(PropTypes.string),
  showYearPicker: PropTypes.bool,
  showMonthPicker: PropTypes.bool,
  className: PropTypes.string,
};

export default DatePicker;
