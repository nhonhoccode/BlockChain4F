from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from utils.permissions import IsChairman

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsChairman])
def dashboard_stats(request):
    """
    Get dashboard statistics for chairman
    """
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