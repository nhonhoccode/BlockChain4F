"""
Views for the blockchain application.
"""
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse, HttpResponse, FileResponse
from django.views.decorators.http import require_POST, require_http_methods
from django.db import transaction
from django.utils import timezone
import os
import mimetypes
from wsgiref.util import FileWrapper
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
import hashlib
from decimal import Decimal
import json
import time
import random
import string
import traceback
from django.views.decorators.csrf import csrf_exempt
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db.models import Q

from .models import AdministrativeRequest, RequestStatusUpdate, RequestDocument, DocumentRequest, RequestCategory, AdministrativeRequestFile, Comment
from .forms import (
    AdministrativeRequestForm, RequestStatusUpdateForm, RequestTrackingForm, 
    RequestAssignmentForm, DocumentUploadForm, DocumentRequestForm, MultipleDocumentUploadForm, 
    OfficialRegistrationForm, AuthorityDelegationForm, CategoryAssignmentForm, CommentForm
)
from . import blockchain
from django.contrib.auth.models import User
from accounts.models import UserProfile

# Configure logging
logger = logging.getLogger(__name__)

def get_client_ip(request):
    """Get the client IP address from request object."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR', 'unknown')
    return ip

def index(request):
    """Homepage view."""
    tracking_form = RequestTrackingForm()
    return render(request, 'blockchain/public/index.html', {
        'tracking_form': tracking_form
    })


@login_required
def request_form(request):
    """View for submitting new administrative requests."""
    import json  # Import json module here to ensure it's available
    
    # Initialize form variable for both GET and POST requests
    form = None
    
    if request.method == 'POST':
        form = AdministrativeRequestForm(request.POST)
        if form.is_valid():
            try:
                with transaction.atomic():
                    # Create request in database
                    request_obj = form.save(commit=False)
                    request_obj.user = request.user
                    
                    # Save the request with the specified category
                    request_obj.save()
                    
                    # Create request on blockchain
                    result = blockchain.create_request(
                        request_obj.user_hash,
                        request_obj.request_type,
                        request_obj.description,
                        request_obj.payment_amount
                    )
                    
                    if result and 'request' in result:
                        # Update request with blockchain transaction hash
                        request_obj.tx_hash = result.get('tx_hash', '')
                        request_obj.save()
                        
                        messages.success(request, 'Your request has been submitted successfully.')
                        # Redirect to my_requests
                        return redirect('blockchain:my_requests')
                    else:
                        # If blockchain submission fails, delete the database record
                        request_obj.delete()
                        error_message = result.get("error", "Unknown error") if result else "Failed to communicate with blockchain"
                        messages.error(request, f'Failed to submit request to blockchain: {error_message}')
            except Exception as e:
                messages.error(request, f'An error occurred while submitting your request: {str(e)}')
        else:
            # Log form errors for debugging - fixed indentation
            error_fields = ', '.join(form.errors.keys())
            messages.error(request, f'Please correct the errors in these fields: {error_fields}')
    else:
        # Initialize the form for GET requests
        form = AdministrativeRequestForm()
    
    # Load categories for dropdown
    categories = RequestCategory.objects.all()
    
    return render(request, 'blockchain/requests/request_form.html', {
        'categories': categories,
        'form': form  # Pass form to the template
    })


@login_required
def request_detail(request, pk):
    # Get the request object or return 404
    admin_request = get_object_or_404(AdministrativeRequest, pk=pk)
    
    # Check permissions
    is_requestor = (request.user == admin_request.user)
    is_president = hasattr(request.user, 'profile') and request.user.profile.is_chairman()
    is_authorized_official = False
    
    # Check if user is an authorized official for this category
    if admin_request.category and hasattr(request.user, 'profile') and request.user.profile.is_official():
        is_authorized_official = admin_request.category.assigned_officials.filter(id=request.user.id).exists()
    
    # Determine if the user can see full details
    can_see_full_details = is_requestor or is_president or is_authorized_official
    
    # Get the files associated with this request
    files = AdministrativeRequestFile.objects.filter(request=admin_request)
    
    # For users without full access, only show files uploaded by the request owner
    if not can_see_full_details:
        files = files.filter(uploaded_by=admin_request.user)
    
    # Comments handling
    comments = Comment.objects.filter(request=admin_request).order_by('created_at')
    comment_form = None
    
    # Only allow commenting for those who can see full details
    if can_see_full_details:
        if request.method == 'POST':
            comment_form = CommentForm(request.POST)
            if comment_form.is_valid():
                comment = comment_form.save(commit=False)
                comment.request = admin_request
                comment.user = request.user
                comment.save()
                return redirect('blockchain:request_detail', pk=pk)
        else:
            comment_form = CommentForm()
    
    # Get status updates
    status_updates = RequestStatusUpdate.objects.filter(request=admin_request).order_by('-created_at')
    
    # Get available officers for assignment if user is chairman
    available_officers = None
    
    if is_president:
        available_officers = User.objects.filter(
            profile__role='OFFICIAL',
            profile__approval_status='APPROVED',
            is_active=True
        ).order_by('first_name', 'last_name')
    
    # Create a restricted version of the request object for users without full access
    if not can_see_full_details:
        # Create a copy of the request data with masked personal information
        admin_request.full_name = admin_request.get_masked_name()
        admin_request.phone_number = admin_request.get_masked_phone()
        admin_request.address = admin_request.get_masked_address()
        
        # Remove sensitive form data if present
        if hasattr(admin_request, 'form_data') and admin_request.form_data:
            # Preserve only basic request metadata, hide all actual form field values
            admin_request.form_data = {
                k: v if k in ['request_type', 'category', 'description'] else '***REDACTED***'
                for k, v in admin_request.form_data.items() 
                if not k.startswith('_')
            }
    
    # Create a more granular access control for form data specifically
    has_full_form_data_access = is_requestor or is_president
    if is_authorized_official and admin_request.category:
        # Check if this official is specifically authorized for this category
        has_full_form_data_access = admin_request.category.assigned_officials.filter(id=request.user.id).exists()
    
    # Context to pass to the template
    context = {
        'request': admin_request,
        'files': files,
        'comments': comments,
        'comment_form': comment_form,
        'status_updates': status_updates,
        'is_requestor': is_requestor,
        'is_president': is_president,
        'is_authorized_official': is_authorized_official,
        'can_see_full_details': can_see_full_details,
        'has_full_form_data_access': has_full_form_data_access,
        'available_officers': available_officers,
        'STATUS_CHOICES': AdministrativeRequest.STATUS_CHOICES,
    }
    
    return render(request, 'blockchain/requests/request_detail.html', context)


@login_required
@require_http_methods(["POST"])
def update_status(request, pk):
    """View for updating request status."""
    request_obj = get_object_or_404(AdministrativeRequest, pk=pk)
    
    # Check if user has permission to update this request
    if not (request.user.is_staff or request.user == request_obj.assigned_to):
        messages.error(request, "You don't have permission to update this request.")
        return redirect('blockchain:request_detail', pk=pk)
    
    form = RequestStatusUpdateForm(request.POST)
    if form.is_valid():
        new_status = form.cleaned_data['new_status']
        comments = form.cleaned_data['comments']
        
        try:
            with transaction.atomic():
                # Check if request exists in blockchain
                blockchain_request = blockchain.get_request_details(request_obj.id)
                
                # If request doesn't exist in blockchain, create it
                if not blockchain_request:
                    try:
                        # Create request in blockchain with the same ID as in database
                        result = blockchain.create_request_with_id(
                            request_id=request_obj.id,
                            user_id=str(request_obj.user.id),
                            request_type=request_obj.request_type,
                            description=request_obj.description,
                            payment_amount=float(request_obj.payment_amount or Decimal('0.0'))
                        )
                        if 'error' in result:
                            raise Exception(result['error'])
                        messages.info(request, "Request was not found in blockchain and has been created.")
                    except Exception as e:
                        raise Exception(f"Failed to create request in blockchain: {str(e)}")
                
                # Update request status in blockchain
                try:
                    # Update blockchain status
                    blockchain_result = blockchain.update_request_status(
                        request_id=request_obj.id,
                        new_status=new_status,
                        comment=comments
                    )
                    
                    if 'error' in blockchain_result:
                        raise Exception(blockchain_result['error'])
                    
                    # If blockchain update was successful, update database
                    status_update = RequestStatusUpdate(
                        request=request_obj,
                        old_status=request_obj.status,
                        new_status=new_status,
                        updated_by=request.user,
                        comments=comments,
                        tx_hash=blockchain_result.get('tx_hash', '')
                    )
                    status_update.save()
                    
                    # Update the request object
                    request_obj.status = new_status
                    request_obj.save()
                    
                    messages.success(request, f"Request status updated to {new_status}")
                except Exception as e:
                    raise Exception(f"Failed to update status on blockchain: {str(e)}")
                
        except Exception as e:
            messages.error(request, str(e))
            return redirect('blockchain:request_detail', pk=pk)
            
        return redirect('blockchain:request_detail', pk=pk)
    else:
        for field, errors in form.errors.items():
            for error in errors:
                messages.error(request, f"{field}: {error}")
        return redirect('blockchain:request_detail', pk=pk)


def track_request(request):
    """View for tracking an administrative request."""
    blockchain_data = None
    
    if request.method == 'POST':
        form = RequestTrackingForm(request.POST)
        if form.is_valid():
            request_id = form.cleaned_data['request_id'].strip()
            request_obj = None
            
            # Try to find by ID first
            try:
                request_id_int = int(request_id)
                request_obj = AdministrativeRequest.objects.filter(id=request_id_int).first()
                if request_obj:
                    return redirect('blockchain:request_detail', pk=request_obj.pk)
            except (ValueError, TypeError):
                # Not an integer, try as transaction hash
                pass
            
            # Try to find by transaction hash
            if not request_obj:
                request_obj = AdministrativeRequest.objects.filter(tx_hash=request_id).first()
                if request_obj:
                    return redirect('blockchain:request_detail', pk=request_obj.pk)
            
            # If not found, try hash as substring
            if not request_obj:
                request_obj = AdministrativeRequest.objects.filter(tx_hash__icontains=request_id).first()
                if request_obj:
                    return redirect('blockchain:request_detail', pk=request_obj.pk)
            
            # If still not found, try to get from blockchain directly
            try:
                # First try as integer ID
                try:
                    request_id_int = int(request_id)
                    result = blockchain.get_request_details(request_id_int)
                except (ValueError, TypeError):
                    # Not an integer, try some other logic
                    result = {'success': False, 'error': 'Not a valid request ID'}
                
                if result.get('success', False):
                    # We found data on blockchain
                    blockchain_data = result.get('request', {})
                    
                    # Try to match with database record by user_hash
                    if blockchain_data.get('user_hash'):
                        request_obj = AdministrativeRequest.objects.filter(
                            user_hash=blockchain_data.get('user_hash')
                        ).first()
                        
                        if request_obj:
                            return redirect('blockchain:request_detail', pk=request_obj.pk)
                    
                    messages.warning(
                        request,
                        "Request found on blockchain but not in our database. Details shown below."
                    )
                    return render(request, 'blockchain/public/track_request.html', {
                        'form': form,
                        'blockchain_data': blockchain_data
                    })
            except Exception as e:
                messages.error(request, f"Error connecting to blockchain: {str(e)}")
            
            # If we get here, the request was not found
            messages.error(
                request, 
                "Request not found. Please check the ID or transaction hash and try again."
            )
        else:
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f"{field}: {error}")
    else:
        form = RequestTrackingForm()
    
    return render(request, 'blockchain/public/track_request.html', {
        'form': form,
        'blockchain_data': blockchain_data
    })


@login_required
def my_requests(request):
    """View for displaying the user's requests."""
    requests = AdministrativeRequest.objects.filter(user=request.user).order_by('-created_at')
    return render(request, 'blockchain/requests/my_requests.html', {'requests': requests})


