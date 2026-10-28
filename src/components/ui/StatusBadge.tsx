import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ACCOUNT_LABEL, REPORT_STATUS_LABEL, SEVERITY_LABEL, VERIFICATION_LABEL } from '@/lib/labels';
import { colors, ColorToken, radius, spacing } from '@/theme';
import { AccountStatus, ReportSeverity, ReportStatus, VerificationStatus } from '@/types';
import { AppText } from './AppText';
import { Icon, IconName } from './Icon';

export type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const TONES: Record<BadgeTone, { bg: string; fg: ColorToken }> = {
  success: { bg: colors.successTint, fg: 'success' },
  warning: { bg: colors.warningTint, fg: 'warning' },
  danger: { bg: colors.dangerTint, fg: 'danger' },
  info: { bg: colors.infoTint, fg: 'info' },
  neutral: { bg: colors.neutralTint, fg: 'neutral' },
};

export interface StatusBadgeProps {
  label: string;
  tone?: BadgeTone;
  icon?: IconName;
  testID?: string;
}

/** Always pairs colour with text (and usually an icon) so status never depends on colour alone. */
export function StatusBadge({ label, tone = 'neutral', icon, testID }: StatusBadgeProps) {
  const t = TONES[tone];
  return (
    <View testID={testID} style={[styles.badge, { backgroundColor: t.bg }]} accessibilityLabel={label} accessible>
      {icon ? <Icon name={icon} size={13} color={t.fg} /> : null}
      <AppText variant="small" color={t.fg}>{label}</AppText>
    </View>
  );
}

export function VerificationBadge({ status }: { status: VerificationStatus }) {
  const map: Record<VerificationStatus, [BadgeTone, IconName]> = {
    approved: ['success', 'shield-checkmark'],
    pending: ['warning', 'time'],
    rejected: ['danger', 'close-circle'],
  };
  const [tone, icon] = map[status];
  return <StatusBadge label={VERIFICATION_LABEL[status]} tone={tone} icon={icon} />;
}

export function AccountBadge({ status }: { status: AccountStatus }) {
  return status === 'active'
    ? <StatusBadge label={ACCOUNT_LABEL.active} tone="neutral" icon="person" />
    : <StatusBadge label={ACCOUNT_LABEL.suspended} tone="danger" icon="ban" />;
}

export function AvailabilityBadge({ available }: { available: boolean }) {
  return available
    ? <StatusBadge label="Available" tone="success" icon="radio-button-on" />
    : <StatusBadge label="Offline" tone="neutral" icon="radio-button-off" />;
}

export function ReportStatusBadge({ status }: { status: ReportStatus }) {
  const map: Record<ReportStatus, [BadgeTone, IconName]> = {
    open: ['warning', 'flag'],
    under_review: ['info', 'eye'],
    resolved: ['success', 'checkmark-circle'],
    dismissed: ['neutral', 'remove-circle'],
  };
  const [tone, icon] = map[status];
  return <StatusBadge label={REPORT_STATUS_LABEL[status]} tone={tone} icon={icon} />;
}

export function SeverityBadge({ severity }: { severity: ReportSeverity }) {
  const tone: BadgeTone = severity === 'high' ? 'danger' : severity === 'medium' ? 'warning' : 'neutral';
  return <StatusBadge label={`${SEVERITY_LABEL[severity]} severity`} tone={tone} icon="alert-circle" />;
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
});
