from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Conversation, Message
from .pusher_client import trigger_new_message
from .serializers import ConversationSerializer, MessageSerializer


def _success(data=None, message="", status_code=status.HTTP_200_OK):
    return Response(
        {"success": True, "data": data, "message": message},
        status=status_code,
    )


class ConversationListView(APIView):
    def get(self, request):
        conversations = Conversation.objects.filter(
            participants=request.user
        ).prefetch_related("participants", "messages")
        data = ConversationSerializer(
            conversations, many=True, context={"request": request}
        ).data
        return _success(data=data)


class ConversationMessagesView(APIView):
    def get(self, request, conversation_id):
        try:
            conversation = Conversation.objects.get(
                pk=conversation_id, participants=request.user
            )
        except Conversation.DoesNotExist:
            return Response(
                {"success": False, "error": {"code": "NOT_FOUND", "message": "Not found."}},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Mark messages as read
        conversation.messages.filter(is_read=False).exclude(
            sender=request.user
        ).update(is_read=True)

        messages = conversation.messages.all()
        data = MessageSerializer(messages, many=True).data
        return _success(data=data)


class SendMessageView(APIView):
    def post(self, request, conversation_id):
        try:
            conversation = Conversation.objects.get(
                pk=conversation_id, participants=request.user
            )
        except Conversation.DoesNotExist:
            return Response(
                {"success": False, "error": {"code": "NOT_FOUND", "message": "Not found."}},
                status=status.HTTP_404_NOT_FOUND,
            )

        content = request.data.get("content", "").strip()
        if not content:
            return Response(
                {"success": False, "error": {"code": "BAD_REQUEST", "message": "Content required."}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        message = Message.objects.create(
            conversation=conversation,
            sender=request.user,
            sender_name=request.user.name,
            sender_role=request.user.role,
            content=content,
        )

        # Update conversation timestamp
        conversation.save(update_fields=["updated_at"])

        message_data = MessageSerializer(message).data

        # Trigger Pusher event
        trigger_new_message(str(conversation_id), message_data)

        return _success(
            data=message_data,
            message="Message sent.",
            status_code=status.HTTP_201_CREATED,
        )
