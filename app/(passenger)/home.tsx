import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DriverCard } from '@/components/drivers/DriverCard';
import { DriverMap } from '@/components/drivers/DriverMap';
import {
  AppText, ChipGroup, EmptyState, ErrorState, Icon, LoadingState, OfflineBanner, SearchField, SegmentedControl,
} from '@/components/ui';
import { demoPlaceName } from '@/data/mock';
import { AvailabilityFilter, DiscoveryFilters, radiusOptionsWithin } from '@/features/discovery/filterDrivers';
import { useCallDriver } from '@/hooks/useCallDriver';
import { useNearbyDrivers } from '@/hooks/useNearbyDrivers';
import { useUserLocation } from '@/hooks/useUserLocation';
import { pluralize } from '@/lib/format';
import { useSession } from '@/state/SessionProvider';
import { useSettings } from '@/state/SettingsProvider';
import { colors, radius, spacing } from '@/theme';

type View_ = 'map' | 'list';

/**
 * Nearby drivers. Everything scrolls as one list (filters, map, results), so the page works on
 * small phones and with the keyboard open. A search looks across the whole of Rwanda.
 */
export default function PassengerHome() {
  const { settings } = useSettings();
  const { profile } = useSession();
  const location = useUserLocation();
  const call = useCallDriver();
  const { height } = useWindowDimensions();
  const place = demoPlaceName(profile?.district);

  const radii = radiusOptionsWithin(settings.maxDiscoveryRadiusKm);
  const [view, setView] = useState<View_>('list');
  const [radiusKm, setRadiusKm] = useState(() => radii.find((r) => r >= 5) ?? radii[radii.length - 1] ?? 5);
  const [availability, setAvailability] = useState<AvailabilityFilter>('available');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string>();

  const searching = query.trim().length > 0;
  const effectiveRadius = Math.min(radiusKm, settings.maxDiscoveryRadiusKm);
  const filters = useMemo<DiscoveryFilters>(
    () => ({ radiusKm: searching ? Infinity : effectiveRadius, availability, query }),
    [searching, effectiveRadius, availability, query],
  );
  const origin = location.state.status === 'ready' ? location.state.point : null;
  const { load, drivers, refresh } = useNearbyDrivers(origin, filters, profile?.id);
  const availableCount = drivers.filter((d) => d.isAvailable).length;
  const selected = drivers.find((d) => d.id === selectedId);

  const openDriver = (id: string) => router.push({ pathname: '/driver/[id]', params: { id } });

  /** Everything that isn't a row of the driver list: states, or the map. Null when the list shows. */
  const renderBody = () => {
    const s = location.state;
    if (s.status === 'loading') return <LoadingState label="Finding your location" />;
    if (s.status === 'denied') {
      return (
        <ErrorState
          icon="location"
          title="Location is off for Moto Discovery"
          body={`Allow location access to sort drivers by distance, or browse from ${place} town instead.`}
          action={{ label: 'Allow location', onPress: location.requestAccess, icon: 'navigate' }}
          secondaryAction={{ label: `Use ${place} demo location`, onPress: location.useDemoLocation }}
          testID="permission-denied"
        />
      );
    }
    if (s.status === 'unavailable') {
      return (
        <ErrorState
          icon="navigate-circle"
          title="Couldn’t get your location"
          body={s.message}
          action={{ label: 'Try again', onPress: location.refresh, icon: 'refresh' }}
          secondaryAction={{ label: `Use ${place} demo location`, onPress: location.useDemoLocation }}
        />
      );
    }
    if (load.status === 'loading') return <LoadingState label="Looking for drivers nearby" />;
    if (load.status === 'error') {
      return <ErrorState title="Drivers didn’t load" body={load.message} action={{ label: 'Try again', onPress: refresh, icon: 'refresh' }} testID="load-error" />;
    }
    if (drivers.length === 0) {
      const largest = radii[radii.length - 1] ?? radiusKm;
      return (
        <EmptyState
          icon="bicycle"
          title={searching ? 'No drivers match your search' : 'No drivers in this area'}
          body={
            searching ? 'Try a driver’s name, a district or town, or a plate number.'
              : s.isDemo ? 'Widen the radius or include offline drivers.'
              : `Sample drivers wait near the main town of every district. Widen the radius, or switch to the ${place} demo location.`
          }
          action={
            searching ? { label: 'Clear search', onPress: () => setQuery('') }
              : radiusKm < largest ? { label: `Search within ${largest} km`, onPress: () => setRadiusKm(largest) }
              : !s.isDemo ? { label: `Use ${place} demo location`, onPress: location.useDemoLocation }
              : { label: 'Show offline drivers', onPress: () => setAvailability('all') }
          }
          testID="empty-drivers"
        />
      );
    }
    if (view === 'list') return null;
    return (
      <View style={styles.mapWrap}>
        <DriverMap origin={s.point} radiusKm={searching ? 25 : effectiveRadius} drivers={drivers} selectedId={selectedId} onSelect={setSelectedId} height={Math.max(280, height * 0.42)} />
        {selected ? (
          <DriverCard driver={selected} selected onPress={() => openDriver(selected.id)} onCall={() => call(selected)} />
        ) : (
          <View style={styles.hint}>
            <Icon name="hand-left" size={16} color="textMuted" />
            <AppText variant="caption" color="textMuted">Tap a motorcycle on the map to see the driver.</AppText>
          </View>
        )}
      </View>
    );
  };

  const body = renderBody();
  const showList = view === 'list' && body === null;
  const ready = location.state.status === 'ready';

  const controls = (
    <View style={styles.controls}>
      <SearchField
        value={query}
        onChangeText={setQuery}
        onSubmit={() => setView('list')}
        placeholder="Search name, district, town or plate"
        testID="driver-search"
      />
      {searching ? (
        <AppText variant="caption" color="textMuted">Searching all of Rwanda, nearest first.</AppText>
      ) : (
        <ChipGroup
          accessibilityLabel="Search radius"
          value={radiusKm}
          onChange={setRadiusKm}
          options={radii.map((r) => ({ value: r, label: `${r} km` }))}
        />
      )}
      <View style={styles.toggles}>
        <View style={styles.flex}>
          <SegmentedControl
            accessibilityLabel="Show drivers"
            value={availability}
            onChange={setAvailability}
            segments={[{ value: 'available', label: 'Available' }, { value: 'all', label: 'All' }]}
          />
        </View>
        <View style={styles.flex}>
          <SegmentedControl
            accessibilityLabel="View as"
            value={view}
            onChange={setView}
            segments={[{ value: 'list', label: 'List', icon: 'list' }, { value: 'map', label: 'Map', icon: 'map' }]}
          />
        </View>
      </View>
      {showList ? (
        <AppText variant="label" color="textMuted" style={styles.listTitle}>
          {searching ? `${pluralize(drivers.length, 'result')}` : `${pluralize(drivers.length, 'driver')} · nearest first`}
        </AppText>
      ) : null}
    </View>
  );

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerInner}>
          <AppText variant="small" color="onPrimaryMuted">
            {ready ? (location.state.status === 'ready' && location.state.isDemo ? `${place} demo location` : 'Your current location') : 'Locating…'}
          </AppText>
          <AppText variant="title" color="onPrimary">
            {ready && load.status === 'ready' ? `${pluralize(availableCount, 'driver')} available` : 'Drivers near you'}
          </AppText>
          <AppText variant="caption" color="onPrimaryMuted">{searching ? 'across Rwanda' : `within ${effectiveRadius} km`}</AppText>
        </View>
      </SafeAreaView>
      <OfflineBanner />
      <FlatList
        data={showList ? drivers : []}
        keyExtractor={(d) => d.id}
        ListHeaderComponent={
          <>
            {controls}
            {body ? <View style={styles.body}>{body}</View> : null}
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.item}>
            <DriverCard driver={item} onPress={() => openDriver(item.id)} onCall={() => call(item)} />
          </View>
        )}
        contentContainerStyle={styles.content}
        refreshing={false}
        onRefresh={refresh}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        testID="nearby-scroll"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary, borderBottomLeftRadius: radius.lg, borderBottomRightRadius: radius.lg },
  headerInner: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.lg, width: '100%', maxWidth: 640, alignSelf: 'center' },
  content: { paddingBottom: spacing.xxl, width: '100%', maxWidth: 640, alignSelf: 'center' },
  controls: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.sm },
  toggles: { flexDirection: 'row', gap: spacing.sm },
  flex: { flex: 1 },
  listTitle: { marginTop: spacing.sm },
  body: { minHeight: 320 },
  mapWrap: { padding: spacing.lg, gap: spacing.md },
  hint: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, justifyContent: 'center', paddingVertical: spacing.md },
  item: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
});
