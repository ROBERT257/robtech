from django.db import models
from django.conf import settings
from django.utils import timezone
import uuid


class Claim(models.Model):
    """Weekly claim model for Rotech tokens"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='claims')
    amount = models.DecimalField(max_digits=18, decimal_places=8, default=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    week_number = models.IntegerField()
    year = models.IntegerField()
    approved_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['user', 'week_number', 'year']

    def __str__(self):
        return f"{self.user.username} - Week {self.week_number}/{self.year} - {self.amount} RT"

    def approve(self):
        """Approve claim and credit tokens"""
        if self.status == 'pending':
            self.status = 'approved'
            self.approved_at = timezone.now()
            self.user.wallet_balance += self.amount
            self.user.last_claim = timezone.now()
            self.user.save()
            self.save()
            
            # Create transaction record
            from wallet.models import Transaction
            Transaction.objects.create(
                user=self.user,
                amount=self.amount,
                transaction_type='claim',
                description=f'Weekly claim - Week {self.week_number}/{self.year}',
                reference=str(self.id)
            )

    @classmethod
    def can_claim(cls, user):
        """Check if user can claim this week or for the first time"""
        if not user.is_registered:
            return False, "User not registered"

        # If user has never claimed before, allow first claim
        if not cls.objects.filter(user=user).exists():
            return True, "First claim available for new user"

        now = timezone.now()
        current_week = now.isocalendar()[1]
        current_year = now.year

        # Check if already claimed this week
        if cls.objects.filter(
            user=user,
            week_number=current_week,
            year=current_year,
            status='approved'
        ).exists():
            return False, "Already claimed this week"

        # Check if there's a pending claim
        if cls.objects.filter(
            user=user,
            week_number=current_week,
            year=current_year,
            status='pending'
        ).exists():
            return False, "Claim already pending"

        return True, "Can claim"
