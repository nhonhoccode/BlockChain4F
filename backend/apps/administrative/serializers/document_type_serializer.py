from rest_framework import serializers
from ..models import DocumentType


class DocumentTypeSerializer(serializers.ModelSerializer):
    """
    Serializer cho model DocumentType
    """
    class Meta:
        model = DocumentType
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class DocumentTypeListSerializer(serializers.ModelSerializer):
    """
    Serializer nhẹ hơn cho danh sách loại giấy tờ
    """
    complexity_display = serializers.CharField(source='get_complexity_display', read_only=True)
    
    class Meta:
        model = DocumentType
        fields = [
            'id', 'name', 'code', 'description', 'complexity', 
            'complexity_display', 'estimated_processing_days', 
            'fee', 'is_active'
        ]


class DocumentTypeDetailSerializer(serializers.ModelSerializer):
    """
    Serializer đầy đủ cho chi tiết loại giấy tờ
    """
    complexity_display = serializers.CharField(source='get_complexity_display', read_only=True)
    document_count = serializers.SerializerMethodField()
    
    class Meta:
        model = DocumentType
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
    
    def get_document_count(self, obj):
        """Trả về số lượng giấy tờ đã tạo thuộc loại này"""
        return obj.documents.count()
