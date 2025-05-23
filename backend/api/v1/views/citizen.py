from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.db.models import Count, Q
from apps.accounts.models import User
from apps.administrative.models import AdminRequest, Document, DocumentType
from apps.administrative.serializers import (
    DocumentSerializer
)
from api.v1.serializers.request_serializers import RequestSerializer, RequestDetailSerializer
from apps.feedback.models import Feedback
from apps.feedback.serializers import FeedbackSerializer
from utils.permissions import IsCitizen, IsOwnerOrAdmin
from django.shortcuts import get_object_or_404


class CitizenRequestViewSet(viewsets.ModelViewSet):
    """
    API endpoints cho quản lý yêu cầu giấy tờ của công dân
    """
    serializer_class = RequestSerializer
    permission_classes = [permissions.IsAuthenticated, IsCitizen]
    
    def get_queryset(self):
        # Công dân chỉ có thể xem các yêu cầu của chính họ
        return AdminRequest.objects.filter(citizen=self.request.user).order_by('-created_at')
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return RequestDetailSerializer
        return RequestSerializer
    
    def perform_create(self, serializer):
        serializer.save(citizen=self.request.user)
    
    def list(self, request, *args, **kwargs):
        """
        Custom list method to handle pagination, filtering, and sorting
        Also returns stats for different request statuses
        """
        user = request.user
        queryset = self.get_queryset()
        
        # Apply filters
        status_filter = request.query_params.get('status', None)
        search = request.query_params.get('search', None)
        
        if status_filter and status_filter != 'all':
            queryset = queryset.filter(status=status_filter)
            
        if search:
            queryset = queryset.filter(
                Q(request_id__icontains=search) | 
                Q(request_type__icontains=search) | 
                Q(description__icontains=search)
            )
        
        # Get request stats for UI 
        all_count = AdminRequest.objects.filter(citizen=user).count()
        pending_count = AdminRequest.objects.filter(citizen=user, status='pending').count()
        processing_count = AdminRequest.objects.filter(citizen=user, status='processing').count()
        completed_count = AdminRequest.objects.filter(citizen=user, status='completed').count()
        rejected_count = AdminRequest.objects.filter(citizen=user, status='rejected').count()
        
        stats = {
            'all': all_count,
            'pending': pending_count,
            'processing': processing_count,
            'completed': completed_count,
            'rejected': rejected_count
        }
        
        # Paginate results
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            response = self.get_paginated_response(serializer.data)
            response.data['stats'] = stats
            return response
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'results': serializer.data,
            'count': queryset.count(),
            'stats': stats
        })
    
    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel_request(self, request, pk=None):
        """
        Cancel a pending request
        """
        instance = self.get_object()
        
        # Only allow cancellation of pending requests
        if instance.status != 'pending':
            return Response(
                {'detail': 'Only pending requests can be cancelled.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update status to cancelled
        instance.status = 'cancelled'
        instance.updated_at = timezone.now()
        instance.save()
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class CitizenDocumentViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoints cho xem giấy tờ đã cấp của công dân
    """
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated, IsCitizen]
    
    def get_queryset(self):
        # Công dân chỉ có thể xem các giấy tờ của chính họ
        return Document.objects.filter(citizen=self.request.user).order_by('-created_at')
    
    @action(detail=True, methods=['get'], url_path='download')
    def download_document(self, request, pk=None):
        """
        Tải xuống giấy tờ
        """
        document = self.get_object()
        
        # Logic tải xuống giấy tờ sẽ được thêm ở đây
        
        return Response({'message': 'Chức năng tải xuống đang được phát triển'},
                      status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['get'], url_path='verify')
    def verify_document(self, request, pk=None):
        """
        Xác thực giấy tờ trên blockchain
        """
        document = self.get_object()
        
        # Logic xác thực giấy tờ trên blockchain sẽ được thêm ở đây
        
        return Response({
            'verified': document.blockchain_status,
            'blockchain_tx_id': document.blockchain_tx_id or 'Chưa có địa chỉ blockchain',
            'last_verified': document.blockchain_timestamp.isoformat() if document.blockchain_timestamp else 'Chưa được xác thực'
        })


class CitizenFeedbackViewSet(viewsets.ModelViewSet):
    """
    API endpoints cho quản lý phản hồi, góp ý của công dân
    """
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.IsAuthenticated, IsCitizen]
    
    def get_queryset(self):
        # Công dân chỉ có thể xem các phản hồi của chính họ
        return Feedback.objects.filter(submitter=self.request.user).order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(submitter=self.request.user)


class CitizenDashboardStatsView(viewsets.ViewSet):
    """
    API endpoint cho lấy thống kê dashboard của công dân
    """
    permission_classes = [permissions.IsAuthenticated, IsCitizen]
    
    def list(self, request):
        """
        Lấy thống kê tổng quan cho dashboard công dân
        """
        try:
            user = request.user
            
            # Lấy số lượng giấy tờ
            total_documents = Document.objects.filter(citizen=user).count()
            
            # Lấy số lượng yêu cầu theo trạng thái
            pending_requests = AdminRequest.objects.filter(
                citizen=user, 
                status='pending'
            ).count()
            
            processing_requests = AdminRequest.objects.filter(
                citizen=user,
                status='processing'
            ).count()
            
            completed_requests = AdminRequest.objects.filter(
                citizen=user,
                status='completed'
            ).count()
            
            rejected_requests = AdminRequest.objects.filter(
                citizen=user,
                status='rejected'
            ).count()
            
            # Lấy hoạt động gần đây (5 yêu cầu và 5 giấy tờ gần nhất)
            recent_requests = AdminRequest.objects.filter(citizen=user).order_by('-created_at')[:5]
            recent_documents = Document.objects.filter(citizen=user).order_by('-created_at')[:5]
            
            # Tạo danh sách hoạt động gần đây
            recent_activity = []
            
            # Thêm các yêu cầu gần đây
            for req in recent_requests:
                recent_activity.append({
                    'id': req.request_id,
                    'type': 'request',
                    'status': req.status,
                    'title': req.request_type,
                    'date': req.created_at.isoformat(),
                    'request_id': req.request_id,
                    'officer': f"{req.assigned_to.first_name} {req.assigned_to.last_name}" if req.assigned_to else None
                })
                
            # Thêm các giấy tờ gần đây
            for doc in recent_documents:
                recent_activity.append({
                    'id': str(doc.id),
                    'type': 'document',
                    'status': doc.status,
                    'title': doc.title,
                    'date': doc.created_at.isoformat(),
                    'document_id': doc.document_id,
                    'issued_by': f"{doc.issued_by.first_name} {doc.issued_by.last_name}" if doc.issued_by else None
                })
                
            # Sắp xếp theo thời gian gần nhất
            recent_activity.sort(key=lambda x: x['date'], reverse=True)
            
            # Phân tích số lượng giấy tờ đã được xác minh blockchain
            verified_documents = Document.objects.filter(citizen=user, blockchain_status=True).count()
            
            # Đếm số thông báo chưa đọc
            unread_notifications = 0
            try:
                from apps.notifications.models import Notification
                unread_notifications = Notification.objects.filter(user=user, is_read=False).count()
            except ImportError:
                pass
            
            # Phân bố loại giấy tờ
            document_type_distribution = Document.objects.filter(citizen=user).values('document_type').annotate(
                count=Count('id')
            ).order_by('-count')
            
            # Chuyển đổi document_type_distribution thành định dạng phù hợp
            document_distribution = []
            for item in document_type_distribution:
                doc_type = item['document_type']
                # Lấy tên loại giấy tờ từ choices hoặc từ DocumentType
                doc_type_name = doc_type
                for choice in Document.DOCUMENT_TYPE_CHOICES:
                    if choice[0] == doc_type:
                        doc_type_name = choice[1]
                        break
                
                document_distribution.append({
                    'type': doc_type,
                    'name': str(doc_type_name),
                    'count': item['count']
                })
            
            # Thống kê giấy tờ theo trạng thái
            document_status_stats = Document.objects.filter(citizen=user).values('status').annotate(
                count=Count('id')
            ).order_by('status')
            
            # Chuyển đổi document_status_stats thành định dạng phù hợp
            document_stats = []
            for item in document_status_stats:
                status = item['status']
                # Lấy tên trạng thái từ choices
                status_name = status
                for choice in Document.DOCUMENT_STATUS_CHOICES:
                    if choice[0] == status:
                        status_name = choice[1]
                        break
                
                document_stats.append({
                    'status': status,
                    'name': str(status_name),
                    'count': item['count']
                })
            
            # Trả về dữ liệu dashboard
            dashboard_data = {
                'user': {
                    'id': user.id,
                    'name': f"{user.first_name} {user.last_name}".strip(),
                    'email': user.email,
                    'phone': getattr(user, 'phone', ''),
                    'address': getattr(user, 'address', ''),
                    'last_login': user.last_login.isoformat() if user.last_login else None
                },
                'stats': {
                    'total_documents': total_documents,
                    'pending_requests': pending_requests,
                    'processing_requests': processing_requests,
                    'completed_requests': completed_requests,
                    'rejected_requests': rejected_requests,
                    'notifications': unread_notifications,
                    'verified_documents': verified_documents
                },
                'document_distribution': document_distribution,
                'document_stats': document_stats,
                'recent_activity': recent_activity[:5]  # Giới hạn 5 hoạt động gần nhất
            }
            
            return Response(dashboard_data)
        
        except Exception as e:
            # Log lỗi chi tiết để dễ debug
            import traceback
            print(f"Error fetching dashboard stats: {str(e)}")
            print(traceback.format_exc())
            
            # Dữ liệu mẫu khi có lỗi - nhưng vẫn trả về cấu trúc đúng format
            fallback_data = {
                'user': {
                    'id': user.id if 'user' in locals() else None,
                    'name': f"{user.first_name} {user.last_name}".strip() if 'user' in locals() else 'Công dân',
                    'email': user.email if 'user' in locals() else '',
                    'phone': getattr(user, 'phone', '') if 'user' in locals() else '',
                    'address': getattr(user, 'address', '') if 'user' in locals() else '',
                    'last_login': user.last_login.isoformat() if 'user' in locals() and user.last_login else None,
                },
                'stats': {
                    'total_documents': 0,
                    'pending_requests': 0,
                    'processing_requests': 0,
                    'completed_requests': 0,
                    'rejected_requests': 0,
                    'notifications': 0,
                    'verified_documents': 0
                },
                'document_distribution': [],
                'document_stats': [],
                'recent_activity': []
            }
            
            return Response(fallback_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
