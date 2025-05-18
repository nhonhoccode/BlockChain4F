from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from ..models import Profile
from ..serializers import ProfileSerializer, ProfileUpdateSerializer


class ProfileDetailView(generics.RetrieveAPIView):
    """
    API view for retrieving the current user's profile
    """
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user.profile


class ProfileUpdateView(generics.UpdateAPIView):
    """
    API view for updating the current user's profile
    """
    serializer_class = ProfileUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def get_object(self):
        return self.request.user.profile
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Return updated profile
        return Response(ProfileSerializer(instance).data)


class ProfilePictureUploadView(APIView):
    """
    API view for uploading or updating profile picture
    """
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request, format=None):
        profile = request.user.profile
        
        if 'profile_picture' not in request.data:
            return Response({'error': 'No profile picture provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        profile_picture = request.data['profile_picture']
        profile.profile_picture = profile_picture
        profile.save()
        
        return Response({
            'message': 'Profile picture updated successfully',
            'profile_picture': profile.profile_picture.url if profile.profile_picture else None
        }, status=status.HTTP_200_OK)
