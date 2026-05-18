from rest_framework import serializers
from .models import Transaction


class TransactionSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Transaction
        fields = ['id', 'username', 'amount', 'transaction_type', 'description', 
                  'reference', 'balance_after', 'created_at']
        read_only_fields = ['id', 'balance_after', 'created_at']


class WalletSerializer(serializers.Serializer):
    balance = serializers.DecimalField(max_digits=18, decimal_places=8)
    transaction_count = serializers.IntegerField()
