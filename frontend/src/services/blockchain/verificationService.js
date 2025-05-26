import axios from 'axios';

/**
 * Service for blockchain document verification
 */
// Use a direct base URL instead of importing from config to avoid circular dependencies
const API_ENDPOINT = '/api/v1/verification';

/**
 * Verify a document using document ID or verification code
 * @param {string|null} documentId - Document ID (optional if verificationCode is provided)
 * @param {string|null} verificationCode - Verification code (optional if documentId is provided)
 * @param {string} documentHash - Hash of the document content
 * @returns {Promise<Object>} - Verification result
 */
export const verifyDocument = async (documentId, verificationCode, documentHash) => {
  try {
    // For demo purposes, use mock data
    if (process.env.NODE_ENV === 'development' && !process.env.REACT_APP_USE_REAL_API) {
      return mockVerifyDocument(documentId, verificationCode, documentHash);
    }
    
    // In production, make a real API call
    const response = await axios.post(`${API_ENDPOINT}/verify`, {
      documentId,
      verificationCode,
      documentHash
    });
    
    return response.data;
  } catch (error) {
    console.error('Error verifying document:', error);
    throw error;
  }
};

/**
 * Verify an officer approval status
 * @param {string} officerId - Officer ID
 * @returns {Promise<Object>} - Officer verification result
 */
export const verifyOfficer = async (officerId) => {
  try {
    // For demo purposes, use mock data
    if (process.env.NODE_ENV === 'development' && !process.env.REACT_APP_USE_REAL_API) {
      return mockVerifyOfficer(officerId);
    }
    
    // In production, make a real API call
    const response = await axios.get(`${API_ENDPOINT}/verify-officer/${officerId}`);
    
    return response.data;
  } catch (error) {
    console.error('Error verifying officer:', error);
    throw error;
  }
};

/**
 * Generate a verification code for a document
 * @param {string} documentId - Document ID
 * @returns {Promise<Object>} - Generated verification code result
 */
export const generateVerificationCode = async (documentId) => {
  try {
    // For demo purposes, use mock data
    if (process.env.NODE_ENV === 'development' && !process.env.REACT_APP_USE_REAL_API) {
      return mockGenerateVerificationCode(documentId);
    }
    
    // In production, make a real API call
    const response = await axios.post(`${API_ENDPOINT}/generate-code`, {
      documentId
    });
    
    return response.data;
  } catch (error) {
    console.error('Error generating verification code:', error);
    throw error;
  }
};

/**
 * Generate a QR code for document verification
 * @param {string} documentId - Document ID
 * @param {string} verificationCode - Verification code
 * @returns {Promise<Object>} - QR code data
 */
export const generateVerificationQr = async (documentId, verificationCode) => {
  try {
    // For demo purposes, use mock data
    if (process.env.NODE_ENV === 'development' && !process.env.REACT_APP_USE_REAL_API) {
      return mockGenerateVerificationQr(documentId, verificationCode);
    }
    
    // In production, make a real API call
    const response = await axios.post(`${API_ENDPOINT}/generate-qr`, {
      documentId,
      verificationCode
    });
    
    return response.data;
  } catch (error) {
    console.error('Error generating verification QR code:', error);
    throw error;
  }
};

/**
 * Create a digital signature for a document
 * @param {string} documentId - Document ID
 * @param {string} userId - User ID
 * @param {string} privateKey - Private key for signing
 * @returns {Promise<Object>} - Digital signature result
 */
export const createDigitalSignature = async (documentId, userId, privateKey) => {
  try {
    // For demo purposes, use mock data
    if (process.env.NODE_ENV === 'development' && !process.env.REACT_APP_USE_REAL_API) {
      return mockCreateDigitalSignature(documentId, userId);
    }
    
    // In production, make a real API call
    const response = await axios.post(`${API_ENDPOINT}/create-signature`, {
      documentId,
      userId,
      privateKey
    });
    
    return response.data;
  } catch (error) {
    console.error('Error creating digital signature:', error);
    throw error;
  }
};

/**
 * Upload a document for hash calculation
 * @param {File} file - Document file to upload
 * @returns {Promise<Object>} - Hash calculation result
 */
