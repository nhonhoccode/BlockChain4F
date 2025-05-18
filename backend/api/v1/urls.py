from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.citizen import CitizenRequestViewSet, CitizenDocumentViewSet, CitizenFeedbackViewSet, CitizenDashboardStatsView
from .views.officer import (
    OfficerRequestViewSet, OfficerDocumentViewSet, 
    OfficerDocumentTypeViewSet, OfficerCitizenViewSet, OfficerDashboardStatsView
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

# URLs chính
urlpatterns = [
    # Dashboard APIs
    *dashboard_urlpatterns,
    
    # Các URL khác
    path('auth/', include('api.auth.urls')),  # Mở comment để kết nối auth URLs
    # path('documents/', include('api.v1.document_urls')),
    # path('requests/', include('api.v1.request_urls')),
]
