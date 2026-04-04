import uuid

from django.conf import settings
from django.db import models


class HealthAssessment(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        REVIEWED = "reviewed", "Reviewed"
        ASSIGNED = "assigned", "Assigned"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="assessments",
    )
    patient_name = models.CharField(max_length=255)
    form_data = models.JSONField(help_text="4-step assessment form data (step1-4)")
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    assigned_doctor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_assessments",
    )
    assigned_doctor_name = models.CharField(max_length=255, blank=True, default="")
    admin_notes = models.TextField(blank=True, default="")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "health_assessments"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Assessment — {self.patient_name} ({self.status})"
