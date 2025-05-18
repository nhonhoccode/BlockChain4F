import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const PendingRequests = () => {
  return (
    <Box sx={{ py: 3, px: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Yêu cầu đang chờ xử lý
      </Typography>
      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography>
          Trang danh sách yêu cầu đang chờ xử lý của cán bộ.
        </Typography>
      </Paper>
    </Box>
  );
};

export default PendingRequests; 