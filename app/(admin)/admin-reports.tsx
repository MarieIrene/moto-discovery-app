import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdminBanner } from '@/components/admin/AdminBanner';
import { openAdminReport } from '@/components/admin/navigation';
import { ReportRow } from '@/components/admin/rows';
import { AppText, ChipGroup, EmptyState, ScreenHeader } from '@/components/ui';
import { filterReports, nameForUser, ReportListFilters } from '@/features/admin/selectors';
import { useParamSync } from '@/hooks/useParamSync';
import { pluralize } from '@/lib/format';
import { useAppData } from '@/state/appData/AppDataProvider';
import { colors, spacing } from '@/theme';

const STATUS = ['all', 'open', 'under_review', 'resolved', 'dismissed'] as const;
const SEVERITY = ['all', 'high', 'medium', 'low'] as const;

export default function AdminReports() {
  const { data } = useAppData();
  const [filters, setFilters] = useState<ReportListFilters>({ status: 'all', severity: 'all' });
  useParamSync('status', STATUS, (status) => setFilters((f) => ({ ...f, status })));
  useParamSync('severity', SEVERITY, (severity) => setFilters((f) => ({ ...f, severity })));
  const reports = useMemo(() => filterReports(data.reports, filters), [data.reports, filters]);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.root}>
      <AdminBanner />
      <FlatList
        data={reports}
        keyExtractor={(r) => r.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            <ScreenHeader title="Reports" subtitle="Sorted by severity, then newest" />
            <ChipGroup accessibilityLabel="Report status" value={filters.status} onChange={(status) => setFilters((f) => ({ ...f, status }))}
              options={[{ value: 'all', label: 'Any status' }, { value: 'open', label: 'Open' }, { value: 'under_review', label: 'Under review' }, { value: 'resolved', label: 'Resolved' }, { value: 'dismissed', label: 'Dismissed' }]} />
            <ChipGroup accessibilityLabel="Severity" value={filters.severity} onChange={(severity) => setFilters((f) => ({ ...f, severity }))}
              options={[{ value: 'all', label: 'Any severity' }, { value: 'high', label: 'High' }, { value: 'medium', label: 'Medium' }, { value: 'low', label: 'Low' }]} />
            <AppText variant="caption" color="textMuted">Showing {pluralize(reports.length, 'report')}</AppText>
          </View>
        }
        ListEmptyComponent={<EmptyState compact icon="checkmark-done" title="No reports here" body="Nothing matches these filters." action={{ label: 'Show all reports', onPress: () => setFilters({ status: 'all', severity: 'all' }) }} />}
        renderItem={({ item }) => <ReportRow report={item} subjectName={nameForUser(data, item.subjectId)} onPress={() => openAdminReport(item.id)} />}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, width: '100%', maxWidth: 760, alignSelf: 'center' },
  header: { gap: spacing.sm, marginBottom: spacing.md },
  sep: { height: spacing.sm },
});
