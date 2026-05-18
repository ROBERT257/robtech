from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.conf import settings
from .models import Payment, MpesaCallback
from .serializers import PaymentSerializer, InitiatePaymentSerializer
from .mpesa_service import MpesaService


class InitiatePaymentView(generics.CreateAPIView):
    """Initiate M-Pesa STK Push payment"""
    permission_classes = (IsAuthenticated,)
    serializer_class = InitiatePaymentSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        phone = serializer.validated_data['phone']
        amount = serializer.validated_data['amount']
        
        # Create payment record
        payment = Payment.objects.create(
            user=request.user,
            amount=amount,
            phone=phone,
            status='pending'
        )
        
        # Initiate STK Push
        try:
            mpesa_service = MpesaService()
            response = mpesa_service.initiate_stk_push(phone, amount, payment)
            
            return Response({
                'payment_id': str(payment.id),
                'message': 'Payment initiated. Please check your phone for STK Push prompt.',
                'response': response
            }, status=status.HTTP_200_OK)
        except Exception as e:
            payment.status = 'failed'
            payment.save()
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class PaymentListView(generics.ListAPIView):
    """List user's payments"""
    permission_classes = (IsAuthenticated,)
    serializer_class = PaymentSerializer

    def get_queryset(self):
        return Payment.objects.filter(user=self.request.user)


@api_view(['POST'])
@permission_classes([AllowAny])
def mpesa_callback(request):
    """Handle M-Pesa callback"""
    try:
        mpesa_service = MpesaService()
        payment = mpesa_service.process_callback(request.data)
        
        return Response({
            'ResultCode': 0,
            'ResultDesc': 'Callback processed successfully',
            'payment_id': str(payment.id),
            'status': payment.status
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'ResultCode': 1,
            'ResultDesc': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_status(request, payment_id):
    """Check payment status"""
    try:
        payment = Payment.objects.get(id=payment_id, user=request.user)
        return Response(PaymentSerializer(payment).data)
    except Payment.DoesNotExist:
        return Response({'error': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)
