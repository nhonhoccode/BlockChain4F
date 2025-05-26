'use strict';

const { Contract } = require('fabric-contract-api');
const crypto = require('crypto');

// Định nghĩa trạng thái quy trình phê duyệt
const ApprovalState = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELED: 'CANCELED'
};

// Định nghĩa loại quy trình phê duyệt
const ApprovalType = {
  DOCUMENT: 'DOCUMENT',
  USER_ROLE: 'USER_ROLE',
  SYSTEM_CONFIG: 'SYSTEM_CONFIG',
  IMPORTANT_DOCUMENT: 'IMPORTANT_DOCUMENT'
};

class AdminContract extends Contract {
  
  /**
   * Initialize ledger with demo data
   * @param {Context} ctx - Transaction context
   */
  async initLedger(ctx) {
    console.info('============= Khởi tạo Admin Contract =============');
    
    // Không khởi tạo dữ liệu mẫu trong môi trường production
    return { success: true, message: 'Admin Contract đã được khởi tạo' };
  }

  /**
   * Tạo quy trình phê duyệt mới
   * @param {Context} ctx - Transaction context
   * @param {String} approvalId - ID của quy trình phê duyệt
   * @param {String} type - Loại quy trình (DOCUMENT, USER_ROLE, SYSTEM_CONFIG, IMPORTANT_DOCUMENT)
   * @param {String} targetId - ID của đối tượng cần phê duyệt (documentId, userId, ...)
   * @param {String} requestedBy - ID của người yêu cầu phê duyệt
   * @param {String} requiredApprovers - Danh sách ID người phê duyệt, phân cách bởi dấu phẩy
   * @param {String} details - Chi tiết quy trình dạng JSON string
   * @param {String} priority - Mức độ ưu tiên (HIGH, MEDIUM, LOW)
   * @param {String} deadline - Thời hạn phê duyệt (định dạng ISO)
   */
  async createApprovalWorkflow(ctx, approvalId, type, targetId, requestedBy, requiredApprovers, details = '{}', priority = 'MEDIUM', deadline = null) {
    console.info('============= Tạo quy trình phê duyệt =============');
    
    // Kiểm tra quy trình đã tồn tại chưa
    const approvalExists = await this.approvalWorkflowExists(ctx, approvalId);
    if (approvalExists) {
      throw new Error(`Quy trình phê duyệt ${approvalId} đã tồn tại`);
    }
    
    // Kiểm tra loại quy trình hợp lệ
    if (!Object.values(ApprovalType).includes(type)) {
      throw new Error(`Loại quy trình ${type} không hợp lệ`);
    }
    
    // Kiểm tra quyền hạn
    const clientId = this.getClientId(ctx);
    const clientRole = this.getClientAttribute(ctx, 'role');
    
    if (clientRole !== 'officer' && clientRole !== 'chairman') {
      throw new Error('Không có quyền tạo quy trình phê duyệt');
    }
    
    // Kiểm tra và xử lý danh sách người phê duyệt
    const approverList = requiredApprovers.split(',').map(id => id.trim());
    if (approverList.length === 0) {
      throw new Error('Cần ít nhất một người phê duyệt');
    }
    
    // Tạo danh sách chi tiết người phê duyệt
    const approvers = approverList.map(id => {
      return {
        approverId: id,
        status: 'PENDING',
        approvedAt: null,
        comments: ''
      };
    });
    
    // Chuẩn bị đối tượng quy trình phê duyệt
    const approval = {
      docType: 'approval',
      approvalId,
      type,
      targetId,
      requestedBy,
      state: ApprovalState.PENDING,
      priority,
      deadline: deadline || '',
      details: JSON.parse(details),
      approvers,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
      history: [
        {
          action: 'CREATE',
          timestamp: new Date().toISOString(),
          by: clientId,
          txId: ctx.stub.getTxID()
        }
      ]
    };
    
    // Lưu vào blockchain
    await ctx.stub.putState(approvalId, Buffer.from(JSON.stringify(approval)));
    
    // Emit event
    const eventPayload = {
      approvalId,
      type,
      targetId,
      requestedBy,
      state: ApprovalState.PENDING,
      action: 'CREATE',
      txId: ctx.stub.getTxID()
    };
    await ctx.stub.setEvent('ApprovalWorkflowCreated', Buffer.from(JSON.stringify(eventPayload)));
    
    return { success: true, approvalId, txId: ctx.stub.getTxID() };
  }

