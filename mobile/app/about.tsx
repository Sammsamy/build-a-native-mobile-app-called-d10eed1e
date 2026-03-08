import { Linking, ScrollView, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { StyledSafeAreaView } from '@/lib/styled';
import { shadows } from '@/theme/shadows';

function AboutSection({ title, body }: { title: string; body: string }) {
  return (
    <View className="rounded-[28px] border border-border/50 p-5 gap-2" style={[shadows.sm, { backgroundColor: '#FFFFFF' }]}>
      <Text className="text-lg font-semibold">{title}</Text>
      <Text className="text-sm leading-6 text-text-secondary">{body}</Text>
    </View>
  );
}

export default function AboutScreen() {
  return (
    <StyledSafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 20, paddingBottom: 40, gap: 18 }}>
        <View className="rounded-[32px] p-6 gap-5" style={{ backgroundColor: '#EEF4FF' }}>
          <View className="h-24 w-24 rounded-full items-center justify-center" style={{ backgroundColor: '#D8E6FF' }}>
            <Ionicons name="person" size={34} color="#1E67FF" />
          </View>
          <View className="gap-2">
            <Text className="text-2xl font-semibold" style={{ color: '#132238' }}>Fuzlullah Syed (Fuz)</Text>
            <Text className="text-sm text-text-secondary">U.S. Medical Student • Indie Builder</Text>
          </View>
          <Button className="rounded-[22px] self-start" onPress={() => void Linking.openURL('mailto:fpsyed2@yahoo.com')}>
            Email Fuz
          </Button>
        </View>

        <AboutSection
          title="Why I built LabBuddy"
          body="Lab results can arrive before you get to speak with your clinician. LabBuddy was built to help people understand their lab reports in a clearer, calmer way and prepare better questions for their next visit."
        />
        <AboutSection
          title="Important safety note"
          body="LabBuddy is educational only. It does not provide medical advice, diagnosis, or treatment, and it does not replace a licensed clinician. If you have severe symptoms or are worried about a result, contact your clinician or seek urgent care."
        />
        <AboutSection
          title="About me"
          body="I’m a U.S. medical student, not a clinician. I built LabBuddy independently to make lab results easier to understand. I can’t provide personal medical advice through the app."
        />
        <AboutSection
          title="Privacy"
          body="LabBuddy removes personal identifiers before analysis when possible and does not store raw lab images by default. You can delete your data anytime."
        />
        <AboutSection
          title="Contact"
          body="Email: fpsyed2@yahoo.com"
        />
      </ScrollView>
    </StyledSafeAreaView>
  );
}
