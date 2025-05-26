'use strict';

/**
 * User model for the blockchain
 * Represents a user in the administrative system
 */
class User {
  /**
   * Constructor for User model
   * @param {Object} data - User data
   */
  constructor(data) {
    // Required fields
    this.userId = data.userId;
    this.role = data.role; // 'citizen', 'officer', or 'chairman'
    
    // Status
    this.status = data.status || 'ACTIVE'; // 'ACTIVE', 'PENDING', 'SUSPENDED', 'INACTIVE'
    
    // Personal information
    this.firstName = data.firstName || '';
    this.lastName = data.lastName || '';
    this.email = data.email || '';
    this.phoneNumber = data.phoneNumber || '';
    this.idNumber = data.idNumber || ''; // National ID number
    
    // Blockchain identity information
    this.certificateId = data.certificateId || '';
    this.publicKey = data.publicKey || '';
    
    // Timestamps
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    
    // Additional information
    this.metadata = data.metadata || {};
    
    // Officer-specific fields (only relevant if role is 'officer' or 'chairman')
    if (data.role === 'officer' || data.role === 'chairman') {
      this.officerCode = data.officerCode || '';
      this.department = data.department || '';
      this.position = data.position || '';
      this.approvedBy = data.approvedBy || '';
      this.approvedAt = data.approvedAt || null;
    }
    
    // Approval information
    this.approvalRequests = data.approvalRequests || [];
    
    // Transaction history
    this.transactionHistory = data.transactionHistory || [];
  }
  
  /**
   * Validate the user model
   * @returns {boolean} - True if valid, throws error if invalid
   */
  validate() {
    // Required fields
    if (!this.userId) throw new Error('User ID is required');
    
    // Validate role
    const validRoles = ['citizen', 'officer', 'chairman'];
    if (!validRoles.includes(this.role)) {
      throw new Error(`Invalid role: ${this.role}. Must be one of: ${validRoles.join(', ')}`);
    }
    
    // Validate status
    const validStatuses = ['ACTIVE', 'PENDING', 'SUSPENDED', 'INACTIVE'];
    if (!validStatuses.includes(this.status)) {
      throw new Error(`Invalid status: ${this.status}. Must be one of: ${validStatuses.join(', ')}`);
    }
    
    // Validate email format if provided
    if (this.email && !this.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      throw new Error('Invalid email format');
    }
    
    // Validate timestamps
    try {
      new Date(this.createdAt);
      new Date(this.updatedAt);
      if (this.approvedAt) new Date(this.approvedAt);
    } catch (err) {
      throw new Error('Invalid timestamp format');
    }
    
    // Validate arrays
    if (!Array.isArray(this.approvalRequests)) {
      throw new Error('Approval requests must be an array');
    }
    
    if (!Array.isArray(this.transactionHistory)) {
      throw new Error('Transaction history must be an array');
    }
    
    return true;
  }
  
