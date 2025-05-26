import logging
import json
from django.conf import settings
from web3 import Web3
from .blockchain_service import BlockchainService

logger = logging.getLogger(__name__)

class AdminContractService:
    """
    Service for interacting with admin contract on the blockchain using Web3.py
    """
    
    def __init__(self):
        self.blockchain_service = BlockchainService()
        
        # Initialize Web3 connection
        self.web3_provider = getattr(settings, 'WEB3_PROVIDER_URI', 'http://localhost:8545')
        self.web3 = Web3(Web3.HTTPProvider(self.web3_provider))
        
        # Get contract address and ABI
        self.contract_address = getattr(settings, 'ADMIN_CONTRACT_ADDRESS', None)
        self.contract = None
        
        if self.contract_address:
            self.contract = self.web3.eth.contract(
                address=self.contract_address,
                abi=self.blockchain_service.admin_contract_abi
            )
    
    def create_approval_workflow(self, workflow_data):
        """
        Create a new approval workflow on the blockchain
        
        :param workflow_data: Dictionary containing workflow details
        :return: Transaction result
        """
        try:
            # Check if contract is initialized
            if not self.contract:
                logger.error("Admin contract is not initialized")
                return {'success': False, 'error': 'Admin contract is not initialized'}
            
            # Prepare arguments
            approval_id = workflow_data.get('id', '')
            approval_type = workflow_data.get('type', '')
            target_id = workflow_data.get('target_id', '')
            requested_by = workflow_data.get('requested_by', '')
            approvers = workflow_data.get('approvers', '')
            metadata = workflow_data.get('metadata', '{}')
            priority = workflow_data.get('priority', 'MEDIUM')
            deadline = workflow_data.get('deadline', '')
            
            # Build transaction
            transaction = self.contract.functions.createApprovalWorkflow(
                approval_id,
                approval_type,
                target_id,
                requested_by,
                approvers,
                metadata,
                priority,
                deadline
            )
            
            # Sign and send transaction
            result = self.blockchain_service._sign_and_send_transaction(transaction)
            
            logger.info(f"Created approval workflow on blockchain: {approval_id}")
            return result
            
        except Exception as e:
            logger.error(f"Error creating approval workflow on blockchain: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def get_approval_workflow(self, workflow_id):
        """
        Get approval workflow details from the blockchain
        
        :param workflow_id: ID of the workflow to retrieve
        :return: Workflow details
        """
        try:
            if not self.contract:
                logger.error("Admin contract is not initialized")
                return {'success': False, 'error': 'Admin contract is not initialized'}
            
            # Call the contract function
            workflow = self.contract.functions.getApprovalWorkflow(workflow_id).call()
            
            # Format the response
            formatted_workflow = {
                'approvalId': workflow[0],
                'approvalType': workflow[1],
                'targetId': workflow[2],
                'requestedBy': workflow[3],
                'approvers': workflow[4],
                'approvedBy': workflow[5],
                'rejectedBy': workflow[6],
                'metadata': workflow[7],
                'state': workflow[8],
                'priority': workflow[9],
                'deadline': workflow[10],
                'createdAt': workflow[11],
                'updatedAt': workflow[12],
                'completedAt': workflow[13]
            }
            
            return {'success': True, 'workflow': formatted_workflow}
            
        except Exception as e:
            logger.error(f"Error retrieving approval workflow from blockchain: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def approve_workflow(self, workflow_id, approver_id, comments=''):
        """
        Approve a workflow on the blockchain
        
        :param workflow_id: ID of the workflow to approve
        :param approver_id: ID of the user approving the workflow
        :param comments: Comments for the approval (optional)
        :return: Transaction result
        """
        try:
            if not self.contract:
                logger.error("Admin contract is not initialized")
                return {'success': False, 'error': 'Admin contract is not initialized'}
            
            # Build transaction
            transaction = self.contract.functions.approveWorkflow(
                workflow_id,
                approver_id,
                comments or ""
            )
            
            # Sign and send transaction
            result = self.blockchain_service._sign_and_send_transaction(transaction)
            
            logger.info(f"Approved workflow on blockchain: {workflow_id} by {approver_id}")
            return result
            
        except Exception as e:
            logger.error(f"Error approving workflow on blockchain: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def reject_workflow(self, workflow_id, rejector_id, reason):
        """
        Reject a workflow on the blockchain
        
        :param workflow_id: ID of the workflow to reject
        :param rejector_id: ID of the user rejecting the workflow
        :param reason: Reason for the rejection
        :return: Transaction result
        """
        try:
            if not self.contract:
                logger.error("Admin contract is not initialized")
                return {'success': False, 'error': 'Admin contract is not initialized'}
            
            # Build transaction
            transaction = self.contract.functions.rejectWorkflow(
                workflow_id,
                rejector_id,
                reason or ""
            )
            
            # Sign and send transaction
            result = self.blockchain_service._sign_and_send_transaction(transaction)
            
            logger.info(f"Rejected workflow on blockchain: {workflow_id} by {rejector_id}")
            return result
            
        except Exception as e:
            logger.error(f"Error rejecting workflow on blockchain: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def get_approval_history(self, approval_id):
        """
        Get approval history from the blockchain
        
        :param approval_id: ID of the approval workflow
        :return: Approval history
        """
        try:
            if not self.contract:
                logger.error("Admin contract is not initialized")
                return {'success': False, 'error': 'Admin contract is not initialized'}
            
            # Call the contract function
            history = self.contract.functions.getApprovalHistory(approval_id).call()
            
            # Format the response
            formatted_history = []
            for record in history:
                formatted_record = {
                    'action': record[0],
                    'timestamp': record[1],
                    'userId': record[2],
                    'userRole': record[3],
                    'comments': record[4],
                    'txId': record[5]
                }
                formatted_history.append(formatted_record)
            
            return {'success': True, 'history': formatted_history}
            
        except Exception as e:
            logger.error(f"Error retrieving approval history from blockchain: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def get_pending_approvals(self, approver_id):
        """
        Get pending approvals for an approver from the blockchain
        
        :param approver_id: ID of the approver
        :return: List of pending approval IDs
        """
        try:
            if not self.contract:
                logger.error("Admin contract is not initialized")
                return {'success': False, 'error': 'Admin contract is not initialized'}
            
            # Call the contract function
            pending_approvals = self.contract.functions.getPendingApprovalsByApprover(approver_id).call()
            
            return {'success': True, 'pendingApprovals': pending_approvals}
            
        except Exception as e:
            logger.error(f"Error retrieving pending approvals from blockchain: {str(e)}")
            return {'success': False, 'error': str(e)}


# Singleton instance
admin_contract_service = AdminContractService() 