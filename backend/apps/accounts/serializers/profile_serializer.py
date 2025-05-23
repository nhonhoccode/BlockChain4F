from rest_framework import serializers
from ..models import Profile


class ProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for the Profile model
    """
    full_name = serializers.CharField(read_only=True)
    user_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Profile
        fields = (
            'id', 'user', 'first_name', 'last_name', 'full_name', 'date_of_birth', 
            'gender', 'address', 'city', 'district', 'ward', 'postal_code',
            'id_card_number', 'id_card_issue_date', 'id_card_issue_place',
            'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship',
            'profile_picture', 'created_at', 'updated_at', 'user_details'
        )
        read_only_fields = ('id', 'user', 'created_at', 'updated_at', 'user_details')
    
    def get_user_details(self, obj):
        """
        Return user details
        """
        user = obj.user
        return {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'username': user.username,
            'is_active': user.is_active
        }


class ProfileUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating a profile
    """
    class Meta:
        model = Profile
        fields = (
            'first_name', 'last_name', 'date_of_birth', 'gender',
            'address', 'city', 'district', 'ward', 'postal_code',
            'id_card_number', 'id_card_issue_date', 'id_card_issue_place',
            'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship',
            'profile_picture'
        )
    
    def update(self, instance, validated_data):
        user = instance.user
        
        # Update user's first and last name if provided
        if 'first_name' in validated_data:
            user.first_name = validated_data['first_name']
        if 'last_name' in validated_data:
            user.last_name = validated_data['last_name']
        
        user.save()
        
        # Update profile fields
        return super().update(instance, validated_data)
