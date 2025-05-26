from rest_framework import serializers
from ..models import OfficerAssignment


class OfficerAssignmentSerializer(serializers.ModelSerializer):
    """
    Serializer cho model OfficerAssignment
    """
    officer_name = serializers.SerializerMethodField()
    assigned_by_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = OfficerAssignment
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
    
    def get_officer_name(self, obj):
        if obj.officer:
            return f"{obj.officer.last_name} {obj.officer.first_name}"
        return None
    
    def get_assigned_by_name(self, obj):
        if obj.assigned_by:
            return f"{obj.assigned_by.last_name} {obj.assigned_by.first_name}"
        return None


class OfficerAssignmentListSerializer(serializers.ModelSerializer):
    """
    Serializer nhẹ hơn cho danh sách nhiệm vụ cán bộ
    """
    officer_name = serializers.SerializerMethodField()
    assigned_by_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = OfficerAssignment
        fields = [
            'id', 'officer', 'officer_name', 'title', 'status',
            'status_display', 'due_date', 'assigned_by', 'assigned_by_name',
            'created_at'
        ]
    
    def get_officer_name(self, obj):
        if obj.officer:
            return f"{obj.officer.last_name} {obj.officer.first_name}"
        return None
    
    def get_assigned_by_name(self, obj):
        if obj.assigned_by:
            return f"{obj.assigned_by.last_name} {obj.assigned_by.first_name}"
        return None


class OfficerAssignmentDetailSerializer(serializers.ModelSerializer):
    """
    Serializer đầy đủ cho chi tiết nhiệm vụ cán bộ
    """
    officer_name = serializers.SerializerMethodField()
    assigned_by_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = OfficerAssignment
        fields = '__all__'
    
    def get_officer_name(self, obj):
        if obj.officer:
            return f"{obj.officer.last_name} {obj.officer.first_name}"
        return None
    
    def get_assigned_by_name(self, obj):
        if obj.assigned_by:
            return f"{obj.assigned_by.last_name} {obj.assigned_by.first_name}"
        return None


class OfficerAssignmentCreateSerializer(serializers.ModelSerializer):
    """
    Serializer để tạo nhiệm vụ mới cho cán bộ
    """
    class Meta:
        model = OfficerAssignment
        fields = [
            'title', 'description', 'priority', 'due_date',
            'related_request', 'related_document'
        ]
    
    def create(self, validated_data):
        # Mặc định trạng thái là 'assigned'
        validated_data['status'] = 'assigned'
        return super().create(validated_data)
