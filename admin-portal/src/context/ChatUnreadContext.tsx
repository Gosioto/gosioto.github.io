import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { getChats, type Chat } from '../api';

const POLL_MS = 20_000;
export const CHAT_UNREAD_EVENT = 'chat-unread';

type ChatWithUnread = Chat & { unread_count?: number };

type ChatUnreadContextValue = {
  totalUnread: number;
  refresh: () => Promise<void>;
};

const ChatUnreadContext = createContext<ChatUnreadContextValue | null>(null);

function sumUnread(chats: ChatWithUnread[]): number {
  return chats.reduce((sum, chat) => sum + (chat.unread_count ?? 0), 0);
}

export function ChatUnreadProvider({ children }: { children: ReactNode }) {
  const [totalUnread, setTotalUnread] = useState(0);
  const loadingRef = useRef(false);

  const refresh = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      const chats = (await getChats()) as ChatWithUnread[];
      setTotalUnread(sumUnread(chats));
    } catch {
      // ignore polling errors
    } finally {
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    void refresh();
    const intervalId = window.setInterval(() => void refresh(), POLL_MS);
    const onChatUnread = () => void refresh();
    window.addEventListener(CHAT_UNREAD_EVENT, onChatUnread);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener(CHAT_UNREAD_EVENT, onChatUnread);
    };
  }, [refresh]);

  return (
    <ChatUnreadContext.Provider value={{ totalUnread, refresh }}>
      {children}
    </ChatUnreadContext.Provider>
  );
}

export function useChatUnread(): ChatUnreadContextValue {
  const ctx = useContext(ChatUnreadContext);
  if (!ctx) {
    throw new Error('useChatUnread must be used within ChatUnreadProvider');
  }
  return ctx;
}

export function notifyChatUnreadChanged(): void {
  window.dispatchEvent(new CustomEvent(CHAT_UNREAD_EVENT));
}
