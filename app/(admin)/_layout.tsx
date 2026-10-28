import { Tabs } from 'expo-router/js-tabs';
import React from 'react';
import { tabIcon, tabScreenOptions } from '@/components/layout/tabOptions';

export default function AdminTabs() {
  return (
    <Tabs screenOptions={tabScreenOptions}>
      <Tabs.Screen name="admin-dashboard" options={{ title: 'Overview', tabBarIcon: tabIcon('grid', 'grid-outline') }} />
      <Tabs.Screen name="admin-drivers" options={{ title: 'Drivers', tabBarIcon: tabIcon('bicycle', 'bicycle-outline') }} />
      <Tabs.Screen name="admin-passengers" options={{ title: 'Passengers', tabBarIcon: tabIcon('people', 'people-outline') }} />
      <Tabs.Screen name="admin-reports" options={{ title: 'Reports', tabBarIcon: tabIcon('flag', 'flag-outline') }} />
      <Tabs.Screen name="admin-settings" options={{ title: 'Settings', tabBarIcon: tabIcon('settings', 'settings-outline') }} />
    </Tabs>
  );
}
