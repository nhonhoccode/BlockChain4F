"""
URL Configuration for commune_blockchain.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
import os

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('accounts.urls')),
    path('blockchain/', include('blockchain.urls')),
    # Serve files from docs directory
    path('docs/<path:path>', serve, {
        'document_root': os.path.join(settings.BASE_DIR, 'docs'),
    }),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) 