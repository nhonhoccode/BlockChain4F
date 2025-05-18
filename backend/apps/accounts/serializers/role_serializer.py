from rest_framework import serializers
from ..models import Role, CustomPermission


class CustomPermissionSerializer(serializers.ModelSerializer):
    """
    Serializer for the CustomPermission model
    """
    class Meta:
        model = CustomPermission
        fields = ('id', 'name', 'codename', 'description', 'module')
        read_only_fields = ('id',)


class RoleSerializer(serializers.ModelSerializer):
    """
    Serializer for the Role model
    """
    permissions = CustomPermissionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Role
        fields = ('id', 'name', 'description', 'permissions', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')


class RoleAssignmentSerializer(serializers.Serializer):
    """
    Serializer for assigning roles to users
    """
    role_name = serializers.ChoiceField(
        choices=Role.ROLE_CHOICES,
        required=True
    )
    
    def validate_role_name(self, value):
        try:
            Role.objects.get(name=value)
        except Role.DoesNotExist:
            raise serializers.ValidationError(f"Role '{value}' does not exist.")
        return value
