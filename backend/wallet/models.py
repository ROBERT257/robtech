from django.db import models
from django.conf import settings
import uuid


class Transaction(models.Model):
    """Transaction model for wallet operations"""
    TRANSACTION_TYPES = [
        ('claim', 'Weekly Claim'),
        ('referral', 'Referral Reward'),
        ('payout', 'Referral Payout'),
        ('deposit', 'Deposit'),
        ('withdrawal', 'Withdrawal'),
        ('transfer', 'Transfer'),
        ('adjustment', 'Admin Adjustment'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='transactions')
    amount = models.DecimalField(max_digits=18, decimal_places=8)
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    description = models.TextField()
    reference = models.CharField(max_length=100, null=True, blank=True)
    balance_after = models.DecimalField(max_digits=18, decimal_places=8)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.transaction_type} - {self.amount} RT"

    def save(self, *args, **kwargs):
        # Update balance_after before saving
        self.balance_after = self.user.wallet_balance
        super().save(*args, **kwargs)
