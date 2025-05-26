from rest_framework import viewsets, generics, status, filters
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils import timezone

from ..models import AdminRequest, Document, Attachment
from ..serializers import (
    RequestListSerializer, RequestDetailSerializer, CitizenRequestCreateSerializer,
    SubmitRequestSerializer, DocumentListSerializer, DocumentDetailSerializer,
    AttachmentUploadSerializer, AttachmentListSerializer
)
from backend.utils.permissions import IsCitizen


class CitizenRequestListView(generics.ListAPIView):
    """API lấy danh sách yêu cầu của công dân"""
    serializer_class = RequestListSerializer
    permission_classes = [IsAuthenticated, IsCitizen]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'reference_number', 'description']
    ordering_fields = ['created_at', 'submitted_date', 'due_date', 'status']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Lấy danh sách yêu cầu của công dân hiện tại"""
        user = self.request.user
        queryset = AdminRequest.objects.filter(requestor=user)
        
        # Lọc theo trạng thái
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
        
        # Lọc theo loại giấy tờ
        document_type = self.request.query_params.get('document_type')
        if document_type:
            queryset = queryset.filter(document_type_id=document_type)
        
        return queryset


class CitizenRequestCreateView(generics.CreateAPIView):
    """API tạo yêu cầu mới cho công dân"""
    serializer_class = CitizenRequestCreateSerializer
    permission_classes = [IsAuthenticated, IsCitizen]
    
    def perform_create(self, serializer):
        serializer.save(requestor=self.request.user)


class CitizenRequestDetailView(generics.RetrieveAPIView):
    """API xem chi tiết yêu cầu của công dân"""
    serializer_class = RequestDetailSerializer
    permission_classes = [IsAuthenticated, IsCitizen]
    
    def get_queryset(self):
        """Chỉ lấy yêu cầu của công dân hiện tại"""
        user = self.request.user
        return AdminRequest.objects.filter(requestor=user)


class CitizenDocumentListView(generics.ListAPIView):
    """API lấy danh sách giấy tờ của công dân"""
    serializer_class = DocumentListSerializer
    permission_classes = [IsAuthenticated, IsCitizen]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'reference_number', 'content']
    ordering_fields = ['issued_date', 'valid_until', 'status']
    ordering = ['-issued_date']
    
    def get_queryset(self):
        """Lấy danh sách giấy tờ của công dân hiện tại"""
        user = self.request.user
        queryset = Document.objects.filter(issued_to=user)
        
        # Lọc theo trạng thái
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
        
        # Lọc theo loại giấy tờ
        document_type = self.request.query_params.get('document_type')
        if document_type:
            queryset = queryset.filter(document_type_id=document_type)
        
        # Lọc giấy tờ còn hiệu lực
        valid_only = self.request.query_params.get('valid_only')
        if valid_only and valid_only.lower() == 'true':
            today = timezone.now().date()
            queryset = queryset.filter(
                Q(valid_until__isnull=True) | Q(valid_until__gte=today),
                valid_from__lte=today,
                status='issued'
            )
        
        return queryset


class CitizenDocumentDetailView(generics.RetrieveAPIView):
    """API xem chi tiết giấy tờ của công dân"""
    serializer_class = DocumentDetailSerializer
    permission_classes = [IsAuthenticated, IsCitizen]
    
    def get_queryset(self):
        """Chỉ lấy giấy tờ của công dân hiện tại"""
        user = self.request.user
        return Document.objects.filter(issued_to=user)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsCitizen])
def submit_request(request, pk):
    """API nộp yêu cầu (chuyển từ draft sang submitted)"""
    req_obj = get_object_or_404(AdminRequest, pk=pk, requestor=request.user)
    
    if req_obj.status != 'draft':
        return Response(
            {"error": "Chỉ có thể nộp yêu cầu ở trạng thái 'draft'"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    serializer = SubmitRequestSerializer(req_obj, data={'status': 'submitted'}, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsCitizen])
def add_attachment_to_request(request, pk):
    """API thêm tài liệu đính kèm cho yêu cầu"""
    req_obj = get_object_or_404(AdminRequest, pk=pk, requestor=request.user)
    
    serializer = AttachmentUploadSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save(request=req_obj, uploaded_by=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsCitizen])
def request_attachments(request, pk):
    """API lấy danh sách tài liệu đính kèm của yêu cầu"""
    req_obj = get_object_or_404(AdminRequest, pk=pk, requestor=request.user)
    attachments = req_obj.attachments.all()
    
    serializer = AttachmentListSerializer(attachments, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsCitizen])
def cancel_request(request, pk):
    """API hủy yêu cầu"""
    req_obj = get_object_or_404(AdminRequest, pk=pk, requestor=request.user)
    
    if req_obj.status in ['completed', 'cancelled', 'rejected']:
        return Response(
            {"error": f"Không thể hủy yêu cầu ở trạng thái '{req_obj.get_status_display()}'"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    req_obj.status = 'cancelled'
    req_obj.notes = request.data.get('notes', '') + f"\nYêu cầu đã bị hủy bởi người dùng vào {timezone.now()}"
    req_obj.save()
    
    serializer = RequestDetailSerializer(req_obj)
    return Response(serializer.data)
