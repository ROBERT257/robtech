from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Payment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wallet_payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default='pending')
    mpesa_code = models.CharField(max_length=64, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Claim(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('rejected', 'Rejected'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wallet_claims')
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=150)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class PaymentTransaction(models.Model):
    TRANSACTION_TYPES = [
        ('claim', 'Claim'),
        ('payment', 'Payment'),
        ('adjustment', 'Adjustment'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wallet_payment_transactions')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_type = models.CharField(max_length=16, choices=TRANSACTION_TYPES)
    description = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    balance_after = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
