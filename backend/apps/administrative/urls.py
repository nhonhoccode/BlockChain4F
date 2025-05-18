from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    # ViewSets
    DocumentTypeViewSet, DocumentViewSet, RequestViewSet, AttachmentViewSet,
    
    # Citizen views
    CitizenRequestListView, CitizenRequestCreateView, CitizenRequestDetailView,
    CitizenDocumentListView, CitizenDocumentDetailView,
    submit_request, add_attachment_to_request, request_attachments, cancel_request,
    
    # Officer views
    OfficerRequestListView, OfficerRequestDetailView, OfficerRequestUpdateView,
    OfficerDocumentCreateView, OfficerDocumentListView,
    update_request_status, assign_self_to_request, verify_attachment,
    request_statistics, request_chairman_approval, approval_status,
    
    # Chairman views
    ChairmanDashboardView, ChairmanApprovalListView, ChairmanApprovalDetailView,
    ChairmanApprovalUpdateView, ChairmanDocumentListView, ChairmanRequestListView,
    officer_statistics, approve_request, reject_approval, document_type_analysis
)

# Tạo router cho viewsets
router = DefaultRouter()
router.register('document-types', DocumentTypeViewSet, basename='document-type')
router.register('documents', DocumentViewSet, basename='document')
router.register('requests', RequestViewSet, basename='request')
router.register('attachments', AttachmentViewSet, basename='attachment')

# URLs cho API
urlpatterns = [
    # API gốc sử dụng viewsets
    path('', include(router.urls)),
    
    # API cho công dân
    path('citizen/requests/', CitizenRequestListView.as_view(), name='citizen-request-list'),
    path('citizen/requests/create/', CitizenRequestCreateView.as_view(), name='citizen-request-create'),
    path('citizen/requests/<int:pk>/', CitizenRequestDetailView.as_view(), name='citizen-request-detail'),
    path('citizen/requests/<int:pk>/submit/', submit_request, name='citizen-request-submit'),
    path('citizen/requests/<int:pk>/attachments/', request_attachments, name='citizen-request-attachments'),
    path('citizen/requests/<int:pk>/add-attachment/', add_attachment_to_request, name='citizen-request-add-attachment'),
    path('citizen/requests/<int:pk>/cancel/', cancel_request, name='citizen-request-cancel'),
    path('citizen/documents/', CitizenDocumentListView.as_view(), name='citizen-document-list'),
    path('citizen/documents/<int:pk>/', CitizenDocumentDetailView.as_view(), name='citizen-document-detail'),
    
    # API cho cán bộ xã
    path('officer/requests/', OfficerRequestListView.as_view(), name='officer-request-list'),
    path('officer/requests/<int:pk>/', OfficerRequestDetailView.as_view(), name='officer-request-detail'),
    path('officer/requests/<int:pk>/update/', OfficerRequestUpdateView.as_view(), name='officer-request-update'),
    path('officer/requests/<int:pk>/update-status/', update_request_status, name='officer-request-update-status'),
    path('officer/requests/<int:pk>/assign-self/', assign_self_to_request, name='officer-request-assign-self'),
    path('officer/statistics/', request_statistics, name='officer-request-statistics'),
    path('officer/documents/create/', OfficerDocumentCreateView.as_view(), name='officer-document-create'),
    path('officer/documents/', OfficerDocumentListView.as_view(), name='officer-document-list'),
    path('officer/attachments/<int:pk>/verify/', verify_attachment, name='officer-attachment-verify'),
    path('officer/approvals/request/', request_chairman_approval, name='officer-request-approval'),
    path('officer/approvals/', approval_status, name='officer-approval-status'),
    
    # API cho chủ tịch xã
    path('chairman/dashboard/', ChairmanDashboardView.as_view(), name='chairman-dashboard'),
    path('chairman/requests/', ChairmanRequestListView.as_view(), name='chairman-request-list'),
    path('chairman/documents/', ChairmanDocumentListView.as_view(), name='chairman-document-list'),
    path('chairman/approvals/', ChairmanApprovalListView.as_view(), name='chairman-approval-list'),
    path('chairman/approvals/<int:pk>/', ChairmanApprovalDetailView.as_view(), name='chairman-approval-detail'),
    path('chairman/approvals/<int:pk>/update/', ChairmanApprovalUpdateView.as_view(), name='chairman-approval-update'),
    path('chairman/approvals/<int:pk>/approve/', approve_request, name='chairman-approval-approve'),
    path('chairman/approvals/<int:pk>/reject/', reject_approval, name='chairman-approval-reject'),
    path('chairman/officer-statistics/', officer_statistics, name='chairman-officer-statistics'),
    path('chairman/document-type-analysis/', document_type_analysis, name='chairman-document-type-analysis'),
    
    # API kiểm tra giấy tờ công khai
    path('public/verify/', DocumentViewSet.as_view({'get': 'public_verification'}), name='public-document-verify'),
]
