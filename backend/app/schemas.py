from __future__ import annotations

from datetime import date, datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, model_validator


class BaseSchema(BaseModel):
    """Base schema with common Pydantic configuration."""

    model_config = ConfigDict(from_attributes=True, str_strip_whitespace=True)

    @model_validator(mode="before")
    @classmethod
    def reject_null_bytes(cls, data: Any) -> Any:
        if isinstance(data, dict):
            for key, value in data.items():
                if isinstance(value, str) and "\x00" in value:
                    raise ValueError(f"Null bytes are not allowed in field '{key}'")
        return data


class TimestampMixin(BaseModel):
    created_at: datetime
    updated_at: datetime


class FlaggedItem(BaseSchema):
    biomarker_key: str
    label: str
    status: str
    reason: str


class BiomarkerCard(BaseSchema):
    id: int
    biomarker_key: str
    display_name: str
    display_order: int
    category: str
    value_text: str
    numeric_value: float | None = None
    unit: str
    reference_text: str
    reference_low: float | None = None
    reference_high: float | None = None
    status: str
    status_label: str
    quick_takeaway: str
    simple_translation: str
    calm_explanation: str
    confidence_label: str
    confidence_score: float
    clinician_questions: list[str] = Field(default_factory=list)
    trend_note: str


class AiMessage(BaseSchema):
    id: int
    question_text: str
    answer_text: str
    access_tier: str
    created_at: datetime


class TrendPoint(BaseSchema):
    report_id: int
    collected_on: date | None = None
    value: float
    value_text: str


class TrendSeries(BaseSchema):
    biomarker_key: str
    display_name: str
    unit: str
    status_hint: str
    enough_data: bool
    points: list[TrendPoint] = Field(default_factory=list)


class HealthAgeEstimate(BaseSchema):
    visible: bool
    estimated_age: int | None = None
    confidence_label: str | None = None
    confidence_reason: str | None = None
    disclaimer: str


class ReportListItem(BaseSchema):
    id: int
    report_label: str
    lab_name: str
    collected_on: date | None = None
    preview_summary: str
    urgent_level: str
    urgent_label: str
    flagged_count: int
    unlocked: bool
    free_ai_question_used: bool
    timeline_hint: str
    timeline_completeness_score: float
    is_historical_upload: bool
    created_at: datetime


class ReportDetail(BaseSchema):
    id: int
    report_label: str
    lab_name: str
    source_type: str
    collected_on: date | None = None
    preview_summary: str
    urgent_level: str
    urgent_label: str
    urgent_message: str
    flagged_items: list[FlaggedItem] = Field(default_factory=list)
    preview_takeaways: list[str] = Field(default_factory=list)
    timeline_hint: str
    timeline_completeness_score: float
    unlocked: bool
    unlock_source: str | None = None
    purchase_price_label: str | None = None
    free_ai_question_used: bool
    can_ask_free_question: bool
    has_unlimited_ai: bool
    biomarker_cards: list[BiomarkerCard] = Field(default_factory=list)
    ai_messages: list[AiMessage] = Field(default_factory=list)
    trend_series: list[TrendSeries] = Field(default_factory=list)
    created_at: datetime


class DeviceProfileSummary(BaseSchema):
    device_id: str
    safety_acknowledged: bool
    yearly_subscription_active: bool
    total_reports: int
    unlocked_reports: int
    trend_ready_reports: int
    timeline_completeness_score: float


class DashboardResponse(BaseSchema):
    profile: DeviceProfileSummary
    reports: list[ReportListItem] = Field(default_factory=list)
    trend_series: list[TrendSeries] = Field(default_factory=list)
    health_age: HealthAgeEstimate
    purchase_options: dict[str, str]
    trend_cta: str


class AnalyzeReportRequest(BaseSchema):
    device_id: str
    report_label: str | None = None
    source_type: str
    content_type: str
    original_filename: str
    image_public_url: str
    image_object_key: str
    collected_on: date | None = None
    is_historical_upload: bool = False


class AskReportQuestionRequest(BaseSchema):
    device_id: str
    question: str


class UnlockReportRequest(BaseSchema):
    device_id: str
    product_key: str = "report_unlock"


class SafetyAcknowledgeRequest(BaseSchema):
    device_id: str


class PurchaseRestoreRequest(BaseSchema):
    device_id: str


class ActionResponse(BaseSchema):
    success: bool
    message: str


class RestorePurchasesResponse(ActionResponse):
    restored_yearly_subscription: bool


class AskReportQuestionResponse(BaseSchema):
    report: ReportDetail
    answer: AiMessage
    remaining_free_questions: int
