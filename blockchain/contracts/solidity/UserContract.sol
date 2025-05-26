// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title UserContract
 * @dev Contract quản lý người dùng trong hệ thống
 */
contract UserContract is AccessControl, Pausable {
    // Role definitions
    bytes32 public constant CHAIRMAN_ROLE = keccak256("CHAIRMAN_ROLE");
    bytes32 public constant OFFICER_ROLE = keccak256("OFFICER_ROLE");
    
    // User states
    enum UserState { ACTIVE, INACTIVE, SUSPENDED, DELETED }
    
    // User roles
    enum UserRole { CITIZEN, OFFICER, CHAIRMAN, ADMIN }
    
    // User structure
    struct User {
        string userId;
        string role;
        string name;
        string email;
        string dataHash;
        UserState state;
        string metadata;
        string[] documents;
        string createdBy;
        uint256 createdAt;
        uint256 updatedAt;
        string approvedToChairmanBy;
        uint256 approvedToChairmanAt;
    }
    
    // History record structure
    struct HistoryRecord {
        string action;
        uint256 timestamp;
        string by;
        string oldRole;
        string newRole;
        string txId;
    }
    
    // Mapping from userId to User
    mapping(string => User) private users;
    
    // Mapping from userId to history records
    mapping(string => HistoryRecord[]) private userHistory;
    
    // Events
    event UserRegistered(string userId, string role, string email, string txId);
    event UserRoleUpdated(string userId, string oldRole, string newRole, string txId);
    event UserStatusUpdated(string userId, UserState oldStatus, UserState newStatus, string txId);
    event UserDocumentAdded(string userId, string documentId, string txId);
    
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
     * @dev Register a new user
     * @param userId ID của người dùng
     * @param role Vai trò (citizen, officer, chairman)
     * @param name Tên đầy đủ
     * @param email Email
     * @param createdBy ID của người tạo
     * @param status Trạng thái (ACTIVE, INACTIVE)
     * @param metadata Metadata dạng JSON string
     */
    function registerUser(
        string memory userId,
        string memory role,
        string memory name,
        string memory email,
        string memory createdBy,
        string memory status,
        string memory metadata
    ) public whenNotPaused {
        // Check if user already exists
        require(bytes(users[userId].userId).length == 0, "User already exists");
        
        // Create new user
        User memory newUser = User({
            userId: userId,
            role: role,
            name: name,
            email: email,
            dataHash: _createHash(string(abi.encodePacked(userId, ":", role, ":", name, ":", email))),
            state: _stringToUserState(status),
            metadata: metadata,
            documents: new string[](0),
            createdBy: createdBy,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            approvedToChairmanBy: "",
            approvedToChairmanAt: 0
        });
        
        // Store user
        users[userId] = newUser;
        
        // Create history record
        HistoryRecord memory historyRecord = HistoryRecord({
            action: "REGISTER",
            timestamp: block.timestamp,
            by: createdBy,
            oldRole: "",
            newRole: role,
            txId: _generateTxId()
        });
        
        userHistory[userId].push(historyRecord);
        
        // Emit event
        emit UserRegistered(userId, role, email, historyRecord.txId);
    }
    
    /**
     * @dev Update user role
     * @param userId ID của người dùng
     * @param newRole Vai trò mới
     * @param approverId ID của người phê duyệt (required for chairman role)
     */
    function updateUserRole(
        string memory userId,
        string memory newRole,
        string memory approverId
    ) public whenNotPaused {
        // Check if user exists
        require(bytes(users[userId].userId).length > 0, "User does not exist");
        
        // Check authority
        bool isChairman = hasRole(CHAIRMAN_ROLE, msg.sender);
        bool isAdmin = hasRole(DEFAULT_ADMIN_ROLE, msg.sender);
        
        require(isChairman || isAdmin, "Only chairman or admin can update user roles");
        
        string memory oldRole = users[userId].role;
        
        // Special check for upgrading to chairman
        if (keccak256(abi.encodePacked(newRole)) == keccak256(abi.encodePacked("chairman")) &&
            keccak256(abi.encodePacked(oldRole)) != keccak256(abi.encodePacked("chairman"))) {
            
            require(bytes(approverId).length > 0, "Approver ID required for upgrading to chairman");
            
            users[userId].approvedToChairmanBy = approverId;
            users[userId].approvedToChairmanAt = block.timestamp;
        }
        
        // Update user role
        users[userId].role = newRole;
        users[userId].updatedAt = block.timestamp;
        
        // Create history record
        HistoryRecord memory historyRecord = HistoryRecord({
            action: "UPDATE_ROLE",
            timestamp: block.timestamp,
            by: approverId,
            oldRole: oldRole,
            newRole: newRole,
            txId: _generateTxId()
        });
        
        userHistory[userId].push(historyRecord);
        
        // Emit event
        emit UserRoleUpdated(userId, oldRole, newRole, historyRecord.txId);
    }
    
    /**
     * @dev Update user status
     * @param userId ID của người dùng
     * @param newStatus Trạng thái mới
     */
    function updateUserStatus(
        string memory userId,
        UserState newStatus
    ) public whenNotPaused onlyRole(CHAIRMAN_ROLE) {
        // Check if user exists
        require(bytes(users[userId].userId).length > 0, "User does not exist");
        
        // Get old status
        UserState oldStatus = users[userId].state;
        
        // Update user status
        users[userId].state = newStatus;
        users[userId].updatedAt = block.timestamp;
        
        // Create history record
        HistoryRecord memory historyRecord = HistoryRecord({
            action: "UPDATE_STATUS",
            timestamp: block.timestamp,
            by: _msgSender() != address(0) ? addressToString(msg.sender) : "system",
            oldRole: "",
            newRole: "",
            txId: _generateTxId()
        });
        
        userHistory[userId].push(historyRecord);
        
        // Emit event
        emit UserStatusUpdated(userId, oldStatus, newStatus, historyRecord.txId);
    }
    
    /**
     * @dev Add document to user
     * @param userId ID của người dùng
     * @param documentId ID của giấy tờ
     */
    function addDocumentToUser(
        string memory userId,
        string memory documentId
    ) public whenNotPaused {
        // Check if user exists
        require(bytes(users[userId].userId).length > 0, "User does not exist");
        
        // Check authority
        bool isOfficer = hasRole(OFFICER_ROLE, msg.sender);
        bool isChairman = hasRole(CHAIRMAN_ROLE, msg.sender);
        
        require(isOfficer || isChairman, "Only officer or chairman can add documents to users");
        
        // Check if document already exists in user's documents
        string[] storage docs = users[userId].documents;
        for (uint i = 0; i < docs.length; i++) {
            if (keccak256(abi.encodePacked(docs[i])) == keccak256(abi.encodePacked(documentId))) {
                // Document already exists, return success
                return;
            }
        }
        
        // Add document to user
        users[userId].documents.push(documentId);
        users[userId].updatedAt = block.timestamp;
        
        // Create history record
        HistoryRecord memory historyRecord = HistoryRecord({
            action: "ADD_DOCUMENT",
            timestamp: block.timestamp,
            by: _msgSender() != address(0) ? addressToString(msg.sender) : "system",
            oldRole: "",
            newRole: "",
            txId: _generateTxId()
        });
        
        userHistory[userId].push(historyRecord);
        
        // Emit event
        emit UserDocumentAdded(userId, documentId, historyRecord.txId);
    }
    
    /**
     * @dev Get user documents
     * @param userId ID của người dùng
     * @return string[] Danh sách ID giấy tờ
     */
    function getUserDocuments(string memory userId) public view returns (string[] memory) {
        require(bytes(users[userId].userId).length > 0, "User does not exist");
        return users[userId].documents;
    }
    
    /**
     * @dev Get user info
     * @param userId ID của người dùng
     * @return User Thông tin người dùng
     */
    function getUser(string memory userId) public view returns (User memory) {
        require(bytes(users[userId].userId).length > 0, "User does not exist");
        return users[userId];
    }
    
    /**
     * @dev Verify user
     * @param userId ID của người dùng
     * @param dataHash Hash của dữ liệu người dùng (optional)
     * @return verified Kết quả xác thực
     * @return exists Người dùng có tồn tại không
     * @return isActive Người dùng có đang active không
     * @return dataIntegrity Tính toàn vẹn dữ liệu
     * @return userInfo Thông tin người dùng cơ bản
     */
    function verifyUser(string memory userId, string memory dataHash) 
        public 
        view 
        returns (
            bool verified,
            bool exists,
            bool isActive,
            bool dataIntegrity,
            User memory userInfo
        ) 
    {
        // Check if user exists
        if (bytes(users[userId].userId).length == 0) {
            User memory emptyUser;
            return (false, false, false, false, emptyUser);
        }
        
        // Get user
        User memory user = users[userId];
        
        // Check status
        isActive = (user.state == UserState.ACTIVE);
        
        // Check data integrity if hash is provided
        dataIntegrity = true;
        if (bytes(dataHash).length > 0) {
            dataIntegrity = keccak256(abi.encodePacked(dataHash)) == keccak256(abi.encodePacked(user.dataHash));
        }
        
        // Overall verification result
        verified = isActive && dataIntegrity;
        
        return (verified, true, isActive, dataIntegrity, user);
    }
    
    /**
     * @dev Get user history
     * @param userId ID của người dùng
     * @return HistoryRecord[] Lịch sử người dùng
     */
    function getUserHistory(string memory userId) public view returns (HistoryRecord[] memory) {
        require(bytes(users[userId].userId).length > 0, "User does not exist");
        return userHistory[userId];
    }
    
    /**
     * @dev Check if user exists
     * @param userId ID của người dùng
     * @return bool Người dùng có tồn tại không
     */
    function userExists(string memory userId) public view returns (bool) {
        return bytes(users[userId].userId).length > 0;
    }
    
    /**
     * @dev Convert string to UserState
     * @param state String representation of state
     * @return UserState The corresponding UserState
     */
    function _stringToUserState(string memory state) private pure returns (UserState) {
        if (keccak256(abi.encodePacked(state)) == keccak256(abi.encodePacked("ACTIVE"))) {
            return UserState.ACTIVE;
        } else if (keccak256(abi.encodePacked(state)) == keccak256(abi.encodePacked("INACTIVE"))) {
            return UserState.INACTIVE;
        } else if (keccak256(abi.encodePacked(state)) == keccak256(abi.encodePacked("SUSPENDED"))) {
            return UserState.SUSPENDED;
        } else if (keccak256(abi.encodePacked(state)) == keccak256(abi.encodePacked("DELETED"))) {
            return UserState.DELETED;
        } else {
            // Default to INACTIVE for safety
            return UserState.INACTIVE;
        }
    }
    
    /**
     * @dev Create hash from string
     * @param data Data to hash
     * @return string Hash as string
     */
    function _createHash(string memory data) private pure returns (string memory) {
        bytes32 hash = keccak256(abi.encodePacked(data));
        return bytes32ToString(hash);
    }
    
    /**
     * @dev Convert bytes32 to string
     * @param _bytes32 Bytes to convert
     * @return string String representation
     */
    function bytes32ToString(bytes32 _bytes32) private pure returns (string memory) {
        bytes memory bytesArray = new bytes(64);
        bytes memory HEX = "0123456789abcdef";
        
        for (uint256 i = 0; i < 32; i++) {
            bytesArray[i*2] = HEX[uint8(_bytes32[i] >> 4)];
            bytesArray[i*2+1] = HEX[uint8(_bytes32[i] & 0x0f)];
        }
        
        return string(bytesArray);
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