from rest_framework import serializers

from apps.users.serializers import DoctorProfileSerializer, UserSerializer

from .models import Appointment


class AppointmentSerializer(serializers.ModelSerializer):
    patientId = serializers.UUIDField(source="patient.id", read_only=True)
    patient = UserSerializer(read_only=True)
    doctorId = serializers.UUIDField(source="doctor.id", read_only=True, allow_null=True)
    doctor = serializers.SerializerMethodField()
    serviceType = serializers.CharField(source="service_type")
    serviceName = serializers.CharField(source="service_name", read_only=True)
    scheduledDate = serializers.DateField(source="scheduled_date", required=False, allow_null=True)
    scheduledTime = serializers.TimeField(source="scheduled_time", required=False, allow_null=True)
    paymentStatus = serializers.CharField(source="payment_status", read_only=True)
    paymentAmount = serializers.DecimalField(
        source="payment_amount", max_digits=10, decimal_places=2,
        required=False, allow_null=True,
    )
    serviceData = serializers.JSONField(source="service_data", required=False, allow_null=True)
    adminNotes = serializers.CharField(source="admin_notes", required=False, default="")
    rejectionReason = serializers.CharField(source="rejection_reason", read_only=True)
    assessmentData = serializers.JSONField(
        source="assessment_data", required=False, allow_null=True
    )
    chatEnabled = serializers.BooleanField(source="chat_enabled", read_only=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)

    class Meta:
        model = Appointment
        fields = [
            "id", "patientId", "patient", "doctorId", "doctor",
            "serviceType", "serviceName", "status", "mode",
            "scheduledDate", "scheduledTime", "paymentStatus", "paymentAmount",
            "serviceData", "adminNotes", "rejectionReason",
            "assessmentData", "chatEnabled", "createdAt", "updatedAt",
        ]
        read_only_fields = [
            "id", "patientId", "patient", "doctorId", "doctor",
            "serviceName", "status", "paymentStatus", "rejectionReason",
            "chatEnabled", "createdAt", "updatedAt",
        ]

    def get_doctor(self, obj):
        if obj.doctor and hasattr(obj.doctor, "doctor_profile"):
            return DoctorProfileSerializer(obj.doctor.doctor_profile).data
        return None


class CreateAppointmentSerializer(serializers.Serializer):
    serviceType = serializers.ChoiceField(choices=["hijama", "ruqyah", "counseling", "assessment"])
    mode = serializers.ChoiceField(choices=["online", "offline"])
    serviceData = serializers.JSONField(required=False, allow_null=True)
    assessmentData = serializers.JSONField(required=False, allow_null=True)

    def create(self, validated_data):
        from apps.services.models import Service

        service_type = validated_data["serviceType"]
        try:
            service = Service.objects.get(type=service_type, is_active=True)
        except Service.DoesNotExist:
            raise serializers.ValidationError({"serviceType": "Service not found or inactive."})

        mode = validated_data["mode"]
        payment_amount = service.price_bdt
        if service.mode_pricing:
            if mode == "online" and service.mode_pricing.get("onlinePriceBDT"):
                payment_amount = service.mode_pricing["onlinePriceBDT"]
            elif mode == "offline" and service.mode_pricing.get("offlinePriceBDT"):
                payment_amount = service.mode_pricing["offlinePriceBDT"]

        if service_type == "hijama" and service.hijama_pricing and validated_data.get("serviceData"):
            cups = validated_data["serviceData"].get("numberOfCups", 0)
            price_per_cup = service.hijama_pricing.get("pricePerCup", 0)
            min_cups = service.hijama_pricing.get("minCups", 0)
            payment_amount = max(cups, min_cups) * price_per_cup

        user = self.context["request"].user
        appointment = Appointment.objects.create(
            patient=user,
            service_type=service_type,
            service_name=service.name,
            mode=mode,
            payment_amount=payment_amount,
            service_data=validated_data.get("serviceData"),
            assessment_data=validated_data.get("assessmentData"),
        )
        return appointment
