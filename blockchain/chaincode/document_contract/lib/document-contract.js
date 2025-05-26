'use strict';

const { Contract } = require('fabric-contract-api');
const crypto = require('crypto');

// Định nghĩa trạng thái của giấy tờ
const DocumentState = {
  DRAFT: 'DRAFT',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  ACTIVE: 'ACTIVE',
  REVOKED: 'REVOKED',
  EXPIRED: 'EXPIRED'
};

class DocumentContract extends Contract {
  
  /**
   * Initialize ledger with demo data
   * @param {Context} ctx - Transaction context
   */
  async initLedger(ctx) {
    console.info('============= Khởi tạo Document Contract =============');
    
    // Không khởi tạo dữ liệu mẫu trong môi trường production
    return { success: true, message: 'Document Contract đã được khởi tạo' };
  }

  /**
   * Tạo một giấy tờ mới trên blockchain
   * @param {Context} ctx - Transaction context
   * @param {String} documentId - ID của giấy tờ
   * @param {String} documentType - Loại giấy tờ (birth_certificate, id_card, ...)
   * @param {String} citizenId - ID của công dân
   * @param {String} issuedBy - ID của cán bộ cấp giấy tờ
   * @param {String} issueDate - Ngày cấp (định dạng ISO)
   * @param {String} validUntil - Ngày hết hạn (định dạng ISO hoặc "UNLIMITED")
   * @param {String} dataHash - Hash của dữ liệu giấy tờ
   * @param {String} metadata - Metadata dạng JSON string
   */
  async createDocument(ctx, documentId, documentType, citizenId, issuedBy, issueDate, validUntil, dataHash, metadata = '{}') {
    console.info('============= Tạo giấy tờ mới =============');
    
    // Kiểm tra giấy tờ đã tồn tại chưa
    const documentExists = await this.documentExists(ctx, documentId);
    if (documentExists) {
      throw new Error(`Giấy tờ ${documentId} đã tồn tại`);
    }
    
    // Kiểm tra quyền hạn (chỉ cán bộ hoặc chủ tịch mới được tạo)
    const clientId = this.getClientId(ctx);
    const clientRole = this.getClientAttribute(ctx, 'role');
    
    if (clientRole !== 'officer' && clientRole !== 'chairman') {
      throw new Error('Chỉ cán bộ hoặc chủ tịch mới được phép tạo giấy tờ');
    }
    
    // Chuẩn bị đối tượng giấy tờ
    const document = {
      docType: 'document',
      documentId,
      documentType,
      citizenId,
      issuedBy,
      issueDate,
      validUntil,
      dataHash,
      metadata: JSON.parse(metadata),
      state: DocumentState.DRAFT,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [
        {
          action: 'CREATE',
          timestamp: new Date().toISOString(),
          userId: clientId,
          userRole: clientRole,
          txId: ctx.stub.getTxID()
        }
      ]
    };
    
    // Lưu vào blockchain
    await ctx.stub.putState(documentId, Buffer.from(JSON.stringify(document)));
    
    // Emit event
    const eventPayload = {
      documentId,
      documentType,
      citizenId,
      action: 'CREATE',
      txId: ctx.stub.getTxID()
    };
    await ctx.stub.setEvent('DocumentCreated', Buffer.from(JSON.stringify(eventPayload)));
    
    return { success: true, documentId, txId: ctx.stub.getTxID() };
  }

