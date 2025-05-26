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
    profile = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = (
            'id', 'email', 'first_name', 'last_name', 'phone_number',
            'roles', 'is_active', 'is_verified', 'blockchain_address', 
            'last_blockchain_update', 'date_joined', 'profile'
        )
        read_only_fields = ('id', 'is_verified', 'blockchain_address', 'last_blockchain_update', 'date_joined', 'profile')
    
    def get_profile(self, obj):
        """
        Get profile data including gender
        """
        try:
            if hasattr(obj, 'profile'):
                profile = obj.profile
                
                # Safely handle the avatar/profile_picture fields
                avatar = None
                if hasattr(profile, 'avatar') and profile.avatar:
                    try:
                        avatar = profile.avatar.url if profile.avatar else None
                    except (ValueError, AttributeError):
                        avatar = None
                        
                if avatar is None and hasattr(profile, 'profile_picture') and profile.profile_picture:
                    try:
                        avatar = profile.profile_picture.url if profile.profile_picture else None
                    except (ValueError, AttributeError):
                        avatar = None
                
                return {
                    'id': profile.id,
                    'gender': profile.gender,
                    'date_of_birth': profile.date_of_birth,
                    'phone_number': getattr(profile, 'phone_number', None),
                    'address': getattr(profile, 'address', None),
                    'ward': getattr(profile, 'ward', None),
                    'district': getattr(profile, 'district', None),
                    'city': getattr(profile, 'city', None),
                    'id_card_number': getattr(profile, 'id_card_number', None),
                    'id_card_issue_date': getattr(profile, 'id_card_issue_date', None),
                    'id_card_issue_place': getattr(profile, 'id_card_issue_place', None),
                    'avatar': avatar,
                }
        except Exception as e:
            print(f"Error serializing profile: {str(e)}")
        return None


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
