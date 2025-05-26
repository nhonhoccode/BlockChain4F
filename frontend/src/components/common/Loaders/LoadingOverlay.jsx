import React from 'react';
import { CircularProgress, Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';

/**
 * Loading overlay component that displays a centered spinner with optional text
 * @param {Object} props - Component props
 * @param {string} props.message - Message to display below the spinner
 * @param {boolean} props.fullScreen - Whether to display fullscreen or as a container
 * @returns {React.ReactNode} Loading overlay component
 */
const LoadingOverlay = ({ message = 'Đang tải...', fullScreen = true }) => {
  const styles = {
    position: fullScreen ? 'fixed' : 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 9999,
  };

  return (
    <Box sx={styles}>
      <CircularProgress size={60} thickness={4} color="primary" />
      {message && (
        <Typography
          variant="h6"
          component="div"
          sx={{ mt: 2, fontWeight: 500, color: 'text.primary' }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};

LoadingOverlay.propTypes = {
  message: PropTypes.string,
  fullScreen: PropTypes.bool
};

export default LoadingOverlay; 