  /**
   * Gửi giấy tờ để phê duyệt
   * @param {Context} ctx - Transaction context
   * @param {String} documentId - ID của giấy tờ
   */
  async submitForApproval(ctx, documentId) {
    console.info('============= Gửi giấy tờ để phê duyệt =============');
    
    // Lấy thông tin giấy tờ
    const documentJson = await this.readDocument(ctx, documentId);
    if (!documentJson) {
      throw new Error(`Giấy tờ ${documentId} không tồn tại`);
    }
    
    const document = JSON.parse(documentJson);
    
    // Kiểm tra trạng thái
    if (document.state !== DocumentState.DRAFT) {
      throw new Error(`Giấy tờ ${documentId} không ở trạng thái DRAFT`);
    }
    
    // Kiểm tra quyền hạn
    const clientId = this.getClientId(ctx);
    const clientRole = this.getClientAttribute(ctx, 'role');
    
    if (clientRole !== 'officer' && clientRole !== 'chairman' && clientId !== document.issuedBy) {
      throw new Error('Không có quyền gửi giấy tờ này để phê duyệt');
    }
    
    // Cập nhật trạng thái
    document.state = DocumentState.PENDING_APPROVAL;
    document.updatedAt = new Date().toISOString();
    document.history.push({
      action: 'SUBMIT_FOR_APPROVAL',
      timestamp: new Date().toISOString(),
      userId: clientId,
      userRole: clientRole,
      txId: ctx.stub.getTxID()
    });
    
    // Lưu vào blockchain
    await ctx.stub.putState(documentId, Buffer.from(JSON.stringify(document)));
    
    // Emit event
    const eventPayload = {
      documentId,
      documentType: document.documentType,
      citizenId: document.citizenId,
      action: 'SUBMIT_FOR_APPROVAL',
      txId: ctx.stub.getTxID()
    };
    await ctx.stub.setEvent('DocumentSubmitted', Buffer.from(JSON.stringify(eventPayload)));
    
    return { success: true, documentId, state: DocumentState.PENDING_APPROVAL, txId: ctx.stub.getTxID() };
  }

  /**
   * Phê duyệt giấy tờ
   * @param {Context} ctx - Transaction context
   * @param {String} documentId - ID của giấy tờ
   * @param {String} approverId - ID của người phê duyệt
   * @param {String} comments - Ghi chú khi phê duyệt (optional)
   */
  async approveDocument(ctx, documentId, approverId, comments = '') {
    console.info('============= Phê duyệt giấy tờ =============');
    
    // Lấy thông tin giấy tờ
    const documentJson = await this.readDocument(ctx, documentId);
    if (!documentJson) {
      throw new Error(`Giấy tờ ${documentId} không tồn tại`);
    }
    
    const document = JSON.parse(documentJson);
    
    // Kiểm tra trạng thái
    if (document.state !== DocumentState.PENDING_APPROVAL) {
      throw new Error(`Giấy tờ ${documentId} không ở trạng thái PENDING_APPROVAL`);
    }
    
    // Kiểm tra quyền hạn
    const clientId = this.getClientId(ctx);
    const clientRole = this.getClientAttribute(ctx, 'role');
    
    // Kiểm tra loại giấy tờ quan trọng cần chủ tịch phê duyệt
    const requiresChairmanApproval = document.metadata.requiresChairmanApproval === true;
    
    if (requiresChairmanApproval && clientRole !== 'chairman') {
      throw new Error('Giấy tờ này yêu cầu chủ tịch phê duyệt');
    }
    
    if (clientRole !== 'officer' && clientRole !== 'chairman') {
      throw new Error('Không có quyền phê duyệt giấy tờ');
    }
    
    // Cập nhật trạng thái
    document.state = DocumentState.ACTIVE;
    document.updatedAt = new Date().toISOString();
    document.approvedAt = new Date().toISOString();
    document.approvedBy = approverId;
    document.approvalComments = comments;
    document.history.push({
      action: 'APPROVE',
      timestamp: new Date().toISOString(),
      userId: clientId,
      userRole: clientRole,
      comments: comments,
      txId: ctx.stub.getTxID()
    });
    
    // Lưu vào blockchain
    await ctx.stub.putState(documentId, Buffer.from(JSON.stringify(document)));
    
    // Emit event
    const eventPayload = {
      documentId,
      documentType: document.documentType,
      citizenId: document.citizenId,
      action: 'APPROVE',
      txId: ctx.stub.getTxID()
    };
    await ctx.stub.setEvent('DocumentApproved', Buffer.from(JSON.stringify(eventPayload)));
    
    return { 
      success: true, 
      documentId, 
      state: DocumentState.ACTIVE,
      approvedBy: approverId,
      approvedAt: document.approvedAt,
      txId: ctx.stub.getTxID() 
    };
  }

