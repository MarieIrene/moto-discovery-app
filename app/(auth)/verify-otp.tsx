import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, TextInputInstance, View } from 'react-native';
import { AppText, Button, Screen, ScreenHeader, SimulatedNote, useToast } from '@/components/ui';
import { formatPhone } from '@/lib/format';
import { otpSchema } from '@/lib/validation';
import { useSession } from '@/state/SessionProvider';
import { colors, radius, spacing, typography } from '@/theme';

const LENGTH = 6;
const RESEND_SECONDS = 30;

export default function VerifyOtp() {
  const { pendingAuth, confirmOtp, resendOtp } = useSession();
  const toast = useToast();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const input = useRef<TextInputInstance>(null);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  if (!pendingAuth) {
    return (
      <Screen>
        <ScreenHeader back title="Code expired" subtitle="Start again to get a new code." />
        <Button label="Enter phone number" onPress={() => router.replace('/sign-in')} />
      </Screen>
    );
  }

  const submit = async (value = code) => {
    const parsed = otpSchema.safeParse({ code: value });
    if (!parsed.success) return setError(parsed.error.issues[0]?.message);
    setSubmitting(true);
    const result = await confirmOtp(parsed.data.code);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.message);
      setCode('');
      return;
    }
    router.replace('/');
  };

  const onChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, LENGTH);
    setCode(digits);
    setError(undefined);
    if (digits.length === LENGTH) void submit(digits);
  };

  const resend = async () => {
    await resendOtp();
    setSeconds(RESEND_SECONDS);
    toast('New code sent (simulated)');
  };

  return (
    <Screen
      footer={<Button label="Verify" size="lg" fullWidth loading={submitting} onPress={() => submit()} testID="otp-submit" />}
    >
      <ScreenHeader back title="Enter the code" subtitle={`Sent to ${formatPhone(pendingAuth.phone)}`} />
      <Pressable onPress={() => input.current?.focus()} accessibilityLabel="Verification code" style={styles.boxes}>
        {Array.from({ length: LENGTH }, (_, i) => {
          const filled = code[i];
          const active = i === code.length;
          return (
            <View key={i} style={[styles.box, active && styles.boxActive, !!error && styles.boxError]}>
              <AppText variant="title">{filled ?? ''}</AppText>
            </View>
          );
        })}
      </Pressable>
      <TextInput
        ref={input}
        value={code}
        onChangeText={onChange}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        maxLength={LENGTH}
        autoFocus
        style={styles.hidden}
        accessibilityLabel="Verification code"
        testID="otp-input"
      />
      {error ? <AppText color="danger" style={styles.message} accessibilityLiveRegion="polite">{error}</AppText> : null}
      <View style={styles.resend}>
        {seconds > 0 ? (
          <AppText color="textMuted">Resend code in {seconds}s</AppText>
        ) : (
          <Button label="Resend code" variant="ghost" onPress={resend} />
        )}
      </View>
      <SimulatedNote>Demo verification: the code is always 123456.</SimulatedNote>
    </Screen>
  );
}

const styles = StyleSheet.create({
  boxes: { flexDirection: 'row', gap: spacing.sm, justifyContent: 'space-between', marginTop: spacing.md },
  box: {
    flex: 1, maxWidth: 56, aspectRatio: 0.85, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.borderStrong,
    alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background,
  },
  boxActive: { borderColor: colors.primary, borderWidth: 2 },
  boxError: { borderColor: colors.danger },
  hidden: { position: 'absolute', opacity: 0, height: 1, width: 1, ...typography.body },
  message: { marginTop: spacing.md },
  resend: { alignItems: 'flex-start', marginVertical: spacing.lg },
});
