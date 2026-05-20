from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from .models import Claim
from .serializers import ClaimSerializer, CreateClaimSerializer


class ClaimListView(generics.ListAPIView):
    """List user's claims"""
    permission_classes = (IsAuthenticated,)
    serializer_class = ClaimSerializer

    def get_queryset(self):
        return Claim.objects.filter(user=self.request.user)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_claim(request):
    """Create a weekly claim request"""
    # Check if user can claim
    can_claim, message = Claim.can_claim(request.user)
    
    if not can_claim:
        return Response({
            'error': message
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Create claim
    now = timezone.now()
    week_number = now.isocalendar()[1]
    year = now.year
    
    claim = Claim.objects.create(
        user=request.user,
        week_number=week_number,
        year=year
    )

    status_data = Claim.get_claim_status_summary(request.user)
    
    return Response({
        'message': 'Claim submitted successfully. Your reward is awaiting approval.',
        'pending_message': 'Your reward is awaiting approval.',
        'claim': ClaimSerializer(claim).data,
        'claim_status': {
            **status_data,
            'current_claim': ClaimSerializer(status_data['current_claim']).data if status_data['current_claim'] else None,
        }
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def claim_status(request):
    """Check if user can claim this week"""
    status_data = Claim.get_claim_status_summary(request.user)
    
    return Response({
        'can_claim': status_data['can_claim'],
        'message': status_data['message'],
        'current_claim': ClaimSerializer(status_data['current_claim']).data if status_data['current_claim'] else None,
        'week_number': timezone.now().isocalendar()[1],
        'year': timezone.now().year,
        'next_claim_at': status_data['next_claim_at'],
        'claim_amount': status_data['claim_amount'],
        'pending_review': status_data['pending_review'],
        'estimated_review_time': status_data['estimated_review_time'],
        'streak_count': status_data['streak_count'],
        'claim_state': status_data['claim_state'],
    })
