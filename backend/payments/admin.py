from django.contrib import admin
from .models import Payment, MpesaCallback


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'amount', 'phone', 'status', 'mpesa_code', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['user__username', 'phone', 'mpesa_code', 'merchant_request_id']
    readonly_fields = ['id', 'created_at', 'updated_at', 'callback_metadata']
    
    actions = ['approve_payment', 'reject_payment']

    def approve_payment(self, request, queryset):
        """Approve selected payments and register users"""
        count = 0
        for payment in queryset.filter(status='completed'):
            if not payment.user.is_registered:
                payment.user.is_registered = True
                payment.user.is_verified = True
                payment.user.save()
                count += 1
        self.message_user(request, f"{count} users registered successfully.")
    approve_payment.short_description = "Approve and register users"

    def reject_payment(self, request, queryset):
        """Reject selected payments"""
        count = queryset.update(status='failed')
        self.message_user(request, f"{count} payments rejected.")
    reject_payment.short_description = "Reject payments"


@admin.register(MpesaCallback)
class MpesaCallbackAdmin(admin.ModelAdmin):
    list_display = ['id', 'payment', 'received_at']
    readonly_fields = ['id', 'payment', 'body', 'received_at']
