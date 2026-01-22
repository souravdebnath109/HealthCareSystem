from datetime import date
import time
from django.core.mail import send_mail
from django.conf import settings
from django.db import transaction

from accounts.models import CustomUser
from records.models import DailyRecord


def send_daily_record_reminders(test_mode=False):
    """
    Send reminder emails to users who haven't completed today's records.
    
    Args:
        test_mode: If True, prints debug info instead of sending emails
    """
    today = date.today()

    users = (
        CustomUser.objects.filter(is_active=True)
        .exclude(email__isnull=True)
        .exclude(email__exact="")
    )

    sent_count = 0
    skip_count = 0

    print(f"\n{'='*60}")
    print(f"Running reminder job for date: {today}")
    print(f"Total active users with email: {users.count()}")
    print(f"{'='*60}\n")

    for user in users:
        # Get or create today's record
        record, created = DailyRecord.objects.get_or_create(user=user, date=today)

        # ✅ Check if reminder already sent TODAY
        if record.reminder_sent_date == today:
            skip_count += 1
            if test_mode:
                print(f"⏭️  SKIP: {user.email} - reminder already sent today")
            continue

        # ✅ Check if record is complete
        if record.is_complete_for_day():
            skip_count += 1
            if test_mode:
                print(f"✅ SKIP: {user.email} - record complete")
            continue

        # ✅ Send email
        try:
            if test_mode:
                print(f"📧 WOULD SEND to: {user.email}")
            else:
                # Small delay to avoid rate limiting
                if sent_count > 0:
                    time.sleep(2)

                send_mail(
                    subject="Daily Health Record Reminder",
                    message=(
                        f"Hello {user.full_name or user.username},\n\n"
                        "You have not completed today's health records. "
                        "Please open the Records page and tick all items.\n\n"
                        "Best regards,\n"
                        "Healthcare Team"
                    ),
                    from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "no-reply@healthcare.com"),
                    recipient_list=[user.email],
                    fail_silently=False,
                )

                # ✅ Mark reminder as sent TODAY
                with transaction.atomic():
                    record.reminder_sent_date = today
                    record.save(update_fields=["reminder_sent_date"])

                print(f"✅ SENT to: {user.email}")

            sent_count += 1

        except Exception as e:
            print(f"❌ FAILED for {user.email}: {str(e)}")

    print(f"\n{'='*60}")
    print(f"📊 Summary:")
    print(f"   Emails sent: {sent_count}")
    print(f"   Skipped: {skip_count}")
    print(f"{'='*60}\n")

    return sent_count