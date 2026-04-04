from django.contrib import admin

from .models import Appointment


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = (
        "patient", "service_type", "status", "mode",
        "scheduled_date", "payment_status", "created_at",
    )
    list_filter = ("status", "service_type", "mode", "payment_status")
    search_fields = ("patient__name", "patient__phone", "service_name")
    readonly_fields = ("id", "created_at", "updated_at")
