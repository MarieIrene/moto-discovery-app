import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { reasonSchema } from '@/lib/validation';
import { colors, radius, spacing } from '@/theme';
import { AppText } from './AppText';
import { Button } from './Button';
import { TextField } from './TextField';

export interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  destructive?: boolean;
  /** When set, the user must enter a reason (validated) before confirming. */
  reasonLabel?: string;
  onConfirm: (reason?: string) => void;
  onCancel: () => void;
}

export function ConfirmDialog({ visible, title, message, confirmLabel, destructive, reasonLabel, onConfirm, onCancel }: ConfirmDialogProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (visible) {
      setReason('');
      setError(undefined);
    }
  }, [visible]);

  const confirm = () => {
    if (!reasonLabel) return onConfirm();
    const parsed = reasonSchema.safeParse({ reason });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message);
      return;
    }
    onConfirm(parsed.data.reason);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel} statusBarTranslucent>
      <KeyboardAvoidingView style={styles.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} accessibilityLabel="Close dialog" />
        <View style={styles.sheet} accessibilityViewIsModal>
          <AppText variant="heading">{title}</AppText>
          <AppText color="textMuted">{message}</AppText>
          {reasonLabel ? (
            <TextField
              label={reasonLabel}
              value={reason}
              onChangeText={(t) => { setReason(t); if (error) setError(undefined); }}
              multiline
              error={error}
              placeholder="This is shown to the user and saved in history"
              testID="confirm-reason"
            />
          ) : null}
          <View style={styles.actions}>
            <Button label="Cancel" variant="ghost" onPress={onCancel} />
            <Button label={confirmLabel} variant={destructive ? 'danger' : 'primary'} onPress={confirm} testID="confirm-dialog-confirm" />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', padding: spacing.lg },
  sheet: { backgroundColor: colors.background, borderRadius: radius.lg, padding: spacing.xl, gap: spacing.md, width: '100%', maxWidth: 480, alignSelf: 'center' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm, marginTop: spacing.sm },
});
