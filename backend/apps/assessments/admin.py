from django.contrib import admin

from .models import HealthAssessment


@admin.register(HealthAssessment)
class HealthAssessmentAdmin(admin.ModelAdmin):
    list_display = ("patient_name", "status", "assigned_doctor_name", "created_at")
    list_filter = ("status",)
    search_fields = ("patient_name", "patient__phone")
    readonly_fields = ("id", "created_at", "updated_at")
