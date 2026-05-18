from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    referral_count = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone', 'referral_code', 'referred_by', 
                  'is_registered', 'is_verified', 'wallet_balance', 'last_claim', 
                  'created_at', 'referral_count']
        read_only_fields = ['id', 'wallet_balance', 'last_claim', 'created_at']

    def get_referral_count(self, obj):
        return obj.referrals.filter(is_registered=True).count()


class RegisterSerializer(serializers.ModelSerializer):
    referral_code = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['username', 'email', 'phone', 'password', 'password2', 'referral_code']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        referral_code = attrs.get('referral_code')
        if referral_code:
            try:
                referrer = User.objects.get(referral_code=referral_code)
                attrs['referred_by'] = referrer
            except User.DoesNotExist:
                raise serializers.ValidationError({"referral_code": "Invalid referral code."})
        
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        validated_data.pop('referral_code', None)
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.generate_referral_code()
        
        # Give 150 RT as registration bonus
        from decimal import Decimal
        user.wallet_balance = Decimal('150')
        user.save()
        
        # Create transaction record for registration bonus
        from wallet.models import Transaction
        Transaction.objects.create(
            user=user,
            amount=Decimal('150'),
            transaction_type='adjustment',
            description='Registration bonus',
            balance_after=user.wallet_balance
        )
        
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['is_registered'] = user.is_registered
        token['wallet_balance'] = str(user.wallet_balance)
        return token
