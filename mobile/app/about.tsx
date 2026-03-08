import { Linking, ScrollView, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import {
  GradientHeroCard,
  IconBadge,
  SectionHeading,
  SoftSectionCard,
  labBuddyPalette,
} from '@/components/labbuddy/ui';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { StyledSafeAreaView } from '@/lib/styled';

function AboutSection({
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
          <Text className="text-base font-semibold leading-6 tracking-[-0.15px]" style={{ color: labBuddyPalette.text }}>
            {title}
          </Text>
        </View>
        <Text className="text-[15px] leading-6 text-text-secondary">{body}</Text>
      </View>
    </SoftSectionCard>
  );
}

export default function AboutScreen() {
  return (
    <StyledSafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 44, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <GradientHeroCard>
          <View className="gap-6">
            <View className="flex-row items-start justify-between gap-4">
              <View className="h-20 w-20 items-center justify-center rounded-[28px]" style={{ backgroundColor: '#223754' }}>
                <Ionicons name="person" size={30} color="#D9E8FF" />
              </View>
              <View className="rounded-full px-3 py-2" style={{ backgroundColor: '#213654' }}>
                <Text className="text-xs font-semibold uppercase tracking-[0.8px]" style={{ color: '#B9D2FF' }}>
                  Founder
                </Text>
              </View>
            </View>

            <View className="gap-3">
              <SectionHeading
                title="Fuzlullah Syed (Fuz)"
                description="U.S. medical student • indie builder"
              />
              <Text className="text-[15px] leading-6 text-text-secondary">
                Building a calmer, clearer first read for the moment between getting results and talking with your clinician.
              </Text>
            </View>

            <Button className="self-start" onPress={() => void Linking.openURL('mailto:fpsyed2@yahoo.com')}>
              Email Fuz
            </Button>
          </View>
        </GradientHeroCard>

        <AboutSection
          icon="heart"
          title="Why I built LabBuddy"
          body="Lab results can arrive before you speak with your clinician. LabBuddy was built to make that waiting period feel clearer, calmer, and easier to navigate."
        />
        <AboutSection
          icon="shield-checkmark"
          title="Important safety note"
          body="LabBuddy is educational only. It does not provide medical advice, diagnosis, or treatment, and it does not replace a licensed clinician. If you have severe symptoms or are worried about a result, contact your clinician or seek urgent care."
        />
        <AboutSection
          icon="person-circle"
          title="About me"
          body="I’m a U.S. medical student, not a clinician. I built LabBuddy independently to make lab results easier to understand, and I can’t provide personal medical advice through the app."
        />
        <AboutSection
          icon="lock-closed"
          title="Privacy"
          body="LabBuddy removes personal identifiers before analysis when possible and does not store raw lab images by default. You can delete your data anytime."
        />
        <AboutSection icon="mail" title="Contact" body="Email: fpsyed2@yahoo.com" />
      </ScrollView>
    </StyledSafeAreaView>
  );
}
