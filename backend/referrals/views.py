from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import Referral
from .serializers import ReferralSerializer, CreateReferralSerializer

User = get_user_model()


class ReferralListView(generics.ListAPIView):
    """List user's referrals (both made and received)"""
    permission_classes = (IsAuthenticated,)
    serializer_class = ReferralSerializer

    def get_queryset(self):
        user = self.request.user
        return Referral.objects.filter(referrer=user)


class ReferralReceivedListView(generics.ListAPIView):
    """List referrals received by user"""
    permission_classes = (IsAuthenticated,)
    serializer_class = ReferralSerializer

    def get_queryset(self):
        user = self.request.user
        return Referral.objects.filter(referred_user=user)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def apply_referral_code(request):
    """Apply referral code during registration"""
    serializer = CreateReferralSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    referral_code = serializer.validated_data['referral_code']
    user = request.user
    
    # Check if user already has a referrer
    if user.referred_by:
        return Response({
            'error': 'You already have a referrer'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Find referrer
    try:
        referrer = User.objects.get(referral_code=referral_code)
    except User.DoesNotExist:
        return Response({
            'error': 'Invalid referral code'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if referral already exists
    if Referral.objects.filter(referrer=referrer, referred_user=user).exists():
        return Response({
            'error': 'Referral already exists'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Create referral (pending until user registers)
    referral = Referral.objects.create(
        referrer=referrer,
        referred_user=user,
        status='pending'
    )
    
    user.referred_by = referrer
    user.save()
    
    return Response({
        'message': 'Referral code applied successfully',
        'referral': ReferralSerializer(referral).data
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def referral_stats(request):
    """Get referral statistics"""
    user = request.user
    
    referrals_made = Referral.objects.filter(referrer=user)
    referrals_received = Referral.objects.filter(referred_user=user)
    
    pending_count = referrals_made.filter(status='pending').count()
    approved_count = referrals_made.filter(status='approved').count()
    paid_count = referrals_made.filter(status='paid').count()
    total_rewards = referrals_made.filter(status__in=['approved', 'paid']).count() * 150
    
    return Response({
        'total_referrals': referrals_made.count(),
        'pending': pending_count,
        'approved': approved_count,
        'paid': paid_count,
        'total_rewards_earned': total_rewards,
        'referral_code': user.referral_code,
    })
