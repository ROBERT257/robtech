from rest_framework import serializers
from .models import Payment
from django.conf import settings


class PaymentSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Payment
        fields = ['id', 'username', 'amount', 'phone', 'status', 'mpesa_code', 'attempts', 'expires_at', 'audit_logs', 'created_at', 'updated_at']
        read_only_fields = ['id', 'status', 'mpesa_code', 'attempts', 'expires_at', 'audit_logs', 'created_at', 'updated_at']


class InitiatePaymentSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=15, required=False, allow_blank=True)
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)

    def validate_amount(self, value):
        expected = getattr(settings, 'REGISTRATION_FEE', 300)
        if int(value) != int(expected):
            raise serializers.ValidationError(f"Registration fee must be exactly {expected} KES")
        return value
