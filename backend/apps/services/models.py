import uuid

from django.db import models


class Service(models.Model):
    class ServiceType(models.TextChoices):
        HIJAMA = "hijama", "Hijama"
        RUQYAH = "ruqyah", "Ruqyah"
        COUNSELING = "counseling", "Counseling"
        ASSESSMENT = "assessment", "Assessment"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    type = models.CharField(max_length=20, choices=ServiceType.choices, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    name = models.CharField(max_length=255)
    name_bn = models.CharField(max_length=255, blank=True, default="")
    description = models.TextField()
    description_bn = models.TextField(blank=True, default="")
    full_description = models.TextField(blank=True, default="")
    full_description_bn = models.TextField(blank=True, default="")
    duration_minutes = models.PositiveIntegerField(default=60)
    price_bdt = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    is_online = models.BooleanField(default=True)
    is_offline = models.BooleanField(default=True)
    icon_name = models.CharField(max_length=50, blank=True, default="")
    image_url = models.URLField(blank=True, default="")

    benefits = models.JSONField(default=list)
    benefits_bn = models.JSONField(default=list)
    what_to_expect = models.JSONField(default=list)
    what_to_expect_bn = models.JSONField(default=list)

    hijama_pricing = models.JSONField(null=True, blank=True)
    mode_pricing = models.JSONField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "services"
        ordering = ["name"]

    def __str__(self):
        return self.name
