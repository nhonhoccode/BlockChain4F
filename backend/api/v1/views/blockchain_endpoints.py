from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from apps.accounts.models import User
from apps.administrative.models import Document
from apps.blockchain.services.blockchain_service import BlockchainService


class BlockchainRegisterUserAPIView(APIView):
    """
    API để đăng ký người dùng lên blockchain
    """
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    @swagger_auto_schema(
        operation_description="Đăng ký người dùng lên blockchain",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['user_id'],
            properties={
                'user_id': openapi.Schema(type=openapi.TYPE_INTEGER, description='ID của người dùng'),
                'created_by': openapi.Schema(type=openapi.TYPE_STRING, description='ID của người tạo (tùy chọn)'),
            },
        ),
        responses={
            200: openapi.Response(description="Đăng ký thành công"),
            400: openapi.Response(description="Dữ liệu không hợp lệ"),
            404: openapi.Response(description="Không tìm thấy người dùng"),
        }
    )
    def post(self, request, *args, **kwargs):
        # Lấy thông tin từ request
        user_id = request.data.get('user_id')
        created_by = request.data.get('created_by', 'admin')
        
        # Kiểm tra thông tin đầu vào
        if not user_id:
            return Response(
                {"error": "Cần cung cấp ID người dùng"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Tìm user trong database
        try:
            user = User.objects.get(id=user_id)
            
            # Đăng ký lên blockchain
            blockchain_service = BlockchainService()
            result = blockchain_service.register_user_on_blockchain(user, created_by)
            
            if result.get('success'):
                return Response({
                    'success': True,
                    'user_id': user.id,
                    'blockchain_id': user.blockchain_id,
                    'tx_id': result.get('txId'),
                    'message': 'Đăng ký người dùng lên blockchain thành công'
                })
            else:
                return Response({
                    'success': False,
                    'error': result.get('error', 'Đăng ký thất bại')
                }, status=status.HTTP_400_BAD_REQUEST)
            
        except User.DoesNotExist:
            return Response(
                {"error": "Không tìm thấy người dùng"},
                status=status.HTTP_404_NOT_FOUND
            )


class BlockchainUserInfoAPIView(APIView):
    """
    API để lấy thông tin người dùng từ blockchain
    """
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        operation_description="Lấy thông tin người dùng từ blockchain",
        responses={
            200: openapi.Response(description="Thông tin người dùng"),
            404: openapi.Response(description="Không tìm thấy người dùng"),
        }
    )
    def get(self, request, blockchain_id, *args, **kwargs):
        # Kiểm tra thông tin đầu vào
        if not blockchain_id:
            return Response(
                {"error": "Cần cung cấp blockchain ID của người dùng"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Tìm user trong database
        try:
            user = User.objects.get(blockchain_id=blockchain_id)
            
            # Gọi blockchain để xác thực
            verification_result = user.verify_on_blockchain()
            
            return Response({
                'verified': verification_result.get('verified', False),
                'exists': verification_result.get('exists', False),
                'user': {
                    'id': user.id,
                    'blockchain_id': user.blockchain_id,
                    'username': user.username,
                    'full_name': user.get_full_name(),
                    'email': user.email,
                    'role': user.role,
                    'status': verification_result.get('user', {}).get('status'),
                },
                'blockchain_info': {
                    'tx_id': user.blockchain_tx_id,
                    'timestamp': user.blockchain_timestamp,
                    'status': user.blockchain_status
                }
            })
            
        except User.DoesNotExist:
            # Không tìm thấy trong database, kiểm tra trên blockchain
            blockchain_service = BlockchainService()
            result = blockchain_service.query_chaincode('user_contract', 'getUser', [blockchain_id])
            
            if result and not isinstance(result, dict) or (isinstance(result, dict) and 'error' not in result):
                return Response({
                    'exists': True,
                    'user': result
                })
            else:
                return Response(
                    {"error": "Không tìm thấy người dùng trên blockchain"},
                    status=status.HTTP_404_NOT_FOUND
                )


class BlockchainUserRoleUpdateAPIView(APIView):
    """
    API để cập nhật vai trò người dùng trên blockchain
    """
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    @swagger_auto_schema(
        operation_description="Cập nhật vai trò người dùng trên blockchain",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['blockchain_id', 'new_role'],
            properties={
                'blockchain_id': openapi.Schema(type=openapi.TYPE_STRING, description='Blockchain ID của người dùng'),
                'new_role': openapi.Schema(type=openapi.TYPE_STRING, description='Vai trò mới (citizen, officer, chairman)'),
                'approver_id': openapi.Schema(type=openapi.TYPE_STRING, description='ID của người phê duyệt (tùy chọn)'),
            },
        ),
        responses={
            200: openapi.Response(description="Cập nhật thành công"),
            400: openapi.Response(description="Dữ liệu không hợp lệ"),
            404: openapi.Response(description="Không tìm thấy người dùng"),
        }
    )
    def post(self, request, *args, **kwargs):
        # Lấy thông tin từ request
        blockchain_id = request.data.get('blockchain_id')
        new_role = request.data.get('new_role')
        approver_id = request.data.get('approver_id')
        
        # Kiểm tra thông tin đầu vào
        if not blockchain_id or not new_role:
            return Response(
                {"error": "Cần cung cấp blockchain ID và vai trò mới"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Kiểm tra vai trò hợp lệ
        valid_roles = ['citizen', 'officer', 'chairman']
        if new_role.lower() not in valid_roles:
            return Response(
                {"error": f"Vai trò không hợp lệ. Các vai trò hợp lệ: {', '.join(valid_roles)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Tìm user trong database
        try:
            user = User.objects.get(blockchain_id=blockchain_id)
            
            # Cập nhật vai trò trên blockchain
            result = user.update_role_on_blockchain(new_role, approver_id)
            
            if result.get('success'):
                return Response({
                    'success': True,
                    'user_id': user.id,
                    'blockchain_id': user.blockchain_id,
                    'old_role': user.role,
                    'new_role': new_role.upper(),
                    'tx_id': result.get('txId'),
                    'message': 'Cập nhật vai trò người dùng thành công'
                })
            else:
                return Response({
                    'success': False,
                    'error': result.get('error', 'Cập nhật thất bại')
                }, status=status.HTTP_400_BAD_REQUEST)
            
        except User.DoesNotExist:
            # Thử cập nhật trực tiếp trên blockchain
            blockchain_service = BlockchainService()
            args = [blockchain_id, new_role.lower()]
            if approver_id:
                args.append(approver_id)
            
            result = blockchain_service.invoke_chaincode('user_contract', 'updateUserRole', args)
            
            if result.get('success'):
                return Response({
                    'success': True,
                    'blockchain_id': blockchain_id,
                    'new_role': new_role,
                    'tx_id': result.get('txId'),
                    'message': 'Cập nhật vai trò người dùng trên blockchain thành công'
                })
            else:
                return Response({
                    'success': False,
                    'error': result.get('error', 'Cập nhật thất bại')
                }, status=status.HTTP_400_BAD_REQUEST)


class BlockchainApprovalWorkflowAPIView(APIView):
    """
    API để tương tác với quy trình phê duyệt trên blockchain
    """
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        operation_description="Lấy thông tin quy trình phê duyệt",
        responses={
            200: openapi.Response(description="Thông tin quy trình"),
            404: openapi.Response(description="Không tìm thấy quy trình"),
        }
    )
    def get(self, request, approval_id, *args, **kwargs):
        # Kiểm tra thông tin đầu vào
        if not approval_id:
            return Response(
                {"error": "Cần cung cấp ID quy trình phê duyệt"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Gọi blockchain để lấy thông tin
        blockchain_service = BlockchainService()
        result = blockchain_service.query_chaincode('admin_contract', 'getApprovalWorkflow', [approval_id])
        
        if result and not isinstance(result, dict) or (isinstance(result, dict) and 'error' not in result):
            return Response(result)
        else:
            return Response(
                {"error": "Không tìm thấy quy trình phê duyệt"},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @swagger_auto_schema(
        operation_description="Phê duyệt quy trình",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'approver_id': openapi.Schema(type=openapi.TYPE_STRING, description='ID của người phê duyệt'),
                'comments': openapi.Schema(type=openapi.TYPE_STRING, description='Ghi chú khi phê duyệt'),
            },
        ),
        responses={
            200: openapi.Response(description="Phê duyệt thành công"),
            400: openapi.Response(description="Dữ liệu không hợp lệ"),
            404: openapi.Response(description="Không tìm thấy quy trình"),
        }
    )
    def post(self, request, approval_id, *args, **kwargs):
        # Lấy thông tin từ request
        approver_id = request.data.get('approver_id', request.user.blockchain_id)
        comments = request.data.get('comments', '')
        action = request.data.get('action', 'approve')
        reason = request.data.get('reason', '')
        
        # Kiểm tra thông tin đầu vào
        if not approval_id:
            return Response(
                {"error": "Cần cung cấp ID quy trình phê duyệt"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Gọi blockchain để phê duyệt hoặc từ chối
        blockchain_service = BlockchainService()
        
        if action == 'approve':
            result = blockchain_service.invoke_chaincode('admin_contract', 'approveWorkflow', [approval_id, approver_id, comments])
        elif action == 'reject':
            if not reason:
                return Response(
                    {"error": "Cần cung cấp lý do từ chối"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            result = blockchain_service.invoke_chaincode('admin_contract', 'rejectWorkflow', [approval_id, approver_id, reason])
        elif action == 'cancel':
            if not reason:
                return Response(
                    {"error": "Cần cung cấp lý do hủy"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            result = blockchain_service.invoke_chaincode('admin_contract', 'cancelWorkflow', [approval_id, reason])
        else:
            return Response(
                {"error": "Hành động không hợp lệ. Các hành động hợp lệ: approve, reject, cancel"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if result.get('success'):
            # Nếu là phê duyệt giấy tờ, cập nhật trong database
            if result.get('approvalWorkflow', {}).get('type') == 'DOCUMENT' and action == 'approve':
                try:
                    document = Document.objects.get(blockchain_id=result.get('targetId'))
                    document.status = 'APPROVED'
                    document.save(update_fields=['status'])
                except Document.DoesNotExist:
                    pass
            
            return Response({
                'success': True,
                'approval_id': approval_id,
                'state': result.get('state'),
                'tx_id': result.get('txId'),
                'message': f'Quy trình phê duyệt đã được {action}'
            })
        else:
            return Response({
                'success': False,
                'error': result.get('error', f'{action} thất bại')
            }, status=status.HTTP_400_BAD_REQUEST)


class BlockchainPendingApprovalsAPIView(APIView):
    """
    API để lấy danh sách quy trình cần phê duyệt
    """
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        operation_description="Lấy danh sách quy trình cần phê duyệt",
        responses={
            200: openapi.Response(description="Danh sách quy trình"),
        }
    )
    def get(self, request, approver_id, *args, **kwargs):
        # Kiểm tra thông tin đầu vào
        if not approver_id:
            # Sử dụng blockchain_id của người dùng đang đăng nhập nếu không có approver_id
            approver_id = request.user.blockchain_id
        
        # Gọi blockchain để lấy danh sách
        blockchain_service = BlockchainService()
        result = blockchain_service.get_pending_approvals(approver_id)
        
        return Response(result) 