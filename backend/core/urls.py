from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView, TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/auth/', include('api.auth.urls')),
    path('api/v1/auth/', include('api.auth.urls')),
    path('api/v1/', include('api.v1.urls')),
    
    # Redirect root URL to admin for now
    path('', RedirectView.as_view(url='/admin/')),
    path('test-api/', TemplateView.as_view(template_name='test_api.html'), name='test_api'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    
    # Debug toolbar
    import debug_toolbar
    urlpatterns += [
        path('__debug__/', include(debug_toolbar.urls)),
    ]
