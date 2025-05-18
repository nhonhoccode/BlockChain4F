from rest_framework import serializers
from .models.feedback import Feedback


class FeedbackSerializer(serializers.ModelSerializer):
    """
    Serializer cho model Feedback
    """
    submitter_name = serializers.SerializerMethodField()
    handler_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    feedback_type_display = serializers.CharField(source='get_feedback_type_display', read_only=True)
    
    class Meta:
        model = Feedback
        fields = '__all__'
        read_only_fields = ['feedback_id', 'submitter', 'handler', 'created_at', 'updated_at',
                           'response', 'response_date', 'is_satisfied', 'satisfaction_rating',
                           'satisfaction_comment']
    
    def get_submitter_name(self, obj):
        if obj.submitter:
            return f"{obj.submitter.last_name} {obj.submitter.first_name}"
        return None
    
    def get_handler_name(self, obj):
        if obj.handler:
            return f"{obj.handler.last_name} {obj.handler.first_name}"
        return None


class FeedbackListSerializer(serializers.ModelSerializer):
    """
    Serializer nhẹ hơn cho danh sách phản hồi
    """
    submitter_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    feedback_type_display = serializers.CharField(source='get_feedback_type_display', read_only=True)
    
    class Meta:
        model = Feedback
        fields = [
            'id', 'feedback_id', 'title', 'feedback_type', 'feedback_type_display',
            'submitter', 'submitter_name', 'status', 'status_display',
            'created_at', 'is_anonymous', 'is_public'
        ]
    
    def get_submitter_name(self, obj):
        if obj.submitter and not obj.is_anonymous:
            return f"{obj.submitter.last_name} {obj.submitter.first_name}"
        return "Ẩn danh" if obj.is_anonymous else None


class FeedbackDetailSerializer(serializers.ModelSerializer):
    """
    Serializer đầy đủ cho chi tiết phản hồi
    """
    submitter_name = serializers.SerializerMethodField()
    handler_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    feedback_type_display = serializers.CharField(source='get_feedback_type_display', read_only=True)
    
    class Meta:
        model = Feedback
        fields = '__all__'
    
    def get_submitter_name(self, obj):
        if obj.submitter and not obj.is_anonymous:
            return f"{obj.submitter.last_name} {obj.submitter.first_name}"
        return "Ẩn danh" if obj.is_anonymous else None
    
    def get_handler_name(self, obj):
        if obj.handler:
            return f"{obj.handler.last_name} {obj.handler.first_name}"
        return None


class FeedbackCreateSerializer(serializers.ModelSerializer):
    """
    Serializer để người dùng tạo phản hồi mới
    """
    class Meta:
        model = Feedback
        fields = [
            'title', 'content', 'feedback_type', 
            'related_document', 'related_request',
            'is_anonymous', 'is_public'
        ]
    
    def create(self, validated_data):
        # Thêm người dùng hiện tại là người gửi phản hồi
        validated_data['submitter'] = self.context['request'].user
        return super().create(validated_data)


class FeedbackResponseSerializer(serializers.ModelSerializer):
    """
    Serializer cho cán bộ phản hồi về góp ý
    """
    class Meta:
        model = Feedback
        fields = ['response']
    
    def update(self, instance, validated_data):
        response = validated_data.get('response')
        instance.respond(response, self.context['request'].user)
        return instance


class FeedbackSatisfactionSerializer(serializers.ModelSerializer):
    """
    Serializer cho đánh giá mức độ hài lòng với phản hồi
    """
    class Meta:
        model = Feedback
        fields = ['satisfaction_rating', 'satisfaction_comment', 'is_satisfied']
    
    def update(self, instance, validated_data):
        rating = validated_data.get('satisfaction_rating')
        comment = validated_data.get('satisfaction_comment')
        is_satisfied = validated_data.get('is_satisfied')
        instance.rate_satisfaction(rating, comment, is_satisfied)
        return instance 