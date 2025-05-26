/**
 * App Configuration
 * 
 * Central configuration for the application with settings
 * that can be changed based on environment or deployment needs.
 */

const APP_CONFIG = {
  // Base API URL for backend services
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000',
  
  // Debug settings
  debug: {
    // Log API requests and responses
    logApiCalls: true,
    // Show warnings and errors in console
    showDebugLogs: true
  },
  
  // Mock data settings
  mockData: {
    // Whether to use mock data when API requests fail
    useMockDataFallback: true,
    // Show warnings about mock data usage
    showMockDataWarnings: true
  },
  
  // Feature flags
  features: {
    // Enable blockchain verification features
    enableBlockchainVerification: true,
    // Enable advanced analytics features
    enableAnalytics: true
  },
  
  // Authentication settings
  auth: {
    // Session timeout in minutes (0 = no timeout)
    sessionTimeout: 30,
    // Allow social logins
    allowSocialLogin: true,
    // Whether to remember user between sessions
    rememberUserByDefault: false
  }
};

export default APP_CONFIG; 