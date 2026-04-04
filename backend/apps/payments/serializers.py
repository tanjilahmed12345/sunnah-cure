from rest_framework import serializers

from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    appointmentId = serializers.UUIDField(source="appointment.id", read_only=True)
    patientId = serializers.UUIDField(source="patient.id", read_only=True)
    amountBDT = serializers.DecimalField(
        source="amount_bdt", max_digits=10, decimal_places=2, read_only=True
    )
    transactionId = serializers.CharField(source="transaction_id", read_only=True, allow_null=True)
    paidAt = serializers.DateTimeField(source="paid_at", read_only=True, allow_null=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)

    class Meta:
        model = Payment
        fields = [
            "id", "appointmentId", "patientId", "amountBDT",
            "method", "status", "transactionId", "paidAt",
            "createdAt", "updatedAt",
        ]


class InitiatePaymentSerializer(serializers.Serializer):
    appointmentId = serializers.UUIDField()
    method = serializers.ChoiceField(
        choices=["bkash", "nagad", "rocket", "paypal", "stripe", "card", "cash", "bank"]
    )
    phoneNumber = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