  /**
   * Phê duyệt một quy trình
   * @param {Context} ctx - Transaction context
   * @param {String} approvalId - ID của quy trình phê duyệt
   * @param {String} approverId - ID của người phê duyệt
   * @param {String} comments - Ghi chú khi phê duyệt (optional)
   */
  async approveWorkflow(ctx, approvalId, approverId, comments = '') {
    console.info('============= Phê duyệt quy trình =============');
    
    // Lấy thông tin quy trình
    const approvalJson = await this.readApprovalWorkflow(ctx, approvalId);
    if (!approvalJson) {
      throw new Error(`Quy trình phê duyệt ${approvalId} không tồn tại`);
    }
    
    const approval = JSON.parse(approvalJson);
    
    // Kiểm tra trạng thái
    if (approval.state !== ApprovalState.PENDING) {
      throw new Error(`Quy trình ${approvalId} không ở trạng thái PENDING`);
    }
    
    // Kiểm tra người phê duyệt có trong danh sách không
    const approverIndex = approval.approvers.findIndex(a => a.approverId === approverId);
    if (approverIndex === -1) {
      throw new Error(`Người phê duyệt ${approverId} không có trong danh sách quy trình ${approvalId}`);
    }
    
    // Kiểm tra đã phê duyệt chưa
    if (approval.approvers[approverIndex].status === 'APPROVED') {
      return { success: true, approvalId, message: 'Bạn đã phê duyệt quy trình này rồi' };
    }
    
    // Kiểm tra quyền hạn
    const clientId = this.getClientId(ctx);
    const clientRole = this.getClientAttribute(ctx, 'role');
    
    // Nếu là loại IMPORTANT_DOCUMENT, chỉ chairman mới được phê duyệt
    if (approval.type === ApprovalType.IMPORTANT_DOCUMENT && clientRole !== 'chairman') {
      throw new Error('Chỉ chủ tịch mới có quyền phê duyệt giấy tờ quan trọng');
    }
    
    if (clientRole !== 'officer' && clientRole !== 'chairman') {
      throw new Error('Không có quyền phê duyệt quy trình');
    }
    
    // Cập nhật trạng thái người phê duyệt
    approval.approvers[approverIndex].status = 'APPROVED';
    approval.approvers[approverIndex].approvedAt = new Date().toISOString();
    approval.approvers[approverIndex].comments = comments;
    
    // Kiểm tra xem tất cả đã phê duyệt chưa
    const allApproved = approval.approvers.every(a => a.status === 'APPROVED');
    
    // Nếu tất cả đã phê duyệt, cập nhật trạng thái quy trình
    if (allApproved) {
      approval.state = ApprovalState.APPROVED;
      approval.completedAt = new Date().toISOString();
    }
    
    approval.updatedAt = new Date().toISOString();
    approval.history.push({
      action: 'APPROVE',
      timestamp: new Date().toISOString(),
      by: clientId,
      approverId: approverId,
      txId: ctx.stub.getTxID()
    });
    
    // Lưu vào blockchain
    await ctx.stub.putState(approvalId, Buffer.from(JSON.stringify(approval)));
    
    // Emit event
    const eventPayload = {
      approvalId,
      type: approval.type,
      targetId: approval.targetId,
      approverId,
      state: approval.state,
      action: 'APPROVE',
      allApproved,
      txId: ctx.stub.getTxID()
    };
    await ctx.stub.setEvent('ApprovalWorkflowUpdated', Buffer.from(JSON.stringify(eventPayload)));
    
    return { 
      success: true, 
      approvalId, 
      state: approval.state,
      allApproved,
      txId: ctx.stub.getTxID() 
    };
  }

