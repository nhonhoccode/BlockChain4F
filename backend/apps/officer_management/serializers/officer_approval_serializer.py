from rest_framework import serializers
from ..models import OfficerApproval


class OfficerApprovalSerializer(serializers.ModelSerializer):
    """
    Serializer cho model OfficerApproval
    """
    approved_by_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = OfficerApproval
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
    
    def get_approved_by_name(self, obj):
        if obj.approved_by:
            return f"{obj.approved_by.last_name} {obj.approved_by.first_name}"
        return None


class OfficerApprovalListSerializer(serializers.ModelSerializer):
    """
    Serializer nhẹ hơn cho danh sách phê duyệt cán bộ
    """
    approved_by_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = OfficerApproval
        fields = [
            'id', 'officer_request', 'approved_by', 'approved_by_name',
            'status', 'status_display', 'created_at'
        ]
    
    def get_approved_by_name(self, obj):
        if obj.approved_by:
            return f"{obj.approved_by.last_name} {obj.approved_by.first_name}"
        return None


class OfficerApprovalDetailSerializer(serializers.ModelSerializer):
    """
    Serializer đầy đủ cho chi tiết phê duyệt cán bộ
    """
    approved_by_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    officer_request_detail = serializers.SerializerMethodField()
    
    class Meta:
        model = OfficerApproval
        fields = '__all__'
    
    def get_approved_by_name(self, obj):
        if obj.approved_by:
            return f"{obj.approved_by.last_name} {obj.approved_by.first_name}"
        return None
    
    def get_officer_request_detail(self, obj):
        from .officer_request_serializer import OfficerRequestListSerializer
        return OfficerRequestListSerializer(obj.officer_request).data
