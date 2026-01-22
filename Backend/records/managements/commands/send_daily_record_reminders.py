from django.core.management.base import BaseCommand
from records.tasks import send_daily_record_reminders


class Command(BaseCommand):
    help = "Send reminder email at 8 PM to users who didn't complete today's record."

    def add_arguments(self, parser):
        parser.add_argument(
            '--test',
            action='store_true',
            help='Test mode - shows what would happen without sending emails',
        )

    def handle(self, *args, **options):
        test_mode = options.get('test', False)

        if test_mode:
            self.stdout.write(self.style.WARNING("🧪 RUNNING IN TEST MODE (no emails will be sent)"))
        
        sent_count = send_daily_record_reminders(test_mode=test_mode)

        if test_mode:
            self.stdout.write(self.style.SUCCESS(f"✅ Test complete. Would have sent {sent_count} emails."))
        else:
            self.stdout.write(self.style.SUCCESS(f"✅ Sent {sent_count} reminder emails."))