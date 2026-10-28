import React from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { AppText, Button, Card, Icon, IconName, Screen, ScreenHeader, Section } from '@/components/ui';
import { spacing } from '@/theme';

const TIPS: { icon: IconName; title: string; body: string }[] = [
  { icon: 'shield-checkmark', title: 'Wear the passenger helmet', body: 'Drivers must offer you a helmet. If they don’t have one, choose another driver.' },
  { icon: 'card', title: 'Match the plate number', body: 'Compare the plate on the motorcycle with the one on the driver’s profile before you get on.' },
  { icon: 'cash', title: 'Agree on the price first', body: 'Settle the fare on the phone or before the trip starts to avoid disputes on arrival.' },
  { icon: 'share-social', title: 'Tell someone where you’re going', body: 'Share the driver’s name and plate with a friend for late or long trips.' },
  { icon: 'flag', title: 'Report problems', body: 'Use “Report this driver” on a driver’s profile. Reports are reviewed by the platform team.' },
];

export default function Safety() {
  return (
    <Screen scroll>
      <ScreenHeader back title="Safety" subtitle="A few habits make every trip safer." />
      <Card tone="brand" style={styles.emergency}>
        <Icon name="alert-circle" size={22} color="onPrimary" />
        <View style={styles.flex}>
          <AppText variant="heading" color="onPrimary">In an emergency</AppText>
          <AppText color="onPrimaryMuted">Call Rwanda National Police on 112.</AppText>
        </View>
        <Button label="Call 112" variant="inverse" onPress={() => Linking.openURL('tel:112')} />
      </Card>
      <Section title="Before and during your trip">
        {TIPS.map((t) => (
          <View key={t.title} style={styles.tip}>
            <Icon name={t.icon} size={22} color="primary" />
            <View style={styles.flex}>
              <AppText variant="bodyStrong">{t.title}</AppText>
              <AppText color="textMuted">{t.body}</AppText>
            </View>
          </View>
        ))}
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  emergency: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.xl, flexWrap: 'wrap' },
  tip: { flexDirection: 'row', gap: spacing.md, paddingVertical: spacing.sm },
  flex: { flex: 1, gap: 2, minWidth: 160 },
});