  /**
   * Từ chối giấy tờ
   * @param {Context} ctx - Transaction context
   * @param {String} documentId - ID của giấy tờ
   * @param {String} rejectorId - ID của người từ chối
   * @param {String} reason - Lý do từ chối
   */
  async rejectDocument(ctx, documentId, rejectorId, reason) {
    console.info('============= Từ chối giấy tờ =============');
    
    // Lấy thông tin giấy tờ
    const documentJson = await this.readDocument(ctx, documentId);
    if (!documentJson) {
      throw new Error(`Giấy tờ ${documentId} không tồn tại`);
    }
    
    const document = JSON.parse(documentJson);
    
    // Kiểm tra trạng thái
    if (document.state !== DocumentState.PENDING_APPROVAL) {
      throw new Error(`Giấy tờ ${documentId} không ở trạng thái PENDING_APPROVAL`);
    }
    
    // Kiểm tra quyền hạn
    const clientId = this.getClientId(ctx);
    const clientRole = this.getClientAttribute(ctx, 'role');
    
    if (clientRole !== 'officer' && clientRole !== 'chairman') {
      throw new Error('Không có quyền từ chối giấy tờ');
    }
    
    // Cập nhật trạng thái (quay về draft)
    document.state = DocumentState.DRAFT;
    document.updatedAt = new Date().toISOString();
    document.rejectedAt = new Date().toISOString();
    document.rejectedBy = rejectorId;
    document.rejectionReason = reason;
    document.history.push({
      action: 'REJECT',
      timestamp: new Date().toISOString(),
      userId: clientId,
      userRole: clientRole,
      reason: reason,
      txId: ctx.stub.getTxID()
    });
    
    // Lưu vào blockchain
    await ctx.stub.putState(documentId, Buffer.from(JSON.stringify(document)));
    
    // Emit event
    const eventPayload = {
      documentId,
      documentType: document.documentType,
      citizenId: document.citizenId,
      action: 'REJECT',
      txId: ctx.stub.getTxID()
    };
    await ctx.stub.setEvent('DocumentRejected', Buffer.from(JSON.stringify(eventPayload)));
    
    return { 
      success: true, 
      documentId, 
      state: DocumentState.DRAFT,
      rejectedBy: rejectorId,
      rejectedAt: document.rejectedAt,
      reason: reason,
      txId: ctx.stub.getTxID() 
    };
  }

  /**
   * Thu hồi giấy tờ
   * @param {Context} ctx - Transaction context
   * @param {String} documentId - ID của giấy tờ
   * @param {String} revokerId - ID của người thu hồi
   * @param {String} reason - Lý do thu hồi
   */
  async revokeDocument(ctx, documentId, revokerId, reason) {
    console.info('============= Thu hồi giấy tờ =============');
    
    // Lấy thông tin giấy tờ
    const documentJson = await this.readDocument(ctx, documentId);
    if (!documentJson) {
      throw new Error(`Giấy tờ ${documentId} không tồn tại`);
    }
    
    const document = JSON.parse(documentJson);
    
    // Kiểm tra trạng thái
    if (document.state !== DocumentState.ACTIVE) {
      throw new Error(`Giấy tờ ${documentId} không ở trạng thái ACTIVE`);
    }
    
    // Kiểm tra quyền hạn
    const clientId = this.getClientId(ctx);
    const clientRole = this.getClientAttribute(ctx, 'role');
    
    if (clientRole !== 'officer' && clientRole !== 'chairman') {
      throw new Error('Không có quyền thu hồi giấy tờ');
    }
    
    // Cập nhật trạng thái
    document.state = DocumentState.REVOKED;
    document.updatedAt = new Date().toISOString();
    document.revokedAt = new Date().toISOString();
    document.revokedBy = revokerId;
    document.revocationReason = reason;
    document.history.push({
      action: 'REVOKE',
      timestamp: new Date().toISOString(),
      userId: clientId,
      userRole: clientRole,
      reason: reason,
      txId: ctx.stub.getTxID()
    });
    
    // Lưu vào blockchain
    await ctx.stub.putState(documentId, Buffer.from(JSON.stringify(document)));
    
    // Emit event
    const eventPayload = {
      documentId,
      documentType: document.documentType,
      citizenId: document.citizenId,
      action: 'REVOKE',
      txId: ctx.stub.getTxID()
    };
    await ctx.stub.setEvent('DocumentRevoked', Buffer.from(JSON.stringify(eventPayload)));
    
    return { 
      success: true, 
      documentId, 
      state: DocumentState.REVOKED,
      revokedBy: revokerId,
      revokedAt: document.revokedAt,
      reason: reason,
      txId: ctx.stub.getTxID() 
    };
  }

