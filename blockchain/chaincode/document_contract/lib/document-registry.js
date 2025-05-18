'use strict';

const { Contract } = require('fabric-contract-api');

// Document states
const DocumentState = {
  DRAFT: 'DRAFT',
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  REVOKED: 'REVOKED'
};

class DocumentRegistry extends Contract {
  
  /**
   * Initialize the ledger with any required data
   * @param {Context} ctx transaction context
   */
  async initLedger(ctx) {
    console.info('============= Initialize Document Registry =============');
    // Nothing to initialize for now
    return { success: true, message: 'Document Registry initialized' };
  }
  
  /**
   * Create a new document on the ledger
   * @param {Context} ctx transaction context
   * @param {String} documentId unique ID for the document
   * @param {String} documentType type of document (e.g., birth certificate, marriage certificate)
   * @param {String} citizenId ID of the citizen the document belongs to
   * @param {String} officerId ID of the officer creating the document
   * @param {String} metadata JSON string with additional document metadata
   * @param {String} contentHash hash of the document content for verification
   */
  async createDocument(ctx, documentId, documentType, citizenId, officerId, metadata, contentHash) {
    console.info('============= Create Document =============');
    
    // Check if document already exists
    const exists = await this.documentExists(ctx, documentId);
    if (exists) {
      throw new Error(`Document ${documentId} already exists`);
    }
    
    // Check user role (only officers can create documents)
    const clientIdentity = ctx.clientIdentity;
    const role = clientIdentity.getAttributeValue('role');
    if (role !== 'officer' && role !== 'chairman') {
      throw new Error('Only officers or chairman can create documents');
    }
    
    // Create document object
    const document = {
      documentId,
      documentType,
      citizenId,
      officerId,
      metadata: JSON.parse(metadata),
      contentHash,
      state: DocumentState.DRAFT,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      approvals: [],
      transactionHistory: [
        {
          txId: ctx.stub.getTxID(),
          action: 'CREATE',
          timestamp: new Date().toISOString(),
          userId: officerId,
          role: role
        }
      ]
    };
    
    // Store document in blockchain
    await ctx.stub.putState(documentId, Buffer.from(JSON.stringify(document)));
    
    // Emit an event
    await ctx.stub.setEvent('DocumentCreated', Buffer.from(JSON.stringify({
      documentId,
      documentType,
      citizenId,
      officerId,
      state: DocumentState.DRAFT
    })));
    
    return { success: true, documentId };
  }
  
  /**
   * Submit a document for approval
   * @param {Context} ctx transaction context
   * @param {String} documentId unique ID for the document
   */
  async submitDocument(ctx, documentId) {
    console.info('============= Submit Document =============');
    
    // Get the document
    const documentString = await this.readDocument(ctx, documentId);
    const document = JSON.parse(documentString);
    
    // Verify document is in DRAFT state
    if (document.state !== DocumentState.DRAFT) {
      throw new Error(`Document ${documentId} is not in DRAFT state`);
    }
    
    // Check user role (only officers can submit documents)
    const clientIdentity = ctx.clientIdentity;
    const role = clientIdentity.getAttributeValue('role');
    if (role !== 'officer' && role !== 'chairman') {
      throw new Error('Only officers or chairman can submit documents');
    }
    
    // Update document state
    document.state = DocumentState.PENDING;
    document.updatedAt = new Date().toISOString();
    document.transactionHistory.push({
      txId: ctx.stub.getTxID(),
      action: 'SUBMIT',
      timestamp: new Date().toISOString(),
      userId: document.officerId,
      role: role
    });
    
    // Store updated document in blockchain
    await ctx.stub.putState(documentId, Buffer.from(JSON.stringify(document)));
    
    // Emit an event
    await ctx.stub.setEvent('DocumentSubmitted', Buffer.from(JSON.stringify({
      documentId,
      documentType: document.documentType,
      citizenId: document.citizenId,
      officerId: document.officerId,
      state: DocumentState.PENDING
    })));
    
    return { success: true, documentId, state: DocumentState.PENDING };
  }
  
