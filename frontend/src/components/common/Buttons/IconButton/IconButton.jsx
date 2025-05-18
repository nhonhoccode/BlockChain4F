import React from 'react';
import styles from './IconButton.module.scss';

const IconButton = ({
  children,
  onClick,
  type = 'button',
  disabled = false,
  size = 'medium',
  color = 'primary',
  className = '',
  title,
  ariaLabel,
  ...rest
}) => {
  return (
    <button
      className={`${styles.iconButton} ${styles[size]} ${styles[color]} ${className}`}
      onClick={onClick}
      type={type}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel || title}
      {...rest}
    >
      {children}
    </button>
  );
};

export default IconButton; 