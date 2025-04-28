"""
URL patterns for the blockchain application.
"""
from django.urls import path
from django.views.static import serve
from django.conf import settings
import os
from . import views

app_name = 'blockchain'

urlpatterns = [
    # Public views
    path('', views.index, name='index'),
    path('procedures-overview/', views.procedures_overview, name='procedures_overview'),
    path('track-request/', views.track_request, name='track_request'),
    
    # Request management
    path('new-request/', views.request_form, name='request_form'),
    path('my-requests/', views.my_requests, name='my_requests'),
    path('request/<int:pk>/', views.request_detail, name='request_detail'),
    path('request/<int:pk>/submitted-form/', views.view_submitted_form, name='view_submitted_form'),
    path('request/<int:pk>/upload-document/', views.upload_document, name='upload_document'),
    path('request/<int:pk>/update-status/', views.update_status, name='update_status'),
    path('request/<int:pk>/assign/', views.assign_request, name='assign_request'),
    path('request/<int:pk>/request-document/', views.request_document, name='request_document'),
    path('upload-multiple-documents/<int:pk>/', views.upload_multiple_documents, name='upload_multiple_documents'),
    
    # Document views
    path('document/<int:pk>/', views.view_document, name='view_document'),
    path('document/<int:pk>/download/', views.download_document, name='download_document'),
    path('document-request/<int:pk>/upload/', views.upload_requested_document, name='upload_requested_document'),
    
    # Administrative views
    path('admin/dashboard/', views.admin_dashboard, name='admin_dashboard'),
    path('admin/register-official/', views.register_official, name='register_official'),
    path('admin/delegate-authority/', views.delegate_authority, name='delegate_authority'),
    path('admin/category-management/', views.category_management, name='category_management'),
    path('admin/manage-categories/<int:category_id>/', views.manage_categories, name='manage_categories'),
    
    # Official views
    path('official/dashboard/', views.official_dashboard, name='official_dashboard'),
    
    # API endpoints for request form
    path('api/request-types/', views.api_request_types, name='api_request_types'),
    path('api/submit-request/', views.api_submit_request, name='api_submit_request'),
    
    # Document embedding
    path('embed-document/<path:document_path>', views.embed_document, name='embed_document'),
    
    # Public request list
    path('requests/', views.request_list, name='request_list'),
] 