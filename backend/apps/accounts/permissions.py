from rest_framework import permissions

class IsCitizen(permissions.BasePermission):
    """
    Permission để kiểm tra người dùng có vai trò 'citizen'.
    """
    message = 'Bạn không có quyền truy cập. Chỉ Công dân mới có thể thực hiện hành động này.'

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
            
        # Check both role field and roles ManyToMany relationship
        has_role_field = request.user.role == 'citizen'
        has_roles_relationship = request.user.roles.filter(name='citizen').exists()
        
        # Return True if either condition is met
        return has_role_field or has_roles_relationship

class IsOfficer(permissions.BasePermission):
    """
    Permission để kiểm tra người dùng có vai trò 'officer'.
    """
    message = 'Bạn không có quyền truy cập. Chỉ Cán bộ mới có thể thực hiện hành động này.'

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
            
        # Check both role field and roles ManyToMany relationship
        has_role_field = request.user.role == 'officer'
        has_roles_relationship = request.user.roles.filter(name='officer').exists()
        
        # For debugging
        print(f"Permission check for {request.user.email}: role={request.user.role}, has_role_field={has_role_field}, has_roles_relationship={has_roles_relationship}")
        
        # Return True if either condition is met
        return has_role_field or has_roles_relationship

class IsChairman(permissions.BasePermission):
    """
    Permission để kiểm tra người dùng có vai trò 'chairman'.
    """
    message = 'Bạn không có quyền truy cập. Chỉ Chủ tịch mới có thể thực hiện hành động này.'

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
            
        # Check both role field and roles ManyToMany relationship
        has_role_field = request.user.role == 'chairman'
        has_roles_relationship = request.user.roles.filter(name='chairman').exists()
        
        # For debugging
        print(f"Chairman check for {request.user.email}: role={request.user.role}, has_role_field={has_role_field}, has_roles_relationship={has_roles_relationship}")
        
        # Return True if either condition is met
        return has_role_field or has_roles_relationship

class IsOfficerOrChairman(permissions.BasePermission):
    """
    Permission để kiểm tra người dùng có vai trò 'officer' hoặc 'chairman'.
    """
    message = 'Bạn không có quyền truy cập. Chỉ Cán bộ hoặc Chủ tịch mới có thể thực hiện hành động này.'

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
            
        # Check role field
        role_field_check = request.user.role in ['officer', 'chairman']
        
        # Check roles ManyToMany relationship
        roles_relationship_check = (
            request.user.roles.filter(name__in=['officer', 'chairman']).exists()
        )
        
        # For debugging
        print(f"Officer/Chairman check for {request.user.email}: role={request.user.role}, role_field_check={role_field_check}, roles_relationship_check={roles_relationship_check}")
        
        # Return True if either condition is met
        return role_field_check or roles_relationship_check

class IsOwnerOrStaff(permissions.BasePermission):
    """
    Permission để kiểm tra người dùng là chủ sở hữu của tài nguyên hoặc là nhân viên quản trị.
    """
    message = 'Bạn không có quyền thực hiện hành động này.'

    def has_object_permission(self, request, view, obj):
        # Kiểm tra nếu người dùng là chủ sở hữu của đối tượng
        is_owner = hasattr(obj, 'user') and obj.user == request.user
        
        # Hoặc kiểm tra nếu obj có trường citizen (cho documents/requests)
        if hasattr(obj, 'citizen'):
            is_owner = obj.citizen == request.user
        
        # Kiểm tra nếu người dùng là cán bộ hoặc chủ tịch
        is_staff = request.user.role in ['officer', 'chairman']
        
        return is_owner or is_staff 