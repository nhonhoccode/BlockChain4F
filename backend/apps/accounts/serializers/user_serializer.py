from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from ..models import Role

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the User model
    """
    roles = serializers.SlugRelatedField(
        slug_field='name',
        queryset=Role.objects.all(),
        many=True,
        required=False
    )
    
    class Meta:
        model = User
        fields = (
            'id', 'email', 'first_name', 'last_name', 'phone_number',
            'roles', 'is_active', 'is_verified', 'blockchain_address', 
            'last_blockchain_update', 'date_joined'
        )
        read_only_fields = ('id', 'is_verified', 'blockchain_address', 'last_blockchain_update', 'date_joined')


class UserCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating a new user
    """
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ('email', 'password', 'password_confirm', 'first_name', 'last_name', 'phone_number')
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True}
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        
        # Tự động gán vai trò công dân (citizen) cho người dùng mới
        citizen_role = Role.objects.get(name=Role.CITIZEN)
        user.roles.add(citizen_role)
        
        return user


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for changing password
    """
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(required=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({"new_password": "Password fields didn't match."})
        return attrs
