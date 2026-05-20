from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User
from wallet.models import Transaction


class TransactionInline(admin.TabularInline):
    model = Transaction
    extra = 0
    fields = ['transaction_type', 'amount', 'balance_after', 'created_at']
    readonly_fields = fields
    can_delete = False
    show_change_link = True
    ordering = ['-created_at']


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'phone', 'email', 'is_registered', 'is_verified', 'wallet_balance', 'created_at']
    list_filter = ['is_staff', 'is_superuser', 'is_registered', 'is_verified', 'created_at']
    search_fields = ['username', 'phone', 'email', 'referral_code']
    readonly_fields = ['id', 'created_at', 'updated_at', 'last_claim']
    list_editable = ['is_registered', 'is_verified']
    ordering = ['-created_at']
    list_per_page = 25
    autocomplete_fields = ['referred_by']
    date_hierarchy = 'created_at'
    inlines = [TransactionInline]
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Rotech Info', {
            'fields': ('phone', 'referral_code', 'referred_by', 'is_registered', 'is_verified', 'wallet_balance', 'last_claim')
        }),
        ('Timestamps', {
            'fields': ('id', 'created_at', 'updated_at')
        }),
    )
