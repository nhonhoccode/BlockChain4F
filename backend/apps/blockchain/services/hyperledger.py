import os
import logging
from pathlib import Path
import json
import asyncio
from hfc.fabric import Client

logger = logging.getLogger(__name__)

class HyperledgerService:
    """
    Service for connecting to and interacting with Hyperledger Fabric blockchain
    """
    
    def __init__(self):
        # Read network configuration from environment variables or use defaults
        self.network_profile_path = os.getenv(
            'BLOCKCHAIN_NETWORK_PROFILE', 
            os.path.join(Path(__file__).parent.parent.parent.parent.parent, 'blockchain', 'networks', 'hyperledger', 'connection-profile.json')
        )
        self.channel_name = os.getenv('BLOCKCHAIN_CHANNEL_NAME', 'adminchannel')
        self.org_name = os.getenv('BLOCKCHAIN_ORG_NAME', 'Org1')
        self.peer_name = os.getenv('BLOCKCHAIN_PEER_NAME', 'peer0.org1.example.com')
        self.user_name = os.getenv('BLOCKCHAIN_USER_NAME', 'Admin')
        
        # Initialize client connection
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize the Fabric client"""
        try:
            if not os.path.exists(self.network_profile_path):
                logger.error(f"Network profile not found at: {self.network_profile_path}")
                raise FileNotFoundError(f"Network profile not found at: {self.network_profile_path}")
            
            self.client = Client(net_profile=self.network_profile_path)
            
            # Set client user context
            self.client.new_channel(self.channel_name)
            
            logger.info(f"Successfully initialized Hyperledger Fabric client for {self.channel_name}")
            
            # For simulation purposes in development
            self.is_connected = True
            
        except Exception as e:
            logger.error(f"Failed to initialize Hyperledger Fabric client: {str(e)}")
            # For development, set this to True for simulation
            self.is_connected = True

    async def query_chaincode(self, cc_name, function_name, args):
        """
        Query the chaincode
        
        :param cc_name: Name of the chaincode
        :param function_name: Name of the function to invoke
        :param args: Arguments to pass to the function
        :return: Response from the chaincode
        """
        try:
            if not self.is_connected:
                raise ConnectionError("Not connected to Hyperledger Fabric network")
            
            # In a real implementation, this would query the actual blockchain
            # For development, we'll simulate the response
            response = await self._simulate_query(cc_name, function_name, args)
            return response
            
        except Exception as e:
            logger.error(f"Error querying chaincode: {str(e)}")
            raise
    
    async def invoke_chaincode(self, cc_name, function_name, args):
        """
        Invoke chaincode transaction
        
        :param cc_name: Name of the chaincode
        :param function_name: Name of the function to invoke
        :param args: Arguments to pass to the function
        :return: Transaction ID
        """
        try:
            if not self.is_connected:
                raise ConnectionError("Not connected to Hyperledger Fabric network")
            
            # In a real implementation, this would invoke the actual chaincode
            # For development, we'll simulate the response
            response = await self._simulate_invoke(cc_name, function_name, args)
            return response
            
        except Exception as e:
            logger.error(f"Error invoking chaincode: {str(e)}")
            raise
    
    async def _simulate_query(self, cc_name, function_name, args):
        """Simulate chaincode query for development"""
        await asyncio.sleep(0.5)  # Simulate network delay
        
        # Generate appropriate mock responses based on chaincode and function
        if cc_name == "document_contract":
            if function_name == "getDocument":
                doc_id = args[0]
                return {
                    "id": doc_id,
                    "type": "Giấy khai sinh" if "birth" in doc_id.lower() else "CMND",
                    "issuedTo": "Nguyễn Văn A",
                    "issuedBy": "UBND Xã ABC",
                    "issuedDate": "2023-05-15",
                    "status": "ACTIVE",
                    "txId": f"tx_{doc_id}_{function_name}"
                }
            
            elif function_name == "verifyDocument":
                doc_id = args[0]
                return {
                    "verified": True,
                    "document": {
                        "id": doc_id,
                        "isValid": True,
                        "verificationDate": "2023-06-20T14:35:22Z"
                    }
                }
        
        elif cc_name == "user_contract":
            if function_name == "getUser":
                user_id = args[0]
                return {
                    "id": user_id,
                    "role": "citizen",
                    "status": "ACTIVE",
                    "documents": ["doc1", "doc2"],
                    "txId": f"tx_{user_id}_{function_name}"
                }
        
        # Default response
        return {
            "success": True,
            "message": f"Simulated query for {cc_name}.{function_name}({args})",
            "txId": f"tx_query_{cc_name}_{function_name}"
        }
    
    async def _simulate_invoke(self, cc_name, function_name, args):
        """Simulate chaincode invoke for development"""
        await asyncio.sleep(1)  # Simulate network delay
        
        # Generate a transaction ID
        tx_id = f"tx_invoke_{cc_name}_{function_name}_{hash(str(args))}"
        
        return {
            "success": True,
            "message": f"Simulated invoke for {cc_name}.{function_name}({args})",
            "txId": tx_id
        }


# Singleton instance
hyperledger_service = HyperledgerService()
