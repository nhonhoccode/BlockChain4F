"""
URL patterns for the blockchain application.
"""
from django.urls import path
from . import views

app_name = 'blockchain'

urlpatterns = [
    path('', views.index, name='index'),
    path('request-form/', views.request_form, name='request_form'),
    path('request/<int:pk>/', views.request_detail, name='request_detail'),
    path('request/<int:pk>/update-status/', views.update_request_status, name='update_request_status'),
    path('request/<int:pk>/assign/', views.assign_request, name='assign_request'),
    path('request/<int:pk>/upload-document/', views.upload_document, name='upload_document'),
    path('request/<int:pk>/upload-multiple-documents/', views.upload_multiple_documents, name='upload_multiple_documents'),
    path('request/<int:pk>/download-document/<int:doc_id>/', views.download_document, name='download_document'),
    path('request/<int:pk>/request-document/', views.request_document, name='request_document'),
    path('request/<int:pk>/fulfill-document-request/<int:doc_request_id>/', views.fulfill_document_request, name='fulfill_document_request'),
    path('track-request/', views.track_request, name='track_request'),
    path('my-requests/', views.my_requests, name='my_requests'),
    path('admin-dashboard/', views.admin_dashboard, name='admin_dashboard'),
    path('official-dashboard/', views.official_dashboard, name='official_dashboard'),
    path('register-official/', views.register_official, name='register_official'),
    path('manage-categories/', views.manage_categories, name='manage_categories'),
] 