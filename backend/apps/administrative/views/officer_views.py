from rest_framework import viewsets, generics, status, filters
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count
from django.utils import timezone

from ..models import AdminRequest, Document, Attachment, DocumentType, Approval
from ..serializers import (
    RequestListSerializer, RequestDetailSerializer, OfficerRequestUpdateSerializer,
    DocumentSerializer, DocumentListSerializer, DocumentDetailSerializer,
    AttachmentVerificationSerializer, AttachmentListSerializer,
    OfficerApprovalRequestSerializer, ApprovalListSerializer
)
from backend.utils.permissions import IsOfficer


class OfficerRequestListView(generics.ListAPIView):
    """API lấy danh sách yêu cầu cho cán bộ xã"""
    serializer_class = RequestListSerializer
    permission_classes = [IsAuthenticated, IsOfficer]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'reference_number', 'description', 'requestor__first_name', 'requestor__last_name']
    ordering_fields = ['created_at', 'submitted_date', 'due_date', 'status', 'priority']
    ordering = ['-submitted_date']
    
    def get_queryset(self):
        """Lấy danh sách yêu cầu cho cán bộ xã theo từng loại"""
        user = self.request.user
        request_type = self.request.query_params.get('type', 'assigned')
        
        # Lọc theo loại yêu cầu
        if request_type == 'assigned':
            # Các yêu cầu đã được giao cho cán bộ này
            queryset = AdminRequest.objects.filter(assigned_officer=user)
        elif request_type == 'pending':
            # Các yêu cầu chưa được giao cho ai và ở trạng thái submitted
            queryset = AdminRequest.objects.filter(assigned_officer__isnull=True, status='submitted')
        elif request_type == 'all':
            # Tất cả yêu cầu cán bộ xã có thể xem
            queryset = AdminRequest.objects.filter(
                Q(assigned_officer=user) | Q(assigned_officer__isnull=True)
            )
        else:
            queryset = AdminRequest.objects.filter(assigned_officer=user)
        
        # Lọc theo trạng thái
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        
        # Lọc theo loại giấy tờ
        document_type = self.request.query_params.get('document_type')
        if document_type:
            queryset = queryset.filter(document_type_id=document_type)
        
        # Lọc các yêu cầu quá hạn
        overdue = self.request.query_params.get('overdue')
        if overdue and overdue.lower() == 'true':
            today = timezone.now().date()
            queryset = queryset.filter(
                due_date__lt=today,
                status__in=['submitted', 'in_review', 'approved', 'processing']
            )
        
        return queryset


class OfficerRequestDetailView(generics.RetrieveAPIView):
    """API xem chi tiết yêu cầu cho cán bộ xã"""
    serializer_class = RequestDetailSerializer
    permission_classes = [IsAuthenticated, IsOfficer]
    
    def get_queryset(self):
        user = self.request.user
        return AdminRequest.objects.filter(
            Q(assigned_officer=user) | Q(assigned_officer__isnull=True)
        )


class OfficerRequestUpdateView(generics.UpdateAPIView):
    """API cập nhật yêu cầu cho cán bộ xã"""
    serializer_class = OfficerRequestUpdateSerializer
    permission_classes = [IsAuthenticated, IsOfficer]
    
    def get_queryset(self):
        user = self.request.user
        return AdminRequest.objects.filter(
            Q(assigned_officer=user) | Q(assigned_officer__isnull=True)
        )


class OfficerDocumentCreateView(generics.CreateAPIView):
    """API tạo giấy tờ mới cho cán bộ xã"""
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated, IsOfficer]
    
    def perform_create(self, serializer):
        # Tự động thêm cán bộ xã là người cấp
        serializer.save(issued_by=self.request.user)


