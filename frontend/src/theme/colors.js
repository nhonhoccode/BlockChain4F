// Color palette for the application

export const primaryColors = {
  main: '#0069a7', // Main primary color - official blue
  light: '#4b96d6', // Light primary color
  dark: '#004e79', // Dark primary color
  contrastText: '#ffffff', // Text color on primary background
};

export const secondaryColors = {
  main: '#2e7d32', // Main secondary color - green for success, approval
  light: '#60ad5e', // Light secondary color
  dark: '#005005', // Dark secondary color
  contrastText: '#ffffff', // Text color on secondary background
};

export const errorColors = {
  main: '#d32f2f', // Error red
  light: '#ef5350',
  dark: '#c62828',
  contrastText: '#ffffff',
};

export const warningColors = {
  main: '#ed6c02', // Warning orange
  light: '#ff9800',
  dark: '#e65100',
  contrastText: '#ffffff',
};

export const infoColors = {
  main: '#0288d1', // Info blue
  light: '#03a9f4',
  dark: '#01579b',
  contrastText: '#ffffff',
};

export const successColors = {
  main: '#2e7d32', // Success green (same as secondary)
  light: '#4caf50',
  dark: '#1b5e20',
  contrastText: '#ffffff',
};

export const greyColors = {
  50: '#fafafa',
  100: '#f5f5f5',
  200: '#eeeeee',
  300: '#e0e0e0',
  400: '#bdbdbd',
  500: '#9e9e9e',
  600: '#757575',
  700: '#616161',
  800: '#424242',
  900: '#212121',
  A100: '#f5f5f5',
  A200: '#eeeeee',
  A400: '#bdbdbd',
  A700: '#616161',
};

export const backgroundColors = {
  default: '#ffffff',
  paper: '#ffffff',
  neutral: '#f5f7fa',
};

export const textColors = {
  primary: '#212121',
  secondary: '#757575',
  disabled: '#9e9e9e',
};

export const actionColors = {
  active: 'rgba(0, 0, 0, 0.54)',
  hover: 'rgba(0, 0, 0, 0.04)',
  selected: 'rgba(0, 0, 0, 0.08)',
  disabled: 'rgba(0, 0, 0, 0.26)',
  disabledBackground: 'rgba(0, 0, 0, 0.12)',
  focus: 'rgba(0, 0, 0, 0.12)',
};

// Export color object for theme
const colors = {
  primary: {
    300: primaryColors.light,
    500: primaryColors.main,
    700: primaryColors.dark,
    contrastText: primaryColors.contrastText
  },
  secondary: {
    300: secondaryColors.light,
    500: secondaryColors.main,
    700: secondaryColors.dark,
    contrastText: secondaryColors.contrastText
  },
  error: {
    300: errorColors.light,
    500: errorColors.main,
    700: errorColors.dark,
    contrastText: errorColors.contrastText
  },
  warning: {
    300: warningColors.light,
    500: warningColors.main,
    700: warningColors.dark,
    contrastText: warningColors.contrastText
  },
  info: {
    300: infoColors.light,
    500: infoColors.main,
    700: infoColors.dark,
    contrastText: infoColors.contrastText
  },
  success: {
    300: successColors.light,
    500: successColors.main,
    700: successColors.dark,
    contrastText: successColors.contrastText
  },
  grey: greyColors,
  background: backgroundColors,
  text: textColors,
  action: actionColors
};

export default colors;
