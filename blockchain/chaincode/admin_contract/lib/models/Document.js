'use strict';

/**
 * Document model for the blockchain
 * Represents an administrative document stored in the blockchain
 */
class Document {
  /**
   * Constructor for Document model
   * @param {Object} data - Document data
   */
  constructor(data) {
    // Required fields
    this.documentId = data.documentId;
    this.documentType = data.documentType;
    this.citizenId = data.citizenId;
    this.officerId = data.officerId;
    this.contentHash = data.contentHash;
    
    // Status and timestamps
    this.state = data.state || 'DRAFT'; // DRAFT, PENDING, APPROVED, REJECTED, REVOKED
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    
    // Approval information
    this.approvals = data.approvals || [];
    
    // Optional fields
    this.metadata = data.metadata || {};
    this.rejectionReason = data.rejectionReason || '';
    this.rejectedBy = data.rejectedBy || '';
    this.revocationReason = data.revocationReason || '';
    this.revokedBy = data.revokedBy || '';
    
    // Transaction history
    this.transactionHistory = data.transactionHistory || [];
  }
  
  /**
   * Validate the document model
   * @returns {boolean} - True if valid, throws error if invalid
   */
  validate() {
    // Required fields
    if (!this.documentId) throw new Error('Document ID is required');
    if (!this.documentType) throw new Error('Document type is required');
    if (!this.citizenId) throw new Error('Citizen ID is required');
    if (!this.officerId) throw new Error('Officer ID is required');
    if (!this.contentHash) throw new Error('Content hash is required');
    
    // Validate state
    const validStates = ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'REVOKED'];
    if (!validStates.includes(this.state)) {
      throw new Error(`Invalid document state: ${this.state}. Must be one of: ${validStates.join(', ')}`);
    }
    
    // Validate timestamps
    try {
      new Date(this.createdAt);
      new Date(this.updatedAt);
    } catch (err) {
      throw new Error('Invalid timestamp format');
    }
    
    // Validate approval array
    if (!Array.isArray(this.approvals)) {
      throw new Error('Approvals must be an array');
    }
    
    // Validate transaction history
    if (!Array.isArray(this.transactionHistory)) {
      throw new Error('Transaction history must be an array');
    }
    
    return true;
  }
  
  /**
   * Add approval to the document
   * @param {Object} approval - Approval data
   * @returns {Document} - Updated document instance
   */
  addApproval(approval) {
    // Validate required approval fields
    if (!approval.approverId) throw new Error('Approver ID is required');
    if (!approval.role) throw new Error('Approver role is required');
    
    // Add timestamp if not provided
    if (!approval.timestamp) {
      approval.timestamp = new Date().toISOString();
    }
    
    // Add approval to list
    this.approvals.push(approval);
    
    // Update document state and timestamp
    this.state = 'APPROVED';
    this.updatedAt = new Date().toISOString();
    
    return this;
  }
  
  /**
   * Add transaction to history
   * @param {Object} transaction - Transaction data
   * @returns {Document} - Updated document instance
   */
  addTransaction(transaction) {
    // Validate required transaction fields
    if (!transaction.txId) throw new Error('Transaction ID is required');
    if (!transaction.action) throw new Error('Transaction action is required');
    if (!transaction.userId) throw new Error('User ID is required');
    
    // Add timestamp if not provided
    if (!transaction.timestamp) {
      transaction.timestamp = new Date().toISOString();
    }
    
    // Add transaction to history
    this.transactionHistory.push(transaction);
    
    // Update timestamp
    this.updatedAt = new Date().toISOString();
    
    return this;
  }
  
  /**
   * Change document state
   * @param {string} newState - New document state
   * @param {Object} actor - Actor performing the state change
   * @param {Object} options - Additional options
   * @returns {Document} - Updated document instance
   */
  changeState(newState, actor, options = {}) {
    // Validate new state
    const validStates = ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'REVOKED'];
    if (!validStates.includes(newState)) {
      throw new Error(`Invalid document state: ${newState}. Must be one of: ${validStates.join(', ')}`);
    }
    
    // Validate actor
    if (!actor || !actor.userId || !actor.role) {
      throw new Error('Actor information (userId and role) is required');
    }
    
    // Update state
    this.state = newState;
    this.updatedAt = new Date().toISOString();
    
    // Add state-specific information
    if (newState === 'REJECTED') {
      this.rejectionReason = options.reason || '';
      this.rejectedBy = actor.userId;
    } else if (newState === 'REVOKED') {
      this.revocationReason = options.reason || '';
      this.revokedBy = actor.userId;
    }
    
    // Add to transaction history
    this.addTransaction({
      txId: options.txId || `${newState}-${Date.now()}`,
      action: `CHANGE_STATE_TO_${newState}`,
      userId: actor.userId,
      role: actor.role,
      timestamp: new Date().toISOString(),
      reason: options.reason || ''
    });
    
    return this;
  }
  
  /**
   * Convert document to JSON
   * @returns {Object} - JSON representation of document
   */
  toJSON() {
    return {
      documentId: this.documentId,
      documentType: this.documentType,
      citizenId: this.citizenId,
      officerId: this.officerId,
      contentHash: this.contentHash,
      state: this.state,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      approvals: this.approvals,
      metadata: this.metadata,
      rejectionReason: this.rejectionReason,
      rejectedBy: this.rejectedBy,
      revocationReason: this.revocationReason,
      revokedBy: this.revokedBy,
      transactionHistory: this.transactionHistory
    };
  }
  
  /**
   * Create a Document from JSON
   * @param {Object|string} json - JSON data or string
   * @returns {Document} - Document instance
   */
  static fromJSON(json) {
    const data = typeof json === 'string' ? JSON.parse(json) : json;
    return new Document(data);
  }
}

module.exports = Document;
