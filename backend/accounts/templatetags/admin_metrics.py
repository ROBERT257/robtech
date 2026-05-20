from django import template
from accounts.models import User
from claims.models import Claim
from payments.models import Payment
from referrals.models import Referral
from wallet.models import Transaction

register = template.Library()


@register.simple_tag
def total_users():
    return User.objects.count()


@register.simple_tag
def verified_users():
    return User.objects.filter(is_verified=True).count()


@register.simple_tag
def pending_claims():
    return Claim.objects.filter(status='pending').count()


@register.simple_tag
def pending_payments():
    return Payment.objects.filter(status='pending').count()


@register.simple_tag
def approved_referrals():
    return Referral.objects.filter(status__in=['approved', 'paid']).count()


@register.simple_tag
def transactions_today():
    from django.utils import timezone

    today = timezone.localdate()
    return Transaction.objects.filter(created_at__date=today).count()
