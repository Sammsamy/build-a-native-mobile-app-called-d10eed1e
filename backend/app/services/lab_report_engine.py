from __future__ import annotations

import hashlib
import random
from dataclasses import dataclass
from datetime import date, datetime
from statistics import mean

from app import models


@dataclass(frozen=True)
class BiomarkerTemplate:
    key: str
    display_name: str
    category: str
    unit: str
    reference_low: float
    reference_high: float
    base: float
    spread: float
    order: int
    quick_takeaway_ok: str
    quick_takeaway_high: str
    quick_takeaway_low: str
    simple_translation: str
    calm_explanation: str
    clinician_questions: tuple[str, str]


BIOMARKER_LIBRARY: tuple[BiomarkerTemplate, ...] = (
    BiomarkerTemplate(
        key="ldl",
        display_name="LDL Cholesterol",
        category="Heart health",
        unit="mg/dL",
        reference_low=0,
        reference_high=99,
        base=114,
        spread=28,
        order=1,
        quick_takeaway_ok="Your LDL looks close to the usual target range.",
        quick_takeaway_high="Your LDL is above the usual target range and may be worth reviewing soon.",
        quick_takeaway_low="Your LDL is lower than expected, which is usually not concerning on its own.",
        simple_translation="LDL is often called the 'less helpful' cholesterol because higher levels can raise heart risk over time.",
        calm_explanation="Mild LDL elevations are common and can shift with diet, exercise, weight changes, genetics, and medicines. It is usually something to review thoughtfully, not panic about.",
        clinician_questions=(
            "Should I repeat my cholesterol panel fasting?",
            "What LDL goal makes sense for my overall risk?",
        ),
    ),
    BiomarkerTemplate(
        key="hdl",
        display_name="HDL Cholesterol",
        category="Heart health",
        unit="mg/dL",
        reference_low=40,
        reference_high=90,
        base=50,
        spread=10,
        order=2,
        quick_takeaway_ok="Your HDL is in a reassuring range.",
        quick_takeaway_high="Your HDL is higher than average, which is often fine.",
        quick_takeaway_low="Your HDL is a little lower than ideal, which can happen for many common reasons.",
        simple_translation="HDL is often called the 'helpful' cholesterol because higher levels can support heart health.",
        calm_explanation="HDL may be influenced by exercise, weight, genetics, smoking, and triglyceride levels. A lower number is worth improving over time, not fearing in the moment.",
        clinician_questions=(
            "What habits would help improve my HDL?",
            "How should I look at HDL together with LDL and triglycerides?",
        ),
    ),
    BiomarkerTemplate(
        key="triglycerides",
        display_name="Triglycerides",
        category="Heart health",
        unit="mg/dL",
        reference_low=0,
        reference_high=149,
        base=160,
        spread=40,
        order=3,
        quick_takeaway_ok="Your triglycerides are in a comfortable range.",
        quick_takeaway_high="Your triglycerides are above range and could improve with follow-up.",
        quick_takeaway_low="Your triglycerides are low, which is usually fine.",
        simple_translation="Triglycerides are a kind of blood fat that can rise with sugar intake, alcohol, weight changes, or not fasting.",
        calm_explanation="A mild rise can happen for simple reasons like a recent meal, alcohol, or insulin resistance. Trends over time matter more than a single number.",
        clinician_questions=(
            "Do I need to repeat this test fasting?",
            "Could food, alcohol, or medication explain this result?",
        ),
    ),
    BiomarkerTemplate(
        key="a1c",
        display_name="Hemoglobin A1C",
        category="Blood sugar",
        unit="%",
        reference_low=4.0,
        reference_high=5.6,
        base=5.8,
        spread=0.9,
        order=4,
        quick_takeaway_ok="Your A1C is in the expected range.",
        quick_takeaway_high="Your A1C is above the usual range and deserves follow-up.",
        quick_takeaway_low="Your A1C is lower than expected, which is usually not urgent.",
        simple_translation="A1C estimates your average blood sugar over about 3 months.",
        calm_explanation="A borderline or mildly elevated A1C can happen before diabetes and may improve with habits or treatment. It is important, but usually not a same-day emergency by itself.",
        clinician_questions=(
            "Should I repeat my A1C or check fasting glucose too?",
            "What changes would make the biggest difference before my next test?",
        ),
    ),
    BiomarkerTemplate(
        key="glucose",
        display_name="Glucose",
        category="Blood sugar",
        unit="mg/dL",
        reference_low=70,
        reference_high=99,
        base=103,
        spread=18,
        order=5,
        quick_takeaway_ok="Your glucose is within the common fasting range.",
        quick_takeaway_high="Your glucose is a bit higher than expected and should be reviewed in context.",
        quick_takeaway_low="Your glucose is lower than expected, which matters most if you also feel unwell.",
        simple_translation="Glucose is the amount of sugar in your blood right now.",
        calm_explanation="Food, stress, illness, sleep, and fasting status can all affect glucose. One mildly high value is usually not enough to diagnose anything by itself.",
        clinician_questions=(
            "Was this test fasting, and does that change how we interpret it?",
            "Do I need repeat testing or more blood sugar screening?",
        ),
    ),
    BiomarkerTemplate(
        key="creatinine",
        display_name="Creatinine",
        category="Kidney function",
        unit="mg/dL",
        reference_low=0.6,
        reference_high=1.3,
        base=1.05,
        spread=0.32,
        order=6,
        quick_takeaway_ok="Your creatinine is in a reassuring range.",
        quick_takeaway_high="Your creatinine is above range and should be reviewed with your clinician.",
        quick_takeaway_low="Your creatinine is a little low, which is usually not worrisome.",
        simple_translation="Creatinine helps estimate how well your kidneys are filtering.",
        calm_explanation="Creatinine can shift with hydration, muscle mass, exercise, medicines, and kidney function. Mild changes are not always dangerous, but they do deserve context.",
        clinician_questions=(
            "Could hydration or medication affect this creatinine result?",
            "Do I need kidney follow-up or repeat labs soon?",
        ),
    ),
)


