from rest_framework import viewsets, generics, status, filters
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count, Avg
from django.utils import timezone

from ..models import AdminRequest, Document, DocumentType, Approval
from ..serializers import (
    RequestListSerializer, RequestDetailSerializer,
    DocumentSerializer, DocumentListSerializer, DocumentDetailSerializer,
    ApprovalSerializer, ApprovalListSerializer, ApprovalDetailSerializer,
    ChairmanApprovalUpdateSerializer
)
from backend.utils.permissions import IsChairman


class ChairmanDashboardView(generics.GenericAPIView):
    """API dashboard cho chủ tịch xã"""
    permission_classes = [IsAuthenticated, IsChairman]
    
    def get(self, request, *args, **kwargs):
        # Thống kê yêu cầu
        total_requests = AdminRequest.objects.count()
        pending_requests = AdminRequest.objects.filter(status__in=['submitted', 'in_review']).count()
        completed_requests = AdminRequest.objects.filter(status='completed').count()
        
        # Thống kê giấy tờ
        total_documents = Document.objects.count()
        issued_documents = Document.objects.filter(status='issued').count()
        
        # Thống kê phê duyệt
        pending_approvals = Approval.objects.filter(status='pending').count()
        
        # Thống kê theo loại giấy tờ
        document_type_stats = DocumentType.objects.annotate(
            requests_count=Count('requests'),
            documents_count=Count('documents')
        ).values('id', 'name', 'requests_count', 'documents_count')
        
        # Thống kê thời gian xử lý yêu cầu
        avg_processing_time = AdminRequest.objects.filter(status='completed').annotate(
            processing_time=timezone.models.ExpressionWrapper(
                timezone.models.F('completed_date') - timezone.models.F('submitted_date'),
                output_field=timezone.models.DurationField()
            )
        ).aggregate(avg_time=Avg('processing_time'))
        
        return Response({
            'request_stats': {
                'total': total_requests,
                'pending': pending_requests,
                'completed': completed_requests
            },
            'document_stats': {
                'total': total_documents,
                'issued': issued_documents
            },
            'approval_stats': {
                'pending': pending_approvals
            },
            'document_type_stats': document_type_stats,
            'avg_processing_time': avg_processing_time
        })


class ChairmanApprovalListView(generics.ListAPIView):
    """API lấy danh sách phê duyệt cho chủ tịch xã"""
    serializer_class = ApprovalListSerializer
    permission_classes = [IsAuthenticated, IsChairman]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'requested_by__first_name', 'requested_by__last_name']
    ordering_fields = ['requested_at', 'priority', 'status']
    ordering = ['-priority', '-requested_at']
    
    def get_queryset(self):
        queryset = Approval.objects.all()
        
        # Lọc theo trạng thái
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
        
        # Lọc theo mức độ ưu tiên
        priority = self.request.query_params.get('priority')
        if priority:
            queryset = queryset.filter(priority=priority)
        
        # Lọc các yêu cầu quá hạn
        overdue = self.request.query_params.get('overdue')
        if overdue and overdue.lower() == 'true':
            today = timezone.now().date()
            queryset = queryset.filter(due_date__lt=today, status='pending')
        
        # Lọc theo loại (document hoặc request)
        approval_type = self.request.query_params.get('type')
        if approval_type == 'document':
            queryset = queryset.filter(document__isnull=False)
        elif approval_type == 'request':
            queryset = queryset.filter(request__isnull=False)
        
        return queryset


class ChairmanApprovalDetailView(generics.RetrieveAPIView):
    """API xem chi tiết phê duyệt cho chủ tịch xã"""
    serializer_class = ApprovalDetailSerializer
    permission_classes = [IsAuthenticated, IsChairman]
    queryset = Approval.objects.all()


class ChairmanApprovalUpdateView(generics.UpdateAPIView):
    """API cập nhật trạng thái phê duyệt cho chủ tịch xã"""
    serializer_class = ChairmanApprovalUpdateSerializer
    permission_classes = [IsAuthenticated, IsChairman]
    queryset = Approval.objects.filter(status='pending')


class ChairmanDocumentListView(generics.ListAPIView):
    """API lấy danh sách giấy tờ cho chủ tịch xã"""
    serializer_class = DocumentListSerializer
    permission_classes = [IsAuthenticated, IsChairman]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'reference_number', 'content', 'issued_to__first_name', 'issued_to__last_name']
    ordering_fields = ['issued_date', 'valid_until', 'status', 'created_at']
    ordering = ['-issued_date']
    queryset = Document.objects.all()


