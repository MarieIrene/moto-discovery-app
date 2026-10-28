import React from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';
import { colors, ColorToken, MIN_TOUCH, spacing } from '@/theme';
import { AppText } from './AppText';
import { Icon, IconName } from './Icon';

export interface ListRowProps {
  title: string;
  subtitle?: string;
  icon?: IconName;
  iconColor?: ColorToken;
  right?: React.ReactNode;
  onPress?: () => void;
  destructive?: boolean;
  testID?: string;
}

export function ListRow({ title, subtitle, icon, iconColor, right, onPress, destructive, testID }: ListRowProps) {
  const content = (
    <>
      {icon ? (
        <View style={[styles.icon, destructive && styles.iconDanger]}>
          <Icon name={icon} size={18} color={destructive ? 'danger' : iconColor ?? 'primary'} />
        </View>
      ) : null}
      <View style={styles.text}>
        <AppText variant="bodyStrong" color={destructive ? 'danger' : 'text'}>{title}</AppText>
        {subtitle ? <AppText variant="caption" color="textMuted">{subtitle}</AppText> : null}
      </View>
      {right ?? (onPress ? <Icon name="chevron-forward" size={18} color="textFaint" /> : null)}
    </>
  );
  if (!onPress) return <View style={styles.row} testID={testID}>{content}</View>;
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

export function SwitchRow({ title, subtitle, value, onValueChange, icon, disabled }: {
  title: string; subtitle?: string; value: boolean; onValueChange: (v: boolean) => void; icon?: IconName; disabled?: boolean;
}) {
  return (
    <ListRow
      title={title}
      subtitle={subtitle}
      icon={icon}
      right={
        <Switch
          value={value}
          onValueChange={onValueChange}
          disabled={disabled}
          accessibilityLabel={title}
          trackColor={{ false: colors.borderStrong, true: colors.primary }}
          thumbColor={colors.background}
          ios_backgroundColor={colors.borderStrong}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  row: { minHeight: MIN_TOUCH + 12, flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  pressed: { opacity: 0.6 },
  icon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primaryTint, alignItems: 'center', justifyContent: 'center' },
  iconDanger: { backgroundColor: colors.dangerTint },
  text: { flex: 1, gap: 2 },
});
