from django.urls import path
from .views import (
    LoginView,
    LogoutView,
    RegisterView,
    RegisterChairmanView,
    UserDetailView,
    ChangePasswordView,
    google_auth,
    google_register
)

urlpatterns = [
    path('token/', LoginView.as_view(), name='api-token-auth'),
    path('logout/', LogoutView.as_view(), name='api-logout'),
    path('register/', RegisterView.as_view(), name='api-register'),
    path('register-chairman/', RegisterChairmanView.as_view(), name='api-register-chairman'),
    path('user/', UserDetailView.as_view(), name='api-user-detail'),
    path('change-password/', ChangePasswordView.as_view(), name='api-change-password'),
    path('google-auth/', google_auth, name='google-auth'),
    path('google-register/', google_register, name='google-register'),
]
