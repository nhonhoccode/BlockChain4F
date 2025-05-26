from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from utils.permissions import IsChairman

@api_view(['GET'])
@permission_classes([AllowAny])  # Temporarily allow any user for testing
def dashboard_stats(request):
    """
    Get dashboard statistics for chairman
    """
    # Debug output to understand user roles
    print(f"DEBUG: User accessing chairman dashboard: {request.user.email}")
    print(f"DEBUG: User role: {getattr(request.user, 'role', 'None')}")
    
    if hasattr(request.user, 'roles'):
        roles = [role.name.lower() for role in request.user.roles.all()]
        print(f"DEBUG: User roles (M2M): {roles}")
    
    # Placeholder for chairman dashboard stats
    return Response({
        "stats": {
            "pending_officer_approvals": 0,
            "pending_document_approvals": 0,
            "total_officers": 0,
            "total_citizens": 0,
            "total_documents": 0
        },
        "recent_activity": []
    }) 