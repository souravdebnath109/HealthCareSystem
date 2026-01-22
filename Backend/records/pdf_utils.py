import io
import calendar
from datetime import date

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer


def _month_dates(year: int, month: int):
    """Return list of all date objects for the given month (28–31)."""
    last_day = calendar.monthrange(year, month)[1]
    return [date(year, month, d) for d in range(1, last_day + 1)]


def build_monthly_records_pdf(user, records_by_date: dict, year: int, month: int) -> bytes:
    buffer = io.BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=landscape(A4),
        leftMargin=20,
        rightMargin=20,
        topMargin=20,
        bottomMargin=20,
        title="Monthly Health Records",
    )

    styles = getSampleStyleSheet()
    story = []

    month_name = calendar.month_name[month]
    patient_name = getattr(user, "full_name", None) or getattr(user, "username", "") or "Patient"
    patient_email = getattr(user, "email", "")

    story.append(Paragraph("<b>Monthly Health Records</b>", styles["Title"]))
    story.append(Spacer(1, 6))
    story.append(Paragraph(f"<b>Patient:</b> {patient_name}", styles["Normal"]))
    story.append(Paragraph(f"<b>Email:</b> {patient_email}", styles["Normal"]))
    story.append(Paragraph(f"<b>Month:</b> {month_name} {year}", styles["Normal"]))
    story.append(Spacer(1, 12))

    headers = [
        "DAY",
        "Work",
        "Temperature",
        "Sugar Level",
        "BP",
        "Month",
        "Weight",
        "Sleep",
        "Mood",
        "Calorie",
        "Steps",
    ]
    data = [headers]

    month_label = f"{month_name} {year}"
    days = _month_dates(year, month)  # ✅ full month (includes 31st if exists)

    for i, d in enumerate(days, start=1):
        rec = records_by_date.get(d)

        temp = str(rec.temperature) if rec and rec.temperature is not None else ""
        sugar = str(rec.sugar_level) if rec and rec.sugar_level is not None else ""

        bp = ""
        if rec and (rec.bp_systolic is not None or rec.bp_diastolic is not None):
            bp = f"{rec.bp_systolic or ''}/{rec.bp_diastolic or ''}"

        weight = str(rec.weight) if rec and rec.weight is not None else ""
        sleep = str(rec.sleep_hours) if rec and rec.sleep_hours is not None else ""
        mood = str(rec.mood) if rec and rec.mood is not None else ""
        calorie = str(rec.calorie) if rec and rec.calorie is not None else ""
        steps = str(rec.steps) if rec and rec.steps is not None else ""

        row = [
            f"Day{i}",
            "",
            temp,
            sugar,
            bp,
            month_label,
            weight,
            sleep,
            mood,
            calorie,
            steps,
        ]
        data.append(row)

    table = Table(data, repeatRows=1)
    table.setStyle(
        TableStyle([
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 9),
            ("BACKGROUND", (0, 0), (-1, 0), colors.whitesmoke),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.black),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("ALIGN", (0, 0), (-1, 0), "CENTER"),
            ("FONTSIZE", (0, 1), (-1, -1), 8),
        ])
    )

    story.append(table)
    doc.build(story)

    pdf = buffer.getvalue()
    buffer.close()
    return pdf
