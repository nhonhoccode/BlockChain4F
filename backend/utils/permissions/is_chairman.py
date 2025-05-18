from rest_framework import permissions

class IsChairman(permissions.BasePermission):
    """
    Permission check for chairman role.
    """
    message = "Only chairman can perform this action."
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_chairman 