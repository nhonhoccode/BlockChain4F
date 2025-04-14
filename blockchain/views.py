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

from .models import AdministrativeRequest, RequestStatusUpdate, RequestDocument, DocumentRequest, RequestCategory
from .forms import (
    AdministrativeRequestForm, RequestStatusUpdateForm, RequestTrackingForm, 
    RequestAssignmentForm, DocumentUploadForm, DocumentRequestForm, MultipleDocumentUploadForm, 
    OfficialRegistrationForm, AuthorityDelegationForm, CategoryAssignmentForm
)
from . import blockchain
from django.contrib.auth.models import User
from accounts.models import UserProfile


def index(request):
    """Homepage view."""
    tracking_form = RequestTrackingForm()
    return render(request, 'blockchain/index.html', {
        'tracking_form': tracking_form
    })


@login_required
def request_form(request):
    """View for submitting new administrative requests."""
    if request.method == 'POST':
        form = AdministrativeRequestForm(request.POST)
        if form.is_valid():
            try:
                with transaction.atomic():
                    # Create request in database
                    request_obj = form.save(commit=False)
                    request_obj.user = request.user
                    
                    # Automatically assign category based on request type
                    if not form.cleaned_data.get('category'):
                        request_type = form.cleaned_data.get('request_type')
                        # Map request types to categories (topics)
                        category_mapping = {
                            'BIRTH_CERT': 'CIVIL_REG',      # Birth Certificate → Civil Registration
                            'MARRIAGE_CERT': 'CIVIL_REG',   # Marriage Certificate → Civil Registration
                            'RESIDENCE_CERT': 'ID_DOCS',    # Residence Certificate → Identity Documents
                            'BUS_PERMIT': 'BUS_LIC',        # Business Permit → Business Licenses
                            'LAND_TITLE': 'LAND_PROP',      # Land Title → Land and Property
                            'OTHER': 'OTHER',               # Other → Other Services
                        }
                        
                        # Get the category code for this request type
                        category_code = category_mapping.get(request_type)
                        if category_code:
                            try:
                                # Find the category by code and assign it
                                category = RequestCategory.objects.get(code=category_code)
                                request_obj.category = category
                            except RequestCategory.DoesNotExist:
                                pass  # If category doesn't exist, continue without assigning
                    else:
                        # If category was manually selected, use it
                        request_obj.category = form.cleaned_data.get('category')
                    
                    # Save the form data in the JSON field
                    if 'form_data' in form.cleaned_data:
                        request_obj.form_data = form.cleaned_data['form_data']
                    
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
                        return redirect('blockchain:request_detail', pk=request_obj.pk)
                    else:
                        # If blockchain submission fails, delete the database record
                        request_obj.delete()
                        messages.error(request, f'Failed to submit request to blockchain: {result.get("error", "Unknown error")}')
            except Exception as e:
                messages.error(request, f'An error occurred: {str(e)}')
    else:
        form = AdministrativeRequestForm()
    
    # Load category templates for the frontend
    categories = RequestCategory.objects.all()
    category_templates = {}
    
    for category in categories:
        if category.form_template:
            category_templates[category.id] = category.form_template
    
    return render(request, 'blockchain/request_form.html', {
        'form': form,
        'category_templates': json.dumps(category_templates)
    })


@login_required
def request_detail(request, pk):
    """View for displaying request details."""
    request_obj = get_object_or_404(AdministrativeRequest, pk=pk)
    
    # Check if user has permission to view this request
    if not (request.user.is_staff or request.user == request_obj.user or request.user == request_obj.assigned_to):
        messages.error(request, "You don't have permission to view this request.")
        return redirect('blockchain:index')
    
    # Get status updates
    status_updates = request_obj.status_updates.all()
    
    # Default values
    status_form = None
    officers = None
    blockchain_data = None
    can_update_status = False
    can_assign = False
    can_request_documents = False
    documents = request_obj.documents.filter(is_public=True)
    document_requests = request_obj.document_requests.all()
    document_request_form = DocumentRequestForm()
    
    # Check if user can update status (staff or assigned officer)
    if request.user.is_staff:
        can_update_status = True
        # Staff can see all documents
        documents = request_obj.documents.all()
    elif request_obj.assigned_to == request.user and request_obj.status != 'COMPLETED':
        # Check blockchain authority for officers
        try:
            officer_address = request.user.profile.ethereum_address
            if officer_address and blockchain.is_officer(officer_address):
                can_update_status = True
                # Assigned officers can see all documents
                documents = request_obj.documents.all()
        except Exception as e:
            messages.warning(request, f"Failed to verify officer authority: {str(e)}")
    
    # Check if user can assign request (staff only)
    can_assign = (
        request.user.is_staff and 
        request_obj.status == 'PENDING' and 
        not request_obj.assigned_to
    )
    
    # Get available officers for assignment
    if can_assign:
        # If request has a category, get the officials assigned to that category
        if request_obj.category and request_obj.category.assigned_officials.exists():
            # Create assignment form with category-specific officials
            assignment_form = RequestAssignmentForm(
                category=request_obj.category,
                initial={'estimated_completion_date': request_obj.estimated_completion_date}
            )
        else:
            # Get all available officers
            officers = User.objects.filter(
                profile__role='OFFICIAL',
                profile__approval_status='APPROVED',
                profile__ethereum_address__isnull=False  # Only show officers with blockchain addresses
            ).exclude(id=request_obj.assigned_to_id if request_obj.assigned_to else None)
            
            # Create assignment form with all available officers
            assignment_form = RequestAssignmentForm(
                officers=officers,
                initial={'estimated_completion_date': request_obj.estimated_completion_date}
            )
    else:
        assignment_form = None
    
    # Check if user can request documents (staff or assigned officer)
    can_request_documents = (
        (request.user.is_staff or request.user == request_obj.assigned_to) and
        request_obj.status not in ['COMPLETED', 'REJECTED']
    )
    
    # Prepare status form if user can update status
    if can_update_status:
        status_form = RequestStatusUpdateForm(instance=RequestStatusUpdate(request=request_obj))
    
    # Get blockchain data if available
    blockchain_data = None
    if request_obj.tx_hash:
        try:
            blockchain_data = blockchain.get_request_details(request_obj.id)
        except Exception as e:
            messages.warning(request, f"Failed to fetch blockchain data: {str(e)}")
    
    context = {
        'request': request_obj,
        'status_updates': status_updates,
        'status_form': status_form,
        'assignment_form': assignment_form,
        'blockchain_data': blockchain_data,
        'can_update_status': can_update_status,
        'can_assign': can_assign,
        'documents': documents,
        'document_requests': document_requests,
        'document_request_form': document_request_form,
        'upload_form': DocumentUploadForm(),
        'can_upload_documents': True,  # All users involved can upload documents
        'can_request_documents': can_request_documents,
    }
    
    return render(request, 'blockchain/request_detail.html', context)


