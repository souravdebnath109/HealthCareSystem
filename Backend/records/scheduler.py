from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from django.conf import settings

from .tasks import send_daily_record_reminders


def start():
    scheduler = BackgroundScheduler(timezone=settings.TIME_ZONE)

    scheduler.add_job(
        send_daily_record_reminders,
        trigger=CronTrigger(hour=20, minute=0),  # 8 PM
        id="daily_record_reminder_job",
        replace_existing=True,
    )

    scheduler.start()
