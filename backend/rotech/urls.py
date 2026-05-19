"""
URL configuration for rotech project.
"""

from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from .views import ping

urlpatterns = [
    path('', RedirectView.as_view(url='/api/ping/', permanent=False)),
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/referrals/', include('referrals.urls')),
    path('api/claims/', include('claims.urls')),
    path('api/wallet/', include('wallet.urls')),
    path('api/ping/', ping, name='ping'),
]
