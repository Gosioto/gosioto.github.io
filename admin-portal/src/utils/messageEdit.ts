import type { Message } from '../api';
import { userIdEq } from '../p2p/transferStatusSync';

/** Можно ли редактировать своё текстовое сообщение в личном чате. */
export function canEditPersonalMessage(msg: Message, meId: string): boolean {
  if (msg.message_type && msg.message_type !== 'text') return false;
  if (msg.topic_id) return false;
  return userIdEq(msg.sender_id, meId);
}

/** Удалить сообщение: личный чат — своё; группа — админ. */
export function canDeleteMessage(
  msg: Message,
  meId: string,
  isPersonal: boolean,
  isAdmin: boolean,
): boolean {
  if (isPersonal) return userIdEq(msg.sender_id, meId);
  return isAdmin;
}

/** Показывать время редактирования и переключатель оригинала (видимая правка). */
export function showMessageEditMeta(msg: Message): boolean {
  return Boolean(msg.edited_at && msg.original_content);
}
