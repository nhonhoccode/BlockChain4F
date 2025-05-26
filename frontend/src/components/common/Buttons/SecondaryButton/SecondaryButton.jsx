import React from 'react';
import styles from './SecondaryButton.module.scss';

const SecondaryButton = ({ 
  children, 
  onClick, 
  type = 'button', 
  disabled = false, 
  fullWidth = false,
  size = 'medium',
  startIcon,
  endIcon,
  className = '',
  variant = 'outlined',
  ...rest
}) => {
  return (
    <button
      className={`${styles.secondaryButton} ${styles[size]} ${styles[variant]} ${fullWidth ? styles.fullWidth : ''} ${className}`}
      onClick={onClick}
      type={type}
      disabled={disabled}
      {...rest}
    >
      {startIcon && <span className={styles.startIcon}>{startIcon}</span>}
      <span className={styles.buttonText}>{children}</span>
      {endIcon && <span className={styles.endIcon}>{endIcon}</span>}
    </button>
  );
};

export default SecondaryButton; 