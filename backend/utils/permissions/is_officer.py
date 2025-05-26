from rest_framework import permissions

class IsOfficer(permissions.BasePermission):
    """
    Permission check for officer role.
    """
    message = "Only officers can perform this action."
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_officer 