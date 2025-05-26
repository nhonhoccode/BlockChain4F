from rest_framework import serializers
from apps.administrative.models import Document
from apps.accounts.models import User

class UserMinimalSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name']
        
    def get_full_name(self, obj):
        return f"{obj.last_name} {obj.first_name}" if obj.last_name and obj.first_name else obj.username

class DocumentSerializer(serializers.ModelSerializer):
    """
    Serializer for Document model that properly maps fields for the frontend
    """
    citizen_details = serializers.SerializerMethodField()
    issued_by_details = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()
    document_type_display = serializers.SerializerMethodField()
    is_valid = serializers.SerializerMethodField()
    
    class Meta:
        model = Document
        fields = [
            'id', 'document_id', 'document_type', 'document_type_display',
            'title', 'description', 'content', 'file',
            'created_at', 'updated_at', 'issue_date', 'valid_from', 'valid_until',
            'status', 'status_display', 'citizen', 'citizen_details',
            'issued_by', 'issued_by_details', 'blockchain_status',
            'blockchain_tx_id', 'blockchain_timestamp', 'is_valid'
        ]
    
    def get_citizen_details(self, obj):
        if obj.citizen:
            return UserMinimalSerializer(obj.citizen).data
        return None
    
    def get_issued_by_details(self, obj):
        if obj.issued_by:
            return UserMinimalSerializer(obj.issued_by).data
        return None
    
    def get_status_display(self, obj):
        status_map = {
            'draft': 'Bản nháp',
            'active': 'Đang hiệu lực',
            'revoked': 'Đã thu hồi',
            'expired': 'Hết hạn'
        }
        return status_map.get(obj.status, obj.status)
    
    def get_document_type_display(self, obj):
        document_type_map = {
            'birth_certificate': 'Giấy khai sinh',
            'id_card': 'Chứng minh nhân dân',
            'residence_certificate': 'Đăng ký thường trú',
            'marriage_certificate': 'Giấy đăng ký kết hôn',
            'temporary_residence': 'Xác nhận tạm trú',
            'death_certificate': 'Giấy chứng tử'
        }
        return document_type_map.get(obj.document_type, obj.document_type)
    
    def get_is_valid(self, obj):
        return obj.is_valid() if hasattr(obj, 'is_valid') else obj.status == 'active' 