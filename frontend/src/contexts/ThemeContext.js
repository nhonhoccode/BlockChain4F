import React, { createContext, useContext, useState, useEffect } from 'react';

// Tạo context
const ThemeContext = createContext();

// Provider component
export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState('light'); // 'light' hoặc 'dark'
  const [primaryColor, setPrimaryColor] = useState('#0069a7'); // Màu chính
  const [fontSize, setFontSize] = useState('normal'); // 'small', 'normal', 'large'

  // Lấy theme từ localStorage khi khởi tạo
  useEffect(() => {
    // Theme mode
    const storedMode = localStorage.getItem('themeMode');
    if (storedMode) {
      setMode(storedMode);
    }

    // Primary color
    const storedColor = localStorage.getItem('primaryColor');
    if (storedColor) {
      setPrimaryColor(storedColor);
    }

    // Font size
    const storedFontSize = localStorage.getItem('fontSize');
    if (storedFontSize) {
      setFontSize(storedFontSize);
    }
  }, []);

  // Thay đổi theme mode
  const toggleMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
    // Áp dụng class cho body
    document.documentElement.setAttribute('data-theme', newMode);
  };

  // Thay đổi màu chính
  const changePrimaryColor = (color) => {
    setPrimaryColor(color);
    localStorage.setItem('primaryColor', color);
    // Áp dụng màu sắc trên biến CSS toàn cục
    document.documentElement.style.setProperty('--color-primary', color);
  };

  // Thay đổi cỡ chữ
  const changeFontSize = (size) => {
    setFontSize(size);
    localStorage.setItem('fontSize', size);
    
    let rootFontSize;
    switch (size) {
      case 'small':
        rootFontSize = '14px';
        break;
      case 'large':
        rootFontSize = '18px';
        break;
      default:
        rootFontSize = '16px';
    }
    
    document.documentElement.style.fontSize = rootFontSize;
  };

  // Áp dụng theme khi thay đổi
  useEffect(() => {
    // Áp dụng mode
    document.documentElement.setAttribute('data-theme', mode);
    
    // Áp dụng màu sắc
    document.documentElement.style.setProperty('--color-primary', primaryColor);
    
    // Áp dụng cỡ chữ
    let rootFontSize;
    switch (fontSize) {
      case 'small':
        rootFontSize = '14px';
        break;
      case 'large':
        rootFontSize = '18px';
        break;
      default:
        rootFontSize = '16px';
    }
    document.documentElement.style.fontSize = rootFontSize;
  }, [mode, primaryColor, fontSize]);

  // Giá trị context
  const value = {
    mode,
    primaryColor,
    fontSize,
    toggleMode,
    changePrimaryColor,
    changeFontSize,
    isDarkMode: mode === 'dark',
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// Hook để sử dụng ThemeContext
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme phải được sử dụng trong ThemeProvider');
  }
  return context;
};

export default ThemeContext;
