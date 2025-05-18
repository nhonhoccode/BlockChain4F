import { createTheme } from '@mui/material/styles';
import { viVN } from '@mui/material/locale';
import typography from './typography';
import colors from './colors';

const theme = createTheme(
  {
    palette: {
      mode: 'light',
      primary: {
        main: colors.primary[500],
        light: colors.primary[300],
        dark: colors.primary[700],
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: colors.secondary[500],
        light: colors.secondary[300],
        dark: colors.secondary[700],
        contrastText: '#FFFFFF',
      },
      error: {
        main: colors.error[500],
        light: colors.error[300],
        dark: colors.error[700],
        contrastText: '#FFFFFF',
      },
      warning: {
        main: colors.warning[500],
        light: colors.warning[300],
        dark: colors.warning[700],
        contrastText: '#FFFFFF',
      },
      info: {
        main: colors.info[500],
        light: colors.info[300],
        dark: colors.info[700],
        contrastText: '#FFFFFF',
      },
      success: {
        main: colors.success[500],
        light: colors.success[300],
        dark: colors.success[700],
        contrastText: '#FFFFFF',
      },
      grey: colors.grey,
      text: {
        primary: colors.grey[900],
        secondary: colors.grey[700],
        disabled: colors.grey[500],
      },
      divider: colors.grey[300],
      background: {
        paper: '#FFFFFF',
        default: colors.grey[50],
      },
    },
    typography,
    shape: {
      borderRadius: 8,
    },
    mixins: {
      toolbar: {
        minHeight: 64,
      },
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1280,
        xl: 1920,
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          '*': {
            boxSizing: 'border-box',
          },
          html: {
            margin: 0,
            padding: 0,
            width: '100%',
            height: '100%',
            WebkitOverflowScrolling: 'touch',
          },
          body: {
            margin: 0,
            padding: 0,
            width: '100%',
            height: '100%',
          },
          '#root': {
            width: '100%',
            height: '100%',
          },
          input: {
            '&[type=number]': {
              MozAppearance: 'textfield',
              '&::-webkit-outer-spin-button': {
                margin: 0,
                WebkitAppearance: 'none',
              },
              '&::-webkit-inner-spin-button': {
                margin: 0,
                WebkitAppearance: 'none',
              },
            },
          },
          img: {
            display: 'block',
            maxWidth: '100%',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
          },
          containedPrimary: {
            boxShadow: '0 4px 6px rgba(0, 127, 255, 0.15)',
          },
          containedSecondary: {
            boxShadow: '0 4px 6px rgba(156, 39, 176, 0.15)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            padding: '12px 16px',
          },
        },
      },
    },
  },
  viVN // Thêm ngôn ngữ tiếng Việt
);

export default theme;
