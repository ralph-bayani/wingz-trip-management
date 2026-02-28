"""
JWT token obtain view that uses email instead of username for login.
Our user model uses email as USERNAME_FIELD, so the token endpoint should accept email/password.
"""
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Use email as the identifying field instead of username."""
    username_field = "email"


class EmailTokenObtainPairView(TokenObtainPairView):
    """Obtain JWT access/refresh tokens by posting email and password."""
    serializer_class = EmailTokenObtainPairSerializer
