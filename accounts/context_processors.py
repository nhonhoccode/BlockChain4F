from .models import UserProfile

def pending_approvals_processor(request):
    """Context processor to add pending approvals count for chairmen."""
    context = {
        'pending_approvals_count': 0
    }
    
    if request.user.is_authenticated:
        try:
            # Check if user is a chairman
            if hasattr(request.user, 'profile') and request.user.profile.is_chairman():
                # Count pending official approvals
                context['pending_approvals_count'] = UserProfile.objects.filter(
                    role='OFFICIAL',
                    approval_status='PENDING'
                ).count()
        except:
            # Handle case where profile doesn't exist
            pass
    
    return context 