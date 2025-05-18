import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useParams } from 'react-router-dom';

const ProcessRequest = () => {
  const { id } = useParams();
  
  return (
    <Box sx={{ py: 3, px: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Xử lý yêu cầu
      </Typography>
      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography>
          Trang xử lý yêu cầu có ID: {id}.
        </Typography>
      </Paper>
    </Box>
  );
};

export default ProcessRequest; 