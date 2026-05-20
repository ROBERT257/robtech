from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import date, timedelta
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
    def get_current_week_claim(cls, user):
        now = timezone.now()
        current_week = now.isocalendar()[1]
        current_year = now.year
        return cls.objects.filter(user=user, week_number=current_week, year=current_year).order_by('-created_at').first()

    @classmethod
    def get_latest_claim(cls, user):
        return cls.objects.filter(user=user).order_by('-created_at').first()

    @classmethod
    def get_next_claim_at(cls, user):
        current_claim = cls.get_current_week_claim(user)
        anchor = None

        if current_claim:
            anchor = current_claim.approved_at or current_claim.created_at
        else:
            latest_claim = cls.get_latest_claim(user)
            if latest_claim:
                anchor = latest_claim.approved_at or latest_claim.created_at

        if anchor:
            return anchor + timedelta(days=7)

        return timezone.now()

    @classmethod
    def get_streak_count(cls, user):
        approved_claims = list(
            cls.objects.filter(user=user, status='approved').order_by('-created_at')
        )

        valid_claims = []
        for claim in approved_claims:
            try:
                date.fromisocalendar(claim.year, claim.week_number, 1)
            except ValueError:
                continue
            valid_claims.append(claim)

        if not valid_claims:
            return 0

        streak = 1
        previous_week_start = date.fromisocalendar(
            valid_claims[0].year,
            valid_claims[0].week_number,
            1,
        )
        expected_previous_week = previous_week_start - timedelta(days=7)

        for claim in valid_claims[1:]:
            claim_week_start = date.fromisocalendar(claim.year, claim.week_number, 1)
            if claim_week_start == expected_previous_week:
                streak += 1
                expected_previous_week -= timedelta(days=7)
            else:
                break

        return streak

    @classmethod
    def get_claim_status_summary(cls, user):
        current_claim = cls.get_current_week_claim(user)
        can_claim, message = cls.can_claim(user)
        claim_amount = current_claim.amount if current_claim else cls._meta.get_field('amount').default
        pending_review = bool(current_claim and current_claim.status == 'pending')
        approved_this_week = bool(current_claim and current_claim.status == 'approved')

        if not user.is_registered:
            claim_state = 'locked'
        elif pending_review:
            claim_state = 'pending'
        elif approved_this_week:
            claim_state = 'approved'
        elif can_claim:
            claim_state = 'available'
        else:
            claim_state = 'locked'

        next_claim_at = cls.get_next_claim_at(user)

        return {
            'can_claim': can_claim,
            'message': message,
            'current_claim': current_claim,
            'next_claim_at': next_claim_at,
            'claim_amount': str(claim_amount),
            'pending_review': pending_review,
            'estimated_review_time': '24 hours',
            'streak_count': cls.get_streak_count(user),
            'claim_state': claim_state,
        }

    @classmethod
    def can_claim(cls, user):
        """Check if user can claim this week or for the first time"""
        if not user.is_registered:
            return False, "User not registered"

        current_claim = cls.get_current_week_claim(user)

        if current_claim and current_claim.status == 'pending':
            return False, "You already have a pending claim this week"

        if current_claim and current_claim.status == 'approved':
            return False, f"You already claimed for Week {current_claim.week_number}"

        # If user has never claimed before, allow first claim
        if not cls.objects.filter(user=user).exists():
            return True, "First claim available for new user"

        return True, "Can claim"
