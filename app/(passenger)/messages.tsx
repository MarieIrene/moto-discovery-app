import React from 'react';
import { ConversationList } from '@/components/chat/ConversationList';
import { GuestPrompt } from '@/components/layout/GuestPrompt';
import { Screen, ScreenHeader } from '@/components/ui';
import { useSession } from '@/state/SessionProvider';

export default function PassengerMessages() {
  const { isGuest } = useSession();
  if (!isGuest) return <ConversationList />;
  return (
    <Screen>
      <ScreenHeader title="Messages" subtitle="Chat with drivers to arrange your pickup." />
      <GuestPrompt
        icon="chatbubbles"
        title="Create an account to message drivers"
        body="Drivers need to know who is writing to them. You can still call any available driver as a guest."
      />
    </Screen>
  );
}
