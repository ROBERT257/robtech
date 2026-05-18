from django.contrib import admin
from .models import Claim


@admin.register(Claim)
class ClaimAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'amount', 'week_number', 'year', 'status', 
                  'approved_at', 'created_at']
    list_filter = ['status', 'week_number', 'year', 'created_at']
    search_fields = ['user__username']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    actions = ['approve_claims', 'reject_claims']

    def approve_claims(self, request, queryset):
        """Approve selected claims"""
        count = 0
        for claim in queryset.filter(status='pending'):
            claim.approve()
            count += 1
        self.message_user(request, f"{count} claims approved and tokens credited.")
    approve_claims.short_description = "Approve and credit tokens"

    def reject_claims(self, request, queryset):
        """Reject selected claims"""
        count = queryset.update(status='rejected')
        self.message_user(request, f"{count} claims rejected.")
    reject_claims.short_description = "Reject claims"
