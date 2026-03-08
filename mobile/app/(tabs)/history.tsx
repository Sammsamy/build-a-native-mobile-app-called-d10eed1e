import type { ImagePickerAsset } from 'expo-image-picker';

import { Alert, ScrollView, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';

import {
  IconBadge,
  ScreenHeader,
  SectionHeading,
  SoftSectionCard,
  SparkTrend,
  TimelineMeter,
  labBuddyPalette,
} from '@/components/labbuddy/ui';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { StyledSafeAreaView } from '@/lib/styled';
import { useLabBuddy } from '@/providers/labbuddy-provider';

export default function HistoryScreen() {
  const router = useRouter();
  const { analyzeAsset, dashboard } = useLabBuddy();

  async function handleHistoricalAsset(asset: ImagePickerAsset) {
    try {
      const detail = await analyzeAsset(asset, {
        sourceType: 'library',
        isHistoricalUpload: true,
        reportLabel: 'Older report',
      });
      router.push(`/report/${detail.id}`);
    } catch (error) {
      Alert.alert(
        'Couldn’t finish that upload',
        error instanceof Error ? error.message : 'Upload a screenshot of the lab table page for best results.',
      );
    }
  }

  async function handleUploadOlderReport() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photos access needed', 'Please allow photo access to add an older report to your timeline.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 1,
      allowsEditing: false,
      mediaTypes: ['images'],
    });

    if (!result.canceled && result.assets[0]) {
      await handleHistoricalAsset(result.assets[0]);
    }
  }

  return (
    <StyledSafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 120, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          eyebrow="History"
          title="History and trends"
          description="The more unlocked reports you add, the more useful your story becomes."
        />

        <SoftSectionCard>
          <View className="gap-4">
            <View className="flex-row items-start justify-between gap-4">
              <View className="flex-1">
                <SectionHeading
                  title="Grow your timeline"
                  description="Add older reports to unlock more context around changes in markers like LDL and A1C."
                />
              </View>
              <IconBadge icon="time" tone="primary" />
            </View>
            <TimelineMeter
              score={dashboard?.profile.timeline_completeness_score ?? 0}
              caption={dashboard?.reports[0]?.timeline_hint ?? 'Upload 2 older reports to see your LDL/A1C timeline.'}
            />
            <Button onPress={() => void handleUploadOlderReport()}>Upload older reports</Button>
          </View>
        </SoftSectionCard>

        {dashboard?.health_age.visible ? (
          <SoftSectionCard>
            <View className="gap-4">
              <View className="flex-row items-center justify-between gap-4">
                <View className="flex-1">
                  <SectionHeading
                    title="Health Age (estimate) — Beta"
                    description="A lightweight estimate based on your unlocked trend data."
                  />
                </View>
                <View className="rounded-[20px] px-4 py-3" style={{ backgroundColor: labBuddyPalette.primarySoft }}>
                  <Text className="text-2xl font-semibold leading-8" style={{ color: labBuddyPalette.primary }}>
                    {dashboard.health_age.estimated_age}
                  </Text>
                </View>
              </View>
              <Text className="text-sm leading-6 text-text-secondary">
                Confidence: {dashboard.health_age.confidence_label} • {dashboard.health_age.confidence_reason}
              </Text>
              <Text className="text-xs leading-5 text-text-tertiary">{dashboard.health_age.disclaimer}</Text>
            </View>
          </SoftSectionCard>
        ) : (
          <SoftSectionCard>
            <SectionHeading
              title="Health Age (estimate) — Beta"
              description="This appears once you have enough unlocked history for an educational estimate with a confidence label."
            />
          </SoftSectionCard>
        )}

        <SoftSectionCard>
          <View className="gap-4">
            <SectionHeading title="Trendlines" />
            {dashboard?.trend_series.length ? (
              <View className="gap-3">
                {dashboard.trend_series.slice(0, 4).map((series) => (
                  <SparkTrend key={series.biomarker_key} series={series} />
                ))}
              </View>
            ) : (
              <Text className="text-sm leading-6 text-text-secondary">
                Unlock at least 2 reports with the same biomarkers to see simple trendlines here.
              </Text>
            )}
          </View>
        </SoftSectionCard>

        <SoftSectionCard>
          <View className="gap-4">
            <SectionHeading title="Saved reports" />
            <View className="gap-3">
              {dashboard?.reports.length ? (
                dashboard.reports.map((report) => (
                  <View
                    key={report.id}
                    className="gap-3 rounded-[20px] border border-border bg-surface-muted p-4"
                  >
                    <View className="flex-row items-center justify-between gap-4">
                      <View className="flex-1 gap-1">
                        <Text className="font-semibold leading-6" style={{ color: labBuddyPalette.text }}>
                          {report.report_label}
                        </Text>
                        <Text className="text-xs leading-5 text-text-secondary">
                          {report.collected_on ?? 'Date not available'} • {report.unlocked ? 'Unlocked' : 'Preview only'}
                        </Text>
                      </View>
                      <Button variant="ghost" size="sm" onPress={() => router.push(`/report/${report.id}`)}>
                        Open
                      </Button>
                    </View>
                    <Text className="text-sm leading-6 text-text-secondary">{report.preview_summary}</Text>
                  </View>
                ))
              ) : (
                <Text className="text-sm leading-6 text-text-secondary">
                  No saved reports yet. Your unlocked reports will appear here automatically.
                </Text>
              )}
            </View>
          </View>
        </SoftSectionCard>
      </ScrollView>
    </StyledSafeAreaView>
  );
}
