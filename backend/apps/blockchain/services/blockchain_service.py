import os
import json
import hashlib
import base64
import uuid
import logging
from django.conf import settings
from django.utils import timezone
from web3 import Web3
from eth_account import Account
from eth_account.messages import encode_defunct

logger = logging.getLogger(__name__)

class BlockchainService:
    """
    Service class để tương tác với blockchain Ethereum/Quorum
    """
    
    def __init__(self):
        """
        Khởi tạo blockchain service với cấu hình từ settings
        """
        # Lấy cấu hình blockchain từ settings
        self.blockchain_dir = getattr(settings, 'BLOCKCHAIN_DIR', os.path.join(settings.BASE_DIR, '..', 'blockchain'))
        
        # Kết nối đến node Ethereum/Quorum
        self.web3_provider = getattr(settings, 'WEB3_PROVIDER_URI', 'http://localhost:8545')
        self.web3 = Web3(Web3.HTTPProvider(self.web3_provider))
        
        # Contract addresses
        self.document_contract_address = getattr(settings, 'DOCUMENT_CONTRACT_ADDRESS', None)
        self.user_contract_address = getattr(settings, 'USER_CONTRACT_ADDRESS', None)
        self.admin_contract_address = getattr(settings, 'ADMIN_CONTRACT_ADDRESS', None)
        
        # Load contract ABIs
        self.document_contract_abi = self._load_contract_abi('document_contract')
        self.user_contract_abi = self._load_contract_abi('user_contract')
        self.admin_contract_abi = self._load_contract_abi('admin_contract')
        
        # Initialize contracts if addresses are provided
        self.document_contract = None
        self.user_contract = None
        self.admin_contract = None
        
        if self.document_contract_address and self.document_contract_abi:
            try:
                self.document_contract = self.web3.eth.contract(
                    address=self.document_contract_address,
                    abi=self.document_contract_abi
                )
            except Exception as e:
                logger.error(f"Error initializing document contract: {str(e)}")
        
        if self.user_contract_address and self.user_contract_abi:
            try:
                self.user_contract = self.web3.eth.contract(
                    address=self.user_contract_address,
                    abi=self.user_contract_abi
                )
            except Exception as e:
                logger.error(f"Error initializing user contract: {str(e)}")
        
        if self.admin_contract_address and self.admin_contract_abi:
            try:
                self.admin_contract = self.web3.eth.contract(
                    address=self.admin_contract_address,
                    abi=self.admin_contract_abi
                )
            except Exception as e:
                logger.error(f"Error initializing admin contract: {str(e)}")
        
        # Default account for sending transactions
        self.default_account_address = getattr(settings, 'BLOCKCHAIN_DEFAULT_ACCOUNT', None)
        self.default_account_private_key = getattr(settings, 'BLOCKCHAIN_DEFAULT_PRIVATE_KEY', None)
        
        if self.default_account_address:
            self.web3.eth.default_account = self.default_account_address
    
    def _load_contract_abi(self, contract_name):
        """
        Load contract ABI from file
        """
        try:
            # First try to load from CONTRACT_ABI_DIR if defined
            contract_abi_dir = getattr(settings, 'CONTRACT_ABI_DIR', None)
            if contract_abi_dir:
                abi_path = os.path.join(contract_abi_dir, f'{contract_name}.json')
                if os.path.exists(abi_path):
                    with open(abi_path, 'r') as f:
                        contract_data = json.load(f)
                        return contract_data.get('abi', [])
            
            # Fallback to blockchain_dir/contracts path
            abi_path = os.path.join(self.blockchain_dir, 'contracts', f'{contract_name}.json')
            if os.path.exists(abi_path):
                with open(abi_path, 'r') as f:
                    contract_data = json.load(f)
                    return contract_data.get('abi', [])
            
            logger.warning(f"Could not find ABI file for {contract_name}")
            return []
        except Exception as e:
            logger.warning(f"Could not load ABI for {contract_name}: {str(e)}")
            return []
    
    def create_hash(self, data):
        """
        Tạo hash từ dữ liệu
        """
        if isinstance(data, dict) or isinstance(data, list):
            data = json.dumps(data, sort_keys=True)
        elif not isinstance(data, str):
            data = str(data)
        
        data_bytes = data.encode('utf-8')
        return hashlib.sha256(data_bytes).hexdigest()
    
    def generate_blockchain_id(self, prefix='DOC', unique_id=None):
        """
        Tạo ID cho đối tượng trên blockchain
        """
        if not unique_id:
            timestamp = timezone.now().strftime('%Y%m%d%H%M%S')
            random_str = uuid.uuid4().hex[:6]
            unique_id = f"{timestamp}-{random_str}"
        
        return f"{prefix}-{unique_id}"
    
    def _sign_and_send_transaction(self, transaction):
        """
        Sign và gửi transaction
        """
        try:
            # Lấy account từ private key
            if self.default_account_private_key:
                account = Account.from_key(self.default_account_private_key)
                
                # Lấy nonce
                nonce = self.web3.eth.get_transaction_count(account.address)
                
                # Build transaction
                tx = transaction.build_transaction({
                    'from': account.address,
                    'nonce': nonce,
                    'gas': 2000000,
                    'gasPrice': self.web3.to_wei('50', 'gwei')
                })
                
                # Sign transaction
                signed_tx = self.web3.eth.account.sign_transaction(tx, self.default_account_private_key)
                
                # Send transaction
                tx_hash = self.web3.eth.send_raw_transaction(signed_tx.rawTransaction)
                
                # Wait for transaction receipt
                tx_receipt = self.web3.eth.wait_for_transaction_receipt(tx_hash)
                
                return {
                    'success': tx_receipt.status == 1,
                    'txId': tx_hash.hex(),
                    'blockNumber': tx_receipt.blockNumber
                }
            else:
                # Nếu không có private key, sử dụng web3 provider có sẵn (ví dụ: Ganache)
                tx_hash = transaction.transact({'from': self.default_account_address})
                tx_receipt = self.web3.eth.wait_for_transaction_receipt(tx_hash)
                
                return {
                    'success': tx_receipt.status == 1,
                    'txId': tx_hash.hex(),
                    'blockNumber': tx_receipt.blockNumber
                }
                
        except Exception as e:
            logger.exception(f"Error sending transaction: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def save_document_to_blockchain(self, document, officer_id, metadata=None):
        """
        Lưu giấy tờ vào blockchain
        """
        try:
            # Tạo ID blockchain nếu chưa có
            if not document.blockchain_id:
                doc_prefix = document.document_type[:4].upper()
                document.blockchain_id = self.generate_blockchain_id(prefix=doc_prefix)
                document.save(update_fields=['blockchain_id'])
            
            # Tạo hash cho dữ liệu giấy tờ
            document_data = {
                'id': str(document.id),
                'document_type': document.document_type,
                'citizen_id': str(document.citizen.id) if document.citizen else None,
                'content': document.content,
                'issue_date': document.issue_date.isoformat() if document.issue_date else None,
                'valid_until': document.valid_until.isoformat() if document.valid_until else 'UNLIMITED',
                'status': document.status,
            }
            
            data_hash = self.create_hash(document_data)
            
            # Prepare metadata
            if metadata is None:
                metadata = {}
            
            metadata.update({
                'document_title': document.title,
                'document_number': getattr(document, 'document_number', ''),
                'is_important': getattr(document, 'is_important', False),
                'requiresChairmanApproval': getattr(document, 'is_important', False)
            })
            
            # Chuẩn bị metadata JSON
            metadata_json = json.dumps(metadata)
            
            # Kiểm tra connection và contract
            if not self.web3.is_connected():
                logger.error("Not connected to Ethereum node")
                return {'success': False, 'error': 'Not connected to Ethereum node'}
            
            if not hasattr(self, 'document_contract'):
                logger.error("Document contract not initialized")
                return {'success': False, 'error': 'Document contract not initialized'}
            
            # Gọi smart contract function
            transaction = self.document_contract.functions.createDocument(
                document.blockchain_id,
                document.document_type,
                str(document.citizen.id) if document.citizen else "0",
                str(officer_id),
                document.issue_date.isoformat() if document.issue_date else timezone.now().isoformat(),
                document.valid_until.isoformat() if document.valid_until else 'UNLIMITED',
                data_hash,
                metadata_json
            )
            
            result = self._sign_and_send_transaction(transaction)
            
            if result.get('success'):
                # Cập nhật trạng thái blockchain
                document.blockchain_status = 'STORED'
                document.blockchain_tx_id = result.get('txId')
                document.blockchain_timestamp = timezone.now()
                document.save(update_fields=['blockchain_status', 'blockchain_tx_id', 'blockchain_timestamp'])
            
            return result
            
        except Exception as e:
            logger.exception(f"Error saving document to blockchain: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def verify_document(self, document_id, document_data=None):
        """
        Xác thực giấy tờ trên blockchain
        """
        try:
            # Chuẩn bị hash dữ liệu nếu có
            data_hash = None
            if document_data:
                data_hash = self.create_hash(document_data)
            
            # Gọi smart contract function
            if data_hash:
                result = self.document_contract.functions.verifyDocument(document_id, data_hash).call()
            else:
                result = self.document_contract.functions.verifyDocument(document_id).call()
            
            return result
            
        except Exception as e:
            logger.exception(f"Error verifying document: {str(e)}")
            return {'success': False, 'error': str(e), 'verified': False}
    
    def get_document_history(self, document_id):
        """
        Lấy lịch sử của giấy tờ trên blockchain
        """
        try:
            # Gọi smart contract function
            history = self.document_contract.functions.getDocumentHistory(document_id).call()
            return history
            
        except Exception as e:
            logger.exception(f"Error getting document history: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def submit_document_for_approval(self, document_id, requested_by):
        """
        Gửi giấy tờ để phê duyệt
        """
        try:
            # Gọi smart contract function để submit document
            transaction = self.document_contract.functions.submitForApproval(document_id)
            result = self._sign_and_send_transaction(transaction)
            
            if result.get('success'):
                # Tạo quy trình phê duyệt trên admin_contract
                approval_id = self.generate_blockchain_id(prefix='APR')
                
                # Lấy danh sách người phê duyệt (trong thực tế, sẽ lấy từ cấu hình hệ thống)
                approvers = "chairman_id"  # Giả sử ID của chairman
                
                approval_transaction = self.admin_contract.functions.createApprovalWorkflow(
                    approval_id,
                    'DOCUMENT',
                    document_id,
                    str(requested_by),
                    approvers,
                    json.dumps({'documentId': document_id}),
                    'HIGH',
                    (timezone.now() + timezone.timedelta(days=7)).isoformat()
                )
                
                approval_result = self._sign_and_send_transaction(approval_transaction)
                
                # Kết hợp kết quả
                result['approvalWorkflow'] = {
                    'success': approval_result.get('success', False),
                    'approvalId': approval_id,
                    'txId': approval_result.get('txId')
                }
            
            return result
            
        except Exception as e:
            logger.exception(f"Error submitting document for approval: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def approve_document(self, document_id, approver_id, comments=''):
        """
        Phê duyệt giấy tờ
        """
        try:
            # Gọi smart contract function
            transaction = self.document_contract.functions.approveDocument(
                document_id,
                str(approver_id),
                comments
            )
            
            result = self._sign_and_send_transaction(transaction)
            
            # Cập nhật quy trình phê duyệt
            # Tìm approval workflow dựa trên document_id
            approval_workflows = self.admin_contract.functions.getApprovalWorkflowsByTarget(document_id).call()
            
            if approval_workflows and len(approval_workflows) > 0:
                # Lấy approval workflow mới nhất
                approval_workflow = approval_workflows[0]
                approval_id = approval_workflow.get('approvalId')
                
                # Phê duyệt approval workflow
                approval_transaction = self.admin_contract.functions.approveWorkflow(
                    approval_id,
                    str(approver_id),
                    comments
                )
                
                approval_result = self._sign_and_send_transaction(approval_transaction)
                
                # Kết hợp kết quả
                result['approvalWorkflow'] = {
                    'success': approval_result.get('success', False),
                    'approvalId': approval_id,
                    'state': 'APPROVED',
                    'txId': approval_result.get('txId')
                }
            
            return result
            
        except Exception as e:
            logger.exception(f"Error approving document: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def reject_document(self, document_id, rejector_id, reason):
        """
        Từ chối giấy tờ
        """
        try:
            # Gọi smart contract function
            transaction = self.document_contract.functions.rejectDocument(
                document_id,
                str(rejector_id),
                reason
            )
            
            result = self._sign_and_send_transaction(transaction)
            
            # Cập nhật quy trình phê duyệt
            # Tìm approval workflow dựa trên document_id
            approval_workflows = self.admin_contract.functions.getApprovalWorkflowsByTarget(document_id).call()
            
            if approval_workflows and len(approval_workflows) > 0:
                # Lấy approval workflow mới nhất
                approval_workflow = approval_workflows[0]
                approval_id = approval_workflow.get('approvalId')
                
                # Từ chối approval workflow
                approval_transaction = self.admin_contract.functions.rejectWorkflow(
                    approval_id,
                    str(rejector_id),
                    reason
                )
                
                approval_result = self._sign_and_send_transaction(approval_transaction)
                
                # Kết hợp kết quả
                result['approvalWorkflow'] = {
                    'success': approval_result.get('success', False),
                    'approvalId': approval_id,
                    'state': 'REJECTED',
                    'txId': approval_result.get('txId')
                }
            
            return result
            
        except Exception as e:
            logger.exception(f"Error rejecting document: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def register_user_on_blockchain(self, user, created_by='system'):
        """
        Đăng ký người dùng trên blockchain
        """
        try:
            # Tạo ID blockchain nếu chưa có
            if not user.blockchain_id:
                user_prefix = 'USR'
                user.blockchain_id = self.generate_blockchain_id(prefix=user_prefix)
                user.save(update_fields=['blockchain_id'])
            
            # Chuẩn bị metadata
            metadata = {
                'user_type': user.user_type,
                'phone': getattr(user, 'phone_number', ''),
                'address': getattr(user, 'address', ''),
                'identification_number': getattr(user, 'identification_number', '')
            }
            
            # Chuyển metadata thành JSON string
            metadata_json = json.dumps(metadata)
            
            # Gọi smart contract function (chỉ 5 tham số theo ABI)
            transaction = self.user_contract.functions.registerUser(
                user.blockchain_id,
                user.get_role_display().lower() if hasattr(user, 'get_role_display') else user.role.lower(),
                user.get_full_name() if hasattr(user, 'get_full_name') else f"{user.first_name} {user.last_name}",
                user.email,
                metadata_json
            )
            
            result = self._sign_and_send_transaction(transaction)
            
            if result.get('success'):
                # Cập nhật trạng thái blockchain
                user.blockchain_status = 'REGISTERED'
                user.blockchain_tx_id = result.get('txId')
                user.blockchain_timestamp = timezone.now()
                user.save(update_fields=['blockchain_status', 'blockchain_tx_id', 'blockchain_timestamp'])
            
            return result
            
        except Exception as e:
            logger.exception(f"Error registering user on blockchain: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def update_user_role(self, user_id, new_role, approver_id=None):
        """
        Cập nhật vai trò người dùng trên blockchain
        """
        try:
            # Chuẩn bị arguments
            args = [user_id, new_role]
            if approver_id:
                args.append(str(approver_id))
            else:
                args.append("")  # Empty string if no approver ID
            
            # Gọi smart contract function
            transaction = self.user_contract.functions.updateUserRole(*args)
            
            return self._sign_and_send_transaction(transaction)
            
        except Exception as e:
            logger.exception(f"Error updating user role: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def verify_user(self, user_id, user_data=None):
        """
        Xác thực người dùng trên blockchain
        """
        try:
            # Chuẩn bị hash dữ liệu nếu có
            data_hash = None
            if user_data:
                data_hash = self.create_hash(user_data)
            
            # Gọi smart contract function
            if data_hash:
                result = self.user_contract.functions.verifyUser(user_id, data_hash).call()
            else:
                result = self.user_contract.functions.verifyUser(user_id).call()
            
            return result
            
        except Exception as e:
            logger.exception(f"Error verifying user: {str(e)}")
            return {'success': False, 'error': str(e), 'verified': False}
    
    def get_pending_approvals(self, approver_id):
        """
        Lấy danh sách quy trình cần phê duyệt
        """
        try:
            # Gọi smart contract function
            result = self.admin_contract.functions.getPendingApprovalsByApprover(str(approver_id)).call()
            return result
            
        except Exception as e:
            logger.exception(f"Error getting pending approvals: {str(e)}")
            return {'success': False, 'error': str(e)}
            
    def get_user_documents(self, citizen_id):
        """
        Lấy danh sách giấy tờ của công dân từ blockchain
        """
        try:
            # Gọi smart contract function
            result = self.document_contract.functions.getDocumentsByCitizen(str(citizen_id)).call()
            return result
            
        except Exception as e:
            logger.exception(f"Error getting user documents: {str(e)}")
            return {'success': False, 'error': str(e)} 