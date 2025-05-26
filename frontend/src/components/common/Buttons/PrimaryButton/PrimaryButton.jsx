import React from 'react';
import styles from './PrimaryButton.module.scss';

const PrimaryButton = ({ 
  children, 
  onClick, 
  type = 'button', 
  disabled = false, 
  fullWidth = false,
  size = 'medium',
  startIcon,
  endIcon,
  className = '',
  ...rest
}) => {
  return (
    <button
      className={`${styles.primaryButton} ${styles[size]} ${fullWidth ? styles.fullWidth : ''} ${className}`}
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

export default PrimaryButton;
