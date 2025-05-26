from rest_framework import serializers
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta
from apps.accounts.models import User
from apps.administrative.models import Document
from apps.administrative.models import AdminRequest
from apps.administrative.models.activity import Activity

class CitizenDashboardSerializer(serializers.Serializer):
    user = serializers.SerializerMethodField()
    stats = serializers.SerializerMethodField()
    recent_activity = serializers.SerializerMethodField()
    
    def get_user(self, obj):
        user = self.context['request'].user
        return {
            'id': user.id,
            'name': f"{user.first_name} {user.last_name}".strip(),
            'email': user.email,
            'phone': user.phone,
            'address': user.address,
            'last_login': user.last_login
        }
    
    def get_stats(self, obj):
        user = self.context['request'].user
        return {
            'total_documents': Document.objects.filter(issued_to=user).count(),
            'pending_requests': AdminRequest.objects.filter(requestor=user, status__in=['pending', 'submitted']).count(),
            'completed_requests': AdminRequest.objects.filter(requestor=user, status__in=['completed', 'approved']).count(),
            'notifications': Activity.objects.filter(user=user, is_read=False).count(),
            'verified_documents': Document.objects.filter(issued_to=user, is_verified=True).count(),
            'rejected_requests': AdminRequest.objects.filter(requestor=user, status='rejected').count()
        }
    
    def get_recent_activity(self, obj):
        user = self.context['request'].user
        activities = []
        
        # Lấy requests gần đây
        requests = AdminRequest.objects.filter(requestor=user).order_by('-created_at')[:3]
        for req in requests:
            activities.append({
                'id': req.id,
                'type': 'request',
                'status': req.status,
                'title': req.title,
                'date': req.created_at,
                'request_id': req.id,
                'officer': f"{req.officer.first_name} {req.officer.last_name}" if req.officer else None
            })
        
        # Lấy documents gần đây
        documents = Document.objects.filter(issued_to=user).order_by('-created_at')[:3]
        for doc in documents:
            activities.append({
                'id': doc.id,
                'type': 'document',
                'status': doc.status,
                'title': doc.title,
                'date': doc.created_at,
                'document_id': doc.id,
                'issued_by': doc.issued_by
            })
        
        # Sắp xếp theo thời gian gần nhất
        activities.sort(key=lambda x: x['date'], reverse=True)
        return activities[:5]  # Trả về 5 hoạt động gần nhất

class OfficerDashboardSerializer(serializers.Serializer):
    stats = serializers.SerializerMethodField()
    pending_requests = serializers.SerializerMethodField()
    completed_requests = serializers.SerializerMethodField()
    recent_citizens = serializers.SerializerMethodField()
    
    def get_stats(self, obj):
        user = self.context['request'].user
        
        # Get assigned requests
        assigned_requests = AdminRequest.objects.filter(assigned_officer=user)
        
        # Get pending requests (either assigned to this officer or not assigned yet)
        pending_requests = AdminRequest.objects.filter(
            Q(assigned_officer=user) | Q(assigned_officer=None),
            status__in=['submitted', 'in_review', 'processing']
        )
        
        # Get completed requests by this officer
        completed_requests = AdminRequest.objects.filter(
            assigned_officer=user,
            status__in=['completed', 'approved']
        )
        
        return {
            'total_requests': assigned_requests.count(),
            'pending_requests': pending_requests.count(),
            'completed_requests': completed_requests.count(),
            'total_citizens': User.objects.filter(roles__name='citizen').count(),
            'total_documents': Document.objects.filter(issued_by=user).count()
        }
    
    def get_pending_requests(self, obj):
        user = self.context['request'].user
        
        # Get pending requests (either assigned to this officer or not assigned yet)
        requests = AdminRequest.objects.filter(
            Q(assigned_officer=user) | Q(assigned_officer=None),
            status__in=['submitted', 'in_review', 'processing']
        ).order_by('-created_at')[:5]
        
        result = []
        for req in requests:
            # Calculate deadline (7 days from creation)
            deadline = req.created_at + timedelta(days=7)
            
            # Determine priority
            priority = 'high' if req.notes and 'urgent' in req.notes.lower() else 'normal'
            
            result.append({
                'id': str(req.id),
                'type': req.request_type,
                'status': req.status,
                'title': req.title,
                'submittedDate': req.created_at.isoformat(),
                'deadline': deadline.isoformat(),
                'priority': priority,
                'citizen': {
                    'id': str(req.requestor.id),
                    'name': f"{req.requestor.first_name} {req.requestor.last_name}".strip(),
                    'phone': getattr(req.requestor.profile, 'phone_number', 'N/A') if hasattr(req.requestor, 'profile') else 'N/A'
                }
            })
        return result
    
    def get_completed_requests(self, obj):
        user = self.context['request'].user
        
        # Get completed requests by this officer
        requests = AdminRequest.objects.filter(
            assigned_officer=user,
            status__in=['completed', 'approved', 'rejected']
        ).order_by('-updated_at')[:5]
        
        result = []
        for req in requests:
            # Determine priority
            priority = 'high' if req.notes and 'urgent' in req.notes.lower() else 'normal'
            
            result.append({
                'id': str(req.id),
                'type': req.request_type,
                'status': req.status,
                'title': req.title,
                'submittedDate': req.created_at.isoformat(),
                'completedDate': req.updated_at.isoformat() if req.updated_at else None,
                'priority': priority,
                'citizen': {
                    'id': str(req.requestor.id),
                    'name': f"{req.requestor.first_name} {req.requestor.last_name}".strip()
                },
                'rejectReason': req.rejection_reason if req.status == 'rejected' else None
            })
        return result
    
    def get_recent_citizens(self, obj):
        # Get recent citizens
        citizens = User.objects.filter(roles__name='citizen').order_by('-date_joined')[:5]
        
        result = []
        for citizen in citizens:
            # Get latest request from citizen
            latest_request = AdminRequest.objects.filter(requestor=citizen).order_by('-created_at').first()
            
            # Count total requests from citizen
            request_count = AdminRequest.objects.filter(requestor=citizen).count()
            
            result.append({
                'id': str(citizen.id),
                'name': f"{citizen.first_name} {citizen.last_name}".strip(),
                'email': citizen.email,
                'phone': getattr(citizen.profile, 'phone_number', 'N/A') if hasattr(citizen, 'profile') else 'N/A',
                'status': 'active',  # Assuming all citizens are active
                'lastRequest': latest_request.created_at.isoformat() if latest_request else None,
                'totalRequests': request_count
            })
        return result

