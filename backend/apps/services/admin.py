from django.contrib import admin

from .models import Service


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ("name", "type", "price_bdt", "is_active", "is_online", "is_offline")
    list_filter = ("type", "is_active")
    prepopulated_fields = {"slug": ("name",)}
