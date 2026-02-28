"""Django admin for Ride, User, and RideEvent (for dev and data inspection)."""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import AppUser, Ride, RideEvent


@admin.register(AppUser)
class AppUserAdmin(BaseUserAdmin):
    list_display = ("id_user", "email", "first_name", "last_name", "role", "is_active")
    list_filter = ("role", "is_active")
    search_fields = ("email", "first_name", "last_name")
    ordering = ("email",)
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Profile", {"fields": ("first_name", "last_name", "phone_number", "role")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser")}),
    )
    add_fieldsets = (
        (None, {"classes": ("wide",), "fields": ("email", "password1", "password2")}),
        ("Profile", {"fields": ("first_name", "last_name", "phone_number", "role")}),
    )


@admin.register(Ride)
class RideAdmin(admin.ModelAdmin):
    list_display = ("id_ride", "status", "id_rider", "id_driver", "pickup_time")
    list_filter = ("status",)
    raw_id_fields = ("id_rider", "id_driver")
    date_hierarchy = "pickup_time"


@admin.register(RideEvent)
class RideEventAdmin(admin.ModelAdmin):
    list_display = ("id_ride_event", "id_ride", "description", "created_at")
    list_filter = ("created_at",)
    raw_id_fields = ("id_ride",)
    date_hierarchy = "created_at"
