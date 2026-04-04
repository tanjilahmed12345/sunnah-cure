from rest_framework import serializers

from .models import Service


class ServiceSerializer(serializers.ModelSerializer):
    nameBn = serializers.CharField(source="name_bn", read_only=True)
    descriptionBn = serializers.CharField(source="description_bn", read_only=True)
    fullDescription = serializers.CharField(source="full_description", read_only=True)
    fullDescriptionBn = serializers.CharField(source="full_description_bn", read_only=True)
    durationMinutes = serializers.IntegerField(source="duration_minutes", read_only=True)
    priceBDT = serializers.DecimalField(
        source="price_bdt", max_digits=10, decimal_places=2, read_only=True
    )
    isActive = serializers.BooleanField(source="is_active", read_only=True)
    isOnline = serializers.BooleanField(source="is_online", read_only=True)
    isOffline = serializers.BooleanField(source="is_offline", read_only=True)
    iconName = serializers.CharField(source="icon_name", read_only=True)
    imageUrl = serializers.URLField(source="image_url", read_only=True)
    benefitsBn = serializers.JSONField(source="benefits_bn", read_only=True)
    whatToExpect = serializers.JSONField(source="what_to_expect", read_only=True)
    whatToExpectBn = serializers.JSONField(source="what_to_expect_bn", read_only=True)
    hijamaPricing = serializers.JSONField(source="hijama_pricing", read_only=True)
    modePricing = serializers.JSONField(source="mode_pricing", read_only=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)

    class Meta:
        model = Service
        fields = [
            "id", "type", "slug", "name", "nameBn", "description", "descriptionBn",
            "fullDescription", "fullDescriptionBn", "durationMinutes", "priceBDT",
            "isActive", "isOnline", "isOffline", "iconName", "imageUrl",
            "benefits", "benefitsBn", "whatToExpect", "whatToExpectBn",
            "hijamaPricing", "modePricing", "createdAt", "updatedAt",
        ]


class ServiceUpdateSerializer(serializers.ModelSerializer):
    """Admin-only serializer for updating service settings."""

    class Meta:
        model = Service
        fields = [
            "description", "description_bn", "price_bdt", "is_active",
            "is_online", "is_offline", "duration_minutes",
            "hijama_pricing", "mode_pricing",
        ]
