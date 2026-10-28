import { Redirect } from 'expo-router';
import React from 'react';
import { resolveHomeRoute, useSession } from '@/state/SessionProvider';

/** Single entry point: every auth/role transition calls router.replace('/') and this decides where to go. */
export default function Index() {
  const session = useSession();
  const href = resolveHomeRoute(session);
  return <Redirect key={href} href={href} />;
}
