from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from apps.accounts.serializers.dashboard import (
    CitizenDashboardSerializer,
    OfficerDashboardSerializer,
    ChairmanDashboardSerializer
)
from apps.accounts.permissions import IsCitizen, IsOfficer, IsChairman

class CitizenDashboardView(APIView):
    """
    API endpoint để lấy dữ liệu dashboard cho công dân
    """
    permission_classes = [IsAuthenticated, IsCitizen]
    
    def get(self, request):
        """Lấy thống kê và dữ liệu dashboard cho công dân"""
        serializer = CitizenDashboardSerializer(context={'request': request})
        return Response(serializer.data)

class OfficerDashboardView(APIView):
    """
    API endpoint để lấy dữ liệu dashboard cho cán bộ
    """
    permission_classes = [IsAuthenticated, IsOfficer]
    
    def get(self, request):
        """Lấy thống kê và dữ liệu dashboard cho cán bộ"""
        serializer = OfficerDashboardSerializer(context={'request': request})
        return Response(serializer.data)

class ChairmanDashboardView(APIView):
    """
    API endpoint để lấy dữ liệu dashboard cho chủ tịch xã
    """
    permission_classes = [IsAuthenticated, IsChairman]
    
    def get(self, request):
        """Lấy thống kê và dữ liệu dashboard cho chủ tịch xã"""
        serializer = ChairmanDashboardSerializer(context={'request': request})
        return Response(serializer.data) 