import React, { createContext, useContext, useState } from 'react';

// Create blockchain context
const BlockchainContext = createContext();

/**
 * BlockchainProvider Component - Provides blockchain context to the app
 */
export const BlockchainProvider = ({ children }) => {
  const [blockchainStatus, setBlockchainStatus] = useState({
    isConnected: true, // Mocked as connected
    networkName: 'Test Network',
    blockHeight: 12345
  });
  
  const [verificationData, setVerificationData] = useState({
    lastVerified: null,
    verificationResults: {}
  });
  
  /**
   * Verify a document on the blockchain
   * @param {string} documentId - Document ID to verify
   * @returns {Promise<Object>} Verification result
   */
  const verifyDocument = async (documentId) => {
    // Mock implementation
    console.log(`Verifying document: ${documentId}`);
    
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const result = {
          verified: true,
          timestamp: new Date().toISOString(),
          documentId,
          blockchainId: `bch-${Math.random().toString(36).substring(2, 10)}`,
          hash: `0x${Math.random().toString(36).substring(2, 42)}`
        };
        
        // Update state
        setVerificationData(prev => ({
          lastVerified: new Date().toISOString(),
          verificationResults: {
            ...prev.verificationResults,
            [documentId]: result
          }
        }));
        
        resolve(result);
      }, 1000);
    });
  };
  
  /**
   * Get the blockchain status
   * @returns {Promise<Object>} Blockchain status
   */
  const getBlockchainStatus = async () => {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        const status = {
          isConnected: true,
          networkName: 'Test Network',
          blockHeight: Math.floor(12345 + Math.random() * 100)
        };
        
        setBlockchainStatus(status);
        resolve(status);
      }, 500);
    });
  };
  
  // Context value
  const contextValue = {
    blockchainStatus,
    verificationData,
    verifyDocument,
    getBlockchainStatus
  };
  
  return (
    <BlockchainContext.Provider value={contextValue}>
      {children}
    </BlockchainContext.Provider>
  );
};

/**
 * useBlockchain hook - Custom hook to use blockchain context
 * @returns {Object} Blockchain context
 */
export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (context === undefined) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
};

export default BlockchainContext;
