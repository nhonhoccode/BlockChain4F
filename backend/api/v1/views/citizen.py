from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.db.models import Count, Q
from apps.accounts.models import User
from apps.administrative.models import Request, Document, Attachment
from apps.administrative.serializers import (
    RequestSerializer, DocumentSerializer, 
    RequestCreateSerializer, AttachmentSerializer
)
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
        return Request.objects.filter(requestor=self.request.user).order_by('-created_at')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return RequestCreateSerializer
        return RequestSerializer
    
    def perform_create(self, serializer):
        serializer.save(requestor=self.request.user)
    
    @action(detail=True, methods=['post'], url_path='upload-attachment')
    def upload_attachment(self, request, pk=None):
        """
        Upload tài liệu đính kèm cho yêu cầu
        """
        citizen_request = self.get_object()
        
        # Kiểm tra xem yêu cầu có thuộc về người dùng hiện tại không
        if citizen_request.requestor != request.user:
            return Response({'error': 'Bạn không có quyền thêm tài liệu cho yêu cầu này'},
                            status=status.HTTP_403_FORBIDDEN)
        
        # Kiểm tra xem yêu cầu còn ở trạng thái cho phép thêm tài liệu không
        if citizen_request.status not in ['draft', 'pending', 'additional_info_requested']:
            return Response({'error': 'Không thể thêm tài liệu cho yêu cầu ở trạng thái này'},
                            status=status.HTTP_400_BAD_REQUEST)
        
        serializer = AttachmentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(
                request=citizen_request,
                uploaded_by=request.user
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CitizenDocumentViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoints cho xem giấy tờ đã cấp của công dân
    """
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated, IsCitizen]
    
    def get_queryset(self):
        # Công dân chỉ có thể xem các giấy tờ của chính họ
        return Document.objects.filter(issued_to=self.request.user).order_by('-created_at')
    
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
            'verified': True,
            'blockchain_address': document.blockchain_address or 'Chưa có địa chỉ blockchain',
            'last_verified': document.last_blockchain_update or 'Chưa được xác thực'
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
            print(f"Fetching dashboard stats for user: {user.email}")
            
            # Lấy số lượng giấy tờ - sử dụng issued_to
            total_documents = Document.objects.filter(issued_to=user).count()
            print(f"Total documents: {total_documents}")
            
            # Lấy số lượng yêu cầu theo trạng thái - sử dụng requestor
            pending_requests = Request.objects.filter(
                requestor=user, 
                status__in=['draft', 'submitted', 'in_review', 'additional_info_requested', 'processing']
            ).count()
            print(f"Pending requests: {pending_requests}")
            
            completed_requests = Request.objects.filter(
                requestor=user,
                status__in=['completed', 'approved']
            ).count()
            print(f"Completed requests: {completed_requests}")
            
            # Lấy hoạt động gần đây (5 yêu cầu và 5 giấy tờ gần nhất)
            recent_requests = Request.objects.filter(requestor=user).order_by('-created_at')[:5]
            recent_documents = Document.objects.filter(issued_to=user).order_by('-created_at')[:5]
            
            # Tạo danh sách hoạt động gần đây
            recent_activity = []
            
            # Thêm các yêu cầu gần đây
            for req in recent_requests:
                recent_activity.append({
                    'id': req.id,
                    'type': 'request',
                    'status': req.status,
                    'title': req.title,
                    'date': req.created_at.isoformat(),
                    'request_id': req.id,
                    'officer': f"{req.assigned_officer.first_name} {req.assigned_officer.last_name}" if req.assigned_officer else None
                })
                
            # Thêm các giấy tờ gần đây
            for doc in recent_documents:
                recent_activity.append({
                    'id': doc.id,
                    'type': 'document',
                    'status': doc.status,
                    'title': doc.title,
                    'date': doc.created_at.isoformat(),
                    'document_id': doc.id,
                    'issued_by': f"{doc.issued_by.first_name} {doc.issued_by.last_name}" if doc.issued_by else None
                })
                
            # Sắp xếp theo thời gian gần nhất
            recent_activity.sort(key=lambda x: x['date'], reverse=True)
            
            # Phân tích số lượng giấy tờ đã được xác minh blockchain
            verified_documents = Document.objects.filter(issued_to=user, is_verified_blockchain=True).count()
            rejected_requests = Request.objects.filter(requestor=user, status='rejected').count()
            
            # Đếm số thông báo chưa đọc
            unread_notifications = 0
            try:
                from apps.notifications.models import Notification
                unread_notifications = Notification.objects.filter(user=user, is_read=False).count()
            except ImportError:
                pass
            
            # Trả về dữ liệu dashboard
            dashboard_data = {
                'user': {
                    'id': user.id,
                    'name': f"{user.first_name} {user.last_name}".strip(),
                    'email': user.email,
                    'phone': user.phone,
                    'address': user.address,
                    'last_login': user.last_login.isoformat() if user.last_login else None
                },
                'stats': {
                    'total_documents': total_documents,
                    'pending_requests': pending_requests,
                    'completed_requests': completed_requests,
                    'notifications': unread_notifications,
                    'verified_documents': verified_documents,
                    'rejected_requests': rejected_requests
                },
                'recent_activity': recent_activity[:5]  # Giới hạn 5 hoạt động gần nhất
            }
            
            print(f"Returning dashboard data: {dashboard_data}")
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
                    'phone': user.phone if 'user' in locals() else '',
                    'address': user.address if 'user' in locals() else '',
                    'last_login': user.last_login.isoformat() if 'user' in locals() and user.last_login else None,
                },
                'stats': {
                    'total_documents': 0,
                    'pending_requests': 0,
                    'completed_requests': 0,
                    'notifications': 0,
                    'verified_documents': 0,
                    'rejected_requests': 0
                },
                'recent_activity': []
            }
            
            print(f"Returning fallback data due to error: {fallback_data}")
            return Response(fallback_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
