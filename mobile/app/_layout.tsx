/**
 * CRITICAL: Global Error Handler Setup
 *
 * This MUST be the first code that runs to capture early errors before
 * Sentry or any other error handlers initialize. Do NOT move or remove!
 */
import '../_system/early-error-handler';

import '../global.css';

import { useEffect } from 'react';
import { Stack, useNavigationContainerRef } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LabBuddyProvider } from '@/providers/labbuddy-provider';
// CRITICAL: DO NOT REMOVE - Required for Appifex error tracking
import { getNavigationIntegration, wrapWithSentry } from '../_system/sentry';
// CRITICAL: DO NOT REMOVE - Required for Appifex sandbox switching
import { AppifexFloatingButton } from '../_system/AppifexFloatingButton';
// CRITICAL: DO NOT REMOVE - Required for crash recovery with "Return to Appifex" option
import { ErrorBoundary } from '../_system/ErrorBoundary';
// CRITICAL: DO NOT REMOVE - Required for displaying user-friendly error modal for event handler errors
import { GlobalErrorOverlay } from '../_system/GlobalErrorOverlay';

function RootLayout() {
  const ref = useNavigationContainerRef();

  useEffect(() => {
    const navIntegration = getNavigationIntegration();
    if (ref && navIntegration) {
      navIntegration.registerNavigationContainer(ref);
    }
  }, [ref]);

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <LabBuddyProvider>
          {/* CRITICAL: DO NOT REMOVE screenOptions - prevents "< (tabs)" from appearing on screens */}
          {/* CRITICAL: DO NOT REMOVE Stack.Screen children - causes "This screen does not exist" error! */}
          <Stack
            screenOptions={{
              headerShown: false,
              headerBackButtonDisplayMode: 'minimal',
              headerStyle: { backgroundColor: '#0D1522' },
              headerShadowVisible: false,
              headerTintColor: '#F7FBFF',
              headerTitleStyle: {
                color: '#F7FBFF',
                fontWeight: '600',
                fontSize: 17,
              },
              contentStyle: { backgroundColor: '#0D1522' },
            }}
          >
            {/* CRITICAL: index screen MUST be registered - without this the app shows "This screen does not exist" on launch */}
            <Stack.Screen name="index" />
            {/* CRITICAL: (tabs) MUST be registered when using tab navigation - without this, redirecting to /(tabs) shows "This screen does not exist" */}
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="report/[reportId]" options={{ headerShown: true, title: 'Report', presentation: 'card' }} />
            <Stack.Screen name="about" options={{ headerShown: true, title: 'About LabBuddy' }} />
            <Stack.Screen name="privacy" options={{ headerShown: true, title: 'Privacy' }} />
            <Stack.Screen name="safety" options={{ headerShown: true, title: 'Safety disclaimer' }} />
          </Stack>
          <StatusBar style="light" />
          {/* CRITICAL: DO NOT REMOVE - Required for Appifex sandbox switching */}
          <AppifexFloatingButton />
          {/* CRITICAL: DO NOT REMOVE - Required for displaying user-friendly error modal */}
          <GlobalErrorOverlay />
        </LabBuddyProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

export default wrapWithSentry(RootLayout);
