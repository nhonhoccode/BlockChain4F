from rest_framework import serializers
from django.conf import settings
from ..models import Document
from .document_type_serializer import DocumentTypeListSerializer


class DocumentSerializer(serializers.ModelSerializer):
    """
    Serializer cho model Document
    """
    class Meta:
        model = Document
        fields = '__all__'
        read_only_fields = ['document_id', 'created_at', 'updated_at', 'verification_hash',
                            'blockchain_transaction_id', 'blockchain_address', 
                            'blockchain_updated_at', 'is_verified_blockchain']


class DocumentListSerializer(serializers.ModelSerializer):
    """
    Serializer nhẹ hơn cho danh sách giấy tờ
    """
    document_type_name = serializers.CharField(source='document_type.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    issued_to_name = serializers.SerializerMethodField()
    issued_by_name = serializers.SerializerMethodField()
    is_valid = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Document
        fields = [
            'id', 'document_id', 'reference_number', 'title', 
            'document_type', 'document_type_name', 'status', 'status_display',
            'issued_date', 'valid_until', 'issued_to', 'issued_to_name',
            'issued_by', 'issued_by_name', 'is_valid', 'is_verified_blockchain'
        ]
    
    def get_issued_to_name(self, obj):
        if obj.issued_to:
            return f"{obj.issued_to.last_name} {obj.issued_to.first_name}"
        return None
    
    def get_issued_by_name(self, obj):
        if obj.issued_by:
            return f"{obj.issued_by.last_name} {obj.issued_by.first_name}"
        return None


class DocumentDetailSerializer(serializers.ModelSerializer):
    """
    Serializer đầy đủ cho chi tiết giấy tờ
    """
    document_type = DocumentTypeListSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    issued_to_name = serializers.SerializerMethodField()
    issued_by_name = serializers.SerializerMethodField()
    is_valid = serializers.BooleanField(read_only=True)
    request_info = serializers.SerializerMethodField()
    
    class Meta:
        model = Document
        fields = '__all__'
        read_only_fields = ['document_id', 'created_at', 'updated_at', 'verification_hash',
                            'blockchain_transaction_id', 'blockchain_address', 
                            'blockchain_updated_at', 'is_verified_blockchain']
    
    def get_issued_to_name(self, obj):
        if obj.issued_to:
            return f"{obj.issued_to.last_name} {obj.issued_to.first_name}"
        return None
    
    def get_issued_by_name(self, obj):
        if obj.issued_by:
            return f"{obj.issued_by.last_name} {obj.issued_by.first_name}"
        return None
    
    def get_request_info(self, obj):
        if obj.request:
            return {
                'id': obj.request.id,
                'request_number': obj.request.request_number,
                'status': obj.request.status,
                'status_display': obj.request.get_status_display(),
                'submitted_at': obj.request.submitted_at,
            }
        return None


class DocumentCreateSerializer(serializers.ModelSerializer):
    """
    Serializer để cán bộ xã tạo giấy tờ mới
    """
    class Meta:
        model = Document
        fields = [
            'document_type', 'title', 'content', 'data',
            'issued_to', 'request', 'valid_from', 'valid_until',
            'notes', 'status'
        ]
        extra_kwargs = {
            'status': {'default': 'draft'},
        }
    
    def validate(self, data):
        # Kiểm tra nếu document_type cần phê duyệt thì status mặc định là "pending_approval"
        document_type = data.get('document_type')
        if document_type and document_type.approval_required:
            data['status'] = 'pending_approval'
        
        return data
    
    def create(self, validated_data):
        # Thêm người dùng hiện tại là người tạo giấy tờ
        validated_data['issued_by'] = self.context['request'].user
        return super().create(validated_data)


class DocumentVerificationSerializer(serializers.ModelSerializer):
    """
    Serializer cho xác thực giấy tờ
    """
    document_type_name = serializers.CharField(source='document_type.name', read_only=True)
    issued_to_name = serializers.SerializerMethodField()
    issued_by_name = serializers.SerializerMethodField()
    is_valid = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Document
        fields = [
            'document_id', 'reference_number', 'title', 
            'document_type_name', 'status', 'issued_date', 
            'valid_from', 'valid_until', 'issued_to_name',
            'issued_by_name', 'is_valid', 'is_verified_blockchain',
            'verification_hash', 'blockchain_transaction_id'
        ]
    
    def get_issued_to_name(self, obj):
        if obj.issued_to:
            return f"{obj.issued_to.last_name} {obj.issued_to.first_name}"
        return None
    
    def get_issued_by_name(self, obj):
        if obj.issued_by:
            return f"{obj.issued_by.last_name} {obj.issued_by.first_name}"
        return None