@login_required
@require_POST
def assign_request(request, pk):
    """View for assigning a request to a commune officer."""
    if not request.user.is_staff:
        messages.error(request, "Only the commune chairman can assign requests.")
        return redirect('blockchain:index')
    
    request_obj = get_object_or_404(AdministrativeRequest, pk=pk)
    
    # Check if request can be assigned
    if request_obj.status != 'PENDING':
        messages.error(request, "Only pending requests can be assigned.")
        return redirect('blockchain:request_detail', pk=pk)
    
    if request_obj.assigned_to:
        messages.error(request, "This request is already assigned to an officer.")
        return redirect('blockchain:request_detail', pk=pk)
    
    # Get officer ID from POST data
    officer_id = request.POST.get('officer')
    if not officer_id:
        messages.error(request, "Please select an officer to assign the request to.")
        return redirect('blockchain:request_detail', pk=pk)
    
    try:
        # Get the officer and verify their status
        officer = User.objects.get(
            id=officer_id,
            profile__role='OFFICIAL',
            profile__approval_status='APPROVED'
        )
        
        # Check if officer is already assigned to this request
        if officer == request_obj.assigned_to:
            messages.error(request, "This request is already assigned to this officer.")
            return redirect('blockchain:request_detail', pk=pk)
        
        # Get officer's ethereum address
        officer_address = officer.profile.ethereum_address
        if not officer_address:
            messages.error(request, "The selected officer does not have a registered blockchain address.")
            return redirect('blockchain:request_detail', pk=pk)
        
        with transaction.atomic():
            # Update database
            old_status = request_obj.status
            request_obj.assigned_to = officer
            request_obj.assigned_by = request.user
            request_obj.assignment_date = timezone.now()
            request_obj.status = 'ASSIGNED'
            
            # Save estimated completion date if provided
            if 'estimated_completion_date' in request.POST and request.POST['estimated_completion_date']:
                request_obj.estimated_completion_date = request.POST['estimated_completion_date']
                
            request_obj.save()
            
            # Create status update record
            status_update = RequestStatusUpdate.objects.create(
                request=request_obj,
                old_status=old_status,
                new_status='ASSIGNED',
                comments=f"Assigned to {officer.get_full_name() or officer.username}",
                updated_by=request.user
            )
            
            # Submit to blockchain
            try:
                result = blockchain.assign_request(
                    request_obj.id,
                    officer_address
                )
                
                if 'error' in result:
                    raise Exception(result['error'])
                
                if result.get('success', False):
                    # Update status update with blockchain transaction hash
                    status_update.tx_hash = result.get('tx_hash', '')
                    status_update.save()
                    
                    messages.success(
                        request,
                        f"Request successfully assigned to {officer.get_full_name() or officer.username}."
                    )
                else:
                    raise Exception("Failed to record assignment on blockchain")
                    
            except Exception as e:
                # Rollback database changes if blockchain update fails
                transaction.set_rollback(True)
                messages.error(
                    request,
                    f"Failed to assign request: {str(e)}"
                )
                return redirect('blockchain:request_detail', pk=pk)
                
    except User.DoesNotExist:
        messages.error(request, "Selected officer not found or not approved.")
    except Exception as e:
        messages.error(request, f"An error occurred while assigning the request: {str(e)}")
    
    return redirect('blockchain:request_detail', pk=pk)


