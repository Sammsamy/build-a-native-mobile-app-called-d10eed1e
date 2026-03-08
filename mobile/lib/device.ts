import * as SecureStore from 'expo-secure-store';

const DEVICE_ID_KEY = 'labbuddy_device_id';
const DISCLAIMER_ACK_KEY = 'labbuddy_disclaimer_ack';

function createDeviceId(): string {
  return `lb-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function getDeviceId(): Promise<string> {
  const existing = await SecureStore.getItemAsync(DEVICE_ID_KEY);
  if (existing) {
    return existing;
  }

  const nextId = createDeviceId();
  await SecureStore.setItemAsync(DEVICE_ID_KEY, nextId);
  return nextId;
}

export async function hasAcknowledgedDisclaimer(): Promise<boolean> {
  const stored = await SecureStore.getItemAsync(DISCLAIMER_ACK_KEY);
  return stored === 'true';
}

export async function saveDisclaimerAcknowledgement(): Promise<void> {
  await SecureStore.setItemAsync(DISCLAIMER_ACK_KEY, 'true');
}

export async function clearLocalLabBuddyStorage(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(DISCLAIMER_ACK_KEY),
    SecureStore.deleteItemAsync(DEVICE_ID_KEY),
  ]);
}
