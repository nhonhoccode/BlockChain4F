from rest_framework import serializers
from django.utils import timezone
from ..models import Approval


class ApprovalSerializer(serializers.ModelSerializer):
    """
    Serializer cho model Approval
    """
    class Meta:
        model = Approval
        fields = '__all__'
        read_only_fields = ['approval_id', 'created_at', 'updated_at', 
                           'approved_at', 'blockchain_transaction_id', 
                           'is_recorded_blockchain', 'digital_signature',
                           'signature_timestamp']


class ApprovalListSerializer(serializers.ModelSerializer):
    """
    Serializer nhẹ hơn cho danh sách phê duyệt
    """
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    requested_by_name = serializers.SerializerMethodField()
    approver_name = serializers.SerializerMethodField()
    document_title = serializers.SerializerMethodField()
    request_title = serializers.SerializerMethodField()
    is_overdue = serializers.BooleanField(read_only=True)
    days_pending = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Approval
        fields = [
            'id', 'approval_id', 'title', 'status', 'status_display',
            'priority', 'requested_at', 'due_date', 'approved_at',
            'requested_by', 'requested_by_name', 'approver', 'approver_name',
            'document', 'document_title', 'request', 'request_title',
            'is_overdue', 'days_pending', 'is_recorded_blockchain'
        ]
    
    def get_requested_by_name(self, obj):
        if obj.requested_by:
            return f"{obj.requested_by.last_name} {obj.requested_by.first_name}"
        return None
    
    def get_approver_name(self, obj):
        if obj.approver:
            return f"{obj.approver.last_name} {obj.approver.first_name}"
        return None
    
    def get_document_title(self, obj):
        if obj.document:
            return obj.document.title
        return None
    
    def get_request_title(self, obj):
        if obj.request:
            return obj.request.title
        return None


class ApprovalDetailSerializer(serializers.ModelSerializer):
    """
    Serializer đầy đủ cho chi tiết phê duyệt
    """
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    requested_by_name = serializers.SerializerMethodField()
    approver_name = serializers.SerializerMethodField()
    document_info = serializers.SerializerMethodField()
    request_info = serializers.SerializerMethodField()
    is_valid = serializers.BooleanField(read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    days_pending = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Approval
        fields = '__all__'
        read_only_fields = ['approval_id', 'created_at', 'updated_at', 
                           'approved_at', 'blockchain_transaction_id', 
                           'is_recorded_blockchain', 'digital_signature',
                           'signature_timestamp']
    
    def get_requested_by_name(self, obj):
        if obj.requested_by:
            return f"{obj.requested_by.last_name} {obj.requested_by.first_name}"
        return None
    
    def get_approver_name(self, obj):
        if obj.approver:
            return f"{obj.approver.last_name} {obj.approver.first_name}"
        return None
    
    def get_document_info(self, obj):
        if obj.document:
            return {
                'id': obj.document.id,
                'document_id': str(obj.document.document_id),
                'reference_number': obj.document.reference_number,
                'title': obj.document.title,
                'document_type': obj.document.document_type.name,
                'status': obj.document.status,
                'status_display': obj.document.get_status_display(),
            }
        return None
    
    def get_request_info(self, obj):
        if obj.request:
            return {
                'id': obj.request.id,
                'request_id': str(obj.request.request_id),
                'reference_number': obj.request.reference_number,
                'title': obj.request.title,
                'document_type': obj.request.document_type.name,
                'status': obj.request.status,
                'status_display': obj.request.get_status_display(),
            }
        return None


class OfficerApprovalRequestSerializer(serializers.ModelSerializer):
    """
    Serializer để cán bộ xã tạo yêu cầu phê duyệt cho chủ tịch xã
    """
    class Meta:
        model = Approval
        fields = [
            'title', 'description', 'document', 'request',
            'priority', 'notes', 'due_date'
        ]
    
    def validate(self, attrs):
        # Kiểm tra phải có document hoặc request
        if not attrs.get('document') and not attrs.get('request'):
            raise serializers.ValidationError(
                "Phải liên kết đến ít nhất một giấy tờ hoặc yêu cầu."
            )
        return attrs
    
    def create(self, validated_data):
        # Thêm người dùng hiện tại là người yêu cầu phê duyệt
        validated_data['requested_by'] = self.context['request'].user
        validated_data['status'] = 'pending'
        return super().create(validated_data)


class ChairmanApprovalUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer để chủ tịch xã cập nhật trạng thái phê duyệt
    """
    class Meta:
        model = Approval
        fields = [
            'status', 'approval_reason', 'rejection_reason', 'notes'
        ]
    
    def validate_status(self, value):
        if value not in ['approved', 'rejected']:
            raise serializers.ValidationError(
                "Trạng thái phải là 'approved' hoặc 'rejected'."
            )
        return value
    
    def update(self, instance, validated_data):
        if instance.status != 'pending':
            raise serializers.ValidationError(
                "Chỉ có thể cập nhật phê duyệt ở trạng thái 'pending'."
            )
        
        # Cập nhật thời gian và người phê duyệt
        if validated_data.get('status') in ['approved', 'rejected']:
            validated_data['approved_at'] = timezone.now()
            validated_data['approver'] = self.context['request'].user
        
        return super().update(instance, validated_data)
