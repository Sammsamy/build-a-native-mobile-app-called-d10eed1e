import { ScrollView, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { SoftSectionCard } from '@/components/labbuddy/ui';
import { Text } from '@/components/ui/Text';
import { StyledSafeAreaView } from '@/lib/styled';

function SafetyCard({ title, body, icon }: { title: string; body: string; icon: keyof typeof Ionicons.glyphMap }) {
  return (
    <SoftSectionCard>
      <View className="gap-3">
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-2xl" style={{ backgroundColor: '#EAF1FF' }}>
            <Ionicons name={icon} size={18} color="#1E67FF" />
          </View>
          <Text className="text-base font-semibold tracking-[-0.2px]" style={{ color: '#12243A' }}>{title}</Text>
        </View>
        <Text className="text-[15px] leading-6 text-text-secondary">{body}</Text>
      </View>
    </SoftSectionCard>
  );
}

export default function SafetyScreen() {
  return (
    <StyledSafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 44, gap: 14 }} showsVerticalScrollIndicator={false}>
        <View className="gap-2 px-1 pb-1">
          <Text className="text-xs font-semibold uppercase tracking-[1.2px]" style={{ color: '#9CC0FF' }}>Safety</Text>
          <Text className="text-[26px] font-semibold tracking-[-0.4px]" style={{ color: '#F7FBFF' }}>Clear boundaries, calmer guidance.</Text>
          <Text className="text-[15px] leading-6" style={{ color: '#AEBCCD' }}>
            LabBuddy is meant to reduce confusion and help you prepare for a clinician conversation, not replace one.
          </Text>
        </View>

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
          body="Treat the preview as a calming first read. Use the unlocked biomarker cards to understand the basics, then bring the suggested questions to your clinician."
        />
      </ScrollView>
    </StyledSafeAreaView>
  );
}
