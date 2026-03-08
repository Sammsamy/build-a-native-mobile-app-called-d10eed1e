export interface FlaggedItem {
  biomarker_key: string;
  label: string;
  status: string;
  reason: string;
}

export interface BiomarkerCard {
  id: number;
  biomarker_key: string;
  display_name: string;
  display_order: number;
  category: string;
  value_text: string;
  numeric_value: number | null;
  unit: string;
  reference_text: string;
  reference_low: number | null;
  reference_high: number | null;
  status: string;
  status_label: string;
  quick_takeaway: string;
  simple_translation: string;
  calm_explanation: string;
  confidence_label: string;
  confidence_score: number;
  clinician_questions: string[];
  trend_note: string;
}

export interface AiMessage {
  id: number;
  question_text: string;
  answer_text: string;
  access_tier: string;
  created_at: string;
}

export interface TrendPoint {
  report_id: number;
  collected_on: string | null;
  value: number;
  value_text: string;
}

export interface TrendSeries {
  biomarker_key: string;
  display_name: string;
  unit: string;
  status_hint: string;
  enough_data: boolean;
  points: TrendPoint[];
}

export interface HealthAgeEstimate {
  visible: boolean;
  estimated_age: number | null;
  confidence_label: string | null;
  confidence_reason: string | null;
  disclaimer: string;
}

export interface ReportListItem {
  id: number;
  report_label: string;
  lab_name: string;
  collected_on: string | null;
  preview_summary: string;
  urgent_level: string;
  urgent_label: string;
  flagged_count: number;
  unlocked: boolean;
  free_ai_question_used: boolean;
  timeline_hint: string;
  timeline_completeness_score: number;
  is_historical_upload: boolean;
  created_at: string;
}

export interface ReportDetail {
  id: number;
  report_label: string;
  lab_name: string;
  source_type: string;
  collected_on: string | null;
  preview_summary: string;
  urgent_level: string;
  urgent_label: string;
  urgent_message: string;
  flagged_items: FlaggedItem[];
  preview_takeaways: string[];
  timeline_hint: string;
  timeline_completeness_score: number;
  unlocked: boolean;
  unlock_source: string | null;
  purchase_price_label: string | null;
  free_ai_question_used: boolean;
  can_ask_free_question: boolean;
  has_unlimited_ai: boolean;
  biomarker_cards: BiomarkerCard[];
  ai_messages: AiMessage[];
  trend_series: TrendSeries[];
  created_at: string;
}

export interface DeviceProfileSummary {
  device_id: string;
  safety_acknowledged: boolean;
  yearly_subscription_active: boolean;
  total_reports: number;
  unlocked_reports: number;
  trend_ready_reports: number;
  timeline_completeness_score: number;
}

export interface DashboardResponse {
  profile: DeviceProfileSummary;
  reports: ReportListItem[];
  trend_series: TrendSeries[];
  health_age: HealthAgeEstimate;
  purchase_options: Record<string, string>;
  trend_cta: string;
}

export interface DeviceSessionResponse {
  device_id: string;
  auth_token: string;
  expires_at: string;
}

export interface AnalyzeReportPayload {
  report_label?: string;
  source_type: 'camera' | 'library';
  content_type: string;
  original_filename: string;
  image_public_url: string;
  image_object_key: string;
  collected_on?: string;
  is_historical_upload: boolean;
}

export interface AskReportQuestionPayload {
  question: string;
}

export interface UnlockReportPayload {
  product_key: string;
}

export interface ActionResponse {
  success: boolean;
  message: string;
}

export interface RestorePurchasesResponse extends ActionResponse {
  restored_yearly_subscription: boolean;
}

export interface AskReportQuestionResponse {
  report: ReportDetail;
  answer: AiMessage;
  remaining_free_questions: number;
}

export interface RuntimeUploadContract {
  upload_url: string;
  method: string;
  object_key: string;
  original_filename: string;
  public_url: string;
  headers: Record<string, string>;
}
