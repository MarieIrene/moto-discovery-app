import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LoadingState, ToastProvider } from '@/components/ui';
import { AppDataProvider, useAppData } from '@/state/appData/AppDataProvider';
import { SelfRecordSync } from '@/state/SelfRecordSync';
import { needsDriverDocuments, SessionProvider, useSession } from '@/state/SessionProvider';
import { SettingsProvider, useSettings } from '@/state/SettingsProvider';
import { colors } from '@/theme';

export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SettingsProvider>
          <SessionProvider>
            <AppDataProvider>
              <ToastProvider>
                <StatusBar style="dark" />
                <SelfRecordSync />
                <RootNavigator />
              </ToastProvider>
            </AppDataProvider>
          </SessionProvider>
        </SettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/**
 * Role-aware navigation. Each Stack.Protected group is only reachable when its guard is true, so a
 * deep link to an admin screen from passenger mode is refused. This is a UX boundary, not security:
 * a production app must enforce every privileged action on a trusted backend.
 */
function RootNavigator() {
  const session = useSession();
  const { ready: settingsReady } = useSettings();
  const { ready: dataReady } = useAppData();

  if (!session.ready || !settingsReady || !dataReady) return <LoadingState label="Starting Moto Discovery" />;

  const s = session.session;
  const isAdmin = !!s?.isAdmin;
  const setupDone = !!session.profile && !needsDriverDocuments(session.profile) && session.flags.locationPromptSeen;
  const needsSetup = !!s && !isAdmin && !setupDone;
  const isUser = !!s && !isAdmin && setupDone;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="index" />
      <Stack.Protected guard={!s}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={needsSetup}>
        <Stack.Screen name="(setup)" />
      </Stack.Protected>
      <Stack.Protected guard={isUser && session.activeRole === 'passenger'}>
        <Stack.Screen name="(passenger)" />
      </Stack.Protected>
      <Stack.Protected guard={isUser && session.activeRole === 'driver'}>
        <Stack.Screen name="(driver)" />
      </Stack.Protected>
      <Stack.Protected guard={isUser}>
        <Stack.Screen name="driver/[id]" />
        <Stack.Screen name="report/[driverId]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="edit-profile" />
      </Stack.Protected>
      <Stack.Protected guard={isUser || isAdmin}>
        <Stack.Screen name="safety" />
        <Stack.Screen name="privacy" />
      </Stack.Protected>
      <Stack.Protected guard={isAdmin}>
        <Stack.Screen name="(admin)" />
        <Stack.Screen name="admin/driver/[id]" />
        <Stack.Screen name="admin/passenger/[id]" />
        <Stack.Screen name="admin/report/[id]" />
      </Stack.Protected>
    </Stack>
  );
}