export const calculateDocumentHash = async (file) => {
  try {
    // For demo purposes, use mock data
    if (process.env.NODE_ENV === 'development' && !process.env.REACT_APP_USE_REAL_API) {
      return mockCalculateHash(file);
    }
    
    // In production, make a real API call
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(`${API_ENDPOINT}/calculate-hash`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error calculating document hash:', error);
    throw error;
  }
};

/**
 * Get verification history for a document
 * @param {string} documentId - Document ID
 * @returns {Promise<Object>} - Verification history
 */
export const getVerificationHistory = async (documentId) => {
  try {
    // For demo purposes, use mock data
    if (process.env.NODE_ENV === 'development' && !process.env.REACT_APP_USE_REAL_API) {
      return mockGetVerificationHistory(documentId);
    }
    
    // In production, make a real API call
    const response = await axios.get(`${API_ENDPOINT}/history/${documentId}`);
    
    return response.data;
  } catch (error) {
    console.error('Error getting verification history:', error);
    throw error;
  }
};

/**
 * Get document history from blockchain
 * @param {string} documentId - Document ID
 * @returns {Promise<Object>} - Document history
 */
export const getDocumentHistory = async (documentId) => {
  try {
    // For demo purposes, use mock data
    if (process.env.NODE_ENV === 'development' && !process.env.REACT_APP_USE_REAL_API) {
      return mockGetDocumentHistory(documentId);
    }
    
    // In production, make a real API call
    const response = await axios.get(`${API_ENDPOINT}/document-history/${documentId}`);
    
    return response.data;
  } catch (error) {
    console.error('Error getting document history:', error);
    throw error;
  }
};

// ----------------------------------------------------------------------------
// Mock functions for development without a backend
// ----------------------------------------------------------------------------

/**
 * Mock create digital signature (for development without a backend)
 */
const mockCreateDigitalSignature = (documentId, userId) => {
  // Simulate API delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // Generate a random signature
      const generateRandomHex = (length) => {
        const characters = '0123456789abcdef';
        let result = '';
        for (let i = 0; i < length; i++) {
          result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
      };

      // Generate mock signature data
      const signature = generateRandomHex(64);
      const publicKey = generateRandomHex(32);
      
      resolve({
        success: true,
        documentId,
        userId,
        signature,
        publicKey,
        timestamp: new Date().toISOString(),
        message: 'Đã tạo chữ ký số thành công'
      });
    }, 1500);
  });
};

/**
 * Mock get document history (for development without a backend)
 */
