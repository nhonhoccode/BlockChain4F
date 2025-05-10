"""
URL Configuration for Commune Blockchain project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.conf.urls.i18n import i18n_patterns
from decouple import config

# Configure admin site
admin.site.site_header = settings.ADMIN_SITE_HEADER
admin.site.site_title = settings.ADMIN_SITE_TITLE
admin.site.index_title = settings.ADMIN_INDEX_TITLE

# Non-translatable URLs
urlpatterns = [
    path('i18n/', include('django.conf.urls.i18n')),
]

# Translatable URLs
urlpatterns += i18n_patterns(
    path(settings.ADMIN_URL, admin.site.urls),
    path('accounts/', include('accounts.urls')),
    path('blockchain/', include('blockchain.urls')),
    path('', include('commune_blockchain.urls')),
    prefix_default_language=False,
)

# Serve static and media files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    
    # Debug toolbar
    try:
        import debug_toolbar
        urlpatterns += [path('__debug__/', include(debug_toolbar.urls))]
    except ImportError:
        pass 