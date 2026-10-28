import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AdminScreen } from '@/components/admin/AdminScreen';
import { openAdminReport } from '@/components/admin/navigation';
import { ActivityItem, ReportRow } from '@/components/admin/rows';
import { VerificationPhotos } from '@/components/admin/VerificationPhotos';
import {
  AccountBadge, AppText, AvailabilityBadge, Avatar, Button, Card, ConfirmDialog, EmptyState, ListRow, Section, VerificationBadge, useToast,
} from '@/components/ui';
import { activityForSubject, contactsForDriver, nameForUser, reportsAboutUser } from '@/features/admin/selectors';
import { formatDateTime, formatPhone, pluralize, relativeTime } from '@/lib/format';
import { useAppData } from '@/state/appData/AppDataProvider';
import { useActorName } from '@/state/SessionProvider';
import { spacing } from '@/theme';

type DialogKind = 'approve' | 'reject' | 'suspend' | 'reactivate';

const DIALOG: Record<DialogKind, { title: string; message: string; confirm: string; destructive?: boolean; reason?: string; toast: string }> = {
  approve: { title: 'Approve this driver?', message: 'They will be marked verified and can go online.', confirm: 'Approve', toast: 'Driver approved (simulated)' },
  reject: { title: 'Reject this registration?', message: 'The driver can’t go online. They’ll see your reason and can resubmit.', confirm: 'Reject', destructive: true, reason: 'Reason for rejecting', toast: 'Registration rejected (simulated)' },
  suspend: { title: 'Suspend this driver?', message: 'They’ll be taken offline and hidden from passengers until reactivated.', confirm: 'Suspend', destructive: true, reason: 'Reason for suspending', toast: 'Driver suspended (simulated)' },
  reactivate: { title: 'Reactivate this driver?', message: 'Their account becomes active again. They choose when to go online.', confirm: 'Reactivate', toast: 'Driver reactivated (simulated)' },
};

export default function AdminDriverDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, actions } = useAppData();
  const actor = useActorName();
  const toast = useToast();
  const [dialog, setDialog] = useState<DialogKind | null>(null);
  const driver = data.drivers.find((d) => d.id === id);
  const contacts = useMemo(() => (driver ? contactsForDriver(data, driver.id) : []), [data, driver]);
  const reports = useMemo(() => (driver ? reportsAboutUser(data, driver.id) : []), [data, driver]);
  const history = useMemo(() => (driver ? activityForSubject(data, driver.id).filter((a) => a.type !== 'contact_made') : []), [data, driver]);

  if (!driver) {
    return (
      <AdminScreen back title="Driver">
        <EmptyState title="Driver not found" body="The record may have been reset." action={{ label: 'Back to drivers', onPress: () => router.back() }} />
      </AdminScreen>
    );
  }

  const confirm = (reason?: string) => {
    if (!dialog) return;
    if (dialog === 'approve') actions.setDriverVerification(driver.id, 'approved', actor);
    if (dialog === 'reject') actions.setDriverVerification(driver.id, 'rejected', actor, reason);
    if (dialog === 'suspend') actions.setDriverAccountStatus(driver.id, 'suspended', actor, reason);
    if (dialog === 'reactivate') actions.setDriverAccountStatus(driver.id, 'active', actor);
    toast(DIALOG[dialog].toast);
    setDialog(null);
  };

  const m = driver.motorcycle;
  const d = dialog ? DIALOG[dialog] : null;

  return (
    <AdminScreen
      back
      title="Driver review"
      footer={
        <>
          {driver.verificationStatus !== 'approved' ? <Button label="Approve" icon="shield-checkmark" onPress={() => setDialog('approve')} testID="admin-approve" /> : null}
          {driver.verificationStatus !== 'rejected' ? <Button label="Reject" icon="close-circle" variant="secondary" onPress={() => setDialog('reject')} testID="admin-reject" /> : null}
          {driver.accountStatus === 'active'
            ? <Button label="Suspend" icon="ban" variant="danger" onPress={() => setDialog('suspend')} testID="admin-suspend" />
            : <Button label="Reactivate" icon="refresh" variant="secondary" onPress={() => setDialog('reactivate')} testID="admin-reactivate" />}
        </>
      }
    >
      <View style={styles.hero}>
        <Avatar name={driver.fullName} uri={driver.photoUri ?? driver.documents?.selfieUri} size={72} available={driver.isAvailable} />
        <View style={styles.flex}>
          <AppText variant="title">{driver.fullName}</AppText>
          <View style={styles.badges}>
            <VerificationBadge status={driver.verificationStatus} />
            <AccountBadge status={driver.accountStatus} />
            <AvailabilityBadge available={driver.isAvailable} />
          </View>
        </View>
      </View>

      {driver.statusReason ? (
        <Card tone="tint" style={styles.reason}>
          <AppText variant="label">Recorded reason</AppText>
          <AppText>{driver.statusReason}</AppText>
        </Card>
      ) : null}

      <Section title="Registration details">
        <ListRow icon="call" title="Phone" subtitle={formatPhone(driver.phone)} />
        <ListRow icon="location" title="Area" subtitle={`${driver.sector}, ${driver.district}`} />
        <ListRow icon="bicycle" title={`${m.make} ${m.model}`} subtitle={`${m.plateNumber} · ${m.color} · ${m.year}`} />
        <ListRow icon="calendar" title="Registered" subtitle={formatDateTime(driver.registeredAt)} />
        <ListRow icon="pulse" title="Last active" subtitle={relativeTime(driver.lastActiveAt)} />
        <ListRow icon="speedometer" title="Experience" subtitle={`${driver.completedTrips.toLocaleString()} trips · ${driver.yearsRiding} years · ${driver.languages.join(', ')}`} />
      </Section>

      <Section title="Identity check">
        <VerificationPhotos documents={driver.documents} />
      </Section>

      <Section title={`Passenger calls · ${contacts.length}`}>
        {contacts.length === 0 ? <AppText color="textMuted">No calls recorded.</AppText> : (
          contacts.slice(0, 4).map((c) => <ListRow key={c.id} icon="call" title={nameForUser(data, c.passengerId)} subtitle={relativeTime(c.contactedAt)} />)
        )}
      </Section>

      <Section title={`Reports · ${pluralize(reports.length, 'report')}`}>
        {reports.length === 0 ? <AppText color="textMuted">No reports involve this driver.</AppText> : (
          <View style={styles.stack}>{reports.map((r) => <ReportRow key={r.id} report={r} subjectName={nameForUser(data, r.subjectId)} onPress={() => openAdminReport(r.id)} />)}</View>
        )}
      </Section>

      <Section title="Status history">
        {history.length === 0 ? <AppText color="textMuted">No status changes yet.</AppText> : history.map((a) => <ActivityItem key={a.id} event={a} />)}
      </Section>

      <ConfirmDialog
        visible={!!d}
        title={d?.title ?? ''}
        message={d?.message ?? ''}
        confirmLabel={d?.confirm ?? ''}
        destructive={d?.destructive}
        reasonLabel={d?.reason}
        onCancel={() => setDialog(null)}
        onConfirm={confirm}
      />
    </AdminScreen>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginBottom: spacing.xl },
  flex: { flex: 1, gap: spacing.xs },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  reason: { gap: spacing.xs, marginBottom: spacing.xl },
  stack: { gap: spacing.sm },
});
