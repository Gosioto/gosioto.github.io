import {
  sendFriendRequest,
  acceptFriendRequest,
  removeFriend,
  markChatBlock,
  markChatUnblock,
  patchChatNotificationsMute,
  patchFriendNickname,
  createChat,
  type FriendStatus,
} from '../api';
import type { ContextMenuItem } from '../ui';

export type PeerMenuChatContext = {
  chatId: string;
  peerBlocked: boolean;
  notificationsMutedUntil: string | null;
};

export type BuildPeerMenuParams = {
  peerUserId: string;
  meId: string | undefined;
  friendStatus: FriendStatus | null;
  chatContext: PeerMenuChatContext | null;
  onOpenProfile: (userId: string) => void;
  onOpenChat?: (userId: string) => void;
  onError: (message: string) => void;
  onFriendStatusChange?: (userId: string) => void;
  onBlockChange?: (blocked: boolean) => void;
  onMuteChange?: (until: string | null) => void;
  onNicknameUpdated?: () => void;
  onEditNickname?: (peerUserId: string) => void;
  includeOpenChat?: boolean;
};

function muteUntilMinutes(minutes: number): string {
  return new Date(Date.now() + minutes * 60 * 1000).toISOString();
}

function muteUntilHours(hours: number): string {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

export function buildPeerMenuItems({
  peerUserId,
  meId,
  friendStatus,
  chatContext,
  onOpenProfile,
  onOpenChat,
  onError,
  onFriendStatusChange,
  onBlockChange,
  onMuteChange,
  onNicknameUpdated,
  onEditNickname,
  includeOpenChat,
}: BuildPeerMenuParams): ContextMenuItem[] {
  const refreshStatus = () => onFriendStatusChange?.(peerUserId);

  const items: ContextMenuItem[] = [
    {
      id: 'profile',
      label: 'Профиль',
      onClick: () => onOpenProfile(peerUserId),
    },
  ];

  if (includeOpenChat && onOpenChat) {
    items.push({
      id: 'open-chat',
      label: 'Открыть чат',
      onClick: () => onOpenChat(peerUserId),
    });
  }

  if (friendStatus?.status === 'none') {
    items.push({
      id: 'add-friend',
      label: 'Добавить в друзья',
      onClick: () => {
        sendFriendRequest(peerUserId)
          .then(refreshStatus)
          .catch((err) => onError(err instanceof Error ? err.message : 'Ошибка'));
      },
    });
  } else if (friendStatus?.status === 'pending_received') {
    items.push({
      id: 'accept-friend',
      label: 'Принять заявку',
      onClick: () => {
        if (!friendStatus.from_user_id || !meId) return;
        acceptFriendRequest(friendStatus.from_user_id, meId)
          .then(refreshStatus)
          .catch((err) => onError(err instanceof Error ? err.message : 'Ошибка'));
      },
    });
  } else if (friendStatus?.status === 'friends') {
    items.push({
      id: 'edit-nickname',
      label: 'Изменить никнейм',
      onClick: () => {
        if (onEditNickname) {
          onEditNickname(peerUserId);
          return;
        }
        const current = window.prompt('Никнейм друга (пусто — сбросить):', '');
        if (current === null) return;
        const nickname = current.trim() || null;
        patchFriendNickname(peerUserId, nickname)
          .then(() => onNicknameUpdated?.())
          .catch((err) => onError(err instanceof Error ? err.message : 'Ошибка'));
      },
    });
    items.push({
      id: 'remove-friend',
      label: 'Удалить из друзей',
      danger: true,
      onClick: () => {
        removeFriend(peerUserId)
          .then(refreshStatus)
          .catch((err) => onError(err instanceof Error ? err.message : 'Ошибка'));
      },
    });
  } else if (friendStatus?.status === 'pending_sent') {
    items.push({
      id: 'friend-pending',
      label: 'Заявка отправлена',
      onClick: () => {},
      disabled: true,
    });
  }

  if (chatContext) {
    const { chatId, peerBlocked, notificationsMutedUntil } = chatContext;
    const notificationsMuted = Boolean(
      notificationsMutedUntil && new Date(notificationsMutedUntil) > new Date(),
    );

    items.push({
      id: 'block',
      label: peerBlocked ? 'Разблокировать' : 'Заблокировать',
      danger: !peerBlocked,
      onClick: () => {
        const action = peerBlocked ? markChatUnblock : markChatBlock;
        action(chatId)
          .then(() => onBlockChange?.(!peerBlocked))
          .catch((err) => onError(err instanceof Error ? err.message : 'Ошибка'));
      },
    });

    items.push({
      id: 'notifications-toggle',
      label: notificationsMuted ? 'Включить уведомления' : 'Отключить уведомления',
      onClick: () => {
        const next = notificationsMuted ? null : muteUntilHours(24 * 365);
        patchChatNotificationsMute(chatId, next)
          .then(() => onMuteChange?.(next))
          .catch((err) => onError(err instanceof Error ? err.message : 'Ошибка'));
      },
    });

    items.push({ id: 'sep-mute', type: 'separator' });
    items.push({ id: 'mute-label', type: 'label', label: 'Отключить уведомления на время' });
    for (const [id, label, minutes] of [
      ['mute-15', '15 минут', 15],
      ['mute-40', '40 минут', 40],
      ['mute-60', '1 час', 60],
      ['mute-day', '1 день', 24 * 60],
    ] as const) {
      items.push({
        id,
        label,
        onClick: () => {
          const until = muteUntilMinutes(minutes);
          patchChatNotificationsMute(chatId, until)
            .then(() => onMuteChange?.(until))
            .catch((err) => onError(err instanceof Error ? err.message : 'Ошибка'));
        },
      });
    }
  }

  return items;
}

export async function ensurePersonalChatId(peerUserId: string): Promise<string> {
  const chat = await createChat({ type: 'personal', user_id: peerUserId });
  return chat.id;
}
