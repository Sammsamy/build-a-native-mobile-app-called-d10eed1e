from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app import models, schemas
from app.dependencies import get_db
from app.services.lab_report_engine import (
    average_timeline_score,
    build_ai_answer,
    build_health_age,
    build_trend_series,
    generate_report_blueprint,
)

router = APIRouter(prefix="/labbuddy", tags=["labbuddy"])

REPORT_UNLOCK_PRICE = "$4.99"
YEARLY_PRICE = "$19.99/year"


def _get_or_create_device_profile(db: Session, device_id: str) -> models.DeviceProfile:
    profile = (
        db.query(models.DeviceProfile)
        .filter(models.DeviceProfile.device_id == device_id)
        .first()
    )
    if profile:
        return profile

    profile = models.DeviceProfile(device_id=device_id)
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


def _get_report_for_device(db: Session, report_id: int, device_id: str) -> tuple[models.DeviceProfile, models.LabReport]:
    profile = _get_or_create_device_profile(db, device_id)
    report = (
        db.query(models.LabReport)
        .options(
            joinedload(models.LabReport.biomarkers),
            joinedload(models.LabReport.ai_messages),
        )
        .filter(
            models.LabReport.id == report_id,
            models.LabReport.device_profile_id == profile.id,
        )
        .first()
    )
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return profile, report


def _serialize_trends(report: models.LabReport, all_reports: list[models.LabReport]) -> list[schemas.TrendSeries]:
    series = build_trend_series(all_reports)
    report_keys = {item.biomarker_key for item in report.biomarkers}
    return [schemas.TrendSeries.model_validate(item) for item in series if item["biomarker_key"] in report_keys]


def _serialize_report_detail(
    report: models.LabReport,
    profile: models.DeviceProfile,
    all_reports: list[models.LabReport],
) -> schemas.ReportDetail:
    unlimited_ai = bool(report.unlocked or profile.yearly_subscription_active)
    biomarker_cards = [
        schemas.BiomarkerCard.model_validate(biomarker)
        for biomarker in report.biomarkers
    ] if unlimited_ai else []

    return schemas.ReportDetail(
        id=report.id,
        report_label=report.report_label,
        lab_name=report.lab_name,
        source_type=report.source_type,
        collected_on=report.collected_on,
        preview_summary=report.preview_summary,
        urgent_level=report.urgent_level,
        urgent_label=report.urgent_label,
        urgent_message=report.urgent_message,
        flagged_items=[schemas.FlaggedItem.model_validate(item) for item in (report.flagged_items or [])],
        preview_takeaways=list(report.preview_takeaways or []),
        timeline_hint=report.timeline_hint,
        timeline_completeness_score=report.timeline_completeness_score,
        unlocked=bool(report.unlocked),
        unlock_source=report.unlock_source,
        purchase_price_label=report.purchase_price_label,
        free_ai_question_used=bool(report.free_ai_question_used),
        can_ask_free_question=not bool(report.free_ai_question_used),
        has_unlimited_ai=unlimited_ai,
        biomarker_cards=biomarker_cards,
        ai_messages=[schemas.AiMessage.model_validate(item) for item in report.ai_messages],
        trend_series=_serialize_trends(report, all_reports) if unlimited_ai else [],
        created_at=report.created_at,
    )


def _load_profile_with_reports(db: Session, device_id: str) -> models.DeviceProfile:
    profile = _get_or_create_device_profile(db, device_id)
    return (
        db.query(models.DeviceProfile)
        .options(
            joinedload(models.DeviceProfile.reports).joinedload(models.LabReport.biomarkers),
            joinedload(models.DeviceProfile.reports).joinedload(models.LabReport.ai_messages),
        )
        .filter(models.DeviceProfile.id == profile.id)
        .first()
    )


@router.get("/dashboard", response_model=schemas.DashboardResponse)
def get_dashboard(device_id: str, db: Session = Depends(get_db)):
    profile = _load_profile_with_reports(db, device_id)
    reports = sorted(
        profile.reports,
        key=lambda item: (item.collected_on or item.created_at.date(), item.created_at),
        reverse=True,
    )

    return schemas.DashboardResponse(
        profile=schemas.DeviceProfileSummary(
            device_id=profile.device_id,
            safety_acknowledged=profile.safety_acknowledged,
            yearly_subscription_active=profile.yearly_subscription_active,
            total_reports=len(reports),
            unlocked_reports=sum(1 for report in reports if report.unlocked),
            trend_ready_reports=sum(1 for report in reports if report.unlocked and report.collected_on is not None),
            timeline_completeness_score=average_timeline_score(reports),
        ),
        reports=[
            schemas.ReportListItem(
                id=report.id,
                report_label=report.report_label,
                lab_name=report.lab_name,
                collected_on=report.collected_on,
                preview_summary=report.preview_summary,
                urgent_level=report.urgent_level,
                urgent_label=report.urgent_label,
                flagged_count=len(report.flagged_items or []),
                unlocked=bool(report.unlocked),
                free_ai_question_used=bool(report.free_ai_question_used),
                timeline_hint=report.timeline_hint,
                timeline_completeness_score=report.timeline_completeness_score,
                is_historical_upload=bool(report.is_historical_upload),
                created_at=report.created_at,
            )
            for report in reports
        ],
        trend_series=[schemas.TrendSeries.model_validate(item) for item in build_trend_series(reports)],
        health_age=schemas.HealthAgeEstimate.model_validate(build_health_age(reports)),
        purchase_options={
            "report_unlock": REPORT_UNLOCK_PRICE,
            "yearly_subscription": YEARLY_PRICE,
        },
        trend_cta="Unlock your 5-year trends",
    )


