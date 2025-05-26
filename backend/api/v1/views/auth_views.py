from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.utils import timezone
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate

from apps.accounts.models import User
from apps.administrative.models import AdminRequest
# Comment import Document để tránh lỗi
# from apps.administrative.models import Document
from utils.permissions import IsCitizen

# Authentication endpoints will be implemented here
def obtain_auth_token(request):
    # Placeholder for token authentication
    return Response({"detail": "Not implemented yet"}, status=status.HTTP_501_NOT_IMPLEMENTED)

def refresh_auth_token(request):
    # Placeholder for token refresh
    return Response({"detail": "Not implemented yet"}, status=status.HTTP_501_NOT_IMPLEMENTED)

def verify_auth_token(request):
    # Placeholder for token verification
    return Response({"detail": "Not implemented yet"}, status=status.HTTP_501_NOT_IMPLEMENTED)

@api_view(['POST'])
@permission_classes([AllowAny])
def debug_token_auth(request):
    """
    Debug endpoint for token authentication without role validation
    """
    username = request.data.get('username')
    password = request.data.get('password')
    
    print(f"DEBUG: Login attempt for user: {username}")
    
    if not username or not password:
        return Response({"detail": "Username and password are required"}, status=status.HTTP_400_BAD_REQUEST)
    
    user = authenticate(username=username, password=password)
    
    if not user:
        return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
    
    # Get user roles
    roles = []
    if hasattr(user, 'roles'):
        roles = [role.name for role in user.roles.all()]
    
    # Get user's primary role
    primary_role = getattr(user, 'role', None)
    
    # Create or get token
    token, created = Token.objects.get_or_create(user=user)
    
    # Return detailed information for debugging
    return Response({
        'token': token.key,
        'user_id': user.pk,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'primary_role': primary_role,
        'roles': roles,
        'is_verified': getattr(user, 'is_verified', False),
        'is_staff': user.is_staff,
        'is_superuser': user.is_superuser,
        'debug_info': {
            'has_roles_attr': hasattr(user, 'roles'),
            'has_role_attr': hasattr(user, 'role'),
            'has_is_citizen': hasattr(user, 'is_citizen'),
            'has_is_officer': hasattr(user, 'is_officer'),
            'has_is_chairman': hasattr(user, 'is_chairman'),
        }
    })

def register_user(request):
    # Placeholder for user registration
    return Response({"detail": "Not implemented yet"}, status=status.HTTP_501_NOT_IMPLEMENTED)

def register_chairman(request):
    # Placeholder for chairman registration
    return Response({"detail": "Not implemented yet"}, status=status.HTTP_501_NOT_IMPLEMENTED)

def reset_password(request):
    # Placeholder for password reset
    return Response({"detail": "Not implemented yet"}, status=status.HTTP_501_NOT_IMPLEMENTED)

def reset_password_confirm(request):
    # Placeholder for password reset confirmation
    return Response({"detail": "Not implemented yet"}, status=status.HTTP_501_NOT_IMPLEMENTED)

def change_password(request):
    # Placeholder for password change
    return Response({"detail": "Not implemented yet"}, status=status.HTTP_501_NOT_IMPLEMENTED)

def user_profile(request):
    # Placeholder for user profile
    return Response({"detail": "Not implemented yet"}, status=status.HTTP_501_NOT_IMPLEMENTED)

def google_auth(request):
    # Placeholder for Google authentication
    return Response({"detail": "Not implemented yet"}, status=status.HTTP_501_NOT_IMPLEMENTED)

def google_register(request):
    # Placeholder for Google registration
    return Response({"detail": "Not implemented yet"}, status=status.HTTP_501_NOT_IMPLEMENTED)

