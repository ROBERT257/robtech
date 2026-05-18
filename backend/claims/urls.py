from django.urls import path
from .views import ClaimListView, create_claim, claim_status

urlpatterns = [
    path('list/', ClaimListView.as_view(), name='claim_list'),
    path('create/', create_claim, name='create_claim'),
    path('status/', claim_status, name='claim_status'),
]
