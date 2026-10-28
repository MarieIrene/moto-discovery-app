import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DriverCard } from '@/components/drivers/DriverCard';
import { DriverMap } from '@/components/drivers/DriverMap';
import {
  AppText, ChipGroup, EmptyState, ErrorState, Icon, LoadingState, OfflineBanner, SearchField, SegmentedControl,
} from '@/components/ui';
import { AvailabilityFilter, DiscoveryFilters, radiusOptionsWithin } from '@/features/discovery/filterDrivers';
import { useCallDriver } from '@/hooks/useCallDriver';
import { useNearbyDrivers } from '@/hooks/useNearbyDrivers';
import { useUserLocation } from '@/hooks/useUserLocation';
import { pluralize } from '@/lib/format';
import { useSession } from '@/state/SessionProvider';
import { useSettings } from '@/state/SettingsProvider';
import { colors, radius, spacing } from '@/theme';

type View_ = 'map' | 'list';

export default function PassengerHome() {
  const { settings } = useSettings();
  const { profile } = useSession();
  const location = useUserLocation();
  const call = useCallDriver();
  const { height } = useWindowDimensions();

  const radii = radiusOptionsWithin(settings.maxDiscoveryRadiusKm);
  const [view, setView] = useState<View_>('map');
  const [radiusKm, setRadiusKm] = useState(() => radii.find((r) => r >= 5) ?? radii[radii.length - 1] ?? 5);
  const [availability, setAvailability] = useState<AvailabilityFilter>('available');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string>();

  const effectiveRadius = Math.min(radiusKm, settings.maxDiscoveryRadiusKm);
  const filters = useMemo<DiscoveryFilters>(() => ({ radiusKm: effectiveRadius, availability, query }), [effectiveRadius, availability, query]);
  const origin = location.state.status === 'ready' ? location.state.point : null;
  const { load, drivers, refresh } = useNearbyDrivers(origin, filters, profile?.id);
  const availableCount = drivers.filter((d) => d.isAvailable).length;
  const selected = drivers.find((d) => d.id === selectedId);

  const openDriver = (id: string) => router.push({ pathname: '/driver/[id]', params: { id } });

  const renderBody = () => {
    const s = location.state;
    if (s.status === 'loading') return <LoadingState label="Finding your location" />;
    if (s.status === 'denied') {
      return (
        <ErrorState
          icon="location"
          title="Location is off for Moto Discovery"
          body="Allow location access to sort drivers by distance, or browse with a Kigali demo location."
          action={{ label: 'Allow location', onPress: location.requestAccess, icon: 'navigate' }}
          secondaryAction={{ label: 'Use Kigali demo location', onPress: location.useDemoLocation }}
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
          secondaryAction={{ label: 'Use Kigali demo location', onPress: location.useDemoLocation }}
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
          title={query ? 'No drivers match your search' : 'No drivers in this area'}
          body={
            query ? 'Try a different name, area or plate number.'
              : s.isDemo ? 'Widen the radius or include offline drivers.'
              : 'Sample drivers are around central Kigali. If you are elsewhere, switch to the demo location.'
          }
          action={
            query ? { label: 'Clear search', onPress: () => setQuery('') }
              : radiusKm < largest ? { label: `Search within ${largest} km`, onPress: () => setRadiusKm(largest) }
              : !s.isDemo ? { label: 'Use Kigali demo location', onPress: location.useDemoLocation }
              : { label: 'Show offline drivers', onPress: () => setAvailability('all') }
          }
          testID="empty-drivers"
        />
      );
    }

    if (view === 'map') {
      return (
        <View style={styles.mapWrap}>
          <DriverMap origin={s.point} radiusKm={effectiveRadius} drivers={drivers} selectedId={selectedId} onSelect={setSelectedId} height={Math.max(280, height * 0.42)} />
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
    }
    return (
      <FlatList
        data={drivers}
        keyExtractor={(d) => d.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <DriverCard driver={item} onPress={() => openDriver(item.id)} onCall={() => call(item)} />}
        refreshing={false}
        onRefresh={refresh}
        keyboardShouldPersistTaps="handled"
      />
    );
  };

  const ready = location.state.status === 'ready';
  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerInner}>
          <AppText variant="small" color="onPrimaryMuted">
            {location.state.status === 'ready' ? (location.state.isDemo ? 'Kigali demo location' : 'Your current location') : 'Locating…'}
          </AppText>
          <AppText variant="title" color="onPrimary">
            {ready && load.status === 'ready' ? `${pluralize(availableCount, 'driver')} available` : 'Drivers near you'}
          </AppText>
          <AppText variant="caption" color="onPrimaryMuted">within {effectiveRadius} km</AppText>
        </View>
      </SafeAreaView>
      <OfflineBanner />
      <View style={styles.controls}>
        <SearchField value={query} onChangeText={setQuery} placeholder="Search name, area or plate" />
        <ChipGroup
          accessibilityLabel="Search radius"
          value={radiusKm}
          onChange={setRadiusKm}
          options={radii.map((r) => ({ value: r, label: `${r} km` }))}
        />
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
              segments={[{ value: 'map', label: 'Map', icon: 'map' }, { value: 'list', label: 'List', icon: 'list' }]}
            />
          </View>
        </View>
      </View>
      <View style={styles.body}>{renderBody()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary, borderBottomLeftRadius: radius.lg, borderBottomRightRadius: radius.lg },
  headerInner: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.lg, width: '100%', maxWidth: 640, alignSelf: 'center' },
  controls: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.sm, width: '100%', maxWidth: 640, alignSelf: 'center' },
  toggles: { flexDirection: 'row', gap: spacing.sm },
  flex: { flex: 1 },
  body: { flex: 1, width: '100%', maxWidth: 640, alignSelf: 'center' },
  mapWrap: { padding: spacing.lg, gap: spacing.md },
  hint: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, justifyContent: 'center', paddingVertical: spacing.md },
  list: { padding: spacing.lg, gap: spacing.sm },
});
