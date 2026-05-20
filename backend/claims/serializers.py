from rest_framework import serializers
from .models import Claim


class ClaimSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    reward_label = serializers.SerializerMethodField()
    reviewed_at = serializers.SerializerMethodField()
    
    class Meta:
        model = Claim
        fields = ['id', 'username', 'amount', 'week_number', 'year', 'status', 
                  'status_display', 'reward_label', 'approved_at', 'reviewed_at', 'created_at']
        read_only_fields = ['id', 'status', 'approved_at', 'reviewed_at', 'created_at']

    def get_reward_label(self, obj):
        return f"+{obj.amount} RT"

    def get_reviewed_at(self, obj):
        return obj.approved_at or obj.created_at


class CreateClaimSerializer(serializers.Serializer):
    pass  # No additional fields needed
