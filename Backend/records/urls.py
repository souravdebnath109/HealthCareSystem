from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DailyRecordViewSet

router = DefaultRouter()
router.register(r"records", DailyRecordViewSet, basename="records")

urlpatterns = [
    path("", include(router.urls)),
]
