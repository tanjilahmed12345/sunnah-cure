import uuid

from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models

from .managers import UserManager


class User(AbstractBaseUser, PermissionsMixin):
    class Role(models.TextChoices):
        PATIENT = "PATIENT", "Patient"
        DOCTOR = "DOCTOR", "Doctor"
        ADMIN = "ADMIN", "Admin"

    class Gender(models.TextChoices):
        MALE = "male", "Male"
        FEMALE = "female", "Female"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, unique=True)
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.PATIENT)
    gender = models.CharField(max_length=10, choices=Gender.choices)
    age = models.PositiveIntegerField(default=0)
    address = models.TextField(blank=True, default="")
    avatar_url = models.URLField(blank=True, null=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = "phone"
    REQUIRED_FIELDS = ["name"]

    class Meta:
        db_table = "users"
        ordering = ["-date_joined"]

    def __str__(self):
        return f"{self.name} ({self.phone})"


class DoctorProfile(models.Model):
    class Specialization(models.TextChoices):
        HIJAMA = "hijama_therapy", "Hijama Therapy"
        RUQYAH = "ruqyah_therapy", "Ruqyah Therapy"
        COUNSELING = "islamic_counseling", "Islamic Counseling"
        GENERAL = "general_wellness", "General Wellness"

    class ApprovalStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="doctor_profile")
    specialization = models.CharField(max_length=30, choices=Specialization.choices)
    designations = models.JSONField(default=list, help_text='e.g. ["raqi", "hajjam"]')
    qualifications = models.TextField(blank=True, default="")
    experience_years = models.PositiveIntegerField(default=0)
    bio = models.TextField(blank=True, default="")
    approval_status = models.CharField(
        max_length=10, choices=ApprovalStatus.choices, default=ApprovalStatus.PENDING
    )
    certificate_urls = models.JSONField(default=list)
    profile_picture_url = models.URLField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "doctor_profiles"

    def __str__(self):
        return f"Dr. {self.user.name} — {self.get_specialization_display()}"
