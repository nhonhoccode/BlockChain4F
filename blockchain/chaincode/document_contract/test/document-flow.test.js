'use strict';

const sinon = require('sinon');
const chai = require('chai');
const { expect } = chai;
const sinonChai = require('sinon-chai');
chai.use(sinonChai);

const { Context } = require('fabric-contract-api');
const { ChaincodeStub } = require('fabric-shim');

const DocumentRegistry = require('../lib/document-registry');

describe('Document Contract', () => {
  let contract;
  let ctx;
  let mockStub;
  let mockClientIdentity;
  
  beforeEach(() => {
    contract = new DocumentRegistry();
    mockStub = sinon.createStubInstance(ChaincodeStub);
    mockClientIdentity = {
      getAttributeValue: sinon.stub()
    };
    ctx = {
      stub: mockStub,
      clientIdentity: mockClientIdentity
    };
  });
  
  describe('#initLedger', () => {
    it('should initialize ledger successfully', async () => {
      // Execute the function
      const result = await contract.initLedger(ctx);
      expect(result).to.have.property('success').that.equals(true);
      expect(result).to.have.property('message').that.equals('Document Registry initialized');
    });
  });
  
  describe('#createDocument', () => {
    it('should create a document successfully', async () => {
      // Setup
      const documentId = 'DOC001';
      const documentType = 'BIRTH_CERTIFICATE';
      const citizenId = 'CIT001';
      const officerId = 'OFF001';
      const metadata = JSON.stringify({ name: 'Test Document', requiresChairmanApproval: false });
      const contentHash = 'abcdef1234567890';
      
      // Mock
      mockClientIdentity.getAttributeValue.withArgs('role').returns('officer');
      mockStub.getState.withArgs(documentId).resolves(Buffer.from(''));
      mockStub.putState.resolves();
      mockStub.getTxID.returns('tx1');
      mockStub.setEvent.resolves();
      
      // Execute the function
      const result = await contract.createDocument(ctx, documentId, documentType, citizenId, officerId, metadata, contentHash);
      
      // Assertions
      expect(result).to.have.property('success').that.equals(true);
      expect(result).to.have.property('documentId').that.equals(documentId);
      expect(mockStub.putState).to.have.been.calledOnce;
      expect(mockStub.setEvent).to.have.been.calledOnce;
    });
    
    it('should fail if user role is not officer or chairman', async () => {
      // Setup
      const documentId = 'DOC001';
      const documentType = 'BIRTH_CERTIFICATE';
      const citizenId = 'CIT001';
      const officerId = 'OFF001';
      const metadata = JSON.stringify({ name: 'Test Document', requiresChairmanApproval: false });
      const contentHash = 'abcdef1234567890';
      
      // Mock
      mockClientIdentity.getAttributeValue.withArgs('role').returns('citizen');
      mockStub.getState.withArgs(documentId).resolves(Buffer.from(''));
      
      // Execute and assert
      await expect(
        contract.createDocument(ctx, documentId, documentType, citizenId, officerId, metadata, contentHash)
      ).to.be.rejectedWith('Only officers or chairman can create documents');
    });
    
    it('should fail if document already exists', async () => {
      // Setup
      const documentId = 'DOC001';
      const documentType = 'BIRTH_CERTIFICATE';
      const citizenId = 'CIT001';
      const officerId = 'OFF001';
      const metadata = JSON.stringify({ name: 'Test Document', requiresChairmanApproval: false });
      const contentHash = 'abcdef1234567890';
      
      // Mock existing document
      mockClientIdentity.getAttributeValue.withArgs('role').returns('officer');
      mockStub.getState.withArgs(documentId).resolves(Buffer.from(JSON.stringify({ 
        documentId, 
        documentType 
      })));
      
      // Execute and assert
      await expect(
        contract.createDocument(ctx, documentId, documentType, citizenId, officerId, metadata, contentHash)
      ).to.be.rejectedWith(`Document ${documentId} already exists`);
    });
  });
  
  describe('#submitDocument', () => {
    it('should submit a document successfully', async () => {
      // Setup
      const documentId = 'DOC001';
      const document = { 
        documentId, 
        documentType: 'BIRTH_CERTIFICATE',
        citizenId: 'CIT001',
        officerId: 'OFF001',
        state: 'DRAFT',
        transactionHistory: []
      };
      
      // Mock
      mockClientIdentity.getAttributeValue.withArgs('role').returns('officer');
      mockStub.getState.withArgs(documentId).resolves(Buffer.from(JSON.stringify(document)));
      mockStub.putState.resolves();
      mockStub.getTxID.returns('tx2');
      mockStub.setEvent.resolves();
      
      // Execute
      const result = await contract.submitDocument(ctx, documentId);
      
      // Assertions
      expect(result).to.have.property('success').that.equals(true);
      expect(result).to.have.property('documentId').that.equals(documentId);
      expect(result).to.have.property('state').that.equals('PENDING');
      expect(mockStub.putState).to.have.been.calledOnce;
      expect(mockStub.setEvent).to.have.been.calledOnce;
    });
    
    it('should fail if document is not in DRAFT state', async () => {
      // Setup
      const documentId = 'DOC001';
      const document = { 
        documentId, 
        documentType: 'BIRTH_CERTIFICATE',
        state: 'PENDING'
      };
      
      // Mock
      mockClientIdentity.getAttributeValue.withArgs('role').returns('officer');
      mockStub.getState.withArgs(documentId).resolves(Buffer.from(JSON.stringify(document)));
      
      // Execute and assert
      await expect(
        contract.submitDocument(ctx, documentId)
      ).to.be.rejectedWith(`Document ${documentId} is not in DRAFT state`);
    });
  });
  
  describe('#approveDocument', () => {
    it('should approve a regular document as an officer', async () => {
      // Setup
      const documentId = 'DOC001';
      const approverId = 'OFF001';
      const comments = 'Approved';
      const document = { 
        documentId, 
        documentType: 'BIRTH_CERTIFICATE',
        citizenId: 'CIT001',
        officerId: 'OFF001',
        state: 'PENDING',
        metadata: { requiresChairmanApproval: false },
        approvals: [],
        transactionHistory: []
      };
      
      // Mock
      mockClientIdentity.getAttributeValue.withArgs('role').returns('officer');
      mockStub.getState.withArgs(documentId).resolves(Buffer.from(JSON.stringify(document)));
      mockStub.putState.resolves();
      mockStub.getTxID.returns('tx3');
      mockStub.setEvent.resolves();
      
      // Execute
      const result = await contract.approveDocument(ctx, documentId, approverId, comments);
      
      // Assertions
      expect(result).to.have.property('success').that.equals(true);
      expect(result).to.have.property('documentId').that.equals(documentId);
      expect(result).to.have.property('state').that.equals('APPROVED');
      expect(mockStub.putState).to.have.been.calledOnce;
      expect(mockStub.setEvent).to.have.been.calledOnce;
    });
    
    it('should fail when officer tries to approve an important document', async () => {
      // Setup
      const documentId = 'DOC001';
      const approverId = 'OFF001';
      const comments = 'Approved';
      const document = { 
        documentId, 
        documentType: 'BIRTH_CERTIFICATE',
        citizenId: 'CIT001',
        officerId: 'OFF001',
        state: 'PENDING',
        metadata: { requiresChairmanApproval: true },
        approvals: [],
        transactionHistory: []
      };
      
      // Mock
      mockClientIdentity.getAttributeValue.withArgs('role').returns('officer');
      mockStub.getState.withArgs(documentId).resolves(Buffer.from(JSON.stringify(document)));
      
      // Execute and assert
      await expect(
        contract.approveDocument(ctx, documentId, approverId, comments)
      ).to.be.rejectedWith('Only chairman can approve important documents');
    });
    
    it('should allow chairman to approve an important document', async () => {
      // Setup
      const documentId = 'DOC001';
      const approverId = 'CHR001';
      const comments = 'Approved by chairman';
      const document = { 
        documentId, 
        documentType: 'BIRTH_CERTIFICATE',
        citizenId: 'CIT001',
        officerId: 'OFF001',
        state: 'PENDING',
        metadata: { requiresChairmanApproval: true },
        approvals: [],
        transactionHistory: []
      };
      
      // Mock
      mockClientIdentity.getAttributeValue.withArgs('role').returns('chairman');
      mockStub.getState.withArgs(documentId).resolves(Buffer.from(JSON.stringify(document)));
      mockStub.putState.resolves();
      mockStub.getTxID.returns('tx4');
      mockStub.setEvent.resolves();
      
      // Execute
      const result = await contract.approveDocument(ctx, documentId, approverId, comments);
      
      // Assertions
      expect(result).to.have.property('success').that.equals(true);
      expect(result).to.have.property('documentId').that.equals(documentId);
      expect(result).to.have.property('state').that.equals('APPROVED');
      expect(mockStub.putState).to.have.been.calledOnce;
      expect(mockStub.setEvent).to.have.been.calledOnce;
    });
  });
  
  describe('#rejectDocument', () => {
    it('should reject a document successfully', async () => {
      // Setup
      const documentId = 'DOC001';
      const rejectorId = 'OFF001';
      const reason = 'Information is incorrect';
      const document = { 
        documentId, 
        documentType: 'BIRTH_CERTIFICATE',
        citizenId: 'CIT001',
        officerId: 'OFF001',
        state: 'PENDING',
        approvals: [],
        transactionHistory: []
      };
      
      // Mock
      mockClientIdentity.getAttributeValue.withArgs('role').returns('officer');
      mockStub.getState.withArgs(documentId).resolves(Buffer.from(JSON.stringify(document)));
      mockStub.putState.resolves();
      mockStub.getTxID.returns('tx5');
      mockStub.setEvent.resolves();
      
      // Execute
      const result = await contract.rejectDocument(ctx, documentId, rejectorId, reason);
      
      // Assertions
      expect(result).to.have.property('success').that.equals(true);
      expect(result).to.have.property('documentId').that.equals(documentId);
      expect(result).to.have.property('state').that.equals('REJECTED');
      expect(mockStub.putState).to.have.been.calledOnce;
      expect(mockStub.setEvent).to.have.been.calledOnce;
    });
  });
  
  describe('#verifyDocument', () => {
    it('should verify a document with matching hash and approved state', async () => {
      // Setup
      const documentId = 'DOC001';
      const contentHash = 'abcdef1234567890';
      const document = { 
        documentId, 
        documentType: 'BIRTH_CERTIFICATE',
        citizenId: 'CIT001',
        officerId: 'OFF001',
        state: 'APPROVED',
        contentHash: 'abcdef1234567890',
        createdAt: '2023-01-01T00:00:00.000Z'
      };
      
      // Mock
      mockStub.getState.withArgs(documentId).resolves(Buffer.from(JSON.stringify(document)));
      
      // Execute
      const result = await contract.verifyDocument(ctx, documentId, contentHash);
      
      // Assertions
      expect(result).to.have.property('documentId').that.equals(documentId);
      expect(result).to.have.property('isAuthentic').that.equals(true);
      expect(result).to.have.property('isValid').that.equals(true);
      expect(result).to.have.property('documentType').that.equals(document.documentType);
      expect(result).to.have.property('verifiedAt').that.is.a('string');
    });
    
    it('should fail verification with non-matching hash', async () => {
      // Setup
      const documentId = 'DOC001';
      const contentHash = 'wronghash';
      const document = { 
        documentId, 
        documentType: 'BIRTH_CERTIFICATE',
        citizenId: 'CIT001',
        officerId: 'OFF001',
        state: 'APPROVED',
        contentHash: 'abcdef1234567890',
        createdAt: '2023-01-01T00:00:00.000Z'
      };
      
      // Mock
      mockStub.getState.withArgs(documentId).resolves(Buffer.from(JSON.stringify(document)));
      
      // Execute
      const result = await contract.verifyDocument(ctx, documentId, contentHash);
      
      // Assertions
      expect(result).to.have.property('documentId').that.equals(documentId);
      expect(result).to.have.property('isAuthentic').that.equals(false);
      expect(result).to.have.property('isValid').that.equals(true);
    });
  });
});
