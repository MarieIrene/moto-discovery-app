import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { DocumentSlot } from '@/components/verification/DocumentSlot';
import { SelfieCamera } from '@/components/verification/SelfieCamera';
import { AppText, Button, Screen, ScreenHeader, SimulatedNote, useToast } from '@/components/ui';
import { persistPhoto, pickDocumentPhoto } from '@/services/verificationMedia';
import { useSession } from '@/state/SessionProvider';
import { colors, radius, spacing } from '@/theme';

type DocKey = 'idCard' | 'permit';

export default function DriverVerification() {
  const { profile, updateProfile } = useSession();
  const toast = useToast();
  const [idCard, setIdCard] = useState(profile?.documents?.idCardUri);
  const [permit, setPermit] = useState(profile?.documents?.permitUri);
  const [selfie, setSelfie] = useState(profile?.documents?.selfieUri);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const done = [idCard, permit, selfie].filter(Boolean).length;
  const complete = done === 3;

  const pick = async (key: DocKey, source: 'camera' | 'library') => {
    const result = await pickDocumentPhoto(source);
    if (result.status === 'denied') {
      toast(source === 'camera' ? 'Allow camera access to take a photo' : 'Allow photo access to upload a picture');
      return;
    }
    if (result.status !== 'ok') return;
    (key === 'idCard' ? setIdCard : setPermit)(result.uri);
  };

  const submit = async () => {
    if (!idCard || !permit || !selfie) return;
    setSaving(true);
    try {
      await updateProfile({
        documents: {
          idCardUri: persistPhoto(idCard, 'id-card'),
          permitUri: persistPhoto(permit, 'permit'),
          selfieUri: persistPhoto(selfie, 'selfie'),
          submittedAt: new Date().toISOString(),
        },
      });
      toast('Documents submitted for review');
      router.replace('/');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen
      scroll
      footer={
        <Button
          label={complete ? 'Submit for verification' : `Add ${3 - done} more ${3 - done === 1 ? 'photo' : 'photos'}`}
          icon="shield-checkmark"
          size="lg"
          fullWidth
          disabled={!complete}
          loading={saving}
          onPress={submit}
          testID="verification-submit"
        />
      }
    >
      <ScreenHeader title="Verify your identity" subtitle="Passengers only see drivers whose documents have been checked." />

      <View style={styles.progress} accessible accessibilityLabel={`${done} of 3 photos added`}>
        <View style={styles.track}><View style={[styles.fill, { width: `${(done / 3) * 100}%` }]} /></View>
        <AppText variant="small" color="textMuted">{done} of 3</AppText>
      </View>

      <View style={styles.list}>
        <DocumentSlot
          step={1}
          title="National ID"
          hint="Front of your Rwandan ID card. All four corners visible, no glare."
          icon="card"
          uri={idCard}
          actions={[
            { label: 'Take photo', doneLabel: 'Retake', icon: 'camera', onPress: () => pick('idCard', 'camera'), testID: 'id-camera' },
            { label: 'Upload', doneLabel: 'Replace', icon: 'image', onPress: () => pick('idCard', 'library'), testID: 'id-upload' },
          ]}
        />
        <DocumentSlot
          step={2}
          title="Driving permit"
          hint="Your motorcycle driving licence (category A), with your photo showing."
          icon="document-text"
          uri={permit}
          actions={[
            { label: 'Take photo', doneLabel: 'Retake', icon: 'camera', onPress: () => pick('permit', 'camera'), testID: 'permit-camera' },
            { label: 'Upload', doneLabel: 'Replace', icon: 'image', onPress: () => pick('permit', 'library'), testID: 'permit-upload' },
          ]}
        />
        <DocumentSlot
          step={3}
          title="Live selfie"
          hint="Taken now with your front camera, so we can check you're the person on the permit. Gallery photos aren't accepted."
          icon="happy"
          shape="portrait"
          uri={selfie}
          actions={[{ label: 'Open camera', doneLabel: 'Retake selfie', icon: 'camera-reverse', onPress: () => setCameraOpen(true), testID: 'selfie-open' }]}
        />
      </View>

      <SimulatedNote>Photos stay on this device. A reviewer compares your selfie with your ID and permit in admin mode; there is no automatic face matching in this demo.</SimulatedNote>

      <SelfieCamera
        visible={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={(uri) => {
          setSelfie(uri);
          setCameraOpen(false);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  progress: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  track: { flex: 1, height: 8, borderRadius: radius.pill, backgroundColor: colors.primaryTint, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.primary },
  list: { gap: spacing.lg, marginBottom: spacing.lg },
});
