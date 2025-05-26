'use strict';

/**
 * Request model for the blockchain
 * Represents a citizen's request for an administrative document
 */
class Request {
  /**
   * Constructor for Request model
   * @param {Object} data - Request data
   */
  constructor(data) {
    // Required fields
    this.requestId = data.requestId;
    this.citizenId = data.citizenId;
    this.documentType = data.documentType;
    
    // Status and priority
    this.status = data.status || 'PENDING'; // 'PENDING', 'ASSIGNED', 'PROCESSING', 'COMPLETED', 'REJECTED'
    this.priority = data.priority || 'NORMAL'; // 'LOW', 'NORMAL', 'HIGH', 'URGENT'
    
    // Timestamps
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.completedAt = data.completedAt || null;
    
    // Assignment information
    this.assignedTo = data.assignedTo || null;
    this.assignedAt = data.assignedAt || null;
    this.assignedBy = data.assignedBy || null;
    
    // Completion information
    this.completedBy = data.completedBy || null;
    this.documentId = data.documentId || null; // ID of the generated document (if completed)
    
    // Rejection information
    this.rejectedBy = data.rejectedBy || null;
    this.rejectionReason = data.rejectionReason || '';
    
    // Request details
    this.details = data.details || {};
    this.attachments = data.attachments || [];
    this.notes = data.notes || '';
    
    // Transaction history
    this.transactionHistory = data.transactionHistory || [];
  }
  
  /**
   * Validate the request model
   * @returns {boolean} - True if valid, throws error if invalid
   */
  validate() {
    // Required fields
    if (!this.requestId) throw new Error('Request ID is required');
    if (!this.citizenId) throw new Error('Citizen ID is required');
    if (!this.documentType) throw new Error('Document type is required');
    
    // Validate status
    const validStatuses = ['PENDING', 'ASSIGNED', 'PROCESSING', 'COMPLETED', 'REJECTED'];
    if (!validStatuses.includes(this.status)) {
      throw new Error(`Invalid status: ${this.status}. Must be one of: ${validStatuses.join(', ')}`);
    }
    
    // Validate priority
    const validPriorities = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];
    if (!validPriorities.includes(this.priority)) {
      throw new Error(`Invalid priority: ${this.priority}. Must be one of: ${validPriorities.join(', ')}`);
    }
    
    // Validate timestamps
    try {
      new Date(this.createdAt);
      new Date(this.updatedAt);
      if (this.completedAt) new Date(this.completedAt);
      if (this.assignedAt) new Date(this.assignedAt);
    } catch (err) {
      throw new Error('Invalid timestamp format');
    }
    
    // Validate arrays
    if (!Array.isArray(this.attachments)) {
      throw new Error('Attachments must be an array');
    }
    
    if (!Array.isArray(this.transactionHistory)) {
      throw new Error('Transaction history must be an array');
    }
    
    // Validate completion/rejection consistency
    if (this.status === 'COMPLETED' && !this.documentId) {
      throw new Error('Document ID is required for completed requests');
    }
    
    if (this.status === 'REJECTED' && !this.rejectionReason) {
      throw new Error('Rejection reason is required for rejected requests');
    }
    
