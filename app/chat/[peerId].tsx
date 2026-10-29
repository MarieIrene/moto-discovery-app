import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText, Avatar, EmptyState, Icon } from '@/components/ui';
import { useCallDriver } from '@/hooks/useCallDriver';
import { useChat } from '@/hooks/useChat';
import { formatDateTime, relativeTime } from '@/lib/format';
import { distanceKm, formatDistance } from '@/lib/geo';
import { openDialer } from '@/services/phone';
import { colors, MIN_TOUCH, radius, spacing, typography } from '@/theme';
import { ChatMessage } from '@/types';

const QUICK_FOR_PASSENGER = ['Muraho! Are you available?', 'Where are you now?', 'How much to town?', 'I am waiting by the road.'];
const QUICK_FOR_DRIVER = ['I am on my way.', 'I will be there in 5 minutes.', 'Where exactly are you?', 'I have arrived.'];

function timeOf(iso: string) {
  return formatDateTime(iso).split(' ').pop() ?? '';
}

function Bubble({ message, mine, showSeen }: { message: ChatMessage; mine: boolean; showSeen: boolean }) {
  return (
    <View style={[styles.bubbleRow, mine ? styles.rowMine : styles.rowTheirs]}>
      <View
        style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}
        accessible
        accessibilityLabel={`${mine ? 'You' : 'They'} said: ${message.body}. ${relativeTime(message.sentAt)}`}
      >
        <AppText color={mine ? 'onPrimary' : 'text'}>{message.body}</AppText>
        <View style={styles.meta}>
          <AppText variant="small" color={mine ? 'onPrimaryMuted' : 'textFaint'}>{timeOf(message.sentAt)}</AppText>
          {mine ? <Icon name={message.readAt ? 'checkmark-done' : 'checkmark'} size={14} color={message.readAt ? 'onPrimary' : 'onPrimaryMuted'} /> : null}
        </View>
      </View>
      {showSeen ? <AppText variant="small" color="textFaint" style={styles.seen}>Seen</AppText> : null}
    </View>
  );
}

function TypingBubble() {
  return (
    <View style={[styles.bubbleRow, styles.rowTheirs]} accessibilityLabel="Typing" accessibilityLiveRegion="polite">
      <View style={[styles.bubble, styles.bubbleTheirs, styles.typing]}>
        <AppText color="textMuted">typing…</AppText>
      </View>
    </View>
  );
}

