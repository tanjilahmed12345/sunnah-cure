from django.urls import path

from .views import (
    InitiatePaymentView,
    PaymentDetailView,
    PaymentListByAppointmentView,
    StripeWebhookView,
)

urlpatterns = [
    path("initiate/", InitiatePaymentView.as_view(), name="payment-initiate"),
    path("webhook/", StripeWebhookView.as_view(), name="payment-webhook"),
    path("", PaymentListByAppointmentView.as_view(), name="payment-list"),
    path("<uuid:pk>/", PaymentDetailView.as_view(), name="payment-detail"),
]
