import asyncio
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import AnonymousUser
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from apps.administrative.models import Document
from apps.blockchain.services.document_contract import document_contract_service
from apps.blockchain.services.blockchain_service import BlockchainService


class DocumentVerificationView(APIView):
    """
    API endpoint để xác thực giấy tờ sử dụng blockchain
    """
    permission_classes = [AllowAny]  # Cho phép truy cập công khai
    
    def get(self, request, document_id=None):
        """
        Kiểm tra và trả về thông tin xác thực của giấy tờ
        """
        if not document_id:
            return Response(
                {"error": "Vui lòng cung cấp ID của giấy tờ"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            # Tìm giấy tờ trong database
            document = Document.objects.get(document_id=document_id)
            
            # Nếu giấy tờ chưa được lưu vào blockchain, trả về lỗi
            if not document.blockchain_status:
                return Response(
                    {
                        "status": "unverified",
                        "message": "Giấy tờ chưa được lưu vào blockchain",
                        "document_info": {
                            "document_id": document.document_id,
                            "title": document.title,
                            "type": document.get_document_type_display(),
                            "status": document.get_status_display(),
                        }
                    },
                    status=status.HTTP_200_OK
                )
                
            # Tạo hash từ dữ liệu hiện tại
            current_hash = document.calculate_data_hash()
            
            # Lấy kết quả xác thực từ blockchain
            verification_result = asyncio.run(
                document_contract_service.verify_document(document.document_id, current_hash)
            )
            
            # Xác định trạng thái xác thực
            is_verified = verification_result.get('verified', False)
            
            # Chuẩn bị thông tin giấy tờ
            document_info = {
                "document_id": document.document_id,
                "title": document.title,
                "type": document.get_document_type_display(),
                "issue_date": document.issue_date.strftime('%d/%m/%Y') if document.issue_date else None,
                "status": document.get_status_display(),
                "blockchain_tx_id": document.blockchain_tx_id,
                "blockchain_timestamp": document.blockchain_timestamp.strftime('%d/%m/%Y %H:%M:%S') if document.blockchain_timestamp else None,
            }
            
            # Chuẩn bị thông tin người được cấp (nếu có)
            if document.citizen and not isinstance(request.user, AnonymousUser) and (
                request.user.is_superuser or 
                request.user.is_officer or 
                request.user.is_chairman or
                request.user.id == document.citizen.id
            ):
                document_info["citizen"] = {
                    "name": document.citizen.full_name,
                    "email": document.citizen.email,
                }
            
            return Response(
                {
                    "status": "verified" if is_verified else "invalid",
                    "message": "Giấy tờ hợp lệ và đã được xác thực trên blockchain" if is_verified else "Giấy tờ không hợp lệ hoặc đã bị thay đổi",
                    "document_info": document_info,
                    "blockchain_data": verification_result.get('document', {}),
                },
                status=status.HTTP_200_OK
            )
            
        except ObjectDoesNotExist:
            return Response(
                {
                    "status": "not_found",
                    "message": "Không tìm thấy giấy tờ với ID đã cung cấp"
                },
                status=status.HTTP_404_NOT_FOUND
            )
            
        except Exception as e:
            return Response(
                {
                    "status": "error",
                    "message": f"Lỗi khi xác thực giấy tờ: {str(e)}"
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class DocumentBlockchainHistoryView(APIView):
    """
    API endpoint để lấy lịch sử giao dịch blockchain của giấy tờ
    """
    
    def get(self, request, document_id=None):
        """
        Lấy lịch sử giao dịch blockchain của giấy tờ
        """
        if not document_id:
            return Response(
                {"error": "Vui lòng cung cấp ID của giấy tờ"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            # Tìm giấy tờ trong database
            document = Document.objects.get(document_id=document_id)
            
            # Nếu giấy tờ chưa được lưu vào blockchain, trả về lỗi
            if not document.blockchain_status:
                return Response(
                    {
                        "status": "not_available",
                        "message": "Giấy tờ chưa được lưu vào blockchain"
                    },
                    status=status.HTTP_200_OK
                )
                
            # Lấy lịch sử giao dịch từ blockchain
            history_result = asyncio.run(
                document_contract_service.get_document_history(document.document_id)
            )
            
            # Lấy danh sách bản ghi blockchain từ database
            from apps.blockchain.models import BlockchainRecord
            from django.contrib.contenttypes.models import ContentType
            
            content_type = ContentType.objects.get_for_model(Document)
            blockchain_records = BlockchainRecord.objects.filter(
                content_type=content_type,
                object_id=str(document.id)
            ).order_by('-created_at')
            
            # Chuẩn bị dữ liệu từ blockchain records
            record_data = []
            for record in blockchain_records:
                record_data.append({
                    "transaction_id": record.transaction_id,
                    "transaction_hash": record.transaction_hash,
                    "record_type": record.get_record_type_display(),
                    "status": record.get_status_display(),
                    "created_at": record.created_at.strftime('%d/%m/%Y %H:%M:%S'),
                    "created_by": record.created_by.full_name if record.created_by else None,
                    "data": record.data,
                })
            
            return Response(
                {
                    "status": "success",
                    "document_info": {
                        "document_id": document.document_id,
                        "title": document.title,
                        "blockchain_tx_id": document.blockchain_tx_id,
                    },
                    "blockchain_history": history_result,
                    "blockchain_records": record_data,
                },
                status=status.HTTP_200_OK
            )
            
        except ObjectDoesNotExist:
            return Response(
                {
                    "status": "not_found",
                    "message": "Không tìm thấy giấy tờ với ID đã cung cấp"
                },
                status=status.HTTP_404_NOT_FOUND
            )
            
        except Exception as e:
            return Response(
                {
                    "status": "error",
                    "message": f"Lỗi khi lấy lịch sử blockchain: {str(e)}"
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class DocumentVerificationAPIView(APIView):
    """
    API để xác thực giấy tờ hành chính trên blockchain
    """
    permission_classes = [AllowAny]  # Cho phép truy cập công khai
    
    @swagger_auto_schema(
        operation_description="Xác thực giấy tờ hành chính trên blockchain",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['document_id'],
            properties={
                'document_id': openapi.Schema(type=openapi.TYPE_STRING, description='ID của giấy tờ trên blockchain'),
                'document_number': openapi.Schema(type=openapi.TYPE_STRING, description='Số giấy tờ (tùy chọn)'),
                'identification_number': openapi.Schema(type=openapi.TYPE_STRING, description='Số CMND/CCCD của công dân (tùy chọn)'),
            },
        ),
        responses={
            200: openapi.Response(
                description="Kết quả xác thực",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'verified': openapi.Schema(type=openapi.TYPE_BOOLEAN, description='Kết quả xác thực'),
                        'exists': openapi.Schema(type=openapi.TYPE_BOOLEAN, description='Giấy tờ có tồn tại trên blockchain'),
                        'document': openapi.Schema(type=openapi.TYPE_OBJECT, description='Thông tin giấy tờ'),
                        'blockchain_info': openapi.Schema(type=openapi.TYPE_OBJECT, description='Thông tin blockchain'),
                    }
                )
            ),
            400: openapi.Response(description="Dữ liệu không hợp lệ"),
            404: openapi.Response(description="Không tìm thấy giấy tờ"),
        }
    )
    def post(self, request, *args, **kwargs):
        # Lấy thông tin từ request
        document_id = request.data.get('document_id')
        document_number = request.data.get('document_number')
        identification_number = request.data.get('identification_number')
        
        # Kiểm tra thông tin đầu vào
        if not document_id and not document_number:
            return Response(
                {"error": "Cần cung cấp ID hoặc số giấy tờ để xác thực"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Nếu blockchain_id được cung cấp, sử dụng để xác thực trực tiếp
        if document_id:
            # Tìm document trong database nếu có
            try:
                document = Document.objects.get(blockchain_id=document_id)
                
                # Xác thực trên blockchain
                verification_result = document.verify()
                
                # Trả về kết quả
                return Response({
                    'verified': verification_result.get('verified', False),
                    'exists': verification_result.get('exists', False),
                    'document': {
                        'id': document.id,
                        'blockchain_id': document.blockchain_id,
                        'document_number': document.document_number,
                        'title': document.title,
                        'document_type': document.document_type,
                        'document_type_display': document.get_document_type_display(),
                        'status': document.status,
                        'status_display': document.get_status_display(),
                        'issue_date': document.issue_date,
                        'valid_until': document.valid_until,
                    },
                    'blockchain_info': {
                        'tx_id': document.blockchain_tx_id,
                        'timestamp': document.blockchain_timestamp,
                        'status': document.blockchain_status
                    }
                })
            except Document.DoesNotExist:
                # Không tìm thấy trong database, kiểm tra trên blockchain
                blockchain_service = BlockchainService()
                verification_result = blockchain_service.verify_document(document_id)
                
                if verification_result.get('exists', False):
                    doc_info = verification_result.get('document', {})
                    return Response({
                        'verified': verification_result.get('verified', False),
                        'exists': True,
                        'document': {
                            'blockchain_id': document_id,
                            'document_type': doc_info.get('documentType'),
                            'status': doc_info.get('state'),
                            'issue_date': doc_info.get('issueDate'),
                            'valid_until': doc_info.get('validUntil'),
                        },
                        'blockchain_info': {
                            'verification_timestamp': doc_info.get('verificationTimestamp'),
                        }
                    })
                else:
                    return Response(
                        {"error": "Không tìm thấy giấy tờ trên blockchain"},
                        status=status.HTTP_404_NOT_FOUND
                    )
        
        # Nếu document_number được cung cấp, tìm trong database
        elif document_number:
            try:
                document = Document.objects.get(document_number=document_number)
                
                # Nếu identification_number được cung cấp, kiểm tra khớp với citizen
                if identification_number and document.citizen.identification_number != identification_number:
                    return Response(
                        {"error": "Thông tin CMND/CCCD không khớp với giấy tờ"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Xác thực trên blockchain
                verification_result = document.verify()
                
                # Trả về kết quả
                return Response({
                    'verified': verification_result.get('verified', False),
                    'exists': verification_result.get('exists', False),
                    'document': {
                        'id': document.id,
                        'blockchain_id': document.blockchain_id,
                        'document_number': document.document_number,
                        'title': document.title,
                        'document_type': document.document_type,
                        'document_type_display': document.get_document_type_display(),
                        'status': document.status,
                        'status_display': document.get_status_display(),
                        'issue_date': document.issue_date,
                        'valid_until': document.valid_until,
                    },
                    'blockchain_info': {
                        'tx_id': document.blockchain_tx_id,
                        'timestamp': document.blockchain_timestamp,
                        'status': document.blockchain_status
                    }
                })
            except Document.DoesNotExist:
                return Response(
                    {"error": "Không tìm thấy giấy tờ với số giấy tờ đã cung cấp"},
                    status=status.HTTP_404_NOT_FOUND
                )


class DocumentHistoryAPIView(APIView):
    """
    API để lấy lịch sử của giấy tờ hành chính trên blockchain
    """
    permission_classes = [AllowAny]  # Cho phép truy cập công khai
    
    @swagger_auto_schema(
        operation_description="Lấy lịch sử của giấy tờ hành chính trên blockchain",
        manual_parameters=[
            openapi.Parameter(
                'document_id',
                openapi.IN_PATH,
                description="ID của giấy tờ trên blockchain",
                type=openapi.TYPE_STRING,
                required=True
            ),
        ],
        responses={
            200: openapi.Response(
                description="Lịch sử của giấy tờ",
                schema=openapi.Schema(
                    type=openapi.TYPE_ARRAY,
                    items=openapi.Schema(
                        type=openapi.TYPE_OBJECT,
                        properties={
                            'txId': openapi.Schema(type=openapi.TYPE_STRING, description='Transaction ID'),
                            'timestamp': openapi.Schema(type=openapi.TYPE_STRING, description='Thời gian'),
                            'state': openapi.Schema(type=openapi.TYPE_STRING, description='Trạng thái'),
                            'updatedAt': openapi.Schema(type=openapi.TYPE_STRING, description='Thời gian cập nhật'),
                        }
                    )
                )
            ),
            404: openapi.Response(description="Không tìm thấy giấy tờ"),
        }
    )
    def get(self, request, document_id, *args, **kwargs):
        # Kiểm tra thông tin đầu vào
        if not document_id:
            return Response(
                {"error": "Cần cung cấp ID giấy tờ để lấy lịch sử"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Tìm document trong database nếu có
        try:
            document = Document.objects.get(blockchain_id=document_id)
            
            # Lấy lịch sử từ blockchain
            history_result = document.get_blockchain_history()
            
            # Trả về kết quả
            return Response(history_result)
            
        except Document.DoesNotExist:
            # Không tìm thấy trong database, kiểm tra trên blockchain
            blockchain_service = BlockchainService()
            history_result = blockchain_service.get_document_history(document_id)
            
            if isinstance(history_result, list) or (isinstance(history_result, dict) and 'success' in history_result and history_result['success']):
                return Response(history_result)
            else:
                return Response(
                    {"error": "Không tìm thấy giấy tờ trên blockchain"},
                    status=status.HTTP_404_NOT_FOUND
                ) 