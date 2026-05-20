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
def payments_initiated_last_7():
    from django.utils import timezone
    from datetime import timedelta
    since = timezone.now() - timedelta(days=7)
    return Payment.objects.filter(created_at__gte=since).count()


@register.simple_tag
def payments_completed_last_7():
    from django.utils import timezone
    from datetime import timedelta
    since = timezone.now() - timedelta(days=7)
    return Payment.objects.filter(status='completed', created_at__gte=since).count()


@register.simple_tag
def registration_conversion_rate():
    initiated = payments_initiated_last_7()
    completed = payments_completed_last_7()
    try:
        return int((completed / initiated) * 100) if initiated > 0 else 0
    except Exception:
        return 0


@register.simple_tag
def revenue_last_7():
    from django.utils import timezone
    from datetime import timedelta
    since = timezone.now() - timedelta(days=7)
    qs = Payment.objects.filter(status='completed', created_at__gte=since)
    total = qs.aggregate(total=models.Sum('amount'))['total'] or 0
    return total


@register.simple_tag
def approved_referrals():
    return Referral.objects.filter(status__in=['approved', 'paid']).count()


@register.simple_tag
def transactions_today():
    from django.utils import timezone

    today = timezone.localdate()
    return Transaction.objects.filter(created_at__date=today).count()
