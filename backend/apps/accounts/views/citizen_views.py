from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import User, Profile
from ..serializers.citizen_serializers import CitizenDashboardStatsSerializer
from utils.permissions import IsCitizen

# ... Các view hiện có ...

class CitizenDashboardStatsView(APIView):
    """
    API view cho thống kê dashboard của citizen
    """
    permission_classes = [permissions.IsAuthenticated, IsCitizen]
    
    def get(self, request):
        # Sử dụng serializer để lấy dữ liệu
        serializer = CitizenDashboardStatsSerializer(
            instance=request.user,
            context={'request': request}
        )
        
        return Response(serializer.data) 