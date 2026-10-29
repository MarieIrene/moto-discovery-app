import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChatSide, conversationsFor, threadMessages, unreadCount } from '@/features/chat/conversations';
import { replyDelayMs, simulatedReply } from '@/features/chat/simulatedReplies';
import { useAppData } from '@/state/appData/AppDataProvider';
import { useSession } from '@/state/SessionProvider';

/** Which side of a chat the device user is on, from the mode they are in. */
export function useChatSide(): { side: ChatSide; selfId: string | undefined } {
  const { activeRole, profile } = useSession();
  return { side: activeRole === 'driver' ? 'driver' : 'passenger', selfId: profile?.id };
}

/** Sample records (drv-…, psg-…) have no one behind them; accounts made on a device start with usr-. */
const isSample = (id: string) => id.startsWith('drv-') || id.startsWith('psg-');

/** One conversation with `peerId`: a driver when you're a passenger, a passenger when you're driving. */
export function useChat(peerId: string) {
  const { data, actions } = useAppData();
  const { side, selfId } = useChatSide();
  const [typing, setTyping] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const driverId = side === 'driver' ? selfId : peerId;
  const passengerId = side === 'passenger' ? selfId : peerId;
  const driver = data.drivers.find((d) => d.id === (side === 'passenger' ? peerId : selfId));
  const peer = side === 'passenger' ? data.drivers.find((d) => d.id === peerId) : data.passengers.find((p) => p.id === peerId);
  const peerOnline = side === 'passenger' ? !!driver?.isAvailable : true;

  const messages = useMemo(
    () => (driverId && passengerId ? threadMessages(data.messages, driverId, passengerId) : []),
    [data.messages, driverId, passengerId],
  );

  const hasUnread = messages.some((m) => m.sender !== side && !m.readAt);
  useEffect(() => {
    if (hasUnread && driverId && passengerId) actions.markConversationRead(driverId, passengerId, side);
  }, [hasUnread, driverId, passengerId, side, actions]);

  const send = useCallback(
    (raw: string) => {
      const body = raw.trim();
      if (!body || !driverId || !passengerId) return;
      actions.sendMessage({ driverId, passengerId, sender: side, body });
      if (!isSample(peerId) || !peerOnline) return;
      const reply = simulatedReply(body, side === 'passenger' ? 'driver' : 'passenger');
      clearTimeout(timer.current);
      setTyping(true);
      timer.current = setTimeout(() => {
        setTyping(false);
        actions.sendMessage({ driverId, passengerId, sender: side === 'passenger' ? 'driver' : 'passenger', body: reply });
      }, replyDelayMs(reply));
    },
    [actions, driverId, passengerId, side, peerId, peerOnline],
  );

  return { side, peer, driver, peerOnline, messages, typing, send, isSamplePeer: isSample(peerId) };
}

export function useConversations() {
  const { data } = useAppData();
  const { side, selfId } = useChatSide();
  return useMemo(() => (selfId ? conversationsFor(data.messages, side, selfId) : []), [data.messages, side, selfId]);
}

export function useUnreadMessages(): number {
  const { data } = useAppData();
  const { side, selfId } = useChatSide();
  return useMemo(() => (selfId ? unreadCount(data.messages, side, selfId) : 0), [data.messages, side, selfId]);
}
