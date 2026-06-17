import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { getChats, createChat, getChatAvailableUsers, type Chat, type ChatAvailableUser } from '../api';
import { CHAT_UNREAD_EVENT, useChatUnread } from '../context/ChatUnreadContext';
import { formatDisplayName } from '../utils/displayName';
import { formatFriendDisplayName } from '../utils/friendDisplayName';
import { FRIEND_PRESENCE_EVENT, type FriendPresenceDetail } from '../presenceEvents';
import { usePeerContextMenu } from '../hooks/usePeerContextMenu';
import { useChatListStatusSync } from '../hooks/useChatListStatusSync';
import type { PeerMenuChatContext } from '../utils/peerMenu';
import { isChatNotificationsMuted } from '../utils/chatMute';
import { CHAT_PARTICIPANT_SETTINGS_EVENT, type ChatParticipantSettingsDetail } from '../utils/chatParticipantSettings';
import { sortChatsByActivity } from '../utils/sortChats';
import { getGroupMessageDeliveryStatus } from '../utils/messageStatus';
import Avatar from '../components/Avatar';
import ChatAvatar from '../components/ChatAvatar';
import ChatFriendsPanel from '../components/ChatFriendsPanel';
import ChatUserSearchPanel from '../components/ChatUserSearchPanel';
import FriendNicknameModal from '../components/FriendNicknameModal';
import UserSettingsModal from '../components/UserSettingsModal';
import MessageStatus from '../components/MessageStatus';
import PresenceDot from '../components/PresenceDot';
import PeerContextMenu from '../components/PeerContextMenu';
import { formatChatListTime } from '../utils/formatChatListTime';
import { Badge, Button, UserSearchCombobox, IconUsers, IconPlus, Modal } from '../ui';
import styles from './Chats.module.css';

const POLL_MS = 20_000;

