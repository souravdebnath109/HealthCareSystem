import os
from django.apps import AppConfig


class RecordsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "records"

    def ready(self):
        # Avoid running twice because of Django auto-reloader
        if os.environ.get("RUN_MAIN") == "true":
            from .scheduler import start
            start()