  /**
   * Change user status
   * @param {string} newStatus - New user status
   * @param {Object} actor - Actor performing the status change
   * @param {Object} options - Additional options
   * @returns {User} - Updated user instance
   */
  changeStatus(newStatus, actor, options = {}) {
    // Validate new status
    const validStatuses = ['ACTIVE', 'PENDING', 'SUSPENDED', 'INACTIVE'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}. Must be one of: ${validStatuses.join(', ')}`);
    }
    
    // Validate actor
    if (!actor || !actor.userId || !actor.role) {
      throw new Error('Actor information (userId and role) is required');
    }
    
    // Check actor permissions (only chairman can activate/suspend officers)
    if ((this.role === 'officer' || this.role === 'chairman') && 
        (newStatus === 'ACTIVE' || newStatus === 'SUSPENDED') && 
        actor.role !== 'chairman') {
      throw new Error('Only chairman can activate or suspend officers');
    }
    
    // Update status
    this.status = newStatus;
    this.updatedAt = new Date().toISOString();
    
    // Add status-specific information
    if (newStatus === 'ACTIVE' && this.role === 'officer' && !this.approvedAt) {
      this.approvedBy = actor.userId;
      this.approvedAt = new Date().toISOString();
    }
    
    // Add to transaction history
    this.addTransaction({
      txId: options.txId || `${newStatus}-${Date.now()}`,
      action: `CHANGE_STATUS_TO_${newStatus}`,
      userId: actor.userId,
      role: actor.role,
      timestamp: new Date().toISOString(),
      reason: options.reason || ''
    });
    
    return this;
  }
  
  /**
   * Add transaction to history
   * @param {Object} transaction - Transaction data
   * @returns {User} - Updated user instance
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
   * Add approval request
   * @param {Object} request - Approval request data
   * @returns {User} - Updated user instance
   */
  addApprovalRequest(request) {
    // Validate request
    if (!request.requestId) throw new Error('Request ID is required');
    if (!request.requestType) throw new Error('Request type is required');
    if (!request.requestedBy) throw new Error('Requester ID is required');
    
    // Add timestamp if not provided
    if (!request.timestamp) {
      request.timestamp = new Date().toISOString();
    }
    
    // Set status if not provided
    if (!request.status) {
      request.status = 'PENDING';
    }
    
    // Add request to list
    this.approvalRequests.push(request);
    
    // Update timestamp
    this.updatedAt = new Date().toISOString();
    
    return this;
  }
  
  /**
   * Approve officer role
   * @param {string} approverId - ID of the approver
   * @param {string} requestId - ID of the approval request
   * @returns {User} - Updated user instance
   */
  approveOfficerRole(approverId, requestId) {
    // Validate role is officer or chairman
    if (this.role !== 'officer' && this.role !== 'chairman') {
      throw new Error('Only officer or chairman roles can be approved');
    }
    
    // Find approval request
    const requestIndex = this.approvalRequests.findIndex(req => 
      req.requestId === requestId && req.requestType === 'OFFICER_ROLE');
    
    if (requestIndex === -1) {
      throw new Error(`Approval request ${requestId} not found`);
    }
    
    // Update approval request
    this.approvalRequests[requestIndex].status = 'APPROVED';
    this.approvalRequests[requestIndex].approvedBy = approverId;
    this.approvalRequests[requestIndex].approvedAt = new Date().toISOString();
    
    // Update user
    this.status = 'ACTIVE';
    this.approvedBy = approverId;
    this.approvedAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
    
    // Add to transaction history
    this.addTransaction({
      txId: `APPROVE-${Date.now()}`,
      action: 'APPROVE_OFFICER_ROLE',
      userId: approverId,
      role: 'chairman',
      timestamp: new Date().toISOString(),
      requestId: requestId
    });
    
    return this;
  }
  
  /**
   * Convert user to JSON
   * @returns {Object} - JSON representation of user
   */
  toJSON() {
    const json = {
      userId: this.userId,
      role: this.role,
      status: this.status,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phoneNumber: this.phoneNumber,
      idNumber: this.idNumber,
      certificateId: this.certificateId,
      publicKey: this.publicKey,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      metadata: this.metadata,
      approvalRequests: this.approvalRequests,
      transactionHistory: this.transactionHistory
    };
    
    // Add officer-specific fields if applicable
    if (this.role === 'officer' || this.role === 'chairman') {
      json.officerCode = this.officerCode;
      json.department = this.department;
      json.position = this.position;
      json.approvedBy = this.approvedBy;
      json.approvedAt = this.approvedAt;
    }
    
    return json;
  }
  
  /**
   * Create a User from JSON
   * @param {Object|string} json - JSON data or string
   * @returns {User} - User instance
   */
  static fromJSON(json) {
    const data = typeof json === 'string' ? JSON.parse(json) : json;
    return new User(data);
  }
}

module.exports = User;
