import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import './styles.scss';

const SelectField = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  options = [],
  error,
  helperText,
  disabled = false,
  required = false,
  fullWidth = false,
  className = '',
  placeholder = 'Chọn...',
  size = 'medium',
  multiple = false,
  searchable = false,
  clearable = false,
  startIcon,
  endIcon,
  ...restProps
}) => {
  const [focused, setFocused] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const selectRef = useRef(null);
  const searchInputRef = useRef(null);
  
  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Focus vào ô search khi mở dropdown và searchable = true
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);
  
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
  
  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        handleFocus();
      } else {
        handleBlur();
      }
    }
  };
  
  const handleOptionClick = (option) => {
    if (disabled) return;
    
    let newValue;
    
    if (multiple) {
      if (Array.isArray(value)) {
        const valueExists = value.includes(option.value);
        newValue = valueExists
          ? value.filter(val => val !== option.value)
          : [...value, option.value];
      } else {
        newValue = [option.value];
      }
    } else {
      newValue = option.value;
      setIsOpen(false);
    }
    
    const event = {
      target: {
        name,
        value: newValue
      }
    };
    
    onChange(event);
  };
  
  const handleClearValue = (e) => {
    e.stopPropagation();
    const event = {
      target: {
        name,
        value: multiple ? [] : ''
      }
    };
    onChange(event);
  };
  
  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };
  
  const getDisplayValue = () => {
    if (!value && value !== 0) return '';
    
    if (multiple && Array.isArray(value)) {
      if (value.length === 0) return '';
      
      const selectedOptions = value.map(val => 
        options.find(option => option.value === val)
      ).filter(Boolean);
      
      if (selectedOptions.length === 0) return '';
      
      if (selectedOptions.length === 1) {
        return selectedOptions[0].label;
      }
      
      return `${selectedOptions[0].label} +${selectedOptions.length - 1}`;
    }
    
    const selectedOption = options.find(option => option.value === value);
    return selectedOption ? selectedOption.label : '';
  };
  
  const filteredOptions = searchable && searchValue
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchValue.toLowerCase()))
    : options;
  
  const hasValue = (multiple && Array.isArray(value) && value.length > 0) || 
                  (!multiple && value !== undefined && value !== '');
  
  const renderHelperText = () => {
    if (error && helperText) {
      return <div className="select-field__helper-text select-field__helper-text--error">{helperText}</div>;
    } else if (helperText) {
      return <div className="select-field__helper-text">{helperText}</div>;
    }
    return null;
  };

  const selectFieldClasses = [
    'select-field',
    `select-field--${size}`,
    focused ? 'select-field--focused' : '',
    hasValue ? 'select-field--has-value' : '',
    error ? 'select-field--error' : '',
    disabled ? 'select-field--disabled' : '',
    fullWidth ? 'select-field--full-width' : '',
    isOpen ? 'select-field--open' : '',
    startIcon ? 'select-field--with-start-icon' : '',
    endIcon ? 'select-field--with-end-icon' : '',
    className
  ].filter(Boolean).join(' ');

  const labelClasses = [
    'select-field__label',
    (focused || hasValue) ? 'select-field__label--float' : '',
    error ? 'select-field__label--error' : '',
    disabled ? 'select-field__label--disabled' : '',
    required ? 'select-field__label--required' : ''
  ].filter(Boolean).join(' ');
  
  return (
    <div className={selectFieldClasses} ref={selectRef}>
      {startIcon && <div className="select-field__start-icon">{startIcon}</div>}
      
      <div 
        className="select-field__select-container"
        onClick={toggleDropdown}
      >
        <div className="select-field__value">
          {hasValue ? getDisplayValue() : <span className="select-field__placeholder">{placeholder}</span>}
        </div>
        
        {label && <label className={labelClasses}>{label}</label>}
        
        <div className="select-field__indicators">
          {clearable && hasValue && (
            <button 
              type="button"
              className="select-field__clear-btn"
              onClick={handleClearValue}
              aria-label="Xóa giá trị"
            >
              &times;
            </button>
          )}
          
          <div className={`select-field__dropdown-indicator ${isOpen ? 'select-field__dropdown-indicator--open' : ''}`}>
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path d="M7 10l5 5 5-5z" fill="currentColor" />
            </svg>
          </div>
        </div>
      </div>
      
      {endIcon && <div className="select-field__end-icon">{endIcon}</div>}
      
      {isOpen && (
        <div className="select-field__menu">
          {searchable && (
            <div className="select-field__search">
              <input
                ref={searchInputRef}
                type="text"
                className="select-field__search-input"
                placeholder="Tìm kiếm..."
                value={searchValue}
                onChange={handleSearchChange}
                onClick={e => e.stopPropagation()}
              />
            </div>
          )}
          
          <div className="select-field__menu-list">
            {filteredOptions.length === 0 ? (
              <div className="select-field__no-options">Không tìm thấy kết quả</div>
            ) : (
              filteredOptions.map(option => {
                const isSelected = multiple 
                  ? Array.isArray(value) && value.includes(option.value)
                  : option.value === value;
                
                return (
                  <div
                    key={option.value}
                    className={`select-field__option ${isSelected ? 'select-field__option--selected' : ''}`}
                    onClick={() => handleOptionClick(option)}
                  >
                    {multiple && (
                      <span className="select-field__checkbox">
                        {isSelected && (
                          <svg viewBox="0 0 24 24" width="16" height="16">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor" />
                          </svg>
                        )}
                      </span>
                    )}
                    <span className="select-field__option-label">{option.label}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
      
      {renderHelperText()}
    </div>
  );
};

SelectField.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number]))
  ]),
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired
    })
  ).isRequired,
  error: PropTypes.bool,
  helperText: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  fullWidth: PropTypes.bool,
  className: PropTypes.string,
  placeholder: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  multiple: PropTypes.bool,
  searchable: PropTypes.bool,
  clearable: PropTypes.bool,
  startIcon: PropTypes.node,
  endIcon: PropTypes.node
};

export default SelectField; 