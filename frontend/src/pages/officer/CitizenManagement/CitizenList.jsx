import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const CitizenList = () => {
  return (
    <Box sx={{ py: 3, px: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Quản lý công dân
      </Typography>
      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography>
          Trang danh sách công dân trong hệ thống.
        </Typography>
      </Paper>
    </Box>
  );
};

export default CitizenList; 