const mockGetDocumentHistory = (documentId) => {
  // Simulate API delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // Current date
      const now = new Date();
      
      // Mock document histories based on document ID
      const histories = {
        'DOC001': [
          {
            id: 'TX1001',
            type: 'CREATED',
            timestamp: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            actor: {
              id: 'OFF001',
              name: 'Nguyễn Văn A',
              role: 'OFFICER'
            },
            details: {
              documentType: 'BIRTH_CERTIFICATE',
              documentId: 'DOC001'
            }
          },
          {
            id: 'TX1002',
            type: 'APPROVED',
            timestamp: new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000).toISOString(),
            actor: {
              id: 'CHR001',
              name: 'Trần Văn B',
              role: 'CHAIRMAN'
            },
            details: {
              documentId: 'DOC001',
              approvalId: 'APR001'
            }
          },
          {
            id: 'TX1003',
            type: 'VERIFIED',
            timestamp: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            actor: {
              id: 'OFF002',
              name: 'Lê Thị C',
              role: 'OFFICER'
            },
            details: {
              documentId: 'DOC001',
              verificationId: 'VER001'
            }
          }
        ],
        'DOC002': [
          {
            id: 'TX2001',
            type: 'CREATED',
            timestamp: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            actor: {
              id: 'OFF002',
              name: 'Lê Thị C',
              role: 'OFFICER'
            },
            details: {
              documentType: 'MARRIAGE_CERTIFICATE',
              documentId: 'DOC002'
            }
          },
          {
            id: 'TX2002',
            type: 'APPROVED',
            timestamp: new Date(now.getTime() - 58 * 24 * 60 * 60 * 1000).toISOString(),
            actor: {
              id: 'CHR001',
              name: 'Trần Văn B',
              role: 'CHAIRMAN'
            },
            details: {
              documentId: 'DOC002',
              approvalId: 'APR002'
            }
          }
        ],
        'DOC003': [
          {
            id: 'TX3001',
            type: 'CREATED',
            timestamp: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
            actor: {
              id: 'OFF001',
              name: 'Nguyễn Văn A',
              role: 'OFFICER'
            },
            details: {
              documentType: 'LAND_CERTIFICATE',
              documentId: 'DOC003'
            }
          },
          {
            id: 'TX3002',
            type: 'APPROVED',
            timestamp: new Date(now.getTime() - 88 * 24 * 60 * 60 * 1000).toISOString(),
            actor: {
              id: 'CHR001',
              name: 'Trần Văn B',
              role: 'CHAIRMAN'
            },
            details: {
              documentId: 'DOC003',
              approvalId: 'APR003'
            }
          },
          {
            id: 'TX3003',
            type: 'REVOKED',
            timestamp: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            actor: {
              id: 'CHR001',
              name: 'Trần Văn B',
              role: 'CHAIRMAN'
            },
            details: {
              documentId: 'DOC003',
              reason: 'Thông tin không chính xác'
            }
          }
        ]
      };
      
      // Return mock data
      resolve({
        success: true,
        documentId,
        history: histories[documentId] || []
      });
    }, 1500);
  });
};

/**
 * Mock verify officer (for development without a backend)
 */
const mockVerifyOfficer = (officerId) => {
  // Simulate API delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock officer data
      const officerData = {
        'OFF001': {
          name: 'Nguyễn Văn A',
          position: 'Cán bộ tư pháp',
          status: 'approved',
          approvedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          isValid: true
        },
        'OFF002': {
          name: 'Trần Thị B',
          position: 'Cán bộ địa chính',
          status: 'approved',
          approvedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          isValid: true
        },
        'OFF003': {
          name: 'Lê Văn C',
          position: 'Cán bộ văn hóa xã hội',
          status: 'pending',
          approvedAt: null,
          isValid: false
        }
      };
      
      const officer = officerData[officerId];
      
      if (officer) {
        resolve({
          success: true,
          verified: officer.status === 'approved',
          officerId,
          name: officer.name,
          position: officer.position,
          status: officer.status,
          approvedAt: officer.approvedAt,
          isValid: officer.isValid,
          message: officer.isValid 
            ? 'Cán bộ đã được xác thực và đang trong nhiệm kỳ công tác' 
            : 'Cán bộ chưa được xác thực hoặc không còn hiệu lực'
        });
      } else {
        resolve({
          success: false,
          verified: false,
          message: 'Mã cán bộ không tồn tại trong hệ thống'
        });
      }
    }, 1500); // 1.5 second delay
  });
};

/**
 * Mock verify document (for development without a backend)
 */