class ChairmanDashboardSerializer(serializers.Serializer):
    summary_stats = serializers.SerializerMethodField()
    pending_approvals = serializers.SerializerMethodField()
    officer_stats = serializers.SerializerMethodField()
    document_type_stats = serializers.SerializerMethodField()
    time_stats = serializers.SerializerMethodField()
    
    def get_summary_stats(self, obj):
        return {
            'total_officers': User.objects.filter(roles__name='officer').count(),
            'pending_approvals': AdminRequest.objects.filter(
                status='pending',
                needs_chairman_approval=True
            ).count(),
            'total_citizens': User.objects.filter(roles__name='citizen').count(),
            'approved_documents': Document.objects.filter(status='approved').count(),
            'pending_documents': Document.objects.filter(status='pending').count(),
            'pending_requests': AdminRequest.objects.filter(status='pending').count(),
            'completed_requests': AdminRequest.objects.filter(status__in=['completed', 'approved']).count(),
            'rejected_requests': AdminRequest.objects.filter(status='rejected').count(),
            'avg_processing_time': 3  # Giả định, trong thực tế sẽ tính toán từ dữ liệu
        }
    
    def get_pending_approvals(self, obj):
        # Lấy các yêu cầu chờ chủ tịch phê duyệt
        approvals = AdminRequest.objects.filter(
            status='pending',
            needs_chairman_approval=True
        ).order_by('-created_at')[:5]
        
        result = []
        for approval in approvals:
            result.append({
                'id': approval.id,
                'title': approval.title,
                'type': 'document' if hasattr(approval, 'document') else 'request',
                'requested_by': f"{approval.assigned_officer.first_name} {approval.assigned_officer.last_name}".strip() if approval.assigned_officer else 'Hệ thống',
                'requested_at': approval.created_at,
                'priority': approval.priority,
                'document_id': getattr(approval, 'document_id', None),
                'request_id': approval.id
            })
        return result
    
    def get_officer_stats(self, obj):
        # Lấy thống kê về cán bộ
        officers = User.objects.filter(roles__name='officer')
        
        result = []
        for officer in officers[:5]:  # Chỉ lấy 5 cán bộ
            total_requests = AdminRequest.objects.filter(assigned_officer=officer).count()
            completed_requests = AdminRequest.objects.filter(
                assigned_officer=officer,
                status__in=['completed', 'approved']
            ).count()
            
            completion_rate = 0
            if total_requests > 0:
                completion_rate = (completed_requests / total_requests) * 100
            
            result.append({
                'id': officer.id,
                'name': f"{officer.first_name} {officer.last_name}".strip(),
                'position': 'Cán bộ xã',
                'completed_requests': completed_requests,
                'total_requests': total_requests,
                'created_documents': Document.objects.filter(issued_by=officer).count(),
                'completion_rate': completion_rate
            })
        return result
    
    def get_document_type_stats(self, obj):
        # Lấy thống kê theo loại giấy tờ
        # Trong thực tế sẽ cần có model DocumentType
        return [
            {
                'id': 1,
                'name': 'Giấy khai sinh',
                'total_count': 25,
                'approved_count': 20,
                'approval_rate': 80
            },
            {
                'id': 2,
                'name': 'Giấy chứng nhận kết hôn',
                'total_count': 15,
                'approved_count': 12,
                'approval_rate': 80
            },
            {
                'id': 3,
                'name': 'Giấy xác nhận tạm trú',
                'total_count': 30,
                'approved_count': 28,
                'approval_rate': 93.33
            }
        ]
    
    def get_time_stats(self, obj):
        # Thống kê theo thời gian (30 ngày gần đây)
        stats = []
        today = timezone.now().date()
        
        for i in range(29, -1, -1):
            date = today - timedelta(days=i)
            
            # Đếm số yêu cầu và giấy tờ trong ngày
            requests_count = AdminRequest.objects.filter(
                created_at__date=date
            ).count()
            
            documents_count = Document.objects.filter(
                created_at__date=date
            ).count()
            
            stats.append({
                'date': date.strftime('%Y-%m-%d'),
                'requests': requests_count,
                'documents': documents_count
            })
        
        return stats 