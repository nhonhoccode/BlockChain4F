from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from utils.permissions import IsChairman, IsOfficer, IsCitizen

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def debug_user_info(request):
    """
    Debug view to get information about the current user's roles and permissions
    """
    user = request.user
    
    # Get basic user info
    user_info = {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'is_active': user.is_active,
        'is_staff': user.is_staff,
        'is_superuser': user.is_superuser,
        'role': getattr(user, 'role', None),
        'has_role_attribute': hasattr(user, 'role'),
    }
    
    # Get roles from many-to-many relationship
    roles = []
    if hasattr(user, 'roles'):
        roles = [{'id': role.id, 'name': role.name} for role in user.roles.all()]
    
    user_info['roles'] = roles
    
    # Check middleware flags
    user_info['_has_citizen_access'] = getattr(user, '_has_citizen_access', False)
    user_info['_has_officer_access'] = getattr(user, '_has_officer_access', False)
    user_info['_has_chairman_access'] = getattr(user, '_has_chairman_access', False)
    
    # Check permission classes
    user_info['is_citizen'] = IsCitizen().has_permission(request, None)
    user_info['is_officer'] = IsOfficer().has_permission(request, None)
    user_info['is_chairman'] = IsChairman().has_permission(request, None)
    
    return Response(user_info) 