'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { Gateway, Wallets } = require('fabric-network');
const config = require('../config');

/**
 * Tạo hash cho dữ liệu
 * @param {Object|String} data - Dữ liệu cần hash
 * @returns {String} - Chuỗi hash sha256
 */
function createDataHash(data) {
  const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto.createHash('sha256').update(dataStr).digest('hex');
}

/**
 * Kết nối đến blockchain network
 * @param {String} userId - ID của người dùng 
 * @returns {Object} - Contract instance và gateway
 */
async function connectToNetwork(userId) {
  try {
    // Đường dẫn đến connection profile
    const ccpPath = path.resolve(__dirname, config.networks.hyperledger.connectionProfilePath);
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

    // Tạo filesystem wallet để lưu trữ identity
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    // Kiểm tra người dùng đã có trong wallet chưa
    const identity = await wallet.get(userId);
    if (!identity) {
      throw new Error(`Không tìm thấy identity cho user ${userId} trong wallet`);
    }

    // Tạo gateway và kết nối đến peer node
    const gateway = new Gateway();
    await gateway.connect(ccp, { 
      wallet, 
      identity: userId, 
      discovery: { enabled: true, asLocalhost: true } 
    });

    // Lấy network channel
    const network = await gateway.getNetwork(config.networks.hyperledger.channelName);

    // Lấy contract instances
    const documentContract = network.getContract(config.contracts.document.name);
    const userContract = network.getContract(config.contracts.user.name);
    const adminContract = network.getContract(config.contracts.admin.name);

    return {
      gateway,
      documentContract,
      userContract,
      adminContract
    };
  } catch (error) {
    console.error(`Error connecting to network: ${error}`);
    throw error;
  }
}

/**
 * Đóng kết nối gateway
 * @param {Object} gateway - Gateway instance
 */
async function disconnectFromNetwork(gateway) {
  if (gateway) {
    gateway.disconnect();
  }
}

/**
 * Gọi chaincode function và xử lý kết quả
 * @param {Object} contract - Contract instance
 * @param {String} functionName - Tên function trên chaincode
 * @param {Array} args - Các tham số
 * @returns {Object} - Kết quả xử lý
 */
async function invokeChaincode(contract, functionName, args) {
  try {
    console.log(`Invoking chaincode: ${functionName} with args: ${JSON.stringify(args)}`);
    
    // Submit transaction hoặc evaluate transaction tùy theo loại
    const isQuery = functionName.startsWith('get') || 
                    functionName === 'readDocument' || 
                    functionName === 'documentExists' || 
                    functionName === 'readUser' || 
                    functionName === 'userExists' || 
                    functionName === 'verifyDocument' || 
                    functionName === 'verifyUser';
    
    let result;
    if (isQuery) {
      result = await contract.evaluateTransaction(functionName, ...args);
    } else {
      result = await contract.submitTransaction(functionName, ...args);
    }
    
    // Parse result
    const resultStr = result.toString();
    return resultStr ? JSON.parse(resultStr) : resultStr;
  } catch (error) {
    console.error(`Error invoking chaincode: ${error}`);
    throw error;
  }
}

/**
 * Xác thực dữ liệu với giá trị hash trên blockchain
 * @param {Object} data - Dữ liệu cần xác thực
 * @param {String} blockchainHash - Hash lưu trên blockchain
 * @returns {Boolean} - Kết quả xác thực
 */
function verifyDataIntegrity(data, blockchainHash) {
  const computedHash = createDataHash(data);
  return computedHash === blockchainHash;
}

/**
 * Tạo ID cho đối tượng trên blockchain
 * @param {String} prefix - Tiền tố cho ID
 * @param {String} uniqueId - ID duy nhất (optional)
 * @returns {String} - ID được tạo
 */
function generateBlockchainId(prefix, uniqueId = null) {
  const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
  const random = Math.random().toString(36).substring(2, 8);
  const id = uniqueId || `${timestamp}-${random}`;
  return `${prefix}-${id}`;
}

/**
 * Chuyển đổi file thành base64
 * @param {String} filePath - Đường dẫn đến file
 * @returns {String} - Chuỗi base64
 */
function fileToBase64(filePath) {
  try {
    const fileData = fs.readFileSync(filePath);
    return fileData.toString('base64');
  } catch (error) {
    console.error(`Error converting file to base64: ${error}`);
    throw error;
  }
}

/**
 * Lưu base64 thành file
 * @param {String} base64String - Chuỗi base64
 * @param {String} outputPath - Đường dẫn lưu file
 */
function base64ToFile(base64String, outputPath) {
  try {
    const fileData = Buffer.from(base64String, 'base64');
    fs.writeFileSync(outputPath, fileData);
    return outputPath;
  } catch (error) {
    console.error(`Error converting base64 to file: ${error}`);
    throw error;
  }
}

/**
 * Kiểm tra giấy tờ có hợp lệ không
 * @param {String} documentId - ID của giấy tờ
 * @param {Object} documentData - Dữ liệu giấy tờ
 * @returns {Promise<Object>} - Kết quả xác thực
 */
async function verifyDocumentOnBlockchain(documentId, documentData = null) {
  try {
    // Kết nối với blockchain
    const { gateway, documentContract } = await connectToNetwork('admin');
    
    try {
      // Tạo hash từ dữ liệu nếu có
      let dataHash = null;
      if (documentData) {
        dataHash = createDataHash(documentData);
      }
      
      // Gọi chaincode để xác thực
      const args = dataHash ? [documentId, dataHash] : [documentId];
      const result = await invokeChaincode(documentContract, 'verifyDocument', args);
      
      return result;
    } finally {
      // Đóng kết nối
      await disconnectFromNetwork(gateway);
    }
  } catch (error) {
    console.error(`Error verifying document: ${error}`);
    throw error;
  }
}

module.exports = {
  createDataHash,
  connectToNetwork,
  disconnectFromNetwork,
  invokeChaincode,
  verifyDataIntegrity,
  generateBlockchainId,
  fileToBase64,
  base64ToFile,
  verifyDocumentOnBlockchain
}; 