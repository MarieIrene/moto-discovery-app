import { Tabs } from 'expo-router/js-tabs';
import React from 'react';
import { badge, tabIcon, tabScreenOptions } from '@/components/layout/tabOptions';
import { useUnreadMessages } from '@/hooks/useChat';

export default function DriverTabs() {
  const unread = useUnreadMessages();
  return (
    <Tabs screenOptions={tabScreenOptions}>
      <Tabs.Screen name="driver-dashboard" options={{ title: 'Home', tabBarIcon: tabIcon('home', 'home-outline') }} />
      <Tabs.Screen name="driver-messages" options={{ title: 'Messages', tabBarIcon: tabIcon('chatbubbles', 'chatbubbles-outline'), tabBarBadge: badge(unread) }} />
      <Tabs.Screen name="driver-activity" options={{ title: 'Call logs', tabBarIcon: tabIcon('call', 'call-outline') }} />
      <Tabs.Screen name="driver-account" options={{ title: 'Account', tabBarIcon: tabIcon('person-circle', 'person-circle-outline') }} />
    </Tabs>
  );
}
