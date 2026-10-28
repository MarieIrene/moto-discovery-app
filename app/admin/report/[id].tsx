import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AdminScreen } from '@/components/admin/AdminScreen';
import { openAdminDriver, openAdminPassenger } from '@/components/admin/navigation';
import {
  AppText, Button, Card, ConfirmDialog, EmptyState, Icon, ListRow, ReportStatusBadge, Section, SeverityBadge, TextField, useToast,
} from '@/components/ui';
import { nameForUser } from '@/features/admin/selectors';
import { formatDateTime } from '@/lib/format';
import { CATEGORY_LABEL, REPORT_STATUS_LABEL } from '@/lib/labels';
import { useAppData } from '@/state/appData/AppDataProvider';
import { useActorName } from '@/state/SessionProvider';
import { colors, spacing } from '@/theme';
import { ReportStatus } from '@/types';

/** Allowed transitions. Closed reports can be reopened for review. */
const NEXT: Record<ReportStatus, ReportStatus[]> = {
  open: ['under_review', 'resolved', 'dismissed'],
  under_review: ['resolved', 'dismissed', 'open'],
  resolved: ['under_review'],
  dismissed: ['under_review'],
};

const ACTION_LABEL: Record<ReportStatus, string> = { open: 'Reopen', under_review: 'Mark under review', resolved: 'Resolve', dismissed: 'Dismiss' };

export default function AdminReportDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, actions } = useAppData();
  const actor = useActorName();
  const toast = useToast();
  const [target, setTarget] = useState<ReportStatus | null>(null);
  const [note, setNote] = useState('');
  const [noteError, setNoteError] = useState<string>();
  const report = data.reports.find((r) => r.id === id);

  if (!report) {
    return (
      <AdminScreen back title="Report">
        <EmptyState title="Report not found" action={{ label: 'Back to reports', onPress: () => router.back() }} />
      </AdminScreen>
    );
  }

  const openUser = (userId: string, role: 'driver' | 'passenger') => (role === 'driver' ? openAdminDriver(userId) : openAdminPassenger(userId));
  const needsReason = target === 'resolved' || target === 'dismissed';

  const addNote = () => {
    if (note.trim().length < 3) return setNoteError('Write at least a few words');
    actions.addReportNote(report.id, note.trim(), actor);
    setNote('');
    setNoteError(undefined);
    toast('Note added');
  };

  return (
    <AdminScreen
      back
      title="Report"
      subtitle={`${CATEGORY_LABEL[report.category]} · ${formatDateTime(report.createdAt)}`}
      footer={NEXT[report.status].map((s) => (
        <Button
          key={s}
          label={ACTION_LABEL[s]}
          variant={s === 'resolved' ? 'primary' : s === 'dismissed' ? 'ghost' : 'secondary'}
          onPress={() => setTarget(s)}
          testID={`report-action-${s}`}
        />
      ))}
    >
      <View style={styles.badges}>
        <ReportStatusBadge status={report.status} />
        <SeverityBadge severity={report.severity} />
      </View>
      <Card tone="tint" style={styles.description}>
        <AppText>{report.description}</AppText>
      </Card>

      <Section title="People involved">
        <ListRow icon="flag" title={`Reported: ${nameForUser(data, report.subjectId)}`} subtitle={report.subjectRole === 'driver' ? 'Driver' : 'Passenger'} onPress={() => openUser(report.subjectId, report.subjectRole)} />
        <ListRow icon="person" title={`Reporter: ${nameForUser(data, report.reporterId)}`} subtitle={report.reporterRole === 'driver' ? 'Driver' : 'Passenger'} onPress={() => openUser(report.reporterId, report.reporterRole)} />
      </Section>

      <Section title="Internal notes">
        {report.notes.length === 0 ? <AppText color="textMuted">No notes yet. Notes are only visible to admins.</AppText> : report.notes.map((n) => (
          <View key={n.id} style={styles.note}>
            <AppText>{n.body}</AppText>
            <AppText variant="small" color="textMuted">{n.author} · {formatDateTime(n.createdAt)}</AppText>
          </View>
        ))}
        <TextField label="Add a note" value={note} onChangeText={(t) => { setNote(t); setNoteError(undefined); }} multiline placeholder="e.g. Called the passenger to confirm details" error={noteError} testID="report-note-input" />
        <Button label="Add note" icon="add" variant="secondary" onPress={addNote} testID="report-add-note" />
      </Section>

      <Section title="History">
        <View style={styles.timeline}>
          <TimelineItem title="Report submitted" meta={`${nameForUser(data, report.reporterId)} · ${formatDateTime(report.createdAt)}`} />
          {report.history.map((h) => (
            <TimelineItem key={h.id} title={`${REPORT_STATUS_LABEL[h.from]} → ${REPORT_STATUS_LABEL[h.to]}`} meta={`${h.by} · ${formatDateTime(h.at)}`} detail={h.reason} />
          ))}
        </View>
      </Section>

      <ConfirmDialog
        visible={!!target}
        title={target ? `${ACTION_LABEL[target]}?` : ''}
        message={target ? `The report will move to “${REPORT_STATUS_LABEL[target]}”. This is recorded in its history.` : ''}
        confirmLabel={target ? ACTION_LABEL[target] : ''}
        reasonLabel={needsReason ? 'Outcome' : undefined}
        onCancel={() => setTarget(null)}
        onConfirm={(reason) => {
          if (!target) return;
          actions.setReportStatus(report.id, target, actor, reason);
          toast(`Report ${REPORT_STATUS_LABEL[target].toLowerCase()}`);
          setTarget(null);
        }}
      />
    </AdminScreen>
  );
}

function TimelineItem({ title, meta, detail }: { title: string; meta: string; detail?: string }) {
  return (
    <View style={styles.tItem}>
      <View style={styles.tDot}><Icon name="ellipse" size={10} color="primary" /></View>
      <View style={styles.flex}>
        <AppText variant="bodyStrong">{title}</AppText>
        <AppText variant="small" color="textMuted">{meta}</AppText>
        {detail ? <AppText variant="caption">{detail}</AppText> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badges: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  description: { marginBottom: spacing.xl },
  note: { gap: 2, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  timeline: { borderLeftWidth: 2, borderLeftColor: colors.primaryTintStrong, marginLeft: 6, paddingLeft: spacing.lg, gap: spacing.md },
  tItem: { flexDirection: 'row', gap: spacing.sm },
  tDot: { position: 'absolute', left: -spacing.lg - 6, top: 6 },
  flex: { flex: 1, gap: 2 },
});
