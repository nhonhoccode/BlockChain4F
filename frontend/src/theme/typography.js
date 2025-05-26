// Typography configuration for the application

// Preferred font families
const fontFamily = [
  'Roboto',
  '-apple-system',
  'BlinkMacSystemFont',
  '"Segoe UI"',
  'Arial',
  'sans-serif',
  '"Apple Color Emoji"',
  '"Segoe UI Emoji"',
  '"Segoe UI Symbol"',
].join(',');

// Font weights
const fontWeightLight = 300;
const fontWeightRegular = 400;
const fontWeightMedium = 500;
const fontWeightBold = 700;

// Typography configuration
const typography = {
  fontFamily,
  fontWeightLight,
  fontWeightRegular,
  fontWeightMedium,
  fontWeightBold,
  
  // Headings
  h1: {
    fontWeight: fontWeightBold,
    fontSize: '2.5rem', // 40px
    lineHeight: 1.2,
    letterSpacing: '-0.01562em',
  },
  h2: {
    fontWeight: fontWeightBold,
    fontSize: '2rem', // 32px
    lineHeight: 1.2,
    letterSpacing: '-0.00833em',
  },
  h3: {
    fontWeight: fontWeightBold,
    fontSize: '1.75rem', // 28px
    lineHeight: 1.2,
    letterSpacing: '0em',
  },
  h4: {
    fontWeight: fontWeightMedium,
    fontSize: '1.5rem', // 24px
    lineHeight: 1.2,
    letterSpacing: '0.00735em',
  },
  h5: {
    fontWeight: fontWeightMedium,
    fontSize: '1.25rem', // 20px
    lineHeight: 1.2,
    letterSpacing: '0em',
  },
  h6: {
    fontWeight: fontWeightMedium,
    fontSize: '1.125rem', // 18px
    lineHeight: 1.2,
    letterSpacing: '0.0075em',
  },
  
  // Body text
  subtitle1: {
    fontWeight: fontWeightMedium,
    fontSize: '1rem', // 16px
    lineHeight: 1.5,
    letterSpacing: '0.00938em',
  },
  subtitle2: {
    fontWeight: fontWeightMedium,
    fontSize: '0.875rem', // 14px
    lineHeight: 1.57,
    letterSpacing: '0.00714em',
  },
  body1: {
    fontWeight: fontWeightRegular,
    fontSize: '1rem', // 16px
    lineHeight: 1.5,
    letterSpacing: '0.00938em',
  },
  body2: {
    fontWeight: fontWeightRegular,
    fontSize: '0.875rem', // 14px
    lineHeight: 1.43,
    letterSpacing: '0.01071em',
  },
  
  // Additional variants
  button: {
    fontWeight: fontWeightMedium,
    fontSize: '0.9375rem', // 15px
    lineHeight: 1.75,
    letterSpacing: '0.02857em',
    textTransform: 'capitalize', // Only capitalize first letter, not all uppercase
  },
  caption: {
    fontWeight: fontWeightRegular,
    fontSize: '0.75rem', // 12px
    lineHeight: 1.66,
    letterSpacing: '0.03333em',
  },
  overline: {
    fontWeight: fontWeightMedium,
    fontSize: '0.75rem', // 12px
    lineHeight: 2.66,
    letterSpacing: '0.08333em',
    textTransform: 'uppercase',
  },
};

export default typography;
