import { ScrollView, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { StyledSafeAreaView } from '@/lib/styled';
import { shadows } from '@/theme/shadows';

function SafetyCard({ title, body }: { title: string; body: string }) {
  return (
    <View className="rounded-[28px] border border-border/50 p-5 gap-2" style={[shadows.sm, { backgroundColor: '#FFFFFF' }]}>
      <Text className="text-lg font-semibold">{title}</Text>
      <Text className="text-sm leading-6 text-text-secondary">{body}</Text>
    </View>
  );
}

export default function SafetyScreen() {
  return (
    <StyledSafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 20, paddingBottom: 40, gap: 18 }}>
        <SafetyCard
          title="Educational only"
          body="LabBuddy explains lab reports in simpler language, but it does not provide medical advice, diagnosis, or treatment."
        />
        <SafetyCard
          title="Not for emergencies"
          body="Do not use LabBuddy for emergencies. If you have severe symptoms, feel unsafe, or are worried about a critical result, seek urgent care or contact a clinician right away."
        />
        <SafetyCard
          title="Not a replacement for a clinician"
          body="Use LabBuddy to prepare for your visit, not to replace it. A clinician can interpret your results in the full context of your symptoms, history, and medications."
        />
        <SafetyCard
          title="How to use the app safely"
          body="Treat the preview as a calming first read. Use the unlocked biomarker cards to understand the basics, then bring the suggested questions to your clinician."
        />
      </ScrollView>
    </StyledSafeAreaView>
  );
}
