from rest_framework import permissions


class IsChairman(permissions.BasePermission):
    """
    Permission to allow only chairmen to access a view
    """
    def has_permission(self, request, view):
        # Check for authentication first
        if not request.user or not request.user.is_authenticated:
            return False
            
        # Check for the flag set by the middleware
        if hasattr(request.user, '_has_chairman_access') and request.user._has_chairman_access:
            return True
            
        # Check all possible ways to determine if user is a chairman
        # 1. Check role field (case insensitive)
        is_chairman_role = hasattr(request.user, 'role') and request.user.role.lower() == 'chairman'
        
        # 2. Check user_type field
        is_chairman_user_type = hasattr(request.user, 'user_type') and request.user.user_type.lower() == 'chairman'
        
        # 3. Check is_chairman property
        is_chairman_property = getattr(request.user, 'is_chairman', False)
        
        # 4. Check roles relationship
        has_roles_relationship = False
        if hasattr(request.user, 'roles'):
            roles = [role.name.lower() for role in request.user.roles.all()]
            has_roles_relationship = 'chairman' in roles
        
        # Return True if any of the checks pass
        return is_chairman_role or is_chairman_user_type or has_roles_relationship or is_chairman_property


class IsOfficer(permissions.BasePermission):
    """
    Permission to allow only officers to access a view
    """
    def has_permission(self, request, view):
        # Check for authentication first
        if not request.user or not request.user.is_authenticated:
            return False
            
        # Check for the flag set by the middleware
        if hasattr(request.user, '_has_officer_access') and request.user._has_officer_access:
            return True
            
        # Check all possible ways to determine if user is an officer
        # 1. Check role field (case insensitive)
        is_officer_role = hasattr(request.user, 'role') and request.user.role.lower() == 'officer'
        
        # 2. Check user_type field
        is_officer_user_type = hasattr(request.user, 'user_type') and request.user.user_type.lower() == 'officer'
        
        # 3. Check is_officer property
        is_officer_property = getattr(request.user, 'is_officer', False)
        
        # 4. Check roles relationship
        has_roles_relationship = False
        if hasattr(request.user, 'roles'):
            roles = [role.name.lower() for role in request.user.roles.all()]
            has_roles_relationship = 'officer' in roles
        
        # Return True if any of the checks pass
        return is_officer_role or is_officer_user_type or has_roles_relationship or is_officer_property


class IsCitizen(permissions.BasePermission):
    """
    Permission to allow only citizens to access a view
    """
    def has_permission(self, request, view):
        # Check for authentication first
        if not request.user or not request.user.is_authenticated:
            print(f"DEBUG: User not authenticated")
            return False
            
        # Check for the flag set by the middleware
        if hasattr(request.user, '_has_citizen_access') and request.user._has_citizen_access:
            print(f"DEBUG: User has citizen access via middleware flag")
            return True
            
        # For debugging purposes
        print(f"DEBUG: User ID: {request.user.id}, Username: {request.user.username}, Email: {request.user.email}")
        print(f"DEBUG: User role: {request.user.role}, Has role attribute: {hasattr(request.user, 'role')}")
        print(f"DEBUG: User type: {getattr(request.user, 'user_type', 'None')}")
        print(f"DEBUG: User is_citizen property: {getattr(request.user, 'is_citizen', False)}")
        
        # Check roles relationship if it exists
        roles = []
        if hasattr(request.user, 'roles'):
            roles = [role.name.lower() for role in request.user.roles.all()]
            print(f"DEBUG: User roles (M2M): {roles}")
        
        # Special case: If the user has the officer role but also has the citizen role in roles relationship,
        # allow them to access citizen endpoints
        if hasattr(request.user, 'role') and request.user.role.lower() == 'officer' and 'citizen' in roles:
            print(f"DEBUG: Officer with citizen role - allowing access")
            return True
            
        # Check all possible ways to determine if user is a citizen
        # 1. Check role field (case insensitive)
        is_citizen_role = hasattr(request.user, 'role') and request.user.role.lower() == 'citizen'
        
        # 2. Check user_type field
        is_citizen_user_type = hasattr(request.user, 'user_type') and request.user.user_type.lower() == 'citizen'
        
        # 3. Check is_citizen property
        is_citizen_property = getattr(request.user, 'is_citizen', False)
        
        # 4. Check roles relationship
        has_roles_relationship = 'citizen' in roles
        
        print(f"DEBUG: is_citizen_role: {is_citizen_role}, is_citizen_user_type: {is_citizen_user_type}, is_citizen_property: {is_citizen_property}, has_roles_relationship: {has_roles_relationship}")
        
        # Return True if any of the checks pass
        result = is_citizen_role or is_citizen_user_type or has_roles_relationship or is_citizen_property
        print(f"DEBUG: Final permission result: {result}")
        return result


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
