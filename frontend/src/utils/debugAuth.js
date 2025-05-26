/**
 * Authentication Debug Utility
 * Helps diagnose common auth issues
 */

import axios from 'axios';
import { API_BASE_URL } from './apiConfig';

/**
 * Test authentication with direct requests
 * @param {Object} credentials - Email and password credentials
 * @returns {Promise<Object>} - Test results
 */
export const testAuthentication = async (credentials) => {
  const results = {
    token: null,
    status: 'failed',
    errors: [],
    profile: null,
    steps: []
  };
  
  try {
    // Step 1: Try the login endpoint directly
    results.steps.push({ name: 'Standard Login Attempt', status: 'pending' });
    
    try {
      console.log('Testing standard token endpoint with credentials...');
      const tokenResponse = await axios.post(
        `${API_BASE_URL}/api/v1/auth/token/`, 
        {
          username: credentials.email,
          password: credentials.password
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          }
        }
      );
      
      results.steps[0].status = 'success';
      results.steps[0].response = tokenResponse.data;
      results.token = tokenResponse.data.token;
      
      console.log('Token obtained successfully:', tokenResponse.data);
    } catch (error) {
      results.steps[0].status = 'failed';
      results.steps[0].error = {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data
      };
      
      console.error('Standard token request failed:', error.response || error.message);
      results.errors.push(`Standard token request failed: ${error.response?.status} ${error.message}`);
      
      // If standard login fails, try the debug endpoint
      results.steps.push({ name: 'Debug Login Attempt', status: 'pending' });
      
      try {
        console.log('Trying debug token endpoint...');
        const debugTokenResponse = await axios.post(
          `${API_BASE_URL}/api/v1/auth/debug-token/`, 
          {
            username: credentials.email,
            password: credentials.password
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        );
        
        results.steps[1].status = 'success';
        results.steps[1].response = debugTokenResponse.data;
        results.token = debugTokenResponse.data.token;
        
        console.log('Debug token obtained successfully:', debugTokenResponse.data);
      } catch (debugError) {
        results.steps[1].status = 'failed';
        results.steps[1].error = {
          status: debugError.response?.status,
          message: debugError.message,
          data: debugError.response?.data
        };
        
        console.error('Debug token request failed:', debugError.response || debugError.message);
        results.errors.push(`Debug token request failed: ${debugError.response?.status} ${debugError.message}`);
        
        // If debug endpoint also fails, try super debug endpoint
        results.steps.push({ name: 'Super Debug Login Attempt', status: 'pending' });
        
        try {
          console.log('Trying super debug token endpoint...');
          const superDebugTokenResponse = await axios.post(
            `${API_BASE_URL}/api/v1/auth/super-debug-token/`, 
            {
              username: credentials.email,
              password: credentials.password
            },
            {
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            }
          );
          
          results.steps[2].status = 'success';
          results.steps[2].response = superDebugTokenResponse.data;
          results.token = superDebugTokenResponse.data.token;
          
          console.log('Super debug token obtained successfully:', superDebugTokenResponse.data);
        } catch (superDebugError) {
          results.steps[2].status = 'failed';
          results.steps[2].error = {
            status: superDebugError.response?.status,
            message: superDebugError.message,
            data: superDebugError.response?.data
          };
          
          console.error('Super debug token request failed:', superDebugError.response || superDebugError.message);
          results.errors.push(`Super debug token request failed: ${superDebugError.response?.status} ${superDebugError.message}`);
        }
      }
    }
    
    // Step 2: If we got a token, try fetching the user profile
    if (results.token) {
      results.steps.push({ name: 'Profile Fetch', status: 'pending' });
      
      try {
        console.log('Testing profile endpoint with token...');
        const profileResponse = await axios.get(
          `${API_BASE_URL}/api/v1/auth/user/`,
          {
            headers: {
              'Authorization': `Token ${results.token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        results.steps[3].status = 'success';
        results.steps[3].response = profileResponse.data;
        results.profile = profileResponse.data;
        results.status = 'success';
        
        console.log('Profile obtained successfully:', profileResponse.data);
      } catch (error) {
        results.steps[3].status = 'failed';
        results.steps[3].error = {
          status: error.response?.status,
          message: error.message,
          data: error.response?.data
        };
        
        console.error('Profile request failed:', error.response || error.message);
        results.errors.push(`Profile request failed: ${error.response?.status} ${error.message}`);
      }
    }
    
    // Step 3: Test CSRF token fetch
    results.steps.push({ name: 'CSRF Token Fetch', status: 'pending' });
    
    try {
      console.log('Testing CSRF token fetch...');
      const csrfResponse = await axios.get(
        `${API_BASE_URL}/api/v1/auth/token/verify/`,
        { withCredentials: true }
      );
      
      results.steps[4].status = 'success';
      results.steps[4].response = {
        status: csrfResponse.status,
        cookies: document.cookie
      };
      
      console.log('CSRF test completed, cookies:', document.cookie);
    } catch (error) {
      results.steps[4].status = 'failed';
      results.steps[4].error = {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data
      };
      
      console.error('CSRF test failed:', error.response || error.message);
      results.errors.push(`CSRF test failed: ${error.response?.status} ${error.message}`);
    }
    
    return results;
  } catch (error) {
    console.error('Authentication test failed:', error);
    results.errors.push(`Test execution failed: ${error.message}`);
    return results;
  }
};

/**
 * Get suggestions based on test results
 * @param {Object} results - Test results
 * @returns {Array} - List of suggestions
 */
export const getSuggestions = (results) => {
  const suggestions = [];
  
  if (results.steps[0]?.status === 'failed') {
    const error = results.steps[0].error;
    
    if (error.status === 403) {
      suggestions.push('CSRF protection may be blocking the request. Make sure you have the correct CSRF token in headers.');
      suggestions.push('Try adding "X-CSRFToken" header with the token from cookies.');
      suggestions.push('Check if the backend has CSRF_EXEMPT for the token endpoint.');
    } 
    else if (error.status === 400) {
      suggestions.push('The server rejected the credentials. Check if the username/password format is correct.');
      suggestions.push('The backend might expect a different format than what you\'re sending.');
    }
    else if (error.status === 401) {
      suggestions.push('Invalid credentials. Check your username and password.');
    }
    else if (!error.status) {
      suggestions.push('Network error. Check if the backend server is running and accessible.');
      suggestions.push('Verify that the API_BASE_URL is correct.');
    }
  }
  
  if (results.token && results.steps[3]?.status === 'failed') {
    suggestions.push('Token was obtained but profile fetch failed. The token might not be properly formatted.');
    suggestions.push('Make sure you\'re using "Token" prefix, not "Bearer" in the Authorization header.');
  }
  
  if (suggestions.length === 0 && !results.token) {
    suggestions.push('Check backend logs for more information about the authentication failure.');
    suggestions.push('Verify that the token endpoint is correctly implemented in the backend.');
  }
  
  return suggestions;
};

export default {
  testAuthentication,
  getSuggestions
}; 