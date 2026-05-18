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
    
    return Response({
        'message': 'Claim request submitted successfully',
        'claim': ClaimSerializer(claim).data
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def claim_status(request):
    """Check if user can claim this week"""
    can_claim, message = Claim.can_claim(request.user)
    
    now = timezone.now()
    week_number = now.isocalendar()[1]
    year = now.year
    
    # Get current week's claim if exists
    current_claim = Claim.objects.filter(
        user=request.user,
        week_number=week_number,
        year=year
    ).first()
    
    return Response({
        'can_claim': can_claim,
        'message': message,
        'current_claim': ClaimSerializer(current_claim).data if current_claim else None,
        'week_number': week_number,
        'year': year
    })
