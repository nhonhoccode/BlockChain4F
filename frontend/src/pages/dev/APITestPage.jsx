import React, { useState } from 'react';
import { Box, Typography, Button, Paper, Stack, Divider, Alert, TextField, Grid } from '@mui/material';
import { Refresh as RefreshIcon, NetworkCheck as ApiIcon } from '@mui/icons-material';
import APITestWidget from '../../components/common/APITestWidget';
import apiTest from '../../utils/apiTest';

/**
 * API Test Page - Used for testing API connections
 * This page allows developers to test the API connections for all user roles
 */
const APITestPage = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiBaseUrl, setApiBaseUrl] = useState('http://localhost:8000');
  
  // Clear test results
  const clearResults = () => {
    setResults([]);
  };
  
  // Test all APIs at once
  const handleRunAllTests = async () => {
    try {
      setLoading(true);
      
      // Log start message
      setResults(prev => [
        ...prev,
        { type: 'info', message: '🚀 Starting API tests for all roles...' }
      ]);
      
      // Add delay to allow UI to update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Start the tests
      await apiTest.runAllTests();
      
      // Log completion message
      setResults(prev => [
        ...prev,
        { type: 'success', message: '✅ All API tests completed. Check the console for detailed results.' }
      ]);
    } catch (error) {
      console.error('Error running API tests:', error);
      setResults(prev => [
        ...prev,
        { type: 'error', message: `❌ Error running API tests: ${error.message}` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <ApiIcon color="primary" sx={{ mr: 2, fontSize: 36 }} />
        <Typography variant="h4" gutterBottom>
          API Test Page
        </Typography>
      </Box>
      
      <Typography variant="body1" paragraph>
        Trang này cho phép bạn kiểm tra kết nối API cho tất cả các vai trò người dùng. Các bài test sẽ hiển thị kết quả chi tiết trong console.
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          API Configuration
        </Typography>
        
        <TextField
          fullWidth
          label="API Base URL"
          value={apiBaseUrl}
          onChange={(e) => setApiBaseUrl(e.target.value)}
          margin="normal"
          variant="outlined"
          disabled={loading}
          helperText="This is read from API_BASE_URL in api.js"
        />
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            startIcon={<RefreshIcon />}
            variant="contained"
            onClick={handleRunAllTests}
            disabled={loading}
          >
            Test All Endpoints
          </Button>
        </Box>
      </Paper>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <APITestWidget 
            role="auth"
            title="Authentication API" 
            description="Tests connection to authentication endpoints including login, registration, and user profile"
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <APITestWidget 
            role="citizen"
            title="Citizen API" 
            description="Tests connection to citizen endpoints including dashboard, requests, and documents"
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <APITestWidget 
            role="officer"
            title="Officer API" 
            description="Tests connection to officer endpoints including dashboard, pending requests, and citizen management"
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <APITestWidget 
            role="chairman"
            title="Chairman API" 
            description="Tests connection to chairman endpoints including officer approvals, important documents, and reports"
          />
        </Grid>
      </Grid>
      
      {results.length > 0 && (
        <Paper sx={{ p: 2, mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Global Test Results
            </Typography>
            
            <Button 
              variant="outlined" 
              size="small" 
              onClick={clearResults}
              disabled={loading}
            >
              Clear Results
            </Button>
          </Box>
          
          <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
            {results.map((result, index) => (
              <Alert 
                key={index} 
                severity={result.type} 
                sx={{ mb: 1 }}
              >
                {result.message}
              </Alert>
            ))}
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default APITestPage; 