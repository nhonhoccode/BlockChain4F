/**
 * Mock Data Helper
 * 
 * Utility functions to support fallback to mock data 
 * when the backend API is not available.
 */

// Mock data configuration
export const MOCK_CONFIG = {
  // Whether to use mock data when API requests fail with 404/500 errors
  useMockDataFallback: true,
  // Display warnings in console about mock data usage
  showMockDataWarnings: true
};

/**
 * Checks if the given error should trigger mock data fallback
 * @param {Error} error - The error object from the API call
 * @returns {boolean} True if the error indicates we should use mock data
 */
export const shouldUseMockData = (error) => {
  // If mock data is disabled in config, always return false
  if (!MOCK_CONFIG.useMockDataFallback) {
    return false;
  }
  
  // Use mock data for 404 Not Found or 5xx Server Errors
  return error.response && (
    error.response.status === 404 || 
    (error.response.status >= 500 && error.response.status < 600)
  );
};

/**
 * Logs a warning about mock data usage
 * @param {string} serviceName - Name of the service (e.g. "auth", "citizen")
 * @param {string} functionName - Name of the function within the service
 */
export const logMockDataWarning = (serviceName, functionName) => {
  if (MOCK_CONFIG.showMockDataWarnings) {
    console.warn(`🔶 MOCK DATA: Using mock data for ${serviceName}.${functionName}. Backend API server is not responding.`);
    console.warn('🔶 This is a simulation for development. In production, connect to a real backend.');
  }
};

/**
 * Utility to handle API error with mock data fallback
 * @param {Error} error - Error from the failed API call
 * @param {string} serviceName - Name of the service
 * @param {string} functionName - Name of the function
 * @param {Object|Function} mockData - Mock data or function that returns mock data
 * @param {boolean} shouldThrow - Whether to throw the error (default: false)
 * @returns {Object} Mock data if shouldUseMockData is true
 */
export const handleApiError = (error, serviceName, functionName, mockData, shouldThrow = false) => {
  console.error(`Error in ${serviceName}.${functionName}:`, error);
  
  if (shouldUseMockData(error)) {
    logMockDataWarning(serviceName, functionName);
    return typeof mockData === 'function' ? mockData() : mockData;
  }
  
  if (shouldThrow) {
    throw error;
  }
  
  return null;
};

export default {
  MOCK_CONFIG,
  shouldUseMockData,
  logMockDataWarning,
  handleApiError
}; 