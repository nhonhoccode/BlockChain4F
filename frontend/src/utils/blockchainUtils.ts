/**
 * Các tiện ích liên quan đến blockchain
 */

/**
 * Kiểm tra hash blockchain có hợp lệ không
 * @param hash Hash cần kiểm tra
 * @returns true nếu hash hợp lệ, false nếu không
 */
export const isValidBlockchainHash = (hash: string): boolean => {
  if (!hash) return false;
  
  // Hash thường bắt đầu bằng 0x và có 64 ký tự hexa
  const hashRegex = /^0x[0-9a-f]{64}$/i;
  return hashRegex.test(hash);
};

/**
 * Định dạng hash blockchain để hiển thị
 * @param hash Hash cần định dạng
 * @param truncate Có rút gọn hash không
 * @returns Hash đã định dạng
 */
export const formatBlockchainHash = (hash: string, truncate = true): string => {
  if (!hash) return '';
  
  if (truncate) {
    // Hiển thị 6 ký tự đầu và 4 ký tự cuối
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
  }
  
  return hash;
};

/**
 * Tạo URL xem giao dịch trên blockchain explorer
 * @param hash Hash của giao dịch
 * @param networkType Loại mạng (ethereum, hyperledger)
 * @returns URL để xem trên explorer
 */
export const getBlockchainExplorerUrl = (hash: string, networkType = 'ethereum'): string => {
  if (!hash) return '';
  
  if (networkType === 'ethereum') {
    // Sử dụng Etherscan cho mạng Ethereum/Quorum
    return `https://etherscan.io/tx/${hash}`;
  } else if (networkType === 'hyperledger') {
    // URL Explorer giả định cho Hyperledger Fabric
    return `/blockchain-explorer/transaction/${hash}`;
  }
  
  return '';
};

/**
 * Xác thực tính toàn vẹn của tài liệu bằng cách tính hash và so sánh với blockchain
 * @param fileContent Nội dung file dưới dạng ArrayBuffer
 * @param storedHash Hash đã lưu trên blockchain
 * @returns Promise<boolean> true nếu khớp, false nếu không
 */
export const verifyDocumentIntegrity = async (
  fileContent: ArrayBuffer,
  storedHash: string
): Promise<boolean> => {
  try {
    // Tính hash của file
    const hashBuffer = await crypto.subtle.digest('SHA-256', fileContent);
    
    // Chuyển đổi hashBuffer thành chuỗi hex
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const calculatedHash = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // So sánh với hash đã lưu
    return calculatedHash.toLowerCase() === storedHash.toLowerCase();
  } catch (error) {
    console.error('Lỗi khi xác thực tài liệu:', error);
    return false;
  }
};

/**
 * Tạo chữ ký số đơn giản cho tài liệu
 * @param document Dữ liệu tài liệu
 * @param privateKey Khóa bí mật (giả định)
 * @returns Promise<string> Chữ ký đã tạo
 */
export const signDocument = async (
  document: Record<string, any>,
  privateKey: string
): Promise<string> => {
  try {
    // Trong môi trường thực tế, đây sẽ là một quá trình ký thực sự
    // Ở đây chỉ là mô phỏng đơn giản
    
    // Chuyển đổi tài liệu thành chuỗi JSON
    const documentString = JSON.stringify(document);
    
    // Tạo ArrayBuffer từ chuỗi
    const encoder = new TextEncoder();
    const data = encoder.encode(documentString);
    
    // Tính hash
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    
    // Giả lập chữ ký (thay thế bằng thuật toán ký thực tế)
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const documentHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Trả về "chữ ký" (giả định)
    return `0x${documentHash}${privateKey.substring(2, 10)}`;
  } catch (error) {
    console.error('Lỗi khi ký tài liệu:', error);
    throw new Error('Không thể tạo chữ ký số');
  }
};

/**
 * Cấu trúc dữ liệu để lưu trữ trên blockchain
 */
export interface BlockchainRecord {
  hash: string;
  timestamp: number;
  documentType: string;
  documentId: string;
  issuer: string;
  recipient: string;
  signature: string;
  metadata?: Record<string, any>;
}

/**
 * Tạo dữ liệu mẫu để hiển thị thông tin blockchain
 * @param documentId ID của tài liệu
 * @returns BlockchainRecord Dữ liệu mẫu
 */
export const createSampleBlockchainRecord = (documentId: string): BlockchainRecord => {
  return {
    hash: `0x${Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
    timestamp: Date.now(),
    documentType: 'residence_cert',
    documentId,
    issuer: 'OFF1001',
    recipient: 'CTZ1001',
    signature: `0x${Array(128).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`
  };
};

export default {
  isValidBlockchainHash,
  formatBlockchainHash,
  getBlockchainExplorerUrl,
  verifyDocumentIntegrity,
  signDocument,
  createSampleBlockchainRecord
}; 