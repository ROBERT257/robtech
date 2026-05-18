from rest_framework import serializers
from .models import Claim


class ClaimSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Claim
        fields = ['id', 'username', 'amount', 'week_number', 'year', 'status', 
                  'approved_at', 'created_at']
        read_only_fields = ['id', 'status', 'approved_at', 'created_at']


class CreateClaimSerializer(serializers.Serializer):
    pass  # No additional fields needed
