"""
Filtering and ordering for the Ride list API.
- Filter by: status, rider email.
- Order by: pickup_time, distance_to_pickup (requires lat/lon query params).
Both ordering options are implemented at the database level for large tables.
"""
from django.db.models import F, ExpressionWrapper, FloatField, Value
from django.db.models.functions import Power
from django.utils import timezone
from django.db.models import Prefetch
from django_filters import rest_framework as filters
from .models import Ride, RideEvent


def get_todays_ride_events_queryset():
    """RideEvents created in the last 24 hours only. Used for prefetch."""
    cutoff = timezone.now() - timezone.timedelta(hours=24)
    return RideEvent.objects.filter(created_at__gte=cutoff).order_by("created_at")


def build_ride_queryset(filters_dict):
    """
    Build the base Ride queryset with select_related and prefetch for todays_ride_events.
    Keeps query count to 2 (rides + todays_ride_events) plus optional count query for pagination.
    """
    qs = (
        Ride.objects.select_related("id_rider", "id_driver")
        .prefetch_related(
            Prefetch(
                "ride_events",
                queryset=get_todays_ride_events_queryset(),
                to_attr="todays_ride_events",
            )
        )
    )
    return qs


class RideFilter(filters.FilterSet):
    """Filter rides by status and rider email."""

    status = filters.CharFilter(field_name="status", lookup_expr="iexact")
    rider_email = filters.CharFilter(field_name="id_rider__email", lookup_expr="iexact")

    class Meta:
        model = Ride
        fields = ["status", "rider_email"]


def annotate_distance_to_pickup(queryset, latitude, longitude):
    """
    Annotate each ride with squared distance from (latitude, longitude) to pickup.
    Sorting by this gives distance-based order; we use squared distance to avoid sqrt
    and keep it DB-portable (SQLite and PostgreSQL).
    """
    lat = Value(float(latitude), output_field=FloatField())
    lon = Value(float(longitude), output_field=FloatField())
    distance_sq = ExpressionWrapper(
        Power(F("pickup_latitude") - lat, 2) + Power(F("pickup_longitude") - lon, 2),
        output_field=FloatField(),
    )
    return queryset.annotate(distance_to_pickup_sq=distance_sq)
