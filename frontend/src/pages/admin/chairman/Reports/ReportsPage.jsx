import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const ReportsPage = () => {
  return (
    <Box sx={{ py: 3, px: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Báo cáo thống kê
      </Typography>
      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography>
          Trang báo cáo thống kê của hệ thống.
        </Typography>
      </Paper>
    </Box>
  );
};

export default ReportsPage; 