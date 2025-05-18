import React from 'react';
import PropTypes from 'prop-types';
import { Paper, Typography, Box, CircularProgress, LinearProgress } from '@mui/material';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';
import styles from './StatCard.module.scss';

/**
 * StatCard - Component hiển thị thống kê dạng card
 */
const StatCard = ({
  title,
  value,
  icon,
  iconBgColor,
  iconColor = 'white',
  description,
  trend,
  trendValue,
  loading = false,
  progress,
  variant = 'default',
  onClick,
  className,
  ...rest
}) => {
  // Xác định màu và icon cho trend
  const getTrendColor = () => {
    if (trend === 'up') return styles.trendUp;
    if (trend === 'down') return styles.trendDown;
    return '';
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <ArrowUpward fontSize="small" />;
    if (trend === 'down') return <ArrowDownward fontSize="small" />;
    return null;
  };

  return (
    <Paper 
      className={`${styles.statCard} ${styles[variant]} ${onClick ? styles.clickable : ''} ${className || ''}`}
      onClick={onClick}
      {...rest}
    >
      {loading && <LinearProgress className={styles.loading} />}

      <Box className={styles.header}>
        <Box className={styles.infoContainer}>
          <Typography variant="h6" className={styles.title}>
            {title}
          </Typography>
          
          <Typography variant="h4" className={styles.value}>
            {value}
          </Typography>
          
          {(trend || trendValue) && (
            <Box className={`${styles.trend} ${getTrendColor()}`}>
              {getTrendIcon()}
              {trendValue && <span>{trendValue}</span>}
            </Box>
          )}
          
          {description && (
            <Typography variant="body2" className={styles.description}>
              {description}
            </Typography>
          )}
        </Box>
        
        {icon && (
          <Box 
            className={styles.iconContainer} 
            style={{ backgroundColor: iconBgColor || 'var(--color-primary-light)', color: iconColor }}
          >
            {icon}
          </Box>
        )}
      </Box>
      
      {progress !== undefined && (
        <Box className={styles.progressContainer}>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            className={styles.progress}
          />
          <Typography variant="caption" className={styles.progressText}>
            {progress}%
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.node,
  iconBgColor: PropTypes.string,
  iconColor: PropTypes.string,
  description: PropTypes.string,
  trend: PropTypes.oneOf(['up', 'down', null]),
  trendValue: PropTypes.string,
  loading: PropTypes.bool,
  progress: PropTypes.number,
  variant: PropTypes.oneOf(['default', 'outlined', 'elevation', 'primary', 'secondary', 'success', 'warning', 'error', 'info']),
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export default StatCard;
