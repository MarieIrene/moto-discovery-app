import { Tabs } from 'expo-router/js-tabs';
import React from 'react';
import { badge, tabIcon, tabScreenOptions } from '@/components/layout/tabOptions';
import { useUnreadMessages } from '@/hooks/useChat';

export default function PassengerTabs() {
  const unread = useUnreadMessages();
  return (
    <Tabs screenOptions={tabScreenOptions}>
      <Tabs.Screen name="passenger-home" options={{ title: 'Home', tabBarIcon: tabIcon('home', 'home-outline') }} />
      <Tabs.Screen name="home" options={{ title: 'Nearby', tabBarIcon: tabIcon('map', 'map-outline') }} />
      <Tabs.Screen name="messages" options={{ title: 'Messages', tabBarIcon: tabIcon('chatbubbles', 'chatbubbles-outline'), tabBarBadge: badge(unread) }} />
      <Tabs.Screen name="recent" options={{ title: 'Recent', tabBarIcon: tabIcon('time', 'time-outline') }} />
      <Tabs.Screen name="account" options={{ title: 'Account', tabBarIcon: tabIcon('person-circle', 'person-circle-outline') }} />
    </Tabs>
  );
}