  /**
   * Từ chối một quy trình
   * @param {Context} ctx - Transaction context
   * @param {String} approvalId - ID của quy trình phê duyệt
   * @param {String} approverId - ID của người từ chối
   * @param {String} reason - Lý do từ chối
   */
  async rejectWorkflow(ctx, approvalId, approverId, reason) {
    console.info('============= Từ chối quy trình =============');
    
    // Lấy thông tin quy trình
    const approvalJson = await this.readApprovalWorkflow(ctx, approvalId);
    if (!approvalJson) {
      throw new Error(`Quy trình phê duyệt ${approvalId} không tồn tại`);
    }
    
    const approval = JSON.parse(approvalJson);
    
    // Kiểm tra trạng thái
    if (approval.state !== ApprovalState.PENDING) {
      throw new Error(`Quy trình ${approvalId} không ở trạng thái PENDING`);
    }
    
    // Kiểm tra người từ chối có trong danh sách không
    const approverIndex = approval.approvers.findIndex(a => a.approverId === approverId);
    if (approverIndex === -1) {
      throw new Error(`Người phê duyệt ${approverId} không có trong danh sách quy trình ${approvalId}`);
    }
    
    // Kiểm tra quyền hạn
    const clientId = this.getClientId(ctx);
    const clientRole = this.getClientAttribute(ctx, 'role');
    
    if (clientRole !== 'officer' && clientRole !== 'chairman') {
      throw new Error('Không có quyền từ chối quy trình');
    }
    
    // Cập nhật trạng thái người từ chối
    approval.approvers[approverIndex].status = 'REJECTED';
    approval.approvers[approverIndex].comments = reason;
    
    // Cập nhật trạng thái quy trình
    approval.state = ApprovalState.REJECTED;
    approval.updatedAt = new Date().toISOString();
    approval.completedAt = new Date().toISOString();
    approval.rejectedReason = reason;
    approval.rejectedBy = approverId;
    approval.history.push({
      action: 'REJECT',
      timestamp: new Date().toISOString(),
      by: clientId,
      approverId: approverId,
      reason: reason,
      txId: ctx.stub.getTxID()
    });
    
    // Lưu vào blockchain
    await ctx.stub.putState(approvalId, Buffer.from(JSON.stringify(approval)));
    
    // Emit event
    const eventPayload = {
      approvalId,
      type: approval.type,
      targetId: approval.targetId,
      approverId,
      state: ApprovalState.REJECTED,
      action: 'REJECT',
      txId: ctx.stub.getTxID()
    };
    await ctx.stub.setEvent('ApprovalWorkflowRejected', Buffer.from(JSON.stringify(eventPayload)));
    
    return { 
      success: true, 
      approvalId, 
      state: ApprovalState.REJECTED,
      rejectedBy: approverId,
      txId: ctx.stub.getTxID() 
    };
  }

  /**
   * Hủy một quy trình
   * @param {Context} ctx - Transaction context
   * @param {String} approvalId - ID của quy trình phê duyệt
   * @param {String} reason - Lý do hủy
   */
  async cancelWorkflow(ctx, approvalId, reason) {
    console.info('============= Hủy quy trình =============');
    
    // Lấy thông tin quy trình
    const approvalJson = await this.readApprovalWorkflow(ctx, approvalId);
    if (!approvalJson) {
      throw new Error(`Quy trình phê duyệt ${approvalId} không tồn tại`);
    }
    
    const approval = JSON.parse(approvalJson);
    
    // Kiểm tra trạng thái
    if (approval.state !== ApprovalState.PENDING) {
      throw new Error(`Quy trình ${approvalId} không ở trạng thái PENDING`);
    }
    
    // Kiểm tra quyền hạn
    const clientId = this.getClientId(ctx);
    const clientRole = this.getClientAttribute(ctx, 'role');
    
    // Chỉ người tạo quy trình, hoặc chairman mới có quyền hủy
    if (clientId !== approval.requestedBy && clientRole !== 'chairman') {
      throw new Error('Không có quyền hủy quy trình này');
    }
    
    // Cập nhật trạng thái quy trình
    approval.state = ApprovalState.CANCELED;
    approval.updatedAt = new Date().toISOString();
    approval.completedAt = new Date().toISOString();
    approval.cancelReason = reason;
    approval.canceledBy = clientId;
    approval.history.push({
      action: 'CANCEL',
      timestamp: new Date().toISOString(),
      by: clientId,
      reason: reason,
      txId: ctx.stub.getTxID()
    });
    
    // Lưu vào blockchain
    await ctx.stub.putState(approvalId, Buffer.from(JSON.stringify(approval)));
    
    // Emit event
    const eventPayload = {
      approvalId,
      type: approval.type,
      targetId: approval.targetId,
      canceledBy: clientId,
      state: ApprovalState.CANCELED,
      action: 'CANCEL',
      txId: ctx.stub.getTxID()
    };
    await ctx.stub.setEvent('ApprovalWorkflowCanceled', Buffer.from(JSON.stringify(eventPayload)));
    
    return { 
      success: true, 
      approvalId, 
      state: ApprovalState.CANCELED,
      canceledBy: clientId,
      txId: ctx.stub.getTxID() 
    };
  }

