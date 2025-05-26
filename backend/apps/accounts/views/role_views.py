from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from ..models import Role, CustomPermission
from ..serializers import RoleSerializer, RoleAssignmentSerializer, CustomPermissionSerializer
from utils.permissions import IsChairman

User = get_user_model()


class RoleListView(generics.ListAPIView):
    """
    API view for listing all roles
    """
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [permissions.IsAuthenticated]


class RoleDetailView(generics.RetrieveAPIView):
    """
    API view for retrieving a specific role
    """
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'name'


class RoleAssignView(APIView):
    """
    API view for assigning a role to a user
    Only chairmen can assign roles
    """
    permission_classes = [permissions.IsAuthenticated, IsChairman]
    
    def post(self, request, user_id):
        user = get_object_or_404(User, id=user_id)
        serializer = RoleAssignmentSerializer(data=request.data)
        
        if serializer.is_valid():
            role_name = serializer.validated_data['role_name']
            role = Role.objects.get(name=role_name)
            
            # Add the role to the user
            user.roles.add(role)
            
            # Return updated user roles
            roles = [role.name for role in user.roles.all()]
            
            return Response({
                'message': f"Role '{role.get_name_display()}' assigned to user successfully",
                'user_id': user.id,
                'email': user.email,
                'roles': roles
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RoleRemoveView(APIView):
    """
    API view for removing a role from a user
    Only chairmen can remove roles
    """
    permission_classes = [permissions.IsAuthenticated, IsChairman]
    
    def post(self, request, user_id):
        user = get_object_or_404(User, id=user_id)
        serializer = RoleAssignmentSerializer(data=request.data)
        
        if serializer.is_valid():
            role_name = serializer.validated_data['role_name']
            role = Role.objects.get(name=role_name)
            
            # Check if user has the role
            if not user.roles.filter(id=role.id).exists():
                return Response({
                    'error': f"User does not have the role '{role.get_name_display()}'"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # If it's the citizen role and it's the only role, don't remove it
            if role_name == Role.CITIZEN and user.roles.count() == 1:
                return Response({
                    'error': "Cannot remove the Citizen role as it's the only role the user has"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Remove the role from the user
            user.roles.remove(role)
            
            # Return updated user roles
            roles = [role.name for role in user.roles.all()]
            
            return Response({
                'message': f"Role '{role.get_name_display()}' removed from user successfully",
                'user_id': user.id,
                'email': user.email,
                'roles': roles
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserRolesView(APIView):
    """
    API view for getting all roles of a user
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, user_id=None):
        if user_id:
            # Get roles for a specific user (admin or chairman only)
            if not (request.user.is_staff or request.user.is_chairman):
                return Response({
                    'error': 'You do not have permission to view other users\' roles'
                }, status=status.HTTP_403_FORBIDDEN)
            
            user = get_object_or_404(User, id=user_id)
        else:
            # Get roles for the current user
            user = request.user
        
        roles = user.roles.all()
        serializer = RoleSerializer(roles, many=True)
        
        return Response(serializer.data, status=status.HTTP_200_OK)


class PermissionListView(generics.ListAPIView):
    """
    API view for listing all permissions
    Only staff or chairmen can view permissions
    """
    queryset = CustomPermission.objects.all()
    serializer_class = CustomPermissionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if not (self.request.user.is_staff or self.request.user.is_chairman):
            return CustomPermission.objects.none()
        
        # Filter by module if provided
        module = self.request.query_params.get('module', None)
        if module:
            return CustomPermission.objects.filter(module=module)
        
        return CustomPermission.objects.all()
