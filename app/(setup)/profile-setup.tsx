import { router } from 'expo-router';
import React from 'react';
import { ProfileForm } from '@/components/forms/ProfileForm';
import { Screen, ScreenHeader } from '@/components/ui';
import { canUseRole, useSession } from '@/state/SessionProvider';

export default function ProfileSetup() {
  const { draftRole, pendingAuth, completeProfile } = useSession();
  const role = draftRole ?? 'passenger';
  const includeDriver = canUseRole(role, 'driver');

  return (
    <Screen scroll>
      <ScreenHeader back title="Set up your profile" subtitle={includeDriver ? 'Passengers see your name and motorcycle details.' : 'Drivers see your name when you call.'} />
      <ProfileForm
        includeDriver={includeDriver}
        submitLabel="Save profile"
        defaultValues={{ fullName: pendingAuth?.fullName ?? '', district: '', email: '' }}
        onSubmit={async (values) => {
          await completeProfile({
            fullName: values.fullName,
            district: values.district,
            email: values.email || undefined,
            rolePreference: role,
            motorcycle: values.motorcycle,
          });
          router.replace('/');
        }}
      />
    </Screen>
  );
}
