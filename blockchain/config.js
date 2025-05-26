/**
 * Cấu hình blockchain cho hệ thống quản lý hành chính
 */

const BLOCKCHAIN_CONFIG = {
  // Cấu hình chung
  networks: {
    hyperledger: {
      enabled: true,
      channelName: 'adminchannel',
      orgName: 'Org1',
      peerName: 'peer0.org1.example.com',
      userName: 'Admin',
      connectionProfilePath: './blockchain/networks/hyperledger/connection-profile.json'
    },
    quorum: {
      enabled: false,
      rpcUrl: 'http://localhost:22000',
      wsUrl: 'ws://localhost:23000',
      privateKey: '0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63'
    }
  },
  
  // Cấu hình smart contracts
  contracts: {
    document: {
      name: 'document_contract',
      version: '1.0',
      description: 'Quản lý và xác thực giấy tờ hành chính'
    },
    user: {
      name: 'user_contract',
      version: '1.0',
      description: 'Quản lý người dùng và phân quyền'
    },
    admin: {
      name: 'admin_contract',
      version: '1.0',
      description: 'Quản lý quy trình phê duyệt hành chính'
    }
  },
  
  // Cấu hình xác thực
  verification: {
    requiredConfirmations: 1,
    timeoutSeconds: 30,
    retryAttempts: 3
  },
  
  // Cấu hình lưu trữ
  storage: {
    useIpfs: false,
    ipfsGateway: 'https://ipfs.io/ipfs/',
    includeContent: false, // Chỉ lưu hash, không lưu nội dung đầy đủ
    encryptContent: true
  }
};

module.exports = BLOCKCHAIN_CONFIG; 