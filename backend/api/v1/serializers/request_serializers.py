from rest_framework import serializers
from apps.administrative.models import AdminRequest, DocumentType
from apps.accounts.models import User

class UserBasicSerializer(serializers.ModelSerializer):
    """Basic user information serializer"""
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email']

class RequestSerializer(serializers.ModelSerializer):
    """Serializer for listing requests"""
    id = serializers.CharField(source='request_id', read_only=True)
    type = serializers.CharField(source='document_type')
    requestDate = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)
    description = serializers.CharField()
    status = serializers.CharField()
    
    class Meta:
        model = AdminRequest
        fields = [
            'id', 'type', 'requestDate', 'status', 
            'description', 'updatedAt'
        ]
        read_only_fields = ['id', 'requestDate', 'updatedAt']
        
    def create(self, validated_data):
        """Handle creation of a new request"""
        document_type_name = validated_data.pop('document_type')
        
        # Try to find the document type object
        try:
            # First try to find by exact name
            document_type_obj = DocumentType.objects.get(name=document_type_name)
        except DocumentType.DoesNotExist:
            try:
                # Then try by code
                document_type_obj = DocumentType.objects.get(code=document_type_name)
            except DocumentType.DoesNotExist:
                # If not found, raise validation error
                raise serializers.ValidationError(f"Document type '{document_type_name}' not found. Please select a valid document type.")
        
        # Create a request ID based on type and timestamp
        # e.g., KS-20240512-001 for birth certificate
        import datetime
        today = datetime.datetime.now()
        
        # Map request types to codes - use the document type code
        code = document_type_obj.code
        date_str = today.strftime('%Y%m%d')
        
        # Count existing requests of this type today
        count = AdminRequest.objects.filter(
            request_id__startswith=f"{code}-{date_str}"
        ).count()
        
        # Create request ID in format: CODE-YYYYMMDD-SEQ
        request_id = f"{code}-{date_str}-{count+1:03d}"
        
        # Create reference number if not provided
        if 'reference_number' not in validated_data:
            reference_number = f"REF-{code}-{date_str}-{count+1:03d}"
            validated_data['reference_number'] = reference_number
        
        # Create the request with the document type object
        request = AdminRequest.objects.create(
            request_id=request_id,
            document_type=document_type_obj,
            **validated_data
        )
        
        return request


class RequestDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for a specific request"""
    id = serializers.CharField(source='request_id', read_only=True)
    type = serializers.CharField(source='document_type')
    requestDate = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)
    description = serializers.CharField()
    status = serializers.CharField(read_only=True)
    citizen = UserBasicSerializer(read_only=True)
    assignedTo = UserBasicSerializer(source='assigned_officer', read_only=True)
    comments = serializers.CharField(source='notes', allow_null=True, required=False)
    trackingEvents = serializers.SerializerMethodField()
    reference_number = serializers.CharField(read_only=True)
    title = serializers.CharField(read_only=True)
    priority = serializers.CharField(read_only=True)
    submitted_date = serializers.DateTimeField(read_only=True)
    due_date = serializers.DateField(read_only=True, allow_null=True)
    completed_date = serializers.DateTimeField(read_only=True, allow_null=True)
    rejection_reason = serializers.CharField(read_only=True, allow_null=True)
    additional_info_request = serializers.CharField(read_only=True, allow_null=True)
    additional_info_response = serializers.CharField(read_only=True, allow_null=True)
    attachments = serializers.SerializerMethodField()
    document_type_details = serializers.SerializerMethodField()
    
    class Meta:
        model = AdminRequest
        fields = [
            'id', 'type', 'requestDate', 'status', 
            'description', 'updatedAt', 'citizen',
            'assignedTo', 'comments', 'trackingEvents',
            'reference_number', 'title', 'priority',
            'submitted_date', 'due_date', 'completed_date',
            'rejection_reason', 'additional_info_request',
            'additional_info_response', 'attachments',
            'document_type_details'
        ]
        read_only_fields = [
            'id', 'requestDate', 'updatedAt', 
            'status', 'citizen', 'assignedTo',
            'trackingEvents', 'reference_number',
            'title', 'priority', 'submitted_date',
            'due_date', 'completed_date', 'rejection_reason',
            'additional_info_request', 'additional_info_response',
            'attachments', 'document_type_details'
        ]
        
    def get_trackingEvents(self, obj):
        """Get tracking events for this request"""
        # In a real implementation, this would fetch from a tracking table
        # For now, we'll create a simulated timeline
        events = []
        
        # Always add creation event
        events.append({
            'timestamp': obj.created_at.isoformat(),
            'status': 'created',
            'description': 'Yêu cầu đã được tạo',
            'actor': f"{obj.citizen.first_name} {obj.citizen.last_name}"
        })
        
        # Add assignment event if assigned
        if hasattr(obj, 'assigned_officer') and obj.assigned_officer:
            # This would be the actual assignment time in a real implementation
            assignment_time = obj.updated_at.isoformat()
            events.append({
                'timestamp': assignment_time,
                'status': 'assigned',
                'description': f'Yêu cầu được giao cho {obj.assigned_officer.first_name} {obj.assigned_officer.last_name}',
                'actor': 'Hệ thống'
            })
        
        # Add status change event based on current status
        if obj.status in ['completed', 'rejected', 'processing']:
            events.append({
                'timestamp': obj.updated_at.isoformat(),
                'status': obj.status,
                'description': {
                    'completed': 'Yêu cầu đã được xử lý hoàn tất',
                    'rejected': 'Yêu cầu bị từ chối',
                    'processing': 'Đang xử lý yêu cầu'
                }.get(obj.status),
                'actor': f"{obj.assigned_officer.first_name} {obj.assigned_officer.last_name}" if hasattr(obj, 'assigned_officer') and obj.assigned_officer else 'Hệ thống'
            })
            
        # Sort events by timestamp
        events.sort(key=lambda x: x['timestamp'])
        return events
    
    def get_attachments(self, obj):
        """Get attachments for this request"""
        from apps.administrative.models import Attachment
        from apps.administrative.serializers.attachment_serializer import AttachmentSerializer
        
        attachments = Attachment.objects.filter(request=obj)
        serializer = AttachmentSerializer(attachments, many=True)
        return serializer.data
    
    def get_document_type_details(self, obj):
        """Get detailed information about the document type"""
        from api.v1.serializers.document_type_serializers import DocumentTypeProcedureSerializer
        
        serializer = DocumentTypeProcedureSerializer(obj.document_type)
        return serializer.data 