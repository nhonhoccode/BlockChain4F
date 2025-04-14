// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title AdministrativeRequests
 * @dev Smart contract for managing administrative requests at commune level
 */
contract AdministrativeRequests {
    // Request structure
    struct Request {
        uint id;
        bytes32 userHash;    // Hashed personal info (ID, phone, email)
        string requestType;  // Type of request (birth certificate, residence, etc.)
        string description;  // Request details
        string status;       // Status: Pending, Approved, Rejected, etc.
        uint timestamp;      // Timestamp of creation/update
        address updatedBy;   // Address of the last updater
    }
    
    // Status update structure
    struct StatusUpdate {
        uint requestId;
        string oldStatus;
        string newStatus;
        string comments;
        uint timestamp;
        address updatedBy;
    }
    
    // State variables
    mapping(uint => Request) public requests;
    mapping(uint => StatusUpdate[]) public statusUpdates;
    mapping(bytes32 => uint[]) public userRequests; // Maps user hash to their request IDs
    uint public requestCount;
    
    // Admin addresses that can update request status
    mapping(address => bool) public admins;
    address public owner;
    
    // Events
    event RequestCreated(uint indexed id, bytes32 indexed userHash, string requestType);
    event RequestUpdated(uint indexed id, string oldStatus, string newStatus);
    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyAdmin() {
        require(admins[msg.sender] || msg.sender == owner, "Only admins can call this function");
        _;
    }
    
    // Constructor
    constructor() {
        owner = msg.sender;
        admins[msg.sender] = true;
        requestCount = 0;
    }
    
    /**
     * @dev Add a new admin
     * @param _admin Address of the new admin
     */
    function addAdmin(address _admin) public onlyOwner {
        require(_admin != address(0), "Invalid address");
        admins[_admin] = true;
        emit AdminAdded(_admin);
    }
    
    /**
     * @dev Remove an admin
     * @param _admin Address of the admin to remove
     */
    function removeAdmin(address _admin) public onlyOwner {
        require(_admin != owner, "Cannot remove owner as admin");
        admins[_admin] = false;
        emit AdminRemoved(_admin);
    }
    
    /**
     * @dev Create a new administrative request
     * @param _userHash Hash of user's personal information
     * @param _requestType Type of administrative request
     * @param _description Description of the request
     * @return id of the created request
     */
    function createAdministrativeRequest(
        bytes32 _userHash,
        string memory _requestType,
        string memory _description
    ) public returns (uint) {
        requestCount++;
        
        requests[requestCount] = Request({
            id: requestCount,
            userHash: _userHash,
            requestType: _requestType,
            description: _description,
            status: "PENDING",
            timestamp: block.timestamp,
            updatedBy: msg.sender
        });
        
        // Add to user's requests
        userRequests[_userHash].push(requestCount);
        
        emit RequestCreated(requestCount, _userHash, _requestType);
        return requestCount;
    }
    
    /**
     * @dev Update the status of a request
     * @param _requestId ID of the request to update
     * @param _newStatus New status to set
     * @param _comments Optional comments about the status change
     */
    function updateRequestStatus(
        uint _requestId,
        string memory _newStatus,
        string memory _comments
    ) public onlyAdmin {
        require(_requestId > 0 && _requestId <= requestCount, "Invalid request ID");
        
        Request storage request = requests[_requestId];
        string memory oldStatus = request.status;
        
        // Create status update record
        StatusUpdate memory update = StatusUpdate({
            requestId: _requestId,
            oldStatus: oldStatus,
            newStatus: _newStatus,
            comments: _comments,
            timestamp: block.timestamp,
            updatedBy: msg.sender
        });
        
        // Add to status updates history
        statusUpdates[_requestId].push(update);
        
        // Update request
        request.status = _newStatus;
        request.timestamp = block.timestamp;
        request.updatedBy = msg.sender;
        
        emit RequestUpdated(_requestId, oldStatus, _newStatus);
    }
    
    /**
     * @dev Get request details
     * @param _requestId ID of the request
     * @return Request details
     */
    function getRequest(uint _requestId) public view returns (
        uint id,
        bytes32 userHash,
        string memory requestType,
        string memory description,
        string memory status,
        uint timestamp,
        address updatedBy
    ) {
        require(_requestId > 0 && _requestId <= requestCount, "Invalid request ID");
        Request memory request = requests[_requestId];
        
        return (
            request.id,
            request.userHash,
            request.requestType,
            request.description,
            request.status,
            request.timestamp,
            request.updatedBy
        );
    }
    
    /**
     * @dev Get the number of status updates for a request
     * @param _requestId ID of the request
     * @return Number of status updates
     */
    function getStatusUpdateCount(uint _requestId) public view returns (uint) {
        return statusUpdates[_requestId].length;
    }
    
    /**
     * @dev Get status update details
     * @param _requestId ID of the request
     * @param _updateIndex Index of the status update
     * @return Status update details
     */
    function getStatusUpdate(uint _requestId, uint _updateIndex) public view returns (
        string memory oldStatus,
        string memory newStatus,
        string memory comments,
        uint timestamp,
        address updatedBy
    ) {
        require(_requestId > 0 && _requestId <= requestCount, "Invalid request ID");
        require(_updateIndex < statusUpdates[_requestId].length, "Invalid update index");
        
        StatusUpdate memory update = statusUpdates[_requestId][_updateIndex];
        
        return (
            update.oldStatus,
            update.newStatus,
            update.comments,
            update.timestamp,
            update.updatedBy
        );
    }
    
    /**
     * @dev Get the number of requests for a user
     * @param _userHash Hash of user's personal information
     * @return Number of requests
     */
    function getUserRequestCount(bytes32 _userHash) public view returns (uint) {
        return userRequests[_userHash].length;
    }
    
    /**
     * @dev Get a user's request ID by index
     * @param _userHash Hash of user's personal information
     * @param _index Index of the request
     * @return Request ID
     */
    function getUserRequestId(bytes32 _userHash, uint _index) public view returns (uint) {
        require(_index < userRequests[_userHash].length, "Invalid index");
        return userRequests[_userHash][_index];
    }
} 