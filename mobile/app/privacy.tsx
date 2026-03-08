import { ScrollView, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { SoftSectionCard } from '@/components/labbuddy/ui';
import { Text } from '@/components/ui/Text';
import { StyledSafeAreaView } from '@/lib/styled';

function PrivacyCard({ title, body, icon }: { title: string; body: string; icon: keyof typeof Ionicons.glyphMap }) {
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

export default function PrivacyScreen() {
  return (
    <StyledSafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 44, gap: 14 }} showsVerticalScrollIndicator={false}>
        <View className="gap-2 px-1 pb-1">
          <Text className="text-xs font-semibold uppercase tracking-[1.2px]" style={{ color: '#9CC0FF' }}>Privacy</Text>
          <Text className="text-[26px] font-semibold tracking-[-0.4px]" style={{ color: '#F7FBFF' }}>Built to keep the experience calm and minimal.</Text>
          <Text className="text-[15px] leading-6" style={{ color: '#AEBCCD' }}>
            Clear limits, less clutter, and only the information needed to support your report history.
          </Text>
        </View>

        <PrivacyCard
          icon="scan"
          title="Remove identifiers when possible"
          body="Before analysis, personal identifiers should be removed whenever possible. Screenshots of the lab table page work best for this MVP."
        />
        <PrivacyCard
          icon="image"
          title="Raw images are not stored by default"
          body="LabBuddy uploads your selected image only long enough to process the report flow and stores the minimum structured metadata needed to save your report history."
        />
        <PrivacyCard
          icon="albums"
          title="Structured data over raw files"
          body="LabBuddy is designed to keep only the structured results needed for previews, biomarker cards, and trendlines rather than long-term raw lab images by default."
        />
        <PrivacyCard
          icon="trash"
          title="Delete all your data"
          body="You can delete your saved reports, trend history, and local acknowledgement from Settings at any time."
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
