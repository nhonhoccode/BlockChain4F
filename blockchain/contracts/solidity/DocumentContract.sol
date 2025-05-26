// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title DocumentContract
 * @dev Contract quản lý giấy tờ hành chính
 */
contract DocumentContract is AccessControl, Pausable {
    // Role definitions
    bytes32 public constant CHAIRMAN_ROLE = keccak256("CHAIRMAN_ROLE");
    bytes32 public constant OFFICER_ROLE = keccak256("OFFICER_ROLE");
    
    // Document states
    enum DocumentState { DRAFT, PENDING_APPROVAL, ACTIVE, REVOKED, EXPIRED }
    
    // Document structure
    struct Document {
        string documentId;
        string documentType;
        string citizenId;
        string issuedBy;
        string issueDate;
        string validUntil;
        string dataHash;
        string metadata;
        DocumentState state;
        uint256 createdAt;
        uint256 updatedAt;
        string approvedBy;
        uint256 approvedAt;
        string revokedBy;
        uint256 revokedAt;
        string revocationReason;
    }
    
    // History record structure
    struct HistoryRecord {
        string action;
        uint256 timestamp;
        string userId;
        string userRole;
        string comments;
        string txId;
    }
    
    // Mapping from documentId to Document
    mapping(string => Document) private documents;
    
    // Mapping from documentId to history records
    mapping(string => HistoryRecord[]) private documentHistory;
    
    // Mapping from citizenId to their documents
    mapping(string => string[]) private citizenDocuments;
    
    // Events
    event DocumentCreated(string documentId, string documentType, string citizenId, string issuedBy, string txId);
    event DocumentSubmitted(string documentId, string userId, string txId);
    event DocumentApproved(string documentId, string approvedBy, string txId);
    event DocumentRejected(string documentId, string rejectedBy, string reason, string txId);
    event DocumentRevoked(string documentId, string revokedBy, string reason, string txId);
    event DocumentUpdated(string documentId, DocumentState oldState, DocumentState newState, string txId);
    
    /**
     * @dev Constructor sets up admin role
     */
    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(CHAIRMAN_ROLE, msg.sender);
    }
    
    /**
     * @dev Pause the contract
     * @notice Only admin can pause
     */
    function pause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause the contract
     * @notice Only admin can unpause
     */
    function unpause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
    
    /**
     * @dev Create a new document
     * @param documentId ID của giấy tờ
     * @param documentType Loại giấy tờ
     * @param citizenId ID của công dân
     * @param issuedBy ID của cán bộ cấp giấy tờ
     * @param issueDate Ngày cấp
     * @param validUntil Ngày hết hạn
     * @param dataHash Hash của dữ liệu giấy tờ
     * @param metadata Metadata dạng JSON string
     */
    function createDocument(
        string memory documentId,
        string memory documentType,
        string memory citizenId,
        string memory issuedBy,
        string memory issueDate,
        string memory validUntil,
        string memory dataHash,
        string memory metadata
    ) public whenNotPaused onlyRole(OFFICER_ROLE) {
        // Check if document already exists
        require(bytes(documents[documentId].documentId).length == 0, "Document already exists");
        
        // Create new document
        Document memory newDoc = Document({
            documentId: documentId,
            documentType: documentType,
            citizenId: citizenId,
            issuedBy: issuedBy,
            issueDate: issueDate,
            validUntil: validUntil,
            dataHash: dataHash,
            metadata: metadata,
            state: DocumentState.DRAFT,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            approvedBy: "",
            approvedAt: 0,
            revokedBy: "",
            revokedAt: 0,
            revocationReason: ""
        });
        
        // Store document
        documents[documentId] = newDoc;
        
        // Add to citizen's documents
        citizenDocuments[citizenId].push(documentId);
        
        // Create history record
        HistoryRecord memory historyRecord = HistoryRecord({
            action: "CREATE",
            timestamp: block.timestamp,
            userId: issuedBy,
            userRole: "officer",
            comments: "",
            txId: _generateTxId()
        });
        
        documentHistory[documentId].push(historyRecord);
        
        // Emit event
        emit DocumentCreated(documentId, documentType, citizenId, issuedBy, historyRecord.txId);
    }
    
    /**
     * @dev Submit document for approval
     * @param documentId ID của giấy tờ
     */
    function submitForApproval(string memory documentId) public whenNotPaused onlyRole(OFFICER_ROLE) {
        // Check if document exists
        require(bytes(documents[documentId].documentId).length > 0, "Document does not exist");
        
        // Check if document is in DRAFT state
        require(documents[documentId].state == DocumentState.DRAFT, "Document must be in DRAFT state");
        
        // Update document state
        documents[documentId].state = DocumentState.PENDING_APPROVAL;
        documents[documentId].updatedAt = block.timestamp;
        
        // Create history record
        HistoryRecord memory historyRecord = HistoryRecord({
            action: "SUBMIT_FOR_APPROVAL",
            timestamp: block.timestamp,
            userId: _msgSender() != address(0) ? addressToString(msg.sender) : "system",
            userRole: "officer",
            comments: "",
            txId: _generateTxId()
        });
        
        documentHistory[documentId].push(historyRecord);
        
        // Emit event
        emit DocumentSubmitted(documentId, historyRecord.userId, historyRecord.txId);
    }
    
    /**
     * @dev Approve a document
     * @param documentId ID của giấy tờ
     * @param approverId ID của người phê duyệt
     * @param comments Ghi chú khi phê duyệt
     */
    function approveDocument(
        string memory documentId,
        string memory approverId,
        string memory comments
    ) public whenNotPaused {
        // Check if document exists
        require(bytes(documents[documentId].documentId).length > 0, "Document does not exist");
        
        // Check if document is in PENDING_APPROVAL state
        require(documents[documentId].state == DocumentState.PENDING_APPROVAL, "Document must be in PENDING_APPROVAL state");
        
        // Check approver role
        bool isChairman = hasRole(CHAIRMAN_ROLE, msg.sender);
        bool isOfficer = hasRole(OFFICER_ROLE, msg.sender);
        
        require(isChairman || isOfficer, "Only chairman or officer can approve documents");
        
        // Check if document requires chairman approval
        bool requiresChairmanApproval = _documentRequiresChairmanApproval(documentId);
        
        if (requiresChairmanApproval) {
            require(isChairman, "This document requires chairman approval");
        }
        
        // Update document state
        documents[documentId].state = DocumentState.ACTIVE;
        documents[documentId].updatedAt = block.timestamp;
        documents[documentId].approvedBy = approverId;
        documents[documentId].approvedAt = block.timestamp;
        
        // Create history record
        HistoryRecord memory historyRecord = HistoryRecord({
            action: "APPROVE",
            timestamp: block.timestamp,
            userId: approverId,
            userRole: isChairman ? "chairman" : "officer",
            comments: comments,
            txId: _generateTxId()
        });
        
        documentHistory[documentId].push(historyRecord);
        
        // Emit event
        emit DocumentApproved(documentId, approverId, historyRecord.txId);
    }
    
    /**
     * @dev Reject a document
     * @param documentId ID của giấy tờ
     * @param rejectorId ID của người từ chối
     * @param reason Lý do từ chối
     */
    function rejectDocument(
        string memory documentId,
        string memory rejectorId,
        string memory reason
    ) public whenNotPaused {
        // Check if document exists
        require(bytes(documents[documentId].documentId).length > 0, "Document does not exist");
        
        // Check if document is in PENDING_APPROVAL state
        require(documents[documentId].state == DocumentState.PENDING_APPROVAL, "Document must be in PENDING_APPROVAL state");
        
        // Check rejector role
        bool isChairman = hasRole(CHAIRMAN_ROLE, msg.sender);
        bool isOfficer = hasRole(OFFICER_ROLE, msg.sender);
        
        require(isChairman || isOfficer, "Only chairman or officer can reject documents");
        
        // Update document state
        documents[documentId].state = DocumentState.DRAFT;
        documents[documentId].updatedAt = block.timestamp;
        
        // Create history record
        HistoryRecord memory historyRecord = HistoryRecord({
            action: "REJECT",
            timestamp: block.timestamp,
            userId: rejectorId,
            userRole: isChairman ? "chairman" : "officer",
            comments: reason,
            txId: _generateTxId()
        });
        
        documentHistory[documentId].push(historyRecord);
        
        // Emit event
        emit DocumentRejected(documentId, rejectorId, reason, historyRecord.txId);
    }
    
    /**
     * @dev Revoke a document
     * @param documentId ID của giấy tờ
     * @param revokerId ID của người thu hồi
     * @param reason Lý do thu hồi
     */
    function revokeDocument(
        string memory documentId,
        string memory revokerId,
        string memory reason
    ) public whenNotPaused {
        // Check if document exists
        require(bytes(documents[documentId].documentId).length > 0, "Document does not exist");
        
        // Check if document is in ACTIVE state
        require(documents[documentId].state == DocumentState.ACTIVE, "Document must be in ACTIVE state");
        
        // Check revoker role
        bool isChairman = hasRole(CHAIRMAN_ROLE, msg.sender);
        bool isOfficer = hasRole(OFFICER_ROLE, msg.sender);
        
        require(isChairman || isOfficer, "Only chairman or officer can revoke documents");
        
        // Update document state
        documents[documentId].state = DocumentState.REVOKED;
        documents[documentId].updatedAt = block.timestamp;
        documents[documentId].revokedBy = revokerId;
        documents[documentId].revokedAt = block.timestamp;
        documents[documentId].revocationReason = reason;
        
        // Create history record
        HistoryRecord memory historyRecord = HistoryRecord({
            action: "REVOKE",
            timestamp: block.timestamp,
            userId: revokerId,
            userRole: isChairman ? "chairman" : "officer",
            comments: reason,
            txId: _generateTxId()
        });
        
        documentHistory[documentId].push(historyRecord);
        
        // Emit event
        emit DocumentRevoked(documentId, revokerId, reason, historyRecord.txId);
    }
    
    /**
     * @dev Update document status
     * @param documentId ID của giấy tờ
     * @param newState Trạng thái mới
     * @param reason Lý do cập nhật
     */
    function updateDocumentStatus(
        string memory documentId,
        DocumentState newState,
        string memory reason
    ) public whenNotPaused onlyRole(OFFICER_ROLE) {
        // Check if document exists
        require(bytes(documents[documentId].documentId).length > 0, "Document does not exist");
        
        // Get old state
        DocumentState oldState = documents[documentId].state;
        
        // Update document state
        documents[documentId].state = newState;
        documents[documentId].updatedAt = block.timestamp;
        
        // Create history record
        HistoryRecord memory historyRecord = HistoryRecord({
            action: "UPDATE_STATUS",
            timestamp: block.timestamp,
            userId: _msgSender() != address(0) ? addressToString(msg.sender) : "system",
            userRole: "officer",
            comments: reason,
            txId: _generateTxId()
        });
        
        documentHistory[documentId].push(historyRecord);
        
        // Emit event
        emit DocumentUpdated(documentId, oldState, newState, historyRecord.txId);
    }
    
    /**
     * @dev Verify a document
     * @param documentId ID của giấy tờ
     * @param dataHash Hash của dữ liệu giấy tờ (optional)
     * @return verified Kết quả xác thực
     * @return exists Giấy tờ có tồn tại không
     * @return isActive Giấy tờ có đang active không
     * @return isExpired Giấy tờ có hết hạn không
     * @return dataIntegrity Tính toàn vẹn dữ liệu
     * @return document Thông tin giấy tờ
     */
    function verifyDocument(string memory documentId, string memory dataHash) 
        public 
        view 
        returns (
            bool verified,
            bool exists,
            bool isActive,
            bool isExpired,
            bool dataIntegrity,
            Document memory document
        ) 
    {
        // Check if document exists
        if (bytes(documents[documentId].documentId).length == 0) {
            return (false, false, false, false, false, Document("", "", "", "", "", "", "", "", DocumentState.DRAFT, 0, 0, "", 0, "", 0, ""));
        }
        
        // Get document
        Document memory doc = documents[documentId];
        
        // Check status
        isActive = (doc.state == DocumentState.ACTIVE);
        
        // Check expiry
        // Note: In Solidity we can't parse date strings, so this is simplified.
        // In a real implementation, you would need to convert validUntil to timestamp
        isExpired = false; // Simplified
        
        // Check data integrity if hash is provided
        dataIntegrity = true;
        if (bytes(dataHash).length > 0) {
            dataIntegrity = keccak256(abi.encodePacked(dataHash)) == keccak256(abi.encodePacked(doc.dataHash));
        }
        
        // Overall verification result
        verified = isActive && !isExpired && dataIntegrity;
        
        return (verified, true, isActive, isExpired, dataIntegrity, doc);
    }
    
    /**
     * @dev Get document info
     * @param documentId ID của giấy tờ
     * @return Document Thông tin giấy tờ
     */
    function getDocument(string memory documentId) public view returns (Document memory) {
        require(bytes(documents[documentId].documentId).length > 0, "Document does not exist");
        return documents[documentId];
    }
    
    /**
     * @dev Check if document exists
     * @param documentId ID của giấy tờ
     * @return bool Giấy tờ có tồn tại không
     */
    function documentExists(string memory documentId) public view returns (bool) {
        return bytes(documents[documentId].documentId).length > 0;
    }
    
    /**
     * @dev Get documents by citizen
     * @param citizenId ID của công dân
     * @return Document[] Danh sách giấy tờ
     */
    function getDocumentsByCitizen(string memory citizenId) public view returns (Document[] memory) {
        string[] memory docIds = citizenDocuments[citizenId];
        Document[] memory result = new Document[](docIds.length);
        
        for (uint i = 0; i < docIds.length; i++) {
            result[i] = documents[docIds[i]];
        }
        
        return result;
    }
    
    /**
     * @dev Get documents by state
     * @param state Trạng thái giấy tờ
     * @return Document[] Danh sách giấy tờ
     */
    function getDocumentsByState(DocumentState state) public view returns (Document[] memory) {
        // Count documents with the specified state
        uint count = 0;
        string[] memory allDocIds = new string[](1000); // Assume max 1000 docs for simplicity
        uint docCount = 0;
        
        // This is inefficient in Solidity, but necessary due to lack of iteration over mappings
        // In a production environment, you would use events or a better data structure
        
        // For demo purposes, just return an empty array
        Document[] memory result = new Document[](count);
        return result;
    }
    
    /**
     * @dev Get document history
     * @param documentId ID của giấy tờ
     * @return HistoryRecord[] Lịch sử giấy tờ
     */
    function getDocumentHistory(string memory documentId) public view returns (HistoryRecord[] memory) {
        require(bytes(documents[documentId].documentId).length > 0, "Document does not exist");
        return documentHistory[documentId];
    }
    
    /**
     * @dev Check if document requires chairman approval
     * @param documentId ID của giấy tờ
     * @return bool Kết quả
     */
    function _documentRequiresChairmanApproval(string memory documentId) private view returns (bool) {
        // In a real implementation, this would check the document metadata
        // For now, assume it's stored in the metadata field as JSON
        // This is a simplified implementation
        return keccak256(abi.encodePacked(documents[documentId].metadata)) == 
               keccak256(abi.encodePacked('{"requiresChairmanApproval":true}'));
    }
    
    /**
     * @dev Generate transaction ID
     * @return string Transaction ID
     */
    function _generateTxId() private view returns (string memory) {
        return addressToString(address(this));
    }
    
    /**
     * @dev Convert address to string
     * @param _address Address to convert
     * @return string String representation
     */
    function addressToString(address _address) private pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(_address)));
        bytes memory alphabet = "0123456789abcdef";
        
        bytes memory str = new bytes(42);
        str[0] = "0";
        str[1] = "x";
        
        for (uint256 i = 0; i < 20; i++) {
            str[2 + i * 2] = alphabet[uint8(value[i + 12] >> 4)];
            str[3 + i * 2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }
        
        return string(str);
    }
} 