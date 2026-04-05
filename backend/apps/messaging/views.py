from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.models import User

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


class GetOrCreateConversationView(APIView):
    """
    POST { appointmentId?: uuid, participantId?: uuid }
    Returns an existing conversation or creates one.
    - If appointmentId is provided: conversation scoped to that appointment.
    - If participantId is provided: general conversation with that user.
    """

    def post(self, request):
        from apps.appointments.models import Appointment

        appointment_id = request.data.get("appointmentId")
        participant_id = request.data.get("participantId")

        if appointment_id:
            try:
                appointment = Appointment.objects.get(pk=appointment_id)
            except Appointment.DoesNotExist:
                return Response(
                    {"success": False, "error": {"code": "NOT_FOUND", "message": "Appointment not found."}},
                    status=status.HTTP_404_NOT_FOUND,
                )

            # Determine the other participant based on role
            user = request.user
            if user.role == "ADMIN":
                other = appointment.patient
            elif user.role == "DOCTOR":
                other = appointment.patient
            else:
                # Patient — find an admin participant
                admin = User.objects.filter(role="ADMIN").first()
                other = admin

            if not other:
                return Response(
                    {"success": False, "error": {"code": "BAD_REQUEST", "message": "No participant found."}},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            participant_ids = {user.id, other.id}
            # Look for existing conversation for this appointment
            for conv in Conversation.objects.filter(appointment=appointment).prefetch_related("participants"):
                if set(conv.participants.values_list("id", flat=True)) == participant_ids:
                    data = ConversationSerializer(conv, context={"request": request}).data
                    return _success(data=data)

            # Create new
            conv = Conversation.objects.create(appointment=appointment)
            conv.participants.set([user, other])
            data = ConversationSerializer(conv, context={"request": request}).data
            return _success(data=data, status_code=status.HTTP_201_CREATED)

        elif participant_id:
            try:
                other = User.objects.get(pk=participant_id)
            except User.DoesNotExist:
                return Response(
                    {"success": False, "error": {"code": "NOT_FOUND", "message": "User not found."}},
                    status=status.HTTP_404_NOT_FOUND,
                )

            user = request.user
            participant_ids = {user.id, other.id}
            for conv in Conversation.objects.filter(appointment__isnull=True).prefetch_related("participants"):
                if set(conv.participants.values_list("id", flat=True)) == participant_ids:
                    data = ConversationSerializer(conv, context={"request": request}).data
                    return _success(data=data)

            conv = Conversation.objects.create()
            conv.participants.set([user, other])
            data = ConversationSerializer(conv, context={"request": request}).data
            return _success(data=data, status_code=status.HTTP_201_CREATED)

        return Response(
            {"success": False, "error": {"code": "BAD_REQUEST", "message": "appointmentId or participantId required."}},
            status=status.HTTP_400_BAD_REQUEST,
        )


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
            conversation = Conversation.objects.select_related("appointment").get(
                pk=conversation_id, participants=request.user
            )
        except Conversation.DoesNotExist:
            return Response(
                {"success": False, "error": {"code": "NOT_FOUND", "message": "Not found."}},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Doctors can only send messages if chat is enabled for this appointment
        if (
            request.user.role == "DOCTOR"
            and conversation.appointment
            and not conversation.appointment.chat_enabled
        ):
            return Response(
                {"success": False, "error": {"code": "FORBIDDEN", "message": "Chat is not enabled for this appointment."}},
                status=status.HTTP_403_FORBIDDEN,
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
