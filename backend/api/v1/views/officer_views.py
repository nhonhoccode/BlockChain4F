from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from utils.permissions import IsOfficer

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsOfficer])
def dashboard_stats(request):
    """
    Get dashboard statistics for officer
    """
    # Placeholder for officer dashboard stats
    return Response({
        "stats": {
            "pending_requests": 0,
            "processing_requests": 0,
            "completed_requests": 0,
            "total_citizens": 0,
            "total_documents": 0
        },
        "recent_activity": []
    }) 