  /**
   * Approve a document
   * @param {Context} ctx transaction context
   * @param {String} documentId unique ID for the document
   * @param {String} approverId ID of the approver
   * @param {String} comments optional comments from the approver
   */
  async approveDocument(ctx, documentId, approverId, comments) {
    console.info('============= Approve Document =============');
    
    // Get the document
    const documentString = await this.readDocument(ctx, documentId);
    const document = JSON.parse(documentString);
    
    // Verify document is in PENDING state
    if (document.state !== DocumentState.PENDING) {
      throw new Error(`Document ${documentId} is not in PENDING state`);
    }
    
    // Check user role (only chairman can approve important documents)
    const clientIdentity = ctx.clientIdentity;
    const role = clientIdentity.getAttributeValue('role');
    
    // Determine if this is an important document that requires chairman approval
    const isImportantDocument = document.metadata.requiresChairmanApproval === true;
    
    if (isImportantDocument && role !== 'chairman') {
      throw new Error('Only chairman can approve important documents');
    }
    
    if (role !== 'officer' && role !== 'chairman') {
      throw new Error('Only officers or chairman can approve documents');
    }
    
    // Add approval
    const approval = {
      approverId,
      role,
      timestamp: new Date().toISOString(),
      comments: comments || ''
    };
    
    document.approvals.push(approval);
    document.state = DocumentState.APPROVED;
    document.updatedAt = new Date().toISOString();
    document.transactionHistory.push({
      txId: ctx.stub.getTxID(),
      action: 'APPROVE',
      timestamp: new Date().toISOString(),
      userId: approverId,
      role: role
    });
    
    // Store updated document in blockchain
    await ctx.stub.putState(documentId, Buffer.from(JSON.stringify(document)));
    
    // Emit an event
    await ctx.stub.setEvent('DocumentApproved', Buffer.from(JSON.stringify({
      documentId,
      documentType: document.documentType,
      citizenId: document.citizenId,
      approverId,
      state: DocumentState.APPROVED
    })));
    
    return { success: true, documentId, state: DocumentState.APPROVED };
  }
  
  /**
   * Reject a document
   * @param {Context} ctx transaction context
   * @param {String} documentId unique ID for the document
   * @param {String} rejectorId ID of the rejector
   * @param {String} reason reason for rejection
   */
  async rejectDocument(ctx, documentId, rejectorId, reason) {
    console.info('============= Reject Document =============');
    
    // Get the document
    const documentString = await this.readDocument(ctx, documentId);
    const document = JSON.parse(documentString);
    
    // Verify document is in PENDING state
    if (document.state !== DocumentState.PENDING) {
      throw new Error(`Document ${documentId} is not in PENDING state`);
    }
    
    // Check user role (only officers or chairman can reject documents)
    const clientIdentity = ctx.clientIdentity;
    const role = clientIdentity.getAttributeValue('role');
    if (role !== 'officer' && role !== 'chairman') {
      throw new Error('Only officers or chairman can reject documents');
    }
    
    // Update document state
    document.state = DocumentState.REJECTED;
    document.rejectionReason = reason;
    document.rejectedBy = rejectorId;
    document.updatedAt = new Date().toISOString();
    document.transactionHistory.push({
      txId: ctx.stub.getTxID(),
      action: 'REJECT',
      timestamp: new Date().toISOString(),
      userId: rejectorId,
      role: role,
      reason: reason
    });
    
    // Store updated document in blockchain
    await ctx.stub.putState(documentId, Buffer.from(JSON.stringify(document)));
    
    // Emit an event
    await ctx.stub.setEvent('DocumentRejected', Buffer.from(JSON.stringify({
      documentId,
      documentType: document.documentType,
      citizenId: document.citizenId,
      rejectorId,
      reason,
      state: DocumentState.REJECTED
    })));
    
    return { success: true, documentId, state: DocumentState.REJECTED };
  }
  
  /**
   * Revoke an approved document
   * @param {Context} ctx transaction context
   * @param {String} documentId unique ID for the document
   * @param {String} revokerId ID of the revoker
   * @param {String} reason reason for revocation
   */
  async revokeDocument(ctx, documentId, revokerId, reason) {
    console.info('============= Revoke Document =============');
    
    // Get the document
    const documentString = await this.readDocument(ctx, documentId);
    const document = JSON.parse(documentString);
    
    // Verify document is in APPROVED state
    if (document.state !== DocumentState.APPROVED) {
      throw new Error(`Document ${documentId} is not in APPROVED state`);
    }
    
    // Check user role (only chairman can revoke documents)
    const clientIdentity = ctx.clientIdentity;
    const role = clientIdentity.getAttributeValue('role');
    if (role !== 'chairman') {
      throw new Error('Only chairman can revoke documents');
    }
    
    // Update document state
    document.state = DocumentState.REVOKED;
    document.revocationReason = reason;
    document.revokedBy = revokerId;
    document.updatedAt = new Date().toISOString();
    document.transactionHistory.push({
      txId: ctx.stub.getTxID(),
      action: 'REVOKE',
      timestamp: new Date().toISOString(),
      userId: revokerId,
      role: role,
      reason: reason
    });
    
    // Store updated document in blockchain
    await ctx.stub.putState(documentId, Buffer.from(JSON.stringify(document)));
    
    // Emit an event
    await ctx.stub.setEvent('DocumentRevoked', Buffer.from(JSON.stringify({
      documentId,
      documentType: document.documentType,
      citizenId: document.citizenId,
      revokerId,
      reason,
      state: DocumentState.REVOKED
    })));
    
    return { success: true, documentId, state: DocumentState.REVOKED };
  }
  
