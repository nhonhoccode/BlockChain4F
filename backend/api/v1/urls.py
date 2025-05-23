from django.urls import path, include
from rest_framework.routers import DefaultRouter

# Import views directly from modules to avoid circular imports
from .views.citizen import CitizenRequestViewSet, CitizenDocumentViewSet, CitizenFeedbackViewSet, CitizenDashboardStatsView
from .views.officer import (
    OfficerRequestViewSet, OfficerDocumentViewSet, 
    OfficerDocumentTypeViewSet, OfficerCitizenViewSet, OfficerDashboardStatsView,
    OfficerPendingRequestsView, OfficerStatisticsView
)
from .views.chairman import (
    ChairmanOfficerRequestViewSet, ChairmanOfficerViewSet, 
    ChairmanDocumentApprovalViewSet, ChairmanDashboardStatsView
)
from apps.accounts.views.dashboard import (
    CitizenDashboardView,
    OfficerDashboardView,
    ChairmanDashboardView
)
from apps.accounts.views.profile_views import CitizenProfileView, OfficerProfileView, ChairmanProfileView, ProfilePictureUploadView
from .views import auth_views, officer_views, chairman_views

# Tạo router cho citizen endpoints
citizen_router = DefaultRouter()
citizen_router.register(r'requests', CitizenRequestViewSet, basename='citizen-request')
citizen_router.register(r'documents', CitizenDocumentViewSet, basename='citizen-document')
citizen_router.register(r'feedback', CitizenFeedbackViewSet, basename='citizen-feedback')
citizen_router.register(r'dashboard/stats', CitizenDashboardStatsView, basename='citizen-dashboard-stats')

# Tạo router cho officer endpoints
officer_router = DefaultRouter()
officer_router.register(r'requests', OfficerRequestViewSet, basename='officer-request')
officer_router.register(r'documents', OfficerDocumentViewSet, basename='officer-document')
officer_router.register(r'document-types', OfficerDocumentTypeViewSet, basename='officer-document-type')
officer_router.register(r'citizens', OfficerCitizenViewSet, basename='officer-citizen')
officer_router.register(r'dashboard/stats', OfficerDashboardStatsView, basename='officer-dashboard-stats')

# Officer additional URLs (for non-ViewSet views)
officer_additional_urlpatterns = [
    path('requests/pending/', OfficerPendingRequestsView.as_view(), name='officer-pending-requests'),
    path('statistics/', OfficerStatisticsView.as_view(), name='officer-statistics'),
]

# Tạo router cho chairman endpoints
chairman_router = DefaultRouter()
chairman_router.register(r'officer-requests', ChairmanOfficerRequestViewSet, basename='chairman-officer-request')
chairman_router.register(r'officers', ChairmanOfficerViewSet, basename='chairman-officer')
chairman_router.register(r'document-approvals', ChairmanDocumentApprovalViewSet, basename='chairman-document-approval')
chairman_router.register(r'dashboard/stats', ChairmanDashboardStatsView, basename='chairman-dashboard-stats')

# Dashboard URL patterns
dashboard_urlpatterns = [
    path('citizen/dashboard/stats/', CitizenDashboardView.as_view(), name='citizen-dashboard'),
    path('officer/dashboard/stats/', OfficerDashboardView.as_view(), name='officer-dashboard'),
    path('chairman/dashboard/stats/', ChairmanDashboardView.as_view(), name='chairman-dashboard'),
]

# Profile URL patterns
profile_urlpatterns = [
    path('citizen/profile/', CitizenProfileView.as_view(), name='citizen-profile'),
    path('officer/profile/', OfficerProfileView.as_view(), name='officer-profile'),
    path('officer/profile/picture/', ProfilePictureUploadView.as_view(), name='officer-profile-picture'),
    path('chairman/profile/', ChairmanProfileView.as_view(), name='chairman-profile'),
]

urlpatterns = [
    # Include router URLs
    path('citizen/', include(citizen_router.urls)),
    path('officer/', include(officer_router.urls)),
    path('chairman/', include(chairman_router.urls)),
    
    # Include additional officer URLs
    path('officer/', include(officer_additional_urlpatterns)),
    
    # Include dashboard URLs
    path('', include(dashboard_urlpatterns)),
    
    # Include profile URLs
    path('', include(profile_urlpatterns)),
    
    # Authentication endpoints
    path('auth/token/', auth_views.obtain_auth_token, name='token_obtain'),
    path('auth/token/refresh/', auth_views.refresh_auth_token, name='token_refresh'),
    path('auth/token/verify/', auth_views.verify_auth_token, name='token_verify'),
    path('auth/register/', auth_views.register_user, name='register'),
    path('auth/register-chairman/', auth_views.register_chairman, name='register_chairman'),
    path('auth/password/reset/', auth_views.reset_password, name='reset_password'),
    path('auth/password/reset/confirm/', auth_views.reset_password_confirm, name='reset_password_confirm'),
    path('auth/change-password/', auth_views.change_password, name='change_password'),
    path('auth/user/', auth_views.user_profile, name='user_profile'),
    path('auth/google-auth/', auth_views.google_auth, name='google_auth'),
    path('auth/google-register/', auth_views.google_register, name='google_register'),
    path('auth/logout/', auth_views.logout_user, name='logout'),
    
    # Citizen Dashboard
    path('citizen/dashboard/stats/', auth_views.citizen_dashboard_stats, name='citizen_dashboard_stats'),
    
    # Officer Dashboard
    path('officer/dashboard/stats/', officer_views.dashboard_stats, name='officer_dashboard_stats'),
    
    # Chairman Dashboard
    path('chairman/dashboard/stats/', chairman_views.dashboard_stats, name='chairman_dashboard_stats'),
]
