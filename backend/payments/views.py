from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.conf import settings
from .models import Payment, MpesaCallback
from .serializers import PaymentSerializer, InitiatePaymentSerializer
from .mpesa_service import MpesaService, MpesaConfigurationError
from django.utils import timezone
from datetime import timedelta
from django.db import transaction
import json
from django.core.cache import cache
import hmac
import hashlib


class InitiatePaymentView(generics.CreateAPIView):
    """Initiate M-Pesa STK Push payment"""
    permission_classes = (IsAuthenticated,)
    serializer_class = InitiatePaymentSerializer

    def create(self, request, *args, **kwargs):
        # Debug: log incoming payload for diagnostics
        try:
            print('DEBUG /api/payments/initiate payload:', request.data)
        except Exception:
            pass

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        phone = serializer.validated_data.get('phone')
        amount = serializer.validated_data['amount']

        # Auto-use user's phone when not provided
        if not phone:
            phone = getattr(request.user, 'phone', None)
        if not phone:
            return Response({'error': 'Phone number required. Please add a phone to your profile or include phone in request.'}, status=status.HTTP_400_BAD_REQUEST)

        # Rate limiting: per-user short window and daily cap
        short_key = f"mpesa_initiate_short_{request.user.id}"
        daily_key = f"mpesa_initiate_daily_{request.user.id}"
        short = cache.get(short_key)
        daily = cache.get(daily_key) or 0
        if short:
            return Response({'error': 'You are initiating payments too quickly. Please wait before retrying.'}, status=status.HTTP_429_TOO_MANY_REQUESTS)
        if daily >= getattr(settings, 'MPESA_RATE_LIMIT_DAILY', 20):
            return Response({'error': 'Daily payment initiation limit reached.'}, status=status.HTTP_429_TOO_MANY_REQUESTS)

        # Prevent duplicate pending/processing payments for the same user
        existing = Payment.objects.filter(user=request.user, status__in=['pending', 'processing'])
        if existing.exists():
            return Response({'error': 'You have an active payment in progress. Please complete it or wait before creating a new one.' , 'active_payment_id': str(existing.first().id)}, status=status.HTTP_409_CONFLICT)

        # Create payment record with expiry and initial audit log
        expires_at = timezone.now() + timedelta(minutes=getattr(settings, 'MPESA_REQUEST_TIMEOUT_MINUTES', 10))
        payment = Payment.objects.create(
            user=request.user,
            amount=amount,
            phone=phone,
            status='pending',
            attempts=0,
            expires_at=expires_at,
            audit_logs=[{'ts': timezone.now().isoformat(), 'event': 'created', 'detail': 'Initiated payment record'}]
        )

        # update rate limit counters
        cache.set(short_key, True, getattr(settings, 'MPESA_RATE_LIMIT_SECONDS', 30))
        cache.set(daily_key, daily + 1, 24 * 3600)
        
        # Initiate STK Push
        # Attempt STK Push (increment attempts and set processing)
        try:
            mpesa_service = MpesaService()
            # mark processing and increment attempt
            payment.attempts = (payment.attempts or 0) + 1
            payment.status = 'processing'
            logs = payment.audit_logs or []
            logs.append({'ts': timezone.now().isoformat(), 'event': 'stk_attempt', 'attempt': payment.attempts})
            payment.audit_logs = logs
            payment.save()

            response = mpesa_service.initiate_stk_push(phone, amount, payment)

            # record successful request sent
            logs = payment.audit_logs or []
            logs.append({'ts': timezone.now().isoformat(), 'event': 'stk_sent', 'response': response})
            payment.audit_logs = logs
            payment.save()

            return Response({
                'payment_id': str(payment.id),
                'message': 'Payment initiated. Please check your phone for STK Push prompt.',
                'response': response
            }, status=status.HTTP_200_OK)
        except Exception as e:
            if isinstance(e, MpesaConfigurationError):
                payment.status = 'cancelled'
                logs = payment.audit_logs or []
                logs.append({'ts': timezone.now().isoformat(), 'event': 'config_error', 'error': str(e)})
                payment.audit_logs = logs
                payment.save()
                return Response({
                    'error': 'M-Pesa configuration is incomplete',
                    'detail': str(e),
                    'payment_id': str(payment.id),
                }, status=status.HTTP_400_BAD_REQUEST)

            # record error and decide retry/failure
            logs = payment.audit_logs or []
            logs.append({'ts': timezone.now().isoformat(), 'event': 'stk_error', 'error': str(e)})
            payment.audit_logs = logs
            # if attempts exceeded
            max_retries = getattr(settings, 'MPESA_MAX_RETRIES', 3)
            if payment.attempts >= max_retries:
                payment.status = 'failed'
            else:
                payment.status = 'pending'
            payment.save()
            return Response({
                'error': 'STK Push failed',
                'detail': str(e),
                'attempts': payment.attempts,
                'retry_allowed': payment.attempts < max_retries,
                'payment_id': str(payment.id)
            }, status=status.HTTP_502_BAD_GATEWAY)


