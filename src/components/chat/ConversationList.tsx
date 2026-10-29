import { router } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { AppText, Avatar, EmptyState, Screen, ScreenHeader } from '@/components/ui';
import { useChatSide, useConversations } from '@/hooks/useChat';
import { relativeTime } from '@/lib/format';
import { useAppData } from '@/state/appData/AppDataProvider';
import { colors, radius, spacing } from '@/theme';

/** The Messages tab: everyone this user has chatted with, newest first. */
export function ConversationList() {
  const { data } = useAppData();
  const { side } = useChatSide();
  const conversations = useConversations();

  const peerOf = (id: string) => (side === 'passenger' ? data.drivers.find((d) => d.id === id) : data.passengers.find((p) => p.id === id));

  return (
    <Screen padded={false}>
      <View style={styles.head}>
        <ScreenHeader
          title="Messages"
          subtitle={side === 'passenger' ? 'Chat with drivers to arrange your pickup.' : 'Passengers who wrote to you.'}
        />
      </View>
      <FlatList
        data={conversations}
        keyExtractor={(c) => c.peerId}
        contentContainerStyle={conversations.length ? styles.list : styles.emptyList}
        ListEmptyComponent={
          <EmptyState
            icon="chatbubbles"
            title="No messages yet"
            body={side === 'passenger'
              ? 'Open a driver’s profile and tap Message to start a chat.'
              : 'When a passenger writes to you, the conversation shows here.'}
            action={side === 'passenger' ? { label: 'Find a driver', onPress: () => router.navigate('/home') } : undefined}
          />
        }
        renderItem={({ item }) => {
          const peer = peerOf(item.peerId);
          const name = peer?.fullName ?? (side === 'passenger' ? 'Driver' : 'Passenger');
          const online = side === 'passenger' && !!peer && 'isAvailable' in peer && peer.isAvailable;
          const prefix = item.last.sender === side ? 'You: ' : '';
          return (
            <Pressable
              onPress={() => router.push({ pathname: '/chat/[peerId]', params: { peerId: item.peerId } })}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel={`${name}. ${item.unread ? `${item.unread} unread. ` : ''}Last message: ${item.last.body}`}
              testID={`conversation-${item.peerId}`}
            >
              <Avatar name={name} uri={peer && 'photoUri' in peer ? peer.photoUri : undefined} available={online} />
              <View style={styles.text}>
                <View style={styles.top}>
                  <AppText variant="bodyStrong" numberOfLines={1} style={styles.name}>{name}</AppText>
                  <AppText variant="small" color={item.unread ? 'primary' : 'textFaint'}>{relativeTime(item.last.sentAt)}</AppText>
                </View>
                <View style={styles.top}>
                  <AppText variant="caption" color={item.unread ? 'text' : 'textMuted'} numberOfLines={1} style={styles.name}>
                    {prefix}{item.last.body}
                  </AppText>
                  {item.unread ? (
                    <View style={styles.badge}><AppText variant="small" color="onPrimary">{item.unread}</AppText></View>
                  ) : null}
                </View>
              </View>
            </Pressable>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  emptyList: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  pressed: { backgroundColor: colors.surface },
  text: { flex: 1, gap: 2 },
  top: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  name: { flex: 1 },
  badge: { minWidth: 22, height: 22, paddingHorizontal: 6, borderRadius: radius.pill, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
});
