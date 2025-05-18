from rest_framework import permissions

class IsOfficer(permissions.BasePermission):
    """
    Permission check for officer role.
    """
    message = "Only officers can perform this action."
    
    def has_permission(self, request, view):
        # Check both role field and roles ManyToMany field for better backward compatibility
        if not request.user.is_authenticated:
            return False
            
        # Check both role field and roles ManyToMany relationship
        has_role_field = request.user.role == 'officer'
        has_roles_relationship = request.user.roles.filter(name='officer').exists()
        
        # Log for debugging
        print(f"DEBUG: User {request.user.email} - role field: {request.user.role}, has_officer_role_field: {has_role_field}, has_officer_roles_relationship: {has_roles_relationship}")
        
        # Return True if either condition is met
        return has_role_field or has_roles_relationship 