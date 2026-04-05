from django.urls import path

from .views import (
    ConversationListView,
    ConversationMessagesView,
    GetOrCreateConversationView,
    SendMessageView,
)

urlpatterns = [
    path("conversations/", ConversationListView.as_view(), name="conversation-list"),
    path("conversations/get-or-create/", GetOrCreateConversationView.as_view(), name="conversation-get-or-create"),
    path("<uuid:conversation_id>/", ConversationMessagesView.as_view(), name="conversation-messages"),
    path("<uuid:conversation_id>/send/", SendMessageView.as_view(), name="send-message"),
]
