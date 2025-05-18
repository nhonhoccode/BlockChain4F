from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from google.oauth2 import id_token
from google.auth import transport
import google.auth.transport.requests
import requests
from django.conf import settings
import logging

from django.contrib.auth import authenticate, login, logout
from django.shortcuts import get_object_or_404
from django.utils.crypto import get_random_string

from apps.accounts.models import User, Profile, Role
from apps.accounts.serializers import UserSerializer, ProfileSerializer
from apps.officer_management.models import OfficerRequest

logger = logging.getLogger(__name__)

# Sử dụng client ID từ settings
GOOGLE_CLIENT_ID = settings.GOOGLE_CLIENT_ID

def get_user_role(user):
    """
    Xác định vai trò của người dùng dựa trên các profile và request liên quan
    """
    try:
        # Kiểm tra role từ User model (quan hệ many-to-many)
        if user.roles.exists():
            # Lấy vai trò đầu tiên (giả sử mỗi người dùng chỉ có một vai trò chính)
            return user.roles.first().name
            
        # Kiểm tra xem người dùng có đang chờ phê duyệt làm cán bộ không
        try:
            officer_request = OfficerRequest.objects.filter(user=user).first()
            if officer_request and officer_request.status == 'approved':
                return 'officer'
        except (ImportError, ModuleNotFoundError):
            logger.warning("OfficerRequest model could not be imported")
        
        # Mặc định là công dân
        return 'citizen'
    except Exception as e:
        logger.error(f"Error determining user role: {str(e)}")
        return 'citizen'  # Mặc định là công dân nếu có lỗi

class LoginView(ObtainAuthToken):
    """
    API endpoint để đăng nhập và lấy token xác thực
    """
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        
        # Kiểm tra role được gửi lên từ request
        requested_role = request.data.get('role', 'citizen')
        
        # Lấy thông tin vai trò thực tế của người dùng
        actual_role = get_user_role(user)
        
        # Kiểm tra xem role yêu cầu có khớp với role thực tế không
        if requested_role != actual_role:
            return Response({
                'success': False,
                'message': f'Vai trò không khớp. Tài khoản này có vai trò: {actual_role}',
                'actual_role': actual_role
            }, status=status.HTTP_403_FORBIDDEN)
        
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': actual_role
        })

