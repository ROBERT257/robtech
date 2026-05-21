from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, RegisterSerializer, CustomTokenObtainPairSerializer

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        # Lightweight debug logs to capture incoming payloads and validation errors
        try:
            print('DEBUG /api/auth/register payload:', request.data)
        except Exception:
            pass

        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            try:
                print('DEBUG /api/auth/register errors:', serializer.errors)
            except Exception:
                pass
            return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.save()
        try:
            print('DEBUG /api/auth/register success user_id:', user.id)
        except Exception:
            pass

        return Response({
            'user': UserSerializer(user).data,
            'message': 'Registration successful. Please complete payment to activate your account.'
        }, status=status.HTTP_201_CREATED)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        try:
            print('DEBUG /api/auth/profile request by user:', getattr(self.request.user, 'id', None))
        except Exception:
            pass
        return self.request.user


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """Get user dashboard statistics"""
    user = request.user
    referral_count = user.referrals.filter(is_registered=True).count()
    
    return Response({
        'wallet_balance': str(user.wallet_balance),
        'is_registered': user.is_registered,
        'is_verified': user.is_verified,
        'referral_code': user.referral_code,
        'referral_count': referral_count,
        'last_claim': user.last_claim,
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def logout(request):
    """Revoke the refresh token if provided and end the client session safely."""
    refresh_token = request.data.get('refresh_token')
    revoked = False

    if refresh_token:
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            revoked = True
        except TokenError:
            revoked = False
        except Exception:
            revoked = False

    return Response(
        {
            'message': 'Session ended successfully',
            'revoked': revoked,
        },
        status=status.HTTP_200_OK,
    )
