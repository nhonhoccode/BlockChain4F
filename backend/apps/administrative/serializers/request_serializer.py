from rest_framework import serializers
from django.utils import timezone
from ..models import AdminRequest
from .document_type_serializer import DocumentTypeListSerializer


class RequestSerializer(serializers.ModelSerializer):
    """
    Serializer cho model Request
    """
    class Meta:
        model = AdminRequest
        fields = '__all__'
        read_only_fields = ['request_id', 'created_at', 'updated_at', 
                           'blockchain_transaction_id', 'blockchain_updated_at', 
                           'is_recorded_blockchain', 'reference_number']


class RequestListSerializer(serializers.ModelSerializer):
    """
    Serializer nhẹ hơn cho danh sách yêu cầu
    """
    document_type_name = serializers.CharField(source='document_type.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    requestor_name = serializers.SerializerMethodField()
    assigned_officer_name = serializers.SerializerMethodField()
    is_overdue = serializers.BooleanField(read_only=True)
    days_until_due = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = AdminRequest
        fields = [
            'id', 'request_id', 'reference_number', 'title', 
            'document_type', 'document_type_name', 'status', 'status_display',
            'priority', 'priority_display', 'created_at', 'submitted_date', 
            'due_date', 'requestor', 'requestor_name', 'assigned_officer',
            'assigned_officer_name', 'is_overdue', 'days_until_due'
        ]
    
    def get_requestor_name(self, obj):
        if obj.requestor:
            return f"{obj.requestor.last_name} {obj.requestor.first_name}"
        return None
    
    def get_assigned_officer_name(self, obj):
        if obj.assigned_officer:
            return f"{obj.assigned_officer.last_name} {obj.assigned_officer.first_name}"
        return None


class RequestDetailSerializer(serializers.ModelSerializer):
    """
    Serializer đầy đủ cho chi tiết yêu cầu
    """
    document_type = DocumentTypeListSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    requestor_name = serializers.SerializerMethodField()
    assigned_officer_name = serializers.SerializerMethodField()
    approver_name = serializers.SerializerMethodField()
    is_overdue = serializers.BooleanField(read_only=True)
    days_until_due = serializers.IntegerField(read_only=True)
    total_processing_time = serializers.SerializerMethodField()
    attachments = serializers.SerializerMethodField()
    resulting_documents = serializers.SerializerMethodField()
    
    class Meta:
        model = AdminRequest
        fields = '__all__'
        read_only_fields = ['request_id', 'created_at', 'updated_at', 
                           'blockchain_transaction_id', 'blockchain_updated_at', 
                           'is_recorded_blockchain', 'reference_number']
    
    def get_requestor_name(self, obj):
        if obj.requestor:
            return f"{obj.requestor.last_name} {obj.requestor.first_name}"
        return None
    
    def get_assigned_officer_name(self, obj):
        if obj.assigned_officer:
            return f"{obj.assigned_officer.last_name} {obj.assigned_officer.first_name}"
        return None
    
    def get_approver_name(self, obj):
        if obj.approver:
            return f"{obj.approver.last_name} {obj.approver.first_name}"
        return None
    
    def get_total_processing_time(self, obj):
        """Tính tổng thời gian xử lý (tính bằng ngày)"""
        if obj.status in ['completed', 'cancelled', 'rejected'] and obj.submitted_date:
            end_date = obj.completed_date or obj.updated_at
            return (end_date - obj.submitted_date).days
        elif obj.submitted_date:
            return (timezone.now() - obj.submitted_date).days
        return None
    
    def get_attachments(self, obj):
        """Lấy danh sách tài liệu đính kèm"""
        from ..serializers.attachment_serializer import AttachmentListSerializer
        return AttachmentListSerializer(obj.attachments.all(), many=True).data
    
    def get_resulting_documents(self, obj):
        """Lấy danh sách giấy tờ đã tạo từ yêu cầu này"""
        from ..serializers.document_serializer import DocumentListSerializer
        return DocumentListSerializer(obj.resulting_documents.all(), many=True).data


class CitizenRequestCreateSerializer(serializers.ModelSerializer):
    """
    Serializer để công dân tạo yêu cầu mới
    """
    class Meta:
        model = AdminRequest
        fields = [
            'document_type', 'title', 'description', 
            'data', 'notes', 'status'
        ]
        extra_kwargs = {
            'status': {'default': 'draft'},
        }
    
    def create(self, validated_data):
        # Thêm người dùng hiện tại là requestor
        validated_data['requestor'] = self.context['request'].user
        return super().create(validated_data)


class SubmitRequestSerializer(serializers.ModelSerializer):
    """
    Serializer để nộp yêu cầu (chuyển từ draft sang submitted)
    """
    class Meta:
        model = AdminRequest
        fields = ['status']
        read_only_fields = ['request_id', 'reference_number']
        
    def validate_status(self, value):
        if value != 'submitted':
            raise serializers.ValidationError("Trạng thái phải là 'submitted'.")
        return value
    
    def update(self, instance, validated_data):
        if instance.status != 'draft':
            raise serializers.ValidationError("Chỉ có thể nộp yêu cầu ở trạng thái 'draft'.")
        
        # Cập nhật ngày nộp
        validated_data['submitted_date'] = timezone.now()
        
        # Tính toán ngày đến hạn dựa trên số ngày xử lý dự kiến của loại giấy tờ
        if not instance.due_date and instance.document_type.estimated_processing_days:
            days = instance.document_type.estimated_processing_days
            validated_data['due_date'] = (timezone.now() + timezone.timedelta(days=days)).date()
        
        return super().update(instance, validated_data)


class OfficerRequestUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer để cán bộ xã cập nhật yêu cầu
    """
    class Meta:
        model = AdminRequest
        fields = [
            'status', 'assigned_officer', 'notes',
            'priority', 'due_date', 'rejection_reason',
            'additional_info_request'
        ]
    
    def validate_status(self, value):
        current_status = self.instance.status if self.instance else None
        allowed_transitions = {
            'submitted': ['in_review', 'rejected', 'cancelled'],
            'in_review': ['additional_info_required', 'approved', 'rejected', 'cancelled'],
            'additional_info_required': ['in_review', 'approved', 'rejected', 'cancelled'],
            'approved': ['processing', 'rejected', 'cancelled'],
            'processing': ['completed', 'cancelled']
        }
        
        if current_status in allowed_transitions and value not in allowed_transitions[current_status]:
            valid_statuses = ", ".join(allowed_transitions[current_status])
            raise serializers.ValidationError(
                f"Không thể chuyển từ trạng thái '{current_status}' sang '{value}'. "
                f"Các trạng thái hợp lệ: {valid_statuses}"
            )
        return value
    
    def update(self, instance, validated_data):
        # Cập nhật thời gian tương ứng với trạng thái
        if 'status' in validated_data:
            status = validated_data['status']
            if status == 'approved' and not instance.approved_date:
                validated_data['approved_date'] = timezone.now()
                validated_data['approver'] = self.context['request'].user
            elif status == 'completed' and not instance.completed_date:
                validated_data['completed_date'] = timezone.now()
        
        return super().update(instance, validated_data)
