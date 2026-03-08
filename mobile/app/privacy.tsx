import { ScrollView, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { StyledSafeAreaView } from '@/lib/styled';
import { shadows } from '@/theme/shadows';

function PrivacyCard({ title, body }: { title: string; body: string }) {
  return (
    <View className="rounded-[28px] border border-border/50 p-5 gap-2" style={[shadows.sm, { backgroundColor: '#FFFFFF' }]}>
      <Text className="text-lg font-semibold">{title}</Text>
      <Text className="text-sm leading-6 text-text-secondary">{body}</Text>
    </View>
  );
}

export default function PrivacyScreen() {
  return (
    <StyledSafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 20, paddingBottom: 40, gap: 18 }}>
        <PrivacyCard
          title="Remove identifiers when possible"
          body="Before analysis, personal identifiers should be removed whenever possible. Screenshots of the lab table page work best for this MVP."
        />
        <PrivacyCard
          title="Raw images are not stored by default"
          body="LabBuddy uploads your selected image only long enough to process the report flow and stores the minimum structured metadata needed to save your report history."
        />
        <PrivacyCard
          title="Structured data over raw files"
          body="LabBuddy is designed to keep only the structured results needed for previews, biomarker cards, and trendlines rather than long-term raw lab images by default."
        />
        <PrivacyCard
          title="Delete all your data"
          body="You can delete your saved reports, trend history, and local acknowledgement from Settings at any time."
        />
        <PrivacyCard
          title="Educational storage boundaries"
          body="LabBuddy is built for education and clarity, not diagnosis or emergency care. Only the data needed to provide that experience should be retained."
        />
      </ScrollView>
    </StyledSafeAreaView>
  );
}
