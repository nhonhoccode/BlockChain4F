// Định nghĩa các breakpoints cho responsive design
const breakpoints = {
  values: {
    xs: 0,
    sm: 600,
    md: 960,
    lg: 1280,
    xl: 1920,
  },
};

// Media query helpers
export const mediaQuery = {
  up: (key) => `@media (min-width: ${breakpoints.values[key]}px)`,
  down: (key) => `@media (max-width: ${breakpoints.values[key] - 0.05}px)`,
  between: (start, end) =>
    `@media (min-width: ${breakpoints.values[start]}px) and (max-width: ${breakpoints.values[end] - 0.05}px)`,
  only: (key) => {
    if (key === 'xl') {
      return mediaQuery.up('xl');
    }
    const keys = Object.keys(breakpoints.values);
    const index = keys.indexOf(key);
    return mediaQuery.between(key, keys[index + 1]);
  },
};

export default breakpoints;