const mockVerifyDocument = (documentId, verificationCode, documentHash) => {
  // Simulate API delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // Use a fixed hash for demo purposes
      const knownHashes = {
        'DOC001': 'abcdef1234567890',
        'DOC002': 'a1b2c3d4e5f6g7h8',
        'DOC003': 'aaaaabbbbbccccc',
      };
      
      // Simulate verification
      let verified = false;
      let documentValid = false;
      let message = '';
      let docId = documentId;
      let docType = '';
      
      // If we have a verification code, map it to a document ID
      if (verificationCode) {
        // Mock verification code to document ID mapping
        const codeMapping = {
          'ABC123': 'DOC001',
          'DEF456': 'DOC002',
          'GHI789': 'DOC003',
        };
        
        docId = codeMapping[verificationCode] || null;
      }
      
      // If we have a document ID, check its hash
      if (docId) {
        const knownHash = knownHashes[docId];
        const mockHash = documentHash.substring(0, 16); // Simulate checking only part of the hash
        
        // Check if the hash matches
        verified = knownHash === mockHash;
        
        // Set document type and validity based on document ID
        if (docId === 'DOC001') {
          docType = 'BIRTH_CERTIFICATE';
          documentValid = true;
          message = verified 
            ? 'Giấy tờ được xác thực là hợp lệ và chính thống' 
            : 'Nội dung giấy tờ không khớp với hồ sơ trên blockchain';
        } else if (docId === 'DOC002') {
          docType = 'MARRIAGE_CERTIFICATE';
          documentValid = true;
          message = verified 
            ? 'Giấy tờ được xác thực là hợp lệ và chính thống' 
            : 'Nội dung giấy tờ không khớp với hồ sơ trên blockchain';
        } else if (docId === 'DOC003') {
          docType = 'LAND_CERTIFICATE';
          documentValid = false; // Document is verified but not valid (e.g., revoked)
          message = verified 
            ? 'Giấy tờ được xác thực nhưng không còn hiệu lực hoặc đã bị thu hồi' 
            : 'Nội dung giấy tờ không khớp với hồ sơ trên blockchain';
        } else {
          verified = false;
          message = 'Mã số giấy tờ không tồn tại trong hệ thống';
        }
      } else {
        message = verificationCode 
          ? 'Mã xác thực không hợp lệ hoặc không tồn tại' 
          : 'Mã số giấy tờ không hợp lệ hoặc không tồn tại';
      }
      
      resolve({
        success: true,
        verified,
        documentValid: verified && documentValid,
        documentId: docId,
        documentType: docType,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
        verifiedAt: new Date().toISOString(),
        message
      });
    }, 2000); // 2 second delay
  });
};

/**
 * Mock generate verification code (for development without a backend)
 */
const mockGenerateVerificationCode = (documentId) => {
  // Simulate API delay
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Check if document ID exists
      if (['DOC001', 'DOC002', 'DOC003'].includes(documentId)) {
        // Generate a "random" verification code
        const code = `XYZ${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
        
        resolve({
          success: true,
          verificationCode: code,
          documentId,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour expiry
        });
      } else {
        reject(new Error('Document not found'));
      }
    }, 1000); // 1 second delay
  });
};

/**
 * Mock calculate hash (for development without a backend)
 */
const mockCalculateHash = (file) => {
  // Simulate API delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // Generate a mock hash using file properties
      const mockHashBase = file.name + file.size + file.lastModified;
      const mockHash = Array.from(Array(64), (_, i) => {
        const charCode = mockHashBase.charCodeAt(i % mockHashBase.length) % 16;
        return charCode.toString(16);
      }).join('');
      
      resolve({
        success: true,
        hash: mockHash,
        algorithm: 'SHA-256',
        timestamp: new Date().toISOString()
      });
    }, 1500); // 1.5 second delay
  });
};

/**
 * Mock get verification history (for development without a backend)
 */
const mockGetVerificationHistory = (documentId) => {
  // Simulate API delay
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Check if document ID exists
      if (['DOC001', 'DOC002', 'DOC003'].includes(documentId)) {
        // Generate mock verification history
        const history = [
          {
            verificationCode: 'ABC123',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            expiresAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
            status: 'EXPIRED',
            verificationCount: 3
          },
          {
            verificationCode: 'DEF456',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            expiresAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
            status: 'EXPIRED',
            verificationCount: 1
          },
          {
            verificationCode: 'GHI789',
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
            status: 'ACTIVE',
            verificationCount: 2
          }
        ];
        
        resolve({
          success: true,
          documentId,
          history
        });
      } else {
        reject(new Error('Document not found'));
      }
    }, 1000); // 1 second delay
  });
};

/**
 * Mock generate verification QR code (for development without a backend)
 */
const mockGenerateVerificationQr = (documentId, verificationCode) => {
  // Simulate API delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // Generate QR data (in real implementation this would be the data for a QR code)
      const qrData = `${window.location.origin}/verify?id=${documentId}&code=${verificationCode || 'ABC123'}`;
      
      resolve({
        success: true,
        documentId,
        verificationCode: verificationCode || 'ABC123',
        qrData,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
      });
    }, 1000);
  });
};