  /**
   * Cập nhật trạng thái giấy tờ
   * @param {Context} ctx - Transaction context
   * @param {String} documentId - ID của giấy tờ
   * @param {String} newState - Trạng thái mới
   * @param {String} reason - Lý do cập nhật (optional)
   */
  async updateDocumentStatus(ctx, documentId, newState, reason = '') {
    console.info('============= Cập nhật trạng thái giấy tờ =============');
    
    // Lấy thông tin giấy tờ
    const documentJson = await this.readDocument(ctx, documentId);
    if (!documentJson) {
      throw new Error(`Giấy tờ ${documentId} không tồn tại`);
    }
    
    const document = JSON.parse(documentJson);
    
    // Kiểm tra quyền hạn
    const clientId = this.getClientId(ctx);
    const clientRole = this.getClientAttribute(ctx, 'role');
    
    if (clientRole !== 'officer' && clientRole !== 'chairman') {
      throw new Error('Không có quyền cập nhật trạng thái giấy tờ');
    }
    
    // Kiểm tra trạng thái hợp lệ
    if (!Object.values(DocumentState).includes(newState)) {
      throw new Error(`Trạng thái ${newState} không hợp lệ`);
    }
    
    // Cập nhật trạng thái
    document.state = newState;
    document.updatedAt = new Date().toISOString();
    document.history.push({
      action: 'UPDATE_STATUS',
      timestamp: new Date().toISOString(),
      userId: clientId,
      userRole: clientRole,
      oldState: document.state,
      newState: newState,
      reason: reason,
      txId: ctx.stub.getTxID()
    });
    
    // Lưu vào blockchain
    await ctx.stub.putState(documentId, Buffer.from(JSON.stringify(document)));
    
    // Emit event
    const eventPayload = {
      documentId,
      documentType: document.documentType,
      citizenId: document.citizenId,
      action: 'UPDATE_STATUS',
      oldState: document.state,
      newState: newState,
      txId: ctx.stub.getTxID()
    };
    await ctx.stub.setEvent('DocumentStatusUpdated', Buffer.from(JSON.stringify(eventPayload)));
    
    return { 
      success: true, 
      documentId, 
      state: newState,
      updatedAt: document.updatedAt,
      txId: ctx.stub.getTxID() 
    };
  }

  /**
   * Xác thực giấy tờ
   * @param {Context} ctx - Transaction context
   * @param {String} documentId - ID của giấy tờ
   * @param {String} dataHash - Hash của dữ liệu giấy tờ để xác thực (optional)
   */
  async verifyDocument(ctx, documentId, dataHash = null) {
    console.info('============= Xác thực giấy tờ =============');
    
    // Lấy thông tin giấy tờ
    const documentJson = await this.readDocument(ctx, documentId);
    if (!documentJson) {
      return { 
        verified: false,
        exists: false,
        message: `Giấy tờ ${documentId} không tồn tại trên blockchain`
      };
    }
    
    const document = JSON.parse(documentJson);
    
    // Kiểm tra trạng thái
    const isActive = document.state === DocumentState.ACTIVE;
    
    // Kiểm tra thời hạn
    let isExpired = false;
    if (document.validUntil && document.validUntil !== 'UNLIMITED') {
      const validUntilDate = new Date(document.validUntil);
      const now = new Date();
      isExpired = validUntilDate < now;
    }
    
    // Kiểm tra hash nếu được cung cấp
    let dataIntegrity = true;
    if (dataHash) {
      dataIntegrity = document.dataHash === dataHash;
    }
    
    // Kết quả xác thực
    const verificationResult = {
      verified: isActive && !isExpired && dataIntegrity,
      exists: true,
      isActive: isActive,
      isExpired: isExpired,
      dataIntegrity: dataIntegrity,
      document: {
        documentId: document.documentId,
        documentType: document.documentType,
        state: document.state,
        issueDate: document.issueDate,
        validUntil: document.validUntil,
        citizenId: document.citizenId,
        verificationTimestamp: new Date().toISOString()
      }
    };
    
    // Lưu lịch sử xác thực
    const clientId = this.getClientId(ctx);
    document.history.push({
      action: 'VERIFY',
      timestamp: new Date().toISOString(),
      userId: clientId || 'anonymous',
      verified: verificationResult.verified,
      txId: ctx.stub.getTxID()
    });
    
    // Lưu vào blockchain
    await ctx.stub.putState(documentId, Buffer.from(JSON.stringify(document)));
    
    return verificationResult;
  }

