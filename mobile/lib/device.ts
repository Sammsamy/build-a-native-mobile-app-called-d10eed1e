import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

const DEVICE_ID_KEY = 'labbuddy_device_id';
const DISCLAIMER_ACK_KEY = 'labbuddy_disclaimer_ack';
const AUTH_TOKEN_KEY = 'labbuddy_auth_token';
const AUTH_EXPIRES_AT_KEY = 'labbuddy_auth_expires_at';

export interface StoredDeviceSession {
  authToken: string;
  expiresAt: string;
}

function createDeviceId(): string {
  return Crypto.randomUUID();
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

export async function getStoredDeviceSession(): Promise<StoredDeviceSession | null> {
  const [authToken, expiresAt] = await Promise.all([
    SecureStore.getItemAsync(AUTH_TOKEN_KEY),
    SecureStore.getItemAsync(AUTH_EXPIRES_AT_KEY),
  ]);

  if (!authToken || !expiresAt) {
    return null;
  }

  return {
    authToken,
    expiresAt,
  };
}

export async function saveDeviceSession(session: StoredDeviceSession): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(AUTH_TOKEN_KEY, session.authToken),
    SecureStore.setItemAsync(AUTH_EXPIRES_AT_KEY, session.expiresAt),
  ]);
}

export async function clearStoredDeviceSession(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(AUTH_TOKEN_KEY),
    SecureStore.deleteItemAsync(AUTH_EXPIRES_AT_KEY),
  ]);
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
    clearStoredDeviceSession(),
  ]);
}
