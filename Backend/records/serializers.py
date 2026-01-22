from rest_framework import serializers
from .models import DailyRecord

class DailyRecordSerializer(serializers.ModelSerializer):
    is_complete = serializers.SerializerMethodField()

    class Meta:
        model = DailyRecord
        fields = "__all__"
        read_only_fields = ["user", "created_at", "updated_at"]

    def get_is_complete(self, obj):
        return obj.is_complete_for_day()
