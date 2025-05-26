from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token

# Import views directly from modules to avoid circular imports
from .views.auth_views import (
    debug_token_auth, refresh_auth_token, verify_auth_token,
    reset_password, reset_password_confirm, change_password,
    user_profile, google_auth, google_register, logout_user, citizen_dashboard_stats
)
from .views.citizen import CitizenRequestViewSet, CitizenDocumentViewSet, CitizenFeedbackViewSet, CitizenDashboardStatsView, CitizenDocumentTypeViewSet, DebugPermissionView
from .views.officer import (
    OfficerRequestViewSet, OfficerDocumentViewSet, 
    OfficerDocumentTypeViewSet, OfficerCitizenViewSet, OfficerDashboardStatsView,
    OfficerPendingRequestsView, OfficerStatisticsView
)
from .views.chairman import (
    ChairmanOfficerRequestViewSet, ChairmanOfficerViewSet, 
    ChairmanDocumentApprovalViewSet, ChairmanDashboardStatsView
)
from .views.chairman_views import dashboard_stats as chairman_dashboard_stats
from .views.officer_views import dashboard_stats as officer_dashboard_stats
from .views.debug_views import debug_user_info
from apps.accounts.views.dashboard import (
    CitizenDashboardView,
    OfficerDashboardView,
    ChairmanDashboardView
)
from apps.accounts.views.profile_views import CitizenProfileView, OfficerProfileView, ChairmanProfileView, ProfilePictureUploadView
from .views.common_views import DocumentTypeViewSet
from .views.document_verification import DocumentVerificationView, DocumentBlockchainHistoryView
from .views.document_verification import DocumentVerificationAPIView, DocumentHistoryAPIView
from .views.blockchain_endpoints import (
    BlockchainRegisterUserAPIView,
    BlockchainUserInfoAPIView,
    BlockchainUserRoleUpdateAPIView,
    BlockchainApprovalWorkflowAPIView,
    BlockchainPendingApprovalsAPIView
)
# Import the proper LoginView and RegisterView
from api.auth.views import LoginView, RegisterView, RegisterChairmanView

# Tạo router cho citizen endpoints
citizen_router = DefaultRouter()
citizen_router.register(r'requests', CitizenRequestViewSet, basename='citizen-request')
citizen_router.register(r'documents', CitizenDocumentViewSet, basename='citizen-document')
citizen_router.register(r'feedback', CitizenFeedbackViewSet, basename='citizen-feedback')
citizen_router.register(r'dashboard/stats', CitizenDashboardStatsView, basename='citizen-dashboard-stats')
citizen_router.register(r'document-types', CitizenDocumentTypeViewSet, basename='citizen-document-types')

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
]

# Profile URL patterns
profile_urlpatterns = [
    path('citizen/profile/', CitizenProfileView.as_view(), name='citizen-profile'),
    path('officer/profile/', OfficerProfileView.as_view(), name='officer-profile'),
    path('officer/profile/picture/', ProfilePictureUploadView.as_view(), name='officer-profile-picture'),
    path('chairman/profile/', ChairmanProfileView.as_view(), name='chairman-profile'),
]

# Blockchain verification endpoints
blockchain_urlpatterns = [
    path('verify/document/<str:document_id>/', DocumentVerificationView.as_view(), name='verify-document'),
    path('document/<str:document_id>/history/', DocumentBlockchainHistoryView.as_view(), name='document-blockchain-history'),
]

router = DefaultRouter()

urlpatterns = [
    # Include router URLs
    path('citizen/', include(citizen_router.urls)),
    path('officer/', include(officer_router.urls)),
    path('chairman/', include(chairman_router.urls)),
    
    # Debug view
    path('debug/permissions/', DebugPermissionView.as_view(), name='debug-permissions'),
    
    # Include additional officer URLs
    path('officer/', include(officer_additional_urlpatterns)),
    
    # Include dashboard URLs
    path('', include(dashboard_urlpatterns)),
    
    # Include profile URLs
    path('', include(profile_urlpatterns)),
    
    # Authentication endpoints
    path('auth/token/', LoginView.as_view(), name='token_obtain'),
    path('auth/debug-token/', debug_token_auth, name='debug_token_auth'),
    path('auth/token/refresh/', refresh_auth_token, name='token_refresh'),
    path('auth/token/verify/', verify_auth_token, name='token_verify'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/register-officer/', RegisterView.as_view(), name='register_officer'),
    path('auth/register-chairman/', RegisterChairmanView.as_view(), name='register_chairman'),
    path('auth/password/reset/', reset_password, name='reset_password'),
    path('auth/password/reset/confirm/', reset_password_confirm, name='reset_password_confirm'),
    path('auth/change-password/', change_password, name='change_password'),
    path('auth/user/', user_profile, name='user_profile'),
    path('auth/google-auth/', google_auth, name='google_auth'),
    path('auth/google-register/', google_register, name='google_register'),
    path('auth/logout/', logout_user, name='logout'),
    
    # Citizen Dashboard
    path('citizen/dashboard/stats/', citizen_dashboard_stats, name='citizen_dashboard_stats'),
    
    # Officer Dashboard
    path('officer/dashboard/stats/', officer_dashboard_stats, name='officer_dashboard_stats'),
    
    # Chairman Dashboard
    path('chairman/dashboard/stats/', chairman_dashboard_stats, name='chairman_dashboard_stats'),
    
    # Thêm endpoints blockchain
    path('blockchain/', include(blockchain_urlpatterns)),
    
    # Blockchain Document Verification
    path('blockchain/verify-document/', DocumentVerificationAPIView.as_view(), name='verify-document'),
    path('blockchain/document-history/<str:document_id>/', DocumentHistoryAPIView.as_view(), name='document-history'),
    
    # Blockchain User Management
    path('blockchain/register-user/', BlockchainRegisterUserAPIView.as_view(), name='blockchain-register-user'),
    path('blockchain/user-info/<str:blockchain_id>/', BlockchainUserInfoAPIView.as_view(), name='blockchain-user-info'),
    path('blockchain/update-user-role/', BlockchainUserRoleUpdateAPIView.as_view(), name='blockchain-update-user-role'),
    
    # Blockchain Approval Workflow
    path('blockchain/approval-workflow/<str:approval_id>/', BlockchainApprovalWorkflowAPIView.as_view(), name='blockchain-approval-workflow'),
    path('blockchain/pending-approvals/<str:approver_id>/', BlockchainPendingApprovalsAPIView.as_view(), name='blockchain-pending-approvals'),
    
    # Debug endpoints
    path('debug/user-info/', debug_user_info, name='debug_user_info'),
]
