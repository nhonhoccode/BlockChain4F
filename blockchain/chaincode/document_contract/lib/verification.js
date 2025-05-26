'use strict';

const crypto = require('crypto');
const { Contract } = require('fabric-contract-api');

/**
 * Smart contract for document verification
 */
class DocumentVerification extends Contract {
  
  /**
   * Initialize the ledger with verification settings
   * @param {Context} ctx transaction context
   */
  async initLedger(ctx) {
    console.info('============= Initialize Document Verification =============');
    const settings = {
      algorithms: ['sha256', 'sha512'],
      defaultAlgorithm: 'sha256',
      maxVerificationTimeMinutes: 60,
      initialized: true,
      createdAt: new Date().toISOString()
    };
    
    await ctx.stub.putState('VERIFICATION_SETTINGS', Buffer.from(JSON.stringify(settings)));
    return { success: true, message: 'Document Verification initialized' };
  }
  
  /**
   * Generate a verification code for a document
   * @param {Context} ctx transaction context
   * @param {String} documentId ID of the document to verify
   * @param {String} documentHash Hash of the document content
   */
  async generateVerificationCode(ctx, documentId, documentHash) {
    console.info('============= Generate Verification Code =============');
    
    // Check if document exists (via cross contract call)
    const documentRegistry = await ctx.stub.invokeChaincode('document_registry', ['documentExists', documentId], 'mychannel');
    if (!documentRegistry.status === 200 || !JSON.parse(documentRegistry.payload.toString()).exists) {
      throw new Error(`Document ${documentId} does not exist`);
    }
    
    // Generate a unique verification code
    const timestamp = new Date().toISOString();
    const uniqueString = `${documentId}-${documentHash}-${timestamp}-${crypto.randomBytes(8).toString('hex')}`;
    const verificationCode = crypto.createHash('sha256').update(uniqueString).digest('hex').substring(0, 12);
    
    // Create verification record
    const verificationRecord = {
      verificationCode,
      documentId,
      documentHash,
      status: 'ACTIVE',
      createdAt: timestamp,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour expiry
      verifications: []
    };
    
    // Store verification record
    await ctx.stub.putState(verificationCode, Buffer.from(JSON.stringify(verificationRecord)));
    
    // Emit event
    await ctx.stub.setEvent('VerificationCodeGenerated', Buffer.from(JSON.stringify({
      verificationCode,
      documentId,
      expiresAt: verificationRecord.expiresAt
    })));
    
    return {
      success: true,
      verificationCode,
      expiresAt: verificationRecord.expiresAt
    };
  }
  
  /**
   * Verify a document using its verification code
   * @param {Context} ctx transaction context
   * @param {String} verificationCode Verification code for the document
   * @param {String} documentHash Hash of the document content
   */
  async verifyDocumentWithCode(ctx, verificationCode, documentHash) {
    console.info('============= Verify Document With Code =============');
    
    // Get verification record
    const verificationBytes = await ctx.stub.getState(verificationCode);
    if (!verificationBytes || verificationBytes.length === 0) {
      return {
        success: false,
        verified: false,
        reason: 'INVALID_CODE',
        message: 'Mã xác thực không hợp lệ hoặc không tồn tại'
      };
    }
    
    const verification = JSON.parse(verificationBytes.toString());
    
    // Check if verification code has expired
    const now = new Date();
    const expiryDate = new Date(verification.expiresAt);
    if (now > expiryDate) {
      return {
        success: false,
        verified: false,
        reason: 'EXPIRED',
        message: 'Mã xác thực đã hết hạn',
        documentId: verification.documentId
      };
    }
    
    // Check if document hash matches
    const hashMatches = verification.documentHash === documentHash;
    if (!hashMatches) {
      // Record failed verification attempt
      verification.verifications.push({
        timestamp: new Date().toISOString(),
        result: 'FAILED',
        reason: 'HASH_MISMATCH',
        clientIP: ctx.clientIdentity.getMSPID()
      });
      
      await ctx.stub.putState(verificationCode, Buffer.from(JSON.stringify(verification)));
      
      return {
        success: false,
        verified: false,
        reason: 'HASH_MISMATCH',
        message: 'Nội dung giấy tờ không khớp với hồ sơ trên blockchain',
        documentId: verification.documentId
      };
    }
    
    // Get document status from document registry
    const documentRegistry = await ctx.stub.invokeChaincode('document_registry', ['readDocument', verification.documentId], 'mychannel');
    if (documentRegistry.status !== 200) {
      return {
        success: false,
        verified: false,
        reason: 'DOCUMENT_ERROR',
        message: 'Không thể truy xuất thông tin giấy tờ',
        documentId: verification.documentId
      };
    }
    
    const document = JSON.parse(documentRegistry.payload.toString());
    
    // Check if document is in valid state
    const isValidState = document.state === 'APPROVED';
    
    // Record successful verification
    verification.verifications.push({
      timestamp: new Date().toISOString(),
      result: isValidState ? 'SUCCESS' : 'PARTIAL',
      clientIP: ctx.clientIdentity.getMSPID()
    });
    
    await ctx.stub.putState(verificationCode, Buffer.from(JSON.stringify(verification)));
    
    // Return verification result
    return {
      success: true,
      verified: hashMatches,
      documentValid: isValidState,
      documentId: verification.documentId,
      documentType: document.documentType,
      createdAt: document.createdAt,
      verifiedAt: new Date().toISOString(),
      message: isValidState 
        ? 'Giấy tờ được xác thực là hợp lệ và chính thống' 
        : 'Giấy tờ được xác thực nhưng không còn hiệu lực hoặc đã bị thu hồi'
    };
  }
  
