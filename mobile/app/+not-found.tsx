import { Stack, useRouter, usePathname } from 'expo-router';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';

export default function NotFoundScreen() {
  const router = useRouter();
  const pathname = usePathname();

  const isPreviewUrl = pathname?.startsWith('/preview/');

  if (isPreviewUrl) {
    return (
      <>
        <Stack.Screen options={{ title: '', headerShown: false }} />
        <View className="flex-1 px-6 bg-background" style={{ paddingTop: '30%' }}>
          <View className="bg-surface rounded-2xl p-6">
            <Text className="text-lg font-semibold mb-3">
              Want to preview a different app?
            </Text>
            <View className="flex-row items-start gap-3 mb-3">
              <View className="w-6 h-6 rounded-full bg-[#00D632] items-center justify-center mt-0.5">
                <Text className="text-xs font-bold text-white">1</Text>
              </View>
              <Text className="text-sm text-text-secondary flex-1">
                Tap the button below to go back to your current app
              </Text>
            </View>
            <View className="flex-row items-start gap-3 mb-5">
              <View className="w-6 h-6 rounded-full bg-[#00D632] items-center justify-center mt-0.5">
                <Text className="text-xs font-bold text-white">2</Text>
              </View>
              <Text className="text-sm text-text-secondary flex-1">
                Tap the floating Appifex button to switch back, then open the preview link or scan the QR code
              </Text>
            </View>
            <Button className="bg-[#00D632] rounded-full" onPress={() => router.replace('/')}>Go back</Button>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 justify-center items-center px-8 bg-background">
        <View className="w-20 h-20 rounded-full bg-surface items-center justify-center mb-5">
          <Ionicons name="alert-circle-outline" size={36} color="#FF3B30" />
        </View>
        <Text className="text-xl font-semibold mb-2 text-center text-[#FF3B30]">
          This screen does not exist.
        </Text>
        <Text className="text-text-secondary mb-8 leading-6 text-center">
          Check the route path or return to the Home tab.
        </Text>
        <View className="w-full max-w-[300px]">
          <Button onPress={() => router.replace('/')}>Go back</Button>
        </View>
      </View>
    </>
  );
}
