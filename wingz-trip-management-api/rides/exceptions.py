"""
Centralized API exception handling so responses are consistent and safe.
"""
import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)


def api_exception_handler(exc, context):
    """
    Custom handler: delegate to DRF's handler first, then normalize response.
    Avoids leaking stack traces or internal details in production.
    """
    response = exception_handler(exc, context)
    if response is not None:
        return response
    logger.exception("Unhandled exception in API: %s", exc)
    return Response(
        {"detail": "An unexpected error occurred. Please try again later."},
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
