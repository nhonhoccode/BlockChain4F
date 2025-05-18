from rest_framework import permissions

class IsCitizen(permissions.BasePermission):
    """
    Permission check for citizen role.
    """
    message = "Only citizens can perform this action."
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_citizen 