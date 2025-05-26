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
    request_type = serializers.SerializerMethodField()
    requestor_details = serializers.SerializerMethodField()
    
    class Meta:
        model = AdminRequest
        fields = '__all__'
        read_only_fields = ['request_id', 'created_at', 'updated_at', 
                           'blockchain_transaction_id', 'blockchain_updated_at', 
                           'is_recorded_blockchain', 'reference_number', 'request_type', 'requestor_details']
    
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
    
    def get_request_type(self, obj):
        """Trả về loại yêu cầu dưới dạng chuỗi cho frontend"""
        # Đầu tiên thử lấy từ trường document_type nếu có
        if hasattr(obj, 'document_type') and obj.document_type:
            if hasattr(obj.document_type, 'code') and obj.document_type.code:
                return obj.document_type.code
            if hasattr(obj.document_type, 'name') and obj.document_type.name:
                return obj.document_type.name
        
        # Nếu không có document_type hoặc không lấy được thông tin, 
        # thử từ các trường khác mà frontend có thể sử dụng
        if hasattr(obj, 'type'):
            return obj.type
        
        # Cố gắng chuyển đổi từ các trường khác nếu có
        if hasattr(obj, 'request_type') and obj.request_type:
            # Danh sách các loại giấy tờ phổ biến
            document_types = {
                'birth_certificate': 'Giấy khai sinh',
                'death_certificate': 'Giấy chứng tử',
                'marriage_certificate': 'Giấy đăng ký kết hôn',
                'residence_certificate': 'Giấy xác nhận cư trú',
                'land_use_certificate': 'Giấy chứng nhận quyền sử dụng đất',
                'business_registration': 'Đăng ký kinh doanh',
                'construction_permit': 'Giấy phép xây dựng',
                'citizen_id': 'Căn cước công dân',
                'passport': 'Hộ chiếu',
                'driving_license': 'Giấy phép lái xe',
                'household_registration': 'Đăng ký hộ khẩu',
                'temporary_residence': 'Đăng ký tạm trú',
                'notarization': 'Công chứng, chứng thực'
            }
            
            if obj.request_type in document_types:
                return document_types[obj.request_type]
            return obj.request_type
        
        # Nếu không tìm thấy thông tin nào, trả về giá trị mặc định
        return "Chưa xác định"
    
    def get_requestor_details(self, obj):
        """Trả về thông tin đầy đủ về người yêu cầu"""
        # Xác định đối tượng người yêu cầu
        requestor = None
        if hasattr(obj, 'requestor') and obj.requestor:
            requestor = obj.requestor
        elif hasattr(obj, 'citizen') and obj.citizen:
            requestor = obj.citizen
        
        if not requestor:
            # Trả về thông tin mặc định nếu không có người yêu cầu
            return {
                'id': None,
                'first_name': '',
                'last_name': '',
                'email': '',
                'username': '',
                'full_name': 'Chưa xác định'
            }
            
        # Trả về thông tin cơ bản về người dùng
        result = {
            'id': requestor.id,
            'first_name': getattr(requestor, 'first_name', ''),
            'last_name': getattr(requestor, 'last_name', ''),
            'email': getattr(requestor, 'email', ''),
            'username': getattr(requestor, 'username', ''),
            'full_name': f"{getattr(requestor, 'last_name', '')} {getattr(requestor, 'first_name', '')}".strip() or 'Chưa xác định',
            'is_verified': getattr(requestor, 'is_verified', False)
        }
        
        # Thêm thông tin profile nếu có
        if hasattr(requestor, 'profile'):
            profile = requestor.profile
            if profile:
                result['profile'] = {
                    'id_number': getattr(profile, 'id_number', None),
                    'phone_number': getattr(profile, 'phone_number', None),
                    'address': getattr(profile, 'address', None),
                    'ward': getattr(profile, 'ward', None),
                    'district': getattr(profile, 'district', None),
                    'province': getattr(profile, 'province', None),
                    'profile_picture': getattr(profile, 'profile_picture', None) and profile.profile_picture.url if hasattr(profile.profile_picture, 'url') else None
                }
        
        return result


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