export default function ChatScreen() {
  const { peerId } = useLocalSearchParams<{ peerId: string }>();
  const { side, peer, driver, peerOnline, messages, typing, send, isSamplePeer } = useChat(peerId);
  const callDriver = useCallDriver();
  const [draft, setDraft] = useState('');

  // Inverted list: newest at the bottom, next to the composer.
  const rows = useMemo(() => [...messages].reverse(), [messages]);
  const lastMine = rows.find((m) => m.sender === side);

  if (!peer) {
    return (
      <SafeAreaView style={styles.root}>
        <EmptyState icon="chatbubbles" title="Conversation not found" body="This person may have left Moto Discovery." action={{ label: 'Go back', onPress: () => router.back() }} />
      </SafeAreaView>
    );
  }

  const submit = (text = draft) => {
    if (!text.trim()) return;
    send(text);
    setDraft('');
  };

  const call = () => (side === 'passenger' && driver ? callDriver(driver) : openDialer(peer.phone));
  const pickup = side === 'driver' && 'location' in peer ? peer.location : undefined;
  const status = side === 'passenger'
    ? peerOnline ? 'Online now' : `Offline · last seen ${relativeTime(peer.lastActiveAt).toLowerCase()}`
    : pickup && driver ? `Passenger · ${formatDistance(distanceKm(driver.location, pickup))} away` : 'Passenger';
  const quick = side === 'passenger' ? QUICK_FOR_PASSENGER : QUICK_FOR_DRIVER;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} accessibilityRole="button" accessibilityLabel="Go back" style={styles.iconBtn} hitSlop={8}>
          <Icon name="arrow-back" size={24} />
        </Pressable>
        <Pressable
          style={styles.who}
          disabled={side !== 'passenger'}
          onPress={() => router.push({ pathname: '/driver/[id]', params: { id: peer.id } })}
          accessibilityRole={side === 'passenger' ? 'link' : undefined}
          accessibilityLabel={`${peer.fullName}, ${status}`}
        >
          <Avatar name={peer.fullName} uri={driver && side === 'passenger' ? driver.photoUri ?? driver.documents?.selfieUri : undefined} size={40} available={side === 'passenger' && peerOnline} />
          <View style={styles.flex}>
            <AppText variant="bodyStrong" numberOfLines={1}>{peer.fullName}</AppText>
            <AppText variant="small" color={peerOnline && side === 'passenger' ? 'primary' : 'textMuted'}>{typing ? 'typing…' : status}</AppText>
          </View>
        </Pressable>
        {side === 'driver' ? (
          <Pressable
            onPress={() => router.push({ pathname: '/passenger/[id]', params: { id: peer.id } })}
            accessibilityRole="button"
            accessibilityLabel={`See where ${peer.fullName} is`}
            style={styles.iconBtn}
            testID="chat-passenger-location"
          >
            <Icon name="location" size={22} color="primary" />
          </Pressable>
        ) : null}
        <Pressable onPress={call} accessibilityRole="button" accessibilityLabel={`Call ${peer.fullName}`} style={styles.iconBtn} testID="chat-call">
          <Icon name="call" size={22} color="primary" />
        </Pressable>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <FlatList
          data={rows}
          inverted={rows.length > 0}
          keyExtractor={(m) => m.id}
          contentContainerStyle={rows.length ? styles.list : styles.emptyList}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={typing ? <TypingBubble /> : undefined}
          ListFooterComponent={rows.length ? (
            <View style={styles.safety}>
              <Icon name="shield-checkmark" size={14} color="textMuted" />
              <AppText variant="small" color="textMuted" style={styles.flex}>
                {side === 'passenger'
                  ? 'This driver can see your pickup point so they can come to you. Agree the price before the trip, and never send mobile money before you ride.'
                  : 'Tap the pin above to see where this passenger is waiting. Agree the price before the trip.'}
              </AppText>
            </View>
          ) : undefined}
          ListEmptyComponent={
            <EmptyState
              icon="chatbubbles"
              title={`Say hello to ${peer.fullName.split(' ')[0]}`}
              body={side === 'passenger' ? 'Tell the driver where you are and where you are going. Agree the price before the trip.' : 'Reply to arrange the pickup point.'}
            />
          }
          renderItem={({ item }) => <Bubble message={item} mine={item.sender === side} showSeen={item === lastMine && !!item.readAt} />}
        />

        {!peerOnline ? (
          <AppText variant="caption" color="textMuted" align="center" style={styles.notice}>
            {peer.fullName.split(' ')[0]} is offline and will see your message when they are back.
          </AppText>
        ) : null}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.quick} style={styles.quickWrap}>
          {quick.map((q) => (
            <Pressable key={q} onPress={() => submit(q)} style={styles.quickChip} accessibilityRole="button" accessibilityLabel={`Send: ${q}`}>
              <AppText variant="small" color="primary">{q}</AppText>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.composer}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Write a message"
            placeholderTextColor={colors.textFaint}
            selectionColor={colors.primary}
            multiline
            maxLength={500}
            style={styles.input}
            accessibilityLabel="Message"
            testID="chat-input"
          />
          <Pressable
            onPress={() => submit()}
            disabled={!draft.trim()}
            accessibilityRole="button"
            accessibilityLabel="Send message"
            accessibilityState={{ disabled: !draft.trim() }}
            style={[styles.send, !draft.trim() && styles.sendOff]}
            testID="chat-send"
          >
            <Icon name="send" size={20} color="onPrimary" />
          </Pressable>
        </View>
        {isSamplePeer ? (
          <AppText variant="small" color="textFaint" align="center" style={styles.demo}>Demo: sample {side === 'passenger' ? 'drivers' : 'passengers'} reply automatically. Chats stay on this device.</AppText>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.sm, paddingVertical: spacing.sm,
    backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  iconBtn: { width: MIN_TOUCH, height: MIN_TOUCH, alignItems: 'center', justifyContent: 'center' },
  who: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  list: { padding: spacing.lg, gap: spacing.sm, width: '100%', maxWidth: 640, alignSelf: 'center' },
  emptyList: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  bubbleRow: { maxWidth: '82%', gap: 2 },
  rowMine: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  rowTheirs: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  bubble: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.lg, gap: 2 },
  bubbleMine: { backgroundColor: colors.primary, borderBottomRightRadius: radius.sm },
  bubbleTheirs: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: radius.sm },
  typing: { paddingVertical: spacing.sm },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, alignSelf: 'flex-end' },
  seen: { marginRight: spacing.xs },
  safety: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center', padding: spacing.md, marginBottom: spacing.sm, borderRadius: radius.md, backgroundColor: colors.primaryTint },
  notice: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xs },
  quickWrap: { flexGrow: 0 },
  quick: { gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  quickChip: { paddingHorizontal: spacing.md, minHeight: 36, justifyContent: 'center', borderRadius: radius.pill, borderWidth: 1, borderColor: colors.primaryTintStrong, backgroundColor: colors.background },
  composer: {
    flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.border,
  },
  input: {
    flex: 1, ...typography.body, color: colors.text, minHeight: MIN_TOUCH, maxHeight: 120,
    paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.md,
    borderRadius: radius.lg, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.background,
  },
  send: { width: MIN_TOUCH, height: MIN_TOUCH, borderRadius: MIN_TOUCH / 2, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  sendOff: { opacity: 0.4 },
  demo: { paddingBottom: spacing.xs, backgroundColor: colors.background },
});
