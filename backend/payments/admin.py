from django.contrib import admin
from .models import Payment, MpesaCallback
from .mpesa_service import MpesaService
from django.conf import settings
from django.utils import timezone


class MpesaCallbackInline(admin.TabularInline):
    model = MpesaCallback
    extra = 0
    fields = ['received_at']
    readonly_fields = ['received_at']
    can_delete = False


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'amount', 'phone', 'status', 'mpesa_code', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['user__username', 'phone', 'mpesa_code', 'merchant_request_id']
    readonly_fields = ['id', 'created_at', 'updated_at', 'callback_metadata']
    ordering = ['-created_at']
    list_per_page = 30
    autocomplete_fields = ['user']
    list_editable = ['status']
    date_hierarchy = 'created_at'
    inlines = [MpesaCallbackInline]
    
    actions = ['approve_payment', 'reject_payment']
    actions = ['approve_payment', 'reject_payment', 'retry_payment']

    def retry_payment(self, request, queryset):
        """Retry STK Push for selected payments when allowed"""
        service = MpesaService()
        max_retries = getattr(settings, 'MPESA_MAX_RETRIES', 3)
        count = 0
        failed = []
        for payment in queryset.filter(status__in=['pending', 'failed']):
            if payment.attempts >= max_retries:
                failed.append(str(payment.id))
                continue
            try:
                payment.attempts = (payment.attempts or 0) + 1
                payment.status = 'processing'
                logs = payment.audit_logs or []
                logs.append({'ts': timezone.now().isoformat(), 'event': 'admin_retry', 'attempt': payment.attempts})
                payment.audit_logs = logs
                payment.save()
                service.initiate_stk_push(payment.phone, payment.amount, payment)
                count += 1
            except Exception:
                failed.append(str(payment.id))

        self.message_user(request, f"Retried {count} payments. Failed: {', '.join(failed)}")
    retry_payment.short_description = "Retry STK Push for selected payments"

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
        count = queryset.filter(status='pending').update(status='failed')
        self.message_user(request, f"{count} payments rejected.")
    reject_payment.short_description = "Reject payments"


@admin.register(MpesaCallback)
class MpesaCallbackAdmin(admin.ModelAdmin):
    list_display = ['id', 'payment', 'received_at']
    readonly_fields = ['id', 'payment', 'body', 'received_at']
    search_fields = ['payment__user__username', 'payment__phone']
    ordering = ['-received_at']
    list_per_page = 50
