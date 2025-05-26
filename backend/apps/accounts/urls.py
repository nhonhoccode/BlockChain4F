from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CustomAuthToken, RegisterView, LogoutView, ChangePasswordView, UserDetailsView,
    ProfileDetailView, ProfileUpdateView, ProfilePictureUploadView,
    RoleListView, RoleDetailView, RoleAssignView, RoleRemoveView, UserRolesView, PermissionListView,
    ChairmanRegistrationView, citizen_views
)

# Tạo router cho API citizen
router = DefaultRouter()
# Đăng ký các viewset hiện có

urlpatterns = [
    # Authentication URLs
    path('auth/login/', CustomAuthToken.as_view(), name='token_obtain'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('auth/user/', UserDetailsView.as_view(), name='user_details'),
    path('auth/register-chairman/', ChairmanRegistrationView.as_view(), name='register_chairman'),
    
    # Profile URLs
    path('profile/', ProfileDetailView.as_view(), name='profile_detail'),
    path('profile/update/', ProfileUpdateView.as_view(), name='profile_update'),
    path('profile/upload-picture/', ProfilePictureUploadView.as_view(), name='profile_upload_picture'),
    
    # Role URLs
    path('roles/', RoleListView.as_view(), name='role_list'),
    path('roles/<str:name>/', RoleDetailView.as_view(), name='role_detail'),
    path('users/<int:user_id>/assign-role/', RoleAssignView.as_view(), name='role_assign'),
    path('users/<int:user_id>/remove-role/', RoleRemoveView.as_view(), name='role_remove'),
    path('users/roles/', UserRolesView.as_view(), name='current_user_roles'),
    path('users/<int:user_id>/roles/', UserRolesView.as_view(), name='user_roles'),
    
    # Permission URLs
    path('permissions/', PermissionListView.as_view(), name='permission_list'),
    
    # URL cho API citizen
    path('api/v1/citizen/', include(router.urls)),
    
    # URL cho dashboard stats
    path('api/v1/citizen/dashboard/stats/', citizen_views.CitizenDashboardStatsView.as_view(), name='citizen-dashboard-stats'),
]
