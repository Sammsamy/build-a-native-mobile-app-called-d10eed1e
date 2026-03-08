import type { ImagePickerAsset } from 'expo-image-picker';

import { Alert, ScrollView, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';

import { SoftSectionCard, SparkTrend, TimelineMeter } from '@/components/labbuddy/ui';
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
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 120, gap: 14 }} showsVerticalScrollIndicator={false}>
        <View className="gap-2 px-1 pb-1">
          <Text className="text-xs font-semibold uppercase tracking-[1.2px]" style={{ color: '#9CC0FF' }}>History</Text>
          <Text className="text-[28px] font-semibold tracking-[-0.45px]" style={{ color: '#F7FBFF' }}>History &amp; trends</Text>
          <Text className="text-[15px] leading-6" style={{ color: '#AEBCCD' }}>
            The more unlocked reports you add, the more useful your story becomes.
          </Text>
        </View>

        <SoftSectionCard>
          <View className="gap-4">
            <View className="flex-row items-start justify-between gap-4">
              <View className="flex-1 gap-2">
                <Text className="text-lg font-semibold tracking-[-0.2px]" style={{ color: '#12243A' }}>Grow your timeline</Text>
                <Text className="text-sm leading-6 text-text-secondary">
                  Add older reports to unlock more context around changes in markers like LDL and A1C.
                </Text>
              </View>
              <View className="h-12 w-12 items-center justify-center rounded-[20px]" style={{ backgroundColor: '#EAF1FF' }}>
                <Ionicons name="time" size={22} color="#1E67FF" />
              </View>
            </View>
            <TimelineMeter
              score={dashboard?.profile.timeline_completeness_score ?? 0}
              caption={dashboard?.reports[0]?.timeline_hint ?? 'Upload 2 older reports to see your LDL/A1C timeline.'}
            />
            <Button onPress={() => void handleUploadOlderReport()}>
              Upload 2 older reports to grow your timeline
            </Button>
          </View>
        </SoftSectionCard>

        {dashboard?.health_age.visible ? (
          <SoftSectionCard>
            <View className="gap-4">
              <View className="flex-row items-center justify-between gap-4">
                <View className="flex-1 gap-1">
                  <Text className="text-lg font-semibold tracking-[-0.2px]">Health Age (estimate) – Beta</Text>
                  <Text className="text-sm leading-6 text-text-secondary">A lightweight estimate based on your unlocked trend data.</Text>
                </View>
                <View className="rounded-[20px] px-4 py-3" style={{ backgroundColor: '#EAF1FF' }}>
                  <Text className="text-2xl font-semibold" style={{ color: '#1E67FF' }}>{dashboard.health_age.estimated_age}</Text>
                </View>
              </View>
              <Text className="text-sm leading-6 text-text-secondary">Confidence: {dashboard.health_age.confidence_label} • {dashboard.health_age.confidence_reason}</Text>
              <Text className="text-xs leading-5 text-text-tertiary">{dashboard.health_age.disclaimer}</Text>
            </View>
          </SoftSectionCard>
        ) : (
          <SoftSectionCard>
            <View className="gap-3">
              <Text className="text-lg font-semibold tracking-[-0.2px]">Health Age (estimate) – Beta</Text>
              <Text className="text-sm leading-6 text-text-secondary">
                This appears once you have enough unlocked history to make an educational estimate with a confidence label.
              </Text>
            </View>
          </SoftSectionCard>
        )}

        <SoftSectionCard>
          <View className="gap-4">
            <Text className="text-lg font-semibold tracking-[-0.2px]">Trendlines</Text>
            {dashboard?.trend_series.length ? (
              <View className="gap-3">
                {dashboard.trend_series.slice(0, 4).map((series) => (
                  <SparkTrend key={series.biomarker_key} series={series} />
                ))}
              </View>
            ) : (
              <Text className="text-sm leading-6 text-text-secondary">
                Unlock at least 2 reports with the same biomarkers to start seeing simple trendlines here.
              </Text>
            )}
          </View>
        </SoftSectionCard>

        <SoftSectionCard>
          <View className="gap-4">
            <Text className="text-lg font-semibold tracking-[-0.2px]">Saved reports</Text>
            <View className="gap-3">
              {dashboard?.reports.length ? dashboard.reports.map((report) => (
                <View
                  key={report.id}
                  className="gap-2 rounded-[24px] border border-border p-4"
                  style={{ backgroundColor: '#F1F6FD' }}
                >
                  <View className="flex-row items-center justify-between gap-4">
                    <View className="flex-1 gap-1">
                      <Text className="font-semibold tracking-[-0.15px]" style={{ color: '#12243A' }}>{report.report_label}</Text>
                      <Text className="text-xs text-text-secondary">{report.collected_on ?? 'Date not available'} • {report.unlocked ? 'Unlocked' : 'Preview only'}</Text>
                    </View>
                    <Button variant="ghost" size="sm" onPress={() => router.push(`/report/${report.id}`)}>
                      Open
                    </Button>
                  </View>
                  <Text className="text-sm leading-6 text-text-secondary">{report.preview_summary}</Text>
                </View>
              )) : (
                <Text className="text-sm leading-6 text-text-secondary">No saved reports yet. Your unlocked reports will appear here automatically.</Text>
              )}
            </View>
          </View>
        </SoftSectionCard>
      </ScrollView>
    </StyledSafeAreaView>
  );
}
