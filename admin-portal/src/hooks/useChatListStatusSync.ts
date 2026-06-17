import { useEffect } from 'react';
import { useAuth } from '../auth';
import { wsUrl } from '../apiConfig';
import type { Chat } from '../api';

export const CHAT_DELIVERY_UPDATE_EVENT = 'gosloto:chat_delivery_update';
export const CHAT_READ_RECEIPT_EVENT = 'gosloto:chat_read_receipt';

export type ChatDeliveryUpdateDetail = {
  chat_id: string;
  message_id: string;
  delivered_at: string;
};

export type ChatReadReceiptDetail = {
  chat_id: string;
  user_id: string;
  read_at: string;
};

type Options = {
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  meId: string | undefined;
};

/** Live-обновление статусов доставки/прочтения в списке чатов через WS. */
export function useChatListStatusSync({ setChats, meId }: Options) {
  const { token } = useAuth();

  useEffect(() => {
    if (!token || !meId) return;

    let closed = false;
    let ws: WebSocket | null = null;
    let reconnectTimer: number | null = null;

    function patchFromDelivery(detail: ChatDeliveryUpdateDetail) {
      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id !== detail.chat_id) return chat;
          const last = chat.last_message;
          if (!last || last.id !== detail.message_id) return chat;
          return {
            ...chat,
            last_message: { ...last, peer_delivered_at: detail.delivered_at },
          };
        }),
      );
    }

    function patchFromReadReceipt(detail: ChatReadReceiptDetail) {
      if (detail.user_id === meId) return;
      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id !== detail.chat_id) return chat;
          return {
            ...chat,
            participants: chat.participants.map((p) =>
              p.user_id === detail.user_id ? { ...p, last_read_at: detail.read_at } : p,
            ),
          };
        }),
      );
    }

    function onDeliveryEvent(e: Event) {
      const detail = (e as CustomEvent<ChatDeliveryUpdateDetail>).detail;
      if (detail?.chat_id && detail.message_id) patchFromDelivery(detail);
    }

    function onReadEvent(e: Event) {
      const detail = (e as CustomEvent<ChatReadReceiptDetail>).detail;
      if (detail?.chat_id && detail.user_id) patchFromReadReceipt(detail);
    }

    window.addEventListener(CHAT_DELIVERY_UPDATE_EVENT, onDeliveryEvent);
    window.addEventListener(CHAT_READ_RECEIPT_EVENT, onReadEvent);

    function connect() {
      if (closed) return;
      ws = new WebSocket(wsUrl(`?token=${encodeURIComponent(token!)}`));
      ws.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data as string) as Record<string, unknown>;
          if (data.kind === 'delivery_update' && data.chat_id && data.message_id) {
            const detail: ChatDeliveryUpdateDetail = {
              chat_id: String(data.chat_id),
              message_id: String(data.message_id),
              delivered_at: String(data.delivered_at ?? ''),
            };
            window.dispatchEvent(new CustomEvent(CHAT_DELIVERY_UPDATE_EVENT, { detail }));
            return;
          }
          if (data.kind === 'read_receipt' && data.chat_id && data.user_id) {
            const detail: ChatReadReceiptDetail = {
              chat_id: String(data.chat_id),
              user_id: String(data.user_id),
              read_at: String(data.read_at ?? ''),
            };
            window.dispatchEvent(new CustomEvent(CHAT_READ_RECEIPT_EVENT, { detail }));
          }
        } catch {
          /* ignore */
        }
      };
      ws.onclose = () => {
        ws = null;
        if (!closed) {
          reconnectTimer = window.setTimeout(connect, 3000);
        }
      };
    }

    connect();

    return () => {
      closed = true;
      window.removeEventListener(CHAT_DELIVERY_UPDATE_EVENT, onDeliveryEvent);
      window.removeEventListener(CHAT_READ_RECEIPT_EVENT, onReadEvent);
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      ws?.close();
    };
  }, [token, meId, setChats]);
}
