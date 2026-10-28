import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors, spacing } from '@/theme';
import { AppText } from './AppText';
import { Button } from './Button';
import { Icon, IconName } from './Icon';

interface StateAction {
  label: string;
  onPress: () => void;
  icon?: IconName;
}

interface StateProps {
  title: string;
  body?: string;
  action?: StateAction;
  secondaryAction?: StateAction;
  icon?: IconName;
  compact?: boolean;
  testID?: string;
}

function StateLayout({ title, body, action, secondaryAction, icon, compact, testID, tone }: StateProps & { tone: 'neutral' | 'danger' }) {
  return (
    <View testID={testID} style={[styles.container, compact ? styles.compact : styles.fill]} accessibilityLiveRegion="polite">
      {icon ? (
        <View style={[styles.iconWrap, tone === 'danger' && styles.iconDanger]}>
          <Icon name={icon} size={28} color={tone === 'danger' ? 'danger' : 'primary'} />
        </View>
      ) : null}
      <AppText variant="heading" align="center">{title}</AppText>
      {body ? <AppText color="textMuted" align="center" style={styles.body}>{body}</AppText> : null}
      {action || secondaryAction ? (
        <View style={styles.actions}>
          {action ? <Button label={action.label} onPress={action.onPress} icon={action.icon} /> : null}
          {secondaryAction ? <Button label={secondaryAction.label} onPress={secondaryAction.onPress} icon={secondaryAction.icon} variant="ghost" /> : null}
        </View>
      ) : null}
    </View>
  );
}

export function EmptyState(props: StateProps) {
  return <StateLayout icon="search" {...props} tone="neutral" />;
}

export function ErrorState(props: StateProps) {
  return <StateLayout icon="cloud-offline" {...props} tone="danger" />;
}

export function LoadingState({ label = 'Loading', compact }: { label?: string; compact?: boolean }) {
  return (
    <View style={[styles.container, compact ? styles.compact : styles.fill]} accessibilityRole="progressbar" accessibilityLabel={label}>
      <ActivityIndicator size="large" color={colors.primary} />
      <AppText color="textMuted">{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.sm },
  fill: { flex: 1 },
  // No flex here: on react-native-web `flex: 0` collapses the view to zero height.
  compact: { paddingVertical: spacing.xxl },
  iconWrap: {
    width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primaryTint, marginBottom: spacing.sm,
  },
  iconDanger: { backgroundColor: colors.dangerTint },
  body: { maxWidth: 320 },
  actions: { marginTop: spacing.md, gap: spacing.sm, alignItems: 'center' },
});
