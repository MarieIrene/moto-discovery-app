import { useCallback } from 'react';
import { Alert } from 'react-native';
import { formatPhone } from '@/lib/format';
import { openDialer } from '@/services/phone';
import { useAppData } from '@/state/appData/AppDataProvider';
import { useActorName, useSession } from '@/state/SessionProvider';
import { Driver } from '@/types';

/** Records the contact locally, then hands off to the device dialler. */
export function useCallDriver() {
  const { actions } = useAppData();
  const { profile } = useSession();
  const actor = useActorName();

  return useCallback(
    async (driver: Pick<Driver, 'id' | 'fullName' | 'phone'>) => {
      const result = await openDialer(driver.phone);
      if (result.ok) {
        if (profile) actions.recordContact(driver.id, profile.id, actor);
        return;
      }
      Alert.alert(
        'Calling isn’t available here',
        `This device can’t place phone calls. Dial ${formatPhone(driver.phone)} from a phone instead.`,
      );
    },
    [actions, profile, actor],
  );
}
