// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title AdminContract
 * @dev Contract quản lý quy trình phê duyệt và quản trị
 */
contract AdminContract is AccessControl, Pausable {
    // Role definitions
    bytes32 public constant CHAIRMAN_ROLE = keccak256("CHAIRMAN_ROLE");
    bytes32 public constant OFFICER_ROLE = keccak256("OFFICER_ROLE");
    
    // Approval workflow states
    enum ApprovalState { PENDING, APPROVED, REJECTED, EXPIRED }
    
    // Approval workflow priorities
    enum ApprovalPriority { LOW, MEDIUM, HIGH, CRITICAL }
    
    // Approval workflow types
    enum ApprovalType { DOCUMENT, USER_ROLE, SYSTEM_CONFIG }
    
    // Approval workflow structure
    struct ApprovalWorkflow {
        string approvalId;
        string approvalType;
        string targetId;
        string requestedBy;
        string[] approvers;
        string[] approvedBy;
        string[] rejectedBy;
        string metadata;
        ApprovalState state;
        ApprovalPriority priority;
        uint256 deadline;
        uint256 createdAt;
        uint256 updatedAt;
        uint256 completedAt;
    }
    
    // Approval history record structure
    struct ApprovalHistory {
        string action;
        uint256 timestamp;
        string userId;
        string userRole;
        string comments;
        string txId;
    }
    
    // Mapping from approvalId to ApprovalWorkflow
    mapping(string => ApprovalWorkflow) private approvalWorkflows;
    
    // Mapping from approvalId to history records
    mapping(string => ApprovalHistory[]) private approvalHistory;
    
    // Mapping from targetId to approvalIds (to find approvals by target)
    mapping(string => string[]) private targetApprovals;
    
    // Mapping from approverId to pending approvalIds (to find pending approvals by approver)
    mapping(string => string[]) private approverPendingApprovals;
    
    // Events
    event ApprovalWorkflowCreated(string approvalId, string approvalType, string targetId, string requestedBy, string txId);
    event ApprovalWorkflowApproved(string approvalId, string approverId, string txId);
    event ApprovalWorkflowRejected(string approvalId, string rejectorId, string reason, string txId);
    event ApprovalWorkflowExpired(string approvalId, string txId);
    event ApprovalWorkflowCompleted(string approvalId, ApprovalState finalState, string txId);
    
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
     * @dev Create a new approval workflow
     * @param approvalId ID của quy trình phê duyệt
     * @param approvalType Loại phê duyệt (DOCUMENT, USER_ROLE, SYSTEM_CONFIG)
     * @param targetId ID của đối tượng cần phê duyệt
     * @param requestedBy ID của người yêu cầu
     * @param approvers Danh sách ID người phê duyệt, phân cách bằng dấu phẩy
     * @param metadata Metadata dạng JSON string
     * @param priority Độ ưu tiên (LOW, MEDIUM, HIGH, CRITICAL)
     * @param deadlineTime Deadline dạng ISO string
     */
    function createApprovalWorkflow(
        string memory approvalId,
        string memory approvalType,
        string memory targetId,
        string memory requestedBy,
        string memory approvers,
        string memory metadata,
        string memory priority,
        string memory deadlineTime
    ) public whenNotPaused {
        // Check if approval workflow already exists
        require(bytes(approvalWorkflows[approvalId].approvalId).length == 0, "Approval workflow already exists");
        
        // Parse approvers (in a real implementation, would use a library for string splitting)
        string[] memory approverArray = new string[](1);
        approverArray[0] = approvers; // Simplified for demonstration
        
        // Parse priority
        ApprovalPriority priorityEnum = _stringToApprovalPriority(priority);
        
        // Calculate deadline (simplified - in reality we would parse the ISO string)
        uint256 deadline = block.timestamp + 7 days; // Default 7 days
        
        // Create new approval workflow
        ApprovalWorkflow memory newApproval = ApprovalWorkflow({
            approvalId: approvalId,
            approvalType: approvalType,
            targetId: targetId,
            requestedBy: requestedBy,
            approvers: approverArray,
            approvedBy: new string[](0),
            rejectedBy: new string[](0),
            metadata: metadata,
            state: ApprovalState.PENDING,
            priority: priorityEnum,
            deadline: deadline,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            completedAt: 0
        });
        
        // Store approval workflow
        approvalWorkflows[approvalId] = newApproval;
        
        // Add to target's approvals
        targetApprovals[targetId].push(approvalId);
        
        // Add to approvers' pending approvals
        for (uint i = 0; i < approverArray.length; i++) {
            approverPendingApprovals[approverArray[i]].push(approvalId);
        }
        
        // Create history record
        ApprovalHistory memory historyRecord = ApprovalHistory({
            action: "CREATE",
            timestamp: block.timestamp,
            userId: requestedBy,
            userRole: "officer",
            comments: "",
            txId: _generateTxId()
        });
        
        approvalHistory[approvalId].push(historyRecord);
        
        // Emit event
        emit ApprovalWorkflowCreated(approvalId, approvalType, targetId, requestedBy, historyRecord.txId);
    }
    
    /**
     * @dev Approve a workflow
     * @param approvalId ID của quy trình phê duyệt
     * @param approverId ID của người phê duyệt
     * @param comments Ghi chú khi phê duyệt
     */
    function approveWorkflow(
        string memory approvalId,
        string memory approverId,
        string memory comments
    ) public whenNotPaused {
        // Check if approval workflow exists
        require(bytes(approvalWorkflows[approvalId].approvalId).length > 0, "Approval workflow does not exist");
        
        // Check if workflow is in PENDING state
        require(approvalWorkflows[approvalId].state == ApprovalState.PENDING, "Workflow is not in PENDING state");
        
        // Check if deadline has passed
        require(block.timestamp <= approvalWorkflows[approvalId].deadline, "Approval deadline has passed");
        
        // Check authority
        bool isChairman = hasRole(CHAIRMAN_ROLE, msg.sender);
        
        // Get the approval type
        string memory approvalType = approvalWorkflows[approvalId].approvalType;
        
        // If it's a DOCUMENT approval or USER_ROLE upgrade to chairman, only chairman can approve
        if (keccak256(abi.encodePacked(approvalType)) == keccak256(abi.encodePacked("DOCUMENT")) ||
            (keccak256(abi.encodePacked(approvalType)) == keccak256(abi.encodePacked("USER_ROLE")) && 
             _isChairmanRoleApproval(approvalId))) {
            require(isChairman, "Only chairman can approve this workflow");
        }
        
        // Check if the approver is in the approvers list
        bool isApprover = false;
        for (uint i = 0; i < approvalWorkflows[approvalId].approvers.length; i++) {
            if (keccak256(abi.encodePacked(approvalWorkflows[approvalId].approvers[i])) == 
                keccak256(abi.encodePacked(approverId))) {
                isApprover = true;
                break;
            }
        }
        
        require(isApprover, "Not authorized to approve this workflow");
        
        // Check if already approved by this approver
        for (uint i = 0; i < approvalWorkflows[approvalId].approvedBy.length; i++) {
            if (keccak256(abi.encodePacked(approvalWorkflows[approvalId].approvedBy[i])) == 
                keccak256(abi.encodePacked(approverId))) {
                // Already approved, return success
                return;
            }
        }
        
        // Add to approved list
        approvalWorkflows[approvalId].approvedBy.push(approverId);
        approvalWorkflows[approvalId].updatedAt = block.timestamp;
        
        // Create history record
        ApprovalHistory memory historyRecord = ApprovalHistory({
            action: "APPROVE",
            timestamp: block.timestamp,
            userId: approverId,
            userRole: isChairman ? "chairman" : "officer",
            comments: comments,
            txId: _generateTxId()
        });
        
        approvalHistory[approvalId].push(historyRecord);
        
        // Check if all approvers have approved
        if (approvalWorkflows[approvalId].approvedBy.length == approvalWorkflows[approvalId].approvers.length) {
            // Set state to APPROVED
            approvalWorkflows[approvalId].state = ApprovalState.APPROVED;
            approvalWorkflows[approvalId].completedAt = block.timestamp;
            
            // Remove from pending approvals
            for (uint i = 0; i < approvalWorkflows[approvalId].approvers.length; i++) {
                _removeFromPendingApprovals(approvalWorkflows[approvalId].approvers[i], approvalId);
            }
            
            // Emit completed event
            emit ApprovalWorkflowCompleted(approvalId, ApprovalState.APPROVED, historyRecord.txId);
        }
        
        // Emit event
        emit ApprovalWorkflowApproved(approvalId, approverId, historyRecord.txId);
    }
    
    /**
     * @dev Reject a workflow
     * @param approvalId ID của quy trình phê duyệt
     * @param rejectorId ID của người từ chối
     * @param reason Lý do từ chối
     */
    function rejectWorkflow(
        string memory approvalId,
        string memory rejectorId,
        string memory reason
    ) public whenNotPaused {
        // Check if approval workflow exists
        require(bytes(approvalWorkflows[approvalId].approvalId).length > 0, "Approval workflow does not exist");
        
        // Check if workflow is in PENDING state
        require(approvalWorkflows[approvalId].state == ApprovalState.PENDING, "Workflow is not in PENDING state");
        
        // Check authority
        bool isChairman = hasRole(CHAIRMAN_ROLE, msg.sender);
        bool isOfficer = hasRole(OFFICER_ROLE, msg.sender);
        
        require(isChairman || isOfficer, "Only chairman or officer can reject workflows");
        
        // Check if the rejector is in the approvers list
        bool isApprover = false;
        for (uint i = 0; i < approvalWorkflows[approvalId].approvers.length; i++) {
            if (keccak256(abi.encodePacked(approvalWorkflows[approvalId].approvers[i])) == 
                keccak256(abi.encodePacked(rejectorId))) {
                isApprover = true;
                break;
            }
        }
        
        require(isApprover, "Not authorized to reject this workflow");
        
        // Add to rejected list
        approvalWorkflows[approvalId].rejectedBy.push(rejectorId);
        approvalWorkflows[approvalId].state = ApprovalState.REJECTED;
        approvalWorkflows[approvalId].updatedAt = block.timestamp;
        approvalWorkflows[approvalId].completedAt = block.timestamp;
        
        // Create history record
        ApprovalHistory memory historyRecord = ApprovalHistory({
            action: "REJECT",
            timestamp: block.timestamp,
            userId: rejectorId,
            userRole: isChairman ? "chairman" : "officer",
            comments: reason,
            txId: _generateTxId()
        });
        
        approvalHistory[approvalId].push(historyRecord);
        
        // Remove from pending approvals
        for (uint i = 0; i < approvalWorkflows[approvalId].approvers.length; i++) {
            _removeFromPendingApprovals(approvalWorkflows[approvalId].approvers[i], approvalId);
        }
        
        // Emit events
        emit ApprovalWorkflowRejected(approvalId, rejectorId, reason, historyRecord.txId);
        emit ApprovalWorkflowCompleted(approvalId, ApprovalState.REJECTED, historyRecord.txId);
    }
    
    /**
     * @dev Check if approval workflow is expired and update its state if it is
     * @param approvalId ID của quy trình phê duyệt
     * @return bool Kết quả
     */
    function checkAndUpdateExpiredWorkflow(string memory approvalId) public whenNotPaused returns (bool) {
        // Check if approval workflow exists
        if (bytes(approvalWorkflows[approvalId].approvalId).length == 0) {
            return false;
        }
        
        // Check if workflow is in PENDING state
        if (approvalWorkflows[approvalId].state != ApprovalState.PENDING) {
            return false;
        }
        
        // Check if deadline has passed
        if (block.timestamp <= approvalWorkflows[approvalId].deadline) {
            return false;
        }
        
        // Set state to EXPIRED
        approvalWorkflows[approvalId].state = ApprovalState.EXPIRED;
        approvalWorkflows[approvalId].updatedAt = block.timestamp;
        approvalWorkflows[approvalId].completedAt = block.timestamp;
        
        // Create history record
        ApprovalHistory memory historyRecord = ApprovalHistory({
            action: "EXPIRE",
            timestamp: block.timestamp,
            userId: "system",
            userRole: "system",
            comments: "Approval deadline has passed",
            txId: _generateTxId()
        });
        
        approvalHistory[approvalId].push(historyRecord);
        
        // Remove from pending approvals
        for (uint i = 0; i < approvalWorkflows[approvalId].approvers.length; i++) {
            _removeFromPendingApprovals(approvalWorkflows[approvalId].approvers[i], approvalId);
        }
        
        // Emit events
        emit ApprovalWorkflowExpired(approvalId, historyRecord.txId);
        emit ApprovalWorkflowCompleted(approvalId, ApprovalState.EXPIRED, historyRecord.txId);
        
        return true;
    }
    
    /**
     * @dev Get approval workflow info
     * @param approvalId ID của quy trình phê duyệt
     * @return ApprovalWorkflow Thông tin quy trình phê duyệt
     */
    function getApprovalWorkflow(string memory approvalId) public view returns (ApprovalWorkflow memory) {
        require(bytes(approvalWorkflows[approvalId].approvalId).length > 0, "Approval workflow does not exist");
        return approvalWorkflows[approvalId];
    }
    
    /**
     * @dev Get approval history
     * @param approvalId ID của quy trình phê duyệt
     * @return ApprovalHistory[] Lịch sử quy trình phê duyệt
     */
    function getApprovalHistory(string memory approvalId) public view returns (ApprovalHistory[] memory) {
        require(bytes(approvalWorkflows[approvalId].approvalId).length > 0, "Approval workflow does not exist");
        return approvalHistory[approvalId];
    }
    
    /**
     * @dev Get pending approvals by approver
     * @param approverId ID của người phê duyệt
     * @return string[] Danh sách ID quy trình phê duyệt
     */
    function getPendingApprovalsByApprover(string memory approverId) public view returns (string[] memory) {
        return approverPendingApprovals[approverId];
    }
    
    /**
     * @dev Get approval workflows by target
     * @param targetId ID của đối tượng
     * @return ApprovalWorkflow[] Danh sách quy trình phê duyệt
     */
    function getApprovalWorkflowsByTarget(string memory targetId) public view returns (ApprovalWorkflow[] memory) {
        string[] memory approvalIds = targetApprovals[targetId];
        ApprovalWorkflow[] memory result = new ApprovalWorkflow[](approvalIds.length);
        
        for (uint i = 0; i < approvalIds.length; i++) {
            result[i] = approvalWorkflows[approvalIds[i]];
        }
        
        return result;
    }
    
    /**
     * @dev Check if approval workflow exists
     * @param approvalId ID của quy trình phê duyệt
     * @return bool Kết quả
     */
    function approvalWorkflowExists(string memory approvalId) public view returns (bool) {
        return bytes(approvalWorkflows[approvalId].approvalId).length > 0;
    }
    
    /**
     * @dev Remove an approval ID from an approver's pending approvals
     * @param approverId ID của người phê duyệt
     * @param approvalId ID của quy trình phê duyệt
     */
    function _removeFromPendingApprovals(string memory approverId, string memory approvalId) private {
        string[] storage pendingApprovals = approverPendingApprovals[approverId];
        
        for (uint i = 0; i < pendingApprovals.length; i++) {
            if (keccak256(abi.encodePacked(pendingApprovals[i])) == keccak256(abi.encodePacked(approvalId))) {
                // Replace with the last element and then remove the last element
                if (i < pendingApprovals.length - 1) {
                    pendingApprovals[i] = pendingApprovals[pendingApprovals.length - 1];
                }
                pendingApprovals.pop();
                break;
            }
        }
    }
    
    /**
     * @dev Check if this is a chairman role approval
     * @param approvalId ID của quy trình phê duyệt
     * @return bool Kết quả
     */
    function _isChairmanRoleApproval(string memory approvalId) private view returns (bool) {
        // In a real implementation, this would check the metadata
        // For now, assume it's stored in the metadata field as JSON
        // This is a simplified implementation
        return keccak256(abi.encodePacked(approvalWorkflows[approvalId].metadata)) == 
               keccak256(abi.encodePacked('{"newRole":"chairman"}'));
    }
    
    /**
     * @dev Convert string to ApprovalPriority
     * @param priority String representation of priority
     * @return ApprovalPriority The corresponding ApprovalPriority
     */
    function _stringToApprovalPriority(string memory priority) private pure returns (ApprovalPriority) {
        if (keccak256(abi.encodePacked(priority)) == keccak256(abi.encodePacked("LOW"))) {
            return ApprovalPriority.LOW;
        } else if (keccak256(abi.encodePacked(priority)) == keccak256(abi.encodePacked("MEDIUM"))) {
            return ApprovalPriority.MEDIUM;
        } else if (keccak256(abi.encodePacked(priority)) == keccak256(abi.encodePacked("HIGH"))) {
            return ApprovalPriority.HIGH;
        } else if (keccak256(abi.encodePacked(priority)) == keccak256(abi.encodePacked("CRITICAL"))) {
            return ApprovalPriority.CRITICAL;
        } else {
            // Default to MEDIUM for safety
            return ApprovalPriority.MEDIUM;
        }
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