import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const ImportantDocuments = () => {
  return (
    <Box sx={{ py: 3, px: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Tài liệu quan trọng
      </Typography>
      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography>
          Trang danh sách tài liệu quan trọng trong hệ thống.
        </Typography>
      </Paper>
    </Box>
  );
};

export default ImportantDocuments; 