export type SignalPayload = {
  type: 'offer' | 'answer' | 'ice' | 'transfer_abort';
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
};

export type IncomingChatP2pSignal = {
  type: 'chat_p2p_signal';
  from_user_id: string;
  chat_id: string;
  transfer_id?: string | null;
  payload: SignalPayload;
};

export function sendChatP2pSignal(
  ws: WebSocket,
  params: {
    chatId: string;
    transferId: string;
    toUserId: string;
    payload: SignalPayload;
  },
): void {
  if (ws.readyState !== WebSocket.OPEN) return;
  ws.send(
    JSON.stringify({
      type: 'chat_p2p_signal',
      chat_id: params.chatId,
      transfer_id: params.transferId,
      to_user_id: params.toUserId,
      payload: params.payload,
    }),
  );
}

export function parseIncomingChatP2pSignal(data: unknown): IncomingChatP2pSignal | null {
  if (!data || typeof data !== 'object') return null;
  const o = data as Record<string, unknown>;
  if (o.type !== 'chat_p2p_signal') return null;
  if (typeof o.from_user_id !== 'string' || typeof o.chat_id !== 'string') return null;
  if (!o.payload || typeof o.payload !== 'object') return null;
  return {
    type: 'chat_p2p_signal',
    from_user_id: o.from_user_id,
    chat_id: o.chat_id,
    transfer_id: o.transfer_id != null ? String(o.transfer_id) : null,
    payload: o.payload as SignalPayload,
  };
}
