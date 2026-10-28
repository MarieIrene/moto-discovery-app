import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdminBanner } from '@/components/admin/AdminBanner';
import { openAdminPassenger } from '@/components/admin/navigation';
import { AdminPassengerRow } from '@/components/admin/rows';
import { AppText, ChipGroup, EmptyState, ScreenHeader, SearchField } from '@/components/ui';
import { filterAdminPassengers, PassengerListFilters } from '@/features/admin/selectors';
import { pluralize } from '@/lib/format';
import { useAppData } from '@/state/appData/AppDataProvider';
import { colors, spacing } from '@/theme';

export default function AdminPassengers() {
  const { data } = useAppData();
  const [filters, setFilters] = useState<PassengerListFilters>({ query: '', account: 'all' });
  const passengers = useMemo(() => filterAdminPassengers(data.passengers, filters), [data.passengers, filters]);
  const contactCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of data.contacts) counts.set(c.passengerId, (counts.get(c.passengerId) ?? 0) + 1);
    return counts;
  }, [data.contacts]);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.root}>
      <AdminBanner />
      <FlatList
        data={passengers}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.header}>
            <ScreenHeader title="Passengers" subtitle={pluralize(data.passengers.length, 'passenger account')} />
            <SearchField value={filters.query} onChangeText={(query) => setFilters((f) => ({ ...f, query }))} placeholder="Search name, phone or district" />
            <ChipGroup accessibilityLabel="Account status" value={filters.account} onChange={(account) => setFilters((f) => ({ ...f, account }))}
              options={[{ value: 'all', label: 'All' }, { value: 'active', label: 'Active' }, { value: 'suspended', label: 'Suspended' }]} />
            <AppText variant="caption" color="textMuted">Showing {pluralize(passengers.length, 'passenger')}</AppText>
          </View>
        }
        ListEmptyComponent={<EmptyState compact title="No passengers match" body="Try a different search or filter." action={{ label: 'Clear filters', onPress: () => setFilters({ query: '', account: 'all' }) }} />}
        renderItem={({ item }) => <AdminPassengerRow passenger={item} contactCount={contactCounts.get(item.id) ?? 0} onPress={() => openAdminPassenger(item.id)} />}
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
