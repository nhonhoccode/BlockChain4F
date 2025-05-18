from rest_framework import permissions


class IsChairman(permissions.BasePermission):
    """
    Permission check for chairman role or admin (is_staff)
    """
    message = "Only chairman or admin can perform this action."
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and (request.user.is_chairman or request.user.is_staff)


class IsOfficer(permissions.BasePermission):
    """
    Permission check for officer role.
    """
    message = "Only officers can perform this action."
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_officer


class IsCitizen(permissions.BasePermission):
    """
    Permission check for citizen role.
    """
    message = "Only citizens can perform this action."
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_citizen


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Permission check for object ownership.
    The user must be the owner of the object or an admin.
    """
    message = "You must be the owner of this object or an admin."
    
    def has_object_permission(self, request, view, obj):
        # Check if user is admin, chairman, or the owner
        if request.user.is_staff or request.user.is_chairman:
            return True
        
        # Check if the object has a 'user' attribute (owner)
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        # Check if the object is the user
        if hasattr(obj, 'id') and request.user.id == obj.id:
            return True
        
        return False


class IsVerifiedUser(permissions.BasePermission):
    """
    Permission check for verified users.
    """
    message = "Your account must be verified to perform this action."
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_verified


# Export individual permission classes for backwards compatibility
# These modules were referenced in the code as `is_chairman`, etc.
class is_chairman:
    IsChairman = IsChairman

class is_officer:
    IsOfficer = IsOfficer

class is_citizen:
    IsCitizen = IsCitizen
