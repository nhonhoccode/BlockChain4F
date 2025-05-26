import React from 'react';
import PropTypes from 'prop-types';
import { Paper, Typography, Box, IconButton, Divider } from '@mui/material';
import styles from './InfoCard.module.scss';

/**
 * InfoCard - Component hiển thị thông tin dạng card
 */
const InfoCard = ({
  title,
  subtitle,
  icon,
  iconColor,
  content,
  actions,
  footer,
  variant = 'default',
  className,
  onClick,
  ...rest
}) => {
  return (
    <Paper 
      className={`${styles.infoCard} ${styles[variant]} ${onClick ? styles.clickable : ''} ${className || ''}`}
      onClick={onClick}
      {...rest}
    >
      <Box className={styles.header}>
        {icon && (
          <Box className={styles.iconContainer} style={{ color: iconColor }}>
            {icon}
          </Box>
        )}
        <Box className={styles.titleContainer}>
          {title && <Typography variant="h6" className={styles.title}>{title}</Typography>}
          {subtitle && <Typography variant="body2" className={styles.subtitle}>{subtitle}</Typography>}
        </Box>
        {actions && (
          <Box className={styles.actions}>
            {actions}
          </Box>
        )}
      </Box>
      
      {content && (
        <Box className={styles.content}>
          {content}
        </Box>
      )}
      
      {footer && (
        <>
          <Divider />
          <Box className={styles.footer}>
            {footer}
          </Box>
        </>
      )}
    </Paper>
  );
};

InfoCard.propTypes = {
  title: PropTypes.node,
  subtitle: PropTypes.node,
  icon: PropTypes.node,
  iconColor: PropTypes.string,
  content: PropTypes.node,
  actions: PropTypes.node,
  footer: PropTypes.node,
  variant: PropTypes.oneOf(['default', 'outlined', 'elevation', 'success', 'warning', 'error', 'info']),
  className: PropTypes.string,
  onClick: PropTypes.func,
};

export default InfoCard;