  /**
   * Verify a document using its content hash
   * @param {Context} ctx transaction context
   * @param {String} documentId unique ID for the document
   * @param {String} contentHash hash of the document content to verify
   */
  async verifyDocument(ctx, documentId, contentHash) {
    console.info('============= Verify Document =============');
    
    // Get the document
    const documentString = await this.readDocument(ctx, documentId);
    const document = JSON.parse(documentString);
    
    // Verify content hash matches
    const isAuthentic = document.contentHash === contentHash;
    
    // Check document is in a valid state
    const isValid = document.state === DocumentState.APPROVED;
    
    // Return verification result
    return {
      documentId,
      isAuthentic,
      isValid,
      documentType: document.documentType,
      state: document.state,
      createdAt: document.createdAt,
      verifiedAt: new Date().toISOString()
    };
  }
  
  /**
   * Read a document
   * @param {Context} ctx transaction context
   * @param {String} documentId unique ID for the document
   */
  async readDocument(ctx, documentId) {
    console.info('============= Read Document =============');
    
    const documentBytes = await ctx.stub.getState(documentId);
    if (!documentBytes || documentBytes.length === 0) {
      throw new Error(`Document ${documentId} does not exist`);
    }
    
    return documentBytes.toString();
  }
  
  /**
   * Check if a document exists
   * @param {Context} ctx transaction context
   * @param {String} documentId unique ID for the document
   */
  async documentExists(ctx, documentId) {
    const documentBytes = await ctx.stub.getState(documentId);
    return documentBytes && documentBytes.length > 0;
  }
  
  /**
   * Get all documents for a specific citizen
   * @param {Context} ctx transaction context
   * @param {String} citizenId ID of the citizen
   */
  async getDocumentsByCitizen(ctx, citizenId) {
    console.info('============= Get Documents By Citizen =============');
    
    const query = {
      selector: {
        citizenId: citizenId
      },
      sort: [{ createdAt: 'desc' }]
    };
    
    const queryString = JSON.stringify(query);
    const iterator = await ctx.stub.getQueryResult(queryString);
    
    const documents = [];
    let result = await iterator.next();
    
    while (!result.done) {
      const documentString = Buffer.from(result.value.value.toString()).toString('utf8');
      const document = JSON.parse(documentString);
      documents.push(document);
      result = await iterator.next();
    }
    
    return JSON.stringify(documents);
  }
  
  /**
   * Get all documents by state
   * @param {Context} ctx transaction context
   * @param {String} state document state to filter by
   */
  async getDocumentsByState(ctx, state) {
    console.info('============= Get Documents By State =============');
    
    const query = {
      selector: {
        state: state
      },
      sort: [{ createdAt: 'desc' }]
    };
    
    const queryString = JSON.stringify(query);
    const iterator = await ctx.stub.getQueryResult(queryString);
    
    const documents = [];
    let result = await iterator.next();
    
    while (!result.done) {
      const documentString = Buffer.from(result.value.value.toString()).toString('utf8');
      const document = JSON.parse(documentString);
      documents.push(document);
      result = await iterator.next();
    }
    
    return JSON.stringify(documents);
  }
  
  /**
   * Get document history
   * @param {Context} ctx transaction context
   * @param {String} documentId unique ID for the document
   */
  async getDocumentHistory(ctx, documentId) {
    console.info('============= Get Document History =============');
    
    // Check if the document exists
    const exists = await this.documentExists(ctx, documentId);
    if (!exists) {
      throw new Error(`Document ${documentId} does not exist`);
    }
    
    const iterator = await ctx.stub.getHistoryForKey(documentId);
    
    const history = [];
    let result = await iterator.next();
    
    while (!result.done) {
      const historyItem = {
        txId: result.value.txId,
        timestamp: new Date(result.value.timestamp.seconds.low * 1000 + result.value.timestamp.nanos / 1000000).toISOString(),
        isDelete: result.value.isDelete
      };
      
      if (!result.value.isDelete) {
        const documentString = Buffer.from(result.value.value.toString()).toString('utf8');
        const document = JSON.parse(documentString);
        historyItem.document = document;
      }
      
      history.push(historyItem);
      result = await iterator.next();
    }
    
    return JSON.stringify(history);
  }
}

module.exports = DocumentRegistry;
