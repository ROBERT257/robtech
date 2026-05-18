from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Payment
        fields = ['id', 'username', 'amount', 'phone', 'status', 'mpesa_code', 
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'status', 'mpesa_code', 'created_at', 'updated_at']


class InitiatePaymentSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=15)
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
