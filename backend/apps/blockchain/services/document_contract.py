import logging
import json
from django.conf import settings
# from web3 import Web3
from .blockchain_service import BlockchainService

logger = logging.getLogger(__name__)

class DocumentContractService:
    """
    Service for interacting with document smart contract on the blockchain using Web3.py
    """
    
    def __init__(self):
        self.blockchain_service = BlockchainService()
        
        # Initialize Web3 connection
        self.web3_provider = getattr(settings, 'WEB3_PROVIDER_URI', 'http://localhost:8545')
        # self.web3 = Web3(Web3.HTTPProvider(self.web3_provider))
        self.web3 = None
        
        # Get contract address and ABI
        self.contract_address = getattr(settings, 'DOCUMENT_CONTRACT_ADDRESS', None)
        self.contract = None
        
        # Tạm thời comment phần khởi tạo contract
        # if self.contract_address:
        #     self.contract = self.web3.eth.contract(
        #         address=self.contract_address,
        #         abi=self.blockchain_service.document_contract_abi
        #     )
    
    def create_document(self, document_data):
        """
        Create a new document on the blockchain
        
        :param document_data: Dictionary containing document details
        :return: Transaction result
        """
        try:
            # Check if contract is initialized
            if not self.contract:
                logger.error("Document contract is not initialized")
                return {'success': False, 'error': 'Document contract is not initialized'}
            
            # Prepare arguments
            document_id = document_data.get('id', '')
            document_type = document_data.get('type', '')
            citizen_id = document_data.get('citizen_id', '')
            issued_by = document_data.get('issued_by', '')
            issue_date = document_data.get('issued_date', '')
            valid_until = document_data.get('valid_until', 'UNLIMITED')
            data_hash = document_data.get('data_hash', '')
            metadata = document_data.get('metadata', '{}')
            
            # Call the blockchain service to handle the transaction
            result = self.blockchain_service.save_document_to_blockchain({
                'blockchain_id': document_id,
                'document_type': document_type,
                'citizen': {'id': citizen_id},
                'issue_date': issue_date,
                'valid_until': valid_until,
                'content': document_data.get('content', ''),
                'title': document_data.get('title', ''),
                'document_number': document_data.get('document_number', ''),
                'is_important': document_data.get('is_important', False)
            }, issued_by, json.loads(metadata) if isinstance(metadata, str) else metadata)
            
            logger.info(f"Created document on blockchain: {document_id}")
            return result
            
        except Exception as e:
            logger.error(f"Error creating document on blockchain: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def get_document(self, document_id):
        """
        Get document details from the blockchain
        
        :param document_id: ID of the document to retrieve
        :return: Document details
        """
        try:
            if not self.contract:
                logger.error("Document contract is not initialized")
                return {'success': False, 'error': 'Document contract is not initialized'}
            
            # Call the contract function
            document = self.contract.functions.getDocument(document_id).call()
            
            # Format the response
            formatted_document = {
                'documentId': document[0],
                'documentType': document[1],
                'citizenId': document[2],
                'issuedBy': document[3],
                'issueDate': document[4],
                'validUntil': document[5],
                'dataHash': document[6],
                'metadata': document[7],
                'state': document[8],
                'createdAt': document[9],
                'updatedAt': document[10],
                'approvedBy': document[11],
                'approvedAt': document[12],
                'revokedBy': document[13],
                'revokedAt': document[14],
                'revocationReason': document[15],
            }
            
            return {'success': True, 'document': formatted_document}
            
        except Exception as e:
            logger.error(f"Error retrieving document from blockchain: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def update_document_status(self, document_id, new_status, reason=None):
        """
        Update document status on the blockchain
        
        :param document_id: ID of the document to update
        :param new_status: New status (ACTIVE, REVOKED, EXPIRED)
        :param reason: Reason for status change (optional)
        :return: Transaction result
        """
        try:
            if not self.contract:
                logger.error("Document contract is not initialized")
                return {'success': False, 'error': 'Document contract is not initialized'}
            
            # Build transaction
            transaction = self.contract.functions.updateDocumentStatus(
                document_id,
                int(new_status),
                reason or ""
            )
            
            # Sign and send transaction
            result = self.blockchain_service._sign_and_send_transaction(transaction)
            
            logger.info(f"Updated document status on blockchain: {document_id} to {new_status}")
            return result
            
        except Exception as e:
            logger.error(f"Error updating document status on blockchain: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def verify_document(self, document_id, data_hash=None):
        """
        Verify document authenticity on the blockchain
        
        :param document_id: ID of the document to verify
        :param data_hash: Hash of document data for verification (optional)
        :return: Verification result
        """
        try:
            # Use the existing blockchain service method
            result = self.blockchain_service.verify_document(document_id, data_hash)
            return result
            
        except Exception as e:
            logger.error(f"Error verifying document on blockchain: {str(e)}")
            return {'success': False, 'error': str(e), 'verified': False}
    
    def get_document_history(self, document_id):
        """
        Get document history from the blockchain
        
        :param document_id: ID of the document
        :return: Document history
        """
        try:
            # Use the existing blockchain service method
            result = self.blockchain_service.get_document_history(document_id)
            return result
            
        except Exception as e:
            logger.error(f"Error retrieving document history from blockchain: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def get_documents_by_citizen(self, citizen_id):
        """
        Get all documents for a citizen from the blockchain
        
        :param citizen_id: ID of the citizen
        :return: List of documents
        """
        try:
            # Use the existing blockchain service method
            result = self.blockchain_service.get_user_documents(citizen_id)
            return result
            
        except Exception as e:
            logger.error(f"Error retrieving citizen documents from blockchain: {str(e)}")
            return {'success': False, 'error': str(e)}


# Singleton instance
document_contract_service = DocumentContractService()
