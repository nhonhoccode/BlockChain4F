from rest_framework import serializers
from apps.administrative.models import AdminRequest
from apps.accounts.models import User

class UserBasicSerializer(serializers.ModelSerializer):
    """Basic user information serializer"""
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email']

class RequestSerializer(serializers.ModelSerializer):
    """Serializer for listing requests"""
    id = serializers.CharField(source='request_id', read_only=True)
    type = serializers.CharField(source='request_type')
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
        request_type = validated_data.pop('request_type')
        # Create a request ID based on type and timestamp
        # e.g., KS-20240512-001 for birth certificate
        import datetime
        today = datetime.datetime.now()
        
        # Map request types to codes
        type_codes = {
            'Giấy khai sinh': 'KS',
            'Chứng minh nhân dân': 'CMND',
            'Đăng ký thường trú': 'TT',
            'Giấy đăng ký kết hôn': 'KH',
            'Xác nhận tạm trú': 'XT',
            'Giấy chứng tử': 'CT',
            # Add more mappings as needed
        }
        
        # Get code or use 'YC' (general request) as default
        code = type_codes.get(request_type, 'YC')
        date_str = today.strftime('%Y%m%d')
        
        # Count existing requests of this type today
        count = AdminRequest.objects.filter(
            request_id__startswith=f"{code}-{date_str}"
        ).count()
        
        # Create request ID in format: CODE-YYYYMMDD-SEQ
        request_id = f"{code}-{date_str}-{count+1:03d}"
        
        # Create the request
        request = AdminRequest.objects.create(
            request_id=request_id,
            request_type=request_type,
            **validated_data
        )
        
        return request


class RequestDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for a specific request"""
    id = serializers.CharField(source='request_id', read_only=True)
    type = serializers.CharField(source='request_type')
    requestDate = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)
    description = serializers.CharField()
    status = serializers.CharField(read_only=True)
    citizen = UserBasicSerializer(read_only=True)
    assignedTo = UserBasicSerializer(source='assigned_to', read_only=True)
    comments = serializers.CharField(allow_null=True, required=False)
    trackingEvents = serializers.SerializerMethodField()
    
    class Meta:
        model = AdminRequest
        fields = [
            'id', 'type', 'requestDate', 'status', 
            'description', 'updatedAt', 'citizen',
            'assignedTo', 'comments', 'trackingEvents'
        ]
        read_only_fields = [
            'id', 'requestDate', 'updatedAt', 
            'status', 'citizen', 'assignedTo',
            'trackingEvents'
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
        if obj.assigned_to:
            # This would be the actual assignment time in a real implementation
            assignment_time = obj.updated_at.isoformat()
            events.append({
                'timestamp': assignment_time,
                'status': 'assigned',
                'description': f'Yêu cầu được giao cho {obj.assigned_to.first_name} {obj.assigned_to.last_name}',
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
                'actor': obj.assigned_to.first_name + ' ' + obj.assigned_to.last_name if obj.assigned_to else 'Hệ thống'
            })
            
        # Sort events by timestamp
        events.sort(key=lambda x: x['timestamp'])
        return events 