import { useCallback, useEffect, useMemo, useState } from 'react';
import { getFriendStatus, type FriendStatus } from '../api';
import type { ContextMenuItem } from '../ui';
import {
  buildPeerMenuItems,
  type PeerMenuChatContext,
} from '../utils/peerMenu';
import { dispatchChatParticipantSettingsChanged } from '../utils/chatParticipantSettings';

export type PeerMenuTarget = {
  userId: string;
  x: number;
  y: number;
  chatContext?: PeerMenuChatContext | null;
};

type Options = {
  meId: string | undefined;
  onOpenProfile: (userId: string) => void;
  onOpenChat?: (userId: string) => void;
  onError: (message: string) => void;
  onNicknameUpdated?: () => void;
  onEditNickname?: (peerUserId: string) => void;
  includeOpenChat?: boolean;
  getChatContext?: (userId: string) => PeerMenuChatContext | null;
  onBlockChange?: (blocked: boolean) => void;
  onMuteChange?: (until: string | null) => void;
};

export function usePeerContextMenu({
  meId,
  onOpenProfile,
  onOpenChat,
  onError,
  onNicknameUpdated,
  onEditNickname,
  includeOpenChat,
  getChatContext,
  onBlockChange,
  onMuteChange,
}: Options) {
  const [target, setTarget] = useState<PeerMenuTarget | null>(null);
  const [friendStatus, setFriendStatus] = useState<FriendStatus | null>(null);
  const [chatContext, setChatContext] = useState<PeerMenuChatContext | null>(null);

  const close = useCallback(() => setTarget(null), []);

  const open = useCallback(
    (userId: string, e: React.MouseEvent, overrideChatContext?: PeerMenuChatContext | null) => {
      e.preventDefault();
      e.stopPropagation();
      setTarget({ userId, x: e.clientX, y: e.clientY, chatContext: overrideChatContext });
    },
    [],
  );

  useEffect(() => {
    if (!target) {
      setFriendStatus(null);
      setChatContext(null);
      return;
    }
    const ctx =
      target.chatContext !== undefined
        ? target.chatContext
        : getChatContext?.(target.userId) ?? null;
    setChatContext(ctx);
    getFriendStatus(target.userId)
      .then(setFriendStatus)
      .catch(() => setFriendStatus({ status: 'none' }));
  }, [target, getChatContext]);

  const refreshFriendStatus = useCallback((userId: string) => {
    if (target?.userId !== userId) return;
    getFriendStatus(userId)
      .then(setFriendStatus)
      .catch(() => setFriendStatus({ status: 'none' }));
  }, [target?.userId]);

  const items: ContextMenuItem[] = useMemo(() => {
    if (!target) return [];
    return buildPeerMenuItems({
      peerUserId: target.userId,
      meId,
      friendStatus,
      chatContext,
      onOpenProfile,
      onOpenChat,
      onError,
      onFriendStatusChange: refreshFriendStatus,
      onBlockChange: (blocked) => {
        setChatContext((prev) => (prev ? { ...prev, peerBlocked: blocked } : prev));
        if (chatContext?.chatId) {
          dispatchChatParticipantSettingsChanged({ chatId: chatContext.chatId, peerBlocked: blocked });
        }
        onBlockChange?.(blocked);
      },
      onMuteChange: (until) => {
        setChatContext((prev) => (prev ? { ...prev, notificationsMutedUntil: until } : prev));
        if (chatContext?.chatId) {
          dispatchChatParticipantSettingsChanged({ chatId: chatContext.chatId, notificationsMutedUntil: until });
        }
        onMuteChange?.(until);
      },
      onNicknameUpdated,
      onEditNickname,
      includeOpenChat,
    });
  }, [
    target,
    meId,
    friendStatus,
    chatContext,
    onOpenProfile,
    onOpenChat,
    onError,
    refreshFriendStatus,
    onNicknameUpdated,
    onEditNickname,
    includeOpenChat,
    onBlockChange,
    onMuteChange,
  ]);

  return { target, open, close, items };
}
