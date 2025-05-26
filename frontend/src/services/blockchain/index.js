import axios from 'axios';
import { API_BASE_URL } from '../api/config';

const BLOCKCHAIN_API_URL = `${API_BASE_URL}/blockchain`;

/**
 * Service for blockchain-related functionality
 */
const blockchainService = {
  /**
   * Verify a document using blockchain
   * @param {string} documentId - ID of the document to verify
   * @returns {Promise<Object>} - Verification result
   */
  verifyDocument: async (documentId) => {
    try {
      const response = await axios.get(`${BLOCKCHAIN_API_URL}/verify/document/${documentId}/`);
      return response.data;
    } catch (error) {
      console.error('Error verifying document:', error);
      throw error;
    }
  },

  /**
   * Get document history from blockchain
   * @param {string} documentId - ID of the document
   * @returns {Promise<Object>} - Document history
   */
  getDocumentHistory: async (documentId) => {
    try {
      const response = await axios.get(`${BLOCKCHAIN_API_URL}/document/${documentId}/history/`);
      return response.data;
    } catch (error) {
      console.error('Error getting document history:', error);
      throw error;
    }
  },

  /**
   * Verify a document's hash
   * @param {string} documentId - ID of the document
   * @param {File} file - Document file to verify
   * @returns {Promise<Object>} - Verification result
   */
  verifyDocumentFile: async (documentId, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        `${BLOCKCHAIN_API_URL}/verify/document/${documentId}/file/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error verifying document file:', error);
      throw error;
    }
  },

  /**
   * Get blockchain transaction details
   * @param {string} transactionId - ID of the blockchain transaction
   * @returns {Promise<Object>} - Transaction details
   */
  getTransactionDetails: async (transactionId) => {
    try {
      const response = await axios.get(`${BLOCKCHAIN_API_URL}/transaction/${transactionId}/`);
      return response.data;
    } catch (error) {
      console.error('Error getting transaction details:', error);
      throw error;
    }
  },

  /**
   * Get approval workflow history
   * @param {string} workflowId - ID of the approval workflow
   * @returns {Promise<Object>} - Workflow history
   */
  getApprovalWorkflowHistory: async (workflowId) => {
    try {
      const response = await axios.get(`${BLOCKCHAIN_API_URL}/approval/workflow/${workflowId}/history/`);
      return response.data;
    } catch (error) {
      console.error('Error getting approval workflow history:', error);
      throw error;
    }
  },

  /**
   * Get user documents from blockchain
   * @param {string} userId - ID of the user
   * @returns {Promise<Object>} - User documents
   */
  getUserDocuments: async (userId) => {
    try {
      const response = await axios.get(`${BLOCKCHAIN_API_URL}/user/${userId}/documents/`);
      return response.data;
    } catch (error) {
      console.error('Error getting user documents:', error);
      throw error;
    }
  },

  /**
   * Get blockchain status
   * @returns {Promise<Object>} - Blockchain status
   */
  getBlockchainStatus: async () => {
    try {
      const response = await axios.get(`${BLOCKCHAIN_API_URL}/status/`);
      return response.data;
    } catch (error) {
      console.error('Error getting blockchain status:', error);
      throw error;
    }
  },
};

export default blockchainService; 