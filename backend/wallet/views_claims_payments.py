from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models_claims_payments import Payment, Claim, PaymentTransaction
from .serializers_claims_payments import PaymentSerializer, ClaimSerializer, PaymentTransactionSerializer
from payments.mpesa_service import MpesaService

User = get_user_model()

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def initiate_payment(request):
    user = request.user
    amount = request.data.get('amount')
    phone = request.data.get('phone')
    if not phone:
        return Response({'error': 'Phone number required'}, status=400)
    payment = Payment.objects.create(user=user, amount=amount, status='pending')
    try:
        mpesa = MpesaService()
        mpesa.initiate_stk_push(phone, amount, payment)
    except Exception as e:
        payment.status = 'rejected'
        payment.save()
        return Response({'error': str(e)}, status=500)
    return Response(PaymentSerializer(payment).data, status=201)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_status(request):
    user = request.user
    payment = Payment.objects.filter(user=user).order_by('-created_at').first()
    if not payment:
        return Response({'status': 'no_payment'})
    return Response(PaymentSerializer(payment).data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def claim_status(request):
    user = request.user
    can_claim = user.is_verified and not Claim.objects.filter(user=user, status='completed').exists()
    return Response({
        'is_verified': user.is_verified,
        'can_claim': can_claim,
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_claim(request):
    user = request.user
    if not user.is_verified:
        return Response({'error': 'User not verified'}, status=403)
    if Claim.objects.filter(user=user, status='completed').exists():
        return Response({'error': 'Already claimed'}, status=400)
    claim = Claim.objects.create(user=user, amount=150, status='completed')
    user.wallet_balance += 150
    user.save()
    PaymentTransaction.objects.create(user=user, amount=150, transaction_type='claim', description='Weekly claim', balance_after=user.wallet_balance)
    return Response(ClaimSerializer(claim).data, status=201)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def claim_history(request):
    user = request.user
    claims = Claim.objects.filter(user=user).order_by('-created_at')
    return Response(ClaimSerializer(claims, many=True).data)
