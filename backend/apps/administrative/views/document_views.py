from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.db.models import Q

from ..models import DocumentType, Document, Attachment
from ..serializers import (
    DocumentTypeSerializer, DocumentTypeListSerializer, DocumentTypeDetailSerializer,
    DocumentSerializer, DocumentListSerializer, DocumentDetailSerializer, DocumentVerificationSerializer,
    AttachmentUploadSerializer
)
from utils.permissions import IsChairman, IsOfficer, IsCitizen


class DocumentTypeViewSet(viewsets.ModelViewSet):
    """
    API endpoint cho loại giấy tờ hành chính
    """
    queryset = DocumentType.objects.all()
    serializer_class = DocumentTypeSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['name', 'code', 'created_at']
    ordering = ['name']
    
    def get_permissions(self):
        """
        Chỉ chairman và officer có quyền tạo, sửa, xóa
        Tất cả người dùng có thể xem
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated & (IsChairman | IsOfficer)]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return DocumentTypeListSerializer
        elif self.action in ['retrieve', 'document_type_stats']:
            return DocumentTypeDetailSerializer
        return DocumentTypeSerializer
    
    @action(detail=True, methods=['get'])
    def document_type_stats(self, request, pk=None):
        """API lấy thông kê liên quan đến loại giấy tờ"""
        document_type = self.get_object()
        
        # Đếm số lượng yêu cầu theo trạng thái
        request_stats = {}
        for status, status_display in document_type.requests.model.STATUS_CHOICES:
            count = document_type.requests.filter(status=status).count()
            request_stats[status] = {
                'status': status,
                'status_display': status_display,
                'count': count
            }
        
        # Đếm số lượng giấy tờ theo trạng thái
        document_stats = {}
        for status, status_display in document_type.documents.model.STATUS_CHOICES:
            count = document_type.documents.filter(status=status).count()
            document_stats[status] = {
                'status': status,
                'status_display': status_display,
                'count': count
            }
        
        # Tổng số lượng
        total_documents = document_type.documents.count()
        total_requests = document_type.requests.count()
        
        return Response({
            'document_type': DocumentTypeDetailSerializer(document_type).data,
            'request_stats': request_stats,
            'document_stats': document_stats,
            'total_documents': total_documents,
            'total_requests': total_requests
        })


class DocumentViewSet(viewsets.ModelViewSet):
    """
    API endpoint cho giấy tờ hành chính
    """
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'reference_number', 'content']
    ordering_fields = ['issued_date', 'reference_number', 'created_at']
    ordering = ['-issued_date']
    
    def get_permissions(self):
        """
        Quyền hạn truy cập:
        - Tạo, cập nhật: chỉ chairman và officer
        - Xem: tất cả người dùng có quyền view (phải là người được cấp hoặc cán bộ)
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated & (IsChairman | IsOfficer)]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """
        Lọc danh sách giấy tờ dựa trên vai trò:
        - Citizens chỉ thấy giấy tờ của họ
        - Officers và Chairman thấy tất cả
        """
        queryset = super().get_queryset()
        user = self.request.user
        
        if user.is_authenticated:
            # Admin, chairman và officers thấy tất cả
            if hasattr(user, 'role') and user.role.name in ['chairman', 'officer']:
                return queryset
            
            # Citizens chỉ thấy giấy tờ của họ
            return queryset.filter(issued_to=user)
        
        return Document.objects.none()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return DocumentListSerializer
        elif self.action == 'retrieve':
            return DocumentDetailSerializer
        elif self.action == 'verify':
            return DocumentVerificationSerializer
        return DocumentSerializer
    
    @action(detail=True, methods=['get'])
    def verify(self, request, pk=None):
        """API xác thực giấy tờ trên blockchain"""
        document = self.get_object()
        
        # Kiểm tra xác thực blockchain (giả định)
        is_valid_on_blockchain = document.is_verified_blockchain
        
        # Thông tin xác thực
        verification_info = {
            'is_valid': document.is_valid,
            'is_verified_blockchain': is_valid_on_blockchain,
            'verification_timestamp': timezone.now(),
            'verification_method': 'Blockchain verification'
        }
        
        serializer = DocumentVerificationSerializer(document)
        return Response({
            'document': serializer.data,
            'verification': verification_info
        })
    
    @action(detail=True, methods=['post'])
    def add_attachment(self, request, pk=None):
        """API thêm tài liệu đính kèm cho giấy tờ"""
        document = self.get_object()
        serializer = AttachmentUploadSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            serializer.save(document=document)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def attachments(self, request, pk=None):
        """API lấy danh sách tài liệu đính kèm của giấy tờ"""
        document = self.get_object()
        attachments = document.attachments.all()
        
        from ..serializers import AttachmentListSerializer
        serializer = AttachmentListSerializer(attachments, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def verify_by_hash(self, request):
        """API xác thực giấy tờ bằng mã băm công khai"""
        verification_hash = request.query_params.get('hash')
        if not verification_hash:
            return Response({"error": "Vui lòng cung cấp mã băm để xác thực"}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        document = get_object_or_404(Document, verification_hash=verification_hash)
        serializer = DocumentVerificationSerializer(document)
        
        return Response({
            'document': serializer.data,
            'verification': {
                'is_valid': document.is_valid,
                'is_verified_blockchain': document.is_verified_blockchain,
                'verification_timestamp': timezone.now(),
                'verification_method': 'Hash verification'
            }
        })
    
    @action(detail=False, methods=['get'])
    def public_verification(self, request):
        """API xác thực công khai - không yêu cầu xác thực người dùng"""
        self.permission_classes = [permissions.AllowAny]
        
        document_id = request.query_params.get('document_id')
        reference_number = request.query_params.get('reference_number')
        verification_hash = request.query_params.get('hash')
        
        if not any([document_id, reference_number, verification_hash]):
            return Response({
                "error": "Vui lòng cung cấp mã giấy tờ, số tham chiếu hoặc mã băm để xác thực"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        query = Q()
        if document_id:
            query |= Q(document_id=document_id)
        if reference_number:
            query |= Q(reference_number=reference_number)
        if verification_hash:
            query |= Q(verification_hash=verification_hash)
        
        document = get_object_or_404(Document, query)
        serializer = DocumentVerificationSerializer(document)
        
        return Response({
            'document': serializer.data,
            'verification': {
                'is_valid': document.is_valid,
                'is_verified_blockchain': document.is_verified_blockchain,
                'verification_timestamp': timezone.now(),
                'verification_method': 'Public verification'
            }
        })
