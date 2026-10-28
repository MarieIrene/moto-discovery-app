import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AdminScreen } from '@/components/admin/AdminScreen';
import { openActivitySubject, openAdminDriver, openAdminReport } from '@/components/admin/navigation';
import { ActivityItem } from '@/components/admin/rows';
import { AppText, BarChart, Button, Card, ChipGroup, Divider, ListRow, Section, StatCard } from '@/components/ui';
import { DATE_RANGE_LABEL, DateRange, selectAttentionItems, selectContactsPerDay, selectDashboardStats, withinRange } from '@/features/admin/selectors';
import { useAppData } from '@/state/appData/AppDataProvider';
import { colors, radius, spacing } from '@/theme';

export default function AdminDashboard() {
  const { data } = useAppData();
  const [range, setRange] = useState<DateRange>('7d');
  const stats = useMemo(() => selectDashboardStats(data, range), [data, range]);
  const perDay = useMemo(() => selectContactsPerDay(data.contacts, range === '7d' ? 7 : 30), [data.contacts, range]);
  const attention = useMemo(() => selectAttentionItems(data).slice(0, 5), [data]);
  const activity = useMemo(() => data.activity.filter((a) => withinRange(a.createdAt, range)).slice(0, 6), [data.activity, range]);

  const goDrivers = (params: Record<string, string>) => router.navigate({ pathname: '/admin-drivers', params });
  const availablePct = stats.drivers.total ? Math.round((stats.drivers.available / stats.drivers.total) * 100) : 0;

  return (
    <AdminScreen title="Platform overview" subtitle="Demo data for Kigali">
      <ChipGroup
        accessibilityLabel="Date range"
        value={range}
        onChange={setRange}
        options={(Object.keys(DATE_RANGE_LABEL) as DateRange[]).map((r) => ({ value: r, label: DATE_RANGE_LABEL[r] }))}
      />

      <Section title="Drivers" style={styles.firstSection}>
        <View style={styles.grid}>
          <StatCard testID="stat-total-drivers" label="Registered drivers" value={stats.drivers.total} icon="bicycle" onPress={() => goDrivers({ verification: 'all', account: 'all' })} />
          <StatCard testID="stat-approved" label="Approved" value={stats.drivers.approved} icon="shield-checkmark" onPress={() => goDrivers({ verification: 'approved' })} />
          <StatCard testID="stat-pending" label="Pending verification" value={stats.drivers.pending} icon="time" tone="warning" onPress={() => goDrivers({ verification: 'pending' })} />
          <StatCard testID="stat-suspended" label="Suspended" value={stats.drivers.suspended} icon="ban" tone="danger" onPress={() => goDrivers({ account: 'suspended' })} />
        </View>
        <Card>
          <View style={styles.splitHead}>
            <AppText variant="bodyStrong">Available now</AppText>
            <AppText variant="bodyStrong" color="primary">{stats.drivers.available} of {stats.drivers.total}</AppText>
          </View>
          <View style={styles.splitTrack} accessible accessibilityLabel={`${stats.drivers.available} available, ${stats.drivers.unavailable} unavailable`}>
            <View style={[styles.splitFill, { width: `${availablePct}%` }]} />
          </View>
          <AppText variant="caption" color="textMuted">{stats.drivers.unavailable} unavailable (offline, unverified or suspended)</AppText>
        </Card>
      </Section>

      <Section title="Passengers & contacts">
        <View style={styles.grid}>
          <StatCard label="Passenger accounts" value={stats.passengers.total} icon="people" onPress={() => router.navigate('/admin-passengers')} />
          <StatCard label={`Driver calls · ${DATE_RANGE_LABEL[range].toLowerCase()}`} value={stats.contactsInRange} icon="call" />
        </View>
        <Card>
          <AppText variant="bodyStrong" style={styles.chartTitle}>Calls per day</AppText>
          <BarChart data={perDay} summaryLabel={`Driver calls per day, ${range === '7d' ? 'last 7 days' : 'last 30 days'}`} />
        </Card>
      </Section>

      <Section title="Needs attention" action={<Button label="All reports" variant="ghost" onPress={() => router.navigate('/admin-reports')} />}>
        <View style={styles.grid}>
          <StatCard label="Open reports" value={stats.reports.open} icon="flag" tone="warning" onPress={() => router.navigate({ pathname: '/admin-reports', params: { status: 'open' } })} />
          <StatCard label="High severity unresolved" value={stats.reports.highSeverityOpen} icon="alert-circle" tone="danger" onPress={() => router.navigate({ pathname: '/admin-reports', params: { severity: 'high' } })} />
        </View>
        {attention.length === 0 ? (
          <AppText color="textMuted">Nothing needs attention right now.</AppText>
        ) : (
          <Card padded={false} style={styles.listCard}>
            {attention.map((item, i) => (
              <View key={item.id}>
                {i > 0 ? <Divider /> : null}
                <ListRow
                  icon={item.kind === 'pending_driver' ? 'time' : 'flag'}
                  iconColor={item.kind === 'pending_driver' ? 'warning' : 'danger'}
                  title={item.title}
                  subtitle={item.subtitle}
                  onPress={() => (item.kind === 'pending_driver' ? openAdminDriver(item.targetId) : openAdminReport(item.targetId))}
                />
              </View>
            ))}
          </Card>
        )}
      </Section>

      <Section title="Recent activity">
        {activity.length === 0 ? (
          <AppText color="textMuted">No activity in this period.</AppText>
        ) : (
          activity.map((a) => <ActivityItem key={a.id} event={a} onPress={() => openActivitySubject(a)} />)
        )}
      </Section>
    </AdminScreen>
  );
}

const styles = StyleSheet.create({
  firstSection: { marginTop: spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  splitHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  splitTrack: { height: 12, borderRadius: radius.pill, backgroundColor: colors.neutralTint, overflow: 'hidden', marginBottom: spacing.sm },
  splitFill: { height: '100%', backgroundColor: colors.primary, borderRadius: radius.pill },
  chartTitle: { marginBottom: spacing.md },
  listCard: { paddingHorizontal: spacing.md },
});
