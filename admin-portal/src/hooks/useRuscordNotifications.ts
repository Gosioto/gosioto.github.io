import { useEffect, useRef } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

import { useToast } from '../ui';

import { formatDisplayName } from '../utils/displayName';

export const RUSCORD_UNREAD_EVENT = 'ruscord-unread';

export type RuscordUnreadWsPayload = {
  type: 'ruscord_unread';
  server_id: string;
  channel_id: string;
  unread_count: number;
  preview?: string;
  sender_name?: string | null;
  sender_email?: string;
  chat_id?: string | null;
  chat_topic_id?: string | null;
};

export function dispatchRuscordUnreadToast(payload: RuscordUnreadWsPayload): void {
  window.dispatchEvent(new CustomEvent(RUSCORD_UNREAD_EVENT, { detail: payload }));
}

/** Toast when ruscord_unread arrives over WS. */
export function useRuscordNotifications() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const locationRef = useRef(location.pathname + location.search);
  locationRef.current = location.pathname + location.search;

  useEffect(() => {
    function onUnread(e: Event) {
      const detail = (e as CustomEvent<RuscordUnreadWsPayload>).detail;
      if (!detail?.channel_id || !detail?.server_id) return;

      const onRuscordChannel =
        locationRef.current.includes('/dashboard/ruscord') &&
        locationRef.current.includes(`channel=${detail.channel_id}`);
      if (onRuscordChannel) return;

      const who = formatDisplayName(detail.sender_name, detail.sender_email ?? 'пользователь');
      const preview = detail.preview?.trim();
      const message = preview ? `${who}: ${preview}` : `Новое сообщение от ${who}`;

      showToast('RUscord', message, 'info', () => {
        if (detail.chat_id) {
          const topicQ = detail.chat_topic_id ? `?topic=${detail.chat_topic_id}` : '';
          navigate(`/dashboard/chats/${detail.chat_id}${topicQ}`);
          return;
        }
        navigate(`/dashboard/ruscord?server=${detail.server_id}&channel=${detail.channel_id}`);
      });
    }

    window.addEventListener(RUSCORD_UNREAD_EVENT, onUnread);
    return () => window.removeEventListener(RUSCORD_UNREAD_EVENT, onUnread);
  }, [navigate, showToast]);
}