@login_required
@require_http_methods(["POST"])
def update_request_status(request, pk):
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
                    return render(request, 'blockchain/track_request.html', {
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
    
    return render(request, 'blockchain/track_request.html', {
        'form': form,
        'blockchain_data': blockchain_data
    })


@login_required
def my_requests(request):
    """View for displaying the user's requests."""
    requests = AdministrativeRequest.objects.filter(user=request.user).order_by('-created_at')
    return render(request, 'blockchain/my_requests.html', {'requests': requests})


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
    
    # Base queryset
    requests_queryset = AdministrativeRequest.objects.all()
    
    # Apply category filter if specified
    if category_id:
        try:
            current_category = RequestCategory.objects.get(id=category_id)
            requests_queryset = requests_queryset.filter(category=current_category)
        except (RequestCategory.DoesNotExist, ValueError):
            messages.warning(request, "Invalid category selected.")
    
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
    
    # Get topic-specific form information
    topic_forms = {
        'civil_registration': [
            {'name': 'Birth Certificate Request', 'url': '/docs/civil_registration/birth_certificate_form.html'},
            {'name': 'Marriage Certificate Request', 'url': '/docs/civil_registration/marriage_certificate_form.html'},
        ],
        'business_licenses': [
            {'name': 'Business Permit Application', 'url': '/docs/business_licenses/business_permit_form.html'},
            {'name': 'License Renewal Application', 'url': '/docs/business_licenses/license_renewal_form.html'},
        ],
        'land_and_property': [
            {'name': 'Land Title Application', 'url': '/docs/land_and_property/land_title_form.html'},
            {'name': 'Property Transfer Request', 'url': '/docs/land_and_property/property_transfer_form.html'},
        ],
        'identity_documents': [
            {'name': 'Residence Certificate Request', 'url': '/docs/identity_documents/residence_certificate_form.html'},
        ],
        'tax_and_fees': [
            {'name': 'Tax Clearance Certificate', 'url': '/docs/tax_and_fees/tax_clearance_form.html'},
        ],
        'other_services': [
            {'name': 'General Application Form', 'url': '/docs/other_services/general_application_form.html'},
        ],
    }
    
    return render(request, 'blockchain/admin_dashboard.html', {
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
    
    return render(request, 'blockchain/upload_document.html', context)


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
    
    return render(request, 'blockchain/upload_multiple_documents.html', context)


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
    
    # Get all requests assigned to this official
    assigned_requests = AdministrativeRequest.objects.filter(
        assigned_to=request.user
    ).order_by('-created_at')
    
    # Get requests by status
    pending_requests = assigned_requests.filter(status='PENDING')
    in_progress_requests = assigned_requests.filter(status='IN_PROGRESS')
    completed_requests = assigned_requests.filter(status='COMPLETED')
    
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
        'completed': completed_requests.count(),
        'pending_documents': recent_document_requests.count()
    }
    
    context = {
        'pending_requests': pending_requests,
        'in_progress_requests': in_progress_requests,
        'completed_requests': completed_requests,
        'recent_document_requests': recent_document_requests,
        'recent_status_updates': recent_status_updates,
        'blockchain_authority': blockchain_authority,
        'task_stats': task_stats,
    }
    
    return render(request, 'blockchain/official_dashboard.html', context)


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
    
    return render(request, 'blockchain/register_official.html', {'form': form})


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
    return render(request, 'blockchain/delegate_authority.html', context)


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
    
    return render(request, 'blockchain/category_management.html', {
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
    
    return render(request, 'blockchain/manage_categories.html', {
        'categories': categories,
        'officials': officials,
        'category_officials_json': json.dumps(category_officials)
    }) 