from django.db import models
from django.conf import settings

class DailyRecord(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="daily_records")
    date = models.DateField()

    # values
    temperature = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    sugar_level = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    bp_systolic = models.IntegerField(null=True, blank=True)
    bp_diastolic = models.IntegerField(null=True, blank=True)
    weight = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    sleep_hours = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)
    mood = models.CharField(max_length=50, null=True, blank=True)
    steps = models.IntegerField(null=True, blank=True)
    water_liters = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    calorie = models.IntegerField(null=True, blank=True)

    # tick marks
    tick_temperature = models.BooleanField(default=False)
    tick_sugar_level = models.BooleanField(default=False)
    tick_bp = models.BooleanField(default=False)
    tick_weight = models.BooleanField(default=False)
    tick_sleep = models.BooleanField(default=False)
    tick_mood = models.BooleanField(default=False)
    tick_steps = models.BooleanField(default=False)
    tick_water = models.BooleanField(default=False)
    tick_calorie = models.BooleanField(default=False)
    
    # ✅ CHANGED: Track the date when reminder was sent
    reminder_sent_date = models.DateField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user", "date")
        ordering = ["-date"]

    def __str__(self):
        return f"{self.user.email} - {self.date}"

    def is_complete_for_day(self) -> bool:
        """All ticks checked."""
        return all([
            self.tick_temperature,
            self.tick_sugar_level,
            self.tick_bp,
            self.tick_weight,
            self.tick_sleep,
            self.tick_mood,
            self.tick_steps,
            self.tick_water,
            self.tick_calorie,
        ])