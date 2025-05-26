import logging
from django.contrib.auth import authenticate, login
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([AllowAny])
def simple_login(request):
    """
    Hàm đăng nhập đơn giản nhận username/email và password, 
    trả về token và thông tin người dùng
    """
    data = request.data
    username = data.get('username') or data.get('email')
    password = data.get('password')
    role = data.get('role', 'citizen')
    
    # Log đầy đủ thông tin để debug
    logger.info(f"Simple login attempt with username/email: {username}, role: {role}")
    
    if not username or not password:
        return Response({
            'success': False,
            'error': 'Vui lòng cung cấp email/username và mật khẩu'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Xác thực người dùng
    user = authenticate(username=username, password=password)
    
    if not user:
        # Thử xác thực bằng email nếu username không được tìm thấy
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        try:
            # Tìm user theo email
            user_obj = User.objects.filter(email=username).first()
            if user_obj:
                logger.info(f"Found user with email {username}, attempting authentication with username: {user_obj.username}")
                user = authenticate(username=user_obj.username, password=password)
        except Exception as e:
            logger.error(f"Error looking up user by email: {str(e)}")
    
    if not user:
        logger.warning(f"Authentication failed for username/email: {username}")
        return Response({
            'success': False,
            'error': 'Thông tin đăng nhập không đúng'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Kiểm tra role nếu có
    user_role = getattr(user, 'role', None)
    if user_role and role and user_role != role:
        # Trường hợp đặc biệt: chairman có thể đăng nhập với vai trò officer
        if user_role == 'chairman' and role == 'officer':
            logger.info(f"Chairman {user.username} logging in as officer - allowed")
        else:
            logger.warning(f"Role mismatch: User {username} has role {user_role}, requested {role}")
            return Response({
                'success': False,
                'error': f'Vai trò không khớp. Bạn đang cố đăng nhập với vai trò {role} nhưng tài khoản của bạn là {user_role}.'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    # Đăng nhập người dùng vào session nếu cần
    login(request, user)
    
    # Tạo hoặc lấy token
    token, created = Token.objects.get_or_create(user=user)
    
    # Chuẩn bị response data
    response_data = {
        'success': True,
        'token': token.key,
        'user_id': user.pk,
        'email': user.email,
        'username': user.username,
        'role': user_role or 'citizen'  # Default to citizen if no role
    }
    
    # Thêm first_name và last_name nếu có
    if hasattr(user, 'first_name'):
        response_data['first_name'] = user.first_name
    if hasattr(user, 'last_name'):
        response_data['last_name'] = user.last_name
    
    # Thêm name nếu có cả first_name và last_name
    if hasattr(user, 'first_name') and hasattr(user, 'last_name') and user.first_name and user.last_name:
        response_data['name'] = f"{user.first_name} {user.last_name}"
    
    logger.info(f"Simple login successful for user {username}")
    return Response(response_data) 