from django.urls import path
from .views import TransactionListView, wallet_balance, adjust_balance

urlpatterns = [
    path('transactions/', TransactionListView.as_view(), name='transaction_list'),
    path('balance/', wallet_balance, name='wallet_balance'),
    path('adjust/', adjust_balance, name='adjust_balance'),
]
