from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Role, Profile

class RoleSerializer(serializers.ModelSerializer):
    """
    Serializer cho model Role
    """
    class Meta:
        model = Role
        fields = ['id', 'name', 'description']

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer cho model User
    """
    password_confirm = serializers.CharField(write_only=True, required=False, style={'input_type': 'password'})
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password', 'password_confirm', 'is_staff']
        extra_kwargs = {
            'password': {'write_only': True},
            'is_staff': {'read_only': True},
            'first_name': {'required': False},
            'last_name': {'required': False}
        }
    
    def validate(self, data):
        # Kiểm tra xác nhận mật khẩu nếu đang tạo mới user
        if self.context.get('create_user', False) and 'password' in data:
            if data.get('password') != data.get('password_confirm'):
                raise serializers.ValidationError({"password_confirm": "Mật khẩu xác nhận không khớp"})
        
        return data
    
    def create(self, validated_data):
        # Loại bỏ password_confirm nếu có
        if 'password_confirm' in validated_data:
            validated_data.pop('password_confirm')
        
        password = validated_data.pop('password', None)
        
        # Tạo user mới
        user = User(**validated_data)
        
        # Đặt mật khẩu nếu có
        if password:
            user.set_password(password)
        
        user.save()
        return user

class ProfileSerializer(serializers.ModelSerializer):
    """
    Serializer cho model Profile
    """
    user_details = UserSerializer(source='user', read_only=True)
    role_details = RoleSerializer(source='role', read_only=True)
    
    class Meta:
        model = Profile
        fields = [
            'id', 'user', 'user_details', 'role', 'role_details',
            'phone_number', 'date_of_birth', 'id_number', 
            'id_issue_date', 'id_issue_place', 'address', 
            'ward', 'district', 'province', 'position', 
            'department', 'is_approved', 'approved_by', 
            'approved_at', 'avatar', 'bio', 'created_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'user_details', 'role_details']

class UserDetailSerializer(serializers.ModelSerializer):
    """
    Serializer chi tiết cho User kèm thông tin profile
    """
    profile = ProfileSerializer(read_only=True)
    role = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile', 'role']
    
    def get_role(self, obj):
        try:
            return obj.profile.role.name
        except:
            return None

class UserRegisterSerializer(serializers.ModelSerializer):
    """
    Serializer cho việc đăng ký người dùng mới
    """
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, style={'input_type': 'password'})
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name', 'last_name']
    
    def validate(self, data):
        # Kiểm tra email đã tồn tại chưa
        email = data.get('email')
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError({"email": "Email này đã được đăng ký"})
        
        # Kiểm tra xác nhận mật khẩu
        if data.get('password') != data.get('password_confirm'):
            raise serializers.ValidationError({"password_confirm": "Mật khẩu xác nhận không khớp"})
        
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        
        return user

class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer cho việc thay đổi mật khẩu
    """
    old_password = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})
    new_password = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})
    new_password_confirm = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})
    
    def validate(self, data):
        # Kiểm tra xác nhận mật khẩu mới
        if data.get('new_password') != data.get('new_password_confirm'):
            raise serializers.ValidationError({"new_password_confirm": "Mật khẩu xác nhận không khớp"})
        
        return data 