@login_required
def admin_dashboard(request):
    """Admin dashboard view."""
    if not request.user.is_staff:
        messages.error(request, "You don't have permission to access the admin dashboard.")
        return redirect('blockchain:index')
    
    # Get category filter
    category_id = request.GET.get('category')
    current_category = None
    
    # Get status filter
    status_filter = request.GET.get('status')
    
    # Base queryset
    requests_queryset = AdministrativeRequest.objects.all()
    
    # Apply category filter if specified
    if category_id:
        try:
            current_category = RequestCategory.objects.get(id=category_id)
            requests_queryset = requests_queryset.filter(category=current_category)
        except (RequestCategory.DoesNotExist, ValueError):
            messages.warning(request, "Invalid category selected.")
    
    # Apply status filter if specified
    if status_filter and status_filter in dict(AdministrativeRequest.STATUS_CHOICES):
        requests_queryset = requests_queryset.filter(status=status_filter)
    
    # Get requests by status
    pending_requests = requests_queryset.filter(status='PENDING').order_by('-created_at')
    assigned_requests = requests_queryset.filter(status='ASSIGNED').order_by('-created_at')
    in_progress_requests = requests_queryset.filter(status='IN_PROGRESS').order_by('-created_at')
    additional_info_requests = requests_queryset.filter(status='ADDITIONAL_INFO').order_by('-created_at')
    approved_requests = requests_queryset.filter(status='APPROVED').order_by('-created_at')
    rejected_requests = requests_queryset.filter(status='REJECTED').order_by('-created_at')
    completed_requests = requests_queryset.filter(status='COMPLETED').order_by('-created_at')
    
    # Get total count of requests (unfiltered)
    total_requests = AdministrativeRequest.objects.count()
    
    # Get all categories for the sidebar
    categories = RequestCategory.objects.all().order_by('name')

    # Get all available officers for assignment
    available_officers = User.objects.filter(
        profile__role='OFFICIAL',
        profile__approval_status='APPROVED',
        is_active=True
    ).order_by('first_name', 'last_name')
    
    # Get topic-specific form information
    topic_forms = {
        'civil_registration': [
            {'name': 'Birth Certificate Request', 'url': '/blockchain/docs/civil_registration/birth_certificate_form.html'},
            {'name': 'Marriage Certificate Request', 'url': '/blockchain/docs/civil_registration/marriage_certificate_form.html'},
        ],
        'business_licenses': [
            {'name': 'Business Permit Application', 'url': '/blockchain/docs/business_licenses/business_permit_form.html'},
            {'name': 'License Renewal Application', 'url': '/blockchain/docs/business_licenses/license_renewal_form.html'},
        ],
        'land_and_property': [
            {'name': 'Land Title Application', 'url': '/blockchain/docs/land_and_property/land_title_form.html'},
            {'name': 'Property Transfer Request', 'url': '/blockchain/docs/land_and_property/property_transfer_form.html'},
        ],
        'identity_documents': [
            {'name': 'Residence Certificate Request', 'url': '/blockchain/docs/identity_documents/residence_certificate_form.html'},
        ],
        'tax_and_fees': [
            {'name': 'Tax Clearance Certificate', 'url': '/blockchain/docs/tax_and_fees/tax_clearance_form.html'},
        ],
        'other_services': [
            {'name': 'General Application Form', 'url': '/blockchain/docs/other_services/general_application_form.html'},
        ],
    }
    
    return render(request, 'blockchain/admin/admin_dashboard.html', {
        'pending_requests': pending_requests,
        'assigned_requests': assigned_requests,
        'in_progress_requests': in_progress_requests,
        'additional_info_requests': additional_info_requests,
        'approved_requests': approved_requests,
        'rejected_requests': rejected_requests,
        'completed_requests': completed_requests,
        'total_requests': total_requests,
        'pending_count': pending_requests.count(),
        'assigned_count': assigned_requests.count(),
        'in_progress_count': in_progress_requests.count(),
        'additional_info_count': additional_info_requests.count(),
        'approved_count': approved_requests.count(),
        'rejected_count': rejected_requests.count(),
        'completed_count': completed_requests.count(),
        'categories': categories,
        'current_category': current_category,
        'status_filter': status_filter,
        'available_officers': available_officers,
        'topic_forms': topic_forms,
    })


@login_required
def upload_document(request, pk):
    """View for uploading documents to a request."""
    request_obj = get_object_or_404(AdministrativeRequest, pk=pk)
    
    # Check if user has permission to upload documents
    if not (request.user.is_staff or request.user == request_obj.user or request.user == request_obj.assigned_to):
        messages.error(request, "You don't have permission to upload documents to this request.")
        return redirect('blockchain:request_detail', pk=pk)
    
    if request.method == 'POST':
        form = DocumentUploadForm(request.POST, request.FILES)
        if form.is_valid():
            document = form.save(commit=False)
            document.request = request_obj
            document.uploaded_by = request.user
            document.save()
            
            messages.success(request, "Document uploaded successfully.")
            
            # If this is an additional info document and request status is ADDITIONAL_INFO
            if (request_obj.status == 'ADDITIONAL_INFO' and 
                form.cleaned_data['document_type'] == 'ADDITIONAL_INFO' and 
                request.user == request_obj.user):
                
                # Check if all document requests are fulfilled
                pending_doc_requests = DocumentRequest.objects.filter(
                    request=request_obj, 
                    status='PENDING'
                ).count()
                
                if pending_doc_requests == 0:
                    # Update request status to IN_PROGRESS
                    old_status = request_obj.status
                    request_obj.status = 'IN_PROGRESS'
                    request_obj.save()
                    
                    # Create status update
                    status_update = RequestStatusUpdate.objects.create(
                        request=request_obj,
                        old_status=old_status,
                        new_status='IN_PROGRESS',
                        comments="All requested documents submitted by citizen",
                        updated_by=request.user
                    )
                    
                    # Submit to blockchain
                    try:
                        result = blockchain.update_request_status(
                            request_obj.id,
                            'IN_PROGRESS',
                            "All requested documents submitted by citizen"
                        )
                        
                        if result.get('success', False):
                            status_update.tx_hash = result['tx_hash']
                            status_update.save()
                            
                            messages.success(
                                request, 
                                "All requested documents have been uploaded. Request status updated to In Progress."
                            )
                    except Exception as e:
                        messages.warning(
                            request, 
                            f"Status updated in database but failed to record on blockchain: {str(e)}"
                        )
            
            return redirect('blockchain:request_detail', pk=pk)
        else:
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f"{field}: {error}")
    else:
        form = DocumentUploadForm()
    
    context = {
        'form': form,
        'request_obj': request_obj,
    }
    
    return render(request, 'blockchain/requests/upload_document.html', context)


@login_required
def download_document(request, pk, doc_id):
    """View for downloading documents."""
    request_obj = get_object_or_404(AdministrativeRequest, pk=pk)
    document = get_object_or_404(RequestDocument, id=doc_id, request=request_obj)
    
    # Check if user has permission to download this document
    if (not document.is_public and 
        not request.user.is_staff and 
        request.user != request_obj.user and 
        request.user != request_obj.assigned_to and
        request.user != document.uploaded_by):
        messages.error(request, "You don't have permission to download this document.")
        return redirect('blockchain:request_detail', pk=pk)
    
    # Check if file exists
    file_path = document.file.path
    if not os.path.exists(file_path):
        messages.error(request, "The requested file does not exist.")
        return redirect('blockchain:request_detail', pk=pk)
    
    # Get file content type
    content_type, encoding = mimetypes.guess_type(file_path)
    if content_type is None:
        content_type = 'application/octet-stream'
    
    # Create response with file
    response = FileResponse(open(file_path, 'rb'), content_type=content_type)
    response['Content-Disposition'] = f'attachment; filename="{document.filename()}"'
    
    return response


@login_required
@require_http_methods(["POST"])
def request_document(request, pk):
    """View for requesting additional documents from citizens."""
    request_obj = get_object_or_404(AdministrativeRequest, pk=pk)
    
    # Check if user has permission to request documents
    if not (request.user.is_staff or request.user == request_obj.assigned_to):
        messages.error(request, "You don't have permission to request additional documents.")
        return redirect('blockchain:request_detail', pk=pk)
    
    form = DocumentRequestForm(request.POST)
    if form.is_valid():
        with transaction.atomic():
            # Create document request
            doc_request = form.save(commit=False)
            doc_request.request = request_obj
            doc_request.requested_by = request.user
            doc_request.save()
            
            # If request is not already in ADDITIONAL_INFO status, update it
            if request_obj.status != 'ADDITIONAL_INFO':
                old_status = request_obj.status
                request_obj.status = 'ADDITIONAL_INFO'
                request_obj.save()
                
                # Create status update
                status_update = RequestStatusUpdate.objects.create(
                    request=request_obj,
                    old_status=old_status,
                    new_status='ADDITIONAL_INFO',
                    comments=f"Additional document requested: {doc_request.title}",
                    updated_by=request.user
                )
                
                # Submit to blockchain
                try:
                    result = blockchain.update_request_status(
                        request_obj.id,
                        'ADDITIONAL_INFO',
                        f"Additional document requested: {doc_request.title}"
                    )
                    
                    if result.get('success', False):
                        status_update.tx_hash = result['tx_hash']
                        status_update.save()
                except Exception as e:
                    messages.warning(
                        request, 
                        f"Status updated in database but failed to record on blockchain: {str(e)}"
                    )
            
            messages.success(request, f"Document request for '{doc_request.title}' has been sent to the citizen.")
        
        return redirect('blockchain:request_detail', pk=pk)
    else:
        # Store form errors in session to display them when redirected
        request.session['document_request_form_errors'] = form.errors.as_json()
        for field, errors in form.errors.items():
            for error in errors:
                messages.error(request, f"{field}: {error}")
        
        return redirect('blockchain:request_detail', pk=pk)