class LogoutView(APIView):
    """
    API endpoint để đăng xuất và xóa token
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # Xóa token nếu sử dụng token auth
        try:
            request.user.auth_token.delete()
        except (AttributeError, Token.DoesNotExist):
            pass
        
        # Đăng xuất session nếu có
        logout(request)
        
        return Response({"message": "Đăng xuất thành công"}, status=status.HTTP_200_OK)

class RegisterView(APIView):
    """
    API endpoint để đăng ký tài khoản người dùng thông thường (công dân, cán bộ)
    """
    permission_classes = [AllowAny]
    def post(self, request):
        data = request.data
        
        # Kiểm tra email đã tồn tại chưa
        if User.objects.filter(email=data.get('email')).exists():
            return Response({
                "message": "Email đã được đăng ký"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Kiểm tra username đã tồn tại chưa
        if 'username' in data and User.objects.filter(username=data.get('username')).exists():
            return Response({
                "message": "Tên người dùng đã tồn tại"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Tạo tài khoản người dùng
        user_serializer = UserSerializer(data=data)
        if user_serializer.is_valid():
            try:
                # Sử dụng transaction để đảm bảo tính nhất quán
                from django.db import transaction
                with transaction.atomic():
                    # Lưu user
                    user = user_serializer.save()
                    user.set_password(data.get('password'))
                    
                    # Gán vai trò cho người dùng
                    role_name = data.get('role', 'citizen')  # Mặc định là công dân
                    if role_name not in ['citizen', 'officer']:
                        # Không cho phép đăng ký trực tiếp làm chủ tịch xã
                        role_name = 'citizen'
                    
                    role, _ = Role.objects.get_or_create(name=role_name)
                    user.roles.add(role)
                    user.save()
                    
                    # Tạo profile cho người dùng
                    profile_data = {
                        'user': user.id,
                        'phone_number': data.get('phone_number', ''),
                        'address': data.get('address', ''),
                        'ward': data.get('ward', ''),
                        'district': data.get('district', ''),
                        'city': data.get('province', '')  # Lưu ý: profile sử dụng 'city' thay vì 'province'
                    }
                    
                    profile_serializer = ProfileSerializer(data=profile_data)
                    if profile_serializer.is_valid():
                        profile_serializer.save()
                        
                        # Tạo token xác thực
                        token, _ = Token.objects.get_or_create(user=user)
                        
                        return Response({
                            "message": "Đăng ký tài khoản thành công",
                            "token": token.key,
                            "user_id": user.id,
                            "role": role_name
                        }, status=status.HTTP_201_CREATED)
                    else:
                        # Nếu profile không hợp lệ, rollback transaction
                        transaction.set_rollback(True)
                        return Response(profile_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                # Xử lý các lỗi khác
                logger.error(f"Registration error: {str(e)}")
                return Response({
                    "message": f"Lỗi khi đăng ký: {str(e)}"
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RegisterChairmanView(APIView):
    """
    API endpoint để đăng ký tài khoản chủ tịch xã (chỉ admin mới có quyền)
    """
    permission_classes = [IsAdminUser]
    
    def post(self, request):
        data = request.data
        
        # Kiểm tra email đã tồn tại chưa
        if User.objects.filter(email=data.get('email')).exists():
            return Response({
                "message": "Email đã được đăng ký"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Tạo tài khoản người dùng
        user_data = {
            'username': data.get('email'),  # Sử dụng email làm username
            'email': data.get('email'),
            'first_name': data.get('first_name', ''),
            'last_name': data.get('last_name', ''),
            'is_staff': True  # Chủ tịch xã có quyền truy cập admin
        }
        
        user_serializer = UserSerializer(data=user_data)
        if user_serializer.is_valid():
            try:
                # Sử dụng transaction để đảm bảo tính nhất quán
                from django.db import transaction
                with transaction.atomic():
                    # Lưu user
                    user = user_serializer.save()
                    user.set_password(data.get('password'))
                    
                    # Tạo hoặc lấy vai trò chủ tịch xã và gán cho người dùng
                    role, _ = Role.objects.get_or_create(name='chairman')
                    user.roles.add(role)
                    user.save()
                    
                    # Tạo profile
                    profile_data = {
                        'user': user.id,
                        'phone_number': data.get('phone_number', ''),
                        'address': data.get('address', ''),
                        'ward': data.get('ward', ''),
                        'district': data.get('district', ''),
                        'city': data.get('province', ''),
                        'position': data.get('position', 'Chủ tịch xã'),
                        'department': data.get('department', 'UBND xã')
                    }
                    
                    profile_serializer = ProfileSerializer(data=profile_data)
                    if profile_serializer.is_valid():
                        profile_serializer.save()
                        
                        return Response({
                            "message": "Đăng ký tài khoản chủ tịch xã thành công",
                            "user_id": user.id,
                            "data": profile_serializer.data
                        }, status=status.HTTP_201_CREATED)
                    else:
                        # Nếu profile không hợp lệ, rollback transaction
                        transaction.set_rollback(True)
                        return Response(profile_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                # Xử lý các lỗi khác
                logger.error(f"Chairman registration error: {str(e)}")
                return Response({
                    "message": f"Lỗi khi đăng ký tài khoản chủ tịch: {str(e)}"
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserDetailView(APIView):
    """
    API endpoint để lấy thông tin chi tiết người dùng hiện tại
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        try:
            profile = Profile.objects.get(user=user)
            role = get_user_role(user)
            
            return Response({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': role,
                'phone_number': profile.phone_number if hasattr(profile, 'phone_number') else '',
                'address': profile.address if hasattr(profile, 'address') else '',
                'ward': profile.ward if hasattr(profile, 'ward') else '',
                'district': profile.district if hasattr(profile, 'district') else '',
                'province': profile.city if hasattr(profile, 'city') else '',
                'position': profile.position if hasattr(profile, 'position') else '',
                'department': profile.department if hasattr(profile, 'department') else ''
            })
        except Profile.DoesNotExist:
            role = get_user_role(user)
            return Response({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': role
            })

