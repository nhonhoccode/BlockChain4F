import React, { useState } from 'react';
import { Box, Typography, Paper, Button, Stack, Alert, CircularProgress, Divider } from '@mui/material';
import { NetworkCheck as ApiIcon, CheckCircle as SuccessIcon, Error as ErrorIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import apiTest from '../../utils/apiTest';

/**
 * APITestWidget component
 * 
 * A reusable widget for testing API connections in development mode
 * Supports testing auth, citizen, officer, and chairman APIs
 */
const APITestWidget = ({ role, title, description, testFunction }) => {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const handleTest = async () => {
    try {
      setIsLoading(true);
      setResults([]);
      setError(null);
      setSuccess(false);
      
      // Add start indicator
      setResults([{ type: 'info', message: `🚀 Đang kiểm tra API ${title}...` }]);
      
      // Call the appropriate test function based on role
      let testFn;
      switch(role) {
        case 'auth':
          testFn = apiTest.testAuthAPI;
          break;
        case 'citizen':
          testFn = apiTest.testCitizenAPI;
          break;
        case 'officer':
          testFn = apiTest.testOfficerAPI;
          break;
        case 'chairman':
          testFn = apiTest.testChairmanAPI;
          break;
        default:
          testFn = apiTest.runAllTests;
      }
      
      // Run the test
      await testFn();
      
      // Add success indicator
      setResults(prev => [...prev, { type: 'success', message: `✅ Kiểm tra API ${title} hoàn tất. Xem console để biết chi tiết.` }]);
      setSuccess(true);
    } catch (err) {
      console.error(`Error testing ${role} API:`, err);
      setError(`Lỗi khi kiểm tra API: ${err.message}`);
      setResults(prev => [...prev, { type: 'error', message: `❌ Lỗi: ${err.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderTop: success ? '3px solid #4caf50' : error ? '3px solid #f44336' : '3px solid #2196f3'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <ApiIcon color="primary" sx={{ mr: 1, fontSize: 28 }} />
        <Typography variant="h6" component="h2">
          {title}
        </Typography>
      </Box>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {description}
      </Typography>
      
      <Divider sx={{ mb: 2 }} />
      
      <Box sx={{ mb: 2, flexGrow: 1 }}>
        {results.length > 0 ? (
          <Stack spacing={1} sx={{ maxHeight: 150, overflow: 'auto' }}>
            {results.map((result, index) => (
              <Alert key={index} severity={result.type} sx={{ py: 0.5 }}>
                {result.message}
              </Alert>
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', my: 2 }}>
            Nhấn nút kiểm tra để bắt đầu
          </Typography>
        )}
      </Box>
      
      <Box sx={{ mt: 'auto' }}>
        <Button
          variant="contained"
          fullWidth
          startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : success ? <SuccessIcon /> : error ? <ErrorIcon /> : <RefreshIcon />}
          onClick={handleTest}
          disabled={isLoading}
          color={success ? "success" : error ? "error" : "primary"}
        >
          {isLoading ? 'Đang kiểm tra...' : 'Kiểm tra kết nối API'}
        </Button>
      </Box>
    </Paper>
  );
};

export default APITestWidget; 