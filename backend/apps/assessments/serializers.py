from rest_framework import serializers

from .models import HealthAssessment


class AssessmentSerializer(serializers.ModelSerializer):
    patientId = serializers.UUIDField(source="patient.id", read_only=True)
    patientName = serializers.CharField(source="patient_name", read_only=True)
    formData = serializers.JSONField(source="form_data")
    assignedDoctorId = serializers.UUIDField(
        source="assigned_doctor.id", read_only=True, allow_null=True
    )
    assignedDoctorName = serializers.CharField(source="assigned_doctor_name", read_only=True)
    adminNotes = serializers.CharField(source="admin_notes", required=False, default="")
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)

    class Meta:
        model = HealthAssessment
        fields = [
            "id", "patientId", "patientName", "formData", "status",
            "assignedDoctorId", "assignedDoctorName", "adminNotes",
            "createdAt", "updatedAt",
        ]
        read_only_fields = ["id", "patientId", "patientName", "createdAt", "updatedAt"]


class CreateAssessmentSerializer(serializers.Serializer):
    formData = serializers.JSONField()

    def validate_formData(self, value):
        required_steps = ["step1", "step2", "step3", "step4"]
        for step in required_steps:
            if step not in value:
                raise serializers.ValidationError(f"Missing {step} data.")
        return value

    def create(self, validated_data):
        user = self.context["request"].user
        return HealthAssessment.objects.create(
            patient=user,
            patient_name=user.name,
            form_data=validated_data["formData"],
        )
