import type { ImagePickerAsset } from 'expo-image-picker';

import { useMemo } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import {
  GradientHeroCard,
  ReportTeaserCard,
  SoftSectionCard,
  StatusPill,
  TimelineMeter,
} from '@/components/labbuddy/ui';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { StyledSafeAreaView } from '@/lib/styled';
import { useLabBuddy } from '@/providers/labbuddy-provider';

export default function HomeScreen() {
  const router = useRouter();
  const { analyzeAsset, dashboard, isBootstrapping } = useLabBuddy();

  const recentReport = dashboard?.reports[0] ?? null;
  const timelineScore = dashboard?.profile.timeline_completeness_score ?? 0;
  const unlockedReports = dashboard?.profile.unlocked_reports ?? 0;
  const totalReports = dashboard?.profile.total_reports ?? 0;

  const teaserSteps = useMemo(() => [
    'Free preview summary',
    'One Ask AI follow-up',
    'Unlock full report + save to history',
    'Add older reports for trendlines',
  ], []);

  async function handleSelectedAsset(asset: ImagePickerAsset, sourceType: 'camera' | 'library') {
    try {
      const detail = await analyzeAsset(asset, {
        sourceType,
        isHistoricalUpload: false,
        reportLabel: sourceType === 'camera' ? 'Latest report' : 'Uploaded report',
      });
      router.push(`/report/${detail.id}`);
    } catch (error) {
      Alert.alert(
        'We couldn’t finish that upload',
        error instanceof Error ? error.message : 'Upload a screenshot of the lab table page for best results.',
      );
    }
  }

  async function handleCamera() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Camera access needed', 'Please allow camera access to scan your lab report.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 1,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets[0]) {
      await handleSelectedAsset(result.assets[0], 'camera');
    }
  }

  async function handleLibrary() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photos access needed', 'Please allow photo access to upload a screenshot of your labs.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 1,
      allowsEditing: false,
      mediaTypes: ['images'],
    });

    if (!result.canceled && result.assets[0]) {
      await handleSelectedAsset(result.assets[0], 'library');
    }
  }

  return (
    <StyledSafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 120, gap: 18 }} showsVerticalScrollIndicator={false}>
        <GradientHeroCard>
          <View className="gap-6">
            <View className="gap-3">
              <View className="self-start rounded-full px-3 py-2 flex-row items-center gap-2" style={{ backgroundColor: '#FFFFFFCC' }}>
                <Ionicons name="shield-checkmark" size={16} color="#1E67FF" />
                <Text className="text-xs font-semibold" style={{ color: '#1E67FF' }}>Calm, simple, trustworthy</Text>
              </View>
              <View className="gap-2">
                <Text className="text-[34px] leading-[40px] font-semibold tracking-[-0.6px]" style={{ color: '#132238' }}>LabBuddy</Text>
                <Text className="text-base leading-7" style={{ color: '#4A5B73' }}>Understand your lab results with confidence.</Text>
              </View>
            </View>

            <View className="gap-3">
              <Button className="rounded-[24px]" onPress={() => void handleCamera()}>
                Scan my labs
              </Button>
              <Button variant="secondary" className="rounded-[24px]" onPress={() => void handleLibrary()}>
                Upload a photo or screenshot
              </Button>
            </View>

            <View className="flex-row gap-4">
              <View className="flex-1 rounded-[24px] p-4" style={{ backgroundColor: '#FFFFFFCC' }}>
                <Text className="text-xs uppercase tracking-[1px] text-text-tertiary">Unlocked reports</Text>
                <Text className="text-2xl font-semibold mt-2" style={{ color: '#132238' }}>{unlockedReports}</Text>
              </View>
              <View className="flex-1 rounded-[24px] p-4" style={{ backgroundColor: '#FFFFFFCC' }}>
                <Text className="text-xs uppercase tracking-[1px] text-text-tertiary">History depth</Text>
                <Text className="text-2xl font-semibold mt-2" style={{ color: '#132238' }}>{totalReports}</Text>
              </View>
            </View>
          </View>
        </GradientHeroCard>

        <SoftSectionCard>
          <View className="gap-4">
            <View className="flex-row items-start justify-between gap-4">
              <View className="flex-1 gap-2">
                <Text className="text-lg font-semibold">{dashboard?.trend_cta ?? 'Unlock your 5-year trends'}</Text>
                <Text className="text-sm leading-6 text-text-secondary">
                  Upload older reports to see how markers like LDL and A1C change over time.
                </Text>
              </View>
              <View className="h-12 w-12 rounded-2xl items-center justify-center" style={{ backgroundColor: '#EAF7F0' }}>
                <Ionicons name="sparkles" size={22} color="#2F8F5B" />
              </View>
            </View>
            <TimelineMeter
              score={timelineScore}
              caption={dashboard?.reports[0]?.timeline_hint ?? 'Upload 2 older reports to see your LDL/A1C timeline.'}
            />
            <Button variant="secondary" className="rounded-[22px]" onPress={() => router.push('/(tabs)/history')}>
              Unlock your 5-year trends
            </Button>
          </View>
        </SoftSectionCard>

        <SoftSectionCard>
          <View className="gap-4">
            <View className="gap-1">
              <Text className="text-lg font-semibold">What you get with each report</Text>
              <Text className="text-sm leading-6 text-text-secondary">
                Enough clarity to reduce panic first, then deeper context once you unlock the full report.
              </Text>
            </View>
            <View className="gap-3">
              {teaserSteps.map((step, index) => (
                <View key={step} className="flex-row items-center gap-3">
                  <View className="h-8 w-8 rounded-full items-center justify-center" style={{ backgroundColor: '#EEF4FF' }}>
                    <Text className="text-sm font-semibold" style={{ color: '#1E67FF' }}>{index + 1}</Text>
                  </View>
                  <Text className="flex-1 text-sm leading-6 text-text-secondary">{step}</Text>
                </View>
              ))}
            </View>
          </View>
        </SoftSectionCard>

        {recentReport ? (
          <ReportTeaserCard
            title={recentReport.report_label}
            body={recentReport.preview_summary}
            status={recentReport.urgent_level}
            actionLabel={recentReport.unlocked ? 'Open report' : 'Continue preview'}
            onPress={() => router.push(`/report/${recentReport.id}`)}
          />
        ) : (
          <SoftSectionCard>
            <View className="gap-3">
              <Text className="text-lg font-semibold">Your first preview will appear here</Text>
              <Text className="text-sm leading-6 text-text-secondary">
                Start with a clear photo or screenshot of the lab table page. PDFs are not part of this MVP.
              </Text>
              <StatusPill status="normal" label={isBootstrapping ? 'Setting up LabBuddy' : 'Ready when you are'} />
            </View>
          </SoftSectionCard>
        )}
      </ScrollView>
    </StyledSafeAreaView>
  );
}
