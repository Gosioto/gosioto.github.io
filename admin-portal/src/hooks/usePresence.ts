import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { wsUrl } from '../apiConfig';
import { getStoredSessionId, getTabKey } from '../sessionKeys';
import { dispatchChatUnreadToast, dispatchChatMessageEditedToast, type ChatUnreadWsPayload, type ChatMessageEditedWsPayload } from './useChatNotifications';
import { dispatchFriendPresence } from '../presenceEvents';

const HEARTBEAT_MS = 30_000;
const RECONNECT_MS = 3_000;

export function usePresence(token: string | null) {
  const location = useLocation();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<number | null>(null);
  const sid = getStoredSessionId();

  useEffect(() => {
    if (!token || !sid) return;

    let closed = false;

    function sendHeartbeat() {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) return;
      ws.send(
        JSON.stringify({
          type: 'presence_heartbeat',
          path: location.pathname,
          visible: document.visibilityState === 'visible',
        })
      );
    }

    function connect() {
      if (closed) return;
      const ws = new WebSocket(wsUrl(`?token=${encodeURIComponent(token!)}`));
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            type: 'subscribe_presence',
            sid,
            tab_key: getTabKey(),
            path: location.pathname,
            visible: document.visibilityState === 'visible',
          })
        );
        sendHeartbeat();
      };

      ws.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data as string);
          if (data.type === 'session_revoked' && data.session_id === sid) {
            window.dispatchEvent(new CustomEvent('gosloto:session_revoked'));
            return;
          }
          if (data.type === 'chat_unread') {
            dispatchChatUnreadToast(data as ChatUnreadWsPayload);
            return;
          }
          if (data.type === 'chat_message_edited') {
            dispatchChatMessageEditedToast(data as ChatMessageEditedWsPayload);
            return;
          }
          if (data.type === 'friend_presence' && typeof data.user_id === 'string' && typeof data.presence === 'string') {
            dispatchFriendPresence({ user_id: data.user_id, presence: data.presence });
          }
        } catch {
          /* ignore */
        }
      };

      ws.onclose = () => {
        wsRef.current = null;
        if (!closed) {
          reconnectRef.current = window.setTimeout(connect, RECONNECT_MS);
        }
      };
    }

    connect();
    const hb = window.setInterval(sendHeartbeat, HEARTBEAT_MS);

    function onVisibility() {
      sendHeartbeat();
    }
    function onPageHide() {
      wsRef.current?.close();
    }
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onPageHide);

    return () => {
      closed = true;
      window.clearInterval(hb);
      if (reconnectRef.current) window.clearTimeout(reconnectRef.current);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onPageHide);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [token, sid, location.pathname]);
}
