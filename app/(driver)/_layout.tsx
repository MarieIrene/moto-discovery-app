import { Tabs } from 'expo-router/js-tabs';
import React from 'react';
import { tabIcon, tabScreenOptions } from '@/components/layout/tabOptions';

export default function DriverTabs() {
  return (
    <Tabs screenOptions={tabScreenOptions}>
      <Tabs.Screen name="driver-dashboard" options={{ title: 'Dashboard', tabBarIcon: tabIcon('speedometer', 'speedometer-outline') }} />
      <Tabs.Screen name="driver-activity" options={{ title: 'Activity', tabBarIcon: tabIcon('call', 'call-outline') }} />
      <Tabs.Screen name="driver-account" options={{ title: 'Account', tabBarIcon: tabIcon('person-circle', 'person-circle-outline') }} />
    </Tabs>
  );
}
