from .models import UserProfile
from django.db.models import Count, Q

def pending_approvals_processor(request):
    """Adds pending approvals count for site admins"""
    context = {}
    
    if request.user.is_authenticated and request.user.is_staff:
        pending_count = UserProfile.objects.filter(
            approval_status='PENDING',
            user__is_active=True
        ).count()
        context['pending_approvals_count'] = pending_count
    
    return context

def language_processor(request):
    """Adds current language code to the context"""
    from django.utils import translation
    return {
        'LANGUAGE_CODE': translation.get_language(),
    } 