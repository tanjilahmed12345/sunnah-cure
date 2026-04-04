import logging

import pusher
from django.conf import settings

logger = logging.getLogger(__name__)

_client = None


def get_pusher_client():
    global _client
    if _client is None and settings.PUSHER_APP_ID:
        _client = pusher.Pusher(
            app_id=settings.PUSHER_APP_ID,
            key=settings.PUSHER_KEY,
            secret=settings.PUSHER_SECRET,
            cluster=settings.PUSHER_CLUSTER,
            ssl=True,
        )
    return _client


def trigger_new_message(conversation_id: str, message_data: dict):
    client = get_pusher_client()
    if client:
        try:
            client.trigger(
                f"conversation-{conversation_id}",
                "new-message",
                message_data,
            )
        except Exception as e:
            logger.error(f"Pusher trigger failed: {e}")
