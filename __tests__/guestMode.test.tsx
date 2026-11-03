import { act, render, screen } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';
import { SessionProvider, useSession } from '@/state/SessionProvider';

let api: ReturnType<typeof useSession>;

function Probe() {
  api = useSession();
  return <Text>{api.ready ? `guest:${api.isGuest} role:${api.activeRole}` : 'loading'}</Text>;
}

describe('guest mode', () => {
  it('lets a passenger browse without an account and leave again', async () => {
    await render(<SessionProvider><Probe /></SessionProvider>);
    expect(await screen.findByText('guest:false role:null')).toBeTruthy();

    await act(async () => api.continueAsGuest());
    expect(screen.getByText('guest:true role:passenger')).toBeTruthy();
    expect(api.session).toBeNull();
    expect(api.profile).toBeNull();

    await act(async () => api.leaveGuestMode());
    expect(screen.getByText('guest:false role:null')).toBeTruthy();
  });
});
