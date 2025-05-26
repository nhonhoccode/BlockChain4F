/**
 * Test utility for diagnosing authentication issues
 */
import { api, API_ENDPOINTS } from './api';
import axios from 'axios';

const TestLogin = {
  /**
   * Test login with the provided credentials
   * @param {Object} credentials - The login credentials
   * @returns {Promise<Object>} - The login response
   */
  testLogin: async (credentials) => {
    try {
      console.log('🔍 Testing login with credentials:', {
        username: credentials.email,
        password: '***********' // Don't log the actual password
      });
      
      const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, {
        username: credentials.email,
        password: credentials.password,
        role: credentials.role
      });
      
      console.log('✅ Login successful:', response.data);
      
      // Store token in localStorage (just for testing)
      if (response.data.token || response.data.access) {
        const token = response.data.token || response.data.access;
        localStorage.setItem('token', token);
        console.log('✅ Token stored in localStorage');
        console.log('Token value (first 15 chars):', token.substring(0, 15));
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Login failed:', error);
      return {
        success: false,
        error: error.message,
        response: error.response?.data
      };
    }
  },
  
  /**
   * Test authenticated API access
   * @param {string} endpoint - The API endpoint to test
   * @returns {Promise<Object>} - The API response
   */
  testApiAccess: async (endpoint) => {
    try {
      console.log(`🔍 Testing API access to: ${endpoint}`);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('❌ No token found in localStorage');
        return { success: false, error: 'No token found' };
      }
      
      console.log('Token found in localStorage:', token.substring(0, 15) + '...');
      
      // Create test API instance with token
      const testApi = axios.create({
        baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token.replace(/^(Bearer |Token )/, '')}`
        }
      });
      
      const response = await testApi.get(endpoint);
      console.log('✅ API access successful:', response.data);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ API access failed:', error);
      return {
        success: false,
        error: error.message,
        response: error.response?.data
      };
    }
  },
  
  /**
   * Diagnose authentication issues
   * @returns {Promise<Object>} - The diagnostic results
   */
  diagnoseAuth: async () => {
    try {
      console.group('🔧 Authentication Diagnostics');
      
      // Check if token exists
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      if (token) {
        console.log('Token length:', token.length);
        console.log('Token prefix:', token.substring(0, 15) + '...');
      }
      
      // Check if authUser exists
      const authUser = localStorage.getItem('authUser');
      console.log('AuthUser exists:', !!authUser);
      if (authUser) {
        try {
          const user = JSON.parse(authUser);
          console.log('AuthUser data:', {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          });
        } catch (e) {
          console.error('Failed to parse authUser JSON:', e);
        }
      }
      
      // Test various API endpoints
      if (token) {
        console.log('🔍 Testing API endpoints with current token');
        
        // Test endpoints
        const endpoints = [
          '/api/v1/auth/user/',
          '/api/v1/officer/dashboard/stats/',
          '/api/v1/officer/profile/'
        ];
        
        for (const endpoint of endpoints) {
          const result = await TestLogin.testApiAccess(endpoint);
          console.log(`Endpoint ${endpoint}:`, result.success ? 'Success' : 'Failed', result);
        }
      }
      
      return { success: true, message: 'Diagnostics completed' };
    } catch (error) {
      console.error('❌ Diagnostics failed:', error);
      return { success: false, error: error.message };
    } finally {
      console.groupEnd();
    }
  }
};

export default TestLogin; 