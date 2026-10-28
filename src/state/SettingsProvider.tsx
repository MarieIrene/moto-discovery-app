import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { readJson, STORAGE_KEYS, writeJson } from '@/services/storage';
import { AppSettings } from '@/types';

export const DEFAULT_SETTINGS: AppSettings = {
  maxDiscoveryRadiusKm: 10,
  useDemoLocation: false,
  preferFallbackMap: false,
  simulateLoadErrors: false,
};

interface SettingsContextValue {
  settings: AppSettings;
  ready: boolean;
  updateSettings: (patch: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    readJson<Partial<AppSettings>>(STORAGE_KEYS.settings).then((stored) => {
      if (stored) setSettings({ ...DEFAULT_SETTINGS, ...stored });
      setReady(true);
    });
  }, []);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      void writeJson(STORAGE_KEYS.settings, next);
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    void writeJson(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
  }, []);

  const value = useMemo(() => ({ settings, ready, updateSettings, resetSettings }), [settings, ready, updateSettings, resetSettings]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}
