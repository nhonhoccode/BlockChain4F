import React, { useState, useEffect } from 'react';
import { Chip, Tooltip, Stack } from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Link as LinkIcon,
  Verified as VerifiedIcon
} from '@mui/icons-material';
import PropTypes from 'prop-types';

/**
 * A badge component that shows blockchain connection status
 * @param {Object} props - Component props
 * @param {Object} props.sx - Additional styles
 * @returns {React.ReactNode} Blockchain status badge
 */
const BlockchainBadge = ({ isVerified, blockchainId, sx = {} }) => {
  // In a real application, we would check the actual blockchain connection
  const [status, setStatus] = useState('connecting'); // 'connected', 'connecting', 'error'
  
  useEffect(() => {
    // Simulate checking for blockchain connection
    const timeoutId = setTimeout(() => {
      setStatus('connected');
    }, 2000);
    
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <Stack direction="row" spacing={1} sx={{ ml: 1, ...sx }}>
      {isVerified !== undefined && (
        <Tooltip title={isVerified ? "Đã xác thực trên blockchain" : "Chưa xác thực trên blockchain"}>
          <Chip
            icon={<VerifiedIcon />}
            label={isVerified ? "Đã xác thực" : "Chưa xác thực"}
            color={isVerified ? "success" : "default"}
            size="small"
            variant="outlined"
          />
        </Tooltip>
      )}
      
      {blockchainId && (
        <Tooltip title="ID trên blockchain">
          <Chip
            icon={<LinkIcon />}
            label={blockchainId.substring(0, 8) + '...'}
            color="primary"
            size="small"
            variant="outlined"
          />
        </Tooltip>
      )}
    </Stack>
  );
};

BlockchainBadge.propTypes = {
  isVerified: PropTypes.bool,
  blockchainId: PropTypes.string,
  sx: PropTypes.object
};

export default BlockchainBadge;
