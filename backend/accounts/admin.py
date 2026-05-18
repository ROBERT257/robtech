from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'phone', 'email', 'referral_code', 'is_registered', 'is_verified', 'wallet_balance', 'created_at']
    list_filter = ['is_registered', 'is_verified', 'created_at']
    search_fields = ['username', 'phone', 'email', 'referral_code']
    readonly_fields = ['id', 'created_at', 'updated_at', 'last_claim']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Rotech Info', {
            'fields': ('phone', 'referral_code', 'referred_by', 'is_registered', 'is_verified', 'wallet_balance', 'last_claim')
        }),
        ('Timestamps', {
            'fields': ('id', 'created_at', 'updated_at')
        }),
    )