class ChangePasswordView(APIView):
    """
    API endpoint để thay đổi mật khẩu
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        
        # Kiểm tra mật khẩu cũ
        if not user.check_password(old_password):
            return Response({
                "message": "Mật khẩu hiện tại không đúng"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Đặt mật khẩu mới
        user.set_password(new_password)
        user.save()
        
        return Response({
            "message": "Thay đổi mật khẩu thành công"
        }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth(request):
    """
    Xác thực token ID từ Google và tạo/lấy người dùng
    """
    token = request.data.get('token')
    role_name = request.data.get('role', 'citizen')  # Mặc định là citizen
    is_auth_code = request.data.get('isAuthCode', False)  # Kiểm tra xem token là auth code hay access token
    
    if not token:
        logger.error("Missing token in request")
        return Response({
            'success': False,
            'message': 'Token không được cung cấp'
        }, status=400)
    
    try:
        # Log cho debugging
        logger.info(f"Attempting to verify Google token for role: {role_name}")
        logger.info(f"Token type: {type(token)}, length: {len(token) if token else 0}, isAuthCode: {is_auth_code}")
        
        # Xác thực token với Google
        idinfo = None
        
        # Nếu là auth code, đổi thành access token trước
        if is_auth_code:
            logger.info("Received auth code, exchanging for token")
            try:
                # Endpoint để đổi auth code lấy token
                token_url = 'https://oauth2.googleapis.com/token'
                
                # Chuẩn bị dữ liệu cho request
                token_data = {
                    'code': token,
                    'client_id': settings.GOOGLE_CLIENT_ID,
                    'client_secret': settings.GOOGLE_CLIENT_SECRET,
                    'redirect_uri': settings.GOOGLE_REDIRECT_URI,
                    'grant_type': 'authorization_code'
                }
                
                logger.info(f"Exchanging auth code for token with data: {token_data}")
                
                # Gửi request để đổi code lấy token
                token_response = requests.post(token_url, data=token_data)
                
                if token_response.status_code != 200:
                    logger.error(f"Failed to exchange auth code for token: {token_response.json()}")
                    return Response({
                        'success': False,
                        'message': f'Không thể đổi mã xác thực: {token_response.text}'
                    }, status=400)
                
                # Lấy access token từ response
                token_json = token_response.json()
                token = token_json.get('access_token')
                
                if not token:
                    logger.error("No access token in response")
                    return Response({
                        'success': False,
                        'message': 'Không nhận được token từ Google'
                    }, status=400)
                
                logger.info("Successfully exchanged auth code for access token")
            except Exception as e:
                logger.exception(f"Error exchanging auth code for token: {str(e)}")
                return Response({
                    'success': False,
                    'message': f'Lỗi khi đổi mã xác thực: {str(e)}'
                }, status=400)
        
        # Sử dụng access token để lấy thông tin người dùng từ Google API
        import requests as http_requests
        userinfo_url = "https://www.googleapis.com/oauth2/v3/userinfo"
        headers = {'Authorization': f'Bearer {token}'}
        
        logger.info(f"Fetching user info from Google API: {userinfo_url}")
        userinfo_response = http_requests.get(userinfo_url, headers=headers)
        
        if userinfo_response.status_code != 200:
            logger.error(f"Failed to get user info with access token: {userinfo_response.text}")
            return Response({
                'success': False,
                'message': f'Token không hợp lệ hoặc đã hết hạn: {userinfo_response.text}'
            }, status=400)
        
        idinfo = userinfo_response.json()
        logger.info(f"Successfully retrieved user info: {idinfo}")
        
        # Lấy thông tin người dùng từ token
        if not idinfo:
            logger.error("No user info retrieved from Google")
            return Response({
                'success': False,
                'message': 'Không thể lấy thông tin người dùng từ Google'
            }, status=400)
        
        # Kiểm tra email
        email = idinfo.get('email')
        if not email:
            logger.error("No email in Google user info")
            return Response({
                'success': False,
                'message': 'Không tìm thấy email trong thông tin Google'
            }, status=400)
        
        # Kiểm tra xác thực email
        email_verified = idinfo.get('email_verified', False)
        if not email_verified:
            logger.warning(f"Email {email} not verified by Google")
            # Có thể cho phép hoặc từ chối tùy theo yêu cầu
        
        # Lấy thông tin cơ bản
        given_name = idinfo.get('given_name', '')
        family_name = idinfo.get('family_name', '')
        picture = idinfo.get('picture', '')
        
        # Kiểm tra người dùng đã tồn tại chưa
        try:
            user = User.objects.get(email=email)
            logger.info(f"User with email {email} already exists")
            
            # Kiểm tra vai trò hiện tại của người dùng
            current_role = get_user_role(user)
            
            # Nếu vai trò yêu cầu khác với vai trò hiện tại, báo lỗi
            if role_name != current_role:
                logger.warning(f"Role mismatch for {email}. Requested: {role_name}, Actual: {current_role}")
                return Response({
                    'success': False,
                    'message': f'Tài khoản này đã được đăng ký với vai trò {current_role}. Vui lòng chọn đúng vai trò để đăng nhập.',
                    'actual_role': current_role
                }, status=403)
            
            # Update OAuth data if user exists
            oauth_data = {
                'picture': picture,
                'locale': idinfo.get('locale', ''),
                'verified_email': idinfo.get('email_verified', True),
                'sub': idinfo.get('sub'),
            }
            
            # Check if profile exists and update it
            try:
                profile = user.profile
                profile.oauth_data = oauth_data
                profile.save()
                logger.info(f"Updated profile for existing user {email}")
            except Profile.DoesNotExist:
                # Create profile if it doesn't exist
                profile = Profile.objects.create(
                    user=user,
                    first_name=given_name or '',
                    last_name=family_name or '',
                    oauth_provider='google',
                    oauth_uid=idinfo.get('sub'),
                    oauth_data=oauth_data
                )
                logger.info(f"Created profile for existing user {email}")
                
        except User.DoesNotExist:
            # Tạo người dùng mới
            logger.info(f"Creating new user with email {email} and role {role_name}")
            user = User.objects.create_user(
                email=email,
                first_name=given_name,
                last_name=family_name,
                password=get_random_string(length=12)  # Mật khẩu ngẫu nhiên
            )
            
            # Gán vai trò
            role, created = Role.objects.get_or_create(name=role_name)
            user.roles.add(role)
            user.save()
            
            # Chuẩn bị dữ liệu OAuth
            oauth_data = {
                'picture': picture,
                'locale': idinfo.get('locale', ''),
                'verified_email': idinfo.get('email_verified', True),
                'sub': idinfo.get('sub'),
            }
            
            if role_name == 'chairman' and not user.is_staff:
                # Chỉ admin mới có thể tạo chairman
                return Response({
                    'success': False,
                    'message': 'Không thể đăng ký tài khoản chủ tịch xã qua Google'
                }, status=403)
            
            # Tạo profile
            try:
                profile, created = Profile.objects.get_or_create(
                    user=user,
                    defaults={
                        'first_name': given_name or '',
                        'last_name': family_name or '',
                        'oauth_provider': 'google',
                        'oauth_uid': idinfo.get('sub'),
                        'oauth_data': oauth_data
                    }
                )
                
                if not created:
                    # Nếu profile đã tồn tại, cập nhật thông tin
                    profile.oauth_provider = 'google'
                    profile.oauth_uid = idinfo.get('sub')
                    profile.oauth_data = oauth_data
                    profile.save()
                
                logger.info(f"{'Created' if created else 'Updated'} profile for {email} with role {role_name}")
            except Exception as profile_error:
                # Xử lý lỗi khi tạo profile
                logger.error(f"Error creating/updating profile for user {email}: {str(profile_error)}")
                # Không xóa user đã tạo, vì có thể profile đã tồn tại
            
            # Nếu là officer, tạo yêu cầu đăng ký cán bộ
            if role_name == 'officer':
                try:
                    officer_request, created = OfficerRequest.objects.get_or_create(
                        user=user,
                        defaults={'status': 'pending'}
                    )
                    logger.info(f"{'Created' if created else 'Found existing'} officer request for {email}")
                except Exception as officer_error:
                    logger.error(f"Error creating officer request for {email}: {str(officer_error)}")
        
        # Tạo token xác thực
        token, created = Token.objects.get_or_create(user=user)
        
        # Lấy thông tin vai trò
        user_role = get_user_role(user)
        
        # Trả về thông tin người dùng và token
        return Response({
            'success': True,
            'token': token.key,
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': role_name,  # Sử dụng role_name đã chọn thay vì get_user_role
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser
            }
        })
    except Exception as e:
        logger.exception(f"Google auth error: {str(e)}")
        return Response({
            'success': False,
            'message': f'Lỗi xác thực Google: {str(e)}'
        }, status=400)

@api_view(['POST'])
@permission_classes([AllowAny])
def google_register(request):
    """
    Đăng ký tài khoản mới sử dụng Google OAuth
    """
    token = request.data.get('token')
    role_name = request.data.get('role', 'citizen')
    # Lấy redirect_uri từ request hoặc sử dụng giá trị mặc định từ settings
    redirect_uri = request.data.get('redirect_uri', settings.GOOGLE_REDIRECT_URI)
    
    # Các thông tin bổ sung từ form đăng ký
    additional_data = request.data.get('additionalData', {})
    
    if not token:
        logger.error("Missing token in registration request")
        return Response({
            'success': False,
            'message': 'Token không được cung cấp'
        }, status=400)
    
    try:
        # Log cho debugging
        logger.info(f"Attempting to verify Google token for registration with role: {role_name}")
        logger.info(f"Additional data provided: {additional_data.keys()}")
        logger.info(f"Using redirect URI: {redirect_uri}")
        
        # Xác thực token với Google
        try:
            # Thử xác thực ID token 
            idinfo = id_token.verify_oauth2_token(
                token, requests.Request(), settings.GOOGLE_CLIENT_ID)
            logger.info("Successfully verified ID token for registration")
            logger.info(f"Token info: {idinfo}")
        except ValueError as e:
            # Nếu không phải ID token, có thể là access token
            logger.warning(f"ID token verification failed for registration: {str(e)}, trying as access token")
            try:
                # Sử dụng access token để lấy thông tin người dùng từ Google API
                userinfo_url = "https://www.googleapis.com/oauth2/v3/userinfo"
                headers = {'Authorization': f'Bearer {token}'}
                userinfo_response = requests.get(userinfo_url, headers=headers)
                
                if userinfo_response.status_code != 200:
                    logger.error(f"Failed to get user info with access token for registration: {userinfo_response.text}")
                    return Response({
                        'success': False,
                        'message': 'Token không hợp lệ hoặc đã hết hạn'
                    }, status=400)
                
                idinfo = userinfo_response.json()
                logger.info("Successfully retrieved user info using access token for registration")
                logger.info(f"User info: {idinfo}")
            except Exception as access_error:
                logger.error(f"Access token verification failed for registration: {str(access_error)}")
                return Response({
                    'success': False,
                    'message': f'Không thể xác thực token: {str(access_error)}'
                }, status=400)
        
        # Lấy thông tin người dùng từ token
        email = idinfo.get('email')
        if not email:
            logger.error("Email not found in token/userinfo for registration")
            return Response({
                'success': False,
                'message': 'Không tìm thấy email trong thông tin người dùng'
            }, status=400)
            
        name = idinfo.get('name', '')
        given_name = idinfo.get('given_name', '') 
        family_name = idinfo.get('family_name', '')
        
        # Kiểm tra xem email đã tồn tại trong hệ thống chưa
        if User.objects.filter(email=email).exists():
            logger.warning(f"Email {email} already registered")
            return Response({
                'success': False,
                'message': 'Email đã được đăng ký trước đó'
            }, status=400)
        
        # Sử dụng transaction để đảm bảo tính nhất quán
        from django.db import transaction
        with transaction.atomic():
            # Lấy role từ database
            try:
                role = Role.objects.get(name=role_name)
                logger.info(f"Found existing role: {role_name}")
            except Role.DoesNotExist:
                logger.warning(f"Role {role_name} does not exist for registration, creating it")
                role = Role.objects.create(name=role_name)
                logger.info(f"Created new role: {role_name}")
            
            # Tạo người dùng mới
            logger.info(f"Creating new user for registration with email: {email}")
            user = User.objects.create_user(
                email=email,
                first_name=given_name or additional_data.get('first_name', ''),
                last_name=family_name or additional_data.get('last_name', ''),
                password=None  # Tài khoản Google không dùng mật khẩu local
            )
            
            # Gán vai trò cho người dùng
            user.roles.add(role)
            
            # Đảm bảo field is_oauth tồn tại trước khi sử dụng
            if hasattr(user, 'is_oauth'):
                user.is_oauth = True
            user.save()
            
            # Chuẩn bị dữ liệu OAuth
            oauth_data = {
                'picture': idinfo.get('picture', ''),
                'locale': idinfo.get('locale', ''),
                'verified_email': idinfo.get('email_verified', True),
                'last_updated': idinfo.get('updated_at')
            }
            
            # Tạo profile và gán role
            profile = Profile.objects.create(
                user=user, 
                first_name=given_name or additional_data.get('first_name', ''),
                last_name=family_name or additional_data.get('last_name', ''),
                oauth_provider='google',
                oauth_uid=idinfo.get('sub') or idinfo.get('id'),
                oauth_data=oauth_data
            )
            logger.info(f"Created new profile for user: {email}")
            
            # Xử lý các thông tin bổ sung
            # Thêm các trường bổ sung vào profile
            if 'phone_number' in additional_data:
                profile.phone_number = additional_data['phone_number']
                logger.info(f"Added phone number to profile: {additional_data['phone_number']}")
            if 'address' in additional_data:
                profile.address = additional_data['address']
                logger.info(f"Added address to profile: {additional_data['address']}")
            profile.save()
            
            # Tạo token xác thực
            token = Token.objects.create(user=user)
            logger.info(f"Generated token for new user: {email}")
            
            # Trả về thông tin người dùng và token
            response_data = {
                'success': True,
                'message': 'Đăng ký thành công',
                'userId': user.id,
                'token': token.key,
                'role': role.name,
                'email': email,
                'first_name': user.first_name,
                'last_name': user.last_name
            }
            logger.info(f"Registration successful for user: {email}")
            return Response(response_data)
    
    except ValueError as e:
        # Token không hợp lệ
        logger.error(f"Google registration error (ValueError): {str(e)}")
        return Response({
            'success': False,
            'message': f'Token không hợp lệ: {str(e)}'
        }, status=400)
    
    except Exception as e:
        # Lỗi không xác định
        logger.error(f"Unexpected error during Google registration: {str(e)}")
        return Response({
            'success': False,
            'message': f'Có lỗi xảy ra trong quá trình đăng ký: {str(e)}'
        }, status=500)
