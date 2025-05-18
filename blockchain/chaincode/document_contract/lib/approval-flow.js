'use strict';

const { Contract } = require('fabric-contract-api');

// Approval flow states
const ApprovalState = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  REVOKED: 'REVOKED'
};

// Approval flow types
const ApprovalType = {
  STANDARD: 'STANDARD', // Regular approval (officer only)
  IMPORTANT: 'IMPORTANT', // Important document (requires chairman approval)
  MULTI_LEVEL: 'MULTI_LEVEL' // Multi-level approval (officer + chairman)
};

class ApprovalFlow extends Contract {
  
  /**
   * Initialize the ledger with approval flow settings
   * @param {Context} ctx transaction context
   */
  async initLedger(ctx) {
    console.info('============= Initialize Approval Flow =============');
    
    // Initialize approval flow settings
    const settings = {
      defaultApprovalType: ApprovalType.STANDARD,
      importantDocumentTypes: ['BIRTH_CERTIFICATE', 'DEATH_CERTIFICATE', 'MARRIAGE_CERTIFICATE', 'LAND_CERTIFICATE'],
      requiredApprovalLevels: {
        [ApprovalType.STANDARD]: ['officer'],
        [ApprovalType.IMPORTANT]: ['chairman'],
        [ApprovalType.MULTI_LEVEL]: ['officer', 'chairman']
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await ctx.stub.putState('APPROVAL_FLOW_SETTINGS', Buffer.from(JSON.stringify(settings)));
    
    return { success: true, message: 'Approval Flow initialized' };
  }
  
  /**
   * Create a new approval request
   * @param {Context} ctx transaction context
   * @param {String} requestId unique ID for the approval request
   * @param {String} documentId ID of the document requiring approval
   * @param {String} requesterId ID of the user requesting approval
   * @param {String} approvalType type of approval flow
   * @param {String} notes optional notes for the approver
   */
  async createApprovalRequest(ctx, requestId, documentId, requesterId, approvalType, notes) {
    console.info('============= Create Approval Request =============');
    
    // Check if request already exists
    const requestBytes = await ctx.stub.getState(requestId);
    if (requestBytes && requestBytes.length > 0) {
      throw new Error(`Approval request ${requestId} already exists`);
    }
    
    // Check user role
    const clientIdentity = ctx.clientIdentity;
    const requesterRole = clientIdentity.getAttributeValue('role');
    
    // Verify document exists (via cross contract call)
    const documentRegistry = await ctx.stub.invokeChaincode('document_registry', ['readDocument', documentId], 'mychannel');
    if (documentRegistry.status !== 200) {
      throw new Error(`Document ${documentId} does not exist`);
    }
    
    // Determine approval type if not specified
    if (!approvalType || approvalType === '') {
      // Get settings
      const settingsBytes = await ctx.stub.getState('APPROVAL_FLOW_SETTINGS');
      const settings = JSON.parse(settingsBytes.toString());
      
      // Get document
      const document = JSON.parse(documentRegistry.payload.toString());
      
      // Check if document type requires important approval
      if (settings.importantDocumentTypes.includes(document.documentType)) {
        approvalType = ApprovalType.IMPORTANT;
      } else {
        approvalType = settings.defaultApprovalType;
      }
    }
    
    // Create approval request object
    const approvalRequest = {
      requestId,
      documentId,
      requesterId,
      requesterRole,
      approvalType,
      state: ApprovalState.PENDING,
      notes: notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      approvers: [],
      history: [
        {
          action: 'CREATE',
          timestamp: new Date().toISOString(),
          userId: requesterId,
          role: requesterRole
        }
      ]
    };
    
    // Store approval request in blockchain
    await ctx.stub.putState(requestId, Buffer.from(JSON.stringify(approvalRequest)));
    
    // Emit an event
    await ctx.stub.setEvent('ApprovalRequestCreated', Buffer.from(JSON.stringify({
      requestId,
      documentId,
      requesterId,
      approvalType,
      state: ApprovalState.PENDING
    })));
    
    return { success: true, requestId, approvalType };
  }
  
  /**
   * Approve a request
   * @param {Context} ctx transaction context
   * @param {String} requestId ID of the approval request
   * @param {String} approverId ID of the approver
   * @param {String} comments optional comments from the approver
   */
  async approveRequest(ctx, requestId, approverId, comments) {
    console.info('============= Approve Request =============');
    
    // Get the approval request
    const requestBytes = await ctx.stub.getState(requestId);
    if (!requestBytes || requestBytes.length === 0) {
      throw new Error(`Approval request ${requestId} does not exist`);
    }
    
    const request = JSON.parse(requestBytes.toString());
    
    // Check request state
    if (request.state !== ApprovalState.PENDING) {
      throw new Error(`Approval request ${requestId} is not in PENDING state`);
    }
    
    // Get approver role
    const clientIdentity = ctx.clientIdentity;
    const approverRole = clientIdentity.getAttributeValue('role');
    
    // Get settings
    const settingsBytes = await ctx.stub.getState('APPROVAL_FLOW_SETTINGS');
    const settings = JSON.parse(settingsBytes.toString());
    
    // Check if user has permission to approve the request
    const requiredRoles = settings.requiredApprovalLevels[request.approvalType];
    if (!requiredRoles.includes(approverRole)) {
      throw new Error(`User with role '${approverRole}' cannot approve requests of type '${request.approvalType}'`);
    }
    
    // Check if user has already approved this request
    const existingApproval = request.approvers.find(approver => approver.approverId === approverId);
    if (existingApproval) {
      throw new Error(`User ${approverId} has already approved this request`);
    }
    
    // Add approval
    const approval = {
      approverId,
      role: approverRole,
      timestamp: new Date().toISOString(),
      comments: comments || ''
    };
    
    request.approvers.push(approval);
    request.updatedAt = new Date().toISOString();
    
    // Add to history
    request.history.push({
      action: 'APPROVE',
      timestamp: new Date().toISOString(),
      userId: approverId,
      role: approverRole,
      comments: comments || ''
    });
    
    // Check if all required approvals have been received
    const approverRoles = request.approvers.map(approver => approver.role);
    const allRequired = requiredRoles.every(role => approverRoles.includes(role));
    
    if (allRequired) {
      request.state = ApprovalState.APPROVED;
      
      // Auto-approve the document in the document registry
      await ctx.stub.invokeChaincode('document_registry', [
        'approveDocument', 
        request.documentId, 
        approverId,
        `Approved through approval flow ${requestId}`
      ], 'mychannel');
    }
    
    // Store updated request
    await ctx.stub.putState(requestId, Buffer.from(JSON.stringify(request)));
    
    // Emit event
    await ctx.stub.setEvent('ApprovalRequestUpdated', Buffer.from(JSON.stringify({
      requestId,
      documentId: request.documentId,
      state: request.state,
      approverId,
      role: approverRole
    })));
    
    return { 
      success: true, 
      requestId, 
      state: request.state, 
      approved: request.state === ApprovalState.APPROVED,
      approvalsReceived: request.approvers.length,
      approvalsRequired: requiredRoles.length
    };
  }
  
  /**
   * Reject a request
   * @param {Context} ctx transaction context
   * @param {String} requestId ID of the approval request
   * @param {String} rejectorId ID of the rejector
   * @param {String} reason reason for rejection
   */
  async rejectRequest(ctx, requestId, rejectorId, reason) {
    console.info('============= Reject Request =============');
    
    // Get the approval request
    const requestBytes = await ctx.stub.getState(requestId);
    if (!requestBytes || requestBytes.length === 0) {
      throw new Error(`Approval request ${requestId} does not exist`);
    }
    
    const request = JSON.parse(requestBytes.toString());
    
    // Check request state
    if (request.state !== ApprovalState.PENDING) {
      throw new Error(`Approval request ${requestId} is not in PENDING state`);
    }
    
    // Get rejector role
    const clientIdentity = ctx.clientIdentity;
    const rejectorRole = clientIdentity.getAttributeValue('role');
    
    // Get settings
    const settingsBytes = await ctx.stub.getState('APPROVAL_FLOW_SETTINGS');
    const settings = JSON.parse(settingsBytes.toString());
    
    // Check if user has permission to approve/reject the request
    const requiredRoles = settings.requiredApprovalLevels[request.approvalType];
    if (!requiredRoles.includes(rejectorRole)) {
      throw new Error(`User with role '${rejectorRole}' cannot reject requests of type '${request.approvalType}'`);
    }
    
    // Update request state
    request.state = ApprovalState.REJECTED;
    request.rejectionReason = reason;
    request.rejectedBy = {
      rejectorId,
      role: rejectorRole,
      timestamp: new Date().toISOString()
    };
    request.updatedAt = new Date().toISOString();
    
    // Add to history
    request.history.push({
      action: 'REJECT',
      timestamp: new Date().toISOString(),
      userId: rejectorId,
      role: rejectorRole,
      reason: reason
    });
    
    // Auto-reject the document in the document registry
    await ctx.stub.invokeChaincode('document_registry', [
      'rejectDocument', 
      request.documentId, 
      rejectorId,
      reason
    ], 'mychannel');
    
    // Store updated request
    await ctx.stub.putState(requestId, Buffer.from(JSON.stringify(request)));
    
    // Emit event
    await ctx.stub.setEvent('ApprovalRequestRejected', Buffer.from(JSON.stringify({
      requestId,
      documentId: request.documentId,
      state: ApprovalState.REJECTED,
      rejectorId,
      reason
    })));
    
    return { 
      success: true, 
      requestId, 
      state: ApprovalState.REJECTED
    };
  }
  
  /**
   * Get approval request
   * @param {Context} ctx transaction context
   * @param {String} requestId ID of the approval request
   */
  async getApprovalRequest(ctx, requestId) {
    console.info('============= Get Approval Request =============');
    
    const requestBytes = await ctx.stub.getState(requestId);
    if (!requestBytes || requestBytes.length === 0) {
      throw new Error(`Approval request ${requestId} does not exist`);
    }
    
    return requestBytes.toString();
  }
  
  /**
   * Get all approval requests for a document
   * @param {Context} ctx transaction context
   * @param {String} documentId ID of the document
   */
  async getApprovalRequestsByDocument(ctx, documentId) {
    console.info('============= Get Approval Requests By Document =============');
    
    const query = {
      selector: {
        documentId: documentId
      },
      sort: [{ createdAt: 'desc' }]
    };
    
    const queryString = JSON.stringify(query);
    const iterator = await ctx.stub.getQueryResult(queryString);
    
    const requests = [];
    let result = await iterator.next();
    
    while (!result.done) {
      const requestString = Buffer.from(result.value.value.toString()).toString('utf8');
      const request = JSON.parse(requestString);
      requests.push(request);
      result = await iterator.next();
    }
    
    return JSON.stringify(requests);
  }
  
  /**
   * Get all approval requests by state
   * @param {Context} ctx transaction context
   * @param {String} state state to filter by
   */
  async getApprovalRequestsByState(ctx, state) {
    console.info('============= Get Approval Requests By State =============');
    
    const query = {
      selector: {
        state: state
      },
      sort: [{ createdAt: 'desc' }]
    };
    
    const queryString = JSON.stringify(query);
    const iterator = await ctx.stub.getQueryResult(queryString);
    
    const requests = [];
    let result = await iterator.next();
    
    while (!result.done) {
      const requestString = Buffer.from(result.value.value.toString()).toString('utf8');
      const request = JSON.parse(requestString);
      requests.push(request);
      result = await iterator.next();
    }
    
    return JSON.stringify(requests);
  }
  
  /**
   * Get approval requests that need action from a specific role
   * @param {Context} ctx transaction context
   * @param {String} role role to filter by (chairman, officer)
   */
  async getApprovalRequestsForRole(ctx, role) {
    console.info('============= Get Approval Requests For Role =============');
    
    // Get settings
    const settingsBytes = await ctx.stub.getState('APPROVAL_FLOW_SETTINGS');
    const settings = JSON.parse(settingsBytes.toString());
    
    // Find approval types that require this role
    const relevantTypes = Object.entries(settings.requiredApprovalLevels)
      .filter(([_, roles]) => roles.includes(role))
      .map(([type, _]) => type);
    
    // Query pending requests of relevant types
    const query = {
      selector: {
        state: ApprovalState.PENDING,
        approvalType: { $in: relevantTypes }
      },
      sort: [{ createdAt: 'asc' }]
    };
    
    const queryString = JSON.stringify(query);
    const iterator = await ctx.stub.getQueryResult(queryString);
    
    const requests = [];
    let result = await iterator.next();
    
    while (!result.done) {
      const requestString = Buffer.from(result.value.value.toString()).toString('utf8');
      const request = JSON.parse(requestString);
      
      // Check if this role has already approved
      const hasApproved = request.approvers.some(approver => approver.role === role);
      if (!hasApproved) {
        requests.push(request);
      }
      
      result = await iterator.next();
    }
    
    return JSON.stringify(requests);
  }
  
  /**
   * Update approval flow settings
   * @param {Context} ctx transaction context
   * @param {String} settingsJson new settings as JSON string
   */
  async updateSettings(ctx, settingsJson) {
    console.info('============= Update Approval Flow Settings =============');
    
    // Check user role (only chairman can update settings)
    const clientIdentity = ctx.clientIdentity;
    const role = clientIdentity.getAttributeValue('role');
    if (role !== 'chairman') {
      throw new Error('Only chairman can update approval flow settings');
    }
    
    // Get current settings
    const settingsBytes = await ctx.stub.getState('APPROVAL_FLOW_SETTINGS');
    const currentSettings = JSON.parse(settingsBytes.toString());
    
    // Update settings
    const newSettings = JSON.parse(settingsJson);
    const updatedSettings = {
      ...currentSettings,
      ...newSettings,
      updatedAt: new Date().toISOString()
    };
    
    // Store updated settings
    await ctx.stub.putState('APPROVAL_FLOW_SETTINGS', Buffer.from(JSON.stringify(updatedSettings)));
    
    return { success: true, message: 'Approval flow settings updated' };
  }
}

module.exports = ApprovalFlow;
