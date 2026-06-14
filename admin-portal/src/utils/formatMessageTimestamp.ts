const dateLabelFormatter = new Intl.DateTimeFormat('ru', { day: 'numeric', month: 'long' });
const dateLabelWithYearFormatter = new Intl.DateTimeFormat('ru', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
const timeFormatter = new Intl.DateTimeFormat('ru', { hour: '2-digit', minute: '2-digit' });

/** Stable key for grouping messages by calendar day (local timezone). */
export function formatMessageDateKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Human-readable date divider label (ru locale, omit year when current). */
export function formatMessageDateLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  if (d.getFullYear() === now.getFullYear()) {
    return dateLabelFormatter.format(d);
  }
  return dateLabelWithYearFormatter.format(d);
}

/** Message time as HH:mm (no seconds). */
export function formatMessageTime(iso: string): string {
  return timeFormatter.format(new Date(iso));
}

export function groupMessagesByDate<T extends { created_at: string }>(
  messages: T[],
): Array<{ dateKey: string; dateLabel: string; messages: T[] }> {
  const groups: Array<{ dateKey: string; dateLabel: string; messages: T[] }> = [];
  for (const msg of messages) {
    const dateKey = formatMessageDateKey(msg.created_at);
    const last = groups[groups.length - 1];
    if (last && last.dateKey === dateKey) {
      last.messages.push(msg);
    } else {
      groups.push({
        dateKey,
        dateLabel: formatMessageDateLabel(msg.created_at),
        messages: [msg],
      });
    }
  }
  return groups;
}
