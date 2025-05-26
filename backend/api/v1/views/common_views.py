from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Count
from django.shortcuts import get_object_or_404

from apps.accounts.models import User
from apps.accounts.serializers import UserSerializer, ProfileSerializer
from apps.administrative.models import AdminRequest, Document, DocumentType, Attachment
from apps.administrative.serializers import (
    RequestSerializer, RequestDetailSerializer, DocumentSerializer, 
    DocumentTypeSerializer, AttachmentSerializer
)
from apps.feedback.models import Feedback
from apps.feedback.serializers import FeedbackSerializer, FeedbackCreateSerializer
from utils.permissions import IsCitizen, IsOfficer, IsChairman, IsOwnerOrAdmin
from api.v1.serializers.document_type_serializers import DocumentTypeProcedureSerializer

class DashboardStatsView(APIView):
    """
    Unified dashboard statistics API for all roles
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Get dashboard statistics based on user role
        """
        user = request.user
        
        # Check user roles and get appropriate stats
        if hasattr(user, 'is_citizen') and user.is_citizen:
            return self.get_citizen_stats(user)
        elif hasattr(user, 'is_officer') and user.is_officer:
            return self.get_officer_stats(user)
        elif hasattr(user, 'is_chairman') and user.is_chairman:
            return self.get_chairman_stats(user)
        else:
            return Response({
                "error": "User role not recognized"
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def get_citizen_stats(self, user):
        """Get dashboard stats for citizens"""
        # Get document counts
        total_documents = Document.objects.filter(citizen=user).count()
        
        # Get request counts by status
        pending_requests = AdminRequest.objects.filter(
            Q(citizen=user) | Q(requestor=user), 
            status__in=['pending', 'draft', 'submitted', 'in_review', 'additional_info_required']
        ).count()
        
        processing_requests = AdminRequest.objects.filter(
            Q(citizen=user) | Q(requestor=user),
            status__in=['processing', 'approved']
        ).count()
        
        completed_requests = AdminRequest.objects.filter(
            Q(citizen=user) | Q(requestor=user),
            status='completed'
        ).count()
        
        rejected_requests = AdminRequest.objects.filter(
            Q(citizen=user) | Q(requestor=user),
            status__in=['rejected', 'cancelled']
        ).count()
        
        # Get recent requests
        recent_requests = AdminRequest.objects.filter(
            Q(citizen=user) | Q(requestor=user)
        ).order_by('-created_at')[:5]
        
        # Get recent documents
        recent_documents = Document.objects.filter(
            citizen=user
        ).order_by('-created_at')[:5]
        
        return Response({
            "stats": {
                "total_documents": total_documents,
                "pending_requests": pending_requests,
                "processing_requests": processing_requests,
                "completed_requests": completed_requests,
                "rejected_requests": rejected_requests,
                "total_requests": pending_requests + processing_requests + completed_requests + rejected_requests,
            },
            "recent_requests": RequestSerializer(recent_requests, many=True).data,
            "recent_documents": DocumentSerializer(recent_documents, many=True).data
        })
    
    def get_officer_stats(self, user):
        """Get dashboard stats for officers"""
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
        
        # Get stats
        stats = {
            'total_requests': assigned_requests.count(),
            'pending_requests': pending_requests.count(),
            'completed_requests': completed_requests.count(),
            'total_citizens': User.objects.filter(roles__name='citizen').count(),
            'total_documents': Document.objects.filter(issued_by=user).count()
        }
        
        # Get recent pending requests
        recent_pending = pending_requests.order_by('-created_at')[:5]
        
        # Get recent completed requests
        recent_completed = completed_requests.order_by('-updated_at')[:5]
        
        # Get recent citizens
        recent_citizens = User.objects.filter(roles__name='citizen').order_by('-date_joined')[:5]
        
        return Response({
            "stats": stats,
            "pending_requests": RequestSerializer(recent_pending, many=True).data,
            "completed_requests": RequestSerializer(recent_completed, many=True).data,
            "recent_citizens": UserSerializer(recent_citizens, many=True).data
        })
    
    def get_chairman_stats(self, user):
        """Get dashboard stats for chairman"""
        # Thống kê yêu cầu
        total_requests = AdminRequest.objects.count()
        pending_requests = AdminRequest.objects.filter(status__in=['submitted', 'in_review']).count()
        completed_requests = AdminRequest.objects.filter(status='completed').count()
        
        # Thống kê giấy tờ
        total_documents = Document.objects.count()
        issued_documents = Document.objects.filter(status='issued').count()
        
        # Thống kê phê duyệt
        pending_approvals = 0  # This would need to be updated with real data
        
        # Thống kê theo loại giấy tờ
        document_type_stats = DocumentType.objects.annotate(
            requests_count=Count('requests'),
            documents_count=Count('documents')
        ).values('id', 'name', 'requests_count', 'documents_count')
        
        # Get recent requests
        recent_requests = AdminRequest.objects.order_by('-created_at')[:5]
        
        # Get recent officers
        recent_officers = User.objects.filter(roles__name='officer').order_by('-date_joined')[:5]
        
        return Response({
            "request_stats": {
                "total": total_requests,
                "pending": pending_requests,
                "completed": completed_requests
            },
            "document_stats": {
                "total": total_documents,
                "issued": issued_documents
            },
            "approval_stats": {
                "pending": pending_approvals
            },
            "document_type_stats": list(document_type_stats),
            "recent_requests": RequestSerializer(recent_requests, many=True).data,
            "recent_officers": UserSerializer(recent_officers, many=True).data
        })

class ProfileView(APIView):
    """
    Unified profile API for all roles
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Get user profile based on user role
        """
        user = request.user
        serializer = ProfileSerializer(user.profile)
        return Response(serializer.data)
    
    def put(self, request):
        """
        Update user profile
        """
        user = request.user
        serializer = ProfileSerializer(user.profile, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RequestViewSet(viewsets.ModelViewSet):
    """
    Unified API for handling requests across all roles
    """
    serializer_class = RequestSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'description', 'request_type', 'id']
    
    def get_queryset(self):
        """
        Get requests based on user role
        """
        user = request.user
        
        # Apply role-based filtering
        if hasattr(user, 'is_citizen') and user.is_citizen:
            # Citizens can only see their own requests
            queryset = AdminRequest.objects.filter(requestor=user)
        elif hasattr(user, 'is_officer') and user.is_officer:
            # Officers can see all requests
            queryset = AdminRequest.objects.all()
        elif hasattr(user, 'is_chairman') and user.is_chairman:
            # Chairman can see all requests
            queryset = AdminRequest.objects.all()
        else:
            # Default case, return empty queryset
            return AdminRequest.objects.none()
        
        # Apply status filter if provided
        status_param = self.request.query_params.get('status')
        if status_param and status_param != 'all':
            queryset = queryset.filter(status=status_param)
            
        # Apply search filter if provided
        search_param = self.request.query_params.get('search')
        if search_param:
            queryset = queryset.filter(
                Q(request_id__icontains=search_param) |
                Q(request_type__icontains=search_param) |
                Q(description__icontains=search_param)
            )
            
        # Apply sorting if provided
        sort_field = self.request.query_params.get('sort', 'created_at')
        sort_order = self.request.query_params.get('order', 'desc')
        
        # Map frontend sort fields to model fields
        field_mapping = {
            'requestDate': 'created_at',
            'type': 'request_type',
            'status': 'status',
            'updatedAt': 'updated_at'
        }
        
        # Use mapped field or default to created_at
        sort_field = field_mapping.get(sort_field, 'created_at')
        
        # Apply sorting direction
        if sort_order == 'asc':
            queryset = queryset.order_by(sort_field)
        else:
            queryset = queryset.order_by(f'-{sort_field}')
            
        return queryset
    
    def get_serializer_class(self):
        """
        Get appropriate serializer based on action
        """
        if self.action == 'retrieve':
            return RequestDetailSerializer
        return RequestSerializer
    
    def perform_create(self, serializer):
        """
        Set the requestor to the current user when creating a request
        """
        serializer.save(requestor=self.request.user)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """
        Cancel a pending request
        """
        instance = self.get_object()
        
        # Only allow requestor to cancel their own request
        if instance.requestor != request.user and not (hasattr(request.user, 'is_officer') or hasattr(request.user, 'is_chairman')):
            return Response({"detail": "You do not have permission to cancel this request."}, status=status.HTTP_403_FORBIDDEN)
        
        # Only allow cancellation of pending requests
        if instance.status not in ['pending', 'submitted', 'draft']:
            return Response(
                {'detail': 'Only pending requests can be cancelled.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update status to cancelled
        instance.status = 'cancelled'
        instance.save()
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        """
        Assign a request to an officer
        """
        instance = self.get_object()
        
        # Only officers and chairman can assign requests
        if not (hasattr(request.user, 'is_officer') or hasattr(request.user, 'is_chairman')):
            return Response({"detail": "You do not have permission to assign this request."}, status=status.HTTP_403_FORBIDDEN)
        
        # Assign to self or specified officer
        officer_id = request.data.get('officer_id')
        if officer_id:
            try:
                officer = User.objects.get(id=officer_id, roles__name='officer')
                instance.assigned_officer = officer
            except User.DoesNotExist:
                return Response({"detail": "Officer not found."}, status=status.HTTP_404_NOT_FOUND)
        else:
            instance.assigned_officer = request.user
        
        # Update status to in_review if currently submitted
        if instance.status == 'submitted':
            instance.status = 'in_review'
        
        instance.save()
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def process(self, request, pk=None):
        """
        Process a request (change status, add notes, etc.)
        """
        instance = self.get_object()
        
        # Only assigned officer or chairman can process
        if instance.assigned_officer != request.user and not hasattr(request.user, 'is_chairman'):
            return Response({"detail": "You do not have permission to process this request."}, status=status.HTTP_403_FORBIDDEN)
        
        # Update fields from request data
        if 'status' in request.data:
            instance.status = request.data['status']
        
        if 'notes' in request.data:
            instance.notes = request.data['notes']
        
        instance.save()
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """
        Approve a request
        """
        instance = self.get_object()
        
        # Only chairman can approve
        if not hasattr(request.user, 'is_chairman'):
            return Response({"detail": "You do not have permission to approve this request."}, status=status.HTTP_403_FORBIDDEN)
        
        # Update status to approved
        instance.status = 'approved'
        instance.save()
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """
        Reject a request
        """
        instance = self.get_object()
        
        # Only assigned officer or chairman can reject
        if instance.assigned_officer != request.user and not hasattr(request.user, 'is_chairman'):
            return Response({"detail": "You do not have permission to reject this request."}, status=status.HTTP_403_FORBIDDEN)
        
        # Update status to rejected and add rejection reason
        instance.status = 'rejected'
        
        if 'rejection_reason' in request.data:
            instance.rejection_reason = request.data['rejection_reason']
        
        instance.save()
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def attachments(self, request, pk=None):
        """
        Get attachments for a request
        """
        instance = self.get_object()
        
        # Check permissions
        if instance.requestor != request.user and not (hasattr(request.user, 'is_officer') or hasattr(request.user, 'is_chairman')):
            return Response({"detail": "You do not have permission to view attachments for this request."}, status=status.HTTP_403_FORBIDDEN)
        
        attachments = Attachment.objects.filter(request=instance)
        serializer = AttachmentSerializer(attachments, many=True)
        
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_attachment(self, request, pk=None):
        """
        Add attachment to a request
        """
        instance = self.get_object()
        
        # Check permissions
        if instance.requestor != request.user and not (hasattr(request.user, 'is_officer') or hasattr(request.user, 'is_chairman')):
            return Response({"detail": "You do not have permission to add attachments to this request."}, status=status.HTTP_403_FORBIDDEN)
        
        # Create attachment
        attachment_data = {
            'request': instance.id,
            'name': request.data.get('name', 'Attachment'),
            'file': request.data.get('file')
        }
        
        serializer = AttachmentSerializer(data=attachment_data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DocumentViewSet(viewsets.ModelViewSet):
    """
    Unified API for handling documents across all roles
    """
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'document_number', 'description']
    
    def get_queryset(self):
        """
        Get documents based on user role
        """
        user = request.user
        
        # Apply role-based filtering
        if hasattr(user, 'is_citizen') and user.is_citizen:
            # Citizens can only see their own documents
            queryset = Document.objects.filter(citizen=user)
        elif hasattr(user, 'is_officer') and user.is_officer:
            # Officers can see all documents or documents they issued
            queryset = Document.objects.all()
        elif hasattr(user, 'is_chairman') and user.is_chairman:
            # Chairman can see all documents
            queryset = Document.objects.all()
        else:
            # Default case, return empty queryset
            return Document.objects.none()
        
        # Apply status filter if provided
        status_param = self.request.query_params.get('status')
        if status_param and status_param != 'all':
            queryset = queryset.filter(status=status_param)
            
        # Apply search filter if provided
        search_param = self.request.query_params.get('search')
        if search_param:
            queryset = queryset.filter(
                Q(title__icontains=search_param) |
                Q(document_number__icontains=search_param) |
                Q(description__icontains=search_param)
            )
            
        # Apply sorting if provided
        sort_field = self.request.query_params.get('sort', 'created_at')
        sort_order = self.request.query_params.get('order', 'desc')
        
        # Apply sorting direction
        if sort_order == 'asc':
            queryset = queryset.order_by(sort_field)
        else:
            queryset = queryset.order_by(f'-{sort_field}')
            
        return queryset
    
    def perform_create(self, serializer):
        """
        Set the issued_by to the current user when creating a document
        """
        # Only officers and chairman can create documents
        if not (hasattr(self.request.user, 'is_officer') or hasattr(self.request.user, 'is_chairman')):
            return Response({"detail": "You do not have permission to create documents."}, status=status.HTTP_403_FORBIDDEN)
        
        serializer.save(issued_by=self.request.user)
    
    @action(detail=False, methods=['post'])
    def verify(self, request):
        """
        Verify a document by document number
        """
        document_number = request.data.get('document_number')
        
        if not document_number:
            return Response({"detail": "Document number is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            document = Document.objects.get(document_number=document_number)
            serializer = DocumentSerializer(document)
            
            # Return verification status
            return Response({
                "verified": True,
                "document": serializer.data
            })
        except Document.DoesNotExist:
            return Response({
                "verified": False,
                "detail": "Document not found or invalid document number."
            })

class DocumentTypeViewSet(viewsets.ModelViewSet):
    """
    API for document types
    """
    queryset = DocumentType.objects.all()
    serializer_class = DocumentTypeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        """
        Get permissions based on action
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsOfficer()]
        return [IsAuthenticated()]
    
    def get_serializer_class(self):
        """
        Get the serializer class based on the action
        """
        if self.action == 'list':
            return DocumentTypeProcedureSerializer
        return DocumentTypeSerializer
    
    def list(self, request, *args, **kwargs):
        """
        List document types with special formatting for frontend
        """
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        
        # Return data in a format that matches the frontend's expectations
        return Response(serializer.data)

class CitizenViewSet(viewsets.ModelViewSet):
    """
    API for managing citizens
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['first_name', 'last_name', 'email']
    
    def get_queryset(self):
        """
        Get citizens (only available to officers and chairman)
        """
        if not (hasattr(self.request.user, 'is_officer') or hasattr(self.request.user, 'is_chairman')):
            return User.objects.none()
        
        return User.objects.filter(roles__name='citizen')
    
    def get_permissions(self):
        """
        Get permissions based on action
        """
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated(), IsOfficer()]
        elif self.action in ['update', 'partial_update']:
            return [IsAuthenticated(), IsOfficer()]
        return [IsAuthenticated()]
    
    @action(detail=True, methods=['get'])
    def documents(self, request, pk=None):
        """
        Get documents for a citizen
        """
        citizen = self.get_object()
        
        # Only officers and chairman can view citizen documents
        if not (hasattr(request.user, 'is_officer') or hasattr(request.user, 'is_chairman')):
            return Response({"detail": "You do not have permission to view this citizen's documents."}, status=status.HTTP_403_FORBIDDEN)
        
        documents = Document.objects.filter(citizen=citizen)
        serializer = DocumentSerializer(documents, many=True)
        
        return Response(serializer.data)

class OfficerViewSet(viewsets.ModelViewSet):
    """
    API for managing officers
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsChairman]
    filter_backends = [filters.SearchFilter]
    search_fields = ['first_name', 'last_name', 'email']
    
    def get_queryset(self):
        """
        Get officers (only available to chairman)
        """
        return User.objects.filter(roles__name='officer')
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """
        Approve an officer
        """
        officer = self.get_object()
        
        # Only chairman can approve officers
        if not hasattr(request.user, 'is_chairman'):
            return Response({"detail": "You do not have permission to approve officers."}, status=status.HTTP_403_FORBIDDEN)
        
        # Update officer status
        # This would need to be updated with real approval logic
        
        serializer = self.get_serializer(officer)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """
        Reject an officer
        """
        officer = self.get_object()
        
        # Only chairman can reject officers
        if not hasattr(request.user, 'is_chairman'):
            return Response({"detail": "You do not have permission to reject officers."}, status=status.HTTP_403_FORBIDDEN)
        
        # Update officer status
        # This would need to be updated with real rejection logic
        
        serializer = self.get_serializer(officer)
        return Response(serializer.data)

class FeedbackViewSet(viewsets.ModelViewSet):
    """
    API for feedback
    """
    serializer_class = FeedbackSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        Get feedback based on role
        """
        user = self.request.user
        
        if hasattr(user, 'is_citizen') and user.is_citizen:
            # Citizens can only see their own feedback
            return Feedback.objects.filter(submitter=user)
        elif hasattr(user, 'is_officer') or hasattr(user, 'is_chairman'):
            # Officers and chairman can see all feedback
            return Feedback.objects.all()
        else:
            return Feedback.objects.none()
    
    def get_serializer_class(self):
        """
        Use different serializers for different actions
        """
        if self.action == 'create':
            return FeedbackCreateSerializer
        return FeedbackSerializer

class StatisticsView(APIView):
    """
    API for statistics
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Get statistics based on user role
        """
        user = request.user
        
        if hasattr(user, 'is_officer') or hasattr(user, 'is_chairman'):
            # Basic statistics available to officers and chairman
            total_requests = AdminRequest.objects.count()
            total_documents = Document.objects.count()
            total_citizens = User.objects.filter(roles__name='citizen').count()
            total_officers = User.objects.filter(roles__name='officer').count()
            
            # Request statistics by status
            pending_requests = AdminRequest.objects.filter(status__in=['pending', 'submitted', 'in_review']).count()
            processing_requests = AdminRequest.objects.filter(status='processing').count()
            completed_requests = AdminRequest.objects.filter(status='completed').count()
            rejected_requests = AdminRequest.objects.filter(status='rejected').count()
            
            # Document statistics by type
            document_types = DocumentType.objects.annotate(count=Count('documents'))
            document_type_stats = [{
                'id': dt.id,
                'name': dt.name,
                'count': dt.count
            } for dt in document_types]
            
            return Response({
                'total_requests': total_requests,
                'total_documents': total_documents,
                'total_citizens': total_citizens,
                'total_officers': total_officers,
                'request_stats': {
                    'pending': pending_requests,
                    'processing': processing_requests,
                    'completed': completed_requests,
                    'rejected': rejected_requests
                },
                'document_type_stats': document_type_stats
            })
        else:
            # Limited statistics for citizens
            return Response({
                'error': 'Only officers and chairman can view statistics'
            }, status=status.HTTP_403_FORBIDDEN) 