@login_required
def upload_multiple_documents(request, pk):
    """View for uploading multiple documents at once."""
    request_obj = get_object_or_404(AdministrativeRequest, pk=pk)
    
    # Check if user has permission to upload documents
    if not (request.user.is_staff or request.user == request_obj.user or request.user == request_obj.assigned_to):
        messages.error(request, "You don't have permission to upload documents to this request.")
        return redirect('blockchain:request_detail', pk=pk)
    
    if request.method == 'POST':
        form = MultipleDocumentUploadForm(request.POST, request.FILES)
        if form.is_valid():
            document_type = form.cleaned_data['document_type']
            is_public = form.cleaned_data['is_public']
            files = request.FILES.getlist('files')
            
            # Check if any files were uploaded
            if not files:
                messages.error(request, "No files were selected for upload.")
                return redirect('blockchain:upload_multiple_documents', pk=pk)
            
            # Upload each file
            for file in files:
                document = RequestDocument(
                    request=request_obj,
                    document_type=document_type,
                    file=file,
                    title=os.path.splitext(file.name)[0],  # Use filename as title
                    description=f"Uploaded on {timezone.now().strftime('%Y-%m-%d')}",
                    uploaded_by=request.user,
                    is_public=is_public
                )
                document.save()
            
            messages.success(request, f"{len(files)} document(s) uploaded successfully.")
            
            # If this is an additional info document and request status is ADDITIONAL_INFO
            if (request_obj.status == 'ADDITIONAL_INFO' and 
                document_type == 'ADDITIONAL_INFO' and 
                request.user == request_obj.user):
                
                # Check if all document requests are fulfilled
                pending_doc_requests = DocumentRequest.objects.filter(
                    request=request_obj, 
                    status='PENDING'
                ).count()
                
                if pending_doc_requests == 0:
                    # Update request status to IN_PROGRESS
                    old_status = request_obj.status
                    request_obj.status = 'IN_PROGRESS'
                    request_obj.save()
                    
                    # Create status update
                    status_update = RequestStatusUpdate.objects.create(
                        request=request_obj,
                        old_status=old_status,
                        new_status='IN_PROGRESS',
                        comments="All requested documents submitted by citizen",
                        updated_by=request.user
                    )
                    
                    # Submit to blockchain
                    try:
                        result = blockchain.update_request_status(
                            request_obj.id,
                            'IN_PROGRESS',
                            "All requested documents submitted by citizen"
                        )
                        
                        if result.get('success', False):
                            status_update.tx_hash = result['tx_hash']
                            status_update.save()
                            
                            messages.success(
                                request, 
                                "All requested documents have been uploaded. Request status updated to In Progress."
                            )
                    except Exception as e:
                        messages.warning(
                            request, 
                            f"Status updated in database but failed to record on blockchain: {str(e)}"
                        )
            
            return redirect('blockchain:request_detail', pk=pk)
        else:
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f"{field}: {error}")
    else:
        form = MultipleDocumentUploadForm()
    
    # Get any pending document requests
    document_requests = DocumentRequest.objects.filter(
        request=request_obj, 
        status='PENDING'
    ).order_by('due_date')
    
    context = {
        'form': form,
        'request_obj': request_obj,
        'document_requests': document_requests,
    }
    
    return render(request, 'blockchain/requests/upload_multiple_documents.html', context)


@login_required
@require_POST
def mark_doc_request_fulfilled(request, pk, doc_req_id):
    """Mark a document request as fulfilled."""
    request_obj = get_object_or_404(AdministrativeRequest, pk=pk)
    doc_request = get_object_or_404(DocumentRequest, id=doc_req_id, request=request_obj)
    
    # Check if user has permission
    if not (request.user.is_staff or request.user == request_obj.assigned_to):
        messages.error(request, "You don't have permission to update document request status.")
        return redirect('blockchain:request_detail', pk=pk)
    
    # Update document request status
    doc_request.status = 'FULFILLED'
    doc_request.save()
    
    messages.success(request, f"Document request '{doc_request.title}' marked as fulfilled.")
    return redirect('blockchain:request_detail', pk=pk)


@login_required
def official_dashboard(request):
    """View for commune officials to see their assigned procedures."""
    if not request.user.profile.role == 'OFFICIAL':
        messages.error(request, "Only commune officials can access this dashboard.")
        return redirect('blockchain:index')
    
    # Get assigned categories
    assigned_categories = RequestCategory.objects.filter(
        assigned_officials=request.user
    ).order_by('name')
    
    # Get category filter
    category_id = request.GET.get('category')
    current_category = None
    
    # Get all requests assigned to this official
    assigned_requests = AdministrativeRequest.objects.filter(
        assigned_to=request.user
    ).order_by('-created_at')
    
    # Apply category filter if specified
    if category_id:
        try:
            current_category = RequestCategory.objects.get(id=category_id)
            assigned_requests = assigned_requests.filter(category=current_category)
        except (RequestCategory.DoesNotExist, ValueError):
            messages.warning(request, "Invalid category selected.")
    
    # Get requests by status
    pending_requests = assigned_requests.filter(status='PENDING')
    in_progress_requests = assigned_requests.filter(status='IN_PROGRESS')
    additional_info_requests = assigned_requests.filter(status='ADDITIONAL_INFO')
    approved_requests = assigned_requests.filter(status='APPROVED')
    rejected_requests = assigned_requests.filter(status='REJECTED')
    completed_requests = assigned_requests.filter(status='COMPLETED')
    
    # Organize requests by category for each status
    categories_with_requests = {}
    
    # Get all requests categorized
    all_categories = RequestCategory.objects.all()
    
    # For pending requests
    for category in all_categories:
        category_requests = pending_requests.filter(category=category)
        if category_requests.exists():
            if 'PENDING' not in categories_with_requests:
                categories_with_requests['PENDING'] = []
            categories_with_requests['PENDING'].append({
                'category': category,
                'requests': category_requests
            })
    
    # For in-progress requests
    for category in all_categories:
        category_requests = in_progress_requests.filter(category=category)
        if category_requests.exists():
            if 'IN_PROGRESS' not in categories_with_requests:
                categories_with_requests['IN_PROGRESS'] = []
            categories_with_requests['IN_PROGRESS'].append({
                'category': category,
                'requests': category_requests
            })
            
    # For additional info requests
    for category in all_categories:
        category_requests = additional_info_requests.filter(category=category)
        if category_requests.exists():
            if 'ADDITIONAL_INFO' not in categories_with_requests:
                categories_with_requests['ADDITIONAL_INFO'] = []
            categories_with_requests['ADDITIONAL_INFO'].append({
                'category': category,
                'requests': category_requests
            })
    
    # Get recent document requests that need attention
    recent_document_requests = DocumentRequest.objects.filter(
        request__assigned_to=request.user,
        status='PENDING'
    ).order_by('-created_at')[:5]
    
    # Get recent status updates
    recent_status_updates = RequestStatusUpdate.objects.filter(
        request__assigned_to=request.user
    ).order_by('-created_at')[:5]
    
    # Get blockchain authority status
    blockchain_authority = False
    if request.user.profile.ethereum_address:
        try:
            blockchain_authority = blockchain.is_officer(request.user.profile.ethereum_address)
        except Exception as e:
            messages.warning(request, f"Failed to verify blockchain authority: {str(e)}")
    
    # Get task statistics
    task_stats = {
        'total': assigned_requests.count(),
        'pending': pending_requests.count(),
        'in_progress': in_progress_requests.count(),
        'additional_info': additional_info_requests.count(),
        'approved': approved_requests.count(),
        'rejected': rejected_requests.count(),
        'completed': completed_requests.count(),
        'pending_documents': recent_document_requests.count()
    }
    
    context = {
        'pending_requests': pending_requests,
        'in_progress_requests': in_progress_requests,
        'additional_info_requests': additional_info_requests,
        'approved_requests': approved_requests,
        'rejected_requests': rejected_requests,
        'completed_requests': completed_requests,
        'recent_document_requests': recent_document_requests,
        'recent_status_updates': recent_status_updates,
        'blockchain_authority': blockchain_authority,
        'task_stats': task_stats,
        'assigned_categories': assigned_categories,
        'current_category': current_category,
        'categories_with_requests': categories_with_requests,
    }
    
    return render(request, 'blockchain/official/official_dashboard.html', context)


