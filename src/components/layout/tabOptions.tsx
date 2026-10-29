import { Ionicons } from '@expo/vector-icons';
import React, { ComponentProps } from 'react';
import { ColorValue, Platform, Text } from 'react-native';
import { colors } from '@/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

export const tabScreenOptions = {
  headerShown: false,
  tabBarActiveTintColor: colors.primary,
  tabBarInactiveTintColor: colors.textFaint,
  tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.border },
  tabBarItemStyle: { paddingHorizontal: 0 },
  tabBarBadgeStyle: { backgroundColor: colors.danger, color: colors.onPrimary, fontSize: 11 },
  tabBarLabel: TabLabel,
  sceneStyle: { backgroundColor: colors.background },
};

export function tabIcon(active: IconName, inactive: IconName) {
  return function TabIcon({ color, focused, size }: { color: ColorValue; focused: boolean; size: number }) {
    return <Ionicons name={focused ? active : inactive} size={size} color={typeof color === 'string' ? color : colors.textFaint} />;
  };
}

/** Tab badge for a count: hidden at zero, capped so it stays small. */
export function badge(count: number): string | undefined {
  return count > 0 ? (count > 9 ? '9+' : String(count)) : undefined;
}

/** Shrinks long labels (e.g. "Passengers" in a five-tab bar) to fit narrow phones instead of truncating. */
function TabLabel({ color, children }: { color: ColorValue; children: string }) {
  return (
    <Text
      numberOfLines={1}
      adjustsFontSizeToFit
      minimumFontScale={0.75}
      style={{ color, fontSize: Platform.OS === 'web' ? 10 : 11, fontWeight: '600', maxWidth: '100%', paddingHorizontal: 2 }}
    >
      {children}
    </Text>
  );
}
