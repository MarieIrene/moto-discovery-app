import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '@/theme';
import { AppText } from './AppText';
import { Icon } from './Icon';

type ToastTone = 'success' | 'error';
interface ToastMessage { id: number; text: string; tone: ToastTone }

const ToastContext = createContext<(text: string, tone?: ToastTone) => void>(() => undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  const show = useCallback((text: string, tone: ToastTone = 'success') => {
    setToast({ id: Date.now(), text, tone });
    AccessibilityInfo.announceForAccessibility(text);
  }, []);

  useEffect(() => {
    if (!toast) return;
    Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    const timer = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => setToast(null));
    }, 2600);
    return () => clearTimeout(timer);
  }, [toast, opacity]);

  return (
    <ToastContext.Provider value={show}>
      {children}
      {toast ? (
        <Animated.View pointerEvents="none" style={[styles.wrap, { bottom: insets.bottom + 72, opacity }]}>
          <View style={[styles.toast, toast.tone === 'error' && styles.error]}>
            <Icon name={toast.tone === 'error' ? 'alert-circle' : 'checkmark-circle'} size={18} color="onPrimary" />
            <AppText variant="label" color="onPrimary" style={styles.text}>{toast.text}</AppText>
          </View>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: spacing.lg, right: spacing.lg, alignItems: 'center' },
  toast: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm, maxWidth: 520,
    backgroundColor: colors.primaryPressed, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: radius.md,
  },
  error: { backgroundColor: colors.danger },
  text: { flexShrink: 1 },
});
