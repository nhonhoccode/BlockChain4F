from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User, Role, Profile, CustomPermission


class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    verbose_name_plural = 'Profile'
    fk_name = 'user'


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Admin configuration for the custom User model
    """
    list_display = ('email', 'first_name', 'last_name', 'is_staff', 'is_active', 'get_roles')
    list_filter = ('is_staff', 'is_active', 'roles')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)
    inlines = (ProfileInline,)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name', 'phone_number')}),
        (_('Roles'), {'fields': ('roles',)}),
        (_('Blockchain info'), {'fields': ('blockchain_address', 'last_blockchain_update', 'is_verified')}),
        (_('Permissions'), {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'first_name', 'last_name', 'roles'),
        }),
    )
    
    def get_roles(self, obj):
        return ", ".join([role.get_name_display() for role in obj.roles.all()])
    
    get_roles.short_description = 'Roles'


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    """
    Admin configuration for the Role model
    """
    list_display = ('name', 'description', 'get_permissions', 'get_users_count')
    search_fields = ('name', 'description')
    
    def get_permissions(self, obj):
        """
        Get permissions for a role through the reverse relationship
        """
        try:
            # CustomPermission has a ManyToMany to Role with related_name='permissions'
            permission_list = [perm.name for perm in obj.permissions.all()] if hasattr(obj, 'permissions') else []
            return ", ".join(permission_list)
        except:
            return ""
    
    def get_users_count(self, obj):
        """
        Get the count of users with this role
        """
        try:
            return obj.users.count() if hasattr(obj, 'users') else 0
        except:
            return 0
    
    get_permissions.short_description = 'Permissions'
    get_users_count.short_description = 'Users count'


@admin.register(CustomPermission)
class CustomPermissionAdmin(admin.ModelAdmin):
    """
    Admin configuration for the CustomPermission model
    """
    list_display = ('name', 'codename', 'module', 'get_roles')
    list_filter = ('module', 'roles')
    search_fields = ('name', 'codename', 'description')
    # Use filter_horizontal for the many-to-many field
    filter_horizontal = ('roles',)
    
    def get_roles(self, obj):
        return ", ".join([role.get_name_display() for role in obj.roles.all()])
    
    get_roles.short_description = 'Roles'
