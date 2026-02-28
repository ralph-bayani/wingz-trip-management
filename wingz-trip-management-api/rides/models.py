"""
Ride, User, and RideEvent models.
Field names and types align with the provided table definitions.
"""
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin


class AppUserManager(BaseUserManager):
    """Manager for the custom user model; supports create_user and create_superuser."""

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("User must have an email address.")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("role", "admin")
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password=password, **extra_fields)


class AppUser(AbstractBaseUser, PermissionsMixin):
    """
    User table: id_user, role, first_name, last_name, email, phone_number.
    Used as rider and driver on Ride; only role='admin' can access the API.
    """
    class Role(models.TextChoices):
        ADMIN = "admin", "Admin"
        DRIVER = "driver", "Driver"
        RIDER = "rider", "Rider"

    id_user = models.AutoField(primary_key=True, db_column="id_user")
    role = models.CharField(max_length=50, choices=Role.choices)
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=50, blank=True)

    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    objects = AppUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name", "role"]

    class Meta:
        db_table = "rides_user"

    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip()


class Ride(models.Model):
    """
    Ride table: id_ride, status, id_rider, id_driver, pickup/dropoff coords, pickup_time.
    """
    class Status(models.TextChoices):
        EN_ROUTE = "en-route", "En route"
        PICKUP = "pickup", "Pickup"
        DROPOFF = "dropoff", "Dropoff"

    id_ride = models.AutoField(primary_key=True, db_column="id_ride")
    status = models.CharField(max_length=50, choices=Status.choices)
    id_rider = models.ForeignKey(
        AppUser,
        on_delete=models.CASCADE,
        related_name="rides_as_rider",
        db_column="id_rider",
    )
    id_driver = models.ForeignKey(
        AppUser,
        on_delete=models.CASCADE,
        related_name="rides_as_driver",
        db_column="id_driver",
    )
    pickup_latitude = models.FloatField()
    pickup_longitude = models.FloatField()
    dropoff_latitude = models.FloatField(null=True, blank=True)
    dropoff_longitude = models.FloatField(null=True, blank=True)
    pickup_time = models.DateTimeField()

    class Meta:
        db_table = "rides_ride"
        ordering = ["-pickup_time"]


class RideEvent(models.Model):
    """
    Ride_Event table: id_ride_event, id_ride, description, created_at.
    """
    id_ride_event = models.AutoField(primary_key=True, db_column="id_ride_event")
    id_ride = models.ForeignKey(
        Ride,
        on_delete=models.CASCADE,
        related_name="ride_events",
        db_column="id_ride",
    )
    description = models.CharField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "rides_ride_event"
        ordering = ["created_at"]
