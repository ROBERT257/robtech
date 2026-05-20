from django.contrib import admin
from .models import Referral


@admin.register(Referral)
class ReferralAdmin(admin.ModelAdmin):
    list_display = ['id', 'referrer', 'referred_user', 'reward_amount', 'status', 
                  'approved_by_admin', 'paid_at', 'created_at']
    list_filter = ['status', 'approved_by_admin', 'created_at']
    search_fields = ['referrer__username', 'referred_user__username']
    readonly_fields = ['id', 'created_at', 'updated_at']
    list_editable = ['status', 'approved_by_admin']
    ordering = ['-created_at']
    list_per_page = 30
    autocomplete_fields = ['referrer', 'referred_user']
    date_hierarchy = 'created_at'
    
    actions = ['approve_referrals', 'reject_referrals']

    def approve_referrals(self, request, queryset):
        """Approve selected referrals"""
        count = 0
        for referral in queryset.filter(status='pending'):
            referral.approve()
            count += 1
        self.message_user(request, f"{count} referrals approved and rewards credited.")
    approve_referrals.short_description = "Approve and credit rewards"

    def reject_referrals(self, request, queryset):
        """Reject selected referrals"""
        count = queryset.filter(status='pending').update(status='rejected')
        self.message_user(request, f"{count} referrals rejected.")
    reject_referrals.short_description = "Reject referrals"
