from rest_framework import serializers

from apps.users.serializers import UserSerializer

from .models import Conversation, Message


class MessageSerializer(serializers.ModelSerializer):
    conversationId = serializers.UUIDField(source="conversation.id", read_only=True)
    senderId = serializers.UUIDField(source="sender.id", read_only=True)
    senderName = serializers.CharField(source="sender_name", read_only=True)
    senderRole = serializers.CharField(source="sender_role", read_only=True)
    isRead = serializers.BooleanField(source="is_read", read_only=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)

    class Meta:
        model = Message
        fields = [
            "id", "conversationId", "senderId", "senderName", "senderRole",
            "content", "isRead", "createdAt", "updatedAt",
        ]


class ParticipantSerializer(serializers.Serializer):
    userId = serializers.UUIDField(source="id")
    name = serializers.CharField()
    role = serializers.CharField()
    avatarUrl = serializers.URLField(source="avatar_url", allow_null=True)


class ConversationSerializer(serializers.ModelSerializer):
    participants = serializers.SerializerMethodField()
    lastMessage = serializers.SerializerMethodField()
    unreadCount = serializers.SerializerMethodField()
    appointmentId = serializers.UUIDField(source="appointment.id", read_only=True, allow_null=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)

    class Meta:
        model = Conversation
        fields = [
            "id", "participants", "lastMessage", "unreadCount",
            "appointmentId", "createdAt", "updatedAt",
        ]

    def get_participants(self, obj):
        return ParticipantSerializer(obj.participants.all(), many=True).data

    def get_lastMessage(self, obj):
        last = obj.messages.order_by("-created_at").first()
        if last:
            return MessageSerializer(last).data
        return None

    def get_unreadCount(self, obj):
        request = self.context.get("request")
        if not request or not hasattr(request, "user"):
            return 0
        user = request.user
        return obj.messages.filter(is_read=False).exclude(sender=user).count()
