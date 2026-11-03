import { router } from 'expo-router';
import React from 'react';
import { EmptyState, IconName } from '@/components/ui';
import { useSession } from '@/state/SessionProvider';

/** Routes a guest to registration (via onboarding the first time) or sign-in. */
export function useAccountLinks() {
  const { flags } = useSession();
  return {
    createAccount: () => router.push(flags.onboardingComplete ? '/register' : '/onboarding'),
    signIn: () => router.push('/sign-in'),
  };
}

/** Shown in place of a feature that needs a passenger account. */
export function GuestPrompt({ icon, title, body }: { icon: IconName; title: string; body: string }) {
  const { createAccount, signIn } = useAccountLinks();
  return (
    <EmptyState
      icon={icon}
      title={title}
      body={body}
      action={{ label: 'Create a free account', onPress: createAccount, icon: 'person-add' }}
      secondaryAction={{ label: 'I already have an account', onPress: signIn }}
      testID="guest-prompt"
    />
  );
}
