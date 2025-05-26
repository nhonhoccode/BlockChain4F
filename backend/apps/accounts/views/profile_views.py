from django.http import Http404
from django.shortcuts import get_object_or_404
from django.core.exceptions import PermissionDenied
from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from ..models import Profile, Role
from ..serializers import ProfileSerializer, ProfileUpdateSerializer

User = get_user_model()


class ProfileDetailView(generics.RetrieveAPIView):
    """
    API view for retrieving the current user's profile
    """
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user.profile


class CitizenProfileView(generics.RetrieveUpdateAPIView):
    """
    API view for retrieving and updating a citizen's profile
    """
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        user = self.request.user
        # Print debug information
        print(f"DEBUG: User ID: {user.id}, Username: {user.username}, Email: {user.email}")
        print(f"DEBUG: User role: {user.role}, Has role attribute: {hasattr(user, 'role')}")
        
        try:
            # Check roles from M2M relationship
            roles_list = list(user.roles.all().values_list('name', flat=True))
            print(f"DEBUG: User roles (M2M): {roles_list}")
            
            # Check if user has citizen role in M2M relationship
            if 'citizen' in roles_list:
                return user.profile
        except Exception as e:
            print(f"DEBUG: Error checking M2M roles: {str(e)}")
        
        # Fallback to direct role field check
        if hasattr(user, 'role') and user.role and user.role.lower() == 'citizen':
            return user.profile
        
        # If we reach here, user doesn't have citizen role
        self.permission_denied(
            self.request, 
            message='You do not have permission to access this resource. Citizen role required.'
        )
        
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)
    
    def handle_exception(self, exc):
        if isinstance(exc, PermissionDenied):
            return Response(
                {"detail": str(exc)}, 
                status=status.HTTP_403_FORBIDDEN
            )
        return super().handle_exception(exc)


class OfficerProfileView(generics.RetrieveUpdateAPIView):
    """
    API view for retrieving and updating an officer's profile
    """
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        user = self.request.user
        # Print debug information
        print(f"DEBUG: User ID: {user.id}, Username: {user.username}, Email: {user.email}")
        print(f"DEBUG: User role: {user.role}, Has role attribute: {hasattr(user, 'role')}")
        
        try:
            # Check roles from M2M relationship
            roles_list = list(user.roles.all().values_list('name', flat=True))
            print(f"DEBUG: User roles (M2M): {roles_list}")
            
            # Check if user has officer role in M2M relationship
            if 'officer' in roles_list:
                return user.profile
        except Exception as e:
            print(f"DEBUG: Error checking M2M roles: {str(e)}")
        
        # Fallback to direct role field check
        if hasattr(user, 'role') and user.role and user.role.lower() == 'officer':
            return user.profile
        
        # If we reach here, user doesn't have officer role
        self.permission_denied(
            self.request, 
            message='You do not have permission to access this resource. Officer role required.'
        )
        
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)
        instance = self.get_object()
        
        print(f"DEBUG: Updating officer profile with data: {request.data}")
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        # Save the profile changes
        self.perform_update(serializer)
        
        # If user data is included, update the user model too
        user_data = {}
        if 'user' in request.data and isinstance(request.data['user'], dict):
            user_data = request.data['user']
        elif request.data.get('first_name') or request.data.get('last_name') or request.data.get('email'):
            # Handle case where user data is directly in the request data
            user_data = {
                'first_name': request.data.get('first_name', request.user.first_name),
                'last_name': request.data.get('last_name', request.user.last_name),
                'email': request.data.get('email', request.user.email)
            }
        
        if user_data:
            user = request.user
            
            # Update first_name and last_name if provided
            if 'first_name' in user_data:
                user.first_name = user_data['first_name']
            if 'last_name' in user_data:
                user.last_name = user_data['last_name']
            if 'email' in user_data:
                # Check if email is being changed and if it's already in use
                new_email = user_data['email']
                if new_email != user.email:
                    if User.objects.filter(email=new_email).exclude(id=user.id).exists():
                        return Response(
                            {"email": ["Email này đã được sử dụng."]}, 
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    user.email = new_email
                
            user.save()
            print(f"DEBUG: Updated user data: {user.first_name} {user.last_name} ({user.email})")
        
        # Return updated profile with user details
        updated_profile = self.get_serializer(self.get_object()).data
        print(f"DEBUG: Returning updated profile data: {updated_profile}")
        return Response(updated_profile)
    
    def handle_exception(self, exc):
        if isinstance(exc, PermissionDenied):
            return Response(
                {"detail": str(exc)}, 
                status=status.HTTP_403_FORBIDDEN
            )
        return super().handle_exception(exc)


class ChairmanProfileView(generics.RetrieveUpdateAPIView):
    """
    API view for retrieving and updating a chairman's profile
    """
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        user = self.request.user
        # Print debug information
        print(f"DEBUG: User ID: {user.id}, Username: {user.username}, Email: {user.email}")
        print(f"DEBUG: User role: {user.role}, Has role attribute: {hasattr(user, 'role')}")
        
        try:
            # Check roles from M2M relationship
            roles_list = list(user.roles.all().values_list('name', flat=True))
            print(f"DEBUG: User roles (M2M): {roles_list}")
            
            # Check if user has chairman role in M2M relationship
            if 'chairman' in roles_list:
                return user.profile
        except Exception as e:
            print(f"DEBUG: Error checking M2M roles: {str(e)}")
        
        # Fallback to direct role field check
        if hasattr(user, 'role') and user.role and user.role.lower() == 'chairman':
            return user.profile
        
        # If we reach here, user doesn't have chairman role
        self.permission_denied(
            self.request, 
            message='You do not have permission to access this resource. Chairman role required.'
        )
        
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)
    
    def handle_exception(self, exc):
        if isinstance(exc, PermissionDenied):
            return Response(
                {"detail": str(exc)}, 
                status=status.HTTP_403_FORBIDDEN
            )
        return super().handle_exception(exc)


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
    API view for uploading profile pictures
    """
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request, *args, **kwargs):
        try:
            # Log debugging information
            print(f"DEBUG: User ID: {request.user.id}, Username: {request.user.username}, Email: {request.user.email}")
            
            # Get the user's profile
            profile = request.user.profile
            
            # Check if file was uploaded
            if 'profile_picture' not in request.FILES:
                return Response(
                    {'error': 'No profile picture provided'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Update profile picture
            profile.profile_picture = request.FILES['profile_picture']
            profile.save()
            
            # Return updated profile with picture URL
            serializer = ProfileSerializer(profile)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': f'Failed to upload profile picture: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
