"""
Serializers for Ride, User, and RideEvent.
Expose the fields defined in the table spec and support nested rider/driver and todays_ride_events.
"""
from rest_framework import serializers
from .models import AppUser, Ride, RideEvent


class UserSerializer(serializers.ModelSerializer):
    """User (rider/driver) representation; id exposed as id_user."""

    class Meta:
        model = AppUser
        fields = ("id_user", "role", "first_name", "last_name", "email", "phone_number")
        read_only_fields = fields


class RideEventSerializer(serializers.ModelSerializer):
    """RideEvent for nesting; only recent events are loaded (todays_ride_events)."""

    class Meta:
        model = RideEvent
        fields = ("id_ride_event", "id_ride_id", "description", "created_at")
        read_only_fields = fields


class RideListSerializer(serializers.ModelSerializer):
    """
    Ride list item: includes id_rider and id_driver as nested user objects,
    and todays_ride_events (last 24h only). Expects prefetched/selected related data.
    """
    id_rider = UserSerializer(read_only=True)
    id_driver = UserSerializer(read_only=True)
    todays_ride_events = RideEventSerializer(many=True, read_only=True)

    class Meta:
        model = Ride
        fields = (
            "id_ride",
            "status",
            "id_rider",
            "id_driver",
            "pickup_latitude",
            "pickup_longitude",
            "dropoff_latitude",
            "dropoff_longitude",
            "pickup_time",
            "todays_ride_events",
        )
        read_only_fields = fields


class RideDetailSerializer(RideListSerializer):
    """Same as list; use if we add more fields later for retrieve."""
    pass
