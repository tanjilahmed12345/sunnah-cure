from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from apps.appointments.models import Appointment
from apps.messaging.models import Message
from apps.payments.models import Payment
from apps.users.models import User

from .models import Notification


@receiver(pre_save, sender=Appointment)
def track_appointment_status_change(sender, instance, **kwargs):
    if instance.pk:
        try:
            old = Appointment.objects.get(pk=instance.pk)
            instance._old_status = old.status
        except Appointment.DoesNotExist:
            instance._old_status = None
    else:
        instance._old_status = None


@receiver(post_save, sender=Appointment)
def notify_appointment_status(sender, instance, created, **kwargs):
    old_status = getattr(instance, "_old_status", None)

    if created:
        # Notify all admins about new appointment request
        admins = User.objects.filter(role="ADMIN")
        for admin in admins:
            Notification.objects.create(
                user=admin,
                type="appointment_confirmed",
                title="New Appointment Request",
                body=f"{instance.patient.name} requested a {instance.service_name} appointment.",
                action_url=f"/dashboard/admin/appointments/{instance.id}",
            )
        return

    if old_status == "pending" and instance.status == "approved":
        Notification.objects.create(
            user=instance.patient,
            type="appointment_confirmed",
            title="Appointment Confirmed",
            body=f"Your {instance.service_name} appointment has been approved.",
            action_url=f"/dashboard/appointments/{instance.id}",
        )
    elif old_status == "pending" and instance.status == "rejected":
        Notification.objects.create(
            user=instance.patient,
            type="appointment_cancelled",
            title="Appointment Rejected",
            body=f"Your {instance.service_name} appointment has been rejected.",
            action_url=f"/dashboard/appointments/{instance.id}",
        )
    elif instance.status == "cancelled":
        Notification.objects.create(
            user=instance.patient,
            type="appointment_cancelled",
            title="Appointment Cancelled",
            body=f"Your {instance.service_name} appointment has been cancelled.",
            action_url=f"/dashboard/appointments/{instance.id}",
        )


@receiver(post_save, sender=Payment)
def notify_payment_completed(sender, instance, **kwargs):
    if instance.status == "completed":
        Notification.objects.create(
            user=instance.patient,
            type="payment_received",
            title="Payment Received",
            body=f"Payment of {instance.amount_bdt} BDT has been received.",
            action_url=f"/dashboard/appointments/{instance.appointment_id}",
        )


@receiver(post_save, sender=Message)
def notify_new_message(sender, instance, created, **kwargs):
    if not created:
        return

    conversation = instance.conversation
    recipients = conversation.participants.exclude(pk=instance.sender_id)
    for recipient in recipients:
        Notification.objects.create(
            user=recipient,
            type="new_message",
            title="New Message",
            body=f"{instance.sender_name}: {instance.content[:80]}",
            action_url="/dashboard/messages",
        )