  /**
   * Lấy thông tin quy trình
   * @param {Context} ctx - Transaction context
   * @param {String} approvalId - ID của quy trình phê duyệt
   */
  async getApprovalWorkflow(ctx, approvalId) {
    console.info('============= Lấy thông tin quy trình =============');
    
    // Lấy thông tin quy trình
    const approvalJson = await this.readApprovalWorkflow(ctx, approvalId);
    if (!approvalJson) {
      throw new Error(`Quy trình phê duyệt ${approvalId} không tồn tại`);
    }
    
    return approvalJson;
  }

  /**
   * Lấy danh sách quy trình theo trạng thái
   * @param {Context} ctx - Transaction context
   * @param {String} state - Trạng thái (PENDING, APPROVED, REJECTED, CANCELED)
   */
  async getApprovalWorkflowsByState(ctx, state) {
    console.info('============= Lấy danh sách quy trình theo trạng thái =============');
    
    // Kiểm tra trạng thái hợp lệ
    if (!Object.values(ApprovalState).includes(state)) {
      throw new Error(`Trạng thái ${state} không hợp lệ`);
    }
    
    const startKey = '';
    const endKey = '';
    const iterator = await ctx.stub.getStateByRange(startKey, endKey);
    
    const results = [];
    for await (const { key, value } of iterator) {
      const approvalStr = value.toString();
      try {
        const approval = JSON.parse(approvalStr);
        if (approval.docType === 'approval' && approval.state === state) {
          // Chỉ trả về thông tin cơ bản
          results.push({
            approvalId: approval.approvalId,
            type: approval.type,
            targetId: approval.targetId,
            requestedBy: approval.requestedBy,
            state: approval.state,
            priority: approval.priority,
            createdAt: approval.createdAt,
            updatedAt: approval.updatedAt,
            completedAt: approval.completedAt,
            approverCount: approval.approvers.length,
            approvedCount: approval.approvers.filter(a => a.status === 'APPROVED').length
          });
        }
      } catch (err) {
        console.log(err);
      }
    }
    
    return results;
  }

  /**
   * Lấy danh sách quy trình theo loại
   * @param {Context} ctx - Transaction context
   * @param {String} type - Loại quy trình (DOCUMENT, USER_ROLE, SYSTEM_CONFIG, IMPORTANT_DOCUMENT)
   */
  async getApprovalWorkflowsByType(ctx, type) {
    console.info('============= Lấy danh sách quy trình theo loại =============');
    
    // Kiểm tra loại quy trình hợp lệ
    if (!Object.values(ApprovalType).includes(type)) {
      throw new Error(`Loại quy trình ${type} không hợp lệ`);
    }
    
    const startKey = '';
    const endKey = '';
    const iterator = await ctx.stub.getStateByRange(startKey, endKey);
    
    const results = [];
    for await (const { key, value } of iterator) {
      const approvalStr = value.toString();
      try {
        const approval = JSON.parse(approvalStr);
        if (approval.docType === 'approval' && approval.type === type) {
          // Chỉ trả về thông tin cơ bản
          results.push({
            approvalId: approval.approvalId,
            type: approval.type,
            targetId: approval.targetId,
            requestedBy: approval.requestedBy,
            state: approval.state,
            priority: approval.priority,
            createdAt: approval.createdAt,
            updatedAt: approval.updatedAt,
            completedAt: approval.completedAt,
            approverCount: approval.approvers.length,
            approvedCount: approval.approvers.filter(a => a.status === 'APPROVED').length
          });
        }
      } catch (err) {
        console.log(err);
      }
    }
    
    return results;
  }

