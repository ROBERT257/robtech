from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid


class User(AbstractUser):
    """Custom user model for Rotech"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    phone = models.CharField(max_length=15, unique=True, null=True, blank=True)
    referral_code = models.CharField(max_length=20, unique=True, null=True, blank=True)
    referred_by = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='referrals')
    is_registered = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    wallet_balance = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    last_claim = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.username or self.phone or str(self.id)

    def generate_referral_code(self):
        """Generate unique referral code"""
        if not self.referral_code:
            import random
            import string
            code = 'RO' + ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
            while User.objects.filter(referral_code=code).exists():
                code = 'RO' + ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
            self.referral_code = code
            self.save()
        return self.referral_code
