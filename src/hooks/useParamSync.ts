import { useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';

/**
 * Lets a dashboard card open a list tab with a filter pre-applied (e.g. ?verification=pending).
 * Only values in `allowed` are accepted, so a malformed link can't put the list in a bad state.
 */
export function useParamSync<T extends string>(key: string, allowed: readonly T[], apply: (value: T) => void) {
  const params = useLocalSearchParams<Record<string, string>>();
  const raw = params[key];
  useEffect(() => {
    if (raw && (allowed as readonly string[]).includes(raw)) apply(raw as T);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raw]);
}
