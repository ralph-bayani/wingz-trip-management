"""API URL configuration for the rides app."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenRefreshView

from .views import RideViewSet
from .auth_views import EmailTokenObtainPairView


class PublicApiRootRouter(DefaultRouter):
    """Router whose API root view is public (no auth required) so users can discover endpoints."""
    def get_api_root_view(self, api_urls=None):
        view = super().get_api_root_view(api_urls=api_urls)
        view.cls.permission_classes = [AllowAny]
        return view


router = PublicApiRootRouter()
router.register(r"rides", RideViewSet, basename="ride")

urlpatterns = [
    path("", include(router.urls)),
    path("auth/token/", EmailTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
