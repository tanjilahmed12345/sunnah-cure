from django.core.management.base import BaseCommand

from apps.messaging.models import Conversation
from apps.users.models import User


class Command(BaseCommand):
    help = "Create general conversations between existing patients and admins"

    def handle(self, *args, **options):
        admins = User.objects.filter(role="ADMIN")
        patients = User.objects.filter(role="PATIENT")
        created = 0

        for patient in patients:
            for admin in admins:
                participant_ids = {patient.id, admin.id}
                # Check if a general conversation already exists
                exists = False
                for conv in Conversation.objects.filter(appointment__isnull=True):
                    if set(conv.participants.values_list("id", flat=True)) == participant_ids:
                        exists = True
                        break
                if not exists:
                    conv = Conversation.objects.create()
                    conv.participants.set([patient, admin])
                    created += 1

        self.stdout.write(self.style.SUCCESS(f"Created {created} conversations."))