export default function Chats() {
  const navigate = useNavigate();
  const { user: me } = useAuth();
  const { refresh: refreshUnread } = useChatUnread();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [users, setUsers] = useState<ChatAvailableUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [creating, setCreating] = useState(false);
  const [userSearchOpen, setUserSearchOpen] = useState(false);
  const [nicknamePeerId, setNicknamePeerId] = useState<string | null>(null);
  const [userSettingsUser, setUserSettingsUser] = useState<{
    id: string;
    name: string | null;
    email: string;
    chatId?: string | null;
  } | null>(null);

  const loadChats = useCallback(async () => {
    try {
      const list = await getChats();
      setChats(sortChatsByActivity(list));
    } catch {
      setError('Не удалось загрузить чаты');
    }
  }, []);

  useChatListStatusSync({ setChats, meId: me?.id });

  useEffect(() => {
    loadChats().finally(() => setLoading(false));
    const intervalId = window.setInterval(() => void loadChats(), POLL_MS);
    const onUnread = () => void loadChats();
    window.addEventListener(CHAT_UNREAD_EVENT, onUnread);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener(CHAT_UNREAD_EVENT, onUnread);
    };
  }, [loadChats]);

  useEffect(() => {
    if (loading) return;
    const lastChatId = localStorage.getItem('chats:lastChatId');
    if (!lastChatId) return;
    if (!chats.some((c) => c.id === lastChatId)) return;
    navigate(`/dashboard/chats/${lastChatId}`, { replace: true });
  }, [loading, chats, navigate]);

  useEffect(() => {
    function onParticipantSettings(e: Event) {
      const detail = (e as CustomEvent<ChatParticipantSettingsDetail>).detail;
      if (!detail?.chatId) return;
      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id !== detail.chatId) return chat;
          return {
            ...chat,
            participants: chat.participants.map((p) => {
              if (p.user_id !== me?.id) return p;
              return {
                ...p,
                ...(detail.peerBlocked !== undefined ? { peer_blocked: detail.peerBlocked } : {}),
                ...(detail.notificationsMutedUntil !== undefined
                  ? { notifications_muted_until: detail.notificationsMutedUntil }
                  : {}),
              };
            }),
          };
        }),
      );
    }
    window.addEventListener(CHAT_PARTICIPANT_SETTINGS_EVENT, onParticipantSettings);
    return () => window.removeEventListener(CHAT_PARTICIPANT_SETTINGS_EVENT, onParticipantSettings);
  }, [me?.id]);

  useEffect(() => {
    function onPresence(e: Event) {
      const detail = (e as CustomEvent<FriendPresenceDetail>).detail;
      if (!detail?.user_id) return;
      const online = detail.presence === 'online';
      setChats((prev) =>
        prev.map((chat) => {
          if (chat.type !== 'personal') return chat;
          const other = chat.participants.find((p) => p.user_id !== me?.id);
          if (other?.user_id !== detail.user_id) return chat;
          return { ...chat, peer_online: online };
        }),
      );
    }
    window.addEventListener(FRIEND_PRESENCE_EVENT, onPresence);
    return () => window.removeEventListener(FRIEND_PRESENCE_EVENT, onPresence);
  }, [me?.id]);

  useEffect(() => {
    if (newChatOpen) {
      getChatAvailableUsers()
        .then(setUsers)
        .catch(() => {});
    }
  }, [newChatOpen]);

  const getChatContext = useCallback(
    (userId: string): PeerMenuChatContext | null => {
      const chat = chats.find(
        (c) => c.type === 'personal' && c.participants.some((p) => p.user_id === userId),
      );
      if (!chat) return null;
      const myPart = chat.participants.find((p) => p.user_id === me?.id);
      return {
        chatId: chat.id,
        peerBlocked: myPart?.peer_blocked ?? false,
        notificationsMutedUntil: myPart?.notifications_muted_until ?? null,
      };
    },
    [chats, me?.id],
  );

  const peerMenu = usePeerContextMenu({
    meId: me?.id,
    onOpenProfile: (userId) => {
      const chat = chats.find(
        (c) => c.type === 'personal' && c.participants.some((p) => p.user_id === userId),
      );
      const other = chat?.participants.find((p) => p.user_id === userId);
      if (other) {
        setUserSettingsUser({
          id: other.user_id,
          name: other.name,
          email: other.email,
          chatId: chat?.id ?? null,
        });
      }
    },
    onError: (message) => setError(message),
    getChatContext,
    onNicknameUpdated: () => void loadChats(),
    onEditNickname: (userId) => setNicknamePeerId(userId),
    onBlockChange: () => void loadChats(),
    onMuteChange: () => void loadChats(),
  });

  function openNewChat() {
    setNewChatOpen(true);
    setSelectedUserId('');
    setError('');
  }

  function handleCreatePersonal(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUserId) {
      setError('Выберите пользователя');
      return;
    }
    setCreating(true);
    setError('');
    createChat({ type: 'personal', user_id: selectedUserId })
      .then((chat) => {
        setChats((prev) => [chat, ...prev]);
        setNewChatOpen(false);
        void refreshUnread();
        navigate(`/dashboard/chats/${chat.id}`);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Ошибка'))
      .finally(() => setCreating(false));
  }

  function chatDisplayName(chat: Chat): string {
    if (chat.type === 'group' && chat.name) return chat.name;
    const other = chat.participants.find((p) => p.user_id !== me?.id);
    return other
      ? formatFriendDisplayName(other.name, other.email, chat.peer_nickname)
      : 'Чат';
  }

  function otherParticipant(chat: Chat) {
    return chat.participants.find((p) => p.user_id !== me?.id);
  }

  function formatLastMessage(preview: Chat['last_message']): string {
    if (!preview) return '';
    const name = formatDisplayName(preview.sender_name, preview.sender_email);
    const maxMsgLen = 25;
    const msg = preview.content_preview.length > maxMsgLen
      ? preview.content_preview.slice(0, maxMsgLen - 3) + '...'
      : preview.content_preview;
    return `${name}: ${msg}`;
  }

  const comboboxUsers = users.filter((u) => u.id !== me?.id);

  if (loading) return <p style={{ color: 'var(--text-muted)' }}>Загрузка…</p>;

  return (
    <>
      <h1 className={styles.pageTitle}>Чатик*с</h1>
      {error && !newChatOpen && <p className={styles.error}>{error}</p>}

      <div className={styles.toolbar}>
        <div className={styles.splitButton}>
          <Button type="button" className={styles.splitButtonMain} onClick={openNewChat}>
            Личный чат
          </Button>
          <button
            type="button"
            className={styles.splitButtonPlus}
            title="Поиск пользователей"
            aria-label="Поиск пользователей"
            aria-expanded={userSearchOpen}
            onClick={() => setUserSearchOpen(true)}
          >
            <IconPlus size={18} />
          </button>
        </div>
      </div>

      <Modal
        open={userSearchOpen}
        onClose={() => setUserSearchOpen(false)}
        title="Поиск пользователей"
        overflowVisible
      >
        <ChatUserSearchPanel
          meId={me?.id}
          onOpenProfile={(user) => {
            setUserSearchOpen(false);
            setUserSettingsUser({
              id: user.id,
              name: user.name,
              email: user.email,
            });
          }}
          onError={(message) => setError(message)}
        />
      </Modal>

      <div className={styles.chatsPageLayout}>
        <div>
      {chats.length === 0 ? (
        <div className={styles.empty}>
          Нет чатов. Создайте личный чат через поиск пользователя.
        </div>
      ) : (
        <div className={styles.chatList}>
          {chats.map((chat) => {
            const other = otherParticipant(chat);
            const myPart = chat.participants.find((p) => p.user_id === me?.id);
            const notificationsMuted = isChatNotificationsMuted(myPart?.notifications_muted_until);
            const unread = notificationsMuted ? 0 : (chat.unread_count ?? 0);
            const peerOnline = chat.type === 'personal' && chat.peer_online === true;
            const lastMsg = chat.last_message;
            const lastMsgOwn =
              lastMsg && me?.id ? lastMsg.sender_id === me.id : false;
            const showPersonalStatus =
              chat.type === 'personal' && lastMsgOwn && lastMsg;
            const showGroupStatus =
              chat.type === 'group' && lastMsgOwn && lastMsg;
            const peerReadAt =
              chat.type === 'personal' ? other?.last_read_at ?? null : null;
            const groupStatus = showGroupStatus
              ? getGroupMessageDeliveryStatus(lastMsg!.created_at, chat.participants, me?.id ?? '')
              : null;
            return (
              <Link
                key={chat.id}
                to={`/dashboard/chats/${chat.id}`}
                className={`${styles.chatItem} ${unread > 0 ? styles.chatItemUnread : ''}`}
              >
                <div
                  className={styles.chatItemAvatar}
                  onContextMenu={(e) => {
                    if (chat.type === 'personal' && other) peerMenu.open(other.user_id, e);
                  }}
                >
                  {chat.type === 'personal' && other ? (
                    <span className={styles.chatItemAvatarWrap}>
                      <Avatar
                        userId={other.user_id}
                        fallbackLetter={other.name?.[0] || other.email[0]}
                        size={56}
                        className={styles.avatar}
                      />
                      <PresenceDot online={peerOnline} size="sm" />
                    </span>
                  ) : chat.has_avatar ? (
                    <ChatAvatar
                      chatId={chat.id}
                      fallbackLetter={chatDisplayName(chat)[0]}
                      size={56}
                      className={styles.avatar}
                    />
                  ) : (
                    <div className={styles.avatarStack}>
                      {chat.participants
                        .filter((p) => p.user_id !== me?.id)
                        .slice(0, 4)
                        .map((p, i) => (
                          <button
                            key={p.user_id}
                            type="button"
                            className={styles.avatarStackItem}
                            style={{ zIndex: 4 - i }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setUserSettingsUser({ id: p.user_id, name: p.name, email: p.email });
                            }}
                          >
                            <Avatar
                              userId={p.user_id}
                              fallbackLetter={p.name?.[0] || p.email[0]}
                              size={28}
                              className={styles.avatar}
                            />
                          </button>
                        ))}
                      {chat.participants.filter((p) => p.user_id !== me?.id).length === 0 && (
                        <div className={styles.avatarGroup} style={{ width: 44, height: 44, fontSize: '1rem' }} aria-hidden>G</div>
                      )}
                    </div>
                  )}
                </div>
                <div className={styles.chatItemBody}>
                  <div className={styles.chatNameRow}>
                    <div className={styles.chatNameRowMain}>
                      {chat.type === 'group' ? (
                        <IconUsers size={16} className={styles.chatGroupIcon} aria-hidden />
                      ) : null}
                      <span
                        className={styles.chatName}
                        onContextMenu={(e) => {
                          if (chat.type === 'personal' && other) peerMenu.open(other.user_id, e);
                        }}
                      >
                        {chatDisplayName(chat)}
                      </span>
                      <Badge count={unread} />
                    </div>
                    {lastMsg ? (
                      <div className={styles.chatItemMeta}>
                        {showPersonalStatus ? (
                          <MessageStatus
                            createdAt={lastMsg.created_at}
                            peerLastReadAt={peerReadAt}
                            peerDeliveredAt={lastMsg.peer_delivered_at}
                          />
                        ) : null}
                        {showGroupStatus && groupStatus ? (
                          <MessageStatus createdAt={lastMsg.created_at} status={groupStatus} />
                        ) : null}
                        <span className={styles.chatItemTime}>
                          {formatChatListTime(lastMsg.created_at)}
                        </span>
                      </div>
                    ) : null}
                  </div>
                  {chat.type === 'group' && (
                    <div className={styles.chatMeta}>
                      Группа · {chat.participants.length} участн.
                    </div>
                  )}
                  {chat.last_message && (
                    <div className={styles.chatLast} title={formatLastMessage(chat.last_message)}>
                      {formatLastMessage(chat.last_message)}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

        </div>
        <aside className={styles.friendsSidebar}>
          <ChatFriendsPanel />
        </aside>
      </div>

      <Modal
        open={newChatOpen}
        onClose={() => setNewChatOpen(false)}
        title="Новый личный чат"
        overflowVisible
      >
        {error && <p className={styles.error}>{error}</p>}
        <form onSubmit={handleCreatePersonal}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Пользователь</label>
            <UserSearchCombobox
              users={comboboxUsers}
              value={selectedUserId}
              onChange={setSelectedUserId}
              disabled={creating}
              elevated
            />
          </div>
          <div className={styles.modalActions}>
            <Button type="submit" disabled={creating}>
              Создать
            </Button>
            <Button type="button" variant="ghost" onClick={() => setNewChatOpen(false)}>
              Отмена
            </Button>
          </div>
        </form>
      </Modal>

      {peerMenu.target ? (
        <PeerContextMenu
          x={peerMenu.target.x}
          y={peerMenu.target.y}
          items={peerMenu.items}
          onClose={peerMenu.close}
        />
      ) : null}

      {nicknamePeerId ? (
        <FriendNicknameModal
          peerUserId={nicknamePeerId}
          onClose={() => setNicknamePeerId(null)}
          onSaved={() => void loadChats()}
          onError={(message) => setError(message)}
        />
      ) : null}

      {userSettingsUser && (
        <UserSettingsModal
          userId={userSettingsUser.id}
          userName={userSettingsUser.name}
          userEmail={userSettingsUser.email}
          chatId={userSettingsUser.chatId ?? null}
          onClose={() => setUserSettingsUser(null)}
        />
      )}
    </>
  );
}