def _seed_from_text(value: str) -> int:
    digest = hashlib.sha256(value.encode("utf-8")).hexdigest()
    return int(digest[:16], 16)


def _status_for_value(value: float, low: float, high: float) -> tuple[str, str]:
    if value < low:
        return "low", "Below range"
    if value > high:
        return "high", "Above range"
    return "normal", "In range"


def _confidence_for_status(status: str) -> tuple[str, float]:
    if status == "normal":
        return "Higher", 0.86
    if status == "high":
        return "Moderate", 0.74
    return "Moderate", 0.7


def _timeline_hint(report_count: int) -> tuple[str, float]:
    completeness = min(report_count / 5, 1.0)
    if report_count <= 1:
        return "Upload 2 older reports to start seeing your LDL and A1C timeline.", round(completeness, 2)
    if report_count == 2:
        return "One more unlocked report will make your trendlines much more useful.", round(completeness, 2)
    if report_count == 3:
        return "Your trend view is taking shape—older reports will make the story clearer.", round(completeness, 2)
    return "Your 5-year timeline is becoming more complete with each unlocked report.", round(completeness, 2)


def generate_report_blueprint(
    original_filename: str,
    collected_on: date | None,
    report_count: int,
    is_historical_upload: bool,
) -> dict:
    seed_input = f"{original_filename}|{collected_on}|{report_count}|{is_historical_upload}"
    seeded_random = random.Random(_seed_from_text(seed_input))
    biomarkers: list[dict] = []

    for template in BIOMARKER_LIBRARY:
        drift = seeded_random.uniform(-template.spread, template.spread)
        if template.unit == "%":
            drift = seeded_random.uniform(-0.6, 1.1)
        value = round(template.base + drift, 2)
        if template.key == "hdl":
            value = round(max(28, value), 1)
        elif template.key == "creatinine":
            value = round(max(0.45, value), 2)
        elif template.key == "a1c":
            value = round(max(4.3, value), 1)
        else:
            value = round(max(0, value), 0)

        status, status_label = _status_for_value(value, template.reference_low, template.reference_high)
        confidence_label, confidence_score = _confidence_for_status(status)
        if status == "high":
            quick_takeaway = template.quick_takeaway_high
        elif status == "low":
            quick_takeaway = template.quick_takeaway_low
        else:
            quick_takeaway = template.quick_takeaway_ok

        biomarkers.append(
            {
                "biomarker_key": template.key,
                "display_name": template.display_name,
                "display_order": template.order,
                "category": template.category,
                "value_text": str(value),
                "numeric_value": float(value),
                "unit": template.unit,
                "reference_text": f"{template.reference_low}–{template.reference_high} {template.unit}",
                "reference_low": template.reference_low,
                "reference_high": template.reference_high,
                "status": status,
                "status_label": status_label,
                "quick_takeaway": quick_takeaway,
                "simple_translation": template.simple_translation,
                "calm_explanation": template.calm_explanation,
                "confidence_label": confidence_label,
                "confidence_score": confidence_score,
                "clinician_questions": list(template.clinician_questions),
                "trend_note": "Trends become more useful once you unlock older reports for comparison.",
            }
        )

    flagged = [
        {
            "biomarker_key": biomarker["biomarker_key"],
            "label": biomarker["display_name"],
            "status": biomarker["status"],
            "reason": biomarker["quick_takeaway"],
        }
        for biomarker in biomarkers
        if biomarker["status"] != "normal"
    ]

    urgent_level = "low"
    urgent_label = "Nothing looks immediately urgent"
    urgent_message = "This preview does not suggest a same-day emergency from the visible markers alone. If you feel very unwell or have severe symptoms, seek urgent care."

    a1c = next(item for item in biomarkers if item["biomarker_key"] == "a1c")
    creatinine = next(item for item in biomarkers if item["biomarker_key"] == "creatinine")
    glucose = next(item for item in biomarkers if item["biomarker_key"] == "glucose")

    if float(a1c["numeric_value"] or 0) >= 8.5 or float(glucose["numeric_value"] or 0) >= 240:
        urgent_level = "high"
        urgent_label = "Please review this result promptly"
        urgent_message = "Some values appear far outside the usual range. Contact your clinician soon, and if you also have severe symptoms, seek urgent care."
    elif float(creatinine["numeric_value"] or 0) >= 1.6 or len(flagged) >= 3:
        urgent_level = "medium"
        urgent_label = "Worth following up soon"
        urgent_message = "A few markers look outside the usual range. This is usually best handled with a clinician follow-up rather than panic."

    summary_bits = []
    if flagged:
        summary_bits.append(f"A few items stand out, especially {flagged[0]['label']}.")
    else:
        summary_bits.append("Most visible markers appear close to the usual range.")
    summary_bits.append("This first look is meant to calm uncertainty, not replace a clinician visit.")
    summary_bits.append("Unlocking the full report will show what each marker may mean and which follow-up questions to ask.")

    timeline_hint, completeness = _timeline_hint(report_count)
    if is_historical_upload:
        timeline_hint = "This older report can help build your timeline once it is unlocked."

    return {
        "lab_name": "LabBuddy Scan",
        "preview_summary": " ".join(summary_bits[:3]),
        "urgent_level": urgent_level,
        "urgent_label": urgent_label,
        "urgent_message": urgent_message,
        "preview_takeaways": [
            "Educational only—not medical advice or diagnosis.",
            "One free follow-up question is included before unlock.",
            "Unlock this report to see every biomarker card and clinician questions.",
        ],
        "flagged_items": flagged[:4],
        "timeline_hint": timeline_hint,
        "timeline_completeness_score": completeness,
        "biomarkers": biomarkers,
    }