@login_required
@require_POST
def fulfill_document_request(request, pk, doc_request_id):
    """View for fulfilling a document request."""
    request_obj = get_object_or_404(AdministrativeRequest, pk=pk)
    doc_request = get_object_or_404(DocumentRequest, id=doc_request_id, request=request_obj)
    
    # Check if user has permission to fulfill this document request
    if not (request.user.is_staff or request.user == request_obj.assigned_to):
        messages.error(request, "You don't have permission to fulfill this document request.")
        return redirect('blockchain:request_detail', pk=pk)
    
    # Update document request status
    doc_request.status = 'FULFILLED'
    doc_request.fulfilled_by = request.user
    doc_request.fulfilled_at = timezone.now()
    doc_request.save()
    
    messages.success(request, f"Document request '{doc_request.title}' has been marked as fulfilled.")
    return redirect('blockchain:request_detail', pk=pk)


@login_required
def register_official(request):
    """View for registering new commune officials."""
    if not request.user.is_staff:
        messages.error(request, "Only the commune chairman can register new officials.")
        return redirect('blockchain:index')
    
    if request.method == 'POST':
        form = OfficialRegistrationForm(request.POST)
        if form.is_valid():
            try:
                with transaction.atomic():
                    # Create user account
                    user = form.save(commit=False)
                    user.set_password(form.cleaned_data['password'])
                    user.save()
                    
                    # Create profile
                    profile = UserProfile.objects.create(
                        user=user,
                        role='OFFICIAL',
                        approval_status='APPROVED',
                        approved_by=request.user,
                        ethereum_address=form.cleaned_data['ethereum_address']
                    )
                    
                    # Add to blockchain officers list
                    try:
                        if profile.ethereum_address:
                            blockchain._mock_officers.add(profile.ethereum_address)
                            blockchain._save_mock_data()
                    except Exception as e:
                        messages.warning(request, f"Failed to register officer on blockchain: {str(e)}")
                    
                    messages.success(request, f"Official {user.get_full_name() or user.username} has been registered successfully.")
                    return redirect('blockchain:admin_dashboard')
            except Exception as e:
                messages.error(request, f"An error occurred while registering the official: {str(e)}")
    else:
        form = OfficialRegistrationForm()
    
    return render(request, 'blockchain/admin/register_official.html', {'form': form})


@login_required
def delegate_authority(request):
    """View for delegating authority to officials."""
    if not request.user.is_staff:
        messages.error(request, "Only the commune chairman can delegate authority.")
        return redirect('blockchain:index')
    
    # Get all approved officials with their current authority levels
    officials = User.objects.filter(
        profile__role='OFFICIAL',
        profile__approval_status='APPROVED'
    ).select_related('profile').order_by('username')
    
    if request.method == 'POST':
        form = AuthorityDelegationForm(request.POST)
        if form.is_valid():
            try:
                with transaction.atomic():
                    official = form.cleaned_data['official']
                    authority_level = form.cleaned_data['authority_level']
                    
                    # Check if official has an Ethereum address
                    if not official.profile.ethereum_address:
                        messages.error(request, f"Cannot delegate authority to {official.username}. Official must provide an Ethereum address first.")
                        return redirect('blockchain:delegate_authority')
                    
                    # Try to delegate authority in blockchain first
                    result = blockchain.delegate_authority(
                        official.profile.ethereum_address,
                        authority_level
                    )
                    
                    if not result.get('success'):
                        messages.error(request, f"Failed to delegate authority: {result.get('error', 'Unknown error')}")
                        return redirect('blockchain:delegate_authority')
                    
                    # If blockchain update successful, update database
                    profile = official.profile
                    profile.authority_level = authority_level
                    profile.delegated_by = request.user
                    profile.delegation_date = timezone.now()
                    profile.save()
                    
                    messages.success(
                        request,
                        f"Authority level {authority_level} has been delegated to {official.get_full_name() or official.username}."
                    )
                    return redirect('blockchain:admin_dashboard')
            except Exception as e:
                messages.error(request, f"An error occurred while delegating authority: {str(e)}")
    else:
        form = AuthorityDelegationForm()
    
    context = {
        'form': form,
        'officials': officials,
    }
    return render(request, 'blockchain/admin/delegate_authority.html', context)


@login_required
def category_management(request):
    """View for managing request categories and assigning officials."""
    if not request.user.is_staff:
        messages.error(request, "Only the commune chairman can manage categories.")
        return redirect('blockchain:index')
    
    # Get all categories
    categories = RequestCategory.objects.all().prefetch_related('assigned_officials')
    
    # Process category assignment form
    if request.method == 'POST':
        assignment_form = CategoryAssignmentForm(request.POST)
        if assignment_form.is_valid():
            category = assignment_form.cleaned_data['category']
            officials = assignment_form.cleaned_data['officials']
            
            # Update the category's assigned officials
            category.assigned_officials.set(officials)
            
            messages.success(
                request, 
                f"Successfully assigned {len(officials)} official(s) to the {category.name} category."
            )
            return redirect('blockchain:category_management')
    else:
        assignment_form = CategoryAssignmentForm()
    
    # Define CategoryForm only once
    from django import forms
    
    class CategoryForm(forms.ModelForm):
        class Meta:
            model = RequestCategory
            fields = ['name', 'code', 'description']
    
    # Create a form for a new category
    if request.method == 'POST' and 'create_category' in request.POST:
        category_form = CategoryForm(request.POST)
        if category_form.is_valid():
            category_form.save()
            messages.success(request, "New category created successfully.")
            return redirect('blockchain:category_management')
    else:
        category_form = CategoryForm()
    
    # Count officials assigned to each category
    category_stats = []
    for category in categories:
        assigned_count = category.assigned_officials.count()
        request_count = category.requests.count()
        pending_count = category.requests.filter(status='PENDING').count()
        category_stats.append({
            'category': category,
            'assigned_count': assigned_count,
            'request_count': request_count,
            'pending_count': pending_count
        })
    
    return render(request, 'blockchain/admin/category_management.html', {
        'categories': categories,
        'assignment_form': assignment_form,
        'category_form': category_form,
        'category_stats': category_stats
    })


