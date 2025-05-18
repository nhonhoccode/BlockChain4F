from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count
from django.utils import timezone
from datetime import timedelta
from apps.accounts.models import User
from apps.accounts.serializers import UserSerializer
from apps.administrative.models import Request, Document, DocumentType, Attachment
from apps.administrative.serializers import (
    RequestSerializer, RequestDetailSerializer, DocumentSerializer, 
    DocumentCreateSerializer, DocumentTypeSerializer
)
from utils.permissions import IsOfficer, IsOwnerOrAdmin


class OfficerRequestViewSet(viewsets.ModelViewSet):
    """
    API endpoints cho quản lý yêu cầu giấy tờ dành cho cán bộ xã
    """
    serializer_class = RequestSerializer
    permission_classes = [permissions.IsAuthenticated, IsOfficer]
    
    def get_queryset(self):
        # Cán bộ có thể xem tất cả các yêu cầu hoặc các yêu cầu được gán cho họ
        officer_assigned = self.request.query_params.get('assigned', None)
        
        if officer_assigned == 'true':
            return Request.objects.filter(assigned_to=self.request.user).order_by('-created_at')
        elif officer_assigned == 'false':
            return Request.objects.filter(assigned_to=None).order_by('-created_at')
        else:
            return Request.objects.all().order_by('-created_at')
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return RequestDetailSerializer
        return RequestSerializer
    
    @action(detail=True, methods=['post'], url_path='assign')
    def assign_request(self, request, pk=None):
        """
        Gán yêu cầu cho cán bộ xử lý
        """
        req = self.get_object()
        req.assigned_to = request.user
        req.status = 'processing'
        req.save()
        
        return Response({
            'message': 'Yêu cầu đã được gán cho bạn xử lý',
            'request_id': req.id
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], url_path='complete')
    def complete_request(self, request, pk=None):
        """
        Hoàn thành xử lý yêu cầu
        """
        req = self.get_object()
        
        # Kiểm tra xem yêu cầu có được gán cho cán bộ này không
        if req.assigned_to != request.user:
            return Response({
                'error': 'Bạn không được gán xử lý yêu cầu này'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Hoàn thành yêu cầu
        req.status = 'completed'
        req.save()
        
        return Response({
            'message': 'Yêu cầu đã được hoàn thành',
            'request_id': req.id
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], url_path='reject')
    def reject_request(self, request, pk=None):
        """
        Từ chối xử lý yêu cầu
        """
        req = self.get_object()
        reason = request.data.get('reason', 'Không đủ điều kiện')
        
        # Kiểm tra xem yêu cầu có được gán cho cán bộ này không
        if req.assigned_to != request.user:
            return Response({
                'error': 'Bạn không được gán xử lý yêu cầu này'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Từ chối yêu cầu
        req.status = 'rejected'
        req.rejection_reason = reason
        req.save()
        
        return Response({
            'message': 'Yêu cầu đã bị từ chối',
            'request_id': req.id,
            'reason': reason
        }, status=status.HTTP_200_OK)


class OfficerDocumentViewSet(viewsets.ModelViewSet):
    """
    API endpoints cho quản lý giấy tờ dành cho cán bộ xã
    """
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated, IsOfficer]
    
    def get_queryset(self):
        return Document.objects.all().order_by('-created_at')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return DocumentCreateSerializer
        return DocumentSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class OfficerDocumentTypeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoints cho xem các loại giấy tờ
    """
    queryset = DocumentType.objects.all()
    serializer_class = DocumentTypeSerializer
    permission_classes = [permissions.IsAuthenticated, IsOfficer]


class OfficerCitizenViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoints cho xem thông tin công dân
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsOfficer]
    
    def get_queryset(self):
        return User.objects.filter(roles__name='citizen').order_by('last_name', 'first_name')
    
    @action(detail=True, methods=['get'], url_path='documents')
    def get_citizen_documents(self, request, pk=None):
        """
        Lấy danh sách giấy tờ của công dân
        """
        citizen = self.get_object()
        documents = Document.objects.filter(issued_to=citizen).order_by('-created_at')
        serializer = DocumentSerializer(documents, many=True)
        
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'], url_path='requests')
    def get_citizen_requests(self, request, pk=None):
        """
        Lấy danh sách yêu cầu của công dân
        """
        citizen = self.get_object()
        requests = Request.objects.filter(requestor=citizen).order_by('-created_at')
        serializer = RequestSerializer(requests, many=True)
        
        return Response(serializer.data)


class OfficerDashboardStatsView(viewsets.ViewSet):
    """
    API endpoint cho lấy thống kê dashboard của cán bộ xã
    """
    permission_classes = [permissions.IsAuthenticated, IsOfficer]
    
    def list(self, request):
        """
        Lấy thống kê tổng quan cho dashboard cán bộ xã
        """
        try:
            user = request.user
            print(f"Fetching dashboard stats for officer: {user.email}")
            
            # Lấy số lượng yêu cầu theo trạng thái
            pending_requests = Request.objects.filter(
                Q(assigned_to=user) | Q(assigned_to=None),
                status__in=['submitted', 'in_review', 'processing']
            ).count()
            
            completed_requests = Request.objects.filter(
                assigned_to=user,
                status__in=['completed', 'approved']
            ).count()
            
            # Lấy tổng số công dân đã đăng ký
            total_citizens = User.objects.filter(roles__name='citizen').count()
            
            # Lấy tổng số giấy tờ đã cấp
            total_documents = Document.objects.filter(created_by=user).count()
            
            # Lấy danh sách yêu cầu đang chờ xử lý
            pending_request_list = Request.objects.filter(
                Q(assigned_to=user) | Q(assigned_to=None),
                status__in=['submitted', 'in_review', 'processing']
            ).order_by('-created_at')[:5]
            
            # Lấy danh sách yêu cầu đã hoàn thành gần đây
            completed_request_list = Request.objects.filter(
                assigned_to=user,
                status__in=['completed', 'approved']
            ).order_by('-updated_at')[:5]
            
            # Lấy danh sách công dân gần đây
            recent_citizens = User.objects.filter(
                roles__name='citizen'
            ).order_by('-date_joined')[:5]
            
            # Chuyển đổi pending requests thành định dạng phù hợp
            pending_requests_data = []
            for req in pending_request_list:
                pending_requests_data.append({
                    'id': str(req.id),
                    'type': req.request_type,
                    'status': req.status,
                    'title': req.title,
                    'submittedDate': req.created_at.isoformat(),
                    'deadline': (req.created_at + timedelta(days=7)).isoformat(),  # Giả định deadline 7 ngày
                    'priority': 'high' if 'urgent' in req.notes.lower() else 'normal',
                    'citizen': {
                        'id': str(req.requestor.id),
                        'name': f"{req.requestor.first_name} {req.requestor.last_name}".strip(),
                        'phone': getattr(req.requestor.profile, 'phone_number', 'N/A')
                    }
                })
            
            # Chuyển đổi completed requests thành định dạng phù hợp
            completed_requests_data = []
            for req in completed_request_list:
                completed_requests_data.append({
                    'id': str(req.id),
                    'type': req.request_type,
                    'status': req.status,
                    'title': req.title,
                    'submittedDate': req.created_at.isoformat(),
                    'completedDate': req.updated_at.isoformat(),
                    'priority': 'high' if 'urgent' in req.notes.lower() else 'normal',
                    'citizen': {
                        'id': str(req.requestor.id),
                        'name': f"{req.requestor.first_name} {req.requestor.last_name}".strip()
                    },
                    'rejectReason': req.rejection_reason if req.status == 'rejected' else None
                })
            
            # Chuyển đổi recent citizens thành định dạng phù hợp
            recent_citizens_data = []
            for citizen in recent_citizens:
                # Lấy yêu cầu gần nhất của công dân
                latest_request = Request.objects.filter(requestor=citizen).order_by('-created_at').first()
                
                # Đếm tổng số yêu cầu của công dân
                total_requests = Request.objects.filter(requestor=citizen).count()
                
                recent_citizens_data.append({
                    'id': str(citizen.id),
                    'name': f"{citizen.first_name} {citizen.last_name}".strip(),
                    'email': citizen.email,
                    'phone': getattr(citizen.profile, 'phone_number', 'N/A') if hasattr(citizen, 'profile') else 'N/A',
                    'status': 'active',  # Giả định tất cả công dân đều active
                    'lastRequest': latest_request.created_at.isoformat() if latest_request else None,
                    'totalRequests': total_requests
                })
            
            # Tạo response
            response_data = {
                'stats': {
                    'total_requests': pending_requests + completed_requests,
                    'pending_requests': pending_requests,
                    'completed_requests': completed_requests,
                    'total_citizens': total_citizens,
                    'total_documents': total_documents
                },
                'pending_requests': pending_requests_data,
                'completed_requests': completed_requests_data,
                'recent_citizens': recent_citizens_data
            }
            
            print(f"Response data prepared: {response_data}")
            return Response(response_data)
            
        except Exception as e:
            print(f"Error in officer dashboard stats: {str(e)}")
            return Response({
                'error': f'Lỗi khi lấy thống kê: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
