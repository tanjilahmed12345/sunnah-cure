from django.contrib import admin

from .models import Conversation, Message


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ("id", "appointment", "created_at")
    readonly_fields = ("id", "created_at", "updated_at")


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("sender_name", "sender_role", "content_preview", "is_read", "created_at")
    list_filter = ("is_read", "sender_role")
    search_fields = ("sender_name", "content")
    readonly_fields = ("id", "created_at", "updated_at")

    def content_preview(self, obj):
        return obj.content[:60]
    content_preview.short_description = "Content"
