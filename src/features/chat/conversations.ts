import { ChatMessage } from '@/types';

export type ChatSide = ChatMessage['sender'];

export interface Conversation {
  /** The other person: a driver id for passengers, a passenger id for drivers. */
  peerId: string;
  last: ChatMessage;
  unread: number;
}

const mine = (m: ChatMessage, side: ChatSide, selfId: string) => (side === 'passenger' ? m.passengerId : m.driverId) === selfId;
const peerOf = (m: ChatMessage, side: ChatSide) => (side === 'passenger' ? m.driverId : m.passengerId);

/** Messages between a driver and a passenger, oldest first. */
export function threadMessages(messages: ChatMessage[], driverId: string, passengerId: string): ChatMessage[] {
  return messages
    .filter((m) => m.driverId === driverId && m.passengerId === passengerId)
    .sort((a, b) => a.sentAt.localeCompare(b.sentAt));
}

/** One row per person this user has chatted with, most recent first. */
export function conversationsFor(messages: ChatMessage[], side: ChatSide, selfId: string): Conversation[] {
  const byPeer = new Map<string, Conversation>();
  for (const m of messages) {
    if (!mine(m, side, selfId)) continue;
    const peerId = peerOf(m, side);
    const row = byPeer.get(peerId) ?? { peerId, last: m, unread: 0 };
    if (m.sentAt >= row.last.sentAt) row.last = m;
    if (m.sender !== side && !m.readAt) row.unread += 1;
    byPeer.set(peerId, row);
  }
  return [...byPeer.values()].sort((a, b) => b.last.sentAt.localeCompare(a.last.sentAt));
}

export function unreadCount(messages: ChatMessage[], side: ChatSide, selfId: string): number {
  return messages.filter((m) => mine(m, side, selfId) && m.sender !== side && !m.readAt).length;
}
