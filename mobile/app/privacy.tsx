import { ScrollView, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { IconBadge, ScreenHeader, SoftSectionCard } from '@/components/labbuddy/ui';
import { Text } from '@/components/ui/Text';
import { StyledSafeAreaView } from '@/lib/styled';

function PrivacyCard({
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

export default function PrivacyScreen() {
  return (
    <StyledSafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 44, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          eyebrow="Privacy"
          title="Built to feel calm and minimal."
          description="Clear limits, less clutter, and only the information needed to support your report history."
        />

        <PrivacyCard
          icon="scan"
          title="Remove identifiers when possible"
          body="Before analysis, personal identifiers should be removed whenever possible. Screenshots of the lab table page work best in this MVP."
        />
        <PrivacyCard
          icon="image"
          title="Raw images are not stored by default"
          body="LabBuddy uploads your selected image only long enough to process the report flow and stores the minimum structured metadata needed for report history."
        />
        <PrivacyCard
          icon="albums"
          title="Structured data over raw files"
          body="LabBuddy is designed to keep the structured results needed for previews, biomarker cards, and trendlines rather than long-term raw lab images by default."
        />
        <PrivacyCard
          icon="trash"
          title="Delete all your data"
          body="You can delete saved reports, trend history, and your local acknowledgement from Settings at any time."
        />
        <PrivacyCard
          icon="shield"
          title="Educational storage boundaries"
          body="LabBuddy is built for education and clarity, not diagnosis or emergency care. Only the data needed to provide that experience should be retained."
        />
      </ScrollView>
    </StyledSafeAreaView>
  );
}
