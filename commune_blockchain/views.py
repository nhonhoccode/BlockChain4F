from django.shortcuts import redirect
from django.utils import translation
from django.urls import reverse
from django.conf import settings

def set_language(request):
    """
    View to set the language preference in the session
    """
    lang_code = request.GET.get('lang', None)
    # Use the next parameter if provided, otherwise fall back to HTTP_REFERER or home
    next_url = request.GET.get('next', request.META.get('HTTP_REFERER', '/'))
    
    if lang_code and lang_code in [lang[0] for lang in settings.LANGUAGES]:
        # Activate the language for the current thread
        translation.activate(lang_code)
        
        # Set the language in the session
        request.session[settings.LANGUAGE_COOKIE_NAME] = lang_code
        
        # Set the language cookie for future requests
        response = redirect(next_url)
        response.set_cookie(
            settings.LANGUAGE_COOKIE_NAME, 
            lang_code,
            max_age=settings.LANGUAGE_COOKIE_AGE if hasattr(settings, 'LANGUAGE_COOKIE_AGE') else None,
            path=settings.LANGUAGE_COOKIE_PATH if hasattr(settings, 'LANGUAGE_COOKIE_PATH') else '/',
            domain=settings.LANGUAGE_COOKIE_DOMAIN if hasattr(settings, 'LANGUAGE_COOKIE_DOMAIN') else None,
            secure=settings.LANGUAGE_COOKIE_SECURE if hasattr(settings, 'LANGUAGE_COOKIE_SECURE') else False,
            httponly=settings.LANGUAGE_COOKIE_HTTPONLY if hasattr(settings, 'LANGUAGE_COOKIE_HTTPONLY') else False,
            samesite=settings.LANGUAGE_COOKIE_SAMESITE if hasattr(settings, 'LANGUAGE_COOKIE_SAMESITE') else 'Lax',
        )
        return response
    
    return redirect(next_url) 