import type { ImagePickerAsset } from 'expo-image-picker';

import { useMemo } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';

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

  const teaserSteps = useMemo(
    () => [
      'Free preview summary',
      'One Ask AI follow-up',
      'Unlock full report + save to history',
      'Add older reports for trendlines',
    ],
    [],
  );

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
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 120, gap: 14 }} showsVerticalScrollIndicator={false}>
        <View className="gap-2 px-1 pb-1">
          <Text className="text-xs font-semibold uppercase tracking-[1.2px]" style={{ color: '#9CC0FF' }}>LabBuddy</Text>
          <Text className="text-[28px] font-semibold tracking-[-0.45px]" style={{ color: '#F7FBFF' }}>Calm clarity for your lab results.</Text>
          <Text className="text-[15px] leading-6" style={{ color: '#AEBCCD' }}>
            Start with a reassuring preview, then unlock deeper explanation only when you need it.
          </Text>
        </View>

        <GradientHeroCard>
          <View className="gap-6">
            <View className="gap-3">
              <View className="self-start flex-row items-center gap-2 rounded-full px-3 py-2" style={{ backgroundColor: '#FFFFFFD6' }}>
                <Ionicons name="shield-checkmark" size={16} color="#1E67FF" />
                <Text className="text-xs font-semibold" style={{ color: '#1E67FF' }}>Calm, simple, trustworthy</Text>
              </View>
              <View className="gap-2">
                <Text className="text-[34px] font-semibold leading-[40px] tracking-[-0.6px]" style={{ color: '#12243A' }}>Upload a report photo or screenshot</Text>
                <Text className="text-base leading-7" style={{ color: '#55677F' }}>LabBuddy turns it into a clear first read without changing your care plan.</Text>
              </View>
            </View>

            <View className="gap-3">
              <Button onPress={() => void handleCamera()}>Scan my labs</Button>
              <Button variant="secondary" onPress={() => void handleLibrary()}>
                Upload a photo or screenshot
              </Button>
            </View>

            <View className="flex-row gap-4">
              <View className="flex-1 rounded-[24px] border border-border p-4" style={{ backgroundColor: '#FFFFFFD9' }}>
                <Text className="text-xs uppercase tracking-[1px] text-text-tertiary">Unlocked reports</Text>
                <Text className="mt-2 text-2xl font-semibold tracking-[-0.25px]" style={{ color: '#12243A' }}>{unlockedReports}</Text>
              </View>
              <View className="flex-1 rounded-[24px] border border-border p-4" style={{ backgroundColor: '#FFFFFFD9' }}>
                <Text className="text-xs uppercase tracking-[1px] text-text-tertiary">History depth</Text>
                <Text className="mt-2 text-2xl font-semibold tracking-[-0.25px]" style={{ color: '#12243A' }}>{totalReports}</Text>
              </View>
            </View>
          </View>
        </GradientHeroCard>

        <SoftSectionCard>
          <View className="gap-4">
            <View className="flex-row items-start justify-between gap-4">
              <View className="flex-1 gap-2">
                <Text className="text-lg font-semibold tracking-[-0.2px]">{dashboard?.trend_cta ?? 'Unlock your 5-year trends'}</Text>
                <Text className="text-sm leading-6 text-text-secondary">
                  Upload older reports to see how markers like LDL and A1C change over time.
                </Text>
              </View>
              <View className="h-12 w-12 items-center justify-center rounded-[20px]" style={{ backgroundColor: '#EAF7F0' }}>
                <Ionicons name="sparkles" size={22} color="#2F8F5B" />
              </View>
            </View>
            <TimelineMeter
              score={timelineScore}
              caption={dashboard?.reports[0]?.timeline_hint ?? 'Upload 2 older reports to see your LDL/A1C timeline.'}
            />
            <Button variant="secondary" onPress={() => router.push('/(tabs)/history')}>
              Unlock your 5-year trends
            </Button>
          </View>
        </SoftSectionCard>

        <SoftSectionCard>
          <View className="gap-4">
            <View className="gap-1">
              <Text className="text-lg font-semibold tracking-[-0.2px]">What you get with each report</Text>
              <Text className="text-sm leading-6 text-text-secondary">
                Enough clarity to reduce panic first, then deeper context once you unlock the full report.
              </Text>
            </View>
            <View className="gap-3">
              {teaserSteps.map((step, index) => (
                <View key={step} className="flex-row items-center gap-3 rounded-[22px] border border-border px-3 py-3.5" style={{ backgroundColor: '#F1F6FD' }}>
                  <View className="h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: '#EAF1FF' }}>
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
              <Text className="text-lg font-semibold tracking-[-0.2px]">Your first preview will appear here</Text>
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
