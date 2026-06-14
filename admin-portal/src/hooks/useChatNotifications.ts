import { useEffect, useRef } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

import { useToast } from '../ui';

import { formatDisplayName } from '../utils/displayName';

import { notifyChatUnreadChanged, CHAT_UNREAD_EVENT } from '../context/ChatUnreadContext';

export type ChatUnreadWsPayload = {
  type: 'chat_unread';
  chat_id: string;
  unread_count: number;
  preview?: string;
  topic_id?: string | null;
  chat_type?: string;
  message_type?: string;
  sender_name?: string | null;
  sender_email?: string;
};

export function dispatchChatUnreadToast(payload: ChatUnreadWsPayload): void {
  window.dispatchEvent(new CustomEvent(CHAT_UNREAD_EVENT, { detail: payload }));
}

/** Toast + badge refresh when chat_unread arrives over WS. */
export function useChatNotifications() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const locationRef = useRef(location.pathname);

  locationRef.current = location.pathname;

  useEffect(() => {
    function onUnread(e: Event) {
      const detail = (e as CustomEvent<ChatUnreadWsPayload>).detail;
      if (!detail?.chat_id) {
        void notifyChatUnreadChanged();
        return;
      }
      const inThisChat = locationRef.current.includes(`/dashboard/chats/${detail.chat_id}`);
      if (inThisChat) return;

      const who = formatDisplayName(detail.sender_name, detail.sender_email ?? 'пользователь');
      const isFile = detail.message_type === 'file_offer';
      const title = isFile ? 'Новый файл' : 'Новое сообщение';
      const preview = detail.preview?.trim() || (isFile ? 'файл' : 'сообщение');
      const message = `${who}: ${preview}`;

      const topicQ =
        detail.chat_type === 'group' && detail.topic_id ? `?topic=${detail.topic_id}` : '';

      showToast(title, message, 'info', () => {
        navigate(`/dashboard/chats/${detail.chat_id}${topicQ}`);
      });
      notifyChatUnreadChanged();
    }

    window.addEventListener(CHAT_UNREAD_EVENT, onUnread);
    return () => window.removeEventListener(CHAT_UNREAD_EVENT, onUnread);
  }, [navigate, showToast]);
}
