import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './styles.scss';

const TextField = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  type = 'text',
  error,
  helperText,
  disabled = false,
  required = false,
  fullWidth = false,
  className = '',
  autoFocus = false,
  size = 'medium',
  multiline = false,
  rows = 3,
  maxLength,
  startIcon,
  endIcon,
  readOnly = false,
  ...restProps
}) => {
  const [focused, setFocused] = useState(false);
  
  const handleFocus = (e) => {
    setFocused(true);
    if (restProps.onFocus) {
      restProps.onFocus(e);
    }
  };
  
  const handleBlur = (e) => {
    setFocused(false);
    if (onBlur) {
      onBlur(e);
    }
  };
  
  const hasValue = value !== undefined && value !== '';
  
  const renderHelperText = () => {
    if (error && helperText) {
      return <div className="text-field__helper-text text-field__helper-text--error">{helperText}</div>;
    } else if (helperText) {
      return <div className="text-field__helper-text">{helperText}</div>;
    }
    return null;
  };
  
  const textFieldClasses = [
    'text-field',
    `text-field--${size}`,
    focused ? 'text-field--focused' : '',
    hasValue ? 'text-field--has-value' : '',
    error ? 'text-field--error' : '',
    disabled ? 'text-field--disabled' : '',
    fullWidth ? 'text-field--full-width' : '',
    readOnly ? 'text-field--readonly' : '',
    startIcon ? 'text-field--with-start-icon' : '',
    endIcon ? 'text-field--with-end-icon' : '',
    className
  ].filter(Boolean).join(' ');

  const labelClasses = [
    'text-field__label',
    (focused || hasValue) ? 'text-field__label--float' : '',
    error ? 'text-field__label--error' : '',
    disabled ? 'text-field__label--disabled' : '',
    required ? 'text-field__label--required' : ''
  ].filter(Boolean).join(' ');
  
  const renderInput = () => {
    const inputProps = {
      className: 'text-field__input',
      name,
      value: value || '',
      onChange,
      onFocus: handleFocus,
      onBlur: handleBlur,
      placeholder: focused ? placeholder : undefined,
      disabled,
      readOnly,
      autoFocus,
      maxLength,
      ...restProps
    };
    
    if (multiline) {
      return (
        <textarea
          {...inputProps}
          rows={rows}
        />
      );
    }
    
    return (
      <input
        {...inputProps}
        type={type}
      />
    );
  };
  
  return (
    <div className={textFieldClasses}>
      {startIcon && <div className="text-field__start-icon">{startIcon}</div>}
      
      <div className="text-field__input-container">
        {renderInput()}
        {label && <label className={labelClasses} htmlFor={name}>{label}</label>}
      </div>
      
      {endIcon && <div className="text-field__end-icon">{endIcon}</div>}
      
      {renderHelperText()}
      
      {maxLength && value && (
        <div className="text-field__character-count">
          {`${value.length}/${maxLength}`}
        </div>
      )}
    </div>
  );
};

TextField.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  placeholder: PropTypes.string,
  type: PropTypes.string,
  error: PropTypes.bool,
  helperText: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  fullWidth: PropTypes.bool,
  className: PropTypes.string,
  autoFocus: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  multiline: PropTypes.bool,
  rows: PropTypes.number,
  maxLength: PropTypes.number,
  startIcon: PropTypes.node,
  endIcon: PropTypes.node,
  readOnly: PropTypes.bool
};

export default TextField; 