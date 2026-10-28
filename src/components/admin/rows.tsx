import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  AccountBadge, AppText, AvailabilityBadge, Avatar, Icon, IconName, ReportStatusBadge, SeverityBadge, VerificationBadge,
} from '@/components/ui';
import { formatPhone, relativeTime } from '@/lib/format';
import { CATEGORY_LABEL } from '@/lib/labels';
import { colors, radius, spacing } from '@/theme';
import { ActivityEvent, ActivityType, Driver, Passenger, Report } from '@/types';

function RowShell({ onPress, label, children, testID }: { onPress: () => void; label: string; children: React.ReactNode; testID?: string }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={({ pressed }) => [styles.row, pressed && styles.pressed]} testID={testID}>
      {children}
      <Icon name="chevron-forward" size={18} color="textFaint" />
    </Pressable>
  );
}

export function AdminDriverRow({ driver, onPress }: { driver: Driver; onPress: () => void }) {
  return (
    <RowShell onPress={onPress} label={`${driver.fullName}, ${driver.verificationStatus}, ${driver.accountStatus}`} testID={`admin-driver-${driver.id}`}>
      <Avatar name={driver.fullName} uri={driver.photoUri} size={44} />
      <View style={styles.body}>
        <AppText variant="bodyStrong" numberOfLines={1}>{driver.fullName}</AppText>
        <AppText variant="caption" color="textMuted" numberOfLines={1}>{driver.motorcycle.plateNumber} · {driver.sector} · joined {relativeTime(driver.registeredAt)}</AppText>
        <View style={styles.badges}>
          <VerificationBadge status={driver.verificationStatus} />
          {driver.accountStatus === 'suspended' ? <AccountBadge status="suspended" /> : <AvailabilityBadge available={driver.isAvailable} />}
        </View>
      </View>
    </RowShell>
  );
}

export function AdminPassengerRow({ passenger, contactCount, onPress }: { passenger: Passenger; contactCount: number; onPress: () => void }) {
  return (
    <RowShell onPress={onPress} label={`${passenger.fullName}, ${passenger.accountStatus}`} testID={`admin-passenger-${passenger.id}`}>
      <Avatar name={passenger.fullName} size={44} />
      <View style={styles.body}>
        <AppText variant="bodyStrong" numberOfLines={1}>{passenger.fullName}</AppText>
        <AppText variant="caption" color="textMuted" numberOfLines={1}>{formatPhone(passenger.phone)} · {passenger.district}</AppText>
        <View style={styles.badges}>
          <AccountBadge status={passenger.accountStatus} />
          <AppText variant="small" color="textMuted">{contactCount} calls · active {relativeTime(passenger.lastActiveAt)}</AppText>
        </View>
      </View>
    </RowShell>
  );
}

export function ReportRow({ report, subjectName, onPress }: { report: Report; subjectName: string; onPress: () => void }) {
  return (
    <RowShell onPress={onPress} label={`${CATEGORY_LABEL[report.category]} report about ${subjectName}, ${report.severity} severity, ${report.status}`} testID={`report-${report.id}`}>
      <View style={[styles.reportIcon, report.severity === 'high' && styles.reportHigh]}>
        <Icon name="flag" size={18} color={report.severity === 'high' ? 'danger' : 'warning'} />
      </View>
      <View style={styles.body}>
        <AppText variant="bodyStrong" numberOfLines={1}>{CATEGORY_LABEL[report.category]} · {subjectName}</AppText>
        <AppText variant="caption" color="textMuted" numberOfLines={2}>{report.description}</AppText>
        <View style={styles.badges}>
          <ReportStatusBadge status={report.status} />
          <SeverityBadge severity={report.severity} />
          <AppText variant="small" color="textFaint">{relativeTime(report.createdAt)}</AppText>
        </View>
      </View>
    </RowShell>
  );
}

const ACTIVITY_ICON: Record<ActivityType, IconName> = {
  driver_registered: 'person-add', driver_approved: 'shield-checkmark', driver_rejected: 'close-circle', driver_suspended: 'ban',
  driver_reactivated: 'refresh-circle', driver_online: 'radio-button-on', driver_offline: 'radio-button-off', passenger_joined: 'person-add',
  passenger_suspended: 'ban', passenger_reactivated: 'refresh-circle', contact_made: 'call', report_submitted: 'flag',
  report_status_changed: 'git-commit', report_note_added: 'document-text',
};

export function ActivityItem({ event, onPress }: { event: ActivityEvent; onPress?: () => void }) {
  const content = (
    <>
      <View style={styles.activityIcon}><Icon name={ACTIVITY_ICON[event.type]} size={16} color="primary" /></View>
      <View style={styles.body}>
        <AppText>{event.message}</AppText>
        <AppText variant="small" color="textMuted">{event.actor} · {relativeTime(event.createdAt)}</AppText>
      </View>
    </>
  );
  if (!onPress) return <View style={styles.activity}>{content}</View>;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [styles.activity, pressed && styles.pressed]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background },
  pressed: { backgroundColor: colors.surface },
  body: { flex: 1, gap: 3 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.xs, marginTop: 2 },
  reportIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.warningTint, alignItems: 'center', justifyContent: 'center' },
  reportHigh: { backgroundColor: colors.dangerTint },
  activity: { flexDirection: 'row', gap: spacing.md, paddingVertical: spacing.sm, alignItems: 'flex-start' },
  activityIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primaryTint, alignItems: 'center', justifyContent: 'center' },
});
