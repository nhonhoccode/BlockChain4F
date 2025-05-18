from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Count, Q, Avg, Sum
from django.utils import timezone
from datetime import datetime, timedelta
from apps.accounts.models import User, Role
from apps.accounts.serializers import UserSerializer
from apps.administrative.models import Document, Approval, Request, DocumentType
from apps.administrative.serializers import DocumentSerializer, ApprovalSerializer
from apps.officer_management.models import OfficerRequest, OfficerApproval, OfficerAssignment
from apps.officer_management.serializers import (
    OfficerRequestSerializer, OfficerApprovalSerializer, 
    OfficerAssignmentSerializer, OfficerAssignmentCreateSerializer
)
from utils.permissions import IsChairman


class ChairmanOfficerRequestViewSet(viewsets.ModelViewSet):
    """
    API endpoints cho quản lý yêu cầu đăng ký làm cán bộ xã
    """
    serializer_class = OfficerRequestSerializer
    permission_classes = [permissions.IsAuthenticated, IsChairman]
    
    def get_queryset(self):
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            return OfficerRequest.objects.filter(status=status_filter).order_by('-submitted_date')
        return OfficerRequest.objects.all().order_by('-submitted_date')
    
    @action(detail=True, methods=['post'], url_path='approve')
    def approve_request(self, request, pk=None):
        """
        Phê duyệt yêu cầu đăng ký làm cán bộ
        """
        officer_request = self.get_object()
        notes = request.data.get('notes', '')
        
        # Kiểm tra xem yêu cầu đã được xử lý chưa
        if officer_request.status != 'pending':
            return Response({
                'error': 'Yêu cầu này đã được xử lý'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Cập nhật trạng thái yêu cầu
        officer_request.status = 'approved'
        officer_request.save()
        
        # Tạo bản ghi phê duyệt
        approval = OfficerApproval.objects.create(
            officer_request=officer_request,
            approved_by=request.user,
            status='approved',
            notes=notes
        )
        
        # Cập nhật vai trò cho người dùng
        user = officer_request.user
        officer_role = get_object_or_404(Role, name=Role.OFFICER)
        user.roles.add(officer_role)
        
        # Cập nhật thông tin hồ sơ
        profile = user.profile
        profile.position = officer_request.position
        profile.save()
        
        return Response({
            'message': 'Yêu cầu đã được phê duyệt thành công',
            'officer_request_id': officer_request.id
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], url_path='reject')
    def reject_request(self, request, pk=None):
        """
        Từ chối yêu cầu đăng ký làm cán bộ
        """
        officer_request = self.get_object()
        reason = request.data.get('reason', 'Không đủ điều kiện')
        notes = request.data.get('notes', '')
        
        # Kiểm tra xem yêu cầu đã được xử lý chưa
        if officer_request.status != 'pending':
            return Response({
                'error': 'Yêu cầu này đã được xử lý'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Cập nhật trạng thái yêu cầu
        officer_request.status = 'rejected'
        officer_request.save()
        
        # Tạo bản ghi từ chối
        approval = OfficerApproval.objects.create(
            officer_request=officer_request,
            approved_by=request.user,
            status='rejected',
            notes=notes,
            rejection_reason=reason
        )
        
        return Response({
            'message': 'Yêu cầu đã bị từ chối',
            'officer_request_id': officer_request.id,
            'reason': reason
        }, status=status.HTTP_200_OK)


class ChairmanOfficerViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoints cho quản lý cán bộ xã
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsChairman]
    
    def get_queryset(self):
        return User.objects.filter(roles__name=Role.OFFICER).order_by('last_name', 'first_name')
    
    @action(detail=True, methods=['post'], url_path='assign-task')
    def assign_task(self, request, pk=None):
        """
        Gán nhiệm vụ cho cán bộ
        """
        officer = self.get_object()
        serializer = OfficerAssignmentCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(
                officer=officer,
                assigned_by=request.user
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'], url_path='assignments')
    def get_assignments(self, request, pk=None):
        """
        Lấy danh sách nhiệm vụ của cán bộ
        """
        officer = self.get_object()
        assignments = OfficerAssignment.objects.filter(officer=officer).order_by('-created_at')
        serializer = OfficerAssignmentSerializer(assignments, many=True)
        
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'], url_path='statistics')
    def get_statistics(self, request, pk=None):
        """
        Lấy thống kê về công việc của cán bộ
        """
        officer = self.get_object()
        
        # Tổng số yêu cầu đã xử lý
        total_requests = Request.objects.filter(assigned_to=officer).count()
        completed_requests = Request.objects.filter(assigned_to=officer, status='completed').count()
        pending_requests = Request.objects.filter(assigned_to=officer, status='processing').count()
        
        # Tổng số giấy tờ đã tạo
        total_documents = Document.objects.filter(created_by=officer).count()
        
        return Response({
            'total_requests': total_requests,
            'completed_requests': completed_requests,
            'pending_requests': pending_requests,
            'total_documents': total_documents,
            'completion_rate': (completed_requests / total_requests * 100) if total_requests > 0 else 0
        })


class ChairmanDocumentApprovalViewSet(viewsets.ModelViewSet):
    """
    API endpoints cho quản lý phê duyệt giấy tờ quan trọng
    """
    serializer_class = ApprovalSerializer
    permission_classes = [permissions.IsAuthenticated, IsChairman]
    
    def get_queryset(self):
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            return Approval.objects.filter(status=status_filter).order_by('-created_at')
        return Approval.objects.all().order_by('-created_at')
    
    @action(detail=True, methods=['post'], url_path='approve')
    def approve_document(self, request, pk=None):
        """
        Phê duyệt giấy tờ
        """
        approval = self.get_object()
        notes = request.data.get('notes', '')
        
        # Kiểm tra xem yêu cầu đã được xử lý chưa
        if approval.status != 'pending':
            return Response({
                'error': 'Giấy tờ này đã được phê duyệt hoặc từ chối'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Cập nhật trạng thái phê duyệt
        approval.status = 'approved'
        approval.notes = notes
        approval.approved_by = request.user
        approval.save()
        
        # Cập nhật trạng thái giấy tờ
        document = approval.document
        document.status = 'approved'
        document.save()
        
        return Response({
            'message': 'Giấy tờ đã được phê duyệt thành công',
            'document_id': document.id
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], url_path='reject')
    def reject_document(self, request, pk=None):
        """
        Từ chối phê duyệt giấy tờ
        """
        approval = self.get_object()
        reason = request.data.get('reason', 'Không đủ điều kiện')
        notes = request.data.get('notes', '')
        
        # Kiểm tra xem yêu cầu đã được xử lý chưa
        if approval.status != 'pending':
            return Response({
                'error': 'Giấy tờ này đã được phê duyệt hoặc từ chối'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Cập nhật trạng thái phê duyệt
        approval.status = 'rejected'
        approval.notes = notes
        approval.rejection_reason = reason
        approval.approved_by = request.user
        approval.save()
        
        # Cập nhật trạng thái giấy tờ
        document = approval.document
        document.status = 'rejected'
        document.save()
        
        return Response({
            'message': 'Giấy tờ đã bị từ chối phê duyệt',
            'document_id': document.id,
            'reason': reason
        }, status=status.HTTP_200_OK)


class ChairmanDashboardStatsView(viewsets.ViewSet):
    """
    API endpoint cho lấy thống kê dashboard của chủ tịch xã
    """
    permission_classes = [permissions.IsAuthenticated, IsChairman]
    
    def list(self, request):
        """
        Lấy thống kê tổng quan cho dashboard chủ tịch xã
        """
        try:
            user = request.user
            print(f"Fetching dashboard stats for chairman: {user.email}")
            
            # Thống kê tổng quan
            # Lấy số lượng cán bộ xã, công dân
            total_officers = User.objects.filter(roles__name='officer').count()
            total_citizens = User.objects.filter(roles__name='citizen').count()
            
            # Thống kê yêu cầu
            total_requests = Request.objects.count()
            pending_requests = Request.objects.filter(status__in=['submitted', 'in_review', 'processing']).count()
            completed_requests = Request.objects.filter(status__in=['completed', 'approved']).count()
            rejected_requests = Request.objects.filter(status='rejected').count()
            
            # Thống kê giấy tờ
            total_documents = Document.objects.count()
            pending_documents = Document.objects.filter(status__in=['draft', 'pending']).count()
            approved_documents = Document.objects.filter(status='approved').count()
            
            # Thống kê phê duyệt
            pending_approvals = Approval.objects.filter(status='pending').count()
            
            # Hiệu suất xử lý yêu cầu
            thirty_days_ago = timezone.now() - timedelta(days=30)
            
            # Tính thời gian xử lý trung bình (từ khi gửi đến khi hoàn thành)
            completed_in_timeframe = Request.objects.filter(
                status='completed',
                submitted_date__gte=thirty_days_ago
            )
            
            avg_processing_time = 0
            completed_count = completed_in_timeframe.count()
            
            if completed_count > 0:
                total_processing_time = sum(
                    (req.completed_date - req.submitted_date).total_seconds() / 86400  # Chuyển đổi thành ngày
                    for req in completed_in_timeframe if req.completed_date and req.submitted_date
                )
                avg_processing_time = round(total_processing_time / completed_count, 1)
            
            # Các yêu cầu cần phê duyệt
            approval_requests = Approval.objects.filter(status='pending').order_by('-created_at')[:5]
            pending_approval_data = []
            
            for approval in approval_requests:
                approval_data = {
                    'id': str(approval.id),
                    'title': approval.title,
                    'type': 'document' if approval.document else 'request',
                    'requested_by': f"{approval.requested_by.first_name} {approval.requested_by.last_name}".strip() if approval.requested_by else 'Unknown',
                    'requested_at': approval.requested_at.isoformat() if approval.requested_at else None,
                    'priority': approval.priority,
                    'document_id': str(approval.document.id) if approval.document else None,
                    'request_id': str(approval.request.id) if approval.request else None
                }
                pending_approval_data.append(approval_data)
            
            # Lấy thống kê hoạt động cán bộ xã
            officers = User.objects.filter(roles__name='officer').order_by('-date_joined')[:5]
            officer_stats_data = []
            
            for officer in officers:
                # Tính số yêu cầu đã xử lý và giấy tờ đã tạo
                officer_requests = Request.objects.filter(assigned_to=officer)
                officer_completed_requests = officer_requests.filter(status='completed').count()
                officer_total_requests = officer_requests.count()
                officer_documents = Document.objects.filter(created_by=officer).count()
                
                completion_rate = 0
                if officer_total_requests > 0:
                    completion_rate = round((officer_completed_requests / officer_total_requests) * 100, 1)
                
                officer_data = {
                    'id': str(officer.id),
                    'name': f"{officer.first_name} {officer.last_name}".strip(),
                    'email': officer.email,
                    'position': getattr(officer.profile, 'position', 'Cán bộ xã') if hasattr(officer, 'profile') else 'Cán bộ xã',
                    'completed_requests': officer_completed_requests,
                    'total_requests': officer_total_requests,
                    'created_documents': officer_documents,
                    'completion_rate': completion_rate
                }
                officer_stats_data.append(officer_data)
            
            # Thống kê theo loại giấy tờ
            document_types = DocumentType.objects.all()
            document_type_stats = []
            
            for doc_type in document_types:
                type_documents = Document.objects.filter(document_type=doc_type)
                type_approved = type_documents.filter(status='approved').count()
                type_total = type_documents.count()
                
                document_type_stats.append({
                    'id': str(doc_type.id),
                    'name': doc_type.name,
                    'total_count': type_total,
                    'approved_count': type_approved,
                    'approval_rate': round((type_approved / type_total) * 100, 1) if type_total > 0 else 0
                })
            
            # Thống kê theo thời gian (7 ngày gần nhất)
            days = 7
            time_stats = []
            
            for i in range(days):
                date = timezone.now().date() - timedelta(days=i)
                date_requests = Request.objects.filter(created_at__date=date).count()
                date_documents = Document.objects.filter(created_at__date=date).count()
                
                time_stats.append({
                    'date': date.isoformat(),
                    'requests': date_requests,
                    'documents': date_documents,
                    'total': date_requests + date_documents
                })
            
            time_stats.reverse()  # Để hiển thị theo thứ tự tăng dần
            
            # Tạo response
            response_data = {
                'summary_stats': {
                    'total_officers': total_officers,
                    'total_citizens': total_citizens,
                    'total_requests': total_requests,
                    'pending_requests': pending_requests,
                    'completed_requests': completed_requests,
                    'rejected_requests': rejected_requests,
                    'total_documents': total_documents,
                    'pending_documents': pending_documents,
                    'approved_documents': approved_documents,
                    'pending_approvals': pending_approvals,
                    'avg_processing_time': avg_processing_time  # Thời gian xử lý trung bình (ngày)
                },
                'pending_approvals': pending_approval_data,
                'officer_stats': officer_stats_data,
                'document_type_stats': document_type_stats,
                'time_stats': time_stats
            }
            
            print(f"Response data prepared for chairman dashboard")
            return Response(response_data)
            
        except Exception as e:
            print(f"Error in chairman dashboard stats: {str(e)}")
            return Response({
                'error': f'Lỗi khi lấy thống kê: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
