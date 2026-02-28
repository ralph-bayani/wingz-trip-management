"""
Ride ViewSet: list (and optionally retrieve) with pagination, filtering, and sorting.
Queryset is optimized for 2–3 queries total (rides with rider/driver, todays_ride_events, and count).
"""
from rest_framework import viewsets

from .models import Ride
from .serializers import RideListSerializer
from .filters import RideFilter, build_ride_queryset, annotate_distance_to_pickup


class RideViewSet(viewsets.ReadOnlyModelViewSet):
    """
    List and retrieve rides. Only admin users can access.
    Supports pagination, filtering (status, rider_email), and ordering (pickup_time, distance_to_pickup).
    Distance ordering is applied only when latitude and longitude are provided; otherwise falls back to pickup_time.
    """
    serializer_class = RideListSerializer
    filterset_class = RideFilter
    # Only pickup_time is handled by OrderingFilter; distance_to_pickup is applied in get_queryset when lat/lon present
    ordering_fields = ["pickup_time"]
    ordering = ["-pickup_time"]

    def get_queryset(self):
        qs = build_ride_queryset(self.request.query_params)

        sort_param = self.request.query_params.get("ordering", "").strip()
        if sort_param in ("distance_to_pickup", "-distance_to_pickup"):
            lat = self.request.query_params.get("latitude")
            lon = self.request.query_params.get("longitude")
            if lat is not None and lon is not None:
                try:
                    lat_f = float(lat)
                    lon_f = float(lon)
                except (TypeError, ValueError):
                    pass
                else:
                    qs = annotate_distance_to_pickup(qs, lat_f, lon_f)
                    if sort_param == "distance_to_pickup":
                        qs = qs.order_by("distance_to_pickup_sq")
                    else:
                        qs = qs.order_by("-distance_to_pickup_sq")
                    return qs
            return qs.order_by("-pickup_time")

        return qs
