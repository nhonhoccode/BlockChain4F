import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const OfficersList = () => {
  return (
    <Box sx={{ py: 3, px: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Danh sách cán bộ
      </Typography>
      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography>
          Trang danh sách cán bộ trong hệ thống.
        </Typography>
      </Paper>
    </Box>
  );
};

export default OfficersList; 