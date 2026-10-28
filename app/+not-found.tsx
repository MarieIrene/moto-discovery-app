import { router } from 'expo-router';
import React from 'react';
import { EmptyState, Screen } from '@/components/ui';

export default function NotFound() {
  return (
    <Screen>
      <EmptyState
        icon="compass"
        title="This screen isn’t available"
        body="It may belong to a different mode, or the link is out of date."
        action={{ label: 'Go to home', onPress: () => router.replace('/') }}
      />
    </Screen>
  );
}
