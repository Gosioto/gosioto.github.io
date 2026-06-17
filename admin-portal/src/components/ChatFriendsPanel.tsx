import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { getFriends, type Friend } from '../api';
import { formatFriendDisplayName } from '../utils/friendDisplayName';
import { FRIEND_PRESENCE_EVENT, type FriendPresenceDetail } from '../presenceEvents';
import { usePeerContextMenu } from '../hooks/usePeerContextMenu';
import type { PeerMenuChatContext } from '../utils/peerMenu';
import { ensurePersonalChatId } from '../utils/peerMenu';
import Avatar from './Avatar';
import PresenceDot from './PresenceDot';
import UserSettingsModal from './UserSettingsModal';
import PeerContextMenu from './PeerContextMenu';
import styles from '../pages/Chats.module.css';

const POLL_MS = 60_000;

function isFriendOnline(f: Friend): boolean {
  return f.online || f.presence === 'online';
}

export default function ChatFriendsPanel() {
  const navigate = useNavigate();
  const { user: me } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [profileUser, setProfileUser] = useState<Friend | null>(null);

  const load = useCallback(async () => {
    try {
      setFriends(await getFriends());
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void load();
    const pollId = window.setInterval(() => void load(), POLL_MS);
    return () => window.clearInterval(pollId);
  }, [load]);

  useEffect(() => {
    function onPresence(e: Event) {
      const detail = (e as CustomEvent<FriendPresenceDetail>).detail;
      if (!detail?.user_id) return;
      const online = detail.presence === 'online';
      setFriends((prev) =>
        prev.map((f) =>
          f.user_id === detail.user_id
            ? {
                ...f,
                presence: online ? 'online' : 'offline',
                online,
              }
            : f,
        ),
      );
    }
    window.addEventListener(FRIEND_PRESENCE_EVENT, onPresence);
    return () => window.removeEventListener(FRIEND_PRESENCE_EVENT, onPresence);
  }, []);

  const getChatContext = useCallback(
    (userId: string): PeerMenuChatContext | null => {
      const friend = friends.find((f) => f.user_id === userId);
      if (!friend?.personal_chat_id) return null;
      return {
        chatId: friend.personal_chat_id,
        peerBlocked: friend.peer_blocked_by_me,
        notificationsMutedUntil: friend.notifications_muted_until ?? null,
      };
    },
    [friends],
  );

  const peerMenu = usePeerContextMenu({
    meId: me?.id,
    onOpenProfile: (userId) => {
      const friend = friends.find((f) => f.user_id === userId);
      if (friend) setProfileUser(friend);
    },
    onError: () => {},
    getChatContext,
    includeOpenChat: true,
    onOpenChat: (userId) => void openFriendChatById(userId),
    onNicknameUpdated: () => void load(),
    onBlockChange: () => void load(),
    onMuteChange: () => void load(),
  });

  async function openFriendChatById(userId: string) {
    const friend = friends.find((f) => f.user_id === userId);
    if (!friend || busyId) return;
    setBusyId(userId);
    try {
      let chatId = friend.personal_chat_id;
      if (!chatId) {
        chatId = await ensurePersonalChatId(userId);
        setFriends((prev) =>
          prev.map((f) => (f.user_id === userId ? { ...f, personal_chat_id: chatId } : f)),
        );
      }
      navigate(`/dashboard/chats/${chatId}`);
    } catch {
      /* ignore */
    } finally {
      setBusyId(null);
    }
  }

  const online = friends.filter((f) => isFriendOnline(f));
  const rest = friends.filter((f) => !isFriendOnline(f));

  function renderList(list: Friend[]) {
    if (list.length === 0) {
      return <div className={styles.friendsSidebarEmpty}>Пусто</div>;
    }
    return list.map((f) => {
      const displayName = formatFriendDisplayName(f.name, f.email, f.nickname);
      return (
        <button
          key={f.user_id}
          type="button"
          className={styles.friendsSidebarItem}
          disabled={busyId === f.user_id}
          onClick={() => setProfileUser(f)}
          onContextMenu={(e) => peerMenu.open(f.user_id, e)}
        >
          <span className={styles.friendsSidebarAvatarWrap}>
            <Avatar userId={f.user_id} fallbackLetter={f.name?.[0] || f.email[0]} size={28} />
            <PresenceDot online={isFriendOnline(f)} size="sm" />
          </span>
          <span className={styles.friendsSidebarName}>{displayName}</span>
        </button>
      );
    });
  }

  return (
    <div className={styles.friendsSidebarPanel}>
      <div className={styles.friendsSidebarTitle}>В сети</div>
      {renderList(online)}
      <div className={styles.friendsSidebarTitle}>Все друзья</div>
      {renderList(rest)}

      {peerMenu.target ? (
        <PeerContextMenu
          x={peerMenu.target.x}
          y={peerMenu.target.y}
          items={peerMenu.items}
          onClose={peerMenu.close}
        />
      ) : null}

      {profileUser ? (
        <UserSettingsModal
          userId={profileUser.user_id}
          userName={profileUser.name}
          userEmail={profileUser.email}
          onClose={() => setProfileUser(null)}
        />
      ) : null}
    </div>
  );
}
