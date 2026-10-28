import React, { useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText, Icon, SimulatedNote } from '@/components/ui';
import { formatDateTime } from '@/lib/format';
import { colors, radius, spacing } from '@/theme';
import { DriverDocuments } from '@/types';

interface Photo {
  key: string;
  label: string;
  uri: string;
}

/** Selfie beside the ID and permit so a reviewer can judge whether they show the same person. */
export function VerificationPhotos({ documents }: { documents?: DriverDocuments }) {
  const [open, setOpen] = useState<Photo | null>(null);

  if (!documents) {
    return <SimulatedNote>Sample driver: verified before this demo began, so no documents are on file.</SimulatedNote>;
  }

  const selfie: Photo = { key: 'selfie', label: 'Live selfie', uri: documents.selfieUri };
  const docs: Photo[] = [
    { key: 'id', label: 'National ID', uri: documents.idCardUri },
    { key: 'permit', label: 'Driving permit', uri: documents.permitUri },
  ];

  const thumb = (p: Photo, style: object) => (
    <Pressable key={p.key} onPress={() => setOpen(p)} accessibilityRole="imagebutton" accessibilityLabel={`${p.label}. Tap to enlarge`} style={styles.item}>
      <View style={[styles.frame, style]}>
        <Image source={{ uri: p.uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        <View style={styles.zoom}><Icon name="expand" size={14} color="onPrimary" /></View>
      </View>
      <AppText variant="small" color="textMuted">{p.label}</AppText>
    </Pressable>
  );

  return (
    <View style={styles.root}>
      <View style={styles.compare}>
        {thumb(selfie, styles.selfie)}
        <View style={styles.vs}><Icon name="git-compare" size={18} color="primary" /></View>
        <View style={styles.docs}>{docs.map((d) => thumb(d, styles.card))}</View>
      </View>
      <View style={styles.checklist}>
        {['Face on the selfie matches the ID and permit photos', 'Name on the ID matches the name on the permit', 'Permit covers motorcycles and is not expired'].map((c) => (
          <View key={c} style={styles.check}>
            <Icon name="checkbox-outline" size={16} color="primary" />
            <AppText variant="caption" style={styles.flex}>{c}</AppText>
          </View>
        ))}
      </View>
      <AppText variant="small" color="textFaint">Submitted {formatDateTime(documents.submittedAt)}. Face comparison is done by you; nothing is matched automatically.</AppText>

      <Modal visible={!!open} transparent animationType="fade" onRequestClose={() => setOpen(null)}>
        <SafeAreaView style={styles.viewer}>
          <View style={styles.viewerTop}>
            <AppText variant="heading" color="onPrimary">{open?.label}</AppText>
            <Pressable onPress={() => setOpen(null)} accessibilityRole="button" accessibilityLabel="Close" hitSlop={10}>
              <Icon name="close" size={28} color="onPrimary" />
            </Pressable>
          </View>
          {open ? <Image source={{ uri: open.uri }} style={styles.full} resizeMode="contain" /> : null}
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.md },
  compare: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  item: { gap: spacing.xs, alignItems: 'center' },
  frame: { overflow: 'hidden', borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  selfie: { width: 120, height: 150, borderRadius: 60 },
  card: { width: 128, height: 80 },
  docs: { flex: 1, gap: spacing.sm, alignItems: 'flex-start' },
  vs: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primaryTint, alignItems: 'center', justifyContent: 'center' },
  zoom: { position: 'absolute', right: 6, bottom: 6, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: radius.sm, padding: 3 },
  checklist: { gap: spacing.xs, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surface },
  check: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  flex: { flex: 1 },
  viewer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.94)' },
  viewerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg },
  full: { flex: 1, margin: spacing.lg },
});
