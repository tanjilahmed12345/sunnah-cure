import uuid

from django.conf import settings
from django.db import models


class Notification(models.Model):
    class Type(models.TextChoices):
        APPOINTMENT_CONFIRMED = "appointment_confirmed", "Appointment Confirmed"
        APPOINTMENT_CANCELLED = "appointment_cancelled", "Appointment Cancelled"
        PAYMENT_RECEIVED = "payment_received", "Payment Received"
        NEW_MESSAGE = "new_message", "New Message"
        DOCTOR_APPROVED = "doctor_approved", "Doctor Approved"
        ASSESSMENT_READY = "assessment_ready", "Assessment Ready"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    type = models.CharField(max_length=30, choices=Type.choices)
    title = models.CharField(max_length=255)
    body = models.TextField()
    is_read = models.BooleanField(default=False)
    action_url = models.CharField(max_length=500, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "notifications"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} → {self.user.name}"
