from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework.parsers import MultiPartParser, FormParser

from ..models import AdminRequest, Attachment
from ..serializers import (
    RequestSerializer, RequestListSerializer, RequestDetailSerializer, 
    RequestCreateSerializer, SubmitRequestSerializer, OfficerRequestUpdateSerializer,
    AttachmentSerializer, AttachmentUploadSerializer, AttachmentListSerializer, 
    AttachmentDetailSerializer, AttachmentVerificationSerializer
)
from utils.permissions import IsChairman, IsOfficer, IsCitizen, IsOwnerOrAdmin


class RequestViewSet(viewsets.ModelViewSet):
    """
    API endpoint cho quản lý yêu cầu giấy tờ
    """
    serializer_class = RequestSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
    
    def get_queryset(self):
        user = self.request.user
        
        # Nếu là admin hoặc cán bộ, có thể xem tất cả yêu cầu
        if user.is_staff or user.role in ['chairman', 'officer']:
            return AdminRequest.objects.all()
        
        # Nếu là công dân, chỉ xem được yêu cầu của mình
        return AdminRequest.objects.filter(requestor=user)
    
    def get_serializer_class(self):
        if self.action == 'list':
            return RequestListSerializer
        elif self.action == 'retrieve':
            return RequestDetailSerializer
        elif self.action == 'create':
            return RequestCreateSerializer
        elif self.action == 'submit_request':
            return SubmitRequestSerializer
        elif self.action in ['update', 'partial_update', 'update_status', 'assign_officer']:
            return OfficerRequestUpdateSerializer
        return RequestSerializer
    
    def perform_create(self, serializer):
        serializer.save(requestor=self.request.user)
    
    @action(detail=True, methods=['post'], url_path='submit')
    def submit_request(self, request, pk=None):
        """
        Nộp yêu cầu (chuyển từ draft sang submitted)
        """
        instance = self.get_object()
        
        if instance.status != 'draft':
            return Response(
                {'detail': 'Chỉ có thể nộp yêu cầu ở trạng thái draft.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        instance.status = 'submitted'
        instance.submitted_date = timezone.now()
        
        # Tính toán ngày đến hạn dựa trên số ngày xử lý dự kiến của loại giấy tờ
        if not instance.due_date and instance.document_type and instance.document_type.estimated_processing_days:
            days = instance.document_type.estimated_processing_days
            instance.due_date = (timezone.now() + timezone.timedelta(days=days)).date()
        
        instance.save()
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel_request(self, request, pk=None):
        """
        Hủy yêu cầu
        """
        instance = self.get_object()
        
        if instance.status in ['completed', 'cancelled']:
            return Response(
                {'detail': 'Không thể hủy yêu cầu đã hoàn thành hoặc đã hủy.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        instance.status = 'cancelled'
        instance.save()
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """API cập nhật trạng thái yêu cầu (dành cho cán bộ xã)"""
        instance = self.get_object()
        serializer = OfficerRequestUpdateSerializer(instance, data=request.data, partial=True, context={'request': request})
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['patch'])
    def assign_officer(self, request, pk=None):
        """API phân công cán bộ xã xử lý yêu cầu"""
        instance = self.get_object()
        
        serializer = OfficerRequestUpdateSerializer(
            instance, 
            data={'assigned_officer': request.data.get('assigned_officer')},
            partial=True,
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def add_attachment(self, request, pk=None):
        """API thêm tài liệu đính kèm cho yêu cầu"""
        request_obj = self.get_object()
        
        # Kiểm tra quyền hạn: người tạo yêu cầu hoặc cán bộ xã mới được thêm tài liệu
        if request_obj.requestor != request.user and not hasattr(request.user, 'role'):
            return Response(
                {"error": "Bạn không có quyền thêm tài liệu đính kèm cho yêu cầu này"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = AttachmentUploadSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            serializer.save(request=request_obj)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def attachments(self, request, pk=None):
        """API lấy danh sách tài liệu đính kèm của yêu cầu"""
        request_obj = self.get_object()
        attachments = request_obj.attachments.all()
        
        serializer = AttachmentListSerializer(attachments, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def my_requests(self, request):
        """API lấy danh sách yêu cầu của người dùng hiện tại"""
        user = request.user
        queryset = AdminRequest.objects.filter(requestor=user).order_by('-created_at')
        
        # Lọc theo status nếu có
        status_param = request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = RequestListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = RequestListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def assigned_to_me(self, request):
        """API lấy danh sách yêu cầu được giao cho cán bộ xã hiện tại"""
        user = request.user
        
        # Kiểm tra người dùng có phải cán bộ xã không
        if not hasattr(user, 'role') or user.role.name != 'officer':
            return Response(
                {"error": "Chỉ cán bộ xã mới có thể xem danh sách yêu cầu được giao"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        queryset = AdminRequest.objects.filter(assigned_officer=user).order_by('-submitted_date')
        
        # Lọc theo status nếu có
        status_param = request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = RequestListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = RequestListSerializer(queryset, many=True)
        return Response(serializer.data)


class AttachmentViewSet(viewsets.ModelViewSet):
    """
    API endpoint cho quản lý tài liệu đính kèm
    """
    serializer_class = AttachmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
    parser_classes = [MultiPartParser, FormParser]
    
    def get_queryset(self):
        user = self.request.user
        
        # Nếu là admin hoặc cán bộ, có thể xem tất cả tài liệu đính kèm
        if user.is_staff or user.role in ['chairman', 'officer']:
            return Attachment.objects.all()
        
        # Nếu là công dân, chỉ xem được tài liệu đính kèm của mình
        return Attachment.objects.filter(request__requestor=user)
    
    def get_serializer_class(self):
        if self.action == 'list':
            return AttachmentListSerializer
        elif self.action == 'retrieve':
            return AttachmentDetailSerializer
        elif self.action == 'verify_attachment':
            return AttachmentVerificationSerializer
        return AttachmentSerializer
    
    def perform_create(self, serializer):
        # Kiểm tra quyền truy cập vào request
        request_obj = get_object_or_404(AdminRequest, pk=self.request.data.get('request'))
        
        if not (self.request.user.is_staff or 
                self.request.user.role in ['chairman', 'officer'] or 
                request_obj.requestor == self.request.user):
            self.permission_denied(self.request)
        
        serializer.save(uploaded_by=self.request.user)
    
    @action(detail=True, methods=['patch'])
    def verify_attachment(self, request, pk=None):
        """API xác thực tài liệu đính kèm (chỉ dành cho cán bộ xã và chủ tịch)"""
        attachment = self.get_object()
        
        # Kiểm tra quyền hạn: chỉ cán bộ xã và chủ tịch mới được xác thực
        if not hasattr(request.user, 'role') or request.user.role.name not in ['chairman', 'officer']:
            return Response(
                {"error": "Bạn không có quyền xác thực tài liệu này"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = AttachmentVerificationSerializer(
            attachment, 
            data=request.data,
            partial=True,
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
