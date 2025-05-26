import logging
import json
from django.conf import settings
from web3 import Web3
from .blockchain_service import BlockchainService

logger = logging.getLogger(__name__)

class UserContractService:
    """
    Service for interacting with user smart contract on the blockchain using Web3.py
    """
    
    def __init__(self):
        self.blockchain_service = BlockchainService()
        
        # Initialize Web3 connection
        self.web3_provider = getattr(settings, 'WEB3_PROVIDER_URI', 'http://localhost:8545')
        self.web3 = Web3(Web3.HTTPProvider(self.web3_provider))
        
        # Get contract address and ABI
        self.contract_address = getattr(settings, 'USER_CONTRACT_ADDRESS', None)
        self.contract = None
        
        if self.contract_address:
            self.contract = self.web3.eth.contract(
                address=self.contract_address,
                abi=self.blockchain_service.user_contract_abi
            )
    
    def register_user(self, user_data):
        """
        Register a new user on the blockchain
        
        :param user_data: Dictionary containing user details
        :return: Transaction result
        """
        try:
            # Check if contract is initialized
            if not self.contract:
                logger.error("User contract is not initialized")
                return {'success': False, 'error': 'User contract is not initialized'}
            
            # Prepare arguments
            user_id = user_data.get('id', '')
            role = user_data.get('role', 'citizen')
            name = user_data.get('name', '')
            email = user_data.get('email', '')
            created_by = user_data.get('created_by', '')
            status = user_data.get('status', 'ACTIVE')
            metadata = user_data.get('metadata', '{}')
            
            # Call the blockchain service to handle the transaction
            result = self.blockchain_service.register_user_on_blockchain({
                'id': user_id,
                'name': name,
                'email': email,
                'role': role,
                'status': status,
                'metadata': metadata
            }, created_by)
            
            logger.info(f"Registered user on blockchain: {user_id}")
            return result
            
        except Exception as e:
            logger.error(f"Error registering user on blockchain: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def get_user(self, user_id):
        """
        Get user details from the blockchain
        
        :param user_id: ID of the user to retrieve
        :return: User details
        """
        try:
            if not self.contract:
                logger.error("User contract is not initialized")
                return {'success': False, 'error': 'User contract is not initialized'}
            
            # Call the contract function
            user = self.contract.functions.getUser(user_id).call()
            
            # Format the response
            formatted_user = {
                'userId': user[0],
                'role': user[1],
                'name': user[2],
                'email': user[3],
                'dataHash': user[4],
                'state': user[5],
                'metadata': user[6],
                'documents': user[7],
                'createdBy': user[8],
                'createdAt': user[9],
                'updatedAt': user[10],
                'approvedToChairmanBy': user[11],
                'approvedToChairmanAt': user[12]
            }
            
            return {'success': True, 'user': formatted_user}
            
        except Exception as e:
            logger.error(f"Error retrieving user from blockchain: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def update_user_status(self, user_id, new_status):
        """
        Update user status on the blockchain
        
        :param user_id: ID of the user to update
        :param new_status: New status (ACTIVE, INACTIVE, SUSPENDED)
        :return: Transaction result
        """
        try:
            if not self.contract:
                logger.error("User contract is not initialized")
                return {'success': False, 'error': 'User contract is not initialized'}
            
            # Build transaction
            transaction = self.contract.functions.updateUserStatus(
                user_id,
                int(new_status)
            )
            
            # Sign and send transaction
            result = self.blockchain_service._sign_and_send_transaction(transaction)
            
            logger.info(f"Updated user status on blockchain: {user_id} to {new_status}")
            return result
            
        except Exception as e:
            logger.error(f"Error updating user status on blockchain: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def add_document_to_user(self, user_id, document_id):
        """
        Add document reference to user on the blockchain
        
        :param user_id: ID of the user
        :param document_id: ID of the document to add
        :return: Transaction result
        """
        try:
            if not self.contract:
                logger.error("User contract is not initialized")
                return {'success': False, 'error': 'User contract is not initialized'}
            
            # Build transaction
            transaction = self.contract.functions.addDocumentToUser(
                user_id,
                document_id
            )
            
            # Sign and send transaction
            result = self.blockchain_service._sign_and_send_transaction(transaction)
            
            logger.info(f"Added document {document_id} to user {user_id} on blockchain")
            return result
            
        except Exception as e:
            logger.error(f"Error adding document to user on blockchain: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def get_user_documents(self, user_id):
        """
        Get all documents for a user from the blockchain
        
        :param user_id: ID of the user
        :return: List of documents
        """
        try:
            if not self.contract:
                logger.error("User contract is not initialized")
                return {'success': False, 'error': 'User contract is not initialized'}
            
            # Call the contract function
            documents = self.contract.functions.getUserDocuments(user_id).call()
            
            return {'success': True, 'documents': documents}
            
        except Exception as e:
            logger.error(f"Error retrieving user documents from blockchain: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def update_user_role(self, user_id, new_role, approver_id=None):
        """
        Update user role on the blockchain
        
        :param user_id: ID of the user to update
        :param new_role: New role (citizen, officer, chairman)
        :param approver_id: ID of the user approving the change (optional)
        :return: Transaction result
        """
        try:
            # Use the existing blockchain service method
            result = self.blockchain_service.update_user_role(user_id, new_role, approver_id)
            return result
            
        except Exception as e:
            logger.error(f"Error updating user role on blockchain: {str(e)}")
            return {'success': False, 'error': str(e)}


# Singleton instance
user_contract_service = UserContractService() 