import { Linking, ScrollView, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { StyledSafeAreaView } from '@/lib/styled';
import { SoftSectionCard } from '@/components/labbuddy/ui';

function AboutSection({ title, body, icon }: { title: string; body: string; icon: keyof typeof Ionicons.glyphMap }) {
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

export default function AboutScreen() {
  return (
    <StyledSafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 44, gap: 14 }} showsVerticalScrollIndicator={false}>
        <View className="overflow-hidden rounded-[32px] border border-white/10 px-5 pb-5 pt-6" style={{ backgroundColor: '#152235' }}>
          <View className="absolute right-0 top-0 h-36 w-36 rounded-full" style={{ backgroundColor: '#213654', transform: [{ translateX: 36 }, { translateY: -22 }] }} />
          <View className="absolute bottom-0 left-0 h-24 w-24 rounded-full" style={{ backgroundColor: '#1B2C45', transform: [{ translateX: -24 }, { translateY: 20 }] }} />

          <View className="gap-5">
            <View className="flex-row items-start justify-between gap-4">
              <View className="h-20 w-20 items-center justify-center rounded-[28px]" style={{ backgroundColor: '#223754' }}>
                <Ionicons name="person" size={30} color="#D9E8FF" />
              </View>
              <View className="rounded-full px-3 py-2" style={{ backgroundColor: '#213654' }}>
                <Text className="text-xs font-semibold uppercase tracking-[1px]" style={{ color: '#B9D2FF' }}>Founder</Text>
              </View>
            </View>

            <View className="gap-2">
              <Text className="text-[28px] font-semibold tracking-[-0.5px]" style={{ color: '#F7FBFF' }}>Fuzlullah Syed (Fuz)</Text>
              <Text className="text-sm" style={{ color: '#B6C4D8' }}>U.S. Medical Student • Indie Builder</Text>
              <Text className="text-[15px] leading-6" style={{ color: '#D8E2EF' }}>
                Building a calmer, clearer first read for the moment between getting results and talking with your clinician.
              </Text>
            </View>

            <Button className="self-start" onPress={() => void Linking.openURL('mailto:fpsyed2@yahoo.com')}>
              Email Fuz
            </Button>
          </View>
        </View>

        <AboutSection
          icon="heart"
          title="Why I built LabBuddy"
          body="Lab results can arrive before you get to speak with your clinician. LabBuddy was built to help people understand their lab reports in a clearer, calmer way and prepare better questions for their next visit."
        />
        <AboutSection
          icon="shield-checkmark"
          title="Important safety note"
          body="LabBuddy is educational only. It does not provide medical advice, diagnosis, or treatment, and it does not replace a licensed clinician. If you have severe symptoms or are worried about a result, contact your clinician or seek urgent care."
        />
        <AboutSection
          icon="person-circle"
          title="About me"
          body="I’m a U.S. medical student, not a clinician. I built LabBuddy independently to make lab results easier to understand. I can’t provide personal medical advice through the app."
        />
        <AboutSection
          icon="lock-closed"
          title="Privacy"
          body="LabBuddy removes personal identifiers before analysis when possible and does not store raw lab images by default. You can delete your data anytime."
        />
        <AboutSection
          icon="mail"
          title="Contact"
          body="Email: fpsyed2@yahoo.com"
        />
      </ScrollView>
    </StyledSafeAreaView>
  );
}
