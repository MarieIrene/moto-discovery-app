import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { AppText, Button, Icon, IconName } from '@/components/ui';
import { colors, radius, spacing } from '@/theme';

export interface DocumentSlotProps {
  step: number;
  title: string;
  hint: string;
  icon: IconName;
  uri?: string;
  /** Portrait previews suit the selfie; landscape suits cards. */
  shape?: 'card' | 'portrait';
  actions: { label: string; doneLabel: string; icon: IconName; onPress: () => void; testID?: string }[];
}

export function DocumentSlot({ step, title, hint, icon, uri, shape = 'card', actions }: DocumentSlotProps) {
  const done = !!uri;
  return (
    <View style={[styles.card, done && styles.cardDone]} accessibilityLabel={`Step ${step}: ${title}. ${done ? 'Added' : 'Not added yet'}`}>
      <View style={styles.header}>
        <View style={[styles.step, done && styles.stepDone]}>
          {done ? <Icon name="checkmark" size={16} color="onPrimary" /> : <AppText variant="label" color="primary">{step}</AppText>}
        </View>
        <View style={styles.flex}>
          <AppText variant="heading">{title}</AppText>
          <AppText variant="caption" color="textMuted">{hint}</AppText>
        </View>
      </View>

      <View style={[styles.preview, shape === 'portrait' ? styles.portrait : styles.landscape]}>
        {uri ? (
          <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" accessibilityIgnoresInvertColors />
        ) : (
          <View style={styles.placeholder}>
            <Icon name={icon} size={40} color="borderStrong" />
            <AppText variant="small" color="textFaint">No photo yet</AppText>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        {actions.map((a) => (
          <Button key={a.label} label={done ? a.doneLabel : a.label} icon={a.icon} variant="secondary" onPress={a.onPress} style={styles.flex} testID={a.testID} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md, backgroundColor: colors.background },
  cardDone: { borderColor: colors.primary },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  step: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primaryTint, alignItems: 'center', justifyContent: 'center' },
  stepDone: { backgroundColor: colors.primary },
  flex: { flex: 1 },
  preview: { width: '100%', borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed' },
  landscape: { aspectRatio: 1.6 },
  portrait: { aspectRatio: 1, maxWidth: 260, alignSelf: 'center' },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
  actions: { flexDirection: 'row', gap: spacing.sm },
});
