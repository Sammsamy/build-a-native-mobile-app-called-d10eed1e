"""Database models for the LabBuddy MVP."""

from __future__ import annotations

from datetime import date, datetime
from typing import Any

from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, Integer, JSON, String, Text, func, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class DeviceProfile(Base):
    __tablename__ = "device_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    device_id: Mapped[str] = mapped_column(String(120), unique=True, index=True, nullable=False)
    safety_acknowledged: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    safety_acknowledged_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    yearly_subscription_active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    subscription_status: Mapped[str] = mapped_column(String(32), nullable=False, server_default=text("'inactive'"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    reports: Mapped[list["LabReport"]] = relationship(
        "LabReport",
        back_populates="device_profile",
        cascade="all, delete-orphan",
        order_by="desc(LabReport.collected_on), desc(LabReport.created_at)",
    )


class LabReport(Base):
    __tablename__ = "lab_reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    device_profile_id: Mapped[int] = mapped_column(ForeignKey("device_profiles.id"), nullable=False, index=True)
    report_label: Mapped[str] = mapped_column(String(120), nullable=False)
    lab_name: Mapped[str] = mapped_column(String(120), nullable=False, server_default=text("'LabBuddy Scan'"))
    source_type: Mapped[str] = mapped_column(String(24), nullable=False)
    content_type: Mapped[str] = mapped_column(String(80), nullable=False)
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    image_public_url: Mapped[str] = mapped_column(String(1000), nullable=False)
    image_object_key: Mapped[str] = mapped_column(String(500), nullable=False)
    collected_on: Mapped[date | None] = mapped_column(Date, nullable=True)
    is_historical_upload: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    analysis_status: Mapped[str] = mapped_column(String(32), nullable=False, server_default=text("'ready'"))
    preview_summary: Mapped[str] = mapped_column(Text, nullable=False)
    urgent_level: Mapped[str] = mapped_column(String(24), nullable=False)
    urgent_label: Mapped[str] = mapped_column(String(120), nullable=False)
    urgent_message: Mapped[str] = mapped_column(Text, nullable=False)
    flagged_items: Mapped[list[dict[str, Any]]] = mapped_column(JSON, nullable=False, default=list)
    preview_takeaways: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    timeline_hint: Mapped[str] = mapped_column(Text, nullable=False)
    timeline_completeness_score: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    free_ai_question_used: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    unlocked: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    unlock_source: Mapped[str | None] = mapped_column(String(32), nullable=True)
    unlocked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    purchase_price_label: Mapped[str | None] = mapped_column(String(32), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    device_profile: Mapped[DeviceProfile] = relationship("DeviceProfile", back_populates="reports")
    biomarkers: Mapped[list["BiomarkerResult"]] = relationship(
        "BiomarkerResult",
        back_populates="report",
        cascade="all, delete-orphan",
        order_by="BiomarkerResult.display_order",
    )
    ai_messages: Mapped[list["ReportQuestion"]] = relationship(
        "ReportQuestion",
        back_populates="report",
        cascade="all, delete-orphan",
        order_by="ReportQuestion.created_at",
    )


class BiomarkerResult(Base):
    __tablename__ = "biomarker_results"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    report_id: Mapped[int] = mapped_column(ForeignKey("lab_reports.id"), nullable=False, index=True)
    biomarker_key: Mapped[str] = mapped_column(String(80), nullable=False, index=True)
    display_name: Mapped[str] = mapped_column(String(120), nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    category: Mapped[str] = mapped_column(String(80), nullable=False)
    value_text: Mapped[str] = mapped_column(String(64), nullable=False)
    numeric_value: Mapped[float | None] = mapped_column(Float, nullable=True)
    unit: Mapped[str] = mapped_column(String(40), nullable=False)
    reference_text: Mapped[str] = mapped_column(String(120), nullable=False)
    reference_low: Mapped[float | None] = mapped_column(Float, nullable=True)
    reference_high: Mapped[float | None] = mapped_column(Float, nullable=True)
    status: Mapped[str] = mapped_column(String(24), nullable=False)
    status_label: Mapped[str] = mapped_column(String(80), nullable=False)
    quick_takeaway: Mapped[str] = mapped_column(Text, nullable=False)
    simple_translation: Mapped[str] = mapped_column(Text, nullable=False)
    calm_explanation: Mapped[str] = mapped_column(Text, nullable=False)
    confidence_label: Mapped[str] = mapped_column(String(32), nullable=False)
    confidence_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.5)
    clinician_questions: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    trend_note: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    report: Mapped[LabReport] = relationship("LabReport", back_populates="biomarkers")


class ReportQuestion(Base):
    __tablename__ = "report_questions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    report_id: Mapped[int] = mapped_column(ForeignKey("lab_reports.id"), nullable=False, index=True)
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    answer_text: Mapped[str] = mapped_column(Text, nullable=False)
    access_tier: Mapped[str] = mapped_column(String(24), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    report: Mapped[LabReport] = relationship("LabReport", back_populates="ai_messages")
