from rest_framework import permissions


class IsAccountOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, ouruser):
        if request.user:
            return ouruser == request.user
        return False