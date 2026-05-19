from django.urls import path
from .views import TransactionListView, wallet_balance, adjust_balance
from .views_claims_payments import (
    initiate_payment, payment_status, claim_status, create_claim, claim_history
)

urlpatterns = [
    path('transactions/', TransactionListView.as_view(), name='transaction_list'),
    path('balance/', wallet_balance, name='wallet_balance'),
    path('adjust/', adjust_balance, name='adjust_balance'),
    path('payments/initiate/', initiate_payment, name='initiate_payment'),
    path('payments/status/', payment_status, name='payment_status'),
    path('claims/status/', claim_status, name='claim_status'),
    path('claims/create/', create_claim, name='create_claim'),
    path('claims/history/', claim_history, name='claim_history'),
]
