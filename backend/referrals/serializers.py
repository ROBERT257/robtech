from rest_framework import serializers
from .models import Referral


class ReferralSerializer(serializers.ModelSerializer):
    referrer_username = serializers.CharField(source='referrer.username', read_only=True)
    referred_username = serializers.CharField(source='referred_user.username', read_only=True)
    
    class Meta:
        model = Referral
        fields = ['id', 'referrer', 'referrer_username', 'referred_user', 
                  'referred_username', 'reward_amount', 'status', 
                  'approved_by_admin', 'paid_at', 'created_at']
        read_only_fields = ['id', 'status', 'approved_by_admin', 'paid_at', 'created_at']


class CreateReferralSerializer(serializers.Serializer):
    referral_code = serializers.CharField(max_length=20)
