from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse
from rest_framework import permissions

class AllowAnyPermission(permissions.BasePermission):
    """
    Allow any access.
    """
    def has_permission(self, request, view):
        return True

class CsrfExemptMiddleware(MiddlewareMixin):
    """
    Middleware to exempt specific endpoints from CSRF verification
    """
    def process_view(self, request, view_func, view_args, view_kwargs):
        # List of paths that should be exempt from CSRF
        csrf_exempt_urls = [
            # Auth endpoints
            '/api/v1/auth/token/',
            '/api/auth/token/',
            '/api/v1/auth/debug-token/',
            '/api/auth/debug-token/',
            '/api/v1/auth/user/',
            '/api/auth/user/',
            
            # Citizen endpoints
            '/api/v1/citizen/requests/',
            '/api/v1/citizen/documents/',
            '/api/v1/citizen/feedback/',
            '/api/v1/citizen/profile/',
            '/api/v1/citizen/dashboard/stats/',
            
            # Officer endpoints
            '/api/v1/officer/requests/',
            '/api/v1/officer/documents/',
            '/api/v1/officer/citizens/',
            '/api/v1/officer/profile/',
            
            # Chairman endpoints
            '/api/v1/chairman/officers/',
            '/api/v1/chairman/dashboard/stats/',
        ]
        
        # Check if the current path is in the exempt list
        if any(request.path.startswith(url) for url in csrf_exempt_urls):
            # Set an attribute that will be checked by the CSRF middleware
            setattr(request, '_dont_enforce_csrf_checks', True)
        
        # Continue with the request
        return None


class CitizenAccessMiddleware:
    """
    Middleware to grant citizen access to users with the officer role.
    This is a temporary solution to allow officers to access citizen endpoints.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Process request before view is called
        if hasattr(request, 'user') and request.user.is_authenticated:
            # Check if the user has roles
            if hasattr(request.user, 'roles'):
                roles = [role.name.lower() for role in request.user.roles.all()]
                
                # If the user has the officer role, grant them citizen access
                if 'officer' in roles:
                    request.user._has_citizen_access = True
                    print(f"DEBUG CitizenAccessMiddleware: Granting citizen access to officer {request.user.email}")
        
        # Call the next middleware or view
        response = self.get_response(request)
        
        # Process response after view is called
        return response


class OfficerAccessMiddleware:
    """
    Middleware to handle dual-role users for officer endpoints.
    This middleware checks if a user has the officer role in their roles relationship
    and sets a flag on the user object to indicate that they have access to officer endpoints.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Process request before view is called
        if hasattr(request, 'user') and request.user.is_authenticated:
            # Check if the user has roles
            if hasattr(request.user, 'roles'):
                roles = [role.name.lower() for role in request.user.roles.all()]
                
                # If the user has the officer role, grant them officer access
                if 'officer' in roles:
                    request.user._has_officer_access = True
                    print(f"DEBUG OfficerAccessMiddleware: Granting officer access to user {request.user.email}")
        
        # Call the next middleware or view
        response = self.get_response(request)
        
        # Process response after view is called
        return response


class ChairmanAccessMiddleware:
    """
    Middleware to handle dual-role users for chairman endpoints.
    This middleware checks if a user has the chairman role in their roles relationship
    and sets a flag on the user object to indicate that they have access to chairman endpoints.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Process request before view is called
        if hasattr(request, 'user') and request.user.is_authenticated:
            # Check if the user has roles
            if hasattr(request.user, 'roles'):
                roles = [role.name.lower() for role in request.user.roles.all()]
                
                # If the user has the chairman role, grant them chairman access
                if 'chairman' in roles:
                    request.user._has_chairman_access = True
                    print(f"DEBUG ChairmanAccessMiddleware: Granting chairman access to user {request.user.email}")
        
        # Call the next middleware or view
        response = self.get_response(request)
        
        # Process response after view is called
        return response


class PermissionOverrideMiddleware:
    """
    Middleware to override permissions for debugging purposes.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Check for debug parameter in query string
        debug_mode = request.GET.get('debug_permissions', None)
        if debug_mode == 'true':
            # Set a flag on the request to bypass permission checks
            request._bypass_permissions = True
            print(f"DEBUG PermissionOverrideMiddleware: Bypassing permissions for request {request.path}")
        
        # Call the next middleware or view
        response = self.get_response(request)
        
        # Process response after view is called
        return response 