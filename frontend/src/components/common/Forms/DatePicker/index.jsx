import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import './styles.scss';

// Calendar utils
const DAYS_OF_WEEK = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const MONTHS = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
];

// Hàm format ngày tháng
const formatDate = (date, format = 'dd/MM/yyyy') => {
  if (!date) return '';
  
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  
  return format
    .replace('dd', day)
    .replace('MM', month)
    .replace('yyyy', year);
};

// Hàm parse chuỗi ngày thành Date object
const parseDate = (dateString, format = 'dd/MM/yyyy') => {
  if (!dateString) return null;
  
  // Parse DD/MM/YYYY format
  const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const parts = regex.exec(dateString);
  
  if (parts) {
    const day = parseInt(parts[1], 10);
    const month = parseInt(parts[2], 10) - 1;
    const year = parseInt(parts[3], 10);
    
    const date = new Date(year, month, day);
    
    // Check if the date is valid
    if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
      return date;
    }
  }
  
  return null;
};

// Lấy số ngày trong tháng
const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

// Lấy ngày đầu tiên trong tháng
const getFirstDayOfMonth = (year, month) => {
  return new Date(year, month, 1).getDay();
};

// Lấy ma trận lịch
const getCalendarMatrix = (year, month) => {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);
  
  let calendarDays = [];
  let week = Array(7).fill(null);
  
  // Thêm những ngày trong tháng trước
  for (let i = 0; i < firstDayOfMonth; i++) {
    week[i] = null;
  }
  
  // Thêm ngày trong tháng hiện tại
  let dayCounter = 1;
  for (let i = firstDayOfMonth; i < 7; i++) {
    week[i] = dayCounter++;
  }
  calendarDays.push(week);
  
  // Thêm các tuần còn lại
  while (dayCounter <= daysInMonth) {
    week = Array(7).fill(null);
    for (let i = 0; i < 7 && dayCounter <= daysInMonth; i++) {
      week[i] = dayCounter++;
    }
    calendarDays.push(week);
  }
  
  return calendarDays;
};