  /**
   * Lấy thông tin giấy tờ
   * @param {Context} ctx - Transaction context
   * @param {String} documentId - ID của giấy tờ
   */
  async readDocument(ctx, documentId) {
    const documentBytes = await ctx.stub.getState(documentId);
    if (!documentBytes || documentBytes.length === 0) {
      return null;
    }
    return documentBytes.toString();
  }

  /**
   * Kiểm tra giấy tờ có tồn tại không
   * @param {Context} ctx - Transaction context
   * @param {String} documentId - ID của giấy tờ
   */
  async documentExists(ctx, documentId) {
    const documentBytes = await ctx.stub.getState(documentId);
    return documentBytes && documentBytes.length > 0;
  }

  /**
   * Lấy danh sách giấy tờ của một công dân
   * @param {Context} ctx - Transaction context
   * @param {String} citizenId - ID của công dân
   */
  async getDocumentsByCitizen(ctx, citizenId) {
    console.info('============= Lấy danh sách giấy tờ của công dân =============');
    
    const startKey = '';
    const endKey = '';
    const iterator = await ctx.stub.getStateByRange(startKey, endKey);
    
    const results = [];
    for await (const { key, value } of iterator) {
      const documentStr = value.toString();
      try {
        const document = JSON.parse(documentStr);
        if (document.docType === 'document' && document.citizenId === citizenId) {
          // Chỉ trả về thông tin cơ bản, không bao gồm history
          results.push({
            documentId: document.documentId,
            documentType: document.documentType,
            state: document.state,
            issueDate: document.issueDate,
            validUntil: document.validUntil,
            issuedBy: document.issuedBy,
            createdAt: document.createdAt,
            updatedAt: document.updatedAt
          });
        }
      } catch (err) {
        console.log(err);
      }
    }
    
    return results;
  }

  /**
   * Lấy danh sách giấy tờ theo trạng thái
   * @param {Context} ctx - Transaction context
   * @param {String} state - Trạng thái cần lọc
   */
  async getDocumentsByState(ctx, state) {
    console.info('============= Lấy danh sách giấy tờ theo trạng thái =============');
    
    // Kiểm tra trạng thái hợp lệ
    if (!Object.values(DocumentState).includes(state)) {
      throw new Error(`Trạng thái ${state} không hợp lệ`);
    }
    
    const startKey = '';
    const endKey = '';
    const iterator = await ctx.stub.getStateByRange(startKey, endKey);
    
    const results = [];
    for await (const { key, value } of iterator) {
      const documentStr = value.toString();
      try {
        const document = JSON.parse(documentStr);
        if (document.docType === 'document' && document.state === state) {
          // Chỉ trả về thông tin cơ bản, không bao gồm history
          results.push({
            documentId: document.documentId,
            documentType: document.documentType,
            citizenId: document.citizenId,
            state: document.state,
            issueDate: document.issueDate,
            validUntil: document.validUntil,
            issuedBy: document.issuedBy,
            createdAt: document.createdAt,
            updatedAt: document.updatedAt
          });
        }
      } catch (err) {
        console.log(err);
      }
    }
    
    return results;
  }

  /**
   * Lấy lịch sử của một giấy tờ
   * @param {Context} ctx - Transaction context
   * @param {String} documentId - ID của giấy tờ
   */
  async getDocumentHistory(ctx, documentId) {
    console.info('============= Lấy lịch sử giấy tờ =============');
    
    // Kiểm tra giấy tờ có tồn tại không
    const exists = await this.documentExists(ctx, documentId);
    if (!exists) {
      throw new Error(`Giấy tờ ${documentId} không tồn tại`);
    }
    
    const iterator = await ctx.stub.getHistoryForKey(documentId);
    const results = [];
    
    for await (const { txId, value, timestamp } of iterator) {
      try {
        const document = JSON.parse(value.toString());
        results.push({
          txId,
          timestamp: timestamp.getSeconds().toString(),
          state: document.state,
          updatedAt: document.updatedAt
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

module.exports = DocumentContract; 