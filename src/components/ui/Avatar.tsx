import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { initials } from '@/lib/format';
import { colors } from '@/theme';
import { AppText } from './AppText';

export interface AvatarProps {
  name: string;
  uri?: string;
  size?: number;
  /** Draws a green ring when the person is available. */
  available?: boolean;
}

export function Avatar({ name, uri, size = 48, available }: AvatarProps) {
  const ring = available ? { borderWidth: 3, borderColor: colors.primary, padding: 2 } : null;
  const inner = size - (available ? 10 : 0);
  return (
    <View style={[{ width: size, height: size, borderRadius: size / 2 }, styles.center, ring]} accessibilityLabel={`Photo of ${name}`} accessible>
      {uri ? (
        <Image source={{ uri }} style={{ width: inner, height: inner, borderRadius: inner / 2 }} />
      ) : (
        <View style={[styles.center, { width: inner, height: inner, borderRadius: inner / 2, backgroundColor: colors.primaryTintStrong }]}>
          <AppText variant="label" color="primary" style={{ fontSize: Math.max(12, inner * 0.36) }}>
            {initials(name)}
          </AppText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({ center: { alignItems: 'center', justifyContent: 'center' } });