const DatePicker = ({
  name,
  label,
  value,
  onChange,
  onBlur,
  placeholder = 'DD/MM/YYYY',
  format = 'dd/MM/yyyy',
  error,
  helperText,
  disabled = false,
  required = false,
  fullWidth = false,
  className = '',
  minDate,
  maxDate,
  disablePast = false,
  disableFuture = false,
  clearable = true,
  size = 'medium',
  readOnly = false,
  ...restProps
}) => {
  const [focused, setFocused] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value ? formatDate(value, format) : '');
  const [calendarDate, setCalendarDate] = useState(value ? new Date(value) : new Date());
  const calendarRef = useRef(null);
  const inputRef = useRef(null);
  
  useEffect(() => {
    setInputValue(value ? formatDate(value, format) : '');
  }, [value, format]);
  
  useEffect(() => {
    // Đóng calendar khi click ngoài
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleInputFocus = () => {
    if (disabled || readOnly) return;
    
    setFocused(true);
    if (restProps.onFocus) {
      restProps.onFocus();
    }
  };
  
  const handleInputBlur = (e) => {
    setFocused(false);
    
    // Validate và format lại ngày khi blur
    const parsedDate = parseDate(inputValue, format);
    if (inputValue && !parsedDate) {
      // Input không phải là ngày hợp lệ, reset lại giá trị
      setInputValue(value ? formatDate(value, format) : '');
    } else if (parsedDate) {
      // Ngày hợp lệ, cập nhật giá trị và format
      const formattedDate = formatDate(parsedDate, format);
      setInputValue(formattedDate);
      
      if (!value || new Date(value).getTime() !== parsedDate.getTime()) {
        handleDateChange(parsedDate);
      }
    }
    
    if (onBlur) {
      onBlur(e);
    }
  };
  
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Try to parse as they type
    const parsedDate = parseDate(newValue, format);
    if (parsedDate) {
      handleDateChange(parsedDate);
    }
  };
  
  const handleInputClick = () => {
    if (disabled || readOnly) return;
    
    setIsOpen(true);
    handleInputFocus();
  };
  
  const handleDateClick = (day) => {
    if (!day) return;
    
    const newDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day);
    
    // Kiểm tra ràng buộc ngày
    if (isDateDisabled(newDate)) return;
    
    handleDateChange(newDate);
    setIsOpen(false);
  };
  
  const handleDateChange = (date) => {
    const event = {
      target: {
        name,
        value: date
      }
    };
    
    onChange(event);
  };
  
  const handleClear = (e) => {
    e.stopPropagation();
    setInputValue('');
    handleDateChange(null);
  };
  
  const navigateMonth = (direction) => {
    const newDate = new Date(calendarDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCalendarDate(newDate);
  };
  
  const isDateDisabled = (date) => {
    if (!date) return true;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (disablePast && date < today) return true;
    if (disableFuture && date > today) return true;
    
    if (minDate) {
      const min = new Date(minDate);
      min.setHours(0, 0, 0, 0);
      if (date < min) return true;
    }
    
    if (maxDate) {
      const max = new Date(maxDate);
      max.setHours(0, 0, 0, 0);
      if (date > max) return true;
    }
    
    return false;
  };
  
  const renderHelperText = () => {
    if (error && helperText) {
      return <div className="date-picker__helper-text date-picker__helper-text--error">{helperText}</div>;
    } else if (helperText) {
      return <div className="date-picker__helper-text">{helperText}</div>;
    }
    return null;
  };
  
  const renderCalendar = () => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const calendarMatrix = getCalendarMatrix(year, month);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const selectedDate = value ? new Date(value) : null;
    if (selectedDate) {
      selectedDate.setHours(0, 0, 0, 0);
    }
    
    return (
      <div className="date-picker__calendar" ref={calendarRef}>
        <div className="date-picker__calendar-header">
          <button
            type="button"
            className="date-picker__nav-button"
            onClick={() => navigateMonth(-1)}
          >
            <span className="date-picker__nav-icon">&#9664;</span>
          </button>
          
          <div className="date-picker__current-month">
            {`${MONTHS[month]} ${year}`}
          </div>
          
          <button
            type="button"
            className="date-picker__nav-button"
            onClick={() => navigateMonth(1)}
          >
            <span className="date-picker__nav-icon">&#9654;</span>
          </button>
        </div>
        
        <div className="date-picker__weekdays">
          {DAYS_OF_WEEK.map((day, index) => (
            <div key={index} className="date-picker__weekday">{day}</div>
          ))}
        </div>
        
        <div className="date-picker__days">
          {calendarMatrix.map((week, weekIndex) => (
            <div key={weekIndex} className="date-picker__week">
              {week.map((day, dayIndex) => {
                if (day === null) {
                  return <div key={dayIndex} className="date-picker__day date-picker__day--empty"></div>;
                }
                
                const currentDate = new Date(year, month, day);
                const isDisabled = isDateDisabled(currentDate);
                const isToday = currentDate.getTime() === today.getTime();
                const isSelected = selectedDate && currentDate.getTime() === selectedDate.getTime();
                
                const dayClasses = [
                  'date-picker__day',
                  isDisabled ? 'date-picker__day--disabled' : '',
                  isToday ? 'date-picker__day--today' : '',
                  isSelected ? 'date-picker__day--selected' : ''
                ].filter(Boolean).join(' ');
                
                return (
                  <div
                    key={dayIndex}
                    className={dayClasses}
                    onClick={() => !isDisabled && handleDateClick(day)}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  const hasValue = inputValue !== '';
  
  const datePickerClasses = [
    'date-picker',
    `date-picker--${size}`,
    focused ? 'date-picker--focused' : '',
    hasValue ? 'date-picker--has-value' : '',
    error ? 'date-picker--error' : '',
    disabled ? 'date-picker--disabled' : '',
    fullWidth ? 'date-picker--full-width' : '',
    readOnly ? 'date-picker--readonly' : '',
    className
  ].filter(Boolean).join(' ');

  const labelClasses = [
    'date-picker__label',
    (focused || hasValue) ? 'date-picker__label--float' : '',
    error ? 'date-picker__label--error' : '',
    disabled ? 'date-picker__label--disabled' : '',
    required ? 'date-picker__label--required' : ''
  ].filter(Boolean).join(' ');
  
  return (
    <div className={datePickerClasses}>
      <div className="date-picker__input-container">
        <input
          ref={inputRef}
          type="text"
          className="date-picker__input"
          name={name}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onClick={handleInputClick}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          {...restProps}
        />
        
        {label && <label className={labelClasses}>{label}</label>}
        
        <div className="date-picker__indicators">
          {clearable && hasValue && (
            <button 
              type="button"
              className="date-picker__clear-btn"
              onClick={handleClear}
              aria-label="Xóa giá trị"
            >
              &times;
            </button>
          )}
          
          <div className="date-picker__calendar-icon">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path d="M9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z" fill="currentColor" />
            </svg>
          </div>
        </div>
      </div>
      
      {isOpen && renderCalendar()}
      
      {renderHelperText()}
    </div>
  );
};

DatePicker.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.instanceOf(Date)]),
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  placeholder: PropTypes.string,
  format: PropTypes.string,
  error: PropTypes.bool,
  helperText: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  fullWidth: PropTypes.bool,
  className: PropTypes.string,
  minDate: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.instanceOf(Date)]),
  maxDate: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.instanceOf(Date)]),
  disablePast: PropTypes.bool,
  disableFuture: PropTypes.bool,
  clearable: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  readOnly: PropTypes.bool
};

export default DatePicker; 