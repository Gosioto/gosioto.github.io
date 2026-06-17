import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  acceptFriendRequest,
  createChat,
  getChatAvailableUsers,
  getFriendStatus,
  sendFriendRequest,
  type ChatAvailableUser,
  type FriendStatus,
} from '../api';
import { formatDisplayName } from '../utils/displayName';
import Avatar from './Avatar';
import AvatarLightbox from './AvatarLightbox';
import { IconMessage, IconUsers } from '../ui';
import styles from '../pages/Chats.module.css';

type Props = {
  meId: string | undefined;
  onOpenProfile: (user: ChatAvailableUser) => void;
  onError: (message: string) => void;
};

export default function ChatUserSearchPanel({ meId, onOpenProfile, onError }: Props) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<ChatAvailableUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [friendStatusMap, setFriendStatusMap] = useState<Record<string, FriendStatus>>({});
  const [creatingChatFor, setCreatingChatFor] = useState<string | null>(null);
  const [addingFriendFor, setAddingFriendFor] = useState<string | null>(null);
  const [avatarLightbox, setAvatarLightbox] = useState<{
    userId: string;
    fallbackLetter: string;
  } | null>(null);
  const loadedFriendStatusRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    setLoading(true);
    getChatAvailableUsers()
      .then(setUsers)
      .catch(() => onError('Не удалось загрузить пользователей'))
      .finally(() => setLoading(false));
  }, [onError]);

  const queryTrimmed = query.trim();
  const filteredUsers = useMemo(() => {
    const q = queryTrimmed.toLowerCase();
    if (!q) return [];
    return users
      .filter((u) => u.id !== meId)
      .filter((u) => formatDisplayName(u.name, u.email).toLowerCase().includes(q))
      .slice(0, 30);
  }, [users, queryTrimmed, meId]);

  useEffect(() => {
    for (const u of filteredUsers) {
      if (loadedFriendStatusRef.current.has(u.id)) continue;
      loadedFriendStatusRef.current.add(u.id);
      getFriendStatus(u.id)
        .then((status) => setFriendStatusMap((prev) => ({ ...prev, [u.id]: status })))
        .catch(() => setFriendStatusMap((prev) => ({ ...prev, [u.id]: { status: 'none' } })));
    }
  }, [filteredUsers]);

  function handleCreateChat(user: ChatAvailableUser, e: React.MouseEvent) {
    e.stopPropagation();
    setCreatingChatFor(user.id);
    createChat({ type: 'personal', user_id: user.id })
      .then((chat) => navigate(`/dashboard/chats/${chat.id}`))
      .catch((err) => onError(err instanceof Error ? err.message : 'Ошибка'))
      .finally(() => setCreatingChatFor(null));
  }

  function handleAddFriend(user: ChatAvailableUser, e: React.MouseEvent) {
    e.stopPropagation();
    const status = friendStatusMap[user.id];
    setAddingFriendFor(user.id);
    const action =
      status?.status === 'pending_received' && status.from_user_id && meId
        ? acceptFriendRequest(status.from_user_id, meId)
        : sendFriendRequest(user.id);
    action
      .then(() =>
        getFriendStatus(user.id).then((next) =>
          setFriendStatusMap((prev) => ({ ...prev, [user.id]: next })),
        ),
      )
      .catch((err) => onError(err instanceof Error ? err.message : 'Ошибка'))
      .finally(() => setAddingFriendFor(null));
  }

  function friendButtonLabel(status: FriendStatus | undefined): string {
    switch (status?.status) {
      case 'friends':
        return 'В друзьях';
      case 'pending_sent':
        return 'Заявка отправлена';
      case 'pending_received':
        return 'Принять заявку';
      default:
        return 'Добавить в друзья';
    }
  }

  function friendButtonDisabled(status: FriendStatus | undefined): boolean {
    if (addingFriendFor !== null) return true;
    return status?.status === 'friends' || status?.status === 'pending_sent';
  }

  return (
    <div className={styles.userSearchPanel}>
      <input
        type="search"
        className={styles.userSearchInput}
        placeholder="Поиск пользователей…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
      />
      {loading ? (
        <p className={styles.muted}>Загрузка…</p>
      ) : !queryTrimmed ? (
        <p className={styles.muted}>Начните вводить имя</p>
      ) : filteredUsers.length === 0 ? (
        <p className={styles.muted}>Пользователи не найдены</p>
      ) : (
        <ul className={styles.userSearchList}>
          {filteredUsers.map((user) => {
            const status = friendStatusMap[user.id];
            const displayName = formatDisplayName(user.name, user.email);
            return (
              <li key={user.id}>
                <div
                  className={styles.userSearchRow}
                  role="button"
                  tabIndex={0}
                  onClick={() => onOpenProfile(user)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') onOpenProfile(user);
                  }}
                >
                  <button
                    type="button"
                    className={styles.userSearchAvatarBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      setAvatarLightbox({
                        userId: user.id,
                        fallbackLetter: user.name?.[0] || user.email[0],
                      });
                    }}
                  >
                    <Avatar
                      userId={user.id}
                      fallbackLetter={user.name?.[0] || user.email[0]}
                      size={44}
                    />
                  </button>
                  <span className={styles.userSearchName}>{displayName}</span>
                  <div className={styles.userSearchActions}>
                    <button
                      type="button"
                      className={styles.userSearchIconBtn}
                      title="Профиль"
                      aria-label="Профиль"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenProfile(user);
                      }}
                    >
                      <IconUsers size={18} />
                    </button>
                    <button
                      type="button"
                      className={styles.userSearchIconBtn}
                      title="Создать личный чат"
                      aria-label="Создать личный чат"
                      disabled={creatingChatFor === user.id}
                      onClick={(e) => handleCreateChat(user, e)}
                    >
                      <IconMessage size={18} />
                    </button>
                    <button
                      type="button"
                      className={styles.userSearchFriendBtn}
                      disabled={friendButtonDisabled(status)}
                      onClick={(e) => handleAddFriend(user, e)}
                    >
                      {addingFriendFor === user.id ? '…' : friendButtonLabel(status)}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {avatarLightbox ? (
        <AvatarLightbox
          userId={avatarLightbox.userId}
          fallbackLetter={avatarLightbox.fallbackLetter}
          onClose={() => setAvatarLightbox(null)}
        />
      ) : null}
    </div>
  );
}