@router.post("/device/acknowledge-safety", response_model=schemas.ActionResponse)
def acknowledge_safety(payload: schemas.SafetyAcknowledgeRequest, db: Session = Depends(get_db)):
    profile = _get_or_create_device_profile(db, payload.device_id)
    profile.safety_acknowledged = True
    profile.safety_acknowledged_at = datetime.utcnow()
    db.add(profile)
    db.commit()
    return schemas.ActionResponse(success=True, message="Safety notice saved on this device.")


@router.post("/reports/analyze", response_model=schemas.ReportDetail)
def analyze_report(payload: schemas.AnalyzeReportRequest, db: Session = Depends(get_db)):
    profile = _load_profile_with_reports(db, payload.device_id)
    blueprint = generate_report_blueprint(
        original_filename=payload.original_filename,
        collected_on=payload.collected_on,
        report_count=len(profile.reports) + 1,
        is_historical_upload=payload.is_historical_upload,
    )

    report = models.LabReport(
        device_profile_id=profile.id,
        report_label=payload.report_label or ("Older report" if payload.is_historical_upload else "Latest report"),
        lab_name=blueprint["lab_name"],
        source_type=payload.source_type,
        content_type=payload.content_type,
        original_filename=payload.original_filename,
        image_public_url=payload.image_public_url,
        image_object_key=payload.image_object_key,
        collected_on=payload.collected_on,
        is_historical_upload=payload.is_historical_upload,
        preview_summary=blueprint["preview_summary"],
        urgent_level=blueprint["urgent_level"],
        urgent_label=blueprint["urgent_label"],
        urgent_message=blueprint["urgent_message"],
        flagged_items=blueprint["flagged_items"],
        preview_takeaways=blueprint["preview_takeaways"],
        timeline_hint=blueprint["timeline_hint"],
        timeline_completeness_score=blueprint["timeline_completeness_score"],
        purchase_price_label=REPORT_UNLOCK_PRICE,
    )
    db.add(report)
    db.flush()

    for biomarker in blueprint["biomarkers"]:
        db.add(models.BiomarkerResult(report_id=report.id, **biomarker))

    db.commit()
    profile = _load_profile_with_reports(db, payload.device_id)
    saved_report = next(item for item in profile.reports if item.id == report.id)
    return _serialize_report_detail(saved_report, profile, profile.reports)


@router.get("/reports/{report_id}", response_model=schemas.ReportDetail)
def get_report(report_id: int, device_id: str, db: Session = Depends(get_db)):
    profile = _load_profile_with_reports(db, device_id)
    report = next((item for item in profile.reports if item.id == report_id), None)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return _serialize_report_detail(report, profile, profile.reports)


@router.post("/reports/{report_id}/unlock", response_model=schemas.ReportDetail)
def unlock_report(report_id: int, payload: schemas.UnlockReportRequest, db: Session = Depends(get_db)):
    profile, report = _get_report_for_device(db, report_id, payload.device_id)
    report.unlocked = True
    report.unlock_source = payload.product_key
    report.unlocked_at = datetime.utcnow()
    report.purchase_price_label = REPORT_UNLOCK_PRICE
    db.add(report)
    db.commit()
    profile = _load_profile_with_reports(db, payload.device_id)
    refreshed_report = next(item for item in profile.reports if item.id == report_id)
    return _serialize_report_detail(refreshed_report, profile, profile.reports)


@router.post("/reports/{report_id}/ask", response_model=schemas.AskReportQuestionResponse)
def ask_report_question(report_id: int, payload: schemas.AskReportQuestionRequest, db: Session = Depends(get_db)):
    profile, report = _get_report_for_device(db, report_id, payload.device_id)

    if not report.unlocked and not profile.yearly_subscription_active and report.free_ai_question_used:
        raise HTTPException(status_code=403, detail="Unlock this report to ask more questions.")

    access_tier = "unlimited" if report.unlocked or profile.yearly_subscription_active else "free-preview"
    answer_text = build_ai_answer(report, payload.question)
    message = models.ReportQuestion(
        report_id=report.id,
        question_text=payload.question,
        answer_text=answer_text,
        access_tier=access_tier,
    )
    db.add(message)

    if access_tier == "free-preview":
        report.free_ai_question_used = True
        db.add(report)

    db.commit()
    profile = _load_profile_with_reports(db, payload.device_id)
    refreshed_report = next(item for item in profile.reports if item.id == report_id)
    detail = _serialize_report_detail(refreshed_report, profile, profile.reports)
    answer = schemas.AiMessage.model_validate(refreshed_report.ai_messages[-1])
    return schemas.AskReportQuestionResponse(
        report=detail,
        answer=answer,
        remaining_free_questions=0 if refreshed_report.free_ai_question_used else 1,
    )


@router.post("/purchases/restore", response_model=schemas.RestorePurchasesResponse)
def restore_purchases(payload: schemas.PurchaseRestoreRequest, db: Session = Depends(get_db)):
    profile = _get_or_create_device_profile(db, payload.device_id)
    return schemas.RestorePurchasesResponse(
        success=True,
        message="Purchase restore is scaffolded and ready for RevenueCat integration.",
        restored_yearly_subscription=profile.yearly_subscription_active,
    )


@router.delete("/data", response_model=schemas.ActionResponse)
def delete_all_data(device_id: str, db: Session = Depends(get_db)):
    profile = (
        db.query(models.DeviceProfile)
        .filter(models.DeviceProfile.device_id == device_id)
        .first()
    )
    if profile:
        db.delete(profile)
        db.commit()
    return schemas.ActionResponse(success=True, message="All LabBuddy data for this device has been deleted.")
