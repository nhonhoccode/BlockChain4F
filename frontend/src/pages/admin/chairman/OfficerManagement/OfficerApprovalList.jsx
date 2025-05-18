import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const OfficerApprovalList = () => {
  return (
    <Box sx={{ py: 3, px: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Phê duyệt cán bộ
      </Typography>
      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography>
          Trang danh sách cán bộ chờ phê duyệt.
        </Typography>
      </Paper>
    </Box>
  );
};

export default OfficerApprovalList; 