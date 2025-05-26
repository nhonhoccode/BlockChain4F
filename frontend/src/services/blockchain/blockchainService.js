import Web3 from 'web3';
import { ethers } from 'ethers';
import DocumentContractABI from '../../contracts/DocumentContract.json';
import UserContractABI from '../../contracts/UserContract.json';
import AdminContractABI from '../../contracts/AdminContract.json';
import axios from 'axios';

/**
 * Service class để tương tác với blockchain từ phía frontend
 */
class BlockchainService {
  constructor() {
    this.initialized = false;
    this.web3 = null;
    this.provider = null;
    this.signer = null;
    this.contracts = {
      document: null,
      user: null,
      admin: null
    };
    this.contractAddresses = {
      document: process.env.REACT_APP_DOCUMENT_CONTRACT_ADDRESS || '0x0',
      user: process.env.REACT_APP_USER_CONTRACT_ADDRESS || '0x0',
      admin: process.env.REACT_APP_ADMIN_CONTRACT_ADDRESS || '0x0',
    };
    this.backendApi = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
  }

  /**
   * Khởi tạo service và kết nối với blockchain
   */
  async initialize() {
    try {
      // Kiểm tra nếu đã khởi tạo rồi
      if (this.initialized) {
        return true;
      }

      // Kiểm tra xem có MetaMask không
      if (window.ethereum) {
        // Sử dụng provider từ trình duyệt (MetaMask)
        this.provider = new ethers.providers.Web3Provider(window.ethereum);
        this.web3 = new Web3(window.ethereum);
        
        // Yêu cầu người dùng kết nối với MetaMask
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Lấy signer để ký giao dịch
        this.signer = this.provider.getSigner();
        
        // Khởi tạo các contract
        if (this.contractAddresses.document !== '0x0') {
          this.contracts.document = new ethers.Contract(
            this.contractAddresses.document,
            DocumentContractABI.abi,
            this.signer
          );
        }
        
        if (this.contractAddresses.user !== '0x0') {
          this.contracts.user = new ethers.Contract(
            this.contractAddresses.user,
            UserContractABI.abi,
            this.signer
          );
        }
        
        if (this.contractAddresses.admin !== '0x0') {
          this.contracts.admin = new ethers.Contract(
            this.contractAddresses.admin,
            AdminContractABI.abi,
            this.signer
          );
        }
        
        this.initialized = true;
        console.log('Blockchain service initialized with browser wallet');
        return true;
      } 
      // Sử dụng fallback là các API từ backend
      else {
        console.log('No ethereum wallet found, using backend API for blockchain operations');
        this.initialized = true;
        return true;
      }
    } catch (error) {
      console.error('Error initializing blockchain service:', error);
      return false;
    }
  }

