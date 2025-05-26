from rest_framework import serializers
from ..models import User, Profile
from apps.administrative.models import Document, AdminRequest
from apps.feedback.models import Feedback
from django.utils import timezone

# ... Các serializer hiện có ...

class CitizenDashboardStatsSerializer(serializers.Serializer):
    """Serializer cho thống kê dashboard của citizen"""
    user = serializers.SerializerMethodField()
    stats = serializers.SerializerMethodField()
    recent_activity = serializers.SerializerMethodField()
    
    def get_user(self, obj):
        user = self.context['request'].user
        return {
            'name': f"{user.first_name} {user.last_name}".strip() or user.email,
            'last_login': user.last_login.isoformat() if user.last_login else None
        }
    
    def get_stats(self, obj):
        user = self.context['request'].user
        
        # Lấy thống kê từ database
        total_documents = Document.objects.filter(issued_to=user).count()
        pending_requests = AdminRequest.objects.filter(requestor=user, status='pending').count()
        completed_requests = AdminRequest.objects.filter(requestor=user, status='completed').count()
        
        return {
            'totalDocuments': total_documents,
            'pendingRequests': pending_requests,
            'completedRequests': completed_requests,
            'notifications': 0  # Có thể thêm logic thông báo sau
        }
    
    def get_recent_activity(self, obj):
        user = self.context['request'].user
        
        # Lấy các yêu cầu gần đây
        recent_requests = AdminRequest.objects.filter(requestor=user).order_by('-created_at')[:5]
        recent_documents = Document.objects.filter(issued_to=user).order_by('-created_at')[:5]
        
        activities = []
        
        # Thêm yêu cầu vào hoạt động
        for request in recent_requests:
            activities.append({
                'id': f"req_{request.id}",
                'type': 'request',
                'status': request.status,
                'title': request.title or f"Yêu cầu {request.request_type}",
                'date': request.created_at.isoformat()
            })
        
        # Thêm tài liệu vào hoạt động
        for document in recent_documents:
            activities.append({
                'id': f"doc_{document.id}",
                'type': 'document',
                'status': 'completed',
                'title': document.title or f"Giấy tờ {document.document_type}",
                'date': document.created_at.isoformat()
            })
        
        # Sắp xếp theo thời gian gần đây nhất
        activities.sort(key=lambda x: x['date'], reverse=True)
        
        return activities[:5]  # Trả về 5 hoạt động gần đây nhất 