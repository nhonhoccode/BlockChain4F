from rest_framework import status, generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model
from ..serializers import UserCreateSerializer, UserSerializer, ChangePasswordSerializer
from ..models import Role

User = get_user_model()


class CustomAuthToken(ObtainAuthToken):
    """
    Custom authentication token view that returns user details along with the token
    """
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        
        # Get user roles
        roles = [role.name for role in user.roles.all()]
        
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'roles': roles,
            'is_verified': user.is_verified
        })


class RegisterView(generics.CreateAPIView):
    """
    API view for user registration
    """
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = UserCreateSerializer

    def create(self, request, *args, **kwargs):
        print(f"DEBUG: Registration data received: {request.data}")
        print(f"DEBUG: Registration data type: {type(request.data)}")
        print(f"DEBUG: Registration data keys: {request.data.keys() if hasattr(request.data, 'keys') else 'No keys'}")
        print(f"DEBUG: Content-Type header: {request.headers.get('Content-Type', 'Not provided')}")
        
        # Kiểm tra dữ liệu first_name và last_name
        first_name = request.data.get('first_name', None)
        last_name = request.data.get('last_name', None)
        print(f"DEBUG: first_name value: '{first_name}', type: {type(first_name)}")
        print(f"DEBUG: last_name value: '{last_name}', type: {type(last_name)}")
        
        serializer = self.get_serializer(data=request.data)
        
        if not serializer.is_valid():
            print(f"DEBUG: Registration validation errors: {serializer.errors}")
            print(f"DEBUG: Expected fields: {[field.name for field in User._meta.get_fields() if not field.is_relation]}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        user = serializer.save()
        
        # Generate token for the new user
        token, created = Token.objects.get_or_create(user=user)
        
        # Get user roles
        roles = [role.name for role in user.roles.all()]
        
        # Return user data with token
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'roles': roles,
            'is_verified': user.is_verified,
            'message': 'Đăng ký thành công!'
        }, status=status.HTTP_201_CREATED)


class LogoutView(APIView):
    """
    API view for user logout
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        # Delete the user's token to logout
        try:
            request.user.auth_token.delete()
            return Response({'message': 'Successfully logged out.'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ChangePasswordView(generics.UpdateAPIView):
    """
    API view for changing password
    """
    serializer_class = ChangePasswordSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            # Check if old password is correct
            if not user.check_password(serializer.validated_data['old_password']):
                return Response({"old_password": ["Wrong password."]}, status=status.HTTP_400_BAD_REQUEST)
            
            # Set new password and save
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            # Update token
            Token.objects.filter(user=user).delete()
            token, created = Token.objects.get_or_create(user=user)
            
            return Response({
                'message': 'Password updated successfully',
                'token': token.key
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserDetailsView(generics.RetrieveAPIView):
    """
    API view for retrieving user details
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class ChairmanRegistrationView(generics.CreateAPIView):
    """
    API view for chairman registration
    Chỉ superuser mới có quyền tạo tài khoản chủ tịch xã
    """
    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    serializer_class = UserCreateSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            # Tạo người dùng
            user = serializer.save()
            
            # Xóa vai trò công dân mặc định (nếu có)
            citizen_role = Role.objects.get(name=Role.CITIZEN)
            user.roles.remove(citizen_role)
            
            # Gán vai trò chủ tịch xã
            chairman_role = Role.objects.get(name=Role.CHAIRMAN)
            user.roles.add(chairman_role)
            
            # Generate token for the new user
            token, created = Token.objects.get_or_create(user=user)
            
            # Get user roles
            roles = [role.name for role in user.roles.all()]
            
            return Response({
                'message': 'Tài khoản chủ tịch xã đã được tạo thành công',
                'user_id': user.pk,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'roles': roles,
                'is_verified': user.is_verified
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