class ChairmanRequestListView(generics.ListAPIView):
    """API lấy danh sách yêu cầu cho chủ tịch xã"""
    serializer_class = RequestListSerializer
    permission_classes = [IsAuthenticated, IsChairman]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'reference_number', 'description', 'requestor__first_name', 'requestor__last_name']
    ordering_fields = ['created_at', 'submitted_date', 'due_date', 'status', 'priority']
    ordering = ['-priority', '-submitted_date']
    queryset = AdminRequest.objects.all()


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsChairman])
def officer_statistics(request):
    """API thống kê về cán bộ xã và hiệu suất"""
    from backend.apps.accounts.models import User, Role
    from django.db.models.functions import TruncMonth
    
    # Lấy role cho cán bộ xã
    officer_role = Role.objects.filter(name='officer').first()
    
    if not officer_role:
        return Response({
            "error": "Không tìm thấy vai trò cán bộ xã"
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Đếm số lượng cán bộ xã
    total_officers = User.objects.filter(role=officer_role).count()
    
    # Thống kê số lượng yêu cầu đã xử lý theo từng cán bộ
    officer_request_stats = User.objects.filter(role=officer_role).annotate(
        total_requests=Count('assigned_requests'),
        completed_requests=Count('assigned_requests', filter=Q(assigned_requests__status='completed')),
        pending_requests=Count('assigned_requests', filter=Q(assigned_requests__status__in=['submitted', 'in_review', 'approved', 'processing']))
    ).values('id', 'first_name', 'last_name', 'total_requests', 'completed_requests', 'pending_requests')
    
    # Thống kê số lượng giấy tờ đã cấp theo từng cán bộ
    officer_document_stats = User.objects.filter(role=officer_role).annotate(
        total_documents=Count('issued_documents')
    ).values('id', 'first_name', 'last_name', 'total_documents')
    
    # Thống kê theo tháng
    monthly_stats = AdminRequest.objects.filter(
        status='completed',
        completed_date__isnull=False
    ).annotate(
        month=TruncMonth('completed_date')
    ).values('month').annotate(
        count=Count('id')
    ).order_by('month')
    
    return Response({
        'total_officers': total_officers,
        'officer_request_stats': officer_request_stats,
        'officer_document_stats': officer_document_stats,
        'monthly_stats': monthly_stats
    })


@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsChairman])
def approve_request(request, pk):
    """API chủ tịch xã phê duyệt yêu cầu"""
    approval = get_object_or_404(Approval, pk=pk, status='pending')
    
    serializer = ChairmanApprovalUpdateSerializer(
        approval, 
        data={'status': 'approved', 'approval_reason': request.data.get('approval_reason', '')}, 
        context={'request': request},
        partial=True
    )
    
    if serializer.is_valid():
        approval_obj = serializer.save()
        
        # Cập nhật trạng thái của document hoặc request nếu cần
        if approval_obj.document:
            approval_obj.document.status = 'issued'
            approval_obj.document.issued_date = timezone.now().date()
            approval_obj.document.save()
        
        elif approval_obj.request and approval_obj.request.status == 'in_review':
            approval_obj.request.status = 'approved'
            approval_obj.request.approved_date = timezone.now()
            approval_obj.request.approver = request.user
            approval_obj.request.save()
        
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsChairman])
def reject_approval(request, pk):
    """API chủ tịch xã từ chối phê duyệt"""
    approval = get_object_or_404(Approval, pk=pk, status='pending')
    
    serializer = ChairmanApprovalUpdateSerializer(
        approval, 
        data={'status': 'rejected', 'rejection_reason': request.data.get('rejection_reason', '')}, 
        context={'request': request},
        partial=True
    )
    
    if serializer.is_valid():
        approval_obj = serializer.save()
        
        # Cập nhật trạng thái của document hoặc request nếu cần
        if approval_obj.document:
            approval_obj.document.status = 'draft'
            approval_obj.document.save()
        
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsChairman])
def document_type_analysis(request):
    """API phân tích theo loại giấy tờ"""
    stats = DocumentType.objects.annotate(
        total_requests=Count('requests'),
        completed_requests=Count('requests', filter=Q(requests__status='completed')),
        pending_requests=Count('requests', filter=Q(requests__status__in=['submitted', 'in_review', 'approved', 'processing'])),
        total_documents=Count('documents'),
        avg_processing_days=Avg(
            timezone.models.ExpressionWrapper(
                timezone.models.F('requests__completed_date') - timezone.models.F('requests__submitted_date'),
                output_field=timezone.models.DurationField()
            ),
            filter=Q(requests__status='completed')
        )
    ).values(
        'id', 'name', 'code', 'total_requests', 'completed_requests', 
        'pending_requests', 'total_documents', 'avg_processing_days'
    )
    
    return Response(stats)