def build_ai_answer(report: models.LabReport, question: str) -> str:
    lowered = question.lower()
    highlighted = next((item for item in report.biomarkers if item.status != "normal"), None)

    if not report.biomarkers:
        return "I could not find enough structured lab details yet. Please review the saved report with your clinician for the safest interpretation."

    if "a1c" in lowered or "sugar" in lowered or "glucose" in lowered:
        target = next((item for item in report.biomarkers if item.biomarker_key in {"a1c", "glucose"}), report.biomarkers[0])
        return (
            f"Your question seems focused on blood sugar. {target.display_name} is {target.value_text} {target.unit}, which is marked {target.status_label.lower()}. "
            f"{target.calm_explanation} A helpful next step is to ask: '{target.clinician_questions[0]}'."
        )

    if "kidney" in lowered or "creatinine" in lowered:
        target = next((item for item in report.biomarkers if item.biomarker_key == "creatinine"), report.biomarkers[0])
        return (
            f"Creatinine helps estimate kidney filtering. In this report it is {target.value_text} {target.unit}, marked {target.status_label.lower()}. "
            f"{target.calm_explanation} A simple follow-up question is: '{target.clinician_questions[0]}'."
        )

    if "cholesterol" in lowered or "ldl" in lowered or "hdl" in lowered or "triglyceride" in lowered:
        ldl = next((item for item in report.biomarkers if item.biomarker_key == "ldl"), report.biomarkers[0])
        return (
            f"This looks most related to cholesterol. LDL is {ldl.value_text} {ldl.unit}, marked {ldl.status_label.lower()}. "
            f"{ldl.calm_explanation} Good questions for your clinician include: '{ldl.clinician_questions[0]}' and '{ldl.clinician_questions[1]}'."
        )

    if highlighted:
        return (
            f"A calm first read: {highlighted.display_name} is the main item standing out in this report. "
            f"{highlighted.calm_explanation} This app is educational only, so the safest next step is to review the result with your clinician and ask: '{highlighted.clinician_questions[0]}'."
        )

    return (
        "Overall, this report does not show a clearly urgent pattern in the saved biomarkers. "
        "If you still feel unsure, it is reasonable to ask your clinician which result matters most and whether repeat testing is needed."
    )


