import requests
import base64
from datetime import datetime
from django.conf import settings
from .models import Payment, MpesaCallback


class MpesaConfigurationError(Exception):
    """Raised when payment settings are missing or invalid."""
    pass


class MpesaService:
    """Service for M-Pesa Daraja API integration."""

    def __init__(self):
        self.consumer_key = settings.MPESA_CONSUMER_KEY
        self.consumer_secret = settings.MPESA_CONSUMER_SECRET
        self.passkey = settings.MPESA_PASSKEY
        self.shortcode = settings.MPESA_SHORTCODE
        self.environment = settings.MPESA_ENVIRONMENT
        self.callback_url = (getattr(settings, 'MPESA_CALLBACK_URL', '') or '').strip()
        
        if self.environment == 'sandbox':
            self.base_url = 'https://sandbox.safaricom.co.ke'
        else:
            self.base_url = 'https://api.safaricom.co.ke'
        
        self.access_token = None
        self.token_expiry = None

    def validate_configuration(self):
        missing = []
        if not self.consumer_key:
            missing.append('MPESA_CONSUMER_KEY')
        if not self.consumer_secret:
            missing.append('MPESA_CONSUMER_SECRET')
        if not self.passkey:
            missing.append('MPESA_PASSKEY')
        if not self.shortcode:
            missing.append('MPESA_SHORTCODE')
        if not self.callback_url:
            missing.append('MPESA_CALLBACK_URL')

        if missing:
            raise MpesaConfigurationError(
                'Missing M-Pesa settings: ' + ', '.join(missing) + '. Set them in your backend environment before testing payments.'
            )

        if self.callback_url.startswith('http://127.0.0.1') or self.callback_url.startswith('http://localhost'):
            raise MpesaConfigurationError(
                'MPESA_CALLBACK_URL must be a public HTTPS URL for Safaricom to reach it. Use ngrok or a deployed HTTPS endpoint.'
            )

    @staticmethod
    def _normalize_mpesa_phone(phone):
        phone = str(phone).strip()
        if phone.startswith('0'):
            return '254' + phone[1:]
        if phone.startswith('+'):
            return phone[1:]
        return phone

    def get_access_token(self):
        """Generate and cache M-Pesa access token"""
        if self.access_token and self.token_expiry and datetime.now().timestamp() < self.token_expiry:
            return self.access_token
        
        api_url = f"{self.base_url}/oauth/v1/generate?grant_type=client_credentials"
        
        auth = base64.b64encode(f"{self.consumer_key}:{self.consumer_secret}".encode()).decode()
        
        headers = {
            'Authorization': f'Basic {auth}'
        }
        
        try:
            response = requests.get(api_url, headers=headers)
            response.raise_for_status()
            data = response.json()
            self.access_token = data['access_token']
            # Token expires in 1 hour (3600 seconds)
            self.token_expiry = datetime.now().timestamp() + 3500
            return self.access_token
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to get access token: {str(e)}")

    def initiate_stk_push(self, phone, amount, payment):
        """Initiate an M-Pesa STK push."""
        self.validate_configuration()
        access_token = self.get_access_token()
        
        phone = self._normalize_mpesa_phone(phone)
        
        api_url = f"{self.base_url}/mpesa/stkpush/v1/processrequest"
        
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        password = base64.b64encode(
            f"{self.shortcode}{self.passkey}{timestamp}".encode()
        ).decode()
        
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'BusinessShortCode': self.shortcode,
            'Password': password,
            'Timestamp': timestamp,
            'TransactionType': 'CustomerPayBillOnline',
            'Amount': int(amount),
            'PartyA': phone,
            'PartyB': self.shortcode,
            'PhoneNumber': phone,
            'CallBackURL': self.callback_url.rstrip('/') + '/api/payments/callback/',
            'AccountReference': f"Rotech-{payment.id}",
            'TransactionDesc': 'Rotech Registration Payment'
        }
        
        try:
            response = requests.post(api_url, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
            
            # Save response details
            payment.merchant_request_id = data.get('MerchantRequestID')
            payment.checkout_request_id = data.get('CheckoutRequestID')
            payment.save()
            
            return data
        except requests.exceptions.RequestException as e:
            raise Exception(f"STK Push failed: {str(e)}")

    def process_callback(self, callback_data):
        """Process an M-Pesa callback."""
        try:
            body = callback_data.get('Body', {})
            stk_callback = body.get('stkCallback', {})
            
            merchant_request_id = stk_callback.get('MerchantRequestID')
            checkout_request_id = stk_callback.get('CheckoutRequestID')
            result_code = stk_callback.get('ResultCode')
            result_desc = stk_callback.get('ResultDesc')
            
            # Find payment
            payment = Payment.objects.filter(
                merchant_request_id=merchant_request_id,
                checkout_request_id=checkout_request_id
            ).first()

            if not payment and merchant_request_id:
                payment = Payment.objects.filter(merchant_request_id=merchant_request_id).first()

            if not payment and checkout_request_id:
                payment = Payment.objects.filter(checkout_request_id=checkout_request_id).first()
            
            if not payment:
                raise Exception("Payment not found")

            if payment.expires_at and datetime.now().astimezone() > payment.expires_at.astimezone():
                payment.status = 'timeout'
                payment.audit_logs = (payment.audit_logs or []) + [{'ts': datetime.now().isoformat(), 'event': 'callback_after_timeout'}]
                payment.save()
                return payment
            
            # Save callback
            MpesaCallback.objects.create(
                payment=payment,
                body=callback_data
            )
            
            # Update payment status
            if result_code == 0:
                payment.status = 'completed'
                payment.mpesa_code = stk_callback.get('CallbackMetadata', {}).get('Item', [{}])[4].get('Value')
                
                # Auto-register user
                if not payment.user.is_registered:
                    payment.user.is_registered = True
                    payment.user.is_verified = True
                    payment.user.save()
            else:
                payment.status = 'failed'
            
            payment.callback_metadata = callback_data
            payment.save()
            
            return payment
        except Exception as e:
            raise Exception(f"Callback processing failed: {str(e)}")

