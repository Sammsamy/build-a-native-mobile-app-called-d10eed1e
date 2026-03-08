import type { BiomarkerCard, ReportDetail } from '@/types/labbuddy';

import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native';

import { useLocalSearchParams } from 'expo-router';

import {
  InlineMetric,
  SectionHeading,
  SoftSectionCard,
  SparkTrend,
  StatusPill,
  SurfaceListItem,
  TimelineMeter,
  labBuddyPalette,
} from '@/components/labbuddy/ui';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/Text';
import { useLabBuddy } from '@/providers/labbuddy-provider';
import { shadows } from '@/theme/shadows';

function getStatusColor(status: string): string {
  if (status === 'high') {
    return labBuddyPalette.danger;
  }
  if (status === 'low' || status === 'medium') {
    return labBuddyPalette.warning;
  }
  return labBuddyPalette.success;
}

function getRangeProgress(card: BiomarkerCard): number {
  if (card.numeric_value === null || card.reference_low === null || card.reference_high === null) {
    return 0.5;
  }

  const spread = card.reference_high - card.reference_low;
  if (spread <= 0) {
    return 0.5;
  }

  return Math.min(Math.max((card.numeric_value - card.reference_low) / spread, 0), 1);
}

function BiomarkerCardView({ card }: { card: BiomarkerCard }) {
  const progress = getRangeProgress(card);
  const tone = getStatusColor(card.status);

  return (
    <View className="gap-4 rounded-[24px] border border-border bg-surface-elevated p-5" style={shadows.md}>
      <View className="flex-row items-start justify-between gap-4">
        <View className="flex-1 gap-1">
          <Text className="text-[20px] font-semibold leading-7 tracking-[-0.2px]">{card.display_name}</Text>
          <Text className="text-sm leading-6 text-text-secondary">{card.category}</Text>
        </View>
        <StatusPill status={card.status} label={card.status_label} />
      </View>

      <View className="flex-row items-end justify-between gap-4">
        <InlineMetric label="Value" value={`${card.value_text} ${card.unit}`} valueTone={tone} />
        <InlineMetric label="Reference" value={card.reference_text} />
      </View>

      <View className="gap-2">
        <View className="h-3 overflow-hidden rounded-full" style={{ backgroundColor: '#E6ECF5' }}>
          <View className="h-full rounded-full" style={{ width: `${progress * 100}%`, backgroundColor: tone }} />
        </View>
        <Text className="text-xs leading-5 text-text-tertiary">Confidence: {card.confidence_label}</Text>
      </View>

      <View className="gap-2">
        <Text className="font-semibold leading-6" style={{ color: labBuddyPalette.text }}>
          Quick takeaway
        </Text>
        <Text className="text-sm leading-6 text-text-secondary">{card.quick_takeaway}</Text>
        <Text className="text-sm leading-6 text-text-secondary">{card.simple_translation}</Text>
        <Text className="text-sm leading-6 text-text-secondary">{card.calm_explanation}</Text>
      </View>

      <View className="gap-3">
        <Text className="font-semibold leading-6" style={{ color: labBuddyPalette.text }}>
          Questions to ask your clinician
        </Text>
        {card.clinician_questions.map((question) => (
          <SurfaceListItem key={question} icon="help-circle" tone="primary">
            <Text className="text-sm leading-6 text-text-secondary">{question}</Text>
          </SurfaceListItem>
        ))}
      </View>
    </View>
  );
}

