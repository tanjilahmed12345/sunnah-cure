import uuid

from django.conf import settings
from django.db import models
from django_fsm import FSMField, transition


class Appointment(models.Model):
    class ServiceType(models.TextChoices):
        HIJAMA = "hijama", "Hijama"
        RUQYAH = "ruqyah", "Ruqyah"
        COUNSELING = "counseling", "Counseling"
        ASSESSMENT = "assessment", "Assessment"

    class Mode(models.TextChoices):
        ONLINE = "online", "Online"
        OFFLINE = "offline", "Offline"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"
        REJECTED = "rejected", "Rejected"

    class PaymentStatus(models.TextChoices):
        PAID = "paid", "Paid"
        UNPAID = "unpaid", "Unpaid"
        PENDING = "pending", "Pending"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="patient_appointments",
    )
    doctor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="doctor_appointments",
    )
    service_type = models.CharField(max_length=20, choices=ServiceType.choices)
    service_name = models.CharField(max_length=255)
    status = FSMField(default=Status.PENDING, choices=Status.choices)
    mode = models.CharField(max_length=10, choices=Mode.choices)
    scheduled_date = models.DateField(null=True, blank=True)
    scheduled_time = models.TimeField(null=True, blank=True)
    payment_status = models.CharField(
        max_length=10, choices=PaymentStatus.choices, default=PaymentStatus.UNPAID
    )
    payment_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    service_data = models.JSONField(null=True, blank=True)
    admin_notes = models.TextField(blank=True, default="")
    rejection_reason = models.TextField(blank=True, default="")
    assessment_data = models.JSONField(null=True, blank=True)
    chat_enabled = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "appointments"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.patient.name} — {self.service_name} ({self.status})"

    # FSM transitions
    @transition(field=status, source=Status.PENDING, target=Status.APPROVED)
    def approve(self):
        pass

    @transition(field=status, source=Status.PENDING, target=Status.REJECTED)
    def reject(self):
        pass

    @transition(field=status, source=Status.APPROVED, target=Status.COMPLETED)
    def complete(self):
        pass

    @transition(field=status, source=[Status.PENDING, Status.APPROVED], target=Status.CANCELLED)
    def cancel(self):
        pass