class OfficerDocumentListView(generics.ListAPIView):
    """API lấy danh sách giấy tờ cho cán bộ xã"""
    serializer_class = DocumentListSerializer
    permission_classes = [IsAuthenticated, IsOfficer]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'reference_number', 'content', 'issued_to__first_name', 'issued_to__last_name']
    ordering_fields = ['issued_date', 'valid_until', 'status', 'created_at']
    ordering = ['-issued_date']
    
    def get_queryset(self):
        # Lọc các giấy tờ cán bộ xã có thể xem
        queryset = Document.objects.all()
        
        # Lọc theo trạng thái
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        
        # Lọc theo loại giấy tờ
        document_type = self.request.query_params.get('document_type')
        if document_type:
            queryset = queryset.filter(document_type_id=document_type)
        
        # Lọc theo người được cấp
        issued_to = self.request.query_params.get('issued_to')
        if issued_to:
            queryset = queryset.filter(issued_to_id=issued_to)
        
        # Lọc theo người cấp
        issued_by = self.request.query_params.get('issued_by')
        if issued_by:
            queryset = queryset.filter(issued_by_id=issued_by)
        
        # Lọc theo ngày cấp
        issued_date_from = self.request.query_params.get('issued_date_from')
        issued_date_to = self.request.query_params.get('issued_date_to')
        if issued_date_from:
            queryset = queryset.filter(issued_date__gte=issued_date_from)
        if issued_date_to:
            queryset = queryset.filter(issued_date__lte=issued_date_to)
        
        return queryset


@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsOfficer])
def update_request_status(request, pk):
    """API cập nhật trạng thái yêu cầu"""
    req_obj = get_object_or_404(
        AdminRequest,
        Q(assigned_officer=request.user) | Q(assigned_officer__isnull=True),
        pk=pk
    )
    
    serializer = OfficerRequestUpdateSerializer(
        req_obj, 
        data=request.data, 
        partial=True, 
        context={'request': request}
    )
    
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsOfficer])
def assign_self_to_request(request, pk):
    """API cán bộ xã tự gán mình vào xử lý yêu cầu"""
    req_obj = get_object_or_404(AdminRequest, pk=pk, assigned_officer__isnull=True)
    
    # Tự gán cán bộ xã hiện tại vào yêu cầu
    req_obj.assigned_officer = request.user
    
    # Cập nhật trạng thái nếu đang ở trạng thái submitted
    if req_obj.status == 'submitted':
        req_obj.status = 'in_review'
    
    req_obj.save()
    
    serializer = RequestDetailSerializer(req_obj)
    return Response(serializer.data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsOfficer])
def verify_attachment(request, pk):
    """API xác thực tài liệu đính kèm"""
    attachment = get_object_or_404(Attachment, pk=pk)
    
    serializer = AttachmentVerificationSerializer(
        attachment, 
        data={'is_verified': True}, 
        context={'request': request}
    )
    
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsOfficer])
def request_statistics(request):
    """API lấy thống kê về các yêu cầu"""
    user = request.user
    
    # Đếm số lượng yêu cầu theo trạng thái
    assigned_stats = AdminRequest.objects.filter(assigned_officer=user) \
        .values('status') \
        .annotate(count=Count('status')) \
        .order_by('status')
    
    # Đếm số lượng yêu cầu chưa được gán
    unassigned_count = AdminRequest.objects.filter(
        assigned_officer__isnull=True, 
        status='submitted'
    ).count()
    
    # Đếm số lượng yêu cầu quá hạn
    today = timezone.now().date()
    overdue_count = AdminRequest.objects.filter(
        assigned_officer=user,
        due_date__lt=today,
        status__in=['submitted', 'in_review', 'approved', 'processing']
    ).count()
    
    # Tổng số yêu cầu đã hoàn thành
    completed_count = AdminRequest.objects.filter(
        assigned_officer=user,
        status='completed'
    ).count()
    
    # Thống kê theo loại giấy tờ
    document_type_stats = AdminRequest.objects.filter(assigned_officer=user) \
        .values('document_type__name') \
        .annotate(count=Count('document_type')) \
        .order_by('-count')
    
    return Response({
        'assigned_stats': assigned_stats,
        'unassigned_count': unassigned_count,
        'overdue_count': overdue_count,
        'completed_count': completed_count,
        'document_type_stats': document_type_stats
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsOfficer])
def request_chairman_approval(request):
    """API yêu cầu chủ tịch xã phê duyệt"""
    serializer = OfficerApprovalRequestSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsOfficer])
def approval_status(request):
    """API xem danh sách yêu cầu phê duyệt đã gửi"""
    user = request.user
    approvals = Approval.objects.filter(requested_by=user).order_by('-requested_at')
    
    # Lọc theo trạng thái
    status_param = request.query_params.get('status')
    if status_param:
        approvals = approvals.filter(status=status_param)
    
    serializer = ApprovalListSerializer(approvals, many=True)
    return Response(serializer.data)
