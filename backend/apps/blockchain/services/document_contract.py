import logging
from .hyperledger import hyperledger_service

logger = logging.getLogger(__name__)

class DocumentContractService:
    """
    Service for interacting with document smart contract on the blockchain
    """
    
    def __init__(self):
        self.chaincode_name = "document_contract"
        self.hyperledger = hyperledger_service
    
    async def create_document(self, document_data):
        """
        Create a new document on the blockchain
        
        :param document_data: Dictionary containing document details
        :return: Transaction result
        """
        try:
            # Prepare arguments
            args = [
                document_data.get('id', ''),
                document_data.get('type', ''),
                document_data.get('citizen_id', ''),
                document_data.get('issued_by', ''),
                document_data.get('issued_date', ''),
                document_data.get('valid_until', 'UNLIMITED'),
                document_data.get('status', 'ACTIVE'),
                document_data.get('data_hash', ''),
            ]
            
            # Invoke chaincode
            response = await self.hyperledger.invoke_chaincode(
                self.chaincode_name, 
                "createDocument",
                args
            )
            
            logger.info(f"Created document on blockchain: {document_data.get('id', '')}")
            return response
            
        except Exception as e:
            logger.error(f"Error creating document on blockchain: {str(e)}")
            raise
    
    async def get_document(self, document_id):
        """
        Get document details from the blockchain
        
        :param document_id: ID of the document to retrieve
        :return: Document details
        """
        try:
            response = await self.hyperledger.query_chaincode(
                self.chaincode_name,
                "getDocument",
                [document_id]
            )
            
            return response
            
        except Exception as e:
            logger.error(f"Error retrieving document from blockchain: {str(e)}")
            raise
    
    async def update_document_status(self, document_id, new_status, reason=None):
        """
        Update document status on the blockchain
        
        :param document_id: ID of the document to update
        :param new_status: New status (ACTIVE, REVOKED, EXPIRED)
        :param reason: Reason for status change (optional)
        :return: Transaction result
        """
        try:
            args = [document_id, new_status]
            if reason:
                args.append(reason)
            
            response = await self.hyperledger.invoke_chaincode(
                self.chaincode_name,
                "updateDocumentStatus",
                args
            )
            
            logger.info(f"Updated document status on blockchain: {document_id} to {new_status}")
            return response
            
        except Exception as e:
            logger.error(f"Error updating document status on blockchain: {str(e)}")
            raise
    
    async def verify_document(self, document_id, data_hash=None):
        """
        Verify document authenticity on the blockchain
        
        :param document_id: ID of the document to verify
        :param data_hash: Hash of document data for verification (optional)
        :return: Verification result
        """
        try:
            args = [document_id]
            if data_hash:
                args.append(data_hash)
            
            response = await self.hyperledger.query_chaincode(
                self.chaincode_name,
                "verifyDocument",
                args
            )
            
            return response
            
        except Exception as e:
            logger.error(f"Error verifying document on blockchain: {str(e)}")
            raise
    
    async def get_document_history(self, document_id):
        """
        Get document history from the blockchain
        
        :param document_id: ID of the document
        :return: Document history
        """
        try:
            response = await self.hyperledger.query_chaincode(
                self.chaincode_name,
                "getDocumentHistory",
                [document_id]
            )
            
            return response
            
        except Exception as e:
            logger.error(f"Error retrieving document history from blockchain: {str(e)}")
            raise
    
    async def get_documents_by_citizen(self, citizen_id):
        """
        Get all documents for a citizen from the blockchain
        
        :param citizen_id: ID of the citizen
        :return: List of documents
        """
        try:
            response = await self.hyperledger.query_chaincode(
                self.chaincode_name,
                "getDocumentsByCitizen",
                [citizen_id]
            )
            
            return response
            
        except Exception as e:
            logger.error(f"Error retrieving citizen documents from blockchain: {str(e)}")
            raise


# Singleton instance
document_contract_service = DocumentContractService()
