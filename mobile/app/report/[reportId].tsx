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
import Ionicons from '@expo/vector-icons/Ionicons';

import { InlineMetric, SoftSectionCard, SparkTrend, StatusPill, TimelineMeter } from '@/components/labbuddy/ui';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/Text';
import { useLabBuddy } from '@/providers/labbuddy-provider';
import { shadows } from '@/theme/shadows';

function getStatusColor(status: string): string {
  if (status === 'high') {
    return '#C4485F';
  }
  if (status === 'low' || status === 'medium') {
    return '#BC7A00';
  }
  return '#2F8F5B';
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
    <View className="rounded-[28px] border border-border/50 p-5 gap-4" style={[shadows.sm, { backgroundColor: '#FFFFFF' }]}>
      <View className="flex-row items-start justify-between gap-4">
        <View className="flex-1 gap-1">
          <Text className="text-lg font-semibold">{card.display_name}</Text>
          <Text className="text-sm text-text-secondary">{card.category}</Text>
        </View>
        <StatusPill status={card.status} label={card.status_label} />
      </View>

      <View className="flex-row items-end justify-between gap-4">
        <InlineMetric label="Value" value={`${card.value_text} ${card.unit}`} valueTone={tone} />
        <InlineMetric label="Reference" value={card.reference_text} />
      </View>

      <View className="gap-2">
        <View className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: '#E6ECF5' }}>
          <View className="h-full rounded-full" style={{ width: `${progress * 100}%`, backgroundColor: tone }} />
        </View>
        <Text className="text-xs text-text-tertiary">Confidence: {card.confidence_label}</Text>
      </View>

      <View className="gap-2">
        <Text className="font-semibold">Quick takeaway</Text>
        <Text className="text-sm leading-6 text-text-secondary">{card.quick_takeaway}</Text>
        <Text className="text-sm leading-6 text-text-secondary">{card.simple_translation}</Text>
        <Text className="text-sm leading-6 text-text-secondary">{card.calm_explanation}</Text>
      </View>

      <View className="gap-2">
        <Text className="font-semibold">Questions to ask your clinician</Text>
        {card.clinician_questions.map((question) => (
          <View key={question} className="flex-row gap-3 items-start">
            <Ionicons name="help-circle" size={18} color="#1E67FF" style={{ marginTop: 3 }} />
            <Text className="flex-1 text-sm leading-6 text-text-secondary">{question}</Text>
          </View>
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
        <View className="gap-2">
          <Text className="text-lg font-semibold">Ask AI</Text>
          <Text className="text-sm leading-6 text-text-secondary">
            {report.has_unlimited_ai
              ? 'Unlimited follow-up questions are unlocked for this report.'
              : report.free_ai_question_used
                ? 'Your free question was used on this report. Unlock to keep asking.'
                : 'You have 1 free follow-up question for this report before unlock.'}
          </Text>
        </View>

        {report.ai_messages.length ? (
          <View className="gap-3">
            {report.ai_messages.map((message) => (
              <View key={message.id} className="rounded-[22px] p-4 gap-2" style={{ backgroundColor: '#F8FAFD' }}>
                <Text className="text-xs uppercase tracking-[1px] text-text-tertiary">You asked</Text>
                <Text className="text-sm font-medium" style={{ color: '#132238' }}>{message.question_text}</Text>
                <Text className="text-xs uppercase tracking-[1px] text-text-tertiary mt-2">LabBuddy</Text>
                <Text className="text-sm leading-6 text-text-secondary">{message.answer_text}</Text>
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
        <Button className="rounded-[22px]" disabled={lockedAfterFree || question.trim().length === 0} onPress={onSubmit}>
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
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: '#F5F8FC' }}>
        <ActivityIndicator size="large" color="#1E67FF" />
        <Text className="mt-4 text-sm text-text-secondary">Reading your report…</Text>
      </View>
    );
  }

  if (!report) {
    return (
      <View className="flex-1 items-center justify-center px-8" style={{ backgroundColor: '#F5F8FC' }}>
        <Text className="text-lg font-semibold">We couldn’t find this report.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#F5F8FC' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 20, paddingBottom: 120, gap: 18 }}>
        <SoftSectionCard>
          <View className="gap-4">
            <View className="gap-3">
              <StatusPill status={report.urgent_level} label={report.urgent_label} />
              <View className="gap-1">
                <Text className="text-2xl font-semibold" style={{ color: '#132238' }}>{report.report_label}</Text>
                <Text className="text-sm text-text-secondary">{report.collected_on ?? 'Date not available'} • Educational only</Text>
              </View>
            </View>
            <Text className="text-sm leading-6 text-text-secondary">{report.preview_summary}</Text>
            <Text className="text-sm leading-6 text-text-secondary">{report.urgent_message}</Text>
            <View className="gap-2">
              {report.preview_takeaways.map((item) => (
                <View key={item} className="flex-row items-start gap-3">
                  <Ionicons name="checkmark-circle" size={18} color="#2F8F5B" style={{ marginTop: 3 }} />
                  <Text className="flex-1 text-sm leading-6 text-text-secondary">{item}</Text>
                </View>
              ))}
            </View>
          </View>
        </SoftSectionCard>

        <SoftSectionCard>
          <View className="gap-4">
            <Text className="text-lg font-semibold">Flagged items</Text>
            {report.flagged_items.length ? report.flagged_items.map((item) => (
              <View key={`${item.biomarker_key}-${item.label}`} className="rounded-[22px] p-4 gap-2" style={{ backgroundColor: '#FFFFFF' }}>
                <StatusPill status={item.status} label={item.label} />
                <Text className="text-sm leading-6 text-text-secondary">{item.reason}</Text>
              </View>
            )) : (
              <Text className="text-sm leading-6 text-text-secondary">Nothing clearly stands out in the previewed markers.</Text>
            )}
          </View>
        </SoftSectionCard>

        <AskAiSection report={report} question={question} onChangeQuestion={setQuestion} onSubmit={() => void handleAskQuestion()} />

        {!report.unlocked ? (
          <SoftSectionCard>
            <View className="gap-4">
              <View className="gap-2">
                <Text className="text-lg font-semibold">Unlock full report — $4.99</Text>
                <Text className="text-sm leading-6 text-text-secondary">
                  One-time unlock. About the price of a coffee. This saves the report to history, unlocks every biomarker card, and enables unlimited Ask AI for this report.
                </Text>
              </View>
              <TimelineMeter score={report.timeline_completeness_score} caption={report.timeline_hint} />
              <Button className="rounded-[22px]" onPress={() => void handleUnlock()}>
                Unlock full report — $4.99
              </Button>
              <View className="rounded-[22px] p-4 gap-2" style={{ backgroundColor: '#EEF4FF' }}>
                <Text className="font-semibold" style={{ color: '#163C7A' }}>Yearly plan scaffold</Text>
                <Text className="text-sm leading-6" style={{ color: '#4A5B73' }}>
                  $19.99/year • Unlimited reports + unlimited Ask AI. This architecture is ready for RevenueCat and Apple IAP wiring.
                </Text>
              </View>
            </View>
          </SoftSectionCard>
        ) : null}

        {report.unlocked ? (
          <View className="gap-4">
            <Text className="text-lg font-semibold px-1">Full report</Text>
            {report.biomarker_cards.map((card) => (
              <BiomarkerCardView key={card.id} card={card} />
            ))}
            {report.trend_series.length ? (
              <SoftSectionCard>
                <View className="gap-4">
                  <Text className="text-lg font-semibold">Relevant trends</Text>
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
