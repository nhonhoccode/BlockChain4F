/**
 * API Debugging Utility
 * 
 * This utility helps diagnose API connection and authentication issues.
 * It can be used to test API endpoints, verify tokens, and diagnose errors.
 */
import axios from 'axios';
import { API_ENDPOINTS, API_BASE_URL } from './apiConfig';

const API_DEBUGGER = {
  /**
   * Test API connection with detailed logging
   * @param {string} url - API endpoint to test
   * @returns {Promise<Object>} - Result of the API test
   */
  testEndpoint: async (url) => {
    console.group(`🔍 Testing API endpoint: ${url}`);
    try {
      // Get token if available
      const token = localStorage.getItem('token');
      const hasToken = !!token;
      
      console.log(`Token exists: ${hasToken}`);
      if (hasToken) {
        console.log(`Token prefix: ${token.substring(0, 10)}...`);
        console.log(`Token length: ${token.length}`);
      }
      
      // Create test request
      const headers = {};
      if (hasToken) {
        headers['Authorization'] = `Token ${token.replace(/^(Bearer |Token )/, '')}`;
        // Also try with Bearer format in a separate header
        headers['X-Authorization'] = `Bearer ${token.replace(/^(Bearer |Token )/, '')}`;
      }
      
      console.log('Request headers:', headers);
      
      // Send manual request without using the API utility
      const response = await axios.get(url, { headers });
      
      console.log(`✅ API test successful (${response.status}):`);
      console.log('Response data:', response.data);
      
      return {
        success: true,
        status: response.status,
        data: response.data
      };
    } catch (error) {
      console.error(`❌ API test failed:`, error);
      
      let errorDetails = {
        message: error.message,
        response: null
      };
      
      if (error.response) {
        errorDetails.status = error.response.status;
        errorDetails.statusText = error.response.statusText;
        errorDetails.data = error.response.data;
        
        console.error(`Status: ${error.response.status} ${error.response.statusText}`);
        console.error('Response data:', error.response.data);
      } else if (error.request) {
        console.error('No response received:', error.request);
        errorDetails.request = true;
      }
      
      return {
        success: false,
        error: errorDetails
      };
    } finally {
      console.groupEnd();
    }
  },
  
  /**
   * Run a full API diagnostic test
   * @param {boolean} verbose - Whether to log verbose details
   * @returns {Promise<Object>} - Diagnostic results
   */
  runDiagnostic: async (verbose = true) => {
    console.group('🛠️ API DIAGNOSTICS');
    const results = {
      auth: null,
      endpoints: {},
      token: null
    };
    
    try {
      // Check token
      const token = localStorage.getItem('token');
      if (token) {
        results.token = {
          exists: true,
          prefix: token.substring(0, 6),
          length: token.length,
          format: token.startsWith('eyJ') ? 'JWT' : 'Unknown'
        };
        
        if (verbose) {
          console.log('Token details:', {
            prefix: token.substring(0, 10) + '...',
            length: token.length,
            format: token.startsWith('eyJ') ? 'JWT' : 'Unknown'
          });
        }
      } else {
        results.token = { exists: false };
        console.warn('No authentication token found');
      }
      
      // Run tests for key endpoints
      const endpoints = [
        // Auth endpoints
        '/api/v1/auth/user/',
        // Officer endpoints
        '/api/v1/officer/dashboard/stats/',
        '/api/v1/officer/profile/',
        '/api/v1/officer/requests/pending/',
        // Server health check
        '/api/health/'
      ];
      
      for (const endpoint of endpoints) {
        console.log(`Testing endpoint: ${endpoint}`);
        results.endpoints[endpoint] = await API_DEBUGGER.testEndpoint(endpoint);
      }
      
      // Test auth specifically
      if (results.endpoints['/api/v1/auth/user/'].success) {
        results.auth = {
          authenticated: true,
          userData: results.endpoints['/api/v1/auth/user/'].data
        };
      } else {
        results.auth = {
          authenticated: false,
          error: results.endpoints['/api/v1/auth/user/'].error
        };
      }
      
      return results;
    } catch (error) {
      console.error('Diagnostic error:', error);
      return {
        success: false,
        error: error.message
      };
    } finally {
      console.groupEnd();
    }
  },
  
  /**
   * Fix common token issues
   * @returns {Promise<Object>} - Result of the fix attempt
   */
  fixTokenIssues: async () => {
    console.group('🔧 Attempting to fix token issues');
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.warn('No token found, nothing to fix');
        return { success: false, message: 'No token found' };
      }
      
      console.log('Original token:', token.substring(0, 10) + '...');
      
      // Try to fix token format issues
      let fixedToken = token;
      
      // Remove any prefix that might be there
      fixedToken = fixedToken.replace(/^(Bearer |Token )/, '');
      
      // If token is a JSON string containing a token field, extract it
      try {
        const parsed = JSON.parse(fixedToken);
        if (parsed.token) {
          console.log('Token appears to be a JSON object, extracting token field');
          fixedToken = parsed.token;
        } else if (parsed.access) {
          console.log('Token appears to be a JSON object, extracting access field');
          fixedToken = parsed.access;
        }
      } catch (e) {
        // Not JSON, continue
      }
      
      // Save the fixed token
      if (fixedToken !== token) {
        console.log('Fixed token:', fixedToken.substring(0, 10) + '...');
        localStorage.setItem('token', fixedToken);
        return { success: true, message: 'Token format fixed' };
      } else {
        console.log('Token format appears correct, no changes made');
        return { success: true, message: 'Token already in correct format' };
      }
    } catch (error) {
      console.error('Error fixing token:', error);
      return { success: false, error: error.message };
    } finally {
      console.groupEnd();
    }
  },

  /**
   * Test API connection and log detailed results
   */
  testConnection: async () => {
    console.log('🔍 API Debugger: Testing connection to API server...');
    console.log(`🌐 API Base URL: ${API_BASE_URL}`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/healthcheck/`, { 
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      console.log(`✅ API Server responded with status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API Health Check Response:', data);
        return { success: true, message: 'API connection successful', data };
      } else {
        console.error('❌ API Health Check Failed with status:', response.status);
        return { success: false, message: `API responded with status ${response.status}` };
      }
    } catch (error) {
      console.error('❌ API Connection Error:', error);
      return { 
        success: false, 
        message: `Could not connect to API: ${error.message}`,
        error
      };
    }
  },
  
  /**
   * Debug user authentication state
   */
  debugAuth: () => {
    console.log('🔍 API Debugger: Checking authentication state...');
    
    const token = localStorage.getItem('token');
    const authUser = localStorage.getItem('authUser');
    
    if (!token) {
      console.error('❌ No authentication token found in localStorage');
      return { success: false, message: 'No authentication token found' };
    }
    
    console.log(`✅ Token found (length: ${token.length})`);
    console.log(`✅ Token starts with: ${token.substring(0, 15)}...`);
    
    try {
      // Try to decode the token if it's a JWT
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        // Looks like a JWT
        const payload = JSON.parse(atob(tokenParts[1]));
        console.log('✅ Token payload:', payload);
        
        // Check expiration
        if (payload.exp) {
          const expiryDate = new Date(payload.exp * 1000);
          const now = new Date();
          if (expiryDate < now) {
            console.error('❌ Token is expired:', expiryDate);
            return { success: false, message: 'Token is expired', expiryDate };
          } else {
            console.log('✅ Token is valid until:', expiryDate);
          }
        }
      } else {
        console.log('⚠️ Token does not appear to be a JWT - could be a simple token');
      }
    } catch (error) {
      console.error('⚠️ Error decoding token (may not be a JWT):', error);
    }
    
    if (authUser) {
      try {
        const user = JSON.parse(authUser);
        console.log('✅ User info found:', user);
      } catch (error) {
        console.error('❌ Error parsing user info:', error);
      }
    } else {
      console.warn('⚠️ No user info found in localStorage');
    }
    
    return { success: true, message: 'Authentication token is present' };
  },
  
  /**
   * Debug request submission process
   * @param {Object} requestData - The request data to be submitted
   * @param {number} requestId - The ID of the request for submission (if applicable)
   */
  debugRequest: (requestData, requestId = null) => {
    console.log('🔍 API Debugger: Analyzing request data...');
    
    if (!requestData && !requestId) {
      console.error('❌ No request data or request ID provided');
      return { success: false, message: 'No request data or request ID provided' };
    }
    
    if (requestData) {
      console.log('📦 Request data:', requestData);
      
      // Validate required fields for creating a request
      const requiredFields = ['title', 'description', 'document_type'];
      const missingFields = requiredFields.filter(field => !requestData[field]);
      
      if (missingFields.length > 0) {
        console.error(`❌ Missing required fields: ${missingFields.join(', ')}`);
        return { 
          success: false, 
          message: `Missing required fields: ${missingFields.join(', ')}`,
          missingFields
        };
      }
    }
    
    // Check if we're submitting an existing request
    if (requestId) {
      console.log(`📝 Submitting existing request with ID: ${requestId}`);
      
      // Check token for submission authorization
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ No authentication token found for request submission');
        return { 
          success: false, 
          message: 'No authentication token found for request submission'
        };
      }
      
      console.log('✅ Request data appears valid for submission');
      return { 
        success: true, 
        message: 'Request data appears valid for submission',
        endpoint: `/api/v1/requests/${requestId}/submit/`
      };
    }
    
    console.log('✅ Request data appears valid for creation');
    return { 
      success: true, 
      message: 'Request data appears valid for creation',
      endpoint: `/api/v1/requests/`
    };
  },

  /**
   * Specifically debug the officer dashboard API
   * @returns {Promise<Object>} - Result of the officer dashboard API test
   */
  debugOfficerDashboard: async () => {
    console.group('🛠️ Officer Dashboard API Debug');
    try {
      console.log('Testing officer dashboard endpoint...');
      const url = `${API_BASE_URL}${API_ENDPOINTS.OFFICER.DASHBOARD}`;
      console.log(`URL: ${url}`);
      
      // Get token
      const token = localStorage.getItem('token');
      const hasToken = !!token;
      console.log(`Token exists: ${hasToken}`);
      
      if (!hasToken) {
        return {
          success: false,
          error: 'No authentication token found'
        };
      }
      
      console.log(`Token length: ${token.length}`);
      console.log(`Token prefix: ${token.substring(0, 10)}...`);
      
      // Create headers
      const headers = {
        'Authorization': `Token ${token.replace(/^(Bearer |Token )/, '')}`
      };
      
      // Make the request
      const response = await axios.get(url, { headers });
      console.log('Dashboard API response:', response);
      
      return {
        success: true,
        status: response.status,
        data: response.data
      };
    } catch (error) {
      console.error('Dashboard API error:', error);
      
      // Analyze the error
      let errorAnalysis = {
        message: error.message,
        type: 'unknown'
      };
      
      if (error.response) {
        errorAnalysis.status = error.response.status;
        errorAnalysis.data = error.response.data;
        
        // Check for specific error patterns
        if (error.response.status === 401) {
          errorAnalysis.type = 'authentication';
          errorAnalysis.recommendation = 'Token may be invalid or expired. Try logging in again.';
        } else if (error.response.status === 403) {
          errorAnalysis.type = 'permission';
          errorAnalysis.recommendation = 'User may not have officer role or permissions.';
        } else if (error.response.status === 500) {
          errorAnalysis.type = 'server';
          errorAnalysis.recommendation = 'There may be a backend error. Check server logs.';
          
          // Look for field name issues in the error
          if (error.response.data && error.response.data.error) {
            const errorMsg = error.response.data.error.toLowerCase();
            if (errorMsg.includes('assigned_to') || errorMsg.includes('attributeerror')) {
              errorAnalysis.fieldIssue = 'Possible field name mismatch. Check if "assigned_to" should be "assigned_officer".';
            }
          }
        }
      } else if (error.request) {
        errorAnalysis.type = 'network';
        errorAnalysis.recommendation = 'API server may be down or unreachable.';
      }
      
      return {
        success: false,
        error: errorAnalysis
      };
    } finally {
      console.groupEnd();
    }
  }
};

// Attach to window for easy console debugging
if (typeof window !== 'undefined') {
  window.ApiDebugger = API_DEBUGGER;
}

export default API_DEBUGGER; 