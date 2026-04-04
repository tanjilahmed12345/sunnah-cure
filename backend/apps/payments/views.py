import logging
from datetime import datetime

import stripe
from django.conf import settings
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.appointments.models import Appointment

from .models import Payment
from .serializers import InitiatePaymentSerializer, PaymentSerializer

logger = logging.getLogger(__name__)


def _success(data=None, message="", status_code=status.HTTP_200_OK):
    return Response(
        {"success": True, "data": data, "message": message},
        status=status_code,
    )


class InitiatePaymentView(APIView):
    def post(self, request):
        serializer = InitiatePaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        appointment_id = serializer.validated_data["appointmentId"]
        method = serializer.validated_data["method"]

        try:
            appointment = Appointment.objects.get(
                pk=appointment_id, patient=request.user
            )
        except Appointment.DoesNotExist:
            return Response(
                {"success": False, "error": {"code": "NOT_FOUND", "message": "Appointment not found."}},
                status=status.HTTP_404_NOT_FOUND,
            )

        amount = appointment.payment_amount or 0

        payment = Payment.objects.create(
            appointment=appointment,
            patient=request.user,
            amount_bdt=amount,
            method=method,
        )

        response_data = PaymentSerializer(payment).data

        # For Stripe payments, create a PaymentIntent
        if method == "stripe" and settings.STRIPE_SECRET_KEY:
            stripe.api_key = settings.STRIPE_SECRET_KEY
            try:
                intent = stripe.PaymentIntent.create(
                    amount=int(float(amount) * 100),  # Convert to paisa/cents
                    currency="bdt",
                    metadata={
                        "payment_id": str(payment.id),
                        "appointment_id": str(appointment_id),
                    },
                )
                payment.stripe_payment_intent_id = intent.id
                payment.save(update_fields=["stripe_payment_intent_id"])
                response_data["clientSecret"] = intent.client_secret
            except stripe.error.StripeError as e:
                logger.error(f"Stripe error: {e}")
                payment.status = "failed"
                payment.save(update_fields=["status"])
                return Response(
                    {"success": False, "error": {"code": "PAYMENT_ERROR", "message": str(e)}},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        else:
            # For non-Stripe methods, mark as completed immediately
            # (simulating mobile payment gateway)
            payment.status = "completed"
            payment.transaction_id = f"TXN-{method.upper()}-{int(datetime.now().timestamp())}"
            payment.paid_at = timezone.now()
            payment.save(update_fields=["status", "transaction_id", "paid_at"])

            # Update appointment payment status
            appointment.payment_status = "paid"
            appointment.save(update_fields=["payment_status", "updated_at"])

            response_data = PaymentSerializer(payment).data

        return _success(
            data=response_data,
            message="Payment initiated.",
            status_code=status.HTTP_201_CREATED,
        )


class PaymentDetailView(APIView):
    def get(self, request, pk):
        try:
            payment = Payment.objects.select_related("appointment", "patient").get(pk=pk)
        except Payment.DoesNotExist:
            return Response(
                {"success": False, "error": {"code": "NOT_FOUND", "message": "Not found."}},
                status=status.HTTP_404_NOT_FOUND,
            )

        user = request.user
        if user.role == "PATIENT" and payment.patient != user:
            return Response(
                {"success": False, "error": {"code": "FORBIDDEN", "message": "Not allowed."}},
                status=status.HTTP_403_FORBIDDEN,
            )

        return _success(data=PaymentSerializer(payment).data)


class PaymentListByAppointmentView(APIView):
    def get(self, request):
        appointment_id = request.query_params.get("appointment")
        if not appointment_id:
            return Response(
                {"success": False, "error": {"code": "BAD_REQUEST", "message": "appointment param required."}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        payments = Payment.objects.filter(appointment_id=appointment_id)

        user = request.user
        if user.role == "PATIENT":
            payments = payments.filter(patient=user)

        data = PaymentSerializer(payments, many=True).data
        return _success(data=data)


class StripeWebhookView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        payload = request.body
        sig_header = request.META.get("HTTP_STRIPE_SIGNATURE")

        if not settings.STRIPE_WEBHOOK_SECRET:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except (ValueError, stripe.error.SignatureVerificationError) as e:
            logger.error(f"Stripe webhook error: {e}")
            return Response(status=status.HTTP_400_BAD_REQUEST)

        if event["type"] == "payment_intent.succeeded":
            intent = event["data"]["object"]
            payment_id = intent["metadata"].get("payment_id")
            if payment_id:
                try:
                    payment = Payment.objects.get(pk=payment_id)
                    payment.status = "completed"
                    payment.paid_at = timezone.now()
                    payment.save(update_fields=["status", "paid_at", "updated_at"])

                    appointment = payment.appointment
                    appointment.payment_status = "paid"
                    appointment.save(update_fields=["payment_status", "updated_at"])
                except Payment.DoesNotExist:
                    logger.error(f"Payment {payment_id} not found for webhook.")

        elif event["type"] == "payment_intent.payment_failed":
            intent = event["data"]["object"]
            payment_id = intent["metadata"].get("payment_id")
            if payment_id:
                try:
                    payment = Payment.objects.get(pk=payment_id)
                    payment.status = "failed"
                    payment.save(update_fields=["status", "updated_at"])
                except Payment.DoesNotExist:
                    pass

        return Response({"received": True}, status=status.HTTP_200_OK)
