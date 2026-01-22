from datetime import date
from django.utils.dateparse import parse_date
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import DailyRecord
from .serializers import DailyRecordSerializer


import calendar
from datetime import date as dt_date
from django.http import HttpResponse
from .pdf_utils import build_monthly_records_pdf
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import DailyRecord



class DailyRecordViewSet(viewsets.ModelViewSet):
    serializer_class = DailyRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return DailyRecord.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=["get"], url_path="by-date")
    def by_date(self, request):
        """
        GET /api/records/by-date/?date=2025-12-31
        returns existing record or creates empty one for that date
        """
        q = request.query_params.get("date")
        d = parse_date(q) if q else date.today()
        record, _ = DailyRecord.objects.get_or_create(user=request.user, date=d)
        return Response(self.get_serializer(record).data)
    @action(detail=False, methods=["get"], url_path="monthly-pdf")
    def monthly_pdf(self, request):
        """
        GET /api/records/monthly-pdf/?month=2025-12
        Returns a PDF for the full month (28–31 days).
        """
        month_q = request.query_params.get("month")
        today = dt_date.today()

        if month_q:
            try:
                year_str, month_str = month_q.split("-")
                year = int(year_str)
                month = int(month_str)
                if not (1 <= month <= 12):
                    raise ValueError
            except ValueError:
                return Response({"detail": "Invalid month format. Use YYYY-MM."}, status=400)
        else:
            year, month = today.year, today.month

        # ✅ full month range
        last_day = calendar.monthrange(year, month)[1]
        start = dt_date(year, month, 1)
        end = dt_date(year, month, last_day)

        qs = DailyRecord.objects.filter(user=request.user, date__range=(start, end))
        records_by_date = {r.date: r for r in qs}

        pdf_bytes = build_monthly_records_pdf(
            user=request.user,
            records_by_date=records_by_date,
            year=year,
            month=month,
        )

        filename = f"records_{request.user.id}_{year}-{month:02d}.pdf"
        resp = HttpResponse(pdf_bytes, content_type="application/pdf")
        resp["Content-Disposition"] = f'attachment; filename="{filename}"'
        return resp