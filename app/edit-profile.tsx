import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ProfileForm } from '@/components/forms/ProfileForm';
import { AppText, Screen, ScreenHeader, SegmentedControl, useToast } from '@/components/ui';
import { canUseRole, useSession } from '@/state/SessionProvider';
import { spacing } from '@/theme';
import { RolePreference } from '@/types';

export default function EditProfile() {
  const { profile, updateProfile } = useSession();
  const { addRole } = useLocalSearchParams<{ addRole?: 'driver' | 'passenger' }>();
  const toast = useToast();
  const [role, setRole] = useState<RolePreference>(() => (addRole && profile && !canUseRole(profile.rolePreference, addRole) ? 'both' : profile?.rolePreference ?? 'passenger'));
  if (!profile) return null;

  const includeDriver = canUseRole(role, 'driver');

  return (
    <Screen scroll>
      <ScreenHeader back title="Edit profile" />
      <View style={styles.roles}>
        <AppText variant="label">I use Moto Discovery as</AppText>
        <SegmentedControl
          accessibilityLabel="Account type"
          value={role}
          onChange={setRole}
          segments={[{ value: 'passenger', label: 'Passenger' }, { value: 'driver', label: 'Driver' }, { value: 'both', label: 'Both' }]}
        />
      </View>
      <ProfileForm
        key={includeDriver ? 'with-driver' : 'passenger-only'}
        includeDriver={includeDriver}
        submitLabel="Save changes"
        defaultValues={{
          fullName: profile.fullName,
          district: profile.district,
          email: profile.email ?? '',
          motorcycle: profile.motorcycle ? { ...profile.motorcycle, year: String(profile.motorcycle.year) } : undefined,
        }}
        onSubmit={async (values) => {
          await updateProfile({
            fullName: values.fullName,
            district: values.district,
            email: values.email || undefined,
            rolePreference: role,
            motorcycle: values.motorcycle ?? profile.motorcycle,
          });
          toast('Profile saved');
          router.back();
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({ roles: { gap: spacing.xs, marginBottom: spacing.xl } });
