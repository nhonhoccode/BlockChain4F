import { authGet } from '../../utils/apiAuthInterceptor';
import apiAuthInterceptor from '../../utils/apiAuthInterceptor';
import { API_ENDPOINTS } from '../api/commonApiService';

// Default statistics data for fallbacks
const DEFAULT_GENERAL_STATS = {
  stats: {
    pending_requests: 0,
    processing_requests: 0,
    completed_requests: 0,
    rejected_requests: 0,
    total_documents: 0,
    verified_documents: 0,
    total_requests: 0,
    total_citizens: 0,
    total_officers: 0
  },
  blockchain_id: "0x7c5ea36004851c764c44143b1dcb59679b83c9169d2da11567fbec5c23d913ff"
};

const DEFAULT_OFFICER_STATS = {
  total_officers: 0,
  active_officers: 0,
  pending_approval: 0,
  by_department: [],
  performance: []
};

const DEFAULT_DOCUMENT_STATS = {
  total_documents: 0,
  verified_documents: 0,
  by_type: [],
  by_status: {
    draft: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    revoked: 0
  }
};

const DEFAULT_REQUEST_STATS = {
  total_requests: 0,
  by_status: {
    pending: 0,
    submitted: 0,
    in_review: 0,
    processing: 0,
    completed: 0,
    rejected: 0,
    cancelled: 0
  },
  by_type: [],
  processing_time: {
    average: 0,
    min: 0,
    max: 0
  }
};

/**
 * Service for accessing statistics across all roles (officer, chairman)
 */
const statisticsService = {
  /**
   * Get general statistics
   * @returns {Promise<Object>} General statistics
   */
  getGeneralStatistics: async () => {
    try {
      console.log('Getting general statistics with authenticated request');
      return await authGet(API_ENDPOINTS.STATISTICS.GENERAL);
    } catch (error) {
      console.error('[Statistics Service] Error getting general statistics:', error);
      // Return default data for UI to display
      return DEFAULT_GENERAL_STATS;
    }
  },

  /**
   * Get officer statistics
   * @returns {Promise<Object>} Officer statistics
   */
  getOfficerStatistics: async () => {
    try {
      return await authGet(API_ENDPOINTS.STATISTICS.OFFICERS);
    } catch (error) {
      console.error('[Statistics Service] Error getting officer statistics:', error);
      // Return default data instead of throwing
      return DEFAULT_OFFICER_STATS;
    }
  },

  /**
   * Get document statistics
   * @returns {Promise<Object>} Document statistics
   */
  getDocumentStatistics: async () => {
    try {
      return await authGet(API_ENDPOINTS.STATISTICS.DOCUMENTS);
    } catch (error) {
      console.error('[Statistics Service] Error getting document statistics:', error);
      // Return default data instead of throwing
      return DEFAULT_DOCUMENT_STATS;
    }
  },

  /**
   * Get request statistics
   * @returns {Promise<Object>} Request statistics
   */
  getRequestStatistics: async () => {
    try {
      return await authGet(API_ENDPOINTS.STATISTICS.REQUESTS);
    } catch (error) {
      console.error('[Statistics Service] Error getting request statistics:', error);
      // Return default data instead of throwing
      return DEFAULT_REQUEST_STATS;
    }
  }
};

export default statisticsService; 