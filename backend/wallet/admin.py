from django.contrib import admin
from .models import Transaction
from .models_claims_payments import Payment, Claim
@admin.action(description="Approve selected payments and verify user")
def approve_payments(modeladmin, request, queryset):
    for payment in queryset:
        if payment.status != 'approved':
            payment.status = 'approved'
            payment.save()
            user = payment.user
            user.is_verified = True
            user.save()

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'amount', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    actions = [approve_payments]

@admin.register(Claim)
class ClaimAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'amount', 'status', 'created_at']
    list_filter = ['status', 'created_at']


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'amount', 'transaction_type', 'balance_after', 'created_at']
    list_filter = ['transaction_type', 'created_at']
    search_fields = ['user__username', 'reference', 'description']
    readonly_fields = ['id', 'created_at']
