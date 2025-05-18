from rest_framework import permissions

class IsVerifiedUser(permissions.BasePermission):
    """
    Permission check for verified users.
    """
    message = "Your account must be verified to perform this action."
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_verified 