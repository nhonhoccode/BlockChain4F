import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useParams } from 'react-router-dom';

const DocumentApproval = () => {
  const { id } = useParams();
  
  return (
    <Box sx={{ py: 3, px: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Phê duyệt tài liệu
      </Typography>
      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography>
          Trang phê duyệt tài liệu có ID: {id}.
        </Typography>
      </Paper>
    </Box>
  );
};

export default DocumentApproval; 