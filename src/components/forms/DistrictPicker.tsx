import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText, ChipGroup } from '@/components/ui';
import { districtsIn, findDistrict, PROVINCES, ProvinceName } from '@/data/rwanda';
import { spacing } from '@/theme';

export interface DistrictPickerProps {
  value: string;
  onChange: (district: string) => void;
  error?: string;
}

/** Province first, then one of its districts, so all 30 districts fit on a phone screen. */
export function DistrictPicker({ value, onChange, error }: DistrictPickerProps) {
  const [province, setProvince] = useState<ProvinceName>(() => findDistrict(value)?.province ?? 'Kigali City');

  const chooseProvince = (next: ProvinceName) => {
    setProvince(next);
    if (findDistrict(value)?.province !== next) onChange('');
  };

  return (
    <View style={styles.wrap}>
      <AppText variant="label">Province</AppText>
      <ChipGroup
        accessibilityLabel="Province"
        value={province}
        onChange={chooseProvince}
        options={PROVINCES.map((p) => ({ value: p, label: p === 'Kigali City' ? p : `${p} Province` }))}
      />
      <AppText variant="label" style={styles.second}>District</AppText>
      <ChipGroup
        accessibilityLabel={`District in ${province}`}
        value={value}
        onChange={onChange}
        options={districtsIn(province).map((d) => ({ value: d.name, label: d.name }))}
        wrap
      />
      {error ? <AppText variant="caption" color="danger">{error}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  second: { marginTop: spacing.sm },
});
