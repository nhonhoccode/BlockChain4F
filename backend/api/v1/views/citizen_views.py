from rest_framework import status, viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Count, Q
from django.utils import timezone

from apps.accounts.models import User
from apps.administrative.models import AdminRequest, Document
from api.v1.serializers.request_serializers import RequestSerializer, RequestDetailSerializer
from api.v1.serializers.document_serializers import DocumentSerializer

class CitizenRequestViewSet(viewsets.ModelViewSet):
    """
    ViewSet for handling citizen requests
    """
    serializer_class = RequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Get requests for the current user with filters"""
        user = self.request.user
        queryset = AdminRequest.objects.filter(citizen=user).order_by('-created_at')
        
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
    
    def list(self, request, *args, **kwargs):
        """
        Get paginated list of requests with stats
        """
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        
        # Get stats counts for different statuses
        user = self.request.user
        stats = {
            'all': AdminRequest.objects.filter(citizen=user).count(),
            'pending': AdminRequest.objects.filter(citizen=user, status='pending').count(),
            'processing': AdminRequest.objects.filter(citizen=user, status='processing').count(),
            'completed': AdminRequest.objects.filter(citizen=user, status='completed').count(),
            'rejected': AdminRequest.objects.filter(citizen=user, status='rejected').count(),
        }
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response({
                'results': serializer.data,
                'stats': stats
            })
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'results': serializer.data,
            'count': queryset.count(),
            'stats': stats
        })
    
    def retrieve(self, request, *args, **kwargs):
        """
        Get detailed information about a specific request
        """
        instance = self.get_object()
        serializer = RequestDetailSerializer(instance)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
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
    
    def create(self, request, *args, **kwargs):
        """
        Create a new request
        """
        # Set the citizen as current user
        data = request.data.copy()
        data['citizen'] = request.user.id
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, 
            status=status.HTTP_201_CREATED, 
            headers=headers
        ) 