import { Alert, Linking, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';

import { SettingsRow, SoftSectionCard } from '@/components/labbuddy/ui';
import { Text } from '@/components/ui/Text';
import { StyledSafeAreaView } from '@/lib/styled';
import { useLabBuddy } from '@/providers/labbuddy-provider';

export default function SettingsScreen() {
  const router = useRouter();
  const { deleteAllData, restorePurchases } = useLabBuddy();

  function openPlaceholder(label: string) {
    Alert.alert(label, 'This placeholder is ready for your production legal copy.');
  }

  function handleRestorePurchases() {
    void (async () => {
      try {
        const message = await restorePurchases();
        Alert.alert('Restore purchases', message);
      } catch (error) {
        Alert.alert('Restore purchases', error instanceof Error ? error.message : 'Please try again.');
      }
    })();
  }

  function handleDeleteData() {
    Alert.alert(
      'Delete all my data',
      'This removes your saved reports, trend history, and local acknowledgement on this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete everything',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              try {
                await deleteAllData();
                Alert.alert('All data deleted', 'Your LabBuddy data has been removed from this device.');
              } catch (error) {
                Alert.alert('Delete data', error instanceof Error ? error.message : 'Please try again.');
              }
            })();
          },
        },
      ],
    );
  }

  return (
    <StyledSafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 120, gap: 18 }} showsVerticalScrollIndicator={false}>
        <SoftSectionCard>
          <View className="gap-2">
            <Text className="text-2xl font-semibold" style={{ color: '#132238' }}>Settings</Text>
            <Text className="text-sm leading-6 text-text-secondary">
              Built to feel calm, private, and clear—especially when you are already feeling unsure.
            </Text>
          </View>
        </SoftSectionCard>

        <SoftSectionCard>
          <View className="gap-3">
            <Text className="text-lg font-semibold">Trust &amp; support</Text>
            <SettingsRow icon="person-circle" title="About LabBuddy" description="Meet the founder and learn why LabBuddy exists." onPress={() => router.push('/about')} />
            <SettingsRow icon="lock-closed" title="Privacy" description="See how uploads, identifiers, and saved data are handled." onPress={() => router.push('/privacy')} />
            <SettingsRow icon="shield-checkmark" title="Safety disclaimer" description="Review the educational-only and emergency boundary language." onPress={() => router.push('/safety')} />
            <SettingsRow icon="mail" title="Email Fuz" description="Open an email draft to contact the founder." onPress={() => void Linking.openURL('mailto:fpsyed2@yahoo.com')} />
          </View>
        </SoftSectionCard>

        <SoftSectionCard>
          <View className="gap-3">
            <Text className="text-lg font-semibold">Purchases</Text>
            <SettingsRow icon="refresh-circle" title="Restore Purchases" description="Scaffolded for RevenueCat and Apple IAP restore flow." onPress={handleRestorePurchases} />
            <SettingsRow icon="diamond" title="Yearly plan placeholder" description="Unlimited reports + unlimited Ask AI — planned at $19.99/year." trailing={<Text className="text-xs font-semibold text-primary">Coming soon</Text>} />
          </View>
        </SoftSectionCard>

        <SoftSectionCard>
          <View className="gap-3">
            <Text className="text-lg font-semibold">Legal placeholders</Text>
            <SettingsRow icon="document-text" title="Terms" description="Production legal copy can be dropped in here later." onPress={() => openPlaceholder('Terms')} />
            <SettingsRow icon="receipt" title="Privacy Policy" description="Ready for the final privacy policy language." onPress={() => openPlaceholder('Privacy Policy')} />
          </View>
        </SoftSectionCard>

        <SoftSectionCard>
          <View className="gap-3">
            <Text className="text-lg font-semibold">Data controls</Text>
            <SettingsRow icon="trash" title="Delete all my data" description="Remove saved reports, structured results, and local LabBuddy data." onPress={handleDeleteData} destructive />
          </View>
        </SoftSectionCard>
      </ScrollView>
    </StyledSafeAreaView>
  );
}
