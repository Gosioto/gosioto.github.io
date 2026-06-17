import type { Chat } from '../api';

export function sortChatsByActivity(chats: Chat[]): Chat[] {
  return [...chats].sort((a, b) => {
    const aTs = a.last_message?.created_at ?? a.created_at;
    const bTs = b.last_message?.created_at ?? b.created_at;
    return new Date(bTs).getTime() - new Date(aTs).getTime();
  });
}
