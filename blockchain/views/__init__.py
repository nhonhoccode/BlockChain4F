"""
Views for the blockchain application (modular organization).
"""
# Import and expose views for backwards compatibility
# This allows existing code to continue using `from blockchain.views import X`

# Public views
from .public import index, procedures_overview, track_request, request_list, embed_document

# Request-related views
from .request import (
    request_form, request_detail, update_status, my_requests, assign_request,
    upload_document, download_document, request_document, upload_multiple_documents,
    mark_doc_request_fulfilled, fulfill_document_request, view_document,
    upload_requested_document, view_submitted_form
)

# Admin views
from .admin import (
    admin_dashboard, register_official, delegate_authority,
    category_management, manage_categories
)

# Official views
from .official import official_dashboard

# API views
from .api import api_request_types, api_submit_request

# This file will be populated with proper imports as we split the views.py file
# For now, we're importing from the original views module as a fallback
try:
    # Try importing from the new modular files
    pass
except ImportError:
    # Fall back to importing from the original views.py
    from .. import views as original_views
    
    # Define globals that would normally be imported from modular files
    # This is a temporary measure until all view modules are created
    
    # Public views
    if 'index' not in globals():
        index = original_views.index
    if 'procedures_overview' not in globals():
        procedures_overview = original_views.procedures_overview
    if 'track_request' not in globals():
        track_request = original_views.track_request
    if 'request_list' not in globals():
        request_list = original_views.request_list
    if 'embed_document' not in globals():
        embed_document = original_views.embed_document
    
    # Request views
    if 'request_form' not in globals():
        request_form = original_views.request_form
    if 'request_detail' not in globals():
        request_detail = original_views.request_detail
    if 'update_status' not in globals():
        update_status = original_views.update_status
    if 'my_requests' not in globals():
        my_requests = original_views.my_requests
    if 'assign_request' not in globals():
        assign_request = original_views.assign_request
    if 'upload_document' not in globals():
        upload_document = original_views.upload_document
    if 'download_document' not in globals():
        download_document = original_views.download_document
    if 'request_document' not in globals():
        request_document = original_views.request_document
    if 'upload_multiple_documents' not in globals():
        upload_multiple_documents = original_views.upload_multiple_documents
    if 'mark_doc_request_fulfilled' not in globals():
        mark_doc_request_fulfilled = original_views.mark_doc_request_fulfilled
    if 'fulfill_document_request' not in globals():
        fulfill_document_request = original_views.fulfill_document_request
    if 'view_document' not in globals():
        view_document = original_views.view_document
    if 'upload_requested_document' not in globals():
        upload_requested_document = original_views.upload_requested_document
    if 'view_submitted_form' not in globals():
        view_submitted_form = original_views.view_submitted_form
    
    # Admin views
    if 'admin_dashboard' not in globals():
        admin_dashboard = original_views.admin_dashboard
    if 'register_official' not in globals():
        register_official = original_views.register_official
    if 'delegate_authority' not in globals():
        delegate_authority = original_views.delegate_authority
    if 'category_management' not in globals():
        category_management = original_views.category_management
    if 'manage_categories' not in globals():
        manage_categories = original_views.manage_categories
    
    # Official views
    if 'official_dashboard' not in globals():
        official_dashboard = original_views.official_dashboard
    
    # API views
    if 'api_request_types' not in globals():
        api_request_types = original_views.api_request_types
    if 'api_submit_request' not in globals():
        api_submit_request = original_views.api_submit_request 