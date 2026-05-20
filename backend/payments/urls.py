from django.urls import path
from .views import InitiatePaymentView, PaymentListView, mpesa_callback, payment_status, retry_payment

urlpatterns = [
    path('initiate/', InitiatePaymentView.as_view(), name='initiate_payment'),
    path('list/', PaymentListView.as_view(), name='payment_list'),
    path('callback/', mpesa_callback, name='mpesa_callback'),
    path('status/<uuid:payment_id>/', payment_status, name='payment_status'),
    path('retry/<uuid:payment_id>/', retry_payment, name='retry_payment'),
]
