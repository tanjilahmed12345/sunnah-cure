from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from apps.appointments.models import Appointment
from apps.users.models import User

from .models import Conversation


def _get_or_create_conversation(appointment, *participants):
    """Get existing conversation for this appointment with these participants, or create one."""
    convs = Conversation.objects.filter(appointment=appointment)
    participant_ids = {p.id for p in participants}
    for conv in convs:
        if set(conv.participants.values_list("id", flat=True)) == participant_ids:
            return conv
    conv = Conversation.objects.create(appointment=appointment)
    conv.participants.set(participants)
    return conv


@receiver(pre_save, sender=Appointment)
def track_old_doctor(sender, instance, **kwargs):
    """Track the old doctor before save so we can detect assignment changes."""
    if instance.pk:
        try:
            old = Appointment.objects.get(pk=instance.pk)
            instance._old_doctor_id = old.doctor_id
        except Appointment.DoesNotExist:
            instance._old_doctor_id = None
    else:
        instance._old_doctor_id = None


@receiver(post_save, sender=Appointment)
def auto_create_conversations(sender, instance, created, **kwargs):
    """
    - On creation: create a conversation between patient and admin(s).
    - On doctor assignment: create a conversation between patient and doctor.
    """
    if created:
        # Create patient <-> admin conversation
        admins = User.objects.filter(role="ADMIN")
        for admin in admins:
            _get_or_create_conversation(instance, instance.patient, admin)

    # Doctor was assigned or changed
    old_doctor_id = getattr(instance, "_old_doctor_id", None)
    if instance.doctor_id and instance.doctor_id != old_doctor_id:
        _get_or_create_conversation(instance, instance.patient, instance.doctor)