function AskAiSection({
  report,
  question,
  onChangeQuestion,
  onSubmit,
}: {
  report: ReportDetail;
  question: string;
  onChangeQuestion: (value: string) => void;
  onSubmit: () => void;
}) {
  const lockedAfterFree = !report.has_unlimited_ai && report.free_ai_question_used;

  return (
    <SoftSectionCard>
      <View className="gap-4">
        <SectionHeading
          title="Ask AI"
          description={
            report.has_unlimited_ai
              ? 'Unlimited follow-up questions are unlocked for this report.'
              : report.free_ai_question_used
                ? 'Your free question was used on this report. Unlock to keep asking.'
                : 'You have 1 free follow-up question for this report before unlock.'
          }
        />

        {report.ai_messages.length ? (
          <View className="gap-3">
            {report.ai_messages.map((message) => (
              <View key={message.id} className="gap-3 rounded-[20px] border border-border bg-surface-muted p-4">
                <View className="gap-1">
                  <Text className="text-xs font-medium uppercase tracking-[0.8px] text-text-tertiary">You asked</Text>
                  <Text className="text-sm font-medium leading-6" style={{ color: labBuddyPalette.text }}>
                    {message.question_text}
                  </Text>
                </View>
                <View className="gap-1">
                  <Text className="text-xs font-medium uppercase tracking-[0.8px] text-text-tertiary">LabBuddy</Text>
                  <Text className="text-sm leading-6 text-text-secondary">{message.answer_text}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        <Input
          value={question}
          onChangeText={onChangeQuestion}
          placeholder={lockedAfterFree ? 'Unlock this report to ask more questions' : 'Ask a calm, practical follow-up question'}
          editable={!lockedAfterFree}
          multiline
          style={{ minHeight: 96, textAlignVertical: 'top' }}
        />
        <Button disabled={lockedAfterFree || question.trim().length === 0} onPress={onSubmit}>
          Ask about this report
        </Button>
      </View>
    </SoftSectionCard>
  );
}

export default function ReportScreen() {
  const params = useLocalSearchParams<{ reportId: string }>();
  const { getReportDetail, unlockSelectedReport, askReportQuestion } = useLabBuddy();
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [screenLoading, setScreenLoading] = useState(true);
  const [question, setQuestion] = useState('');

  const reportId = useMemo(() => Number(params.reportId), [params.reportId]);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!Number.isFinite(reportId)) {
        return;
      }

      try {
        setScreenLoading(true);
        const detail = await getReportDetail(reportId);
        if (active) {
          setReport(detail);
        }
      } catch (error) {
        if (active) {
          Alert.alert('Couldn’t load this report', error instanceof Error ? error.message : 'Please try again.');
        }
      } finally {
        if (active) {
          setScreenLoading(false);
        }
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [getReportDetail, reportId]);

  async function handleUnlock() {
    if (!report) {
      return;
    }

    try {
      const detail = await unlockSelectedReport(report.id);
      setReport(detail);
    } catch (error) {
      Alert.alert('Unlock full report', error instanceof Error ? error.message : 'Please try again.');
    }
  }

  async function handleAskQuestion() {
    if (!report || !question.trim()) {
      return;
    }

    try {
      const detail = await askReportQuestion(report.id, question.trim());
      setReport(detail);
      setQuestion('');
    } catch (error) {
      Alert.alert('Ask AI', error instanceof Error ? error.message : 'Please try again.');
    }
  }

  if (screenLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: labBuddyPalette.shell }}>
        <ActivityIndicator size="large" color={labBuddyPalette.shellAccent} />
        <Text className="mt-4 text-sm leading-6" style={{ color: labBuddyPalette.shellTextSecondary }}>
          Reading your report…
        </Text>
      </View>
    );
  }

  if (!report) {
    return (
      <View className="flex-1 items-center justify-center px-8" style={{ backgroundColor: labBuddyPalette.shell }}>
        <Text className="text-lg font-semibold leading-7" style={{ color: labBuddyPalette.shellText }}>
          We couldn’t find this report.
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: labBuddyPalette.shell }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 120, gap: 20 }}
      >
        <View className="gap-2 px-1 pb-1">
          <Text className="text-xs font-semibold uppercase tracking-[0.9px]" style={{ color: labBuddyPalette.shellAccent }}>
            Report
          </Text>
          <Text className="text-[28px] font-semibold leading-[34px] tracking-[-0.3px]" style={{ color: labBuddyPalette.shellText }}>
            {report.report_label}
          </Text>
          <Text className="text-[15px] leading-6" style={{ color: labBuddyPalette.shellTextSecondary }}>
            {report.collected_on ?? 'Date not available'} • Educational only
          </Text>
        </View>

        <SoftSectionCard>
          <View className="gap-4">
            <View className="gap-3">
              <StatusPill status={report.urgent_level} label={report.urgent_label} />
              <SectionHeading title="Free preview summary" />
              <Text className="text-sm leading-6 text-text-secondary">{report.preview_summary}</Text>
              <Text className="text-sm leading-6 text-text-secondary">{report.urgent_message}</Text>
            </View>
            <View className="gap-3">
              {report.preview_takeaways.map((item) => (
                <SurfaceListItem key={item} icon="checkmark-circle" tone="success">
                  <Text className="text-sm leading-6 text-text-secondary">{item}</Text>
                </SurfaceListItem>
              ))}
            </View>
          </View>
        </SoftSectionCard>

        <SoftSectionCard>
          <View className="gap-4">
            <SectionHeading title="Flagged items" />
            {report.flagged_items.length ? (
              report.flagged_items.map((item) => (
                <View key={`${item.biomarker_key}-${item.label}`} className="gap-3 rounded-[20px] border border-border bg-surface-muted p-4">
                  <StatusPill status={item.status} label={item.label} />
                  <Text className="text-sm leading-6 text-text-secondary">{item.reason}</Text>
                </View>
              ))
            ) : (
              <Text className="text-sm leading-6 text-text-secondary">Nothing clearly stands out in the previewed markers.</Text>
            )}
          </View>
        </SoftSectionCard>

        <AskAiSection report={report} question={question} onChangeQuestion={setQuestion} onSubmit={() => void handleAskQuestion()} />

        {!report.unlocked ? (
          <SoftSectionCard>
            <View className="gap-4">
              <SectionHeading
                title="Unlock full report — $4.99"
                description="One-time unlock. About the price of a coffee. Save this report to history, open every biomarker card, and keep asking report-specific questions."
              />
              <TimelineMeter score={report.timeline_completeness_score} caption={report.timeline_hint} />
              <Button onPress={() => void handleUnlock()}>Unlock full report — $4.99</Button>
              <View className="gap-2 rounded-[20px] border border-border px-4 py-4" style={{ backgroundColor: '#EEF4FF' }}>
                <Text className="font-semibold leading-6" style={{ color: '#163C7A' }}>
                  Yearly plan scaffold
                </Text>
                <Text className="text-sm leading-6" style={{ color: labBuddyPalette.textSecondary }}>
                  $19.99/year • Unlimited reports and unlimited Ask AI. This architecture is ready for RevenueCat and Apple IAP wiring.
                </Text>
              </View>
            </View>
          </SoftSectionCard>
        ) : null}

        {report.unlocked ? (
          <View className="gap-5">
            <View className="px-1">
              <Text className="text-lg font-semibold leading-7 tracking-[-0.2px]" style={{ color: labBuddyPalette.shellText }}>
                Full report
              </Text>
            </View>
            <View className="gap-4">
              {report.biomarker_cards.map((card) => (
                <BiomarkerCardView key={card.id} card={card} />
              ))}
            </View>
            {report.trend_series.length ? (
              <SoftSectionCard>
                <View className="gap-4">
                  <SectionHeading title="Relevant trends" />
                  {report.trend_series.slice(0, 3).map((series) => (
                    <SparkTrend key={series.biomarker_key} series={series} />
                  ))}
                </View>
              </SoftSectionCard>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