def build_trend_series(reports: list[models.LabReport]) -> list[dict]:
    unlocked_reports = [report for report in reports if report.unlocked]
    biomarker_map: dict[str, dict] = {}

    for report in sorted(unlocked_reports, key=lambda item: (item.collected_on or date.today(), item.id)):
        for biomarker in report.biomarkers:
            if biomarker.numeric_value is None:
                continue
            entry = biomarker_map.setdefault(
                biomarker.biomarker_key,
                {
                    "biomarker_key": biomarker.biomarker_key,
                    "display_name": biomarker.display_name,
                    "unit": biomarker.unit,
                    "status_hint": biomarker.status_label,
                    "points": [],
                },
            )
            entry["points"].append(
                {
                    "report_id": report.id,
                    "collected_on": report.collected_on,
                    "value": biomarker.numeric_value,
                    "value_text": biomarker.value_text,
                }
            )

    trend_series = []
    for _, value in biomarker_map.items():
        points = value["points"]
        trend_series.append(
            {
                **value,
                "enough_data": len(points) >= 2,
                "points": points,
            }
        )
    return sorted(trend_series, key=lambda item: item["display_name"])


def build_health_age(reports: list[models.LabReport]) -> dict:
    unlocked_reports = [report for report in reports if report.unlocked]
    if len(unlocked_reports) < 3:
        return {
            "visible": False,
            "estimated_age": None,
            "confidence_label": None,
            "confidence_reason": None,
            "disclaimer": "Health Age is an educational estimate only and is not medically validated.",
        }

    latest = sorted(unlocked_reports, key=lambda item: item.collected_on or date.today())[-1]
    values = {item.biomarker_key: item.numeric_value for item in latest.biomarkers if item.numeric_value is not None}
    if not {"ldl", "hdl", "a1c"}.issubset(values.keys()):
        return {
            "visible": False,
            "estimated_age": None,
            "confidence_label": None,
            "confidence_reason": None,
            "disclaimer": "Health Age is an educational estimate only and is not medically validated.",
        }

    estimated_age = int(round(32 + (values["ldl"] / 18) + (values["a1c"] * 2.8) - (values["hdl"] / 10)))
    confidence = "Moderate" if len(unlocked_reports) >= 4 else "Early"
    return {
        "visible": True,
        "estimated_age": estimated_age,
        "confidence_label": confidence,
        "confidence_reason": "Based on the depth and consistency of your unlocked trend data.",
        "disclaimer": "Health Age is an educational estimate only and is not medically validated.",
    }


def average_timeline_score(reports: list[models.LabReport]) -> float:
    if not reports:
        return 0.0
    return round(mean(report.timeline_completeness_score for report in reports), 2)
