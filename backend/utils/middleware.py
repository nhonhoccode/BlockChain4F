class MultiRoleMiddleware:
    """
    Middleware to handle users with multiple roles.
    This middleware checks if a user has multiple roles and sets a flag on the user object
    to indicate that they have access to endpoints for each of their roles.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Process request before view is called
        if hasattr(request, 'user') and request.user.is_authenticated:
            # Check if the user has roles
            if hasattr(request.user, 'roles'):
                roles = [role.name.lower() for role in request.user.roles.all()]
                
                # Set flags for each role
                if 'citizen' in roles:
                    request.user._has_citizen_access = True
                
                if 'officer' in roles:
                    request.user._has_officer_access = True
                
                if 'chairman' in roles:
                    request.user._has_chairman_access = True
                
                # Debug output
                print(f"DEBUG Middleware: User {request.user.email} has roles: {roles}")
                print(f"DEBUG Middleware: Setting access flags - citizen: {getattr(request.user, '_has_citizen_access', False)}, officer: {getattr(request.user, '_has_officer_access', False)}, chairman: {getattr(request.user, '_has_chairman_access', False)}")
        
        # Call the next middleware or view
        response = self.get_response(request)
        
        # Process response after view is called
        return response
