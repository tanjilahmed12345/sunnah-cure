from rest_framework import serializers

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    userId = serializers.UUIDField(source="user.id", read_only=True)
    isRead = serializers.BooleanField(source="is_read", read_only=True)
    actionUrl = serializers.CharField(source="action_url", read_only=True, allow_null=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)

    class Meta:
        model = Notification
        fields = [
            "id", "userId", "type", "title", "body",
            "isRead", "actionUrl", "createdAt", "updatedAt",
        ]
