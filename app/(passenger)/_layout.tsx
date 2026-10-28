import { Tabs } from 'expo-router/js-tabs';
import React from 'react';
import { tabIcon, tabScreenOptions } from '@/components/layout/tabOptions';

export default function PassengerTabs() {
  return (
    <Tabs screenOptions={tabScreenOptions}>
      <Tabs.Screen name="home" options={{ title: 'Nearby', tabBarIcon: tabIcon('map', 'map-outline') }} />
      <Tabs.Screen name="recent" options={{ title: 'Recent', tabBarIcon: tabIcon('time', 'time-outline') }} />
      <Tabs.Screen name="account" options={{ title: 'Account', tabBarIcon: tabIcon('person-circle', 'person-circle-outline') }} />
    </Tabs>
  );
}
