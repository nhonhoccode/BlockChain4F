from rest_framework import permissions


class IsChairman(permissions.BasePermission):
    """
    Permission to allow only chairmen to access a view
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'chairman'


class IsOfficer(permissions.BasePermission):
    """
    Permission to allow only officers to access a view
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'officer'


class IsCitizen(permissions.BasePermission):
    """
    Permission to allow only citizens to access a view
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'citizen'


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Permission to allow owners or admins to access an object
    """
    def has_object_permission(self, request, view, obj):
        # Check if user is admin
        if request.user.is_staff or request.user.is_superuser:
            return True
            
        # Check if object has a user or owner field
        if hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'owner'):
            return obj.owner == request.user
        elif hasattr(obj, 'citizen'):
            return obj.citizen == request.user
        elif hasattr(obj, 'requestor'):
            return obj.requestor == request.user
        elif hasattr(obj, 'submitter'):
            return obj.submitter == request.user
            
        # Default deny if no ownership field found
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
