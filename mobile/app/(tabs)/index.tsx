import type { ImagePickerAsset } from 'expo-image-picker';

import { useMemo } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';

import {
  GradientHeroCard,
  IconBadge,
  MetricTile,
  ReportTeaserCard,
  ScreenHeader,
  SectionHeading,
  SoftSectionCard,
  StatusPill,
  SurfaceListItem,
  TimelineMeter,
  labBuddyPalette,
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
      'See a calm preview first.',
      'Ask one free follow-up question.',
      'Unlock the full report only if you want more.',
      'Add older reports to build trendlines.',
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
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 120, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          eyebrow="LabBuddy"
          title="Calm clarity for your lab results."
          description="Start with a reassuring preview, then unlock deeper explanation only when you need it."
        />

        <GradientHeroCard>
          <View className="gap-6">
            <View className="gap-4">
              <View className="self-start flex-row items-center gap-2 rounded-full px-3 py-2" style={{ backgroundColor: labBuddyPalette.whiteOverlay }}>
                <Ionicons name="shield-checkmark" size={16} color={labBuddyPalette.primary} />
                <Text className="text-xs font-semibold leading-4" style={{ color: labBuddyPalette.primary }}>
                  Calm, simple, trustworthy
                </Text>
              </View>

              <View className="gap-3">
                <Text className="text-[32px] font-semibold leading-[38px] tracking-[-0.35px]" style={{ color: labBuddyPalette.text }}>
                  Upload a report photo or screenshot
                </Text>
                <Text className="text-[15px] leading-6" style={{ color: labBuddyPalette.textSecondary }}>
                  LabBuddy gives you a clear first read without changing your care plan.
                </Text>
              </View>
            </View>

            <View className="gap-3">
              <Button onPress={() => void handleCamera()}>Scan my labs</Button>
              <Button variant="secondary" onPress={() => void handleLibrary()}>
                Upload a photo or screenshot
              </Button>
            </View>

            <View className="flex-row gap-3">
              <MetricTile label="Unlocked reports" value={unlockedReports} />
              <MetricTile label="History depth" value={totalReports} />
            </View>
          </View>
        </GradientHeroCard>

        <SoftSectionCard>
          <View className="gap-4">
            <View className="flex-row items-start justify-between gap-4">
              <View className="flex-1">
                <SectionHeading
                  title={dashboard?.trend_cta ?? 'Unlock your 5-year trends'}
                  description="Add older reports to see how markers like LDL and A1C move over time."
                />
              </View>
              <IconBadge icon="sparkles" tone="success" />
            </View>
            <TimelineMeter
              score={timelineScore}
              caption={dashboard?.reports[0]?.timeline_hint ?? 'Upload 2 older reports to see your LDL/A1C timeline.'}
            />
            <Button variant="secondary" onPress={() => router.push('/(tabs)/history')}>
              View history and trends
            </Button>
          </View>
        </SoftSectionCard>

        <SoftSectionCard>
          <View className="gap-4">
            <SectionHeading
              title="What each report unlocks"
              description="You get calm first-read clarity now, then deeper context only if you want it."
            />
            <View className="gap-3">
              {teaserSteps.map((step, index) => (
                <View
                  key={step}
                  className="flex-row items-center gap-3 rounded-[20px] border border-border bg-surface-muted px-4 py-4"
                >
                  <View className="h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: labBuddyPalette.primarySoft }}>
                    <Text className="text-sm font-semibold leading-5" style={{ color: labBuddyPalette.primary }}>
                      {index + 1}
                    </Text>
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
            <View className="gap-4">
              <SectionHeading
                title="Your first preview will appear here"
                description="Start with a clear photo or screenshot of the lab table page. PDFs are not part of this MVP."
              />
              <SurfaceListItem icon="checkmark-circle" tone="success">
                <StatusPill status="normal" label={isBootstrapping ? 'Setting up LabBuddy' : 'Ready when you are'} />
              </SurfaceListItem>
            </View>
          </SoftSectionCard>
        )}
      </ScrollView>
    </StyledSafeAreaView>
  );
}
