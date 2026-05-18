from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import Transaction
from .serializers import TransactionSerializer, WalletSerializer

User = get_user_model()


class TransactionListView(generics.ListAPIView):
    """List user's transactions"""
    permission_classes = (IsAuthenticated,)
    serializer_class = TransactionSerializer

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def wallet_balance(request):
    """Get user's wallet balance"""
    user = request.user
    transaction_count = Transaction.objects.filter(user=user).count()
    
    return Response({
        'balance': str(user.wallet_balance),
        'transaction_count': transaction_count
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def adjust_balance(request):
    """Admin endpoint to adjust user balance"""
    if not request.user.is_staff:
        return Response({
            'error': 'Admin access required'
        }, status=status.HTTP_403_FORBIDDEN)
    
    user_id = request.data.get('user_id')
    amount = request.data.get('amount')
    description = request.data.get('description', 'Admin adjustment')
    
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({
            'error': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Update balance
    user.wallet_balance += amount
    user.save()
    
    # Create transaction record
    Transaction.objects.create(
        user=user,
        amount=amount,
        transaction_type='adjustment',
        description=description,
        balance_after=user.wallet_balance
    )
    
    return Response({
        'message': 'Balance adjusted successfully',
        'new_balance': str(user.wallet_balance)
    })
