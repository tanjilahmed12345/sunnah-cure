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


def _get_or_create_general_conversation(*participants):
    """Get or create a general (non-appointment) conversation between participants."""
    participant_ids = {p.id for p in participants}
    # Look for an existing conversation with no appointment and exactly these participants
    for conv in Conversation.objects.filter(appointment__isnull=True):
        if set(conv.participants.values_list("id", flat=True)) == participant_ids:
            return conv
    conv = Conversation.objects.create()
    conv.participants.set(participants)
    return conv


# ---- User signals ----

@receiver(post_save, sender=User)
def create_patient_admin_conversation(sender, instance, created, **kwargs):
    """When a patient registers, create a general conversation with each admin."""
    if created and instance.role == "PATIENT":
        admins = User.objects.filter(role="ADMIN")
        for admin in admins:
            _get_or_create_general_conversation(instance, admin)


# ---- Appointment signals ----

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
def auto_create_appointment_conversations(sender, instance, created, **kwargs):
    """
    - On creation: create an appointment conversation between patient and admin(s).
    - On doctor assignment: create an appointment conversation between patient and doctor.
    """
    if created:
        admins = User.objects.filter(role="ADMIN")
        for admin in admins:
            _get_or_create_conversation(instance, instance.patient, admin)

    # Doctor was assigned or changed
    old_doctor_id = getattr(instance, "_old_doctor_id", None)
    if instance.doctor_id and instance.doctor_id != old_doctor_id:
        _get_or_create_conversation(instance, instance.patient, instance.doctor)