  /**
   * Tạo hash cho dữ liệu
   * @param {Object|string} data Dữ liệu cần hash
   * @returns {Promise<string>} Hash dạng hex
   */
  async createHash(data) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }
      
      // Chuẩn bị data
      let dataString;
      if (typeof data === 'object') {
        dataString = JSON.stringify(data);
      } else {
        dataString = data.toString();
      }
      
      // Sử dụng web3 để tạo hash
      if (this.web3) {
        const hash = this.web3.utils.sha3(dataString);
        return hash;
      } 
      // Fallback sử dụng API từ backend
      else {
        const response = await axios.post(`${this.backendApi}/v1/blockchain/hash`, { data: dataString });
        return response.data.hash;
      }
    } catch (error) {
      console.error('Error creating hash:', error);
      throw error;
    }
  }

  /**
   * Xác thực giấy tờ trên blockchain
   * @param {string} documentId ID của giấy tờ
   * @param {Object} documentData Dữ liệu giấy tờ để xác thực (optional)
   * @returns {Promise<Object>} Kết quả xác thực
   */
  async verifyDocument(documentId, documentData = null) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }
      
      // Nếu có data, tạo hash
      let dataHash = null;
      if (documentData) {
        dataHash = await this.createHash(documentData);
      }
      
      // Thực hiện xác thực sử dụng smart contract
      if (this.contracts.document) {
        const result = await this.contracts.document.verifyDocument(
          documentId,
          dataHash || ''
        );
        
        return {
          verified: result[0],
          exists: result[1],
          isActive: result[2],
          isExpired: result[3],
          dataIntegrity: result[4],
          document: {
            documentId: result[5].documentId,
            documentType: result[5].documentType,
            citizenId: result[5].citizenId,
            issuedBy: result[5].issuedBy,
            issueDate: result[5].issueDate,
            validUntil: result[5].validUntil,
            status: parseInt(result[5].state),
            createdAt: parseInt(result[5].createdAt) * 1000 // Convert to milliseconds
          }
        };
      } 
      // Fallback sử dụng API từ backend
      else {
        const response = await axios.post(`${this.backendApi}/v1/blockchain/verify-document`, {
          documentId,
          documentData: documentData ? JSON.stringify(documentData) : null
        });
        
        return response.data;
      }
    } catch (error) {
      console.error('Error verifying document:', error);
      throw error;
    }
  }

  /**
   * Lấy lịch sử của giấy tờ từ blockchain
   * @param {string} documentId ID của giấy tờ
   * @returns {Promise<Array>} Lịch sử giấy tờ
   */
  async getDocumentHistory(documentId) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }
      
      // Thực hiện lấy lịch sử sử dụng smart contract
      if (this.contracts.document) {
        const history = await this.contracts.document.getDocumentHistory(documentId);
        
        // Format lại kết quả
        return history.map(record => ({
          action: record.action,
          timestamp: parseInt(record.timestamp) * 1000, // Convert to milliseconds
          userId: record.userId,
          userRole: record.userRole,
          comments: record.comments,
          txId: record.txId
        }));
      } 
      // Fallback sử dụng API từ backend
      else {
        const response = await axios.get(`${this.backendApi}/v1/blockchain/document-history/${documentId}`);
        return response.data.history;
      }
    } catch (error) {
      console.error('Error getting document history:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách giấy tờ của công dân từ blockchain
   * @param {string} citizenId ID của công dân
   * @returns {Promise<Array>} Danh sách giấy tờ
   */
  async getCitizenDocuments(citizenId) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }
      
      // Thực hiện lấy danh sách giấy tờ sử dụng smart contract
      if (this.contracts.document) {
        const documents = await this.contracts.document.getDocumentsByCitizen(citizenId);
        
        // Format lại kết quả
        return documents.map(doc => ({
          documentId: doc.documentId,
          documentType: doc.documentType,
          citizenId: doc.citizenId,
          issuedBy: doc.issuedBy,
          issueDate: doc.issueDate,
          validUntil: doc.validUntil,
          status: parseInt(doc.state),
          createdAt: parseInt(doc.createdAt) * 1000 // Convert to milliseconds
        }));
      } 
      // Fallback sử dụng API từ backend
      else {
        const response = await axios.get(`${this.backendApi}/v1/blockchain/citizen-documents/${citizenId}`);
        return response.data.documents;
      }
    } catch (error) {
      console.error('Error getting citizen documents:', error);
      throw error;
    }
  }

  /**
   * Tạo URL để xác thực giấy tờ
   * @param {string} documentId ID của giấy tờ
   * @returns {string} URL xác thực
   */
  createVerificationUrl(documentId) {
    const baseUrl = window.location.origin;
    return `${baseUrl}/verify-document/${documentId}`;
  }

  /**
   * Tạo QR code chứa URL xác thực
   * @param {string} documentId ID của giấy tờ
   * @returns {Promise<string>} URL của QR code image
   */
  async generateQRCode(documentId) {
    try {
      const verificationUrl = this.createVerificationUrl(documentId);
      const response = await axios.post(`${this.backendApi}/v1/utils/generate-qr`, {
        data: verificationUrl
      });
      
      return response.data.qrCode;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  }

  /**
   * Kiểm tra xem một giấy tờ có tồn tại trên blockchain không
   * @param {string} documentId ID của giấy tờ
   * @returns {Promise<boolean>} Kết quả
   */
  async documentExists(documentId) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }
      
      // Thực hiện kiểm tra sử dụng smart contract
      if (this.contracts.document) {
        return await this.contracts.document.documentExists(documentId);
      } 
      // Fallback sử dụng API từ backend
      else {
        const response = await axios.get(`${this.backendApi}/v1/blockchain/document-exists/${documentId}`);
        return response.data.exists;
      }
    } catch (error) {
      console.error('Error checking if document exists:', error);
      throw error;
    }
  }

  /**
   * Xác thực người dùng trên blockchain
   * @param {string} userId ID của người dùng
   * @param {Object} userData Dữ liệu người dùng để xác thực (optional)
   * @returns {Promise<Object>} Kết quả xác thực
   */
  async verifyUser(userId, userData = null) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }
      
      // Nếu có data, tạo hash
      let dataHash = null;
      if (userData) {
        dataHash = await this.createHash(userData);
      }
      
      // Thực hiện xác thực sử dụng smart contract
      if (this.contracts.user) {
        const result = await this.contracts.user.verifyUser(
          userId,
          dataHash || ''
        );
        
        return {
          verified: result[0],
          exists: result[1],
          isActive: result[2],
          dataIntegrity: result[3],
          user: {
            userId: result[4].userId,
            role: result[4].role,
            name: result[4].name,
            email: result[4].email,
            state: parseInt(result[4].state),
            createdAt: parseInt(result[4].createdAt) * 1000 // Convert to milliseconds
          }
        };
      } 
      // Fallback sử dụng API từ backend
      else {
        const response = await axios.post(`${this.backendApi}/v1/blockchain/verify-user`, {
          userId,
          userData: userData ? JSON.stringify(userData) : null
        });
        
        return response.data;
      }
    } catch (error) {
      console.error('Error verifying user:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách quy trình cần phê duyệt của một người phê duyệt
   * @param {string} approverId ID của người phê duyệt
   * @returns {Promise<Array>} Danh sách quy trình cần phê duyệt
   */
  async getPendingApprovals(approverId) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }
      
      // Thực hiện lấy danh sách sử dụng smart contract
      if (this.contracts.admin) {
        // Lấy danh sách các ID cần phê duyệt
        const pendingApprovalIds = await this.contracts.admin.getPendingApprovalsByApprover(approverId);
        
        // Lấy chi tiết từng quy trình
        const pendingApprovals = [];
        for (const approvalId of pendingApprovalIds) {
          const approval = await this.contracts.admin.getApprovalWorkflow(approvalId);
          
          pendingApprovals.push({
            approvalId: approval.approvalId,
            approvalType: approval.approvalType,
            targetId: approval.targetId,
            requestedBy: approval.requestedBy,
            priority: parseInt(approval.priority),
            deadline: parseInt(approval.deadline) * 1000, // Convert to milliseconds
            createdAt: parseInt(approval.createdAt) * 1000 // Convert to milliseconds
          });
        }
        
        return pendingApprovals;
      } 
      // Fallback sử dụng API từ backend
      else {
        const response = await axios.get(`${this.backendApi}/v1/blockchain/pending-approvals/${approverId}`);
        return response.data.pendingApprovals;
      }
    } catch (error) {
      console.error('Error getting pending approvals:', error);
      throw error;
    }
  }
}

// Xuất ra instance singleton
const blockchainService = new BlockchainService();
export default blockchainService;
