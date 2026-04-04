from django.contrib import admin

from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("patient", "amount_bdt", "method", "status", "transaction_id", "paid_at")
    list_filter = ("status", "method")
    search_fields = ("patient__name", "transaction_id")
    readonly_fields = ("id", "created_at", "updated_at")