def logout_user(request):
    # Placeholder for user logout
    return Response({"detail": "Not implemented yet"}, status=status.HTTP_501_NOT_IMPLEMENTED)

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsCitizen])
def citizen_dashboard_stats(request):
    """
    Get dashboard statistics for citizen
    """
    try:
        user = request.user
        
        # Get document counts - Tạm thời comment phần sử dụng Document
        # total_documents = Document.objects.filter(citizen=user).count()
        total_documents = 0
        
        # Get request counts by status
        pending_requests = AdminRequest.objects.filter(
            citizen=user, 
            status='pending'
        ).count()
        
        processing_requests = AdminRequest.objects.filter(
            citizen=user,
            status='processing'
        ).count()
        
        completed_requests = AdminRequest.objects.filter(
            citizen=user,
            status='completed'
        ).count()
        
        rejected_requests = AdminRequest.objects.filter(
            citizen=user,
            status='rejected'
        ).count()
        
        # Get recent activity (5 requests and 5 documents)
        recent_requests = AdminRequest.objects.filter(citizen=user).order_by('-created_at')[:5]
        # Tạm thời comment phần sử dụng Document
        # recent_documents = Document.objects.filter(citizen=user).order_by('-created_at')[:5]
        recent_documents = []
        
        # Create recent activity list
        recent_activity = []
        
        # Add recent requests
        for req in recent_requests:
            recent_activity.append({
                'id': req.request_id,
                'type': 'request',
                'status': req.status,
                'title': req.request_type,
                'date': req.created_at.isoformat(),
                'request_id': req.request_id,
                'officer': f"{req.assigned_to.first_name} {req.assigned_to.last_name}" if req.assigned_to else None
            })
            
        # Add recent documents - Tạm thời comment phần sử dụng Document
        # for doc in recent_documents:
        #     recent_activity.append({
        #         'id': str(doc.id),
        #         'type': 'document',
        #         'status': doc.status,
        #         'title': doc.title,
        #         'date': doc.created_at.isoformat(),
        #         'document_id': doc.document_id,
        #         'issued_by': f"{doc.issued_by.first_name} {doc.issued_by.last_name}" if doc.issued_by else None
        #     })
            
        # Sort by most recent
        recent_activity.sort(key=lambda x: x['date'], reverse=True)
        
        # Count blockchain verified documents - Tạm thời comment phần sử dụng Document
        # verified_documents = Document.objects.filter(citizen=user, blockchain_status=True).count()
        verified_documents = 0
        
        # Count unread notifications
        unread_notifications = 0
        try:
            from apps.notifications.models import Notification
            unread_notifications = Notification.objects.filter(user=user, is_read=False).count()
        except ImportError:
            pass
        
        # Return dashboard data
        dashboard_data = {
            'user': {
                'id': user.id,
                'name': f"{user.first_name} {user.last_name}".strip(),
                'email': user.email,
                'phone': getattr(user, 'phone', ''),
                'address': getattr(user, 'address', ''),
                'last_login': user.last_login.isoformat() if user.last_login else None
            },
            'stats': {
                'total_documents': total_documents,
                'pending_requests': pending_requests,
                'processing_requests': processing_requests,
                'completed_requests': completed_requests,
                'rejected_requests': rejected_requests,
                'notifications': unread_notifications,
                'verified_documents': verified_documents
            },
            'recent_activity': recent_activity[:5]  # Limit to 5 most recent activities
        }
        
        return Response(dashboard_data)
    
    except Exception as e:
        # Log error for debugging
        import traceback
        print(f"Error fetching dashboard stats: {str(e)}")
        print(traceback.format_exc())
        
        # Return fallback data with correct structure
        fallback_data = {
            'user': {
                'id': user.id if 'user' in locals() else None,
                'name': f"{user.first_name} {user.last_name}".strip() if 'user' in locals() else 'Công dân',
                'email': user.email if 'user' in locals() else '',
                'phone': getattr(user, 'phone', '') if 'user' in locals() else '',
                'address': getattr(user, 'address', '') if 'user' in locals() else '',
                'last_login': user.last_login.isoformat() if 'user' in locals() and user.last_login else None,
            },
            'stats': {
                'total_documents': 0,
                'pending_requests': 0,
                'processing_requests': 0,
                'completed_requests': 0,
                'rejected_requests': 0,
                'notifications': 0,
                'verified_documents': 0
            },
            'recent_activity': []
        }
        
        return Response(fallback_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 