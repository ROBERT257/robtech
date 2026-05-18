from django.db import models
from django.conf import settings
import uuid


class Referral(models.Model):
    """Referral model for tracking user referrals"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('paid', 'Paid'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    referrer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='referrals_made')
    referred_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='referrals_received')
    reward_amount = models.DecimalField(max_digits=18, decimal_places=8, default=150)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    approved_by_admin = models.BooleanField(default=False)
    paid_at = models.DateTimeField(null=True, blank=True)
    payment_reference = models.CharField(max_length=100, null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['referrer', 'referred_user']

    def __str__(self):
        return f"{self.referrer.username} -> {self.referred_user.username} ({self.status})"

    def approve(self):
        """Approve referral and credit reward"""
        if self.status == 'pending':
            self.status = 'approved'
            self.approved_by_admin = True
            self.referrer.wallet_balance += self.reward_amount
            self.referrer.save()
            self.save()
            
            # Create transaction record
            from wallet.models import Transaction
            Transaction.objects.create(
                user=self.referrer,
                amount=self.reward_amount,
                transaction_type='referral',
                description=f'Referral reward for {self.referred_user.username}',
                reference=str(self.id)
            )

    def mark_as_paid(self, payment_reference):
        """Mark referral as paid after payout"""
        self.status = 'paid'
        self.paid_at = models.timezone.now()
        self.payment_reference = payment_reference
        self.referrer.wallet_balance -= self.reward_amount
        self.referrer.save()
        self.save()
        
        # Create transaction record
        from wallet.models import Transaction
        Transaction.objects.create(
            user=self.referrer,
            amount=-self.reward_amount,
            transaction_type='payout',
            description=f'Referral payout to {self.referred_user.username}',
            reference=payment_reference
        )
