import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText, Button, Icon, IconName, Screen, ScreenHeader } from '@/components/ui';
import { useSession } from '@/state/SessionProvider';
import { colors, radius, spacing } from '@/theme';
import { RolePreference } from '@/types';

const ROLES: { value: RolePreference; title: string; body: string; icon: IconName }[] = [
  { value: 'passenger', title: 'Passenger', body: 'Find nearby drivers and call them.', icon: 'person' },
  { value: 'driver', title: 'Driver', body: 'Go online so passengers can find and call you.', icon: 'bicycle' },
  { value: 'both', title: 'Both', body: 'Ride sometimes, drive sometimes. Switch any time in settings.', icon: 'swap-horizontal' },
];

export default function RoleSelect() {
  const { chooseRole, draftRole, signOut } = useSession();
  const [selected, setSelected] = useState<RolePreference | null>(draftRole);

  const next = () => {
    if (!selected) return;
    chooseRole(selected);
    router.push('/profile-setup');
  };

  return (
    <Screen scroll footer={<Button label="Continue" size="lg" fullWidth disabled={!selected} onPress={next} testID="role-continue" />}>
      <ScreenHeader title="How will you use Moto Discovery?" subtitle="You can change this later." />
      <View style={styles.list} accessibilityRole="radiogroup">
        {ROLES.map((r) => {
          const on = selected === r.value;
          return (
            <Pressable
              key={r.value}
              onPress={() => setSelected(r.value)}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              accessibilityLabel={`${r.title}. ${r.body}`}
              style={[styles.option, on && styles.optionOn]}
              testID={`role-${r.value}`}
            >
              <View style={[styles.icon, on && styles.iconOn]}>
                <Icon name={r.icon} size={24} color={on ? 'onPrimary' : 'primary'} />
              </View>
              <View style={styles.text}>
                <AppText variant="heading">{r.title}</AppText>
                <AppText color="textMuted">{r.body}</AppText>
              </View>
              <Icon name={on ? 'radio-button-on' : 'radio-button-off'} size={22} color={on ? 'primary' : 'borderStrong'} />
            </Pressable>
          );
        })}
      </View>
      <Button label="Use a different number" variant="ghost" onPress={async () => { await signOut(); router.replace('/'); }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.md, marginBottom: spacing.lg },
  option: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.border },
  optionOn: { borderColor: colors.primary, backgroundColor: colors.primaryTint },
  icon: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primaryTint, alignItems: 'center', justifyContent: 'center' },
  iconOn: { backgroundColor: colors.primary },
  text: { flex: 1, gap: 2 },
});
