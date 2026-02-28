"""
Custom permissions: only users with role 'admin' are allowed to access the API.
"""
from rest_framework import permissions


class AdminRoleRequired(permissions.BasePermission):
    """
    Allow access only to authenticated users whose role is 'admin'.
    """
    message = "Only users with the admin role can access this resource."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return getattr(request.user, "role", None) == "admin"
