from rest_framework import serializers
from apps.administrative.models import DocumentType

class DocumentTypeProcedureSerializer(serializers.ModelSerializer):
    """
    Serializer that formats DocumentType data to match the frontend's procedure format
    """
    id = serializers.CharField(source='code')
    name = serializers.CharField()
    description = serializers.CharField()
    processingTime = serializers.SerializerMethodField()
    requiredDocuments = serializers.SerializerMethodField()
    fee = serializers.SerializerMethodField()
    blockchainVerified = serializers.SerializerMethodField()
    detailedDescription = serializers.CharField(source='description')
    category = serializers.SerializerMethodField()
    
    class Meta:
        model = DocumentType
        fields = [
            'id', 'name', 'description', 'processingTime', 'requiredDocuments',
            'fee', 'blockchainVerified', 'detailedDescription', 'category'
        ]
    
    def get_processingTime(self, obj):
        """Format processing time for frontend"""
        days = obj.estimated_processing_days
        if days == 1:
            return "1 ngày làm việc"
        else:
            return f"{days} ngày làm việc"
    
    def get_requiredDocuments(self, obj):
        """Get required documents list"""
        return obj.required_attachments or []
    
    def get_fee(self, obj):
        """Format fee for frontend"""
        if obj.fee == 0:
            return "Miễn phí"
        else:
            return f"{int(obj.fee):,} VNĐ"
    
    def get_blockchainVerified(self, obj):
        """Check if document type is stored on blockchain"""
        return obj.store_on_blockchain
    
    def get_category(self, obj):
        """Map document type to a category"""
        # Map document types to categories based on name or other attributes
        code = obj.code.lower()
        name = obj.name.lower()
        
        if 'khai sinh' in name or 'kết hôn' in name or 'chứng tử' in name or 'độc thân' in name:
            return 'civil'
        elif 'thường trú' in name or 'tạm trú' in name or 'cư trú' in name:
            return 'residence'
        elif 'cccd' in name or 'căn cước' in name or 'cmnd' in name or 'chứng minh' in name:
            return 'identity'
        elif 'đất' in name or 'nhà' in name or 'chuyển nhượng' in name or 'xây dựng' in name:
            return 'land'
        elif 'kinh doanh' in name:
            return 'business'
        else:
            return 'other' 