@login_required
def manage_categories(request):
    """View for managing request categories."""
    if not request.user.is_staff:
        messages.error(request, "You don't have permission to access category management.")
        return redirect('blockchain:index')
    
    categories = RequestCategory.objects.all().order_by('name')
    
    # Get all officials (commune officials with approved status)
    officials = User.objects.filter(
        profile__role='OFFICIAL',
        profile__approval_status='APPROVED'
    ).prefetch_related('assigned_categories').order_by('username')
    
    if request.method == 'POST':
        # Handle category form submission
        if 'delete_category' in request.POST:
            # Delete category
            category_id = request.POST.get('delete_category')
            try:
                category = RequestCategory.objects.get(id=category_id)
                category_name = category.name
                
                # Check if category is in use
                if category.requests.exists():
                    messages.error(
                        request, 
                        f"Cannot delete '{category_name}' because it is assigned to {category.requests.count()} requests."
                    )
                else:
                    category.delete()
                    messages.success(request, f"Category '{category_name}' deleted successfully.")
            except RequestCategory.DoesNotExist:
                messages.error(request, "Category not found.")
        
        elif 'add_category' in request.POST:
            # Add new category
            name = request.POST.get('name', '').strip()
            code = request.POST.get('code', '').strip().upper()
            description = request.POST.get('description', '').strip()
            
            if not name or not code:
                messages.error(request, "Name and code are required.")
            else:
                # Check if category with same name or code already exists
                if RequestCategory.objects.filter(name=name).exists():
                    messages.error(request, f"Category with name '{name}' already exists.")
                elif RequestCategory.objects.filter(code=code).exists():
                    messages.error(request, f"Category with code '{code}' already exists.")
                else:
                    # Create new category
                    RequestCategory.objects.create(
                        name=name,
                        code=code,
                        description=description
                    )
                    messages.success(request, f"Category '{name}' added successfully.")
        
        elif 'edit_category' in request.POST:
            # Edit existing category
            category_id = request.POST.get('category_id')
            name = request.POST.get('name', '').strip()
            code = request.POST.get('code', '').strip().upper()
            description = request.POST.get('description', '').strip()
            
            try:
                category = RequestCategory.objects.get(id=category_id)
                
                if not name or not code:
                    messages.error(request, "Name and code are required.")
                else:
                    # Check if updated name/code would conflict with existing categories
                    name_conflict = RequestCategory.objects.filter(name=name).exclude(id=category_id).exists()
                    code_conflict = RequestCategory.objects.filter(code=code).exclude(id=category_id).exists()
                    
                    if name_conflict:
                        messages.error(request, f"Category with name '{name}' already exists.")
                    elif code_conflict:
                        messages.error(request, f"Category with code '{code}' already exists.")
                    else:
                        # Update category
                        category.name = name
                        category.code = code
                        category.description = description
                        category.save()
                        messages.success(request, f"Category '{name}' updated successfully.")
            except RequestCategory.DoesNotExist:
                messages.error(request, "Category not found.")
        
        elif 'assign_officials' in request.POST:
            # Handle officials assignment to category
            category_id = request.POST.get('category_id')
            selected_officials = request.POST.getlist('selected_officials[]')
            
            try:
                # Get the category
                category = RequestCategory.objects.get(id=category_id)
                
                # Clear current assignments and add new ones
                category.assigned_officials.clear()
                
                if selected_officials:
                    officials_to_add = User.objects.filter(id__in=selected_officials)
                    category.assigned_officials.add(*officials_to_add)
                    messages.success(
                        request, 
                        f"{len(officials_to_add)} officials assigned to '{category.name}' topic."
                    )
                else:
                    messages.success(
                        request, 
                        f"All officials unassigned from '{category.name}' topic."
                    )
                    
            except RequestCategory.DoesNotExist:
                messages.error(request, "Category not found.")
                
        return redirect('blockchain:manage_categories')
    
    # Prepare data about which officials are assigned to which categories
    category_officials = {}
    for category in categories:
        category_officials[category.id] = list(category.assigned_officials.values_list('id', flat=True))
    
    return render(request, 'blockchain/admin/manage_categories.html', {
        'categories': categories,
        'officials': officials,
        'category_officials_json': json.dumps(category_officials)
    })


@login_required
def procedures_overview(request):
    """View for displaying all administrative procedures, categorized and with required documents."""
    
    # Get all categories
    categories = RequestCategory.objects.all().order_by('name')
    
    # Create a structure to organize procedures by category
    procedures_by_category = {}
    
    # Define procedure details (this could be moved to a database model in the future)
    procedures = {
        'birth_certificate': {
            'name': 'Birth Certificate Request',
            'category': 'Civil Registration',
            'description': 'Request for issuance of birth certificate for a newborn or replacement of existing certificate.',
            'required_documents': [
                'Hospital birth certificate',
                'Parent ID documents',
                'Marriage certificate of parents (if applicable)'
            ],
            'processing_time': '3-5 business days',
            'form_url': '/docs/civil_registration/birth_certificate_form.html'
        },
        'marriage_certificate': {
            'name': 'Marriage Certificate Request',
            'category': 'Civil Registration',
            'description': 'Request for issuance of marriage certificate or replacement of existing certificate.',
            'required_documents': [
                'ID documents of both spouses',
                'Marriage ceremony evidence',
                'Witness statements'
            ],
            'processing_time': '3-5 business days',
            'form_url': '/docs/civil_registration/marriage_certificate_form.html'
        },
        'business_permit': {
            'name': 'Business Permit Application',
            'category': 'Business Licenses',
            'description': 'Application for a new business permit for commercial operations.',
            'required_documents': [
                'Business registration',
                'Tax identification',
                'Location permit',
                'Fire safety certificate'
            ],
            'processing_time': '7-10 business days',
            'form_url': '/docs/business_licenses/business_permit_form.html'
        },
        'license_renewal': {
            'name': 'License Renewal Application',
            'category': 'Business Licenses',
            'description': 'Application to renew an existing business license or permit.',
            'required_documents': [
                'Existing license document',
                'Tax clearance certificate',
                'Updated business information'
            ],
            'processing_time': '5-7 business days',
            'form_url': '/docs/business_licenses/license_renewal_form.html'
        },
        'land_title': {
            'name': 'Land Title Application',
            'category': 'Land and Property',
            'description': 'Application for land title registration or transfer.',
            'required_documents': [
                'Proof of ownership',
                'Land survey document',
                'Tax declaration',
                'ID documents'
            ],
            'processing_time': '14-30 business days',
            'form_url': '/docs/land_and_property/land_title_form.html'
        },
        'property_transfer': {
            'name': 'Property Transfer Request',
            'category': 'Land and Property',
            'description': 'Request to transfer property ownership from one entity to another.',
            'required_documents': [
                'Deed of sale',
                'Tax clearance',
                'ID documents of both parties',
                'Existing title'
            ],
            'processing_time': '14-21 business days',
            'form_url': '/docs/land_and_property/property_transfer_form.html'
        },
        'residence_certificate': {
            'name': 'Residence Certificate Request',
            'category': 'Identity Documents',
            'description': 'Request for certification of residency in the commune.',
            'required_documents': [
                'Proof of address',
                'ID document',
                'Photo'
            ],
            'processing_time': '1-3 business days',
            'form_url': '/docs/identity_documents/residence_certificate_form.html'
        },
        'tax_clearance': {
            'name': 'Tax Clearance Certificate',
            'category': 'Tax and Fees',
            'description': 'Request for certification that all taxes have been paid.',
            'required_documents': [
                'Tax payment receipts',
                'ID document',
                'Property information (if applicable)'
            ],
            'processing_time': '3-5 business days',
            'form_url': '/docs/tax_and_fees/tax_clearance_form.html'
        },
        'general_application': {
            'name': 'General Application Form',
            'category': 'Other Services',
            'description': 'General purpose application for services not covered by specific forms.',
            'required_documents': [
                'ID document',
                'Supporting documents as applicable to request'
            ],
            'processing_time': 'Varies based on request type',
            'form_url': '/docs/other_services/general_application_form.html'
        }
    }
    
    # Organize procedures by category
    for proc_id, procedure in procedures.items():
        category_name = procedure['category']
        if category_name not in procedures_by_category:
            procedures_by_category[category_name] = []
        
        procedures_by_category[category_name].append({
            'id': proc_id,
            'name': procedure['name'],
            'description': procedure['description'],
            'required_documents': procedure['required_documents'],
            'processing_time': procedure['processing_time'],
            'form_url': procedure['form_url']
        })
    
    # Get request counts by type
    request_counts = {}
    for proc_id in procedures.keys():
        count = AdministrativeRequest.objects.filter(request_type=proc_id).count()
        request_counts[proc_id] = count
    
    context = {
        'categories': categories,
        'procedures_by_category': procedures_by_category,
        'request_counts': request_counts,
        'total_procedures': len(procedures),
    }
    
    return render(request, 'blockchain/public/procedures_overview.html', context)


def embed_document(request, path):
    """View for embedding document content directly in HTML."""
    import os
    from django.conf import settings
    from django.http import HttpResponse, Http404
    
    # Construct the full path to the document
    full_path = os.path.join(settings.DOCS_ROOT, path)
    
    # Check if the file exists
    if not os.path.exists(full_path) or not os.path.isfile(full_path):
        raise Http404(f"Document '{path}' does not exist")
    
    # Read the file content
    try:
        with open(full_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Return the content as HTML
        return HttpResponse(content, content_type='text/html')
    except Exception as e:
        return HttpResponse(f"Error loading document: {str(e)}", status=500)


# Add new API methods for handling requests
@login_required
def api_request_types(request):
    """API endpoint to fetch request types for a category."""
    category_id = request.GET.get('category')
    
    if not category_id:
        return JsonResponse({'error': 'Category ID is required'}, status=400)
    
    try:
        category = RequestCategory.objects.get(id=category_id)
        
        # Define document paths based on category code
        document_paths = {
            'CIVIL_REG': {
                'birth_certificate': 'civil_registration/birth_certificate_form.html',
                'marriage_certificate': 'civil_registration/marriage_certificate_form.html',
                'death_certificate': 'civil_registration/death_certificate_form.html',
            },
            'ID_DOCS': {
                'national_id': 'identity_documents/national_id_form.html',
                'residence_certificate': 'identity_documents/residence_certificate_form.html',
                'passport': 'identity_documents/passport_form.html',
            },
            'BUS_LIC': {
                'business_permit': 'business_licenses/business_permit_form.html',
                'business_registration': 'business_licenses/business_registration_form.html',
                'tax_registration': 'business_licenses/tax_registration_form.html',
            },
            'LAND_PROP': {
                'land_title': 'land_and_property/land_title_form.html',
                'property_tax': 'land_and_property/property_tax_form.html',
                'land_survey': 'land_and_property/land_survey_form.html',
            },
            'OTHER': {
                'general_application': 'other_services/general_application_form.html',
            }
        }
        
        # Define request types based on category
        request_types = []
        
        if category.code == 'CIVIL_REG':
            request_types = [
                {
                    'id': 'BIRTH_CERT',
                    'name': 'Birth Certificate',
                    'description': 'Request a birth certificate for newborns or replacement copies',
                    'document_path': document_paths['CIVIL_REG']['birth_certificate']
                },
                {
                    'id': 'MARRIAGE_CERT',
                    'name': 'Marriage Certificate',
                    'description': 'Request a new marriage certificate or a copy',
                    'document_path': document_paths['CIVIL_REG']['marriage_certificate']
                },
                {
                    'id': 'DEATH_CERT',
                    'name': 'Death Certificate',
                    'description': 'Request a death certificate',
                    'document_path': document_paths['CIVIL_REG']['death_certificate']
                }
            ]
        elif category.code == 'ID_DOCS':
            request_types = [
                {
                    'id': 'RESIDENCE_CERT',
                    'name': 'Residence Certificate',
                    'description': 'Obtain official proof of residence',
                    'document_path': document_paths['ID_DOCS']['residence_certificate']
                },
                {
                    'id': 'NATIONAL_ID',
                    'name': 'National ID Card',
                    'description': 'Apply for a new national ID card or renewal',
                    'document_path': document_paths['ID_DOCS']['national_id']
                },
                {
                    'id': 'PASSPORT',
                    'name': 'Passport',
                    'description': 'Apply for a new passport or renewal',
                    'document_path': document_paths['ID_DOCS']['passport']
                }
            ]
        elif category.code == 'BUS_LIC':
            request_types = [
                {
                    'id': 'BUS_PERMIT',
                    'name': 'Business Permit',
                    'description': 'Apply for a new business permit or renewal',
                    'document_path': document_paths['BUS_LIC']['business_permit']
                },
                {
                    'id': 'BUS_REG',
                    'name': 'Business Registration',
                    'description': 'Register a new business entity',
                    'document_path': document_paths['BUS_LIC']['business_registration']
                },
                {
                    'id': 'TAX_REG',
                    'name': 'Tax Registration',
                    'description': 'Register for business tax purposes',
                    'document_path': document_paths['BUS_LIC']['tax_registration']
                }
            ]
        elif category.code == 'LAND_PROP':
            request_types = [
                {
                    'id': 'LAND_TITLE',
                    'name': 'Land Title',
                    'description': 'Request a land title or property documentation',
                    'document_path': document_paths['LAND_PROP']['land_title']
                },
                {
                    'id': 'PROPERTY_TAX',
                    'name': 'Property Tax Certificate',
                    'description': 'Request a property tax clearance certificate',
                    'document_path': document_paths['LAND_PROP']['property_tax']
                },
                {
                    'id': 'LAND_SURVEY',
                    'name': 'Land Survey',
                    'description': 'Request a land survey certificate',
                    'document_path': document_paths['LAND_PROP']['land_survey']
                }
            ]
        elif category.code == 'OTHER':
            request_types = [
                {
                    'id': 'OTHER',
                    'name': 'Other Services',
                    'description': 'Request other administrative services',
                    'document_path': document_paths['OTHER']['general_application']
                }
            ]
        
        return JsonResponse(request_types, safe=False)
    
    except RequestCategory.DoesNotExist:
        return JsonResponse({'error': 'Category not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@api_view(['POST'])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def api_submit_request(request):
    """API endpoint for submitting a new administrative request."""
    logger.debug(f"API Submit Request: {request.data}")
    
    # Validate required fields
    required_fields = ['request_type', 'category', 'description']
    for field in required_fields:
        if field not in request.POST:
            return Response({
                'status': 'error',
                'message': f'Missing required field: {field}'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    # Collect ALL form data for storage
    form_data = {}
    
    # Add metadata for debugging and tracking
    form_data['_meta'] = {
        'submit_time': timezone.now().isoformat(),
        'user_agent': request.META.get('HTTP_USER_AGENT', 'Unknown'),
        'ip_address': get_client_ip(request),
        'user_id': request.user.id,
        'username': request.user.username
    }
    
    # Store regular form fields
    for key, value in request.POST.items():
        # Skip Django's CSRF token
        if key != 'csrfmiddlewaretoken':
            form_data[key] = value
    
    # Store file information if present
    if request.FILES:
        form_data['_files'] = {}
        for file_key, file_obj in request.FILES.items():
            form_data['_files'][file_key] = {
                'name': file_obj.name,
                'size': file_obj.size,
                'content_type': file_obj.content_type
            }
    
    try:
        # Get category object
        category_id = request.POST.get('category')
        category = None
        if category_id:
            try:
                category = RequestCategory.objects.get(id=category_id)
            except RequestCategory.DoesNotExist:
                return Response({
                    'status': 'error',
                    'message': f'Category with ID {category_id} does not exist'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create new request object
        new_request = AdministrativeRequest(
            user=request.user,
            request_type=request.POST.get('request_type'),
            category=category,
            description=request.POST.get('description'),
            status='PENDING',
            form_data=form_data,
            # Set default values for required fields
            full_name=request.user.get_full_name() or request.user.username,
            phone_number=request.POST.get('phone_number', '000-000-0000'),
            address=request.POST.get('address', 'Default Address'),
            payment_amount=request.POST.get('payment_amount', 0.01)  # Default minimal payment amount
        )
        new_request.save()
        
        # Handle file uploads
        if request.FILES:
            for file_key, file_obj in request.FILES.items():
                # Save file with appropriate document type
                document_type = 'SUBMISSION'  # Default type
                
                # Get custom document type if specified in form
                if f"{file_key}_type" in request.POST:
                    custom_type = request.POST.get(f"{file_key}_type")
                    if custom_type in [choice[0] for choice in RequestDocument.DOCUMENT_TYPE_CHOICES]:
                        document_type = custom_type
                
                # Create document record
                document = RequestDocument(
                    request=new_request,
                    document_type=document_type,
                    file=file_obj,
                    title=f"{file_key} - {file_obj.name}",
                    description=request.POST.get(f"{file_key}_description", "Uploaded during submission"),
                    uploaded_by=request.user,
                    is_public=True
                )
                document.save()
        
        # Create blockchain record if integrated
        try:
            result = blockchain.create_request(
                new_request.user_hash,
                new_request.request_type,
                new_request.description,
                float(new_request.payment_amount) if hasattr(new_request, 'payment_amount') and new_request.payment_amount else 0.0
            )
            
            if result and 'tx_hash' in result:
                new_request.tx_hash = result['tx_hash']
                new_request.save()
        except Exception as e:
            logger.error(f"Blockchain creation failed but request was saved: {str(e)}")
            # Continue without blockchain record - will be created later

        return Response({
            'status': 'success',
            'request_id': new_request.id,
            'message': 'Request submitted successfully'
        })
    
    except Exception as e:
        # Log the error for debugging
        logger.error(f"Error in api_submit_request: {str(e)}")
        logger.error(traceback.format_exc())
        
        return Response({
            'error': f'An unexpected error occurred: {str(e)}',
            'status': 'error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@login_required
def view_document(request, pk):
    """View for displaying document details."""
    document = get_object_or_404(RequestDocument, pk=pk)
    request_obj = document.request
    
    # Check if user has permission to view this document
    if not (request.user.is_staff or request.user == request_obj.user or 
            request.user == request_obj.assigned_to or 
            document.is_public):
        messages.error(request, "You don't have permission to view this document.")
        return redirect('blockchain:request_detail', pk=request_obj.pk)
    
    return render(request, 'blockchain/requests/view_document.html', {
        'document': document,
        'request_obj': request_obj
    })


@login_required
def upload_requested_document(request, pk):
    """View for uploading documents in response to a document request."""
    doc_request = get_object_or_404(DocumentRequest, pk=pk)
    request_obj = doc_request.request
    
    # Check if user has permission to upload documents for this request
    if request.user != request_obj.user:
        messages.error(request, "You don't have permission to upload documents for this request.")
        return redirect('blockchain:request_detail', pk=request_obj.pk)
    
    if request.method == 'POST':
        form = DocumentUploadForm(request.POST, request.FILES)
        if form.is_valid():
            with transaction.atomic():
                # Create document
                document = form.save(commit=False)
                document.request = request_obj
                document.uploaded_by = request.user
                document.is_public = True
                document.save()
                
                # Mark document request as fulfilled
                doc_request.status = 'FULFILLED'
                doc_request.fulfilled_date = timezone.now()
                doc_request.document = document
                doc_request.save()
                
                messages.success(request, "Document successfully uploaded and request marked as fulfilled.")
                
                # Check if all document requests are fulfilled
                pending_doc_requests = DocumentRequest.objects.filter(
                    request=request_obj, 
                    status='PENDING'
                ).count()
                
                if pending_doc_requests == 0:
                    # Update request status to IN_PROGRESS
                    old_status = request_obj.status
                    request_obj.status = 'IN_PROGRESS'
                    request_obj.save()
                    
                    # Create status update
                    status_update = RequestStatusUpdate.objects.create(
                        request=request_obj,
                        old_status=old_status,
                        new_status='IN_PROGRESS',
                        comments="All requested documents submitted by citizen",
                        updated_by=request.user
                    )
                    
                    # Submit to blockchain
                    try:
                        result = blockchain.update_request_status(
                            request_obj.id,
                            'IN_PROGRESS',
                            "All requested documents submitted by citizen"
                        )
                        
                        if result.get('success', False):
                            status_update.tx_hash = result['tx_hash']
                            status_update.save()
                            
                            messages.success(
                                request, 
                                "All requested documents have been uploaded. Request status updated to In Progress."
                            )
                    except Exception as e:
                        messages.warning(
                            request, 
                            f"Status updated in database but failed to record on blockchain: {str(e)}"
                        )
                
                return redirect('blockchain:request_detail', pk=request_obj.pk)
        else:
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f"{field}: {error}")
    else:
        initial_data = {
            'document_type': 'ADDITIONAL_INFO',
            'title': doc_request.title,
            'description': f"In response to document request: {doc_request.title}"
        }
        form = DocumentUploadForm(initial=initial_data)
    
    return render(request, 'blockchain/requests/upload_requested_document.html', {
        'form': form,
        'doc_request': doc_request,
        'request_obj': request_obj
    })


def request_list(request):
    # Get all requests
    requests = AdministrativeRequest.objects.all().order_by('-created_at')
    
    # Filter by status if provided
    status_filter = request.GET.get('status', None)
    if status_filter and status_filter != 'ALL':
        requests = requests.filter(status=status_filter)
        
    # Search functionality
    search_query = request.GET.get('search', '')
    if search_query:
        requests = requests.filter(
            Q(id__icontains=search_query) |
            Q(description__icontains=search_query) |
            Q(full_name__icontains=search_query)
        )
    
    # Check user permissions to determine what information to show
    is_authenticated = request.user.is_authenticated
    is_president = is_authenticated and hasattr(request.user, 'profile') and request.user.profile.is_chairman()
    
    # If user is an official, get the categories they're assigned to
    authorized_category_ids = []
    if is_authenticated and not is_president and hasattr(request.user, 'profile') and request.user.profile.is_official():
        authorized_category_ids = list(request.user.assigned_categories.values_list('id', flat=True))
    
    # Create a dictionary for visibility permissions
    request_permissions = {}
    for req in requests:
        # Determine if the current user can see full details for this request
        is_requestor = is_authenticated and request.user.id == req.user.id
        has_category_access = is_president or (req.category and req.category.id in authorized_category_ids)
        request_permissions[req.id] = {
            'can_see_full_details': is_requestor or has_category_access
        }
    
    # Pagination
    paginator = Paginator(requests, 10)  # Show 10 requests per page
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'page_obj': page_obj,
        'status_filter': status_filter or 'ALL',
        'search_query': search_query,
        'status_choices': AdministrativeRequest.STATUS_CHOICES,
        'is_authenticated': is_authenticated,
        'is_president': is_president,
        'request_permissions': request_permissions,
    }
    
    return render(request, 'blockchain/requests/request_list.html', context)


@login_required
def view_submitted_form(request, pk):
    """
    View for displaying the complete submitted form with all form fields.
    Only accessible to the form creator, commune president, and authorized officials.
    """
    # Get the request object or return 404
    admin_request = get_object_or_404(AdministrativeRequest, pk=pk)
    
    # Check permissions
    is_requestor = (request.user == admin_request.user)
    is_president = hasattr(request.user, 'profile') and request.user.profile.is_chairman()
    is_authorized_official = False
    
    # Check if user is an authorized official for this category
    if admin_request.category and hasattr(request.user, 'profile') and request.user.profile.is_official():
        is_authorized_official = admin_request.category.assigned_officials.filter(id=request.user.id).exists()
    
    # Only allow access to form creator, commune president, and authorized officials
    has_access = is_requestor or is_president or is_authorized_official
    
    if not has_access:
        messages.error(request, "You don't have permission to view this form.")
        return redirect('blockchain:request_detail', pk=pk)
    
    # Get the files associated with this request
    files = AdministrativeRequestFile.objects.filter(request=admin_request)
    
    # Get document requests
    document_requests = DocumentRequest.objects.filter(request=admin_request).order_by('-created_at')
    
    # Get approval status
    is_approved = admin_request.status == 'APPROVED' or admin_request.status == 'COMPLETED'
    
    # Get status updates
    status_updates = RequestStatusUpdate.objects.filter(request=admin_request).order_by('-created_at')
    
    context = {
        'request': admin_request,
        'files': files,
        'document_requests': document_requests,
        'is_requestor': is_requestor,
        'is_president': is_president,
        'is_authorized_official': is_authorized_official,
        'is_approved': is_approved,
        'status_updates': status_updates,
    }
    
    return render(request, 'blockchain/requests/view_submitted_form.html', context) 