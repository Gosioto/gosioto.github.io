const GROUP_MS = 10 * 60 * 1000;

export type MessageGroupingFields = {
  sender_id: string;
  created_at: string;
};

export type EnrichedMessage<T extends MessageGroupingFields> = {
  msg: T;
  isGrouped: boolean;
  showSender: boolean;
};

export function enrichMessagesForDisplay<T extends MessageGroupingFields>(
  messages: T[],
): EnrichedMessage<T>[] {
  return messages.map((msg, i) => {
    const prev = i > 0 ? messages[i - 1] : null;
    const isGrouped =
      prev !== null &&
      prev.sender_id === msg.sender_id &&
      new Date(msg.created_at).getTime() - new Date(prev.created_at).getTime() <= GROUP_MS;
    return { msg, isGrouped, showSender: !isGrouped };
  });
}