  /**
   * Get verification history for a document
   * @param {Context} ctx transaction context
   * @param {String} documentId ID of the document
   */
  async getVerificationHistory(ctx, documentId) {
    console.info('============= Get Verification History =============');
    
    const query = {
      selector: {
        documentId: documentId
      },
      sort: [{ createdAt: 'desc' }]
    };
    
    const queryString = JSON.stringify(query);
    const iterator = await ctx.stub.getQueryResult(queryString);
    
    const history = [];
    let result = await iterator.next();
    
    while (!result.done) {
      const recordString = Buffer.from(result.value.value.toString()).toString('utf8');
      const record = JSON.parse(recordString);
      
      history.push({
        verificationCode: record.verificationCode,
        createdAt: record.createdAt,
        expiresAt: record.expiresAt,
        status: record.status,
        verificationCount: record.verifications.length
      });
      
      result = await iterator.next();
    }
    
    return JSON.stringify(history);
  }
  
  /**
   * Verify a document hash directly
   * @param {Context} ctx transaction context
   * @param {String} documentId ID of the document to verify
   * @param {String} documentHash Hash of the document to verify
   */
  async verifyDocumentDirect(ctx, documentId, documentHash) {
    console.info('============= Verify Document Direct =============');
    
    // Get document from registry
    const documentRegistry = await ctx.stub.invokeChaincode('document_registry', ['readDocument', documentId], 'mychannel');
    if (documentRegistry.status !== 200) {
      return {
        success: false,
        verified: false,
        reason: 'DOCUMENT_NOT_FOUND',
        message: 'Không tìm thấy giấy tờ'
      };
    }
    
    const document = JSON.parse(documentRegistry.payload.toString());
    
    // Verify document hash
    const hashMatches = document.contentHash === documentHash;
    
    // Check document state
    const isValidState = document.state === 'APPROVED';
    
    // Record verification attempt
    const verificationID = `direct-${documentId}-${Date.now()}`;
    const verification = {
      documentId,
      documentHash,
      method: 'DIRECT',
      timestamp: new Date().toISOString(),
      result: hashMatches ? (isValidState ? 'SUCCESS' : 'PARTIAL') : 'FAILED',
      verifierID: ctx.clientIdentity.getMSPID()
    };
    
    await ctx.stub.putState(verificationID, Buffer.from(JSON.stringify(verification)));
    
    // Return verification result
    return {
      success: true,
      verified: hashMatches,
      documentValid: isValidState,
      documentId: document.documentId,
      documentType: document.documentType,
      createdAt: document.createdAt,
      verifiedAt: new Date().toISOString(),
      message: !hashMatches 
        ? 'Giấy tờ không khớp với bản ghi trên blockchain' 
        : (isValidState 
            ? 'Giấy tờ được xác thực là hợp lệ và chính thống' 
            : 'Giấy tờ được xác thực nhưng không còn hiệu lực hoặc đã bị thu hồi')
    };
  }
  
  /**
   * Calculate document hash
   * @param {Context} ctx transaction context
   * @param {String} content Document content to hash
   * @param {String} algorithm Hash algorithm to use (default: sha256)
   */
  async calculateHash(ctx, content, algorithm = 'sha256') {
    console.info('============= Calculate Hash =============');
    
    // Get settings
    const settingsBytes = await ctx.stub.getState('VERIFICATION_SETTINGS');
    const settings = JSON.parse(settingsBytes.toString());
    
    // Validate algorithm
    if (!settings.algorithms.includes(algorithm)) {
      algorithm = settings.defaultAlgorithm;
    }
    
    // Calculate hash
    const hash = crypto.createHash(algorithm).update(content).digest('hex');
    
    return {
      hash,
      algorithm,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = DocumentVerification;
