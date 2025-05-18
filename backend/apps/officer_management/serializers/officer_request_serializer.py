from rest_framework import serializers
from ..models import OfficerRequest
from apps.accounts.models import User


class OfficerRequestSerializer(serializers.ModelSerializer):
    """
    Serializer cho model OfficerRequest
    """
    user_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = OfficerRequest
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
    
    def get_user_name(self, obj):
        if obj.user:
            return f"{obj.user.last_name} {obj.user.first_name}"
        return None


class OfficerRequestListSerializer(serializers.ModelSerializer):
    """
    Serializer nhẹ hơn cho danh sách yêu cầu đăng ký cán bộ
    """
    user_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = OfficerRequest
        fields = [
            'id', 'user', 'user_name', 'position', 'status', 'status_display',
            'created_at', 'updated_at'
        ]
    
    def get_user_name(self, obj):
        if obj.user:
            return f"{obj.user.last_name} {obj.user.first_name}"
        return None


class OfficerRequestDetailSerializer(serializers.ModelSerializer):
    """
    Serializer đầy đủ cho chi tiết yêu cầu đăng ký cán bộ
    """
    user_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    approvals = serializers.SerializerMethodField()
    
    class Meta:
        model = OfficerRequest
        fields = '__all__'
    
    def get_user_name(self, obj):
        if obj.user:
            return f"{obj.user.last_name} {obj.user.first_name}"
        return None
    
    def get_approvals(self, obj):
        from .officer_approval_serializer import OfficerApprovalListSerializer
        approvals = obj.approvals.all().order_by('-created_at')
        return OfficerApprovalListSerializer(approvals, many=True).data


class OfficerRequestCreateSerializer(serializers.ModelSerializer):
    """
    Serializer để người dùng tạo yêu cầu đăng ký làm cán bộ
    """
    class Meta:
        model = OfficerRequest
        fields = [
            'position', 'qualifications', 'experience', 'motivation',
            'id_card_number', 'id_card_issue_date', 'id_card_issue_place',
            'additional_info'
        ]
    
    def create(self, validated_data):
        # Thêm người dùng hiện tại và trạng thái mặc định
        validated_data['user'] = self.context['request'].user
        validated_data['status'] = 'pending'
        return super().create(validated_data)
