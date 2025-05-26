from rest_framework import permissions

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