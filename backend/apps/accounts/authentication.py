from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

User = get_user_model()

class DualRoleAuthenticationBackend(ModelBackend):
    """
    Custom authentication backend that handles users with multiple roles
    """
    def authenticate(self, request, username=None, email=None, password=None, **kwargs):
        """
        Authenticate a user based on email/username and password
        """
        if email is None and username is not None:
            email = username
            
        if email is None:
            return None
            
        try:
            user = User.objects.get(email=email)
            if user.check_password(password):
                return user
        except User.DoesNotExist:
            return None
        
    def get_user(self, user_id):
        """
        Get a user by ID
        """
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
            
    def has_perm(self, user_obj, perm, obj=None):
        """
        Check if user has permission
        """
        return super().has_perm(user_obj, perm, obj)
        
    def has_module_perms(self, user_obj, app_label):
        """
        Check if user has module permission
        """
        return super().has_module_perms(user_obj, app_label) 