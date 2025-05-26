from .document_views import DocumentTypeViewSet, DocumentViewSet
from .request_views import RequestViewSet, AttachmentViewSet
from .citizen_views import (
    CitizenRequestListView, CitizenRequestCreateView, CitizenRequestDetailView,
    CitizenDocumentListView, CitizenDocumentDetailView,
    submit_request, add_attachment_to_request, request_attachments, cancel_request
)
from .officer_views import (
    OfficerRequestListView, OfficerRequestDetailView, OfficerRequestUpdateView,
    OfficerDocumentCreateView, OfficerDocumentListView,
    update_request_status, assign_self_to_request, verify_attachment,
    request_statistics, request_chairman_approval, approval_status
)
from .chairman_views import (
    ChairmanDashboardView, ChairmanApprovalListView, ChairmanApprovalDetailView,
    ChairmanApprovalUpdateView, ChairmanDocumentListView, ChairmanRequestListView,
    officer_statistics, approve_request, reject_approval, document_type_analysis
)