  /**
   * Lấy danh sách quy trình cần phê duyệt của một người phê duyệt
   * @param {Context} ctx - Transaction context
   * @param {String} approverId - ID của người phê duyệt
   */
  async getPendingApprovalsByApprover(ctx, approverId) {
    console.info('============= Lấy danh sách quy trình cần phê duyệt của một người =============');
    
    const startKey = '';
    const endKey = '';
    const iterator = await ctx.stub.getStateByRange(startKey, endKey);
    
    const results = [];
    for await (const { key, value } of iterator) {
      const approvalStr = value.toString();
      try {
        const approval = JSON.parse(approvalStr);
        if (approval.docType === 'approval' && approval.state === ApprovalState.PENDING) {
          // Kiểm tra người phê duyệt có trong danh sách không
          const approver = approval.approvers.find(a => a.approverId === approverId && a.status === 'PENDING');
          if (approver) {
            // Chỉ trả về thông tin cơ bản
            results.push({
              approvalId: approval.approvalId,
              type: approval.type,
              targetId: approval.targetId,
              requestedBy: approval.requestedBy,
              state: approval.state,
              priority: approval.priority,
              deadline: approval.deadline,
              createdAt: approval.createdAt,
              updatedAt: approval.updatedAt
            });
          }
        }
      } catch (err) {
        console.log(err);
      }
    }
    
    return results;
  }

  /**
   * Lấy danh sách quy trình theo đối tượng cần phê duyệt
   * @param {Context} ctx - Transaction context
   * @param {String} targetId - ID của đối tượng cần phê duyệt
   */
  async getApprovalWorkflowsByTarget(ctx, targetId) {
    console.info('============= Lấy danh sách quy trình theo đối tượng =============');
    
    const startKey = '';
    const endKey = '';
    const iterator = await ctx.stub.getStateByRange(startKey, endKey);
    
    const results = [];
    for await (const { key, value } of iterator) {
      const approvalStr = value.toString();
      try {
        const approval = JSON.parse(approvalStr);
        if (approval.docType === 'approval' && approval.targetId === targetId) {
          // Chỉ trả về thông tin cơ bản
          results.push({
            approvalId: approval.approvalId,
            type: approval.type,
            targetId: approval.targetId,
            requestedBy: approval.requestedBy,
            state: approval.state,
            priority: approval.priority,
            createdAt: approval.createdAt,
            updatedAt: approval.updatedAt,
            completedAt: approval.completedAt,
            approverCount: approval.approvers.length,
            approvedCount: approval.approvers.filter(a => a.status === 'APPROVED').length
          });
        }
      } catch (err) {
        console.log(err);
      }
    }
    
    return results;
  }

  /**
   * Lấy thông tin quy trình (internal)
   * @param {Context} ctx - Transaction context
   * @param {String} approvalId - ID của quy trình phê duyệt
   */
  async readApprovalWorkflow(ctx, approvalId) {
    const approvalBytes = await ctx.stub.getState(approvalId);
    if (!approvalBytes || approvalBytes.length === 0) {
      return null;
    }
    return approvalBytes.toString();
  }

  /**
   * Kiểm tra quy trình có tồn tại không
   * @param {Context} ctx - Transaction context
   * @param {String} approvalId - ID của quy trình phê duyệt
   */
  async approvalWorkflowExists(ctx, approvalId) {
    const approvalBytes = await ctx.stub.getState(approvalId);
    return approvalBytes && approvalBytes.length > 0;
  }

  /**
   * Lấy lịch sử của một quy trình
   * @param {Context} ctx - Transaction context
   * @param {String} approvalId - ID của quy trình phê duyệt
   */
  async getApprovalWorkflowHistory(ctx, approvalId) {
    console.info('============= Lấy lịch sử quy trình =============');
    
    // Kiểm tra quy trình có tồn tại không
    const exists = await this.approvalWorkflowExists(ctx, approvalId);
    if (!exists) {
      throw new Error(`Quy trình phê duyệt ${approvalId} không tồn tại`);
    }
    
    const iterator = await ctx.stub.getHistoryForKey(approvalId);
    const results = [];
    
    for await (const { txId, value, timestamp } of iterator) {
      try {
        const approval = JSON.parse(value.toString());
        results.push({
          txId,
          timestamp: timestamp.getSeconds().toString(),
          state: approval.state,
          updatedAt: approval.updatedAt
        });
      } catch (err) {
        console.log(err);
      }
    }
    
    return results;
  }
  
  // Helper methods
  
  /**
   * Lấy ID của client
   * @param {Context} ctx - Transaction context
   */
  getClientId(ctx) {
    return ctx.clientIdentity.getID();
  }
  
  /**
   * Lấy attribute của client
   * @param {Context} ctx - Transaction context
   * @param {String} attrName - Tên attribute
   */
  getClientAttribute(ctx, attrName) {
    return ctx.clientIdentity.getAttributeValue(attrName);
  }
}

module.exports = AdminContract; 