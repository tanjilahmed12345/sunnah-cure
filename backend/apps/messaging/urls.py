from django.urls import path

from .views import ConversationListView, ConversationMessagesView, SendMessageView

urlpatterns = [
    path("conversations/", ConversationListView.as_view(), name="conversation-list"),
    path("<uuid:conversation_id>/", ConversationMessagesView.as_view(), name="conversation-messages"),
    path("<uuid:conversation_id>/send/", SendMessageView.as_view(), name="send-message"),
]
