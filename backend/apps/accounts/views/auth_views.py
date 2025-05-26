from rest_framework import status, generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model
from django.db import IntegrityError
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
        
        # Kiểm tra dữ liệu first_name và last_name
        first_name = request.data.get('first_name', None)
        last_name = request.data.get('last_name', None)
        print(f"DEBUG: first_name: '{first_name}'")
        print(f"DEBUG: last_name: '{last_name}'")
        print(f"DEBUG: gender: '{request.data.get('gender', None)}'")
        print(f"DEBUG: Data type: {type(request.data)}")
        
        serializer = self.get_serializer(data=request.data)
        
        if not serializer.is_valid():
            print(f"DEBUG: Registration validation errors: {serializer.errors}")
            print(f"DEBUG: Expected fields: {[field.name for field in User._meta.get_fields() if not field.is_relation]}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        user = serializer.save()
        
        # Lấy role từ request data
        requested_role = request.data.get('role', 'citizen')
        print(f"DEBUG: User created successfully: {user.id} - {user.email}")
        
        # Gán role cho user
        try:
            # Kiểm tra nếu role là officer_pending
            if requested_role == 'officer_pending':
                # Gán role officer_pending nếu tồn tại
                try:
                    officer_pending_role = Role.objects.get(name=Role.OFFICER_PENDING)
                    user.roles.add(officer_pending_role)
                    user.role = Role.OFFICER_PENDING
                    user.save()
                    print(f"DEBUG: Role assigned: {Role.OFFICER_PENDING}")
                except Role.DoesNotExist:
                    # Nếu role officer_pending không tồn tại, gán role citizen
                    citizen_role = Role.objects.get(name=Role.CITIZEN)
                    user.roles.add(citizen_role)
                    user.role = Role.CITIZEN
                    user.save()
                    print(f"DEBUG: Role assigned: {Role.CITIZEN} (officer_pending not found)")
            else:
                # Gán role citizen mặc định
                citizen_role = Role.objects.get(name=Role.CITIZEN)
                user.roles.add(citizen_role)
                user.role = Role.CITIZEN
                user.save()
                print(f"DEBUG: Role assigned: {Role.CITIZEN}")
        except Exception as e:
            print(f"DEBUG: Error assigning role: {str(e)}")
            # Nếu có lỗi, vẫn tiếp tục mà không raise exception
        
        # Generate token for the new user
        token, created = Token.objects.get_or_create(user=user)
        
        # Get user roles
        roles = [role.name for role in user.roles.all()]
        
        # Tạo profile cho user nếu chưa có
        try:
            if not hasattr(user, 'profile'):
                from ..models import Profile
                # Extract gender
                gender = request.data.get('gender', 'male')  # Default to male if not provided
                print(f"DEBUG: Gender value for profile creation: '{gender}'")
                
                # Lấy CMND/CCCD từ dữ liệu gửi lên (nếu có)
                id_card_number = request.data.get('idNumber', None)
                
                # Kiểm tra nếu id_card_number đã tồn tại
                if id_card_number and Profile.objects.filter(id_card_number=id_card_number).exists():
                    print(f"DEBUG: ID card number {id_card_number} already exists, setting to None")
                    id_card_number = None
                
                try:
                    profile = Profile.objects.create(
                        user=user,
                        gender=gender,
                        id_card_number=id_card_number
                    )
                    print(f"DEBUG: Profile created successfully: {profile.id}")
                    print(f"DEBUG: Gender saved in profile: '{profile.gender}'")
                    print(f"DEBUG: ID card number saved in profile: '{profile.id_card_number}'")
                except IntegrityError as e:
                    # Xử lý lỗi ràng buộc UNIQUE
                    print(f"DEBUG: IntegrityError creating profile: {str(e)}")
                    profile = Profile.objects.create(
                        user=user,
                        gender=gender,
                        id_card_number=None  # Đặt NULL nếu gặp lỗi
                    )
                    print(f"DEBUG: Profile created with NULL id_card_number: {profile.id}")
        except Exception as e:
            print(f"DEBUG: Error creating profile: {str(e)}")
        
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