class PaymentListView(generics.ListAPIView):
    """List user's payments"""
    permission_classes = (IsAuthenticated,)
    serializer_class = PaymentSerializer

    def get_queryset(self):
        return Payment.objects.filter(user=self.request.user)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def retry_payment(request, payment_id):
    """Retry an existing failed or pending M-Pesa payment for the logged-in user."""
    try:
        payment = Payment.objects.get(id=payment_id, user=request.user)
    except Payment.DoesNotExist:
        return Response({'error': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)

    if payment.status == 'completed':
        return Response({'error': 'This payment is already completed.'}, status=status.HTTP_409_CONFLICT)

    max_retries = getattr(settings, 'MPESA_MAX_RETRIES', 3)
    if payment.attempts >= max_retries:
        return Response({'error': 'Retry limit reached for this payment.', 'attempts': payment.attempts}, status=status.HTTP_429_TOO_MANY_REQUESTS)

    try:
        mpesa_service = MpesaService()
        payment.attempts = (payment.attempts or 0) + 1
        payment.status = 'processing'
        logs = payment.audit_logs or []
        logs.append({'ts': timezone.now().isoformat(), 'event': 'user_retry', 'attempt': payment.attempts})
        payment.audit_logs = logs
        payment.save(update_fields=['attempts', 'status', 'audit_logs', 'updated_at'])

        response = mpesa_service.initiate_stk_push(payment.phone, payment.amount, payment)
        logs = payment.audit_logs or []
        logs.append({'ts': timezone.now().isoformat(), 'event': 'user_retry_sent', 'response': response})
        payment.audit_logs = logs
        payment.save(update_fields=['audit_logs', 'merchant_request_id', 'checkout_request_id', 'updated_at'])

        return Response({
            'payment_id': str(payment.id),
            'message': 'Retry initiated. Check your phone for the M-Pesa prompt.',
            'attempts': payment.attempts,
            'response': response,
        }, status=status.HTTP_200_OK)
    except Exception as e:
        if isinstance(e, MpesaConfigurationError):
            logs = payment.audit_logs or []
            logs.append({'ts': timezone.now().isoformat(), 'event': 'config_error', 'error': str(e)})
            payment.audit_logs = logs
            payment.status = 'cancelled'
            payment.save(update_fields=['status', 'audit_logs', 'updated_at'])
            return Response({'error': 'M-Pesa configuration is incomplete', 'detail': str(e), 'attempts': payment.attempts}, status=status.HTTP_400_BAD_REQUEST)

        logs = payment.audit_logs or []
        logs.append({'ts': timezone.now().isoformat(), 'event': 'user_retry_error', 'error': str(e)})
        payment.audit_logs = logs
        payment.status = 'failed'
        payment.save(update_fields=['status', 'audit_logs', 'updated_at'])
        return Response({'error': 'Retry failed', 'detail': str(e), 'attempts': payment.attempts}, status=status.HTTP_502_BAD_GATEWAY)


@api_view(['POST'])
@permission_classes([AllowAny])
def mpesa_callback(request):
    """Handle payment callbacks from the configured provider."""
    try:
        mpesa_service = MpesaService()

        if getattr(settings, 'PAYMENT_PROVIDER', '').strip().lower() == 'mpesa':
            allowed_ips = getattr(settings, 'MPESA_CALLBACK_IPS', []) or []
            remote_addr = request.META.get('REMOTE_ADDR') or request.META.get('HTTP_X_FORWARDED_FOR', '').split(',')[0].strip()
            if allowed_ips and (not remote_addr or remote_addr not in allowed_ips):
                return Response({'ResultCode': 1, 'ResultDesc': 'Callback IP not allowed', 'remote_addr': remote_addr}, status=status.HTTP_403_FORBIDDEN)

            callback_secret = getattr(settings, 'MPESA_CALLBACK_SECRET', '')
            if callback_secret:
                raw = request.body or b''
                signature_header = request.META.get('HTTP_X_MPESA_SIGNATURE') or request.META.get('HTTP_X_MPESA_SIGNATURE'.lower()) or request.META.get('X-Mpesa-Signature')
                if not signature_header:
                    return Response({'ResultCode': 1, 'ResultDesc': 'Missing signature header'}, status=status.HTTP_403_FORBIDDEN)
                computed = hmac.new(callback_secret.encode(), raw, hashlib.sha256).hexdigest()
                if not hmac.compare_digest(computed, signature_header):
                    return Response({'ResultCode': 1, 'ResultDesc': 'Invalid callback signature'}, status=status.HTTP_403_FORBIDDEN)

        # Delegate processing to service (keeps logic centralized)
        payment = mpesa_service.process_callback(request.data)

        # Apply optional registration credit
        credit = getattr(settings, 'REGISTRATION_CREDIT', 0)
        if credit and getattr(payment, 'status', '') == 'completed':
            try:
                user = payment.user
                user.wallet_balance = user.wallet_balance + credit
                user.save()
                logs = payment.audit_logs or []
                logs.append({'ts': timezone.now().isoformat(), 'event': 'credit_applied', 'amount': credit})
                payment.audit_logs = logs
                payment.save()
            except Exception:
                # don't block callback processing on credit issues
                pass
        return Response({'ResultCode': 0, 'ResultDesc': 'Callback processed successfully', 'payment_id': str(payment.id), 'status': payment.status}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'ResultCode': 1, 'ResultDesc': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_status(request, payment_id):
    """Check payment status"""
    try:
        payment = Payment.objects.get(id=payment_id, user=request.user)
        return Response(PaymentSerializer(payment).data)
    except Payment.DoesNotExist:
        return Response({'error': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)
