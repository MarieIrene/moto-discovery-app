import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

/** True when the device reports no internet. Discovery still works (data is local); calling needs a cell network. */
export function useIsOffline(): boolean {
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setOffline(state.isConnected === false || state.isInternetReachable === false);
    });
    return unsubscribe;
  }, []);
  return offline;
}
