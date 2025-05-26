from rest_framework import serializers
from django.utils import timezone
from ..models import Attachment


class AttachmentSerializer(serializers.ModelSerializer):
    """
    Serializer cho model Attachment
    """
    class Meta:
        model = Attachment
        fields = '__all__'
        read_only_fields = ['attachment_id', 'file_size', 'file_type', 'created_at', 'updated_at',
                           'verification_hash', 'verification_date', 'verified_by',
                           'is_stored_blockchain', 'blockchain_transaction_id']


class AttachmentListSerializer(serializers.ModelSerializer):
    """
    Serializer nhẹ hơn cho danh sách tài liệu đính kèm
    """
    attachment_type_display = serializers.CharField(source='get_attachment_type_display', read_only=True)
    uploaded_by_name = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()
    file_extension = serializers.ReadOnlyField()
    is_image = serializers.ReadOnlyField()
    is_pdf = serializers.ReadOnlyField()
    
    class Meta:
        model = Attachment
        fields = [
            'id', 'attachment_id', 'name', 'description', 
            'attachment_type', 'attachment_type_display', 
            'file', 'file_url', 'file_size', 'file_type', 
            'file_extension', 'is_image', 'is_pdf',
            'is_verified', 'uploaded_by', 'uploaded_by_name', 
            'created_at', 'is_stored_blockchain'
        ]
    
    def get_uploaded_by_name(self, obj):
        if obj.uploaded_by:
            return f"{obj.uploaded_by.last_name} {obj.uploaded_by.first_name}"
        return None
    
    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and request is not None:
            return request.build_absolute_uri(obj.file.url)
        return None


class AttachmentDetailSerializer(serializers.ModelSerializer):
    """
    Serializer đầy đủ cho chi tiết tài liệu đính kèm
    """
    attachment_type_display = serializers.CharField(source='get_attachment_type_display', read_only=True)
    uploaded_by_name = serializers.SerializerMethodField()
    verified_by_name = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()
    file_extension = serializers.ReadOnlyField()
    is_image = serializers.ReadOnlyField()
    is_pdf = serializers.ReadOnlyField()
    request_info = serializers.SerializerMethodField()
    document_info = serializers.SerializerMethodField()
    
    class Meta:
        model = Attachment
        fields = '__all__'
        read_only_fields = ['attachment_id', 'file_size', 'file_type', 'created_at', 'updated_at',
                           'verification_hash', 'verification_date', 'verified_by',
                           'is_stored_blockchain', 'blockchain_transaction_id']
    
    def get_uploaded_by_name(self, obj):
        if obj.uploaded_by:
            return f"{obj.uploaded_by.last_name} {obj.uploaded_by.first_name}"
        return None
    
    def get_verified_by_name(self, obj):
        if obj.verified_by:
            return f"{obj.verified_by.last_name} {obj.verified_by.first_name}"
        return None
    
    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and request is not None:
            return request.build_absolute_uri(obj.file.url)
        return None
    
    def get_request_info(self, obj):
        if obj.request:
            return {
                'id': obj.request.id,
                'request_id': str(obj.request.request_id),
                'reference_number': obj.request.reference_number,
                'title': obj.request.title,
            }
        return None
    
    def get_document_info(self, obj):
        if obj.document:
            return {
                'id': obj.document.id,
                'document_id': str(obj.document.document_id),
                'reference_number': obj.document.reference_number,
                'title': obj.document.title,
            }
        return None


class AttachmentUploadSerializer(serializers.ModelSerializer):
    """
    Serializer để tải lên tài liệu đính kèm mới
    """
    request = serializers.PrimaryKeyRelatedField(
        queryset=Attachment._meta.get_field('request').related_model.objects.all(),
        required=False,
        allow_null=True
    )
    document = serializers.PrimaryKeyRelatedField(
        queryset=Attachment._meta.get_field('document').related_model.objects.all(),
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = Attachment
        fields = [
            'name', 'description', 'attachment_type', 
            'file', 'request', 'document'
        ]
    
    def create(self, validated_data):
        # Thêm người dùng hiện tại là người tải lên
        validated_data['uploaded_by'] = self.context['request'].user
        return super().create(validated_data)


class AttachmentVerificationSerializer(serializers.ModelSerializer):
    """
    Serializer để xác thực tài liệu đính kèm
    """
    class Meta:
        model = Attachment
        fields = ['is_verified']
        
    def update(self, instance, validated_data):
        if validated_data.get('is_verified', False):
            # Cập nhật thông tin xác thực
            validated_data['verification_date'] = timezone.now()
            validated_data['verified_by'] = self.context['request'].user
            
            # Tạo mã băm xác thực nếu chưa có
            if not instance.verification_hash:
                import hashlib
                # Tạo chuỗi dữ liệu với các thông tin quan trọng
                data_string = f"{instance.attachment_id}|{instance.file.name}|{instance.uploaded_by_id}|{timezone.now().timestamp()}"
                # Tạo mã băm
                validated_data['verification_hash'] = hashlib.sha256(data_string.encode()).hexdigest()
        
        return super().update(instance, validated_data) 