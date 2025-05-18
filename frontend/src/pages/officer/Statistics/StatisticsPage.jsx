import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material';

const StatisticsPage = () => {
  return (
    <Box sx={{ py: 3, px: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Thống kê hoạt động
      </Typography>
      
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Tổng quan
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h3" color="primary" align="center">
                  134
                </Typography>
                <Typography variant="body2" color="textSecondary" align="center">
                  Yêu cầu đã phê duyệt
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h3" color="error.main" align="center">
                  15
                </Typography>
                <Typography variant="body2" color="textSecondary" align="center">
                  Yêu cầu từ chối
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h3" color="warning.main" align="center">
                  8
                </Typography>
                <Typography variant="body2" color="textSecondary" align="center">
                  Yêu cầu đang chờ
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h3" color="success.main" align="center">
                  2.3
                </Typography>
                <Typography variant="body2" color="textSecondary" align="center">
                  Số ngày xử lý trung bình
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
      
      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Thống kê chi tiết
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          p: 4, 
          backgroundColor: 'rgba(0,0,0,0.02)',
          borderRadius: 1
        }}>
          <Typography color="textSecondary">
            Biểu đồ thống kê sẽ được hiển thị tại đây
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default StatisticsPage;
