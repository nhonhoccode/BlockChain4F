/**
 * API Testing Utility
 * Kiểm tra kết nối API cho tất cả các vai trò
 */

import { API_CONFIG, API_ENDPOINTS, api } from './api';

/**
 * API Testing Utility
 * Used to test API connections for all user roles (citizen, officer, chairman)
 */
const apiTest = {
  /**
   * Run tests for all API endpoints
   */
  runAllTests: async () => {
    console.group('🚀 API TESTS - ALL ENDPOINTS');
    
    try {
      // Set API_CONFIG to use real endpoints
      API_CONFIG.useMockDataFallback = false;
      console.log('🔧 Mock data fallback disabled for testing');
      
      // Test all endpoints
      await apiTest.testAuthAPI();
      await apiTest.testCitizenAPI();
      await apiTest.testOfficerAPI();
      await apiTest.testChairmanAPI();
      
      console.log('✅ All API tests completed');
    } catch (error) {
      console.error('❌ Error during API tests:', error);
    } finally {
      console.groupEnd();
    }
  },
  
  /**
   * Test Auth API endpoints
   */
  testAuthAPI: async () => {
    console.group('🔑 Testing Auth API');
    
    try {
      // Test login endpoint (just a connectivity test without actual login)
      const loginUrl = API_ENDPOINTS.AUTH.LOGIN;
      console.log(`🔍 Testing login endpoint: ${loginUrl}`);
      
      try {
        // Just test OPTIONS to avoid actual login attempts
        await api.options(loginUrl);
        console.log('✅ Login endpoint is accessible');
      } catch (error) {
        console.error('❌ Login endpoint error:', error.message);
      }
      
      // Test user profile endpoint
      const profileUrl = API_ENDPOINTS.AUTH.PROFILE;
      console.log(`🔍 Testing profile endpoint: ${profileUrl}`);
      
      try {
        await api.options(profileUrl);
        console.log('✅ Profile endpoint is accessible');
      } catch (error) {
        console.error('❌ Profile endpoint error:', error.message);
      }
      
      console.log('✅ Auth API tests completed');
    } catch (error) {
      console.error('❌ Error during Auth API tests:', error);
    } finally {
      console.groupEnd();
    }
  },
  
  /**
   * Test Citizen API endpoints
   */
  testCitizenAPI: async () => {
    console.group('👤 Testing Citizen API');
    
    try {
      // Test dashboard endpoint
      const dashboardUrl = API_ENDPOINTS.CITIZEN.DASHBOARD;
      console.log(`🔍 Testing citizen dashboard endpoint: ${dashboardUrl}`);
      
      try {
        await api.options(dashboardUrl);
        console.log('✅ Citizen dashboard endpoint is accessible');
      } catch (error) {
        console.error('❌ Citizen dashboard endpoint error:', error.message);
      }
      
      // Test requests endpoint
      const requestsUrl = API_ENDPOINTS.CITIZEN.REQUESTS;
      console.log(`🔍 Testing citizen requests endpoint: ${requestsUrl}`);
      
      try {
        await api.options(requestsUrl);
        console.log('✅ Citizen requests endpoint is accessible');
      } catch (error) {
        console.error('❌ Citizen requests endpoint error:', error.message);
      }
      
      // Test documents endpoint
      const documentsUrl = API_ENDPOINTS.CITIZEN.DOCUMENTS;
      console.log(`🔍 Testing citizen documents endpoint: ${documentsUrl}`);
      
      try {
        await api.options(documentsUrl);
        console.log('✅ Citizen documents endpoint is accessible');
      } catch (error) {
        console.error('❌ Citizen documents endpoint error:', error.message);
      }
      
      console.log('✅ Citizen API tests completed');
    } catch (error) {
      console.error('❌ Error during Citizen API tests:', error);
    } finally {
      console.groupEnd();
    }
  },
  
  /**
   * Test Officer API endpoints
   */
  testOfficerAPI: async () => {
    console.group('👮 Testing Officer API');
    
    try {
      // Test dashboard endpoint
      const dashboardUrl = API_ENDPOINTS.OFFICER.DASHBOARD;
      console.log(`🔍 Testing officer dashboard endpoint: ${dashboardUrl}`);
      
      try {
        await api.options(dashboardUrl);
        console.log('✅ Officer dashboard endpoint is accessible');
      } catch (error) {
        console.error('❌ Officer dashboard endpoint error:', error.message);
      }
      
      // Test pending requests endpoint
      const pendingUrl = API_ENDPOINTS.OFFICER.PENDING_REQUESTS;
      console.log(`🔍 Testing officer pending requests endpoint: ${pendingUrl}`);
      
      try {
        await api.options(pendingUrl);
        console.log('✅ Officer pending requests endpoint is accessible');
      } catch (error) {
        console.error('❌ Officer pending requests endpoint error:', error.message);
      }
      
      // Test citizens endpoint
      const citizensUrl = API_ENDPOINTS.OFFICER.CITIZENS;
      console.log(`🔍 Testing officer citizens endpoint: ${citizensUrl}`);
      
      try {
        await api.options(citizensUrl);
        console.log('✅ Officer citizens endpoint is accessible');
      } catch (error) {
        console.error('❌ Officer citizens endpoint error:', error.message);
      }
      
      console.log('✅ Officer API tests completed');
    } catch (error) {
      console.error('❌ Error during Officer API tests:', error);
    } finally {
      console.groupEnd();
    }
  },
  
  /**
   * Test Chairman API endpoints
   */
  testChairmanAPI: async () => {
    console.group('👑 Testing Chairman API');
    
    try {
      // Test dashboard endpoint
      const dashboardUrl = API_ENDPOINTS.CHAIRMAN.DASHBOARD;
      console.log(`🔍 Testing chairman dashboard endpoint: ${dashboardUrl}`);
      
      try {
        await api.options(dashboardUrl);
        console.log('✅ Chairman dashboard endpoint is accessible');
      } catch (error) {
        console.error('❌ Chairman dashboard endpoint error:', error.message);
      }
      
      // Test officer approvals endpoint
      const approvalsUrl = API_ENDPOINTS.CHAIRMAN.OFFICER_APPROVALS;
      console.log(`🔍 Testing chairman officer approvals endpoint: ${approvalsUrl}`);
      
      try {
        await api.options(approvalsUrl);
        console.log('✅ Chairman officer approvals endpoint is accessible');
      } catch (error) {
        console.error('❌ Chairman officer approvals endpoint error:', error.message);
      }
      
      // Test reports endpoint
      const reportsUrl = API_ENDPOINTS.CHAIRMAN.REPORTS;
      console.log(`🔍 Testing chairman reports endpoint: ${reportsUrl}`);
      
      try {
        await api.options(reportsUrl);
        console.log('✅ Chairman reports endpoint is accessible');
      } catch (error) {
        console.error('❌ Chairman reports endpoint error:', error.message);
      }
      
      console.log('✅ Chairman API tests completed');
    } catch (error) {
      console.error('❌ Error during Chairman API tests:', error);
    } finally {
      console.groupEnd();
    }
  }
};

export default apiTest; 