import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdminBanner } from '@/components/admin/AdminBanner';
import { openAdminDriver } from '@/components/admin/navigation';
import { AdminDriverRow } from '@/components/admin/rows';
import { AppText, ChipGroup, EmptyState, ScreenHeader, SearchField } from '@/components/ui';
import { DriverListFilters, filterAdminDrivers } from '@/features/admin/selectors';
import { useParamSync } from '@/hooks/useParamSync';
import { pluralize } from '@/lib/format';
import { useAppData } from '@/state/appData/AppDataProvider';
import { colors, spacing } from '@/theme';

const VERIFICATION = ['all', 'pending', 'approved', 'rejected'] as const;
const ACCOUNT = ['all', 'active', 'suspended'] as const;
const AVAILABILITY = ['all', 'available', 'unavailable'] as const;

export default function AdminDrivers() {
  const { data } = useAppData();
  const [filters, setFilters] = useState<DriverListFilters>({ query: '', verification: 'all', availability: 'all', account: 'all' });
  const set = <K extends keyof DriverListFilters>(k: K) => (v: DriverListFilters[K]) => setFilters((f) => ({ ...f, [k]: v }));

  useParamSync('verification', VERIFICATION, set('verification'));
  useParamSync('account', ACCOUNT, set('account'));

  const drivers = useMemo(() => filterAdminDrivers(data.drivers, filters), [data.drivers, filters]);
  const filtered = filters.query || filters.verification !== 'all' || filters.account !== 'all' || filters.availability !== 'all';

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.root}>
      <AdminBanner />
      <FlatList
        data={drivers}
        keyExtractor={(d) => d.id}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.header}>
            <ScreenHeader title="Drivers" subtitle={`${pluralize(data.drivers.length, 'registered driver')}`} />
            <SearchField value={filters.query} onChangeText={set('query')} placeholder="Search name, phone or plate" />
            <ChipGroup accessibilityLabel="Verification status" value={filters.verification} onChange={set('verification')}
              options={[{ value: 'all', label: 'Any status' }, { value: 'pending', label: 'Pending' }, { value: 'approved', label: 'Approved' }, { value: 'rejected', label: 'Rejected' }]} />
            <ChipGroup accessibilityLabel="Availability" value={filters.availability} onChange={set('availability')}
              options={[{ value: 'all', label: 'Any availability' }, { value: 'available', label: 'Available' }, { value: 'unavailable', label: 'Unavailable' }]} />
            <ChipGroup accessibilityLabel="Account status" value={filters.account} onChange={set('account')}
              options={[{ value: 'all', label: 'Any account' }, { value: 'active', label: 'Active' }, { value: 'suspended', label: 'Suspended' }]} />
            <AppText variant="caption" color="textMuted" accessibilityLiveRegion="polite">Showing {pluralize(drivers.length, 'driver')}</AppText>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            compact
            title="No drivers match"
            body="Try a different search or clear the filters."
            action={filtered ? { label: 'Clear filters', onPress: () => setFilters({ query: '', verification: 'all', availability: 'all', account: 'all' }) } : undefined}
          />
        }
        renderItem={({ item }) => <AdminDriverRow driver={item} onPress={() => openAdminDriver(item.id)} />}
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
