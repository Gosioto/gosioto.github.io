export type MessageDeliveryStatus = 'sent' | 'delivered' | 'read';

type ReadParticipant = {
  user_id: string;
  last_read_at?: string | null;
};

/** Статус доставки своего сообщения в личном чате (как в Telegram). */
export function getMessageDeliveryStatus(
  createdAt: string,
  peerLastReadAt: string | null | undefined,
  peerDeliveredAt: string | null | undefined,
): MessageDeliveryStatus {
  if (peerLastReadAt) {
    const readAt = new Date(peerLastReadAt).getTime();
    const sentAt = new Date(createdAt).getTime();
    if (!Number.isNaN(readAt) && !Number.isNaN(sentAt) && readAt >= sentAt) {
      return 'read';
    }
  }
  if (peerDeliveredAt) return 'delivered';
  return 'sent';
}

/** Прочитано, если все остальные участники имеют last_read_at >= created_at. */
export function getGroupMessageDeliveryStatus(
  createdAt: string,
  participants: ReadParticipant[],
  meId: string,
): MessageDeliveryStatus {
  const others = participants.filter((p) => p.user_id !== meId);
  if (others.length === 0) return 'sent';
  const sentAt = new Date(createdAt).getTime();
  if (Number.isNaN(sentAt)) return 'sent';
  const allRead = others.every((p) => {
    if (!p.last_read_at) return false;
    const readAt = new Date(p.last_read_at).getTime();
    return !Number.isNaN(readAt) && readAt >= sentAt;
  });
  return allRead ? 'read' : 'sent';
}
