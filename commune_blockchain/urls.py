"""
URL Configuration for commune_blockchain.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
from django.views.generic import RedirectView
import os
from blockchain import views as blockchain_views
from django.db.models import Q
from django.conf.urls.i18n import i18n_patterns
from django.utils.translation import gettext_lazy as _
from commune_blockchain.views import set_language

urlpatterns = [
    # Language switcher view
    path('set-language/', set_language, name='set_language'),
    
    path('admin/', admin.site.urls),
    path('', include('accounts.urls')),
    path('blockchain/', include('blockchain.urls')),
    # Serve files from docs directory using Django's serve view
    path('docs/<path:path>', serve, {
        'document_root': settings.DOCS_ROOT,
    }),
    # Add a redirect from root URL to blockchain index
    path('', RedirectView.as_view(url='/blockchain/', permanent=True)),
    
    # Direct URL patterns for request list and detail - redirect to namespaced URLs
    path('requests/', RedirectView.as_view(url='/blockchain/my-requests/', permanent=True), name='requests_redirect'),
    path('request/<int:pk>/', RedirectView.as_view(pattern_name='blockchain:request_detail'), name='request_detail_redirect'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT) 