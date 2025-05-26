from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.utils import timezone
from django.db.models import Count, Q
from apps.accounts.models import User
from apps.administrative.models import AdminRequest, DocumentType, Attachment
# Import Document model
from apps.administrative.models import Document
from apps.administrative.serializers import (
    DocumentSerializer as AdminDocumentSerializer
)
from apps.administrative.serializers.attachment_serializer import AttachmentUploadSerializer
from api.v1.serializers.request_serializers import RequestSerializer, RequestDetailSerializer
from api.v1.serializers.document_type_serializers import DocumentTypeProcedureSerializer
from api.v1.serializers.document_serializers import DocumentSerializer
from apps.feedback.models import Feedback
from apps.feedback.serializers import FeedbackSerializer, FeedbackCreateSerializer
from utils.permissions import IsCitizen, IsOwnerOrAdmin
from django.shortcuts import get_object_or_404

# Debug view to test permissions
class DebugPermissionView(APIView):
    """
    Debug view to check user permissions
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Get user roles
        roles = []
        if hasattr(user, 'roles'):
            roles = [role.name for role in user.roles.all()]
        
        # Get user's primary role
        primary_role = getattr(user, 'role', None)
        
        # Check permission flags set by middleware
        has_citizen_access = getattr(user, '_has_citizen_access', False)
        has_officer_access = getattr(user, '_has_officer_access', False)
        has_chairman_access = getattr(user, '_has_chairman_access', False)
        
        # Check permission classes
        from utils.permissions import IsCitizen, IsOfficer, IsChairman
        is_citizen = IsCitizen().has_permission(request, self)
        is_officer = IsOfficer().has_permission(request, self)
        is_chairman = IsChairman().has_permission(request, self)
        
        return Response({
            'user_id': user.pk,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'primary_role': primary_role,
            'roles': roles,
            'is_verified': getattr(user, 'is_verified', False),
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
            'permission_flags': {
                'has_citizen_access': has_citizen_access,
                'has_officer_access': has_officer_access,
                'has_chairman_access': has_chairman_access
            },
            'permission_checks': {
                'is_citizen': is_citizen,
                'is_officer': is_officer,
                'is_chairman': is_chairman
            },
            'debug_info': {
                'has_roles_attr': hasattr(user, 'roles'),
                'has_role_attr': hasattr(user, 'role'),
                'has_is_citizen': hasattr(user, 'is_citizen'),
                'has_is_officer': hasattr(user, 'is_officer'),
                'has_is_chairman': hasattr(user, 'is_chairman'),
            }
        })

class CitizenRequestViewSet(viewsets.ModelViewSet):
    """
    API endpoints cho quản lý yêu cầu hành chính của công dân
    """
    serializer_class = RequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    
    def get_queryset(self):
        # Công dân chỉ có thể xem các yêu cầu của chính họ
        return AdminRequest.objects.filter(citizen=self.request.user).order_by('-created_at')
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return RequestDetailSerializer
        return RequestSerializer
    
    def perform_create(self, serializer):
        serializer.save(citizen=self.request.user, requestor=self.request.user)
    
    def retrieve(self, request, pk=None):
        """
        Custom retrieve method to get a request by request_id
        """
        print(f"==== Retrieving request with ID: {pk} ====")
        
        try:
            # Look up by request_id instead of primary key
            admin_request = AdminRequest.objects.get(request_id=pk)
            print(f"Found AdminRequest: ID={admin_request.id}, request_id={admin_request.request_id}")
            
            # Check if the user has permission to view this request
            if admin_request.citizen != request.user and admin_request.requestor != request.user:
                print(f"Permission denied: User {request.user.id} does not own request {pk}")
                return Response(
                    {'detail': 'You do not have permission to view this request.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            serializer = self.get_serializer(admin_request)
            return Response(serializer.data)
            
        except AdminRequest.DoesNotExist:
            print(f"AdminRequest with request_id={pk} not found")
            return Response(
                {'detail': f'Request with ID {pk} not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            import logging
            import traceback
            logger = logging.getLogger(__name__)
            logger.error(f"Error retrieving request: {str(e)}")
            logger.error(traceback.format_exc())
            print(f"Error retrieving request: {str(e)}")
            print(traceback.format_exc())
            
            return Response(
                {'detail': f'Error retrieving request: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
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
                Q(document_type__name__icontains=search) | 
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
        print(f"==== Starting cancel request for request ID: {pk} ====")
        
        try:
            # Get the request instance by the request_id field (not primary key)
            try:
                admin_request = AdminRequest.objects.get(request_id=pk)
                print(f"Found AdminRequest: ID={admin_request.id}, request_id={admin_request.request_id}")
            except AdminRequest.DoesNotExist:
                print(f"AdminRequest with request_id={pk} not found")
                return Response(
                    {'detail': f'Request with ID {pk} not found.'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Ensure the user owns this request
            if admin_request.citizen != request.user and admin_request.requestor != request.user:
                print(f"Permission denied: User {request.user.id} does not own request {pk}")
                return Response(
                    {'detail': 'You do not have permission to cancel this request.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Only allow cancellation of pending requests
            if admin_request.status != 'pending':
                print(f"Cannot cancel request with status: {admin_request.status}")
                return Response(
                    {'detail': 'Only pending requests can be cancelled.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Update status to cancelled
            admin_request.status = 'cancelled'
            admin_request.updated_at = timezone.now()
            admin_request.save()
            
            print(f"Successfully cancelled request: {pk}")
            serializer = self.get_serializer(admin_request)
            return Response(serializer.data)
            
        except Exception as e:
            import logging
            import traceback
            logger = logging.getLogger(__name__)
            logger.error(f"Error cancelling request: {str(e)}")
            logger.error(traceback.format_exc())
            print(f"Error cancelling request: {str(e)}")
            print(traceback.format_exc())
            
            return Response(
                {'detail': f'Error cancelling request: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'], url_path='attachments')
    def add_attachment(self, request, pk=None):
        """
        Add an attachment to a request
        """
        print(f"==== Starting attachment upload for request ID: {pk} ====")
        print(f"Request method: {request.method}")
        print(f"Content type: {request.content_type}")
        print(f"Files in request: {request.FILES}")
        print(f"Data in request: {request.data}")
        
        try:
            # Get the request instance by the request_id field (not primary key)
            try:
                admin_request = AdminRequest.objects.get(request_id=pk)
                print(f"Found AdminRequest: ID={admin_request.id}, request_id={admin_request.request_id}")
            except AdminRequest.DoesNotExist:
                print(f"AdminRequest with request_id={pk} not found")
                return Response(
                    {'detail': f'Request with ID {pk} not found.'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Ensure the user owns this request
            if admin_request.citizen != request.user and admin_request.requestor != request.user:
                print(f"Permission denied: User {request.user.id} does not own request {pk}")
                return Response(
                    {'detail': 'You do not have permission to add attachments to this request.'},
                    status=status.HTTP_403_FORBIDDEN
                )
                
            # Create form data with required fields
            attachment_data = request.data.copy()
            # Set default attachment type if not provided
            if 'attachment_type' not in attachment_data:
                attachment_data['attachment_type'] = 'supporting_document'
                print("Using default attachment_type: supporting_document")
            
            # Set default name if not provided
            if 'name' not in attachment_data and 'file' in attachment_data:
                file_obj = attachment_data['file']
                attachment_data['name'] = getattr(file_obj, 'name', 'Untitled Document')
                print(f"Using file name as attachment name: {attachment_data['name']}")
            
            # Debug the data to be sent to serializer
            print(f"Attachment data to be sent to serializer: {attachment_data}")
            print(f"File included: {'file' in attachment_data}")
            if 'file' in attachment_data:
                file_obj = attachment_data['file']
                print(f"File name: {getattr(file_obj, 'name', 'Unknown')}")
                print(f"File size: {getattr(file_obj, 'size', 'Unknown')} bytes")
                print(f"File content type: {getattr(file_obj, 'content_type', 'Unknown')}")
            
            # Create serializer with request context
            serializer = AttachmentUploadSerializer(
                data=attachment_data,
                context={'request': request}
            )
            
            # Validate the data
            if serializer.is_valid():
                print("Serializer is valid. Creating attachment...")
                # Save the attachment with link to the request
                attachment = serializer.save(
                    request=admin_request,
                    uploaded_by=request.user
                )
                print(f"Attachment created successfully: ID={attachment.id}, file={attachment.file}")
                
                return Response(
                    serializer.data,
                    status=status.HTTP_201_CREATED
                )
            else:
                print(f"Serializer validation failed: {serializer.errors}")
                return Response(
                    serializer.errors,
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except Exception as e:
            # Log the full error for debugging
            import logging
            import traceback
            logger = logging.getLogger(__name__)
            logger.error(f"Error adding attachment: {str(e)}")
            logger.error(traceback.format_exc())
            print(f"Error adding attachment: {str(e)}")
            print(traceback.format_exc())
            
            return Response(
                {'detail': f'Error adding attachment: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CitizenDocumentViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoints cho xem giấy tờ của công dân
    """
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Trả về documents của user hiện tại
        return Document.objects.filter(citizen=self.request.user).order_by('-created_at')
    
    def list(self, request, *args, **kwargs):
        """
        Custom list method to handle pagination, filtering, and sorting
        Also returns stats for different document statuses
        """
        user = request.user
        queryset = self.get_queryset()
        
        # Apply filters
        status_filter = request.query_params.get('status', None)
        document_type = request.query_params.get('document_type', None)
        search = request.query_params.get('search', None)
        
        if status_filter and status_filter != 'all':
            queryset = queryset.filter(status=status_filter)
            
        if document_type:
            queryset = queryset.filter(document_type=document_type)
            
        if search:
            queryset = queryset.filter(
                Q(document_id__icontains=search) | 
                Q(title__icontains=search) | 
                Q(description__icontains=search)
            )
        
        # Get document stats for UI 
        all_count = Document.objects.filter(citizen=user).count()
        active_count = Document.objects.filter(citizen=user, status='active').count()
        expired_count = Document.objects.filter(citizen=user, status='expired').count()
        revoked_count = Document.objects.filter(citizen=user, status='revoked').count()
        
        stats = {
            'all': all_count,
            'active': active_count,
            'expired': expired_count,
            'revoked': revoked_count
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
    
    @action(detail=True, methods=['get'], url_path='download')
    def download_document(self, request, pk=None):
        """
        Download document file
        """
        # Tạm thời trả về lỗi để tránh sử dụng Document
        return Response(
            {'detail': 'Document download temporarily unavailable'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )
    
    @action(detail=True, methods=['get'], url_path='verify')
    def verify_document(self, request, pk=None):
        """
        Verify document on blockchain
        """
        # Tạm thời trả về lỗi để tránh sử dụng Document
        return Response(
            {'detail': 'Document verification temporarily unavailable'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )
    
    @action(detail=True, methods=['get'], url_path='print')
    def print_document(self, request, pk=None):
        """
        Get document in printable format
        """
        # Tạm thời trả về lỗi để tránh sử dụng Document
        return Response(
            {'detail': 'Document printing temporarily unavailable'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )


class CitizenFeedbackViewSet(viewsets.ModelViewSet):
    """
    API endpoints cho quản lý phản hồi của công dân
    """
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Chỉ trả về phản hồi của công dân đang đăng nhập
        """
        return Feedback.objects.filter(submitter=self.request.user)
    
    def get_serializer_class(self):
        """
        Use different serializers for different actions
        """
        if self.action == 'create':
            return FeedbackCreateSerializer
        return FeedbackSerializer


class CitizenDashboardStatsView(viewsets.ViewSet):
    """
    API endpoint cho lấy thống kê dashboard của công dân
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def list(self, request):
        """
        Get dashboard statistics for citizen
        """
        user = request.user
        
        # Get request counts by status
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
            
        # Tạm thời comment phần sử dụng Document
        # Get document counts
        # total_documents = Document.objects.filter(citizen=user).count()
        # active_documents = Document.objects.filter(citizen=user, status='active').count()
        # expired_documents = Document.objects.filter(citizen=user, status='expired').count()
        # revoked_documents = Document.objects.filter(citizen=user, status='revoked').count()
        
        # Get recent activity (5 requests and 5 documents)
        recent_requests = AdminRequest.objects.filter(citizen=user).order_by('-created_at')[:5]
        # Tạm thời comment phần sử dụng Document
        # recent_documents = Document.objects.filter(citizen=user).order_by('-created_at')[:5]
            
        # Create recent activity list
        recent_activity = []
        
        # Add recent requests
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
            
        # Tạm thời comment phần sử dụng Document
        # Add recent documents
        # for doc in recent_documents:
        #     recent_activity.append({
        #         'id': str(doc.id),
        #         'type': 'document',
        #         'status': doc.status,
        #         'title': doc.title,
        #         'date': doc.created_at.isoformat(),
        #         'document_id': doc.document_id,
        #         'issued_by': f"{doc.issued_by.first_name} {doc.issued_by.last_name}" if doc.issued_by else None
        #     })
            
        # Sort by most recent
        recent_activity.sort(key=lambda x: x['date'], reverse=True)
        
        # Tạm thời comment phần sử dụng Document
        # Count blockchain verified documents
        # verified_documents = Document.objects.filter(citizen=user, blockchain_status='STORED').count()
        verified_documents = 0
        
        # Count unread notifications
        unread_notifications = 0
        try:
            from apps.notifications.models import Notification
            unread_notifications = Notification.objects.filter(user=user, is_read=False).count()
        except ImportError:
            pass
        
        # Return dashboard data
        dashboard_data = {
            'user': {
                'id': user.id,
                'name': f"{user.first_name} {user.last_name}".strip(),
                'email': user.email,
                'phone': getattr(user, 'phone', ''),
                'address': getattr(user, 'address', ''),
                'last_login': user.last_login.isoformat() if user.last_login else None
            },
            'requests': {
                'pending': pending_requests,
                'processing': processing_requests,
                'completed': completed_requests,
                'rejected': rejected_requests,
                'total': pending_requests + processing_requests + completed_requests + rejected_requests
            },
            'documents': {
                # Tạm thời comment phần sử dụng Document
                # 'active': active_documents,
                # 'expired': expired_documents,
                # 'revoked': revoked_documents,
                # 'total': total_documents,
                'active': 0,
                'expired': 0,
                'revoked': 0,
                'total': 0,
                'verified': verified_documents
            },
            'recent_activity': recent_activity[:10],  # Limit to 10 items
            'notifications': {
                'unread': unread_notifications
            }
        }
        
        return Response(dashboard_data)


class CitizenDocumentTypeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint cho xem các loại giấy tờ có thể yêu cầu
    """
    queryset = DocumentType.objects.filter(is_active=True)
    serializer_class = DocumentTypeProcedureSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def list(self, request, *args, **kwargs):
        """
        Lấy danh sách các loại thủ tục hành chính với định dạng phù hợp với frontend
        """
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        
        # Trả về dữ liệu theo định dạng mà frontend mong đợi
        return Response(serializer.data)
