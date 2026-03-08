import { ScrollView, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { IconBadge, ScreenHeader, SoftSectionCard } from '@/components/labbuddy/ui';
import { Text } from '@/components/ui/Text';
import { StyledSafeAreaView } from '@/lib/styled';

function SafetyCard({
  title,
  body,
  icon,
}: {
  title: string;
  body: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <SoftSectionCard>
      <View className="gap-4">
        <View className="flex-row items-center gap-3">
          <IconBadge icon={icon} tone="primary" size="sm" />
          <Text className="text-base font-semibold leading-6 tracking-[-0.15px]">{title}</Text>
        </View>
        <Text className="text-[15px] leading-6 text-text-secondary">{body}</Text>
      </View>
    </SoftSectionCard>
  );
}

export default function SafetyScreen() {
  return (
    <StyledSafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 44, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          eyebrow="Safety"
          title="Clear boundaries, calmer guidance."
          description="LabBuddy is meant to reduce confusion and help you prepare for a clinician conversation, not replace one."
        />

        <SafetyCard
          icon="information-circle"
          title="Educational only"
          body="LabBuddy explains lab reports in simpler language, but it does not provide medical advice, diagnosis, or treatment."
        />
        <SafetyCard
          icon="warning"
          title="Not for emergencies"
          body="Do not use LabBuddy for emergencies. If you have severe symptoms, feel unsafe, or are worried about a critical result, seek urgent care or contact a clinician right away."
        />
        <SafetyCard
          icon="medkit"
          title="Not a replacement for a clinician"
          body="Use LabBuddy to prepare for your visit, not to replace it. A clinician can interpret your results in the full context of your symptoms, history, and medications."
        />
        <SafetyCard
          icon="chatbubble-ellipses"
          title="How to use the app safely"
          body="Treat the preview as a calm first read. Use the unlocked biomarker cards to understand the basics, then bring the suggested questions to your clinician."
        />
      </ScrollView>
    </StyledSafeAreaView>
  );
}
