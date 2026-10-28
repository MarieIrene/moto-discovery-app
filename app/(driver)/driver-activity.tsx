import React from 'react';
import { SectionList, StyleSheet, View } from 'react-native';
import { AppText, EmptyState, Icon, Screen, ScreenHeader } from '@/components/ui';
import { useSelfDriver } from '@/hooks/useSelfDriver';
import { formatDateTime, relativeTime } from '@/lib/format';
import { colors, spacing } from '@/theme';

interface Row { id: string; title: string; subtitle: string; kind: 'call' | 'status' }

export default function DriverActivity() {
  const { contacts, passengerName, activity } = useSelfDriver();
  const sections = [
    { title: 'Passenger calls', data: contacts.map<Row>((c) => ({ id: c.id, title: passengerName(c.passengerId), subtitle: `${relativeTime(c.contactedAt)} · ${formatDateTime(c.contactedAt)}`, kind: 'call' })) },
    { title: 'Status history', data: activity.filter((a) => a.type !== 'contact_made').map<Row>((a) => ({ id: a.id, title: a.message, subtitle: `${a.actor} · ${formatDateTime(a.createdAt)}`, kind: 'status' })) },
  ].filter((s) => s.data.length > 0);

  return (
    <Screen padded={false}>
      <View style={styles.head}><ScreenHeader title="Activity" subtitle="Calls and changes to your driver account." /></View>
      <SectionList
        sections={sections}
        keyExtractor={(r) => r.id}
        contentContainerStyle={sections.length ? styles.list : styles.empty}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={<EmptyState icon="call" title="No activity yet" body="Go online from the dashboard and passenger calls will appear here." />}
        renderSectionHeader={({ section }) => <AppText variant="heading" style={styles.sectionTitle}>{section.title}</AppText>}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.icon}><Icon name={item.kind === 'call' ? 'call' : 'git-commit'} size={16} color="primary" /></View>
            <View style={styles.flex}>
              <AppText variant="bodyStrong">{item.title}</AppText>
              <AppText variant="caption" color="textMuted">{item.subtitle}</AppText>
            </View>
          </View>
        )}
        ListFooterComponent={<AppText variant="small" color="textFaint" style={styles.footer}>Calls include sample data generated for this demo.</AppText>}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, width: '100%', maxWidth: 640, alignSelf: 'center' },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, width: '100%', maxWidth: 640, alignSelf: 'center' },
  empty: { flexGrow: 1 },
  sectionTitle: { marginTop: spacing.lg, marginBottom: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  icon: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primaryTint, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1, gap: 2 },
  footer: { marginTop: spacing.lg },
});
