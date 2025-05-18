from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.db.models import Q

from ..models import Request, Attachment
from ..serializers import (
    RequestSerializer, RequestListSerializer, RequestDetailSerializer, 
    RequestCreateSerializer, SubmitRequestSerializer, OfficerRequestUpdateSerializer,
    AttachmentSerializer, AttachmentUploadSerializer, AttachmentListSerializer, 
    AttachmentDetailSerializer, AttachmentVerificationSerializer
)
from utils.permissions import IsChairman, IsOfficer, IsCitizen


class RequestViewSet(viewsets.ModelViewSet):
    """
    API endpoint cho yêu cầu giấy tờ
    """
    queryset = Request.objects.all()
    serializer_class = RequestSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'reference_number', 'description']
    ordering_fields = ['created_at', 'submitted_date', 'due_date', 'status', 'priority']
    ordering = ['-created_at']
    
    def get_permissions(self):
        """
        Quyền hạn truy cập:
        - Tạo: tất cả người dùng đã xác thực (chủ yếu là citizen)
        - Cập nhật: officer và chairman
        - Xem: citizen chỉ xem yêu cầu của họ, officer và chairman xem tất cả
        """
        if self.action in ['update', 'partial_update', 'assign_officer', 'update_status']:
            permission_classes = [permissions.IsAuthenticated & (IsChairman | IsOfficer)]
        elif self.action == 'destroy':
            permission_classes = [permissions.IsAuthenticated & IsChairman]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """
        Lọc danh sách yêu cầu dựa trên vai trò:
        - Citizens chỉ thấy yêu cầu của họ
        - Officers thấy yêu cầu được giao cho họ và chưa được gán
        - Chairman thấy tất cả
        """
        queryset = super().get_queryset()
        user = self.request.user
        
        if user.is_authenticated:
            if hasattr(user, 'role'):
                if user.role.name == 'chairman':
                    return queryset
                elif user.role.name == 'officer':
                    # Officers thấy yêu cầu được giao cho họ và các yêu cầu chưa gán
                    return queryset.filter(Q(assigned_officer=user) | Q(assigned_officer__isnull=True))
                else:
                    # Citizens chỉ thấy yêu cầu của họ
                    return queryset.filter(requestor=user)
            else:
                # Citizens chỉ thấy yêu cầu của họ
                return queryset.filter(requestor=user)
        
        return Request.objects.none()
    
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
    
    @action(detail=True, methods=['post'])
    def submit_request(self, request, pk=None):
        """API nộp yêu cầu (chuyển từ draft sang submitted)"""
        instance = self.get_object()
        
        # Kiểm tra quyền hạn: chỉ người tạo yêu cầu mới được nộp
        if instance.requestor != request.user:
            return Response(
                {"error": "Bạn không có quyền nộp yêu cầu này"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = SubmitRequestSerializer(instance, data={'status': 'submitted'}, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
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
        queryset = Request.objects.filter(requestor=user).order_by('-created_at')
        
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
        
        queryset = Request.objects.filter(assigned_officer=user).order_by('-submitted_date')
        
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
    API endpoint cho tài liệu đính kèm
    """
    queryset = Attachment.objects.all()
    serializer_class = AttachmentSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'attachment_type']
    ordering_fields = ['created_at', 'name', 'attachment_type']
    ordering = ['-created_at']
    
    def get_permissions(self):
        """
        Quyền hạn truy cập:
        - Tạo, cập nhật: người dùng đã xác thực (phải kiểm tra quyền hạn với request/document)
        - Xóa: chỉ chairman và officer
        """
        if self.action == 'destroy':
            permission_classes = [permissions.IsAuthenticated & (IsChairman | IsOfficer)]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """
        Lọc danh sách tài liệu đính kèm dựa trên vai trò:
        - Citizens chỉ thấy tài liệu của họ
        - Officers và Chairman thấy tất cả
        """
        queryset = super().get_queryset()
        user = self.request.user
        
        if user.is_authenticated:
            # Admin, chairman và officers thấy tất cả
            if hasattr(user, 'role') and user.role.name in ['chairman', 'officer']:
                return queryset
            
            # Citizens chỉ thấy tài liệu của họ
            return queryset.filter(
                Q(uploaded_by=user) | 
                Q(request__requestor=user) | 
                Q(document__issued_to=user)
            )
        
        return Attachment.objects.none()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return AttachmentListSerializer
        elif self.action == 'retrieve':
            return AttachmentDetailSerializer
        elif self.action == 'verify_attachment':
            return AttachmentVerificationSerializer
        return AttachmentSerializer
    
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