    return true;
  }
  
  /**
   * Change request status
   * @param {string} newStatus - New request status
   * @param {Object} actor - Actor performing the status change
   * @param {Object} options - Additional options
   * @returns {Request} - Updated request instance
   */
  changeStatus(newStatus, actor, options = {}) {
    // Validate new status
    const validStatuses = ['PENDING', 'ASSIGNED', 'PROCESSING', 'COMPLETED', 'REJECTED'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}. Must be one of: ${validStatuses.join(', ')}`);
    }
    
    // Validate actor
    if (!actor || !actor.userId || !actor.role) {
      throw new Error('Actor information (userId and role) is required');
    }
    
    // Validate permissions
    if ((newStatus === 'ASSIGNED' || newStatus === 'PROCESSING' || 
         newStatus === 'COMPLETED' || newStatus === 'REJECTED') && 
        actor.role !== 'officer' && actor.role !== 'chairman') {
      throw new Error('Only officers or chairman can update request status');
    }
    
    // Special validations per status
    if (newStatus === 'COMPLETED' && !options.documentId) {
      throw new Error('Document ID is required to complete a request');
    }
    
    if (newStatus === 'REJECTED' && !options.reason) {
      throw new Error('Reason is required to reject a request');
    }
    
    if (newStatus === 'ASSIGNED' && !options.assignedTo) {
      throw new Error('Officer ID is required to assign a request');
    }
    
    // Update status
    this.status = newStatus;
    this.updatedAt = new Date().toISOString();
    
    // Update status-specific information
    if (newStatus === 'ASSIGNED') {
      this.assignedTo = options.assignedTo;
      this.assignedAt = new Date().toISOString();
      this.assignedBy = actor.userId;
    } else if (newStatus === 'COMPLETED') {
      this.completedAt = new Date().toISOString();
      this.completedBy = actor.userId;
      this.documentId = options.documentId;
    } else if (newStatus === 'REJECTED') {
      this.rejectedBy = actor.userId;
      this.rejectionReason = options.reason;
    }
    
    // Add notes if provided
    if (options.notes) {
      this.notes += `\n${actor.role} (${actor.userId}): ${options.notes}`;
    }
    
    // Add to transaction history
    this.addTransaction({
      txId: options.txId || `${newStatus}-${Date.now()}`,
      action: `CHANGE_STATUS_TO_${newStatus}`,
      userId: actor.userId,
      role: actor.role,
      timestamp: new Date().toISOString(),
      details: options
    });
    
    return this;
  }
  
  /**
   * Add transaction to history
   * @param {Object} transaction - Transaction data
   * @returns {Request} - Updated request instance
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
   * Add attachment to request
   * @param {Object} attachment - Attachment data
   * @returns {Request} - Updated request instance
   */
  addAttachment(attachment) {
    // Validate attachment
    if (!attachment.attachmentId) throw new Error('Attachment ID is required');
    if (!attachment.fileType) throw new Error('File type is required');
    if (!attachment.contentHash) throw new Error('Content hash is required');
    
    // Add attachment to list
    this.attachments.push({
      attachmentId: attachment.attachmentId,
      fileName: attachment.fileName || `attachment-${this.attachments.length + 1}`,
      fileType: attachment.fileType,
      contentHash: attachment.contentHash,
      size: attachment.size || 0,
      uploadedBy: attachment.uploadedBy || this.citizenId,
      uploadedAt: attachment.uploadedAt || new Date().toISOString(),
      description: attachment.description || ''
    });
    
    // Update timestamp
    this.updatedAt = new Date().toISOString();
    
    return this;
  }
  
  /**
   * Assign request to an officer
   * @param {string} officerId - ID of the assigned officer
   * @param {Object} actor - Actor performing the assignment
   * @returns {Request} - Updated request instance
   */
  assignToOfficer(officerId, actor) {
    // Validate actor
    if (!actor || !actor.userId || !actor.role) {
      throw new Error('Actor information (userId and role) is required');
    }
    
    // Validate permissions (only officers or chairman can assign requests)
    if (actor.role !== 'officer' && actor.role !== 'chairman') {
      throw new Error('Only officers or chairman can assign requests');
    }
    
    // Update assignment info
    this.assignedTo = officerId;
    this.assignedAt = new Date().toISOString();
    this.assignedBy = actor.userId;
    this.status = 'ASSIGNED';
    this.updatedAt = new Date().toISOString();
    
    // Add to transaction history
    this.addTransaction({
      txId: `ASSIGN-${Date.now()}`,
      action: 'ASSIGN_TO_OFFICER',
      userId: actor.userId,
      role: actor.role,
      timestamp: new Date().toISOString(),
      assignedTo: officerId
    });
    
    return this;
  }
  
  /**
   * Convert request to JSON
   * @returns {Object} - JSON representation of request
   */
  toJSON() {
    return {
      requestId: this.requestId,
      citizenId: this.citizenId,
      documentType: this.documentType,
      status: this.status,
      priority: this.priority,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      completedAt: this.completedAt,
      assignedTo: this.assignedTo,
      assignedAt: this.assignedAt,
      assignedBy: this.assignedBy,
      completedBy: this.completedBy,
      documentId: this.documentId,
      rejectedBy: this.rejectedBy,
      rejectionReason: this.rejectionReason,
      details: this.details,
      attachments: this.attachments,
      notes: this.notes,
      transactionHistory: this.transactionHistory
    };
  }
  
  /**
   * Create a Request from JSON
   * @param {Object|string} json - JSON data or string
   * @returns {Request} - Request instance
   */
  static fromJSON(json) {
    const data = typeof json === 'string' ? JSON.parse(json) : json;
    return new Request(data);
  }
}

module.exports = Request;
