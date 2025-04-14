from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.auth import login, logout, authenticate
from django.views.decorators.http import require_http_methods, require_POST
from django.views.decorators.cache import never_cache
from django.contrib import messages
from django.db import transaction
from django.http import HttpResponseForbidden
from django.utils import timezone

from .forms import ExtendedUserCreationForm, UserApprovalForm, EthereumAddressForm
from .models import UserProfile
from blockchain import blockchain

def register(request):
    """User registration view with extended profile information."""
    # Prevent registration if trying to access directly with CHAIRMAN role
    if request.method == 'POST' and 'role' in request.POST and request.POST['role'] == 'CHAIRMAN':
        return HttpResponseForbidden("Chairman accounts cannot be created through public registration.")
    
    if request.method == 'POST':
        form = ExtendedUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            
            # Log the user in
            username = form.cleaned_data.get('username')
            raw_password = form.cleaned_data.get('password1')
            user = authenticate(username=username, password=raw_password)
            login(request, user)
            
            # Show appropriate message based on role
            if user.profile.role == 'OFFICIAL':
                messages.info(request, 'Your account has been created, but you need approval from the commune chairman before you can access official functions.')
            else:
                messages.success(request, f'Account created successfully. Welcome, {username}!')
            
            return redirect('blockchain:index')
    else:
        form = ExtendedUserCreationForm()
    
    return render(request, 'accounts/register.html', {'form': form})


@login_required
def profile(request):
    """User profile view."""
    # Check if user is pending approval
    if request.user.profile.is_pending_approval():
        messages.info(request, 'Your account is pending approval from the commune chairman.')
    
    return render(request, 'accounts/profile.html')


@never_cache
def custom_logout(request):
    """Custom logout view to ensure proper session termination."""
    if request.method == 'POST':
        logout(request)
        # Add headers to prevent caching
        response = render(request, 'accounts/logged_out.html')
        response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response['Pragma'] = 'no-cache'
        response['Expires'] = '0'
        return response
    else:
        # If it's a GET request, redirect to home page
        return redirect('blockchain:index')


def is_chairman(user):
    """Check if user is a commune chairman."""
    return user.is_authenticated and user.profile.is_chairman()


@login_required
@user_passes_test(is_chairman)
def pending_approvals(request):
    """View for commune chairman to see pending official approvals."""
    pending_users = UserProfile.objects.filter(
        role='OFFICIAL',
        approval_status='PENDING'
    ).select_related('user')
    
    return render(request, 'accounts/pending_approvals.html', {
        'pending_users': pending_users
    })


@login_required
@user_passes_test(is_chairman)
@require_POST
def approve_user(request, user_id):
    """View for commune chairman to approve or reject an official."""
    profile = get_object_or_404(UserProfile, user_id=user_id, role='OFFICIAL', approval_status='PENDING')
    form = UserApprovalForm(request.POST, instance=profile)
    
    if form.is_valid():
        try:
            with transaction.atomic():
                profile = form.save(commit=False)
                
                if profile.approval_status == 'APPROVED':
                    # Check for Ethereum address before approving
                    if not profile.ethereum_address:
                        messages.error(request, f'Cannot approve {profile.user.username}. Official must provide an Ethereum address first.')
                        return redirect('accounts:pending_approvals')
                    
                    # Set approval details
                    profile.approved_by = request.user
                    profile.approval_date = timezone.now()
                    
                    # Register the officer in the blockchain
                    try:
                        blockchain.add_officer(profile.ethereum_address)
                        messages.success(request, f'User {profile.user.username} has been approved and registered on the blockchain.')
                    except Exception as e:
                        messages.error(request, f'Failed to register officer on blockchain: {str(e)}')
                        return redirect('accounts:pending_approvals')
                else:
                    messages.info(request, f'User {profile.user.username} has been rejected.')
                
                profile.save()
        except Exception as e:
            messages.error(request, f'Error during approval process: {str(e)}')
    else:
        messages.error(request, 'Invalid form submission.')
    
    return redirect('accounts:pending_approvals')


@login_required
def update_ethereum_address(request):
    """View for officials to update their Ethereum address."""
    if not request.user.profile.role == 'OFFICIAL':
        messages.error(request, "Only officials can update their Ethereum address.")
        return redirect('accounts:profile')
    
    if request.method == 'POST':
        form = EthereumAddressForm(request.POST, instance=request.user.profile)
        if form.is_valid():
            profile = form.save()
            messages.success(request, "Ethereum address updated successfully. Your account can now be approved by the chairman.")
            return redirect('accounts:profile')
    else:
        form = EthereumAddressForm(instance=request.user.profile)
    
    return render(request, 'accounts/update_ethereum_address.html', {
        'form': form,
        'title': 'Update Ethereum Address'
    }) 