"""Pagination: page size can be set via query param for the ride list."""
from rest_framework.pagination import PageNumberPagination


class RideListPagination(PageNumberPagination):
    """Page number pagination with configurable page size via query param."""
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100
