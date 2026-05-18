from django.urls import path
from .views import ReferralListView, ReferralReceivedListView, apply_referral_code, referral_stats

urlpatterns = [
    path('made/', ReferralListView.as_view(), name='referral_list'),
    path('received/', ReferralReceivedListView.as_view(), name='referral_received_list'),
    path('apply/', apply_referral_code, name='apply_referral'),
    path('stats/', referral_stats, name='referral_stats'),
]
