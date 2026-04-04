from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import DoctorProfile, User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("phone", "name", "role", "gender", "is_active", "date_joined")
    list_filter = ("role", "gender", "is_active")
    search_fields = ("phone", "name")
    ordering = ("-date_joined",)

    fieldsets = (
        (None, {"fields": ("phone", "password")}),
        ("Personal Info", {"fields": ("name", "gender", "age", "address", "avatar_url")}),
        ("Permissions", {"fields": ("role", "is_active", "is_staff", "is_superuser")}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("phone", "name", "password1", "password2", "role", "gender", "age"),
        }),
    )


@admin.register(DoctorProfile)
class DoctorProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "specialization", "experience_years", "approval_status")
    list_filter = ("specialization", "approval_status")
    search_fields = ("user__name", "